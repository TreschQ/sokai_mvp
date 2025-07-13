'use client';

import { useState, useEffect, useRef } from 'react';
import { useStatsManager } from '@/hooks/useStatsManager';

interface TargetBbox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface Target {
  target_bbox: TargetBbox;
  position: [number, number, number];
}


export default function Home() {
  const [temps, setTemps] = useState<number>(30);
  const [showScore, setShowScore] = useState(false);
  const [nombrePoints, setNombrePoints] = useState<number>(0);
  const [nbEssaie, setNbEssaie] = useState<number>(0);
  const [target, setTarget] = useState<Target>(genererPositionCible(nbEssaie));
  const [isTuched, setIsTouched] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(3);
  const [isGameFinished, setIsGameFinished] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<HTMLDivElement | null>(null);
  const pointsRef = useRef<HTMLDivElement | null>(null);
  
  // Hook pour la gestion des stats
  const { updateGameStats, isLoading } = useStatsManager();

  // Décompte avant le début du jeu
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown(c => c - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  useEffect(() => {
    if (isTuched) {
      setShowScore(true);
      setIsTouched(false);
      const timer = setTimeout(() => {
        setShowScore(false); // Changé de true à 
  false
      }, 1000);

      return () => clearTimeout(timer); // Nettoie 

    }
  }, [isTuched]);

  // Timer principal, démarre après le décompte
  useEffect(() => {
    if (countdown > 0) return;
    if (temps <= 0 && !isGameFinished) {
      setIsGameFinished(true);
      // Fin du jeu - mise à jour des stats
      updateGameStats(nombrePoints, 30, 'Touch and Dash');
      return;
    }
    if (temps > 0) {
      const interval = setInterval(() => {
        setTemps(t => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [countdown, temps, nombrePoints, isGameFinished, updateGameStats]);

  // Gestion des 100 points atteints
  useEffect(() => {
    if (nombrePoints >= 100 && !isGameFinished) {
      setIsGameFinished(true);
      updateGameStats(nombrePoints, 30, 'Touch and Dash');
    }
  }, [nombrePoints, isGameFinished, updateGameStats]);

  // Webcam
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user' // Caméra avant (selfie)
      },
      audio: false
    })
      .then(stream => {
        video.srcObject = stream;
      })
      .catch(() => {
        alert("Erreur durant le jeu");
      });
    // Nettoyage du flux vidéo à la fin
    return () => {
      if (video && video.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    console.log("showScore changed to:", showScore);
  }, [showScore]);

  // Capture et traitement d'image toutes les X ms
  useEffect(() => {
    if (temps <= 0 || isGameFinished) return;
    const interval = setInterval(async () => {
      if (!videoRef.current) return;
      // Capture une frame du flux vidéo
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(videoRef.current, 0, 0, 640, 480);
      const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png'));
      if (!blob) return;
      try {
        const data = await envoyerImage(blob, target.target_bbox);
        if (trouverResultats(data)) {
          setIsTouched(true);
          setNombrePoints(p => p + 5);
          setNbEssaie(e => e + 1);
          const nouvelleCible = genererPositionCible(nbEssaie);
          setTarget(nouvelleCible);
        }
      } catch (e) {
        // ignore si la balle n'est pas détectée
      }
    }, 500); // toutes les 500ms
    return () => clearInterval(interval);
  }, [temps, target, isGameFinished]);

  useEffect(() => {
    if (isTuched) {
      setShowScore(true);    // Ajoute l'élément au DOM
      setIsTouched(false);
      const timer = setTimeout(() => {
        setShowScore(false); // Retire l'élément du DOM
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isTuched]);

  

  // Affichage du cercle cible sur le canvas
  useEffect(() => {
    const overlay = document.getElementById('overlay') as HTMLCanvasElement | null;
    if (!overlay) return;
    const ctx = overlay.getContext('2d');
    if (!ctx) return;
    
    // Nettoyer le canvas
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    
    // Dessiner la cible seulement pendant le jeu (après countdown et avant fin)
    if (countdown <= 0 && temps > 0 && !isGameFinished) {
      const [x, y, rayon] = target.position;
      ctx.beginPath();
      ctx.arc(x, y, rayon, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillStyle = '#7ed957';
      ctx.lineWidth = 6;
      ctx.fill();
      ctx.stroke();
    }
  }, [target, temps, countdown]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {(countdown > 0) && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            fontSize: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
        >
          {countdown}
        </div>
      )}
      {isGameFinished && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.85)',
            color: '#7ed957',
            fontSize: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20
          }}
        >
         NOMBRE DE POINTS : {nombrePoints}
         {isLoading && <div style={{fontSize: 20, marginTop: 20}}>Sauvegarde en cours...</div>}
        </div>
      )}
      {showScore && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            color: '#7ed957',
            fontSize: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20
          }}
        >
          +5
        </div>
      )}
      <video
        ref={videoRef}
        id="webcam"
        autoPlay
        playsInline
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1, transform: 'rotateY(180deg)' }} // Inverser horizontalement
      />
      <canvas
        id="overlay"
        width={640}
        height={480}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none', transform: 'rotateY(180deg)'}}
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
function genererPositionCible(nbEssaie : number): Target {
  const rayon = 30; // Rayon de la cible
  if (nbEssaie% 2 === 0) {
    const x = 200;
    const y = 400;
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
  else {
    const x = 600;
    const y = 400;
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
  
}

// Envoie l'image au backend
async function envoyerImage(imageBlob: Blob, bbox: TargetBbox): Promise<any> {
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
function trouverResultats(data: any): boolean {
  if (data["ball_detected"] === false) {
    return false;
  } else {
    return !!data["reaches_target"];
  }
}
