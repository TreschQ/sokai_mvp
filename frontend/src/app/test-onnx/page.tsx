'use client';

import { useEffect, useState } from 'react';
import * as ort from 'onnxruntime-web';

export default function TestONNX() {
  const [status, setStatus] = useState('Initialisation...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testONNX = async () => {
      try {
        setStatus('Configuration WASM...');
        ort.env.wasm.wasmPaths = '/';
        
        setStatus('Chargement du modèle ONNX...');
        const session = await ort.InferenceSession.create('/models/best.onnx', {
          executionProviders: ['wasm'],
          graphOptimizationLevel: 'all',
        });
        
        setStatus(`✅ Modèle chargé ! Inputs: ${session.inputNames}, Outputs: ${session.outputNames}`);
        
        // Libérer les ressources
        await session.release();
      } catch (err) {
        console.error('Erreur:', err);
        setError(err instanceof Error ? err.message : String(err));
        setStatus('❌ Erreur de chargement');
      }
    };

    testONNX();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test ONNX Runtime</h1>
      <div className="bg-gray-100 p-4 rounded">
        <p className="text-lg">{status}</p>
        {error && (
          <div className="mt-4 bg-red-100 p-4 rounded">
            <p className="text-red-600">Erreur: {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}