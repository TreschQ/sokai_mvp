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
  private modelLoaded = false;
  private loadingPromise: Promise<void> | null = null;
  private initialized = false;

  constructor() {
    this.initializeOnnxRuntime();
  }

  private initializeOnnxRuntime() {
    if (this.initialized) return;
    
    try {
      // Configuration optimisée pour le navigateur
      ort.env.wasm.wasmPaths = {
        'ort-wasm.wasm': '/ort-wasm-simd-threaded.wasm',
        'ort-wasm-threaded.wasm': '/ort-wasm-simd-threaded.wasm',
        'ort-wasm-simd.wasm': '/ort-wasm-simd-threaded.wasm',
        'ort-wasm-simd-threaded.wasm': '/ort-wasm-simd-threaded.wasm'
      };
      
      // Configuration optimale pour les performances
      ort.env.wasm.numThreads = navigator.hardwareConcurrency || 4;
      ort.env.wasm.simd = true;
      ort.env.logLevel = 'warning';
      
      this.initialized = true;
      console.log('✅ ONNX Runtime initialisé avec:', {
        threads: ort.env.wasm.numThreads,
        simd: ort.env.wasm.simd,
        wasmPaths: ort.env.wasm.wasmPaths
      });
    } catch (error) {
      console.error('❌ Erreur initialisation ONNX:', error);
      // Fallback configuration simple
      ort.env.wasm.wasmPaths = '/';
      ort.env.wasm.numThreads = 1;
      this.initialized = true;
    }
  }

  /**
   * Charge le modèle ONNX
   */
  async loadModel(): Promise<void> {
    // Si déjà chargé, retourner immédiatement
    if (this.modelLoaded && this.session) {
      console.log('🔄 Modèle déjà chargé');
      return;
    }

    // Si en cours de chargement, attendre la promesse existante
    if (this.loadingPromise) {
      console.log('🔄 Chargement en cours, attente...');
      return this.loadingPromise;
    }

    // Créer une nouvelle promesse de chargement
    this.loadingPromise = this.performModelLoading();
    
    try {
      await this.loadingPromise;
    } finally {
      this.loadingPromise = null;
    }
  }

  private async performModelLoading(): Promise<void> {
    
    try {
      console.log('🔄 Chargement du modèle ONNX...');
      console.log('📊 Configuration ONNX:', {
        wasmPaths: ort.env.wasm.wasmPaths,
        numThreads: ort.env.wasm.numThreads
      });
      
      // Vérifier si le fichier existe
      const checkResponse = await fetch('/models/best.onnx', { method: 'HEAD' });
      console.log('📁 Vérification du fichier:', checkResponse.status, checkResponse.statusText);
      
      if (!checkResponse.ok) {
        throw new Error(`Fichier modèle introuvable: ${checkResponse.status}`);
      }
      
      // Charger le modèle ONNX
      console.log('📁 Tentative de chargement depuis /models/best.onnx');
      this.session = await ort.InferenceSession.create('/models/best.onnx', {
        executionProviders: ['webgl', 'wasm', 'cpu'], // Plusieurs fallbacks
        graphOptimizationLevel: 'all',
        enableMemPattern: false,
        enableCpuMemArena: false,
        extra: {
          session: {
            disable_prepacking: false,
            use_device_allocator_for_initializers: true,
          }
        }
      });
      
      this.modelLoaded = true;
      console.log('✅ Modèle ONNX chargé avec succès');
      console.log('📊 Providers disponibles:', this.session.inputNames, this.session.outputNames);
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement du modèle:', error);
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'N/A');
      this.modelLoaded = false;
      this.session = null;
      throw new Error(`Impossible de charger le modèle: ${error}`);
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
    console.log('📊 Dimensions de sortie:', output.dims);
    console.log('📊 Taille des données:', data.length);
    console.log('📊 Premiers éléments:', Array.from(data.slice(0, 10)));
    
    // YOLOv8 peut avoir différents formats de sortie
    // Format possible 1: [1, 84, 8400] - (batch, classes+coords, predictions)
    // Format possible 2: [1, 8400, 84] - (batch, predictions, classes+coords)
    
    if (output.dims.length !== 3) {
      console.error('Format de sortie inattendu:', output.dims);
      return null;
    }
    
    const [, dim1, dim2] = output.dims as [number, number, number];
    
    // Déterminer le format
    let numBoxes: number;
    let featuresPerBox: number;
    let isTransposed = false;
    
    if (dim1 > dim2) {
      // Format [1, 8400, 84]
      numBoxes = dim1;
      featuresPerBox = dim2;
      isTransposed = false;
    } else {
      // Format [1, 84, 8400]
      numBoxes = dim2;
      featuresPerBox = dim1;
      isTransposed = true;
    }
    
    console.log(`📊 Nombre de boîtes: ${numBoxes}, Features par boîte: ${featuresPerBox}`);
    
    let bestDetection: BoundingBox | null = null;
    let bestConfidence = 0;
    const confidenceThreshold = 0.25; // Seuil plus bas pour le debug
    const modelSize = 640;
    
    for (let i = 0; i < numBoxes; i++) {
      let xCenter, yCenter, width, height, confidence;
      
      if (!isTransposed) {
        // Format [1, 8400, 84]
        const boxOffset = i * featuresPerBox;
        xCenter = data[boxOffset];
        yCenter = data[boxOffset + 1];
        width = data[boxOffset + 2];
        height = data[boxOffset + 3];
        // La confiance est généralement après les coordonnées
        confidence = Math.max(...Array.from(data.slice(boxOffset + 4, boxOffset + featuresPerBox)));
      } else {
        // Format [1, 84, 8400]
        xCenter = data[i];
        yCenter = data[numBoxes + i];
        width = data[2 * numBoxes + i];
        height = data[3 * numBoxes + i];
        // Calculer la confiance max pour toutes les classes
        confidence = 0;
        for (let c = 4; c < featuresPerBox; c++) {
          confidence = Math.max(confidence, data[c * numBoxes + i]);
        }
      }
      
      if (confidence > confidenceThreshold && confidence > bestConfidence) {
        // Convertir du format YOLO vers les coordonnées réelles
        const x1 = (xCenter - width / 2) * (originalWidth / modelSize);
        const y1 = (yCenter - height / 2) * (originalHeight / modelSize);
        const x2 = (xCenter + width / 2) * (originalWidth / modelSize);
        const y2 = (yCenter + height / 2) * (originalHeight / modelSize);
        
        bestDetection = { x1, y1, x2, y2 };
        bestConfidence = confidence;
        
        console.log(`🎯 Détection trouvée: conf=${confidence.toFixed(3)}, box=[${x1.toFixed(0)},${y1.toFixed(0)},${x2.toFixed(0)},${y2.toFixed(0)}]`);
      }
    }
    
    if (!bestDetection) {
      console.log('❌ Aucune détection au-dessus du seuil');
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
    console.log('🔍 detectBall appelé');
    console.log('🔍 Session existante?', !!this.session);
    console.log('🔍 Modèle chargé?', this.modelLoaded);
    
    if (!this.session) {
      console.log('⏳ Session manquante, chargement du modèle...');
      await this.loadModel();
    }

    if (!this.session) {
      console.error('❌ Session toujours manquante après chargement');
      throw new Error('Modèle non chargé');
    }

    try {
      // Préprocesser l'image
      console.log('🖼️ Prétraitement de l\'image...');
      const inputTensor = this.preprocessImage(imageElement);
      console.log('🖼️ Tensor d\'entrée créé:', inputTensor.dims);
      
      // Exécuter l'inférence - utiliser le bon nom d'entrée du modèle
      const inputName = this.session.inputNames[0];
      console.log('📊 Nom d\'entrée du modèle:', inputName);
      console.log('🚀 Exécution de l\'inférence...');
      
      const results = await this.session.run({ [inputName]: inputTensor });
      
      console.log('📊 Résultats bruts:', results);
      console.log('📊 Clés de sortie:', Object.keys(results));
      
      // Post-traiter les résultats - YOLOv8 utilise 'output0' comme nom de sortie par défaut
      const outputTensor = results.output0 || results[Object.keys(results)[0]];
      console.log('📊 Tensor de sortie:', outputTensor?.dims);
      
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
        console.log(`🎯 Intersection: ${intersectionPercentage.toFixed(2)}%`);
      }

      return {
        ball_detected: true,
        ball_bbox: ballBbox,
        intersection_percentage: intersectionPercentage,
        reaches_target: reachesTarget
      };

    } catch (error) {
      console.error('❌ Erreur lors de la détection:', error);
      if (error instanceof Error) {
        console.error('❌ Stack:', error.stack);
      }
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