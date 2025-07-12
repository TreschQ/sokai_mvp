
'use client';

import { useState, useEffect } from 'react';
import { useOpenCV } from '@/context/OpenCVContext';


// BASILE 
let temps = 30;
const [nombrePoints, setNombrePoints] = useState(0);

export default function Home () {
    const timerElement = document.getElementById('timer');
    const counterElement = document.getElementById('nbPoint');
    const video = document.getElementById('webcam');
    
    const diminuerTemps = () => {
      timerElement.innerText = temps;
      temps--;
    }
    setInterval(diminuerTemps, 1000);
    
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(_ => {
        jouer(video);
        ecrireResultat();
      })
      .catch((err) => {
        alert("Erreur durant le jeu");
      });
    
    useEffect(() => {counterElement.innerText = nombrePoints;},[nombrePoints]);
    return (
        <>
          <video id="webcam" autoplay playsinline width="640" height="480">
              <div id="nbPoint">0</div>
              <div id="timer">30</div>
          </video>
        </>
    )
}



function jouer(element) {
  let frameCaptureDelay = 10;
  
  let insideBox = {
    "target_bbox": {
        "x1": 100,
        "y1": 100,
        "x2": 200,
        "y2": 200
    }
}
  while(temps> 0 || nombrePoints < 20){
    setInterval(() => {
      cv.imwrite(`capture.png`, element);
      let data = envoyerImage(`capture.png`,insideBox);
      let successful = trouverResultats(data);
      if (successful) {
        setNombrePoints(points => points + 1);
        const result = genererPositionCible();
        insideBox['target_bbox'] = result["target_bbox"];
        const [x, y, rayon] = result["position"];
        dessinerCercle(x,y, rayon);
      }
        
    }, frameCaptureDelay);
  }
}

function dessinerCercle(x, y, rayon) {
  const { cv } = useOpenCV();
  useEffect(() => {
    if(cv){
      const wCap = new cv.VideoCapture(0); // 0 = première webcam
      const thickness = 2;
      wCap.set(cv.CAP_PROP_FRAME_WIDTH, 640);
      wCap.set(cv.CAP_PROP_FRAME_HEIGHT, 480);
      let frame = wCap.read();
      
      // parfois une frame vide est lue, on boucle pour corriger
      if (frame.empty) {
        wCap.reset();
        frame = wCap.read();
      }
    
      frame.drawCircle(
        new cv.Point2(x, y),
        rayon,
        new cv.Vec3(0,255,0),
        thickness
      );
    
      // Afficher dans une fenêtre
      cv.imshow('Caméra avec carré', frame);
    }
  }, [cv]);

}

function genererPositionCible(){
  
  // 

  const insideBox = {

  }
  
  
}

function envoyerImage(imagePath, insideBox) {
  let fichier = fs.readFileSync(imagePath);
  let form = new FormData();
  let dataChunk = "";
  form.append('files', fichier);
  let data = {
    "target_bbox": insideBox,
  }

  let request = http.request({
    method: 'post',
    host: 'http://localhost:8000',
    path: '/detect_ball',
    body : JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    }
  });
  form.pip(request);

  request.on('response', (response) => {
    if (response.statusCode !== 200) {
      throw new Error();
    }
    response.on('data', (chunk) => {
      dataChunk += chunk;   
    });
    response.on('end', () => {
      try {
        return JSON.parse(dataChunk);
      } catch (err) {
        throw err;
      }
    });
  });
}

function trouverResultats(data){
  if(!data["ball_detected"])
    throw new Error("Ball not detected");
  else
    return data["reaches_target"];
}

function ecrireResultat() {

  // TODO : envoyer les résultats à la blockchain
  
}
