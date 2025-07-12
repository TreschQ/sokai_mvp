import { useState } from "react";
import { useConnect } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { createWallet } from "thirdweb/wallets";

const SociosConnectButton = () => {
  const [error, setError] = useState<string | null>(null);
  const { connect, isConnecting } = useConnect();
  const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID as string;
  const client = createThirdwebClient({ clientId });

  const handleSociosConnect = async () => {
    setError(null);
    try {
      await connect(async () => {
        const wallet = createWallet("com.socios.app");
        await wallet.connect({
          client,
          walletConnect: { showQrModal: true },
        });
        return wallet;
      });
    } catch (e) {
      setError("Erreur de connexion Socios. Rafraîchissez la page et réessayez.");
      console.error(e);
    }
  };

  return (
    <>
      <button
        onClick={handleSociosConnect}
        className="rounded-full bg-[#3AA93A] text-white px-8 py-3 text-lg font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-all w-full"
        disabled={isConnecting}
      >
        {isConnecting ? "Connexion..." : "Connect Socios Wallet"}
      </button>
      {error && (
        <div className="text-red-600 text-sm mt-2">{error}</div>
      )}
    </>
  );
};

export default SociosConnectButton;
