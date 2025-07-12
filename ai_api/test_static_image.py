import cv2
import requests
import json
from pathlib import Path

# Configuration
current_dir = Path(__file__).parent
IMAGE_PATH = current_dir / "WIN_20250712_14_23_15_Pro.jpg"
API_URL = "http://localhost:8000/detect_ball"

# Définition des deux bbox cibles
target_bbox_left = {"x1": 50, "y1": 300, "x2": 150, "y2": 400}
target_bbox_right = {"x1": 490, "y1": 300, "x2": 590, "y2": 400}

# Commencer avec la cible gauche
current_target = target_bbox_left

def main():
    global current_target
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
    data = {'target_bbox': json.dumps(current_target)}  # Utiliser la cible courante

    # Appel API
    try:
        response = requests.post(API_URL, files=files, data=data)
        if response.ok:
            result = response.json()
            if "ball_bbox" in result:
                ball_bbox = result["ball_bbox"]
                
                # Dessiner la bbox cible en bleu
                cv2.rectangle(image,
                            (int(current_target["x1"]), int(current_target["y1"])),
                            (int(current_target["x2"]), int(current_target["y2"])),
                            (255, 0, 0), 2)
                cv2.putText(image, "Target", 
                           (int(current_target["x1"]), int(current_target["y1"]) - 10),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)

                # Dessiner la bbox du ballon en vert
                cv2.rectangle(image,
                            (int(ball_bbox["x1"]), int(ball_bbox["y1"])),
                            (int(ball_bbox["x2"]), int(ball_bbox["y2"])),
                            (0, 255, 0), 2)
                cv2.putText(image, "Ball", 
                           (int(ball_bbox["x1"]), int(ball_bbox["y1"]) - 10),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
                
                # Vérifier si le ballon atteint la cible
                if "reaches_target" in result and result["reaches_target"]:
                    print("🎯 Cible atteinte ! Changement de côté...")
                    # Alterner la cible
                    current_target = target_bbox_right if current_target == target_bbox_left else target_bbox_left
                
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