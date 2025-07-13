'use client'

import { useEffect, useState, Suspense } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useSearchParams } from 'next/navigation'
import { useAutoMint } from '@/hooks/useAutoMint'
import { usePlayerScore } from '@/hooks/usePlayerScore'
import WalletPlayerCard from '@/components/nft/WalletPlayerCard'
import BottomBar from '@/components/BottomBar'
import Header from '@/components/Header'

function ProfileContent() {
  const { user, logout: privyLogout } = usePrivy()
  const searchParams = useSearchParams()
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Hook d'auto-mint qui gère tout automatiquement
  const { 
    isReady, 
    isLoading, 
    needsSetup, 
    noWallet,
    walletAddress, 
    tokenId,
    isMinting,
    refresh 
  } = useAutoMint()

  // Hook pour récupérer le score de performance
  const { score: performanceScore } = usePlayerScore({ 
    tokenId, 
    enabled: isReady && !!tokenId 
  })
  
  // Gestion du refresh depuis les paramètres URL
  useEffect(() => {
    const refreshParam = searchParams?.get('refresh')
    if (refreshParam === 'true') {
      setRefreshKey(prev => prev + 1)
      refresh() // Refresh les données SBT aussi
      // Nettoyer l'URL après le refresh
      window.history.replaceState({}, '', '/profile')
    }
  }, [searchParams, refresh])

  const handlePrivyLogout = async () => {
    try {
      await privyLogout()
      window.location.reload()
    } catch (e) {
      console.error('Privy logout error:', e)
    }
  }

  // Rendu conditionnel basé sur l'état
  const renderContent = () => {
    // Wallet connecté mais en cours de vérification/mint
    if (isLoading) {
      return (
        <div className="text-center">
          <div className="animate-pulse">
            <div className="text-white mb-2">
              {isMinting ? '🎨 Création de votre SOKAI Card...' : '🔄 Connexion au testnet...'}
            </div>
            <div className="text-green-200 text-sm">
              {isMinting ? 'Mint en cours, veuillez patienter...' : 'Vérification de votre SBT...'}
            </div>
            <div className="mt-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
            </div>
          </div>
        </div>
      )
    }

    // Wallet connecté mais erreur lors de la configuration
    if (needsSetup) {
      return (
        <div className="text-center">
          <p className="text-white mb-4">❌ Erreur lors de la création de votre SOKAI Card</p>
          <button 
            onClick={refresh}
            className="text-green-400 underline hover:text-green-300 transition-colors"
          >
            Réessayer
          </button>
        </div>
      )
    }

    // Wallet connecté et SBT prêt
    if (isReady && walletAddress && tokenId) {
      return (
        <div className="w-full max-w-xs mx-auto">
          <WalletPlayerCard 
            key={refreshKey}
            walletAddress={walletAddress}
            contractAddress={process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!}
          />
        </div>
      )
    }

    // Aucun wallet connecté
    if (noWallet) {
      return (
        <div className="text-center">
          <p className="text-white mb-4">Connecte ton wallet Socios ou MetaMask pour voir ta carte SOKAI.</p>
          <a 
            href="/" 
            className="text-green-400 underline hover:text-green-300 transition-colors"
          >
            Retour à l'accueil pour se connecter
          </a>
        </div>
      )
    }

    // Fallback - état indéterminé
    return (
      <div className="text-center">
        <div className="animate-pulse">
          <div className="text-white mb-2">🔄 Initialisation...</div>
          <div className="mt-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col justify-between bg-[#71E582] w-full px-2 py-6">
      <Header performanceScore={performanceScore} />
      
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
        
        {/* Debug info si nécessaire 
        {process.env.NODE_ENV === 'development' && walletAddress && (
          <div className="bg-blue-900/20 rounded-lg p-3 mb-4 w-full max-w-xs mx-auto text-xs">
            <div className="text-white">
              <div>Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</div>
              <div>Token ID: {tokenId || 'None'}</div>
              <div>Status: {isReady ? '✅ Ready' : isLoading ? '⏳ Loading' : '❌ Error'}</div>
            </div>
          </div>
        )}
          */}
        
        {renderContent()}
      </div>
      
      <BottomBar />
    </main>
  )
}

function ProfilePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#23272F] to-[#444857]">
        <div className="text-white">Loading...</div>
      </main>
    }>
      <ProfileContent />
    </Suspense>
  )
}

export default ProfilePage