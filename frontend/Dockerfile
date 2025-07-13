FROM node:22-alpine

# Installer les dépendances système nécessaires
RUN apk add --no-cache python3 make g++ curl

# Définir le dossier de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY next.config.js ./
COPY tsconfig.json ./

# Installer toutes les dépendances
RUN npm install

# Copier le code source
COPY . .

# Construire l'application
#RUN npm run build
# changer pour build

EXPOSE 3000

# Démarrer l'application
CMD ["npm", "run","dev"]