# 🔄 Guide de Remplacement d'Images NFT Côté Frontend

## 📋 Solution Mise en Place

Cette solution permet de mettre à jour les images des NFTs **côté frontend** sans avoir besoin de redéployer le contrat blockchain. C'est parfait pour votre cas d'usage !

## 🏗️ Architecture

### Fichiers Créés :

1. **`src/utils/imageOverrides.ts`** - Logique de gestion des remplacements d'images
2. **`src/components/ImageOverrideAdmin.tsx`** - Interface d'administration
3. **`src/components/NFTDisplayWithImageOverride.tsx`** - Version améliorée du composant NFT
4. **`src/app/admin/page.tsx`** - Page d'administration

## 🚀 Comment Utiliser

### 1. Accéder à l'Interface d'Administration

Naviguez vers : `http://localhost:3000/admin`

### 2. Mettre à Jour l'Image pour Votre Cas

Dans l'interface admin :

- **Onglet** : "Par User ID"
- **User ID** : `0197f9b7-7876-75ce-a88e-eeb88a0aba28`
- **Nouvelle URL** : `https://maroon-rapid-marten-423.mypinata.cloud/ipfs/bafkreiegstt4r3z3dxkxhhqliyaopotgc2f6tr265ulqnlzqddexiygery?pinataGatewayToken=IrdARsrQqs2JC3EhSZyQ5hg_8-AQTUNoNzDcuFKVDsVU6xFickDa3QT-Dv2jp6e8`
- **Raison** : "Nouvelle image NFT hébergée sur IPFS"

Cliquez sur "Mettre à jour l'image".

### 3. Utiliser le Nouveau Composant NFT

Remplacez l'ancien composant `NFTDisplay` par `NFTDisplayWithImageOverride` dans vos pages :

```tsx
import NFTDisplayWithImageOverride from '../components/NFTDisplayWithImageOverride'

// Au lieu de :
// <NFTDisplay tokenId={tokenId} contractAddress={contractAddress} />

// Utilisez :
<NFTDisplayWithImageOverride tokenId={tokenId} contractAddress={contractAddress} />
```

## 🔧 Comment ça Fonctionne

### 1. Configuration des Remplacements

Le fichier `imageOverrides.ts` contient :
- `USER_IMAGE_OVERRIDES` - Remplacements par User ID
- `IMAGE_OVERRIDES` - Remplacements par Token ID

### 2. Logique de Résolution

Quand un NFT est affiché :
1. Le composant récupère les métadonnées du contrat
2. Il vérifie s'il existe un remplacement d'image pour ce User ID ou Token ID
3. Si oui, il affiche la nouvelle image
4. Si non, il affiche l'image originale du contrat

### 3. Stockage

Les remplacements sont stockés :
- **En développement** : Dans le fichier TypeScript (redémarrage requis)
- **En production** : Peut être étendu avec localStorage ou une base de données

## ✅ Avantages

- **Zéro coût en gaz** - Aucune transaction blockchain
- **Changements instantanés** - Pas de temps d'attente
- **Réversible** - Peut être annulé facilement
- **Flexible** - Support par User ID et Token ID

## 🎯 Pour Votre Cas Spécifique

Votre NFT avec :
- **User ID** : `0197f9b7-7876-75ce-a88e-eeb88a0aba28`
- **Nouvelle image** : Déjà configurée dans le système

Sera automatiquement affiché avec la nouvelle image une fois configuré !

## 📝 Étapes de Mise en Production

### 1. Tester en Local

```bash
cd /Users/tyha/projects-tyha/hackathon/sokai-chiliz
npm run dev
```

Accédez à `http://localhost:3000/admin`

### 2. Remplacer les Composants

Dans vos pages existantes, remplacez `NFTDisplay` par `NFTDisplayWithImageOverride`.

### 3. Configuration Permanente

Pour que le remplacement soit permanent, il est déjà ajouté dans `USER_IMAGE_OVERRIDES` pour votre User ID.

## 🔄 Extensions Possibles

### Stockage Persistant

```typescript
// Dans imageOverrides.ts, vous pouvez ajouter :
const saveToLocalStorage = () => {
  localStorage.setItem('imageOverrides', JSON.stringify(USER_IMAGE_OVERRIDES))
}

const loadFromLocalStorage = () => {
  const saved = localStorage.getItem('imageOverrides')
  if (saved) {
    Object.assign(USER_IMAGE_OVERRIDES, JSON.parse(saved))
  }
}
```

### API Backend

```typescript
// Remplacer par des appels API
const saveImageOverride = async (userId: string, imageURI: string) => {
  await fetch('/api/image-overrides', {
    method: 'POST',
    body: JSON.stringify({ userId, imageURI })
  })
}
```

## 🎉 Résultat

Votre NFT affichera maintenant la nouvelle image hébergée sur IPFS sans aucune modification du contrat blockchain ! 

L'interface indiquera clairement que l'image a été mise à jour avec un indicateur visuel et les détails de la modification.
