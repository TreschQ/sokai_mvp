// Configuration des adresses et constantes pour l'application
export const ADMIN_WALLET_ADDRESS = "0xbE26738753aB8A8B7ca9CA4407f576c23097A114";

// Fonction utilitaire pour vérifier si une adresse est l'admin
export const isAdminWallet = (address: string): boolean => {
  return address.toLowerCase() === ADMIN_WALLET_ADDRESS.toLowerCase();
};

// Configuration du contrat (peut être étendu plus tard)
export const CONTRACT_CONFIG = {
  ADMIN_ADDRESS: ADMIN_WALLET_ADDRESS,
  // Autres configurations peuvent être ajoutées ici
};
