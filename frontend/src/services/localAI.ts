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
  private canvasPool: HTMLCanvasElement[] = [];
  private readonly modelSize = 640; // Taille requise par le modèle YOLO
  
  // Statistiques de performance
  private performanceStats = {
    preprocessingTimes: [] as number[],
    inferenceTimes: [] as number[],
    postprocessingTimes: [] as number[],
    totalTimes: [] as number[],
    maxSamples: 30 // Moyenne sur les 30 dernières détections
  };

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
      
      // Optimisations WebGL
      ort.env.webgl.contextId = 'webgl2';
      ort.env.webgl.matmulMaxBatchSize = 16;
      ort.env.webgl.textureCacheMode = 'pack';
      
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
        executionProviders: ['webgl', 'wasm', 'cpu'],
        graphOptimizationLevel: 'all',
        enableMemPattern: true,
        enableCpuMemArena: true,
        executionMode: 'parallel',
        interOpNumThreads: navigator.hardwareConcurrency || 4,
        intraOpNumThreads: 1,
        extra: {
          session: {
            disable_prepacking: false,
            use_device_allocator_for_initializers: true,
            use_env_allocators: true,
            enable_cpu_mem_arena: true,
            enable_mem_pattern: true,
            enable_mem_reuse: true
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
   * Obtient un canvas réutilisable du pool
   */
  private getCanvas(): HTMLCanvasElement {
    if (this.canvasPool.length > 0) {
      return this.canvasPool.pop()!;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = this.modelSize;
    canvas.height = this.modelSize;
    return canvas;
  }

  /**
   * Retourne un canvas au pool
   */
  private returnCanvas(canvas: HTMLCanvasElement): void {
    if (this.canvasPool.length < 3) { // Limite le pool à 3 canvas
      this.canvasPool.push(canvas);
    }
  }

  /**
   * Préprocesse une image pour l'inférence YOLO (optimisé)
   */
  private preprocessImage(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): ort.Tensor {
    const canvas = this.getCanvas();
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true })!;
    
    // Utiliser imageSmoothingEnabled = true pour de meilleures détections
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'low'; // Compromis qualité/vitesse
    
    // Dessiner l'image redimensionnée
    ctx.drawImage(imageElement, 0, 0, this.modelSize, this.modelSize);
    
    // Obtenir les données de pixels
    const imageData = ctx.getImageData(0, 0, this.modelSize, this.modelSize);
    const pixels = imageData.data;
    
    // Convertir en format YOLO optimisé (NCHW)
    const totalPixels = this.modelSize * this.modelSize;
    const input = new Float32Array(3 * totalPixels);
    
    // Optimisation: traiter par chunks pour améliorer la cache locality
    const chunkSize = 1024;
    for (let chunk = 0; chunk < totalPixels; chunk += chunkSize) {
      const end = Math.min(chunk + chunkSize, totalPixels);
      
      for (let i = chunk; i < end; i++) {
        const pixelIndex = i * 4;
        const inv255 = 1 / 255; // Pré-calculer la division
        
        // Normalisation [0-255] -> [0-1] avec multiplication au lieu de division
        input[i] = pixels[pixelIndex] * inv255; // R
        input[totalPixels + i] = pixels[pixelIndex + 1] * inv255; // G
        input[totalPixels * 2 + i] = pixels[pixelIndex + 2] * inv255; // B
      }
    }
    
    // Retourner le canvas au pool
    this.returnCanvas(canvas);
    
    return new ort.Tensor('float32', input, [1, 3, this.modelSize, this.modelSize]);
  }

  /**
   * Post-traite les résultats YOLO pour extraire les détections
   */
  private postprocessResults(output: ort.Tensor, originalWidth: number, originalHeight: number): BoundingBox | null {
    const data = output.data as Float32Array;
    
    // Logs conditionnels pour éviter la surcharge en production
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Dimensions de sortie:', output.dims);
      console.log('📊 Taille des données:', data.length);
      console.log('📊 Premiers éléments:', Array.from(data.slice(0, 10)));
    }
    
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
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Nombre de boîtes: ${numBoxes}, Features par boîte: ${featuresPerBox}`);
    }
    
    let bestDetection: BoundingBox | null = null;
    let bestConfidence = 0;
    const confidenceThreshold = 0.5; // Seuil plus élevé pour réduire les faux positifs
    
    // Optimisation: arrêt anticipé si on trouve une très bonne détection
    const earlyStopThreshold = 0.9;
    
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
        // Optimisation: éviter la création d'un tableau et l'appel à Math.max
        confidence = 0;
        for (let j = boxOffset + 4; j < boxOffset + featuresPerBox; j++) {
          if (data[j] > confidence) confidence = data[j];
        }
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
        const x1 = (xCenter - width / 2) * (originalWidth / this.modelSize);
        const y1 = (yCenter - height / 2) * (originalHeight / this.modelSize);
        const x2 = (xCenter + width / 2) * (originalWidth / this.modelSize);
        const y2 = (yCenter + height / 2) * (originalHeight / this.modelSize);
        
        bestDetection = { x1, y1, x2, y2 };
        bestConfidence = confidence;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`🎯 Détection trouvée: conf=${confidence.toFixed(3)}, box=[${x1.toFixed(0)},${y1.toFixed(0)},${x2.toFixed(0)},${y2.toFixed(0)}]`);
        }
        
        // Arrêt anticipé si très bonne détection
        if (confidence > earlyStopThreshold) {
          break;
        }
      }
    }
    
    if (!bestDetection && process.env.NODE_ENV === 'development') {
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
    const totalStart = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 detectBall appelé');
      console.log('🔍 Session existante?', !!this.session);
      console.log('🔍 Modèle chargé?', this.modelLoaded);
    }
    
    if (!this.session) {
      console.log('⏳ Session manquante, chargement du modèle...');
      await this.loadModel();
    }

    if (!this.session) {
      console.error('❌ Session toujours manquante après chargement');
      throw new Error('Modèle non chargé');
    }

    try {
      // Mesurer le preprocessing
      const preprocessStart = performance.now();
      const inputTensor = this.preprocessImage(imageElement);
      const preprocessTime = performance.now() - preprocessStart;
      
      // Mesurer l'inférence
      const inputName = this.session.inputNames[0];
      const inferenceStart = performance.now();
      const results = await this.session.run({ [inputName]: inputTensor });
      const inferenceTime = performance.now() - inferenceStart;
      
      // Mesurer le post-processing
      const postprocessStart = performance.now();
      const outputTensor = results.output0 || results[Object.keys(results)[0]];
      
      const originalWidth = imageElement instanceof HTMLImageElement ? 
        imageElement.naturalWidth : imageElement.width;
      const originalHeight = imageElement instanceof HTMLImageElement ? 
        imageElement.naturalHeight : imageElement.height;
      
      const ballBbox = this.postprocessResults(outputTensor, originalWidth, originalHeight);
      const postprocessTime = performance.now() - postprocessStart;
      
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
        if (process.env.NODE_ENV === 'development') {
          console.log(`🎯 Intersection: ${intersectionPercentage.toFixed(2)}%`);
        }
      }

      // Calculer le temps total
      const totalTime = performance.now() - totalStart;
      
      // Mettre à jour les statistiques
      this.updatePerformanceStats(preprocessTime, inferenceTime, postprocessTime, totalTime);
      
      // Afficher les métriques de performance avec moyennes
      const avgPreprocess = this.getAverage(this.performanceStats.preprocessingTimes);
      const avgInference = this.getAverage(this.performanceStats.inferenceTimes);
      const avgPostprocess = this.getAverage(this.performanceStats.postprocessingTimes);
      const avgTotal = this.getAverage(this.performanceStats.totalTimes);
      
      console.log(`⏱️ Performance détection:
  • Preprocessing: ${preprocessTime.toFixed(1)}ms (moy: ${avgPreprocess.toFixed(1)}ms)
  • Inférence: ${inferenceTime.toFixed(1)}ms (moy: ${avgInference.toFixed(1)}ms)
  • Post-processing: ${postprocessTime.toFixed(1)}ms (moy: ${avgPostprocess.toFixed(1)}ms)
  • Total: ${totalTime.toFixed(1)}ms (moy: ${avgTotal.toFixed(1)}ms)
  • FPS: ${(1000 / totalTime).toFixed(1)} (moy: ${(1000 / avgTotal).toFixed(1)})`);

      return {
        ball_detected: true,
        ball_bbox: ballBbox,
        intersection_percentage: intersectionPercentage,
        reaches_target: reachesTarget
      };

    } catch (error) {
      const totalTime = performance.now() - totalStart;
      console.error(`❌ Erreur lors de la détection (après ${totalTime.toFixed(1)}ms):`, error);
      if (error instanceof Error) {
        console.error('❌ Stack:', error.stack);
      }
      throw new Error(`Erreur d'inférence: ${error}`);
    }
  }

  /**
   * Met à jour les statistiques de performance
   */
  private updatePerformanceStats(
    preprocessTime: number,
    inferenceTime: number,
    postprocessTime: number,
    totalTime: number
  ): void {
    const stats = this.performanceStats;
    
    // Ajouter les nouvelles mesures
    stats.preprocessingTimes.push(preprocessTime);
    stats.inferenceTimes.push(inferenceTime);
    stats.postprocessingTimes.push(postprocessTime);
    stats.totalTimes.push(totalTime);
    
    // Limiter la taille des tableaux
    if (stats.preprocessingTimes.length > stats.maxSamples) {
      stats.preprocessingTimes.shift();
      stats.inferenceTimes.shift();
      stats.postprocessingTimes.shift();
      stats.totalTimes.shift();
    }
  }
  
  /**
   * Calcule la moyenne d'un tableau de nombres
   */
  private getAverage(times: number[]): number {
    if (times.length === 0) return 0;
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  /**
   * Obtient les statistiques de performance actuelles
   */
  getPerformanceStats(): {
    avgPreprocessing: number;
    avgInference: number;
    avgPostprocessing: number;
    avgTotal: number;
    avgFPS: number;
    sampleCount: number;
  } {
    const stats = this.performanceStats;
    const avgPreprocessing = this.getAverage(stats.preprocessingTimes);
    const avgInference = this.getAverage(stats.inferenceTimes);
    const avgPostprocessing = this.getAverage(stats.postprocessingTimes);
    const avgTotal = this.getAverage(stats.totalTimes);
    
    return {
      avgPreprocessing,
      avgInference,
      avgPostprocessing,
      avgTotal,
      avgFPS: avgTotal > 0 ? 1000 / avgTotal : 0,
      sampleCount: stats.totalTimes.length
    };
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
    // Nettoyer le pool de canvas
    this.canvasPool.length = 0;
  }
}

// Instance singleton
export const localBallDetection = new LocalBallDetection();