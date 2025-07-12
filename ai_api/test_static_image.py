import cv2
import requests
import json
from pathlib import Path

# Configuration
current_dir = Path(__file__).parent
IMAGE_PATH = current_dir / "WIN_20250712_14_23_15_Pro.jpg"
API_URL = "http://localhost:8000/detect_ball"

# Target bbox (vous pouvez ajuster selon vos besoins)
target_bbox = {"x1": 50, "y1": 300, "x2": 150, "y2": 400}

def main():
    # Lecture de l'image
    if not IMAGE_PATH.exists():
        print(f"❌ Image non trouvée: {IMAGE_PATH}")
        return
        
    image = cv2.imread(str(IMAGE_PATH))
    if image is None:
        print("❌ Impossible de charger l'image")
        return

    print(f"✅ Image chargée depuis: {IMAGE_PATH}")
    
    # Préparation de l'image pour l'API
    _, img_encoded = cv2.imencode('.jpg', image)
    files = {'file': ("image.jpg", img_encoded.tobytes(), 'image/jpeg')}
    data = {'target_bbox': json.dumps(target_bbox)}

    # Appel API
    try:
        response = requests.post(API_URL, files=files, data=data)
        if response.ok:
            result = response.json()
            if "ball_bbox" in result:
                # Dessin de la bbox du ballon
                ball_bbox = result["ball_bbox"]
                cv2.rectangle(image,
                            (int(ball_bbox["x1"]), int(ball_bbox["y1"])),
                            (int(ball_bbox["x2"]), int(ball_bbox["y2"])),
                            (0, 255, 0), 2)
                cv2.putText(image, "Ball", 
                           (int(ball_bbox["x1"]), int(ball_bbox["y1"]) - 10),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
                
                print("✅ Ballon détecté!")
            else:
                print("❌ Aucun ballon détecté")
                
            # Affichage de l'image
            cv2.imshow("Détection", image)
            cv2.waitKey(0)
            cv2.destroyAllWindows()
        else:
            print(f"❌ Erreur API: {response.status_code}")
    except Exception as e:
        print(f"❌ Erreur: {str(e)}")

if __name__ == "__main__":
    main()