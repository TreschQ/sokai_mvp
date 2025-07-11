from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Tuple
import numpy as np
from PIL import Image
import io
from ultralytics import YOLO
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Ball Detection API", version="1.0.0")

# Modèle YOLO chargé au démarrage
model = None

class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float

class DetectionRequest(BaseModel):
    target_bbox: BoundingBox

class DetectionResponse(BaseModel):
    ball_detected: bool
    ball_bbox: BoundingBox = None
    intersection_percentage: float = 0.0
    reaches_target: bool = False

@app.on_event("startup")
async def startup_event():
    """Charger le modèle YOLO au démarrage de l'API"""
    global model
    try:
        # Charger le modèle entraîné
        model = YOLO("/app/models/best.pt")
        logger.info("Modèle YOLO chargé avec succès")
    except Exception as e:
        logger.error(f"Erreur lors du chargement du modèle: {e}")
        raise

def calculate_intersection_percentage(bbox1: BoundingBox, bbox2: BoundingBox) -> float:
    """
    Calcule le pourcentage d'intersection entre deux bounding boxes
    
    Args:
        bbox1: Première bounding box
        bbox2: Deuxième bounding box
        
    Returns:
        Pourcentage d'intersection (0-100)
    """
    # Calculer l'intersection
    x1 = max(bbox1.x1, bbox2.x1)
    y1 = max(bbox1.y1, bbox2.y1)
    x2 = min(bbox1.x2, bbox2.x2)
    y2 = min(bbox1.y2, bbox2.y2)
    
    # Vérifier s'il y a intersection
    if x2 <= x1 or y2 <= y1:
        return 0.0
    
    # Calculer les aires
    intersection_area = (x2 - x1) * (y2 - y1)
    bbox1_area = (bbox1.x2 - bbox1.x1) * (bbox1.y2 - bbox1.y1)
    bbox2_area = (bbox2.x2 - bbox2.x1) * (bbox2.y2 - bbox2.y1)
    
    # Calculer l'union
    union_area = bbox1_area + bbox2_area - intersection_area
    
    # Retourner le pourcentage d'intersection par rapport à l'union (IoU * 100)
    if union_area == 0:
        return 0.0
    
    return (intersection_area / union_area) * 100

def detect_ball(image: Image.Image) -> Tuple[bool, BoundingBox]:
    """
    Détecter un ballon dans l'image
    
    Args:
        image: Image PIL
        
    Returns:
        Tuple (ball_detected, ball_bbox)
    """
    try:
        # Prédiction avec YOLO
        results = model(image)
        
        # Parcourir les résultats
        for result in results:
            boxes = result.boxes
            if boxes is not None and len(boxes) > 0:
                # Prendre la détection avec la plus haute confiance
                best_box = boxes[0]  # YOLO trie par confiance
                
                # Extraire les coordonnées
                x1, y1, x2, y2 = best_box.xyxy[0].cpu().numpy()
                
                ball_bbox = BoundingBox(
                    x1=float(x1),
                    y1=float(y1),
                    x2=float(x2),
                    y2=float(y2)
                )
                
                return True, ball_bbox
        
        return False, None
        
    except Exception as e:
        logger.error(f"Erreur lors de la détection: {e}")
        return False, None

@app.post("/detect_ball", response_model=DetectionResponse)
async def detect_ball_endpoint(
    file: UploadFile = File(...),
    target_bbox: str = Form(...)
):
    """
    Endpoint pour détecter un ballon et vérifier s'il atteint la bounding box cible
    
    Args:
        file: Image uploadée
        target_bbox: Bounding box cible à vérifier
        
    Returns:
        Résultat de la détection et de la vérification
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Le fichier doit être une image")
    
    # Parser le JSON string en BoundingBox
    try:
        import json
        bbox_data = json.loads(target_bbox)
        target_bbox_obj = BoundingBox(**bbox_data)
    except (json.JSONDecodeError, TypeError, ValueError) as e:
        raise HTTPException(status_code=400, detail=f"Format target_bbox invalide: {str(e)}")
    
    try:
        # Lire l'image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        
        # Détecter le ballon
        ball_detected, ball_bbox = detect_ball(image)
        
        if not ball_detected:
            return DetectionResponse(
                ball_detected=False,
                reaches_target=False
            )
        
        # Calculer l'intersection
        intersection_percentage = calculate_intersection_percentage(ball_bbox, target_bbox_obj)
        
        # Vérifier si le ballon atteint la cible (au moins 50%)
        reaches_target = intersection_percentage >= 50.0
        
        return DetectionResponse(
            ball_detected=True,
            ball_bbox=ball_bbox,
            intersection_percentage=intersection_percentage,
            reaches_target=reaches_target
        )
        
    except Exception as e:
        logger.error(f"Erreur lors du traitement: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")

@app.get("/health")
async def health_check():
    """Endpoint de santé pour vérifier que l'API fonctionne"""
    return {"status": "healthy", "model_loaded": model is not None}

@app.get("/")
async def root():
    """Endpoint racine avec informations sur l'API"""
    return {
        "message": "Ball Detection API",
        "version": "1.0.0",
        "endpoints": {
            "/detect_ball": "POST - Détecter un ballon et vérifier l'intersection",
            "/health": "GET - Vérifier la santé de l'API",
            "/docs": "GET - Documentation interactive"
        }
    }