'use client';

import { useEffect, useState } from 'react';
import * as ort from 'onnxruntime-web';

export default function TestONNXSimple() {
  const [logs, setLogs] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const testONNX = async () => {
      try {
        addLog('🚀 Début du test ONNX');
        
        // Configuration
        addLog('📊 Configuration ONNX Runtime...');
        ort.env.wasm.wasmPaths = '/';
        ort.env.wasm.numThreads = 1;
        
        addLog(`📁 wasmPaths: ${ort.env.wasm.wasmPaths}`);
        addLog(`🧵 numThreads: ${ort.env.wasm.numThreads}`);
        
        // Vérifier la présence des fichiers WASM
        addLog('🔍 Vérification des fichiers WASM...');
        
        const wasmFiles = [
          '/ort-wasm-simd-threaded.wasm',
          '/ort-wasm-simd-threaded.mjs',
          '/models/best.onnx'
        ];
        
        for (const file of wasmFiles) {
          try {
            const response = await fetch(file, { method: 'HEAD' });
            addLog(`✅ ${file}: ${response.status} ${response.statusText}`);
          } catch (error) {
            addLog(`❌ ${file}: ${error}`);
          }
        }
        
        // Charger le modèle
        addLog('🔄 Chargement du modèle ONNX...');
        const session = await ort.InferenceSession.create('/models/best.onnx', {
          executionProviders: ['wasm'],
          graphOptimizationLevel: 'all',
        });
        
        addLog('✅ Modèle chargé avec succès!');
        addLog(`📊 Inputs: ${session.inputNames.join(', ')}`);
        addLog(`📊 Outputs: ${session.outputNames.join(', ')}`);
        
        // Libérer
        await session.release();
        addLog('✅ Session libérée');
        
      } catch (error) {
        addLog(`❌ Erreur: ${error}`);
        if (error instanceof Error) {
          addLog(`❌ Message: ${error.message}`);
          addLog(`❌ Stack: ${error.stack}`);
        }
      }
    };
    
    testONNX();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Test ONNX Simple</h1>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Logs:</h2>
        <div className="space-y-2">
          {logs.map((log, index) => (
            <div 
              key={index} 
              className={`font-mono text-sm ${
                log.includes('❌') ? 'text-red-400' : 
                log.includes('✅') ? 'text-green-400' : 
                'text-gray-300'
              }`}
            >
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}