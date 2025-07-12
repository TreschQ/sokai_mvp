"use client";

import { useEffect } from 'react';
import { useOpenCV } from '@/context/OpenCVContext';

export default function OpenCVLoader() {
  const { setCv } = useOpenCV();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/4.8.0/opencv.js';
    script.async = true;
    script.onload = () => {
      cv['onRuntimeInitialized'] = () => {
        console.log('OpenCV prêt');
        setCv(cv);
      };
    };
    document.body.appendChild(script);
  }, [setCv]);

  return null; // pas besoin d'afficher quoi que ce soit
}
