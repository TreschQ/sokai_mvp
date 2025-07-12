import { ThirdwebProvider } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";

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
  return (
    <ThirdwebProvider
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
    >
      {children}
    </ThirdwebProvider>
  );
}
