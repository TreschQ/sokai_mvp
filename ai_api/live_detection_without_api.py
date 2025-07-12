import cv2
import torch
import numpy as np
from pathlib import Path
import time
from ultralytics import YOLO

# Configuration
MODEL_PATH = "models/best.pt"

# Définition des deux bbox cibles (ajustées pour l'effet miroir)
target_bbox_left = {"x1": 490, "y1": 300, "x2": 590, "y2": 400}  # Cible "gauche" (en fait à droite à l'écran)
target_bbox_right = {"x1": 50, "y1": 300, "x2": 150, "y2": 400}  # Cible "droite" (en fait à gauche à l'écran)

class BallTracker:
    """Classe pour le suivi du ballon avec filtre de Kalman"""
    
    def __init__(self):
        # Initialiser le filtre de Kalman
        # État: [x, y, vx, vy] (position et vitesse)
        self.kalman = cv2.KalmanFilter(4, 2, 0)
        
        # Matrice de transition (modèle de mouvement)
        self.kalman.transitionMatrix = np.array([
            [1, 0, 1, 0],  # x = x + vx
            [0, 1, 0, 1],  # y = y + vy
            [0, 0, 1, 0],  # vx = vx
            [0, 0, 0, 1]   # vy = vy
        ], np.float32)
        
        # Matrice de mesure (on observe seulement x et y)
        self.kalman.measurementMatrix = np.array([
            [1, 0, 0, 0],
            [0, 1, 0, 0]
        ], np.float32)
        
        # Matrice de covariance du processus (bruit du modèle)
        self.kalman.processNoiseCov = np.array([
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 10, 0],
            [0, 0, 0, 10]
        ], np.float32) * 0.1
        
        # Matrice de covariance de la mesure (bruit de l'observation)
        self.kalman.measurementNoiseCov = np.array([
            [10, 0],
            [0, 10]
        ], np.float32)
        
        # État initial
        self.kalman.statePre = np.array([[0], [0], [0], [0]], np.float32)
        self.kalman.statePost = np.array([[0], [0], [0], [0]], np.float32)
        
        self.last_measurement = None
        self.is_initialized = False
        
    def update(self, ball_bbox):
        """Met à jour le filtre avec une nouvelle détection"""
        if ball_bbox is None:
            # Pas de détection, prédire seulement
            prediction = self.kalman.predict()
            return {
                "x": int(prediction[0]),
                "y": int(prediction[1]),
                "vx": prediction[2],
                "vy": prediction[3],
                "is_prediction": True
            }
        
        # Calculer le centre du ballon
        center_x = (ball_bbox["x1"] + ball_bbox["x2"]) / 2
        center_y = (ball_bbox["y1"] + ball_bbox["y2"]) / 2
        
        # Mesure actuelle
        measurement = np.array([[center_x], [center_y]], np.float32)
        
        if not self.is_initialized:
            # Première détection, initialiser le filtre
            self.kalman.statePre = np.array([[center_x], [center_y], [0], [0]], np.float32)
            self.kalman.statePost = np.array([[center_x], [center_y], [0], [0]], np.float32)
            self.is_initialized = True
            self.last_measurement = measurement
            return {
                "x": int(center_x),
                "y": int(center_y),
                "vx": 0,
                "vy": 0,
                "is_prediction": False
            }
        
        # Prédire l'état suivant
        prediction = self.kalman.predict()
        
        # Corriger avec la mesure
        correction = self.kalman.correct(measurement)
        
        # Calculer la vitesse (différence avec la mesure précédente)
        if self.last_measurement is not None:
            vx = measurement[0] - self.last_measurement[0]
            vy = measurement[1] - self.last_measurement[1]
        else:
            vx = vy = 0
        
        self.last_measurement = measurement
        
        return {
            "x": int(correction[0]),
            "y": int(correction[1]),
            "vx": vx[0],
            "vy": vy[0],
            "is_prediction": False
        }
    
    def get_predicted_bbox(self, ball_size=50):
        """Retourne la bbox prédite basée sur l'état du filtre"""
        if not self.is_initialized:
            return None
        
        prediction = self.kalman.predict()
        x, y = int(prediction[0]), int(prediction[1])
        
        return {
            "x1": x - ball_size // 2,
            "y1": y - ball_size // 2,
            "x2": x + ball_size // 2,
            "y2": y + ball_size // 2
        }

def load_model():
    """Charge le modèle YOLO"""
    try:
        model = YOLO("./models/best.pt")
        print(f"✅ Modèle chargé depuis: {MODEL_PATH}")
        return model
    except Exception as e:
        print(f"❌ Erreur lors du chargement du modèle: {e}")
        return None

