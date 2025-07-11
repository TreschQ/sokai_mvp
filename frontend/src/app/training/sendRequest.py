import requests

# Préparer l'image et la bounding box cible
files = {"file": open("image.jpg", "rb")}
data = {
    "target_bbox": {
        "x1": 100,
        "y1": 100,
        "x2": 200,
        "y2": 200
    }
}

# Faire la requête
response = requests.post("http://localhost:8000/detect_ball", files=files, json=data)
result = response.json()

# TODO : écrire la réponse dans un json