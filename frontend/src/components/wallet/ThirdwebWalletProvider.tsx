import { ThirdwebProvider } from "thirdweb/react";

// Chiliz Spicy Testnet config
const chain = {
  chainId: 88882,
  rpc: [process.env.NEXT_PUBLIC_CHILIZ_RPC],
  nativeCurrency: {
    name: "Chiliz",
    symbol: "CHZ",
    decimals: 18,
  },
  shortName: "chzspicy",
  slug: "chiliz-spicy-testnet",
  testnet: true,
  chain: "CHILIZ-SPICY",
  name: "Chiliz Spicy Testnet",
};

type ThirdwebWalletProviderProps = {
  children: React.ReactNode;
};

export function ThirdwebWalletProvider({ children }: ThirdwebWalletProviderProps) {
  // Nettoyer les données WalletConnect expirées au démarrage
  if (typeof window !== 'undefined') {
    const cleanWalletConnect = () => {
      try {
        // Nettoyer les clés WalletConnect expirées
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('wc@2:') || key?.startsWith('wagmi.')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } catch (e) {
        console.log('WalletConnect cleanup failed:', e);
      }
    };
    
    // Nettoyer une seule fois au montage
    cleanWalletConnect();
  }

  return (
    <ThirdwebProvider>
      {children}
    </ThirdwebProvider>
  );
}
