# Ball Detection API

API FastAPI pour la détection de ballon et vérification d'intersection avec une bounding box cible.

## Fonctionnalités

- Détection de ballon dans une image en utilisant YOLOv8
- Vérification si le ballon atteint une bounding box cible (au moins 50% d'intersection)
- API REST avec documentation automatique
- Dockerisée pour un déploiement facile

## Installation

### Avec Docker (recommandé)

```bash
# Construire et lancer l'API
docker-compose up --build

# Ou avec Docker directement
docker build -t ball-detection-api .
docker run -p 8000:8000 -v $(pwd)/../training/runs/train/yolo_ball_tracking/weights:/app/models ball-detection-api
```

### Installation locale

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

## Utilisation

### Endpoints

- `POST /detect_ball` - Détecter un ballon et vérifier l'intersection
- `GET /health` - Vérifier la santé de l'API
- `GET /docs` - Documentation interactive Swagger
- `GET /` - Informations sur l'API

### Exemple d'utilisation

```python
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

print(f"Ballon détecté: {result['ball_detected']}")
print(f"Atteint la cible: {result['reaches_target']}")
print(f"Pourcentage d'intersection: {result['intersection_percentage']:.2f}%")
```

### Réponse

```json
{
  "ball_detected": true,
  "ball_bbox": {
    "x1": 150.5,
    "y1": 120.3,
    "x2": 180.7,
    "y2": 150.8
  },
  "intersection_percentage": 65.4,
  "reaches_target": true
}
```

## Configuration

Le modèle YOLOv8 entraîné doit être placé dans `../training/runs/train/yolo_ball_tracking/weights/best.pt` ou monté comme volume Docker.

## Développement

```bash
# Lancer en mode développement
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

L'API sera disponible sur `http://localhost:8000` avec la documentation sur `http://localhost:8000/docs`.