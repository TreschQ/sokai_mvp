# SOKAI Mobile App

Application mobile React Native pour SOKAI MVP - Application de fitness football avec intégration blockchain et détection IA de ballon.

## 🚀 Fonctionnalités

- **Connexion Wallet Multi-Provider** : Support de Thirdweb, MetaMask, et Socios
- **Cartes SBT (Soulbound Tokens)** : NFTs non-transférables sur Chiliz blockchain
- **Entraînement avec Caméra** : Détection en temps réel du ballon avec IA
- **Suivi des Performances** : Statistiques et scores stockés on-chain
- **Interface Mobile Native** : Optimisée pour iOS et Android

## 🛠️ Installation

### Prérequis

- Node.js 18+ 
- Expo CLI
- iOS Simulator ou Android Emulator (ou appareil physique)

### Configuration

1. Cloner le projet :
```bash
git clone [repo-url]
cd sokai_mvp/mobile
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer l'environnement :
```bash
cp .env.example .env
# Éditer .env avec vos valeurs
```

4. Lancer l'application :
```bash
npm start
```

## 📱 Développement

### Structure du Projet

```
src/
├── components/        # Composants réutilisables
├── screens/          # Écrans principaux
├── navigation/       # Configuration navigation
├── hooks/           # Hooks personnalisés
├── services/        # Services blockchain et API
└── utils/           # Utilitaires
```

### Commandes Utiles

```bash
npm run android      # Lancer sur Android
npm run ios          # Lancer sur iOS
npm run web          # Lancer sur Web
```

## 🔧 Configuration

### Variables d'environnement

- `EXPO_PUBLIC_THIRDWEB_CLIENT_ID` : Client ID Thirdweb
- `EXPO_PUBLIC_CONTRACT_ADDRESS` : Adresse du contrat SBT
- `EXPO_PUBLIC_CHILIZ_RPC` : RPC Chiliz Spicy Testnet
- `EXPO_PUBLIC_CHAIN_ID` : 88882 (Chiliz Spicy)
- `EXPO_PUBLIC_API_URL` : URL de l'API backend

### Intégration Blockchain

L'app utilise :
- **Chiliz Spicy Testnet** (Chain ID: 88882)
- **Ethers.js v6** pour les interactions blockchain  
- **Thirdweb** pour la connexion wallet
- **SBT Contract** pour les NFTs non-transférables

### Caméra et IA

- **Expo Camera** pour la capture vidéo
- **Détection de ballon** via API Python (YOLOv8)
- **Analyse temps réel** des performances

## 🏗️ Build Production

### Build Android

```bash
eas build --platform android
```

### Build iOS

```bash
eas build --platform ios
```

## 🧪 Tests

L'app est testée sur :
- ✅ Expo Go (développement)
- ✅ iOS Simulator
- ✅ Android Emulator
- ✅ Appareils physiques

## 📚 Documentation

- [Guide Configuration Wallet](../frontend/PRIVY_SETUP.md)
- [Guide Admin](../frontend/ADMIN_MINT_SYSTEM_GUIDE.md)
- [Documentation API](../ai_api/README.md)

## 🔐 Sécurité

- Clés privées stockées localement uniquement
- Transactions signées côté client
- Validation côté serveur pour mint/updates
- Permissions caméra gérées par l'OS

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.