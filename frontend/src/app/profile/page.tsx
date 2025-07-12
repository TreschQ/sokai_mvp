'use client'


import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useActiveWallet } from "thirdweb/react";
import PlayerCard from '@/components/nft/PlayerCard'
import BottomBar from '@/components/BottomBar'


function ProfilePage() {
  // Détection Privy et Thirdweb
  const { user, logout: privyLogout } = usePrivy();
  const thirdwebWallet = useActiveWallet();
  const [thirdwebAddress, setThirdwebAddress] = useState<string | null>(null);
  useEffect(() => {
    if (thirdwebWallet && typeof thirdwebWallet === 'object') {
      // Essayons les propriétés courantes
      // @ts-ignore
      setThirdwebAddress(thirdwebWallet.address || thirdwebWallet.data?.address || null);
    } else {
      setThirdwebAddress(null);
    }
  }, [thirdwebWallet]);
  const isConnected = !!(user?.wallet || thirdwebAddress);
  const handlePrivyLogout = async () => {
    try {
      await privyLogout();
      window.location.reload();
    } catch (e) {
      console.error('Privy logout error:', e);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-[#23272F] to-[#444857] w-full px-2 py-6">
      <header className="flex items-center justify-between w-full max-w-xs mx-auto">
        <h1 className="text-base font-bold text-white text-center flex-1">My SOKAI PASSPORT</h1>
      </header>
      <div className="flex flex-col items-center justify-center flex-1 w-full -mt-16 gap-4">
        {/* Bouton temporaire pour déconnexion Privy */}
        {user?.wallet && (
          <button
            onClick={handlePrivyLogout}
            className="rounded-full bg-red-600 text-white px-4 py-2 text-sm font-semibold shadow focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
          >
            Disconnect Privy (temporaire)
          </button>
        )}
        {/* Affiche le PlayerCard si connecté, sinon un message d'invite */}
        {isConnected ? (
          <div className="w-full max-w-xs mx-auto">
            <PlayerCard tokenId={"1"} contractAddress={process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!} />
          </div>
        ) : (
          <p className="text-white text-center">Connecte ton wallet Socios ou Metamask pour voir ta carte SOKAI.</p>
        )}
      </div>
      <BottomBar />
    </main>
  )
}

export default ProfilePage
