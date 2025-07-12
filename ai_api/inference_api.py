import cv2
import requests
import json
import time

# === Configuration de l'API ===
API_URL = "http://localhost:8000/detect_ball"

# === Bbox en bas à gauche et à droite ===
bbox_bas_gauche = {"x1": 50, "y1": 300, "x2": 150, "y2": 400}
bbox_bas_droite = {"x1": 490, "y1": 300, "x2": 590, "y2": 400}

# Démarre avec la cible à gauche
current_target = bbox_bas_gauche

def main():
    global current_target
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("❌ Impossible d'ouvrir la webcam")
        return

    print("📷 Appuyez sur 's' pour capturer une image, 'q' pour quitter")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("❌ Échec de la capture")
            break

        height, width, _ = frame.shape

        # Afficher la bbox cible actuelle
        cv2.rectangle(frame,
                      (int(current_target["x1"]), int(current_target["y1"])),
                      (int(current_target["x2"]), int(current_target["y2"])),
                      (255, 0, 0), 2)
        cv2.putText(frame, "Target", (int(current_target["x1"]), int(current_target["y1"] - 10)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)

        cv2.imshow("Webcam - Appuyez sur 's' pour capturer", frame)

        key = cv2.waitKey(1)
        if key == ord('q'):
            break
        elif key == ord('s'):
            # Capture l'image et envoie à l'API
            _, img_encoded = cv2.imencode('.jpg', frame)
            files = {'file': ("frame.jpg", img_encoded.tobytes(), 'image/jpeg')}
            data = {'target_bbox': json.dumps(current_target)}

            start_time = time.time()
            response = requests.post(API_URL, files=files, data=data)
            latency = (time.time() - start_time) * 1000  # en ms

            if response.ok:
                result = response.json()
                print(f"✅ Détection: {result}")
                print(f"⏱️ Latence: {latency:.2f} ms")

                if result.get("reaches_target"):
                    print("🥅 Cible atteinte ! 🎯 Changement de côté...")
                    # Alterner la cible
                    if current_target == bbox_bas_gauche:
                        current_target = bbox_bas_droite
                    else:
                        current_target = bbox_bas_gauche
            else:
                print(f"❌ Erreur API: {response.status_code} - {response.text}")

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