def flip_frame_horizontal(frame):
    """Retourne l'image horizontalement pour corriger l'effet miroir"""
    return cv2.flip(frame, 1)

def adjust_bbox_for_mirror(bbox, frame_width):
    """Ajuste les coordonnées de la bbox pour l'effet miroir"""
    return {
        "x1": frame_width - bbox["x2"],
        "y1": bbox["y1"],
        "x2": frame_width - bbox["x1"],
        "y2": bbox["y2"]
    }

def detect_ball(model, frame):
    """Détecte le ballon dans l'image avec le modèle YOLO"""
    try:
        # Inférence avec le modèle
        results = model(frame)
        
        # Extraire les détections (nouvelle API ultralytics)
        if len(results) > 0:
            result = results[0]  # Premier résultat
            boxes = result.boxes
            
            if boxes is not None and len(boxes) > 0:
                # Chercher la détection avec la plus haute confiance
                best_detection = None
                best_confidence = 0
                
                for box in boxes:
                    # Extraire les coordonnées et la confiance
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    confidence = box.conf[0].cpu().numpy()
                    class_id = box.cls[0].cpu().numpy()
                    
                    # Vérifier que c'est bien un ballon (classe 0) et confiance suffisante
                    if int(class_id) == 0 and confidence > 0.5:
                        if confidence > best_confidence:
                            best_confidence = confidence
                            best_detection = {
                                "x1": int(x1),
                                "y1": int(y1),
                                "x2": int(x2),
                                "y2": int(y2),
                                "confidence": float(confidence)
                            }
                
                return best_detection, best_confidence
        
        return None, 0
        
    except Exception as e:
        print(f"⚠️ Erreur lors de la détection: {e}")
        return None, 0

def check_target_reached(ball_bbox, target_bbox, threshold=0.7):
    """Vérifie si le ballon atteint la cible (dès qu'il touche à peine)"""
    if ball_bbox is None:
        return False
    
    # Vérifier si les bbox se chevauchent (même légèrement)
    # Le ballon touche la cible si :
    # - Le bord gauche du ballon est à gauche du bord droit de la cible ET
    # - Le bord droit du ballon est à droite du bord gauche de la cible ET
    # - Le bord haut du ballon est au-dessus du bord bas de la cible ET
    # - Le bord bas du ballon est en-dessous du bord haut de la cible
    
    overlap_x = (ball_bbox["x1"] < target_bbox["x2"] and 
                ball_bbox["x2"] > target_bbox["x1"])
    
    overlap_y = (ball_bbox["y1"] < target_bbox["y2"] and 
                ball_bbox["y2"] > target_bbox["y1"])
    
    # Retourner true dès qu'il y a un chevauchement (même minime)
    return overlap_x and overlap_y

