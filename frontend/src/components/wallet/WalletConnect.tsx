
'use client'
import { useConnect, useActiveWallet } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { createWallet } from "thirdweb/wallets";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const WalletConnect = () => {
  const router = useRouter();
  const thirdwebWallet = useActiveWallet();
  const { connect, isConnecting, error } = useConnect();

  // Remplace par ton vrai clientId Thirdweb
  const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "your-client-id";
  const client = createThirdwebClient({ clientId });

  useEffect(() => {
    if (thirdwebWallet && typeof thirdwebWallet === 'object') {
      // @ts-ignore
      const address = thirdwebWallet.address || thirdwebWallet.data?.address;
      if (address) {
        router.push('/profile');
      }
    }
  }, [thirdwebWallet, router]);

  const handleSociosConnect = async () => {
    await connect(async () => {
      const wallet = createWallet("com.socios.app");
      await wallet.connect({
        client,
        walletConnect: { showQrModal: true },
      });
      return wallet;
    });
  };

  const handleMetaMaskConnect = async () => {
    await connect(async () => {
      const wallet = createWallet("io.metamask");
      await wallet.connect({
        client,
      });
      return wallet;
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-center text-gray-600 mb-4">
        <p>Connect your wallet to mint SOKAI NFTs</p>
      </div>
      <button
        onClick={handleSociosConnect}
        className="btn-primary w-full"
        disabled={isConnecting}
      >
        {isConnecting ? "Connecting..." : "Connect with Socios"}
      </button>
      <button
        onClick={handleMetaMaskConnect}
        className="btn-secondary w-full"
        disabled={isConnecting}
      >
        {isConnecting ? "Connecting..." : "Connect with MetaMask"}
      </button>
      {error && (
        <div className="text-red-600 text-sm mt-2">{error.message || String(error)}</div>
      )}
    </div>
  );
};

export default WalletConnect;
