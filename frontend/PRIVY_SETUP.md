# Guide d'installation et configuration Privy

## 🚀 Configuration de Privy

### 1. Créer un compte Privy (si pas déjà fait)

1. Allez sur [https://dashboard.privy.io/](https://dashboard.privy.io/)
2. Créez un compte ou connectez-vous
3. Créez une nouvelle application

### 2. Obtenir votre App ID

1. Dans le dashboard Privy, sélectionnez votre application
2. Copiez l'**App ID** depuis les paramètres

### 3. Configuration des variables d'environnement

Créez ou modifiez le fichier `.env.local` avec votre vrai App ID :

```env
NEXT_PUBLIC_PRIVY_APP_ID=votre-vrai-app-id-ici
NEXT_PUBLIC_CONTRACT_ADDRESS=0xd7ece5177d3b3ad4e26cd9f65facb525eae0afe6
NEXT_PUBLIC_CHILIZ_RPC=https://spicy-rpc.chiliz.com/
NEXT_PUBLIC_CHAIN_ID=88882
```

### 4. Configuration du domaine dans Privy

Dans le dashboard Privy :
1. Allez dans **Settings** > **Domains**
2. Ajoutez ces domaines autorisés :
   - `http://localhost:3000`
   - `http://localhost:3001`
   - `https://votre-domaine.com` (si déployé)

### 5. Méthodes de connexion

Dans **Settings** > **Login methods**, activez :
- ✅ **Email**
- ✅ **Wallet** (MetaMask, WalletConnect, etc.)
- ✅ **Embedded wallets** (optionnel)

### 6. Configuration des réseaux supportés

Dans **Settings** > **Networks**, vous pouvez ajouter Chiliz Spicy Testnet :
- **Chain ID**: 88882
- **RPC URL**: https://spicy-rpc.chiliz.com/
- **Currency**: CHZ

## 🔧 Dépannage

### Erreur "Invalid Privy app ID"

1. Vérifiez que votre App ID est correct dans `.env.local`
2. Redémarrez le serveur : `npm run dev`
3. Vérifiez que les domaines sont configurés dans Privy

### L'app fonctionne avec MetaMask seulement

C'est normal ! Le code a un fallback vers MetaMask si Privy ne fonctionne pas.
Vous pouvez utiliser l'app même sans Privy configuré.

### Test de l'App ID

Vous pouvez tester si votre App ID est valide en visitant :
```
https://auth.privy.io/api/v1/apps/VOTRE_APP_ID/jwks.json
```

Si ça retourne du JSON, votre App ID est valide.

## 📱 Utilisation

Une fois configuré :
1. Démarrez l'app : `npm run dev`
2. Connectez-vous avec Privy ou MetaMask
3. Changez vers le réseau Chiliz Spicy Testnet
4. Mintez votre NFT SOKAI !

## 🆘 Support

Si vous avez des problèmes :
1. Vérifiez les logs de la console
2. Assurez-vous que `.env.local` est correct
3. Redémarrez le serveur
4. Contactez le support Privy si nécessaire
