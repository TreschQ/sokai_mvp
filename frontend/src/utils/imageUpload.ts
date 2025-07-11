// Service pour uploader les images générées
// Utilise un service simple pour le hackathon - en production utilisez IPFS

export const uploadImageToService = async (imageDataUrl: string): Promise<string> => {
  try {
    // Pour le hackathon, on peut utiliser un service simple comme imgbb ou similar
    // Ou stocker temporairement en base64 pour la démo
    
    // Option 1: Retourner directement le data URL pour la démo
    return imageDataUrl;
    
    // Option 2: Pour production, vous pouvez utiliser IPFS, AWS S3, etc.
    /*
    const formData = new FormData();
    const blob = await (await fetch(imageDataUrl)).blob();
    formData.append('image', blob, 'nft-image.png');
    
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    const { url } = await response.json();
    return url;
    */
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Fonction utilitaire pour générer les métadonnées JSON
export const generateNFTMetadata = (
  score: number,
  timeSpent: number,
  exercise: string,
  date: string,
  userId: string,
  imageUrl: string
) => {
  return {
    name: `SOKAI ${exercise} Performance`,
    description: `SOKAI Soulbound NFT representing a ${exercise} performance with a score of ${score}/100`,
    image: imageUrl,
    attributes: [
      {
        trait_type: "Exercise",
        value: exercise
      },
      {
        trait_type: "Score",
        value: score,
        max_value: 100
      },
      {
        trait_type: "Time Spent",
        value: timeSpent,
        display_type: "number"
      },
      {
        trait_type: "Date",
        value: date
      },
      {
        trait_type: "Player ID",
        value: userId
      },
      {
        trait_type: "Sport",
        value: "Football"
      }
    ],
    external_url: "https://sokai.app",
    background_color: "1e40af"
  };
};
