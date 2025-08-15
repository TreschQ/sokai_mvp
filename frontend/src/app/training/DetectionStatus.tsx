'use client';

import { useEffect, useState } from 'react';
import { ballDetectionService } from '@/services/ballDetectionService';

export function DetectionStatus() {
  const [status, setStatus] = useState<'loading' | 'local' | 'api' | 'error'>('loading');
  
  useEffect(() => {
    const checkStatus = async () => {
      try {
        await ballDetectionService.initialize();
        const mode = ballDetectionService.getMode();
        setStatus(mode);
      } catch (error) {
        setStatus('error');
      }
    };
    
    checkStatus();
  }, []);
  
  const statusColors = {
    loading: 'bg-yellow-500',
    local: 'bg-green-500',
    api: 'bg-blue-500',
    error: 'bg-red-500'
  };
  
  const statusText = {
    loading: '⏳ Chargement IA...',
    local: '🚀 IA locale active',
    api: '🌐 Mode API',
    error: '❌ Erreur IA'
  };
  
  return (
    <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white text-sm font-medium ${statusColors[status]}`}>
      {statusText[status]}
    </div>
  );
}