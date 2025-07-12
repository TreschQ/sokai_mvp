import { useCallback } from "react";
import { createThirdwebClient } from "thirdweb";
import { createWallet } from "thirdweb/wallets";

export function SociosConnectButton() {
  const handleSociosConnect = useCallback(async () => {
    const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID as string;
    const client = createThirdwebClient({ clientId });
    const wallet = createWallet("com.socios.app");
    await wallet.connect({
      client,
      walletConnect: { showQrModal: true },
    });
  }, []);

  return (
    <button
      onClick={handleSociosConnect}
      className="rounded-full bg-[#3AA93A] text-white px-8 py-3 text-lg font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-all w-full"
    >
      Connect Socios Wallet
    </button>
  );
}
