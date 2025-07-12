# Étape 1 : Build d'OpenCV.js avec Emscripten
FROM emscripten/emsdk AS opencv_builder

RUN apt-get update && apt-get install -y git python3 && apt-get clean

WORKDIR /src

# Clone OpenCV
RUN git clone https://github.com/opencv/opencv.git

WORKDIR /src/opencv

# Build OpenCV.js
RUN emcmake python3 ./platforms/js/build_js.py /src/opencv/build_js

# Étape 2 : Application Node.js avec OpenCV natif
FROM node:22

# Définir le dossier de travail pour l'app Node
WORKDIR /root/sokai_mvp

# Copier les fichiers de build OpenCV.js si tu en as besoin côté client (ex: front-end)
COPY --from=opencv_builder /src/opencv/build_js/bin/opencv.js ./public/libs/opencv.js

# Copier les fichiers de ton projet
COPY package*.json ./
COPY . .

# Installer les dépendances Node.js
RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]
