// Configuration des images personnalisées pour les NFTs
// Permet de remplacer les images du contrat sans redéploiement

export interface ImageOverride {
  originalImageURI: string;
  newImageURI: string;
  updatedAt: string;
  reason?: string;
}

// Mapping des remplacements d'images par token ID
export const IMAGE_OVERRIDES: Record<string, ImageOverride> = {
  // Exemple d'utilisation :
  // "1": {
  //   originalImageURI: "ancienne_url",
  //   newImageURI: "nouvelle_url", 
  //   updatedAt: "2025-07-11T12:00:00Z",
  //   reason: "Mise à jour de l'image"
  // }
};

// Mapping par User ID (plus pratique pour votre cas)
export const USER_IMAGE_OVERRIDES: Record<string, ImageOverride> = {
  "0197f9b7-7876-75ce-a88e-eeb88a0aba28": {
    originalImageURI: "", // Sera rempli automatiquement
    newImageURI: "https://maroon-rapid-marten-423.mypinata.cloud/ipfs/bafkreiegstt4r3z3dxkxhhqliyaopotgc2f6tr265ulqnlzqddexiygery?pinataGatewayToken=IrdARsrQqs2JC3EhSZyQ5hg_8-AQTUNoNzDcuFKVDsVU6xFickDa3QT-Dv2jp6e8",
    updatedAt: "2025-07-11T12:00:00Z",
    reason: "Nouvelle image NFT hébergée sur IPFS"
  }
};

/**
 * Obtient l'image finale à afficher pour un NFT
 * @param tokenId ID du token
 * @param userId ID de l'utilisateur (depuis les métadonnées du NFT)
 * @param originalImageURI URI de l'image originale du contrat
 * @returns L'URI de l'image à afficher (surchargée ou originale)
 */
export function getDisplayImageURI(
  tokenId: string, 
  userId: string | undefined, 
  originalImageURI: string
): string {
  // Vérifier d'abord par token ID
  const tokenOverride = IMAGE_OVERRIDES[tokenId];
  if (tokenOverride) {
    console.log(`🔄 Image override found for token ${tokenId}`);
    return tokenOverride.newImageURI;
  }

  // Vérifier ensuite par User ID
  if (userId) {
    const userOverride = USER_IMAGE_OVERRIDES[userId];
    if (userOverride) {
      console.log(`🔄 Image override found for user ${userId}`);
      return userOverride.newImageURI;
    }
  }

  // Retourner l'image originale si aucun remplacement
  return originalImageURI;
}

/**
 * Ajoute ou met à jour un remplacement d'image pour un token ID
 */
export function setTokenImageOverride(
  tokenId: string, 
  originalImageURI: string, 
  newImageURI: string, 
  reason?: string
): void {
  IMAGE_OVERRIDES[tokenId] = {
    originalImageURI,
    newImageURI,
    updatedAt: new Date().toISOString(),
    reason
  };
  console.log(`✅ Image override set for token ${tokenId}`);
}

/**
 * Ajoute ou met à jour un remplacement d'image pour un User ID
 */
export function setUserImageOverride(
  userId: string, 
  originalImageURI: string, 
  newImageURI: string, 
  reason?: string
): void {
  USER_IMAGE_OVERRIDES[userId] = {
    originalImageURI,
    newImageURI,
    updatedAt: new Date().toISOString(),
    reason
  };
  console.log(`✅ Image override set for user ${userId}`);
}

/**
 * Supprime un remplacement d'image
 */
export function removeImageOverride(tokenId: string): void {
  delete IMAGE_OVERRIDES[tokenId];
  console.log(`🗑️ Image override removed for token ${tokenId}`);
}

/**
 * Supprime un remplacement d'image par User ID
 */
export function removeUserImageOverride(userId: string): void {
  delete USER_IMAGE_OVERRIDES[userId];
  console.log(`🗑️ Image override removed for user ${userId}`);
}

/**
 * Obtient les informations de remplacement pour un token
 */
export function getImageOverrideInfo(tokenId: string, userId?: string): ImageOverride | null {
  return IMAGE_OVERRIDES[tokenId] || (userId ? USER_IMAGE_OVERRIDES[userId] : null) || null;
}
