import cv2
import requests
import json
from pathlib import Path

# Configuration
API_URL = "http://localhost:8000/detect_ball"

# Définition des deux bbox cibles
target_bbox_left = {"x1": 50, "y1": 300, "x2": 150, "y2": 400}
target_bbox_right = {"x1": 490, "y1": 300, "x2": 590, "y2": 400}

def main():
    # Initialisation
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Impossible d'ouvrir la caméra")
        return

    frame_count = 0
    current_target = target_bbox_left  # Commencer avec la cible gauche
    last_ball_position = None

    print("📷 Appuyez sur 'q' pour quitter")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("❌ Échec de la capture")
            break

        # Afficher les infos de l'image
        h, w, c = frame.shape
        print(f"📐 Frame size: {w}x{h}")
        
        # Dessiner la bbox cible actuelle avec couleur rouge vif
        print(f"🎯 Drawing target bbox: {current_target}")
        cv2.rectangle(frame,
                     (int(current_target["x1"]), int(current_target["y1"])),
                     (int(current_target["x2"]), int(current_target["y2"])),
                     (0, 0, 255), 3)  # Rouge en BGR, épaisseur 3
        cv2.putText(frame, "TARGET", 
                    (int(current_target["x1"]), int(current_target["y1"]) - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
        
        # Dessiner un petit cercle au centre de la cible pour vérifier
        center_x = (current_target["x1"] + current_target["x2"]) // 2
        center_y = (current_target["y1"] + current_target["y2"]) // 2
        cv2.circle(frame, (center_x, center_y), 5, (0, 255, 255), -1)  # Jaune
        
        # Test simple : dessiner une ligne diagonale pour vérifier que le dessin fonctionne
        cv2.line(frame, (0, 0), (100, 100), (255, 255, 255), 2)  # Ligne blanche

        # Détection toutes les 5 frames
        if frame_count % 5 == 0:
            _, img_encoded = cv2.imencode('.jpg', frame)
            files = {'file': ("frame.jpg", img_encoded.tobytes(), 'image/jpeg')}
            data = {'target_bbox': json.dumps(current_target)}

            try:
                response = requests.post(API_URL, files=files, data=data, timeout=1.0)
                print(f"📡 API Response status: {response.status_code}")
                if response.ok:
                    result = response.json()
                    print(f"🔍 API Result: {result}")
                    if result.get("ball_detected", False) and "ball_bbox" in result:
                        last_ball_position = result["ball_bbox"]
                        print(f"⚽ Ball detected at: {last_ball_position}")
                        # Vérifier si le ballon atteint la cible
                        if result.get("reaches_target", False):
                            print("🎯 Cible atteinte ! Changement de côté...")
                            # Alterner la cible
                            current_target = target_bbox_right if current_target == target_bbox_left else target_bbox_left
                    else:
                        last_ball_position = None
                        print("❌ No ball detected or invalid response")
                else:
                    print(f"❌ API Error: {response.status_code} - {response.text}")
            except Exception as e:
                print(f"⚠️ Erreur API: {str(e)}")

        # Afficher la bbox du ballon si disponible
        if last_ball_position:
            print(f"🎨 Drawing ball bbox: {last_ball_position}")
            cv2.rectangle(frame,
                         (int(last_ball_position["x1"]), int(last_ball_position["y1"])),
                         (int(last_ball_position["x2"]), int(last_ball_position["y2"])),
                         (0, 255, 0), 3)  # Vert en BGR, épaisseur 3
            cv2.putText(frame, "BALL", 
                       (int(last_ball_position["x1"]), int(last_ball_position["y1"]) - 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

        cv2.imshow("Ball Detection", frame)
        frame_count += 1

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
