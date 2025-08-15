/**
 * Service pour l'inférence AI locale dans le navigateur avec ONNX Runtime
 */

import * as ort from 'onnxruntime-web';

export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface DetectionResult {
  ball_detected: boolean;
  ball_bbox?: BoundingBox;
  intersection_percentage: number;
  reaches_target: boolean;
}

class LocalBallDetection {
  private session: ort.InferenceSession | null = null;
  private isLoading = false;
  private modelLoaded = false;

  constructor() {
    // Configuration ONNX pour utiliser WebGL si disponible
    ort.env.wasm.wasmPaths = '/';
  }

  /**
   * Charge le modèle ONNX
   */
  async loadModel(): Promise<void> {
    if (this.modelLoaded || this.isLoading) {
      return;
    }

    this.isLoading = true;
    
    try {
      console.log('🔄 Chargement du modèle ONNX...');
      
      // Charger le modèle ONNX
      this.session = await ort.InferenceSession.create('/models/best.onnx', {
        executionProviders: ['webgl', 'wasm'], // Priorité WebGL puis WebAssembly
        graphOptimizationLevel: 'all',
      });
      
      this.modelLoaded = true;
      console.log('✅ Modèle ONNX chargé avec succès');
      console.log('📊 Providers disponibles:', this.session.inputNames, this.session.outputNames);
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement du modèle:', error);
      throw new Error(`Impossible de charger le modèle: ${error}`);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Préprocesse une image pour l'inférence YOLO
   */
  private preprocessImage(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): ort.Tensor {
    // Créer un canvas pour redimensionner l'image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Taille d'entrée YOLO (640x640)
    const modelSize = 640;
    canvas.width = modelSize;
    canvas.height = modelSize;
    
    // Dessiner l'image redimensionnée
    ctx.drawImage(imageElement, 0, 0, modelSize, modelSize);
    
    // Obtenir les données de pixels
    const imageData = ctx.getImageData(0, 0, modelSize, modelSize);
    const pixels = imageData.data;
    
    // Convertir en format YOLO (RGB, normalisé, NCHW)
    const input = new Float32Array(3 * modelSize * modelSize);
    
    for (let i = 0; i < modelSize * modelSize; i++) {
      const pixelIndex = i * 4;
      // Normalisation [0-255] -> [0-1] et conversion RGB
      input[i] = pixels[pixelIndex] / 255.0; // R
      input[modelSize * modelSize + i] = pixels[pixelIndex + 1] / 255.0; // G
      input[modelSize * modelSize * 2 + i] = pixels[pixelIndex + 2] / 255.0; // B
    }
    
    // Créer le tensor ONNX (batch_size=1, channels=3, height=640, width=640)
    return new ort.Tensor('float32', input, [1, 3, modelSize, modelSize]);
  }

  /**
   * Post-traite les résultats YOLO pour extraire les détections
   */
  private postprocessResults(output: ort.Tensor, originalWidth: number, originalHeight: number): BoundingBox | null {
    const data = output.data as Float32Array;
    const [batchSize, numClasses, numBoxes] = output.dims as [number, number, number];
    
    // YOLOv8 format: [x_center, y_center, width, height, confidence]
    let bestDetection: BoundingBox | null = null;
    let bestConfidence = 0;
    
    const confidenceThreshold = 0.5;
    const modelSize = 640;
    
    for (let i = 0; i < numBoxes; i++) {
      const confidence = data[4 * numBoxes + i]; // Index de la confiance
      
      if (confidence > confidenceThreshold && confidence > bestConfidence) {
        const xCenter = data[i];
        const yCenter = data[numBoxes + i];
        const width = data[2 * numBoxes + i];
        const height = data[3 * numBoxes + i];
        
        // Convertir du format YOLO vers les coordonnées réelles
        const x1 = (xCenter - width / 2) * (originalWidth / modelSize);
        const y1 = (yCenter - height / 2) * (originalHeight / modelSize);
        const x2 = (xCenter + width / 2) * (originalWidth / modelSize);
        const y2 = (yCenter + height / 2) * (originalHeight / modelSize);
        
        bestDetection = { x1, y1, x2, y2 };
        bestConfidence = confidence;
      }
    }
    
    return bestDetection;
  }

  /**
   * Calcule le pourcentage d'intersection entre deux bounding boxes
   */
  private calculateIntersection(bbox1: BoundingBox, bbox2: BoundingBox): number {
    const x1 = Math.max(bbox1.x1, bbox2.x1);
    const y1 = Math.max(bbox1.y1, bbox2.y1);
    const x2 = Math.min(bbox1.x2, bbox2.x2);
    const y2 = Math.min(bbox1.y2, bbox2.y2);
    
    if (x2 <= x1 || y2 <= y1) {
      return 0.0;
    }
    
    const intersectionArea = (x2 - x1) * (y2 - y1);
    const bbox1Area = (bbox1.x2 - bbox1.x1) * (bbox1.y2 - bbox1.y1);
    const bbox2Area = (bbox2.x2 - bbox2.x1) * (bbox2.y2 - bbox2.y1);
    const unionArea = bbox1Area + bbox2Area - intersectionArea;
    
    return unionArea === 0 ? 0 : (intersectionArea / unionArea) * 100;
  }

  /**
   * Détecte un ballon dans une image
   */
  async detectBall(
    imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    targetBbox?: BoundingBox
  ): Promise<DetectionResult> {
    if (!this.session) {
      await this.loadModel();
    }

    if (!this.session) {
      throw new Error('Modèle non chargé');
    }

    try {
      // Préprocesser l'image
      const inputTensor = this.preprocessImage(imageElement);
      
      // Exécuter l'inférence
      const results = await this.session.run({ images: inputTensor });
      
      // Post-traiter les résultats
      const outputTensor = results.output0;
      const originalWidth = imageElement instanceof HTMLImageElement ? 
        imageElement.naturalWidth : imageElement.width;
      const originalHeight = imageElement instanceof HTMLImageElement ? 
        imageElement.naturalHeight : imageElement.height;
      
      const ballBbox = this.postprocessResults(outputTensor, originalWidth, originalHeight);
      
      if (!ballBbox) {
        return {
          ball_detected: false,
          intersection_percentage: 0,
          reaches_target: false
        };
      }

      // Calculer l'intersection si une cible est fournie
      let intersectionPercentage = 0;
      let reachesTarget = false;

      if (targetBbox) {
        intersectionPercentage = this.calculateIntersection(ballBbox, targetBbox);
        reachesTarget = intersectionPercentage > 0;
      }

      return {
        ball_detected: true,
        ball_bbox: ballBbox,
        intersection_percentage: intersectionPercentage,
        reaches_target: reachesTarget
      };

    } catch (error) {
      console.error('❌ Erreur lors de la détection:', error);
      throw new Error(`Erreur d'inférence: ${error}`);
    }
  }

  /**
   * Vérifie si le modèle est chargé
   */
  isModelLoaded(): boolean {
    return this.modelLoaded;
  }

  /**
   * Libère les ressources
   */
  async dispose(): Promise<void> {
    if (this.session) {
      await this.session.release();
      this.session = null;
      this.modelLoaded = false;
    }
  }
}

// Instance singleton
export const localBallDetection = new LocalBallDetection();