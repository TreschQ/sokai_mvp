/**
 * Service unifié pour la détection de ballon - local et API
 */

import { localBallDetection, type BoundingBox, type DetectionResult } from './localAI';

export type { BoundingBox, DetectionResult };

export class BallDetectionService {
  private useLocalAI: boolean = true; // Par défaut, utiliser l'IA locale

  /**
   * Configure le mode de détection
   */
  setMode(useLocal: boolean): void {
    this.useLocalAI = useLocal;
  }

  /**
   * Détecte un ballon via l'IA locale (navigateur)
   */
  private async detectBallLocal(
    imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    targetBbox?: BoundingBox
  ): Promise<DetectionResult> {
    return await localBallDetection.detectBall(imageElement, targetBbox);
  }

  /**
   * Détecte un ballon via l'API externe (legacy) - maintenant utilise l'IA locale côté client
   */
  private async detectBallAPI(
    imageFile: File,
    targetBbox?: BoundingBox
  ): Promise<DetectionResult> {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    if (targetBbox) {
      formData.append('bbox', JSON.stringify(targetBbox));
    }

    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // L'API retourne maintenant l'image en base64, on traite avec l'IA locale
      if (result.success && result.imageData) {
        const img = await this.dataUrlToImageElement(result.imageData);
        return await this.detectBallLocal(img, targetBbox);
      }
      
      throw new Error('Format de réponse API invalide');
    } catch (error) {
      console.error('Erreur API détection:', error);
      throw new Error(`Erreur de détection API: ${error}`);
    }
  }

  /**
   * Convertit un File en HTMLImageElement pour l'IA locale
   */
  private async fileToImageElement(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Impossible de charger l\'image'));
      };
      
      img.src = url;
    });
  }

  /**
   * Convertit une data URL en HTMLImageElement
   */
  private async dataUrlToImageElement(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve(img);
      };
      
      img.onerror = () => {
        reject(new Error('Impossible de charger l\'image depuis data URL'));
      };
      
      img.src = dataUrl;
    });
  }

  /**
   * Détecte un ballon (méthode principale)
   */
  async detectBall(
    input: File | HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    targetBbox?: BoundingBox
  ): Promise<DetectionResult> {
    try {
      if (this.useLocalAI) {
        // Mode IA locale
        let imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement;
        
        if (input instanceof File) {
          imageElement = await this.fileToImageElement(input);
        } else {
          imageElement = input;
        }
        
        return await this.detectBallLocal(imageElement, targetBbox);
      } else {
        // Mode API externe (fallback)
        if (input instanceof File) {
          return await this.detectBallAPI(input, targetBbox);
        } else {
          throw new Error('L\'API externe nécessite un objet File');
        }
      }
    } catch (error) {
      console.error('Erreur de détection:', error);
      
      // Fallback vers l'API en cas d'erreur locale
      if (this.useLocalAI && input instanceof File) {
        console.log('🔄 Fallback vers API externe...');
        this.useLocalAI = false; // Désactiver temporairement l'IA locale
        try {
          return await this.detectBallAPI(input, targetBbox);
        } catch (apiError) {
          console.error('❌ Échec du fallback API:', apiError);
        }
      }
      
      throw error;
    }
  }

  /**
   * Initialise le modèle local
   */
  async initialize(): Promise<void> {
    if (this.useLocalAI) {
      try {
        console.log('🚀 Initialisation du service de détection locale...');
        await localBallDetection.loadModel();
        console.log('✅ IA locale initialisée avec succès');
      } catch (error) {
        console.error('❌ Échec initialisation IA locale:', error);
        console.error('🔄 Basculement vers l\'API externe');
        this.useLocalAI = false; // Fallback vers API
        // Ne pas propager l'erreur - le fallback vers l'API est disponible
      }
    }
  }

  /**
   * Vérifie si l'IA locale est disponible
   */
  isLocalAIReady(): boolean {
    return this.useLocalAI && localBallDetection.isModelLoaded();
  }

  /**
   * Obtient le mode actuel
   */
  getMode(): 'local' | 'api' {
    return this.useLocalAI ? 'local' : 'api';
  }

  /**
   * Nettoie les ressources
   */
  async cleanup(): Promise<void> {
    await localBallDetection.dispose();
  }
}

// Instance singleton
export const ballDetectionService = new BallDetectionService();