def draw_target_bbox(frame, target_bbox, color=(0, 0, 255), thickness=3):
    """Dessine la bbox cible sur l'image d'affichage"""
    # Dessiner la bbox cible avec couleur rouge vif
    cv2.rectangle(frame,
                 (int(target_bbox["x1"]), int(target_bbox["y1"])),
                 (int(target_bbox["x2"]), int(target_bbox["y2"])),
                 color, thickness)
    
    # Ajouter le texte "TARGET"
    cv2.putText(frame, "TARGET", 
                (int(target_bbox["x1"]), int(target_bbox["y1"]) - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
    
    # Dessiner un petit cercle au centre de la cible pour vérifier
    center_x = (target_bbox["x1"] + target_bbox["x2"]) // 2
    center_y = (target_bbox["y1"] + target_bbox["y2"]) // 2
    cv2.circle(frame, (center_x, center_y), 5, (0, 255, 255), -1)  # Jaune

def draw_ball_bbox(frame, ball_bbox, color=(0, 255, 0), thickness=3):
    """Dessine la bbox du ballon sur l'image d'affichage"""
    cv2.rectangle(frame,
                 (int(ball_bbox["x1"]), int(ball_bbox["y1"])),
                 (int(ball_bbox["x2"]), int(ball_bbox["y2"])),
                 color, thickness)
    
    # Ajouter le texte avec la confiance (gérer le cas où confidence n'existe pas)
    confidence = ball_bbox.get('confidence', 0.0)
    confidence_text = f"BALL ({confidence:.2f})"
    cv2.putText(frame, confidence_text, 
               (int(ball_bbox["x1"]), int(ball_bbox["y1"]) - 10),
               cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

def draw_kalman_prediction(frame, tracker_state, color=(255, 0, 255), thickness=2):
    """Dessine la prédiction du filtre de Kalman"""
    if tracker_state is None:
        return
    
    x, y = tracker_state["x"], tracker_state["y"]
    vx, vy = tracker_state["vx"], tracker_state["vy"]
    
    # Dessiner le point prédit
    cv2.circle(frame, (x, y), 8, color, -1)
    
    # Dessiner le vecteur de vitesse
    if abs(vx) > 0.1 or abs(vy) > 0.1:
        end_x = int(x + vx * 2)
        end_y = int(y + vy * 2)
        cv2.arrowedLine(frame, (x, y), (end_x, end_y), color, thickness, tipLength=0.3)
    
    # Texte pour indiquer si c'est une prédiction
    if tracker_state.get("is_prediction", False):
        cv2.putText(frame, "KALMAN PRED", (x + 10, y - 10),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)

def main():
    # Charger le modèle
    print("🔄 Chargement du modèle YOLO...")
    model = load_model()
    if model is None:
        print("❌ Impossible de charger le modèle")
        return

    # Initialiser le tracker
    tracker = BallTracker()

    # Initialisation de la caméra
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Impossible d'ouvrir la caméra")
        return

    # Optimisation de la capture vidéo
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 30)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # Buffer minimal

    frame_count = 0
    current_target = target_bbox_left  # Commencer avec la cible gauche
    last_ball_position = None
    last_detection_time = 0
    detection_interval = 0.1  # 100ms entre les détections YOLO
    tracker_state = None

    print("📷 Appuyez sur 'q' pour quitter")
    print("🪞 Effet miroir corrigé - Les cibles sont ajustées")
    print("⚡ Détection YOLO toutes les 100ms avec filtre de Kalman")
    print("🎯 Filtre de Kalman pour le suivi fluide du ballon")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("❌ Échec de la capture")
            break

        current_time = time.time()
        
        # Afficher les infos de l'image
        h, w, c = frame.shape
        print(f"📐 Frame size: {w}x{h}")
        
        # Corriger l'effet miroir pour l'affichage
        display_frame = flip_frame_horizontal(frame)
        
        # Créer une copie propre de l'image pour la détection (sans bbox, sans miroir)
        detection_frame = frame.copy()  # Image originale pour la détection
        
        # Ajuster les coordonnées de la cible pour la détection (sans miroir)
        detection_target_bbox = adjust_bbox_for_mirror(current_target, w)
        
        # Détection YOLO avec intervalle de temps (100ms)
        if current_time - last_detection_time >= detection_interval:
            start_time = time.time()
            
            # Détection directe avec le modèle
            ball_bbox, confidence = detect_ball(model, detection_frame)
            
            detection_time = (time.time() - start_time) * 1000
            print(f"⚡ YOLO Detection: {detection_time:.1f}ms | Confiance: {confidence:.2f}")
            
            if ball_bbox is not None:
                # Ajuster les coordonnées du ballon pour l'affichage (avec miroir)
                display_ball_bbox = adjust_bbox_for_mirror(ball_bbox, w)
                last_ball_position = display_ball_bbox
                print(f"⚽ Ball detected at: {ball_bbox} -> Display: {display_ball_bbox}")
                
                # Vérifier si le ballon atteint la cible
                if check_target_reached(ball_bbox, detection_target_bbox):
                    print("🎯 Cible atteinte ! Changement de côté...")
                    # Alterner la cible
                    current_target = target_bbox_right if current_target == target_bbox_left else target_bbox_left
            else:
                print("❌ No ball detected by YOLO")
            
            last_detection_time = current_time
        
        # Mettre à jour le tracker de Kalman à chaque frame
        tracker_state = tracker.update(last_ball_position)
        
        # Dessiner les éléments visuels sur l'image d'affichage (avec miroir)
        print(f"🎯 Drawing target bbox: {current_target}")
        draw_target_bbox(display_frame, current_target)
        
        # Dessiner la prédiction du filtre de Kalman
        if tracker_state:
            print(f"🎯 Kalman state: x={tracker_state['x']}, y={tracker_state['y']}, vx={float(tracker_state['vx']):.1f}, vy={float(tracker_state['vy']):.1f}")
            draw_kalman_prediction(display_frame, tracker_state)

        # Afficher la bbox du ballon si disponible (détection YOLO)
        if last_ball_position:
            print(f"🎨 Drawing ball bbox: {last_ball_position}")
            draw_ball_bbox(display_frame, last_ball_position)

        # Afficher les statistiques en temps réel
        fps_text = f"FPS: {1.0 / (current_time - last_detection_time + 0.001):.1f}"
        cv2.putText(display_frame, fps_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        # Afficher l'intervalle de détection
        interval_text = f"YOLO: {detection_interval*1000:.0f}ms"
        cv2.putText(display_frame, interval_text, (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

        cv2.imshow("Ball Detection (YOLO + Kalman)", display_frame)
        frame_count += 1

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    print("👋 Détection terminée")

if __name__ == "__main__":
    main() 