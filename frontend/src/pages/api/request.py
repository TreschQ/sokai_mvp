import requests
import json

# Préparer l'image et la bounding box cible
files = {"file": open("/root/sokai_mvp/src/pages/api/capture.jpg", "rb")}

with open("/root/sokai_mvp/src/pages/api/box.json", "r") as f:
    data = json.load(f)

# Faire la requête
response = requests.post("http://localhost:8000/detect_ball", files=files, json=data)
result = response.json()

print(result)