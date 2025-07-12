'use client';

import { useState, useEffect, useRef } from 'react';
import { useOpenCV } from '@/context/OpenCVContext';

export default function Home() {
  const [temps, setTemps] = useState(30);
  const [nombrePoints, setNombrePoints] = useState(0);
  const [target, setTarget] = useState(genererPositionCible());
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const pointsRef = useRef(null);

  // Timer
  useEffect(() => {
    if (temps <= 0) return;
    const interval = setInterval(() => {
      setTemps(t => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [temps]);

  // Webcam
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => {
        video.srcObject = stream;
      })
      .catch(() => {
        alert("Erreur durant le jeu");
      });
    // Nettoyage du flux vidéo à la fin
    return () => {
      if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Capture et traitement d'image toutes les X ms
  useEffect(() => {
    if (temps <= 0) return;
    const interval = setInterval(async () => {
      if (!videoRef.current) return;
      // Capture une frame du flux vidéo
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, 640, 480);
      const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
      try {
        const data = await envoyerImage(blob, target.target_bbox);
        if (trouverResultats(data)) {
          setNombrePoints(p => p + 1);
          const nouvelleCible = genererPositionCible();
          setTarget(nouvelleCible);
        }
      } catch (e) {
        // ignore si la balle n'est pas détectée
      }
    }, 500); // toutes les 500ms
    return () => clearInterval(interval);
  }, [temps, target]);

  // Affichage du cercle cible sur le canvas
  useEffect(() => {
    if (!videoRef.current) return;
    const overlay = document.getElementById('overlay');
    if (!overlay) return;
    const ctx = overlay.getContext('2d');
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    const [x, y, rayon] = target.position;
    ctx.beginPath();
    ctx.arc(x, y, rayon, 0, 2 * Math.PI);
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [target, temps]);

  return (
    <div style={{ position: 'relative', width: 640, height: 480 }}>
      <video
        ref={videoRef}
        id="webcam"
        autoPlay
        playsInline
        width="640"
        height="480"
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
      />
      <canvas
        id="overlay"
        width="640"
        height="480"
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 2, pointerEvents: 'none' }}
      />
      <div
        id="nbPoint"
        ref={pointsRef}
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          color: 'white',
          background: 'rgba(0,0,0,0.5)',
          padding: '4px 8px',
          borderRadius: 4,
          zIndex: 3
        }}
      >
        Points : {nombrePoints}
      </div>
      <div
        id="timer"
        ref={timerRef}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          color: 'white',
          background: 'rgba(0,0,0,0.5)',
          padding: '4px 8px',
          borderRadius: 4,
          zIndex: 3
        }}
      >
        Temps : {temps}
      </div>
    </div>
  );
}

// Génère une nouvelle cible aléatoire
function genererPositionCible() {
  const rayon = 30;
  const x = Math.floor(Math.random() * (640 - 2 * rayon)) + rayon;
  const y = Math.floor(Math.random() * (480 - 2 * rayon)) + rayon;
  return {
    target_bbox: {
      x1: x - rayon,
      y1: y - rayon,
      x2: x + rayon,
      y2: y + rayon
    },
    position: [x, y, rayon]
  };
}

// Envoie l'image au backend
async function envoyerImage(imageBlob, bbox) {
  try {
    const formData = new FormData();
    formData.append('file', imageBlob, 'capture.png');
    formData.append('bbox', JSON.stringify(bbox));

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Erreur lors de l\'envoi de l\'image');
    return await response.json();
  } catch (err) {
    throw err;
  }
}

// Analyse la réponse du backend
function trouverResultats(data) {
  if (!data["ball_detected"]) {
    console.log("Aucune balle détectée")
}
 else {
    console.log("Balle détectée");
    return data["reaches_target"]
}
}

// Placeholder pour l'envoi des résultats à la blockchain
function ecrireResultat() {
  // TODO : envoyer les résultats à la blockchain
}
