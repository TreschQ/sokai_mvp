'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useOpenCV } from '@/context/OpenCVContext';
import { useUpdateStats } from '@/hooks/useUpdateStats';
import { usePrivy } from '@privy-io/react-auth';
import { useActiveAccount } from 'thirdweb/react';
import { ethers } from 'ethers';
import SokaiABI from '../../../abis/SokaiSBT_abi.json';

export default function Home() {
  const [temps, setTemps] = useState(30);
  const [nombrePoints, setNombrePoints] = useState(0);
  const [target, setTarget] = useState(genererPositionCible());
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [userTokenId, setUserTokenId] = useState(null);
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const pointsRef = useRef(null);
  
  const router = useRouter();
  const { updateStats, isUpdating, error: updateError, txHash } = useUpdateStats();
  const { user } = usePrivy();
  const thirdwebAccount = useActiveAccount();

  // Trouver le token ID du wallet connecté
  const findUserTokenId = async () => {
    try {
      let walletAddress = null;
      
      // Déterminer l'adresse du wallet (même logique que dans profile)
      if (thirdwebAccount?.address) {
        walletAddress = thirdwebAccount.address;
      } else if (user?.wallet?.address) {
        walletAddress = user.wallet.address;
      }

      if (!walletAddress) {
        console.error('Aucun wallet connecté');
        return null;
      }

      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!contractAddress) {
        console.error('Contract address non configuré');
        return null;
      }

      if (!window.ethereum) {
        console.error('Ethereum provider non disponible');
        return null;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, SokaiABI, provider);
      
      // Vérifier le balance d'abord
      const balance = await contract.balanceOf(walletAddress);
      if (balance === BigInt(0)) {
        console.error('Aucun SBT trouvé pour ce wallet');
        return null;
      }

      // Chercher le token ID
      for (let i = 1; i <= 1000; i++) {
        try {
          const owner = await contract.ownerOf(i);
          if (owner.toLowerCase() === walletAddress.toLowerCase()) {
            console.log('Token ID trouvé:', i);
            return i.toString();
          }
        } catch (e) {
          continue;
        }
      }

      console.error('Token ID introuvable pour ce wallet');
      return null;
    } catch (error) {
      console.error('Erreur lors de la recherche du token ID:', error);
      return null;
    }
  };

  // Initialiser le token ID au chargement du composant
  useEffect(() => {
    const initTokenId = async () => {
      const tokenId = await findUserTokenId();
      setUserTokenId(tokenId);
    };
    
    if ((thirdwebAccount?.address || user?.wallet?.address) && !userTokenId) {
      initTokenId();
    }
  }, [thirdwebAccount?.address, user?.wallet?.address, userTokenId]);

  // Mise à jour des métadonnées NFT via smart contract  
  const updateSBTMetadatas = async (score) => {
    try {
      console.log('🏆 Fin de l\'entraînement - Score:', score);
      
      if (!userTokenId) {
        console.error('Token ID utilisateur non trouvé');
        alert('Erreur: Impossible de trouver votre SOKAI Card. Assurez-vous d\'être connecté avec le bon wallet.');
        return;
      }
      
      // Essayer d'abord l'approche via API admin (pour éviter les permissions)
      const apiResponse = await fetch('/api/update-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId: userTokenId,
          score: score,
          timeSpent: 30,
          exercise: 'Training Ball Match',
          date: new Date().toISOString().split('T')[0]
        })
      });

      if (apiResponse.ok) {
        const result = await apiResponse.json();
        console.log('✅ Stats updated via API:', result);
        
        alert(`🎯 Entraînement terminé !
        
Score: ${score} points
Niveau: ${getLevel(score)}
Exercice: Training Ball Match

Transaction: ${result.txHash?.substring(0, 10)}...`);

        // Redirection vers profile après 2 secondes avec refresh
        setTimeout(() => {
          router.push('/profile?refresh=true');
        }, 2000);
        
        return result;
      } else {
        throw new Error('API update failed');
      }
      
    } catch (error) {
      console.warn('⚠️ API failed, trying direct contract call...', error);
      
      // Fallback: Appel direct au contrat (nécessite wallet admin)
      try {
        const success = await updateStats({
          tokenId: userTokenId,
          score: score,
          timeSpent: 30,
          exercise: 'Training Ball Match',
          date: new Date().toISOString().split('T')[0]
        });

        if (success) {
          alert(`🎯 Entraînement terminé !
          
Score: ${score} points
Niveau: ${getLevel(score)}

Transaction: ${txHash}`);

          // Redirection vers profile après 2 secondes avec refresh
          setTimeout(() => {
            router.push('/profile?refresh=true');
          }, 2000);
          
          return { success: true, txHash };
        } else {
          throw new Error(updateError || 'Contract update failed');
        }
      } catch (contractError) {
        console.error('❌ Erreur mise à jour blockchain:', contractError);
        
        // Mock en cas d'échec complet
        alert(`🎯 Entraînement terminé !
        
Score: ${score} points
Niveau: ${getLevel(score)}

⚠️ Sauvegarde blockchain en mode test`);

        // Redirection même en cas d'erreur
        setTimeout(() => {
          router.push('/profile?refresh=true');
        }, 3000);
      }
    }
  };

  // Timer
  useEffect(() => {
    if (temps <= 0 && !isGameFinished) {
      setIsGameFinished(true);
      // Fin du jeu - mise à jour des métadonnées NFT
      updateSBTMetadatas(nombrePoints);
      return;
    }
    if (temps > 0) {
      const interval = setInterval(() => {
        setTemps(t => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [temps, nombrePoints, isGameFinished]);

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
    if (temps <= 0 || isGameFinished) return;
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
  }, [temps, target, isGameFinished]);

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

// Calcule le niveau basé sur le score
function getLevel(score) {
  if (score >= 50) return 'Expert';
  if (score >= 30) return 'Avancé';
  if (score >= 15) return 'Intermédiaire';
  if (score >= 5) return 'Débutant';
  return 'Novice';
}

