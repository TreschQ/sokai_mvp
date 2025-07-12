'use client'


import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useActiveWallet, useActiveAccount } from "thirdweb/react";
import WalletPlayerCard from '@/components/nft/WalletPlayerCard'
import BottomBar from '@/components/BottomBar'


function ProfilePage() {
  // Détection Privy et Thirdweb
  const { user, logout: privyLogout } = usePrivy();
  const thirdwebWallet = useActiveWallet();
  const thirdwebAccount = useActiveAccount();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    console.log('🔄 Profile page - checking wallet connection...');
    console.log('- Thirdweb account:', thirdwebAccount);
    console.log('- Thirdweb wallet:', thirdwebWallet);
    console.log('- Privy user:', user);
    
    // Récupération de l'adresse wallet
    let address = null;
    
    // Priorité à Thirdweb account
    if (thirdwebAccount?.address) {
      address = thirdwebAccount.address;
      console.log('✅ Connected with Thirdweb:', address);
    }
    // Fallback Privy
    else if (user?.wallet?.address) {
      address = user.wallet.address;
      console.log('✅ Connected with Privy:', address);
    }
    // Fallback wallet object direct
    else if (thirdwebWallet) {
      try {
        // @ts-ignore
        const walletAddr = thirdwebWallet.address || thirdwebWallet.data?.address;
        if (walletAddr) {
          address = walletAddr;
          console.log('✅ Connected with Thirdweb wallet direct:', address);
        }
      } catch (e) {
        console.log('❌ Error getting wallet address:', e);
      }
    }
    
    if (!address) {
      console.log('❌ No wallet connection found');
    }
    
    setWalletAddress(address);
    
    // Arrêter le loading si on a trouvé une adresse ou après 2 secondes
    if (address) {
      setIsLoading(false);
    } else {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [thirdwebAccount, user, thirdwebWallet]);
  
  const isConnected = !!walletAddress;
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
        
        {/* Debug info temporaire 
        <div className="bg-blue-900/20 rounded-lg p-3 mb-4 w-full max-w-xs mx-auto text-xs">
          <div className="text-white">
            <div>Thirdweb Account: {thirdwebAccount?.address ? '✅' : '❌'}</div>
            <div>Thirdweb Wallet: {thirdwebWallet ? '✅' : '❌'}</div>
            <div>Privy User: {user?.wallet?.address ? '✅' : '❌'}</div>
            <div>Final Address: {walletAddress || 'None'}</div>
            <div>Connected: {isConnected ? '✅' : '❌'}</div>
          </div>
        </div>
        */}
        
        {/* Affiche le PlayerCard si connecté, sinon un message d'invite */}
        {isLoading ? (
          <div className="text-center">
            <div className="animate-pulse">
              <div className="text-white mb-2">🔄 Vérification de la connexion wallet...</div>
              <div className="text-green-200 text-sm">Initialisation des providers...</div>
            </div>
          </div>
        ) : isConnected ? (
          <div className="w-full max-w-xs mx-auto">
            <WalletPlayerCard 
              walletAddress={walletAddress!}
              contractAddress={process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!}
            />
          </div>
        ) : (
          <div className="text-center">
            <p className="text-white mb-4">Connecte ton wallet Socios ou MetaMask pour voir ta carte SOKAI.</p>
            <a 
              href="/" 
              className="text-green-400 underline hover:text-green-300 transition-colors"
            >
              Retour à l'accueil pour se connecter
            </a>
          </div>
        )}
      </div>
      <BottomBar />
    </main>
  )
}

export default ProfilePage
