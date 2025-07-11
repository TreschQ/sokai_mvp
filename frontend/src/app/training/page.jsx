'use client';

import * as cv  from 'opencv4nodejs'; 

// BASILE 

export default function Home () {
    const video = document.getElementById('webcam');

    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(_ => {
        dessinerCarrer();
        captureVideo();
      })
      .catch((err) => {
        alert("Erreur d'accès à la webcam :");
      });
    return (
        <>
            <video id="webcam" autoplay playsinline width="640" height="480"></video>
        </>
    )
}




function dessinerCarrer() {
  const cv = require('opencv4nodejs');

  
  const wCap = new cv.VideoCapture(0); // 0 = première webcam
  wCap.set(cv.CAP_PROP_FRAME_WIDTH, 640);
  wCap.set(cv.CAP_PROP_FRAME_HEIGHT, 480);

  

    const run = () => {
      let frame = wCap.read();
      const FPS = 30;
      const delay = 1000 / FPS;

      // parfois une frame vide est lue, on boucle pour corriger
      if (frame.empty) {
        wCap.reset();
        frame = wCap.read();
      }

      

      // Dessiner un carré rouge sur la vidéo
      const topLeft = new cv.Point2(100, 100);
      const bottomRight = new cv.Point2(300, 300);
      const color = new cv.Vec3(0, 255, 0); //  Vert (BGR)
      const thickness = 2;

      frame.drawRectangle(topLeft, bottomRight, color, thickness);

      // Afficher dans une fenêtre
      cv.imshow('Caméra avec carré', frame);
      let frameCaptureDelay = 10;
      let numberImages = 5000;
      for (let index = 0; index < 20; index++) {
        let reussi = false;

        // TODO : rendre asynchrone
        setTimeout(() => {
          cv.imwrite(`capture.png`, element);
          let data = envoyerImage(`capture.png`);
          let successful = calculerResultats(data);
          if (successful) {
            // ajoute +1 a contexte
            reussi = true;
            return;
          }
        }, frameCaptureDelay);
        
      }
      const key = cv.waitKey(delay);

      // Reboucler sauf si ESC est pressée
      if (key !== 27) {
        setImmediate(run);
      } else {
        console.log('Fermeture...');
      } 
    };

    run();

}

function envoyerImage(imagePath) {
  // je lance le fichier python
  //je retourne le json généré
  //
}

function calculerResultats(data){

}