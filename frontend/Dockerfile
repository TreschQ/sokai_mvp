FROM node:22

RUN apt-get update && apt-get install -y python3-pip

# Définir le dossier de travail pour l'app Node
WORKDIR /root/sokai_mvp

# Copier les fichiers de ton projet
COPY package*.json ./
COPY . .

# Installer les dépendances Node.js
RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]
