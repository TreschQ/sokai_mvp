'use client';

import { useState, useRef } from 'react';
import { ballDetectionService } from '@/services/ballDetectionService';

export default function TestDetection() {
  const [logs, setLogs] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const testDetection = async () => {
    setLogs([]);
    
    if (!fileInputRef.current?.files?.[0]) {
      addLog('❌ Aucun fichier sélectionné');
      return;
    }
    
    const file = fileInputRef.current.files[0];
    addLog('📁 Fichier sélectionné: ' + file.name);
    
    try {
      // Test de la cible
      const targetBbox = {
        x1: 100,
        y1: 100,
        x2: 200,
        y2: 200
      };
      
      addLog('🚀 Début du test de détection');
      addLog('🎯 Cible définie: ' + JSON.stringify(targetBbox));
      
      // Initialiser le service
      addLog('⏳ Initialisation du service...');
      await ballDetectionService.initialize();
      addLog('✅ Service initialisé');
      
      // Vérifier le statut
      addLog(`📊 Mode: ${ballDetectionService.getMode()}`);
      addLog(`📊 IA locale prête: ${ballDetectionService.isLocalAIReady()}`);
      
      // Effectuer la détection
      addLog('🔍 Détection en cours...');
      const result = await ballDetectionService.detectBall(file, targetBbox);
      
      addLog('✅ Détection terminée!');
      addLog(`🎾 Ballon détecté: ${result.ball_detected}`);
      if (result.ball_bbox) {
        addLog(`📍 Position: ${JSON.stringify(result.ball_bbox)}`);
      }
      addLog(`🎯 Atteint la cible: ${result.reaches_target}`);
      addLog(`📊 Intersection: ${result.intersection_percentage.toFixed(2)}%`);
      
    } catch (error) {
      addLog(`❌ Erreur: ${error}`);
      if (error instanceof Error) {
        addLog(`❌ Message: ${error.message}`);
        addLog(`❌ Stack: ${error.stack}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Test de Détection de Ballon</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Contrôles</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Sélectionner une image
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-300
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700"
              />
            </div>
            
            {imagePreview && (
              <div className="mt-4">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-w-full h-auto rounded"
                />
              </div>
            )}
            
            <button
              onClick={testDetection}
              className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
            >
              Tester la détection
            </button>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Logs</h2>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div 
                key={index} 
                className={`font-mono text-xs ${
                  log.includes('❌') ? 'text-red-400' : 
                  log.includes('✅') ? 'text-green-400' : 
                  log.includes('🎯') ? 'text-yellow-400' :
                  'text-gray-300'
                }`}
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}