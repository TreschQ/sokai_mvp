#!/usr/bin/env python3
"""
Script pour convertir le modèle YOLOv8 vers ONNX pour utilisation dans le navigateur
"""

import os
from ultralytics import YOLO
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def convert_yolo_to_onnx():
    """Convertit le modèle YOLOv8 vers ONNX"""
    
    model_path = "./models/best.pt"
    output_dir = "./models/"
    
    # Vérifier que le modèle existe
    if not os.path.exists(model_path):
        logger.error(f"Modèle non trouvé: {model_path}")
        return False
    
    try:
        logger.info(f"Chargement du modèle YOLOv8: {model_path}")
        model = YOLO(model_path)
        
        logger.info("Conversion vers ONNX...")
        # Export vers ONNX avec opset 11 pour compatibilité maximale
        model.export(
            format="onnx",
            opset=11,
            simplify=True,  # Simplifie le graphe pour de meilleures performances
            dynamic=False,  # Taille fixe pour de meilleures performances web
            imgsz=640       # Taille d'image standard
        )
        
        # Le fichier ONNX sera créé à côté du .pt
        onnx_path = model_path.replace('.pt', '.onnx')
        
        if os.path.exists(onnx_path):
            logger.info(f"✅ Conversion réussie: {onnx_path}")
            
            # Afficher la taille du fichier
            size_mb = os.path.getsize(onnx_path) / (1024 * 1024)
            logger.info(f"Taille du modèle ONNX: {size_mb:.2f} MB")
            
            return True
        else:
            logger.error("❌ Fichier ONNX non créé")
            return False
            
    except Exception as e:
        logger.error(f"❌ Erreur lors de la conversion: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Conversion YOLOv8 → ONNX pour utilisation browser")
    print("=" * 50)
    
    success = convert_yolo_to_onnx()
    
    if success:
        print("\n✅ Conversion terminée avec succès!")
        print("📁 Le fichier ONNX est disponible dans ./models/")
        print("🌐 Prêt pour l'intégration browser avec ONNX.js")
    else:
        print("\n❌ Échec de la conversion")
        print("🔍 Vérifiez les logs ci-dessus pour plus de détails")