import cv2
import requests
import json
from pathlib import Path

# Configuration
API_URL = "http://localhost:8000/detect_ball"

# Définition de la zone cible (bbox)
target_bbox = {
    "x1": 50,
    "y1": 300,
    "x2": 150,
    "y2": 400
}

def main():
    # Initialisation de la caméra
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Impossible d'ouvrir la caméra")
        return

    frame_count = 0
    last_ball_position = None

    print("📷 Appuyez sur 'q' pour quitter")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("❌ Échec de la capture")
            break

        # Détection toutes les 5 frames pour de meilleures performances
        if frame_count % 5 == 0:
            # Préparation de l'image pour l'API
            _, img_encoded = cv2.imencode('.jpg', frame)
            files = {'file': ("frame.jpg", img_encoded.tobytes(), 'image/jpeg')}
            # Ajout du target_bbox dans les données
            data = {
                'target_bbox': json.dumps(target_bbox)  # Conversion en JSON string
            }
            
            try:
                response = requests.post(API_URL, files=files, data=data, timeout=1.0)  # Augmenté le timeout
                if response.ok:
                    result = response.json()
                    print(f"Réponse API: {result}")  # Debug
                    if "ball_bbox" in result:
                        last_ball_position = result["ball_bbox"]
                        print(f"🎾 Ballon détecté! Position: {last_ball_position}")
                    else:
                        print("❌ Pas de ball_bbox dans la réponse")
                else:
                    print(f"❌ Erreur API: {response.status_code} - {response.text}")
            except Exception as e:
                print(f"⚠️ Erreur API: {str(e)}")

        # Affichage de la bbox si un ballon est détecté
        if last_ball_position:
            try:
                cv2.rectangle(frame,
                            (int(last_ball_position["x1"]), int(last_ball_position["y1"])),
                            (int(last_ball_position["x2"]), int(last_ball_position["y2"])),
                            (0, 255, 0), 2)
                cv2.putText(frame, "Ball", 
                           (int(last_ball_position["x1"]), int(last_ball_position["y1"]) - 10),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
            except KeyError as e:
                print(f"❌ Erreur format bbox: {e}")

        # Affichage du flux vidéo
        cv2.imshow("Détection en direct", frame)
        frame_count += 1

        # Quitter avec 'q'
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
