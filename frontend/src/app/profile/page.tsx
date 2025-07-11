'use client'

import { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import WalletConnect from '@/components/WalletConnect'
import ExistingPlayerCard from '@/components/ExistingPlayerCard'
import WalletInfo from '@/components/WalletInfo'
import NetworkChecker from '@/components/NetworkChecker'
import AutoMintNFT from '@/components/AutoMintNFT'

export default function Profile() {
  const { user, ready, authenticated, logout } = usePrivy()
  const router = useRouter()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (ready && !authenticated) {
      // Redirect to home if not authenticated
      router.push('/')
    }
  }, [ready, authenticated, router])

  useEffect(() => {
    setIsConnected(!!user?.wallet)
  }, [user])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="card max-w-md">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return null // Will redirect
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              👤 Mon Profil SOKAI
            </h1>
            <p className="text-lg text-gray-600">
              Gérez votre profil et consultez vos achievements blockchain
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Retour à l&apos;accueil
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Se déconnecter
            </button>
          </div>
        </div>

        {/* Network Checker */}
        <NetworkChecker />

        {/* Profile Overview */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          {/* User Info Card */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                  {user?.email ? String(user.email).charAt(0).toUpperCase() : (user?.wallet?.address?.slice(2, 4).toUpperCase() || '?')}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {user?.email ? String(user.email) : 'Utilisateur anonyme'}
                </h2>
                <p className="text-sm text-gray-600">
                  Membre SOKAI
                </p>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Statut</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    isConnected 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {isConnected ? '🟢 Connecté' : '🔴 Déconnecté'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Wallet</span>
                  <span className="text-sm text-gray-600">
                    {user?.wallet?.walletClientType || 'Non connecté'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Réseau</span>
                  <span className="text-sm text-gray-600">
                    Chiliz Spicy Testnet
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Connection & Info */}
          <div className="lg:col-span-2 space-y-6">
            {!isConnected && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🔗 Connecter votre Wallet
                </h3>
                <p className="text-gray-600 mb-4">
                  Connectez votre wallet pour accéder à toutes les fonctionnalités SOKAI
                </p>
                <WalletConnect onConnectionChange={setIsConnected} />
              </div>
            )}

            {isConnected && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  💼 Informations du Wallet
                </h3>
                <WalletInfo isConnected={isConnected} />
              </div>
            )}
          </div>
        </div>

        {/* Player Card Section */}
        <div className="card mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">
            🏆 Mes SOKAI NFTs
          </h3>
          <ExistingPlayerCard isConnected={isConnected} />
          {/* Auto-mint NFT pour test */}
          <div className="mt-8">
            <AutoMintNFT />
          </div>
        </div>

        {/* Achievement Section */}
        <div className="card mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">
            🎯 Mes Achievements
          </h3>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Achievement Cards */}
            <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  🥇
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Premier NFT</h4>
                  <p className="text-sm text-gray-600">Mint votre premier SOKAI SBT</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`h-2 rounded-full ${isConnected ? 'bg-yellow-500 w-full' : 'bg-gray-300 w-0'}`}></div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  ⚡
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Rapidité</h4>
                  <p className="text-sm text-gray-600">Score &gt; 80 points</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-gray-300 w-1/3"></div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  💪
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Endurance</h4>
                  <p className="text-sm text-gray-600">Temps &gt; 60 secondes</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-gray-300 w-2/3"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="card">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">
            ⚙️ Paramètres
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Notifications</h4>
                <p className="text-sm text-gray-600">Recevoir des notifications pour les nouveaux achievements</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Profil public</h4>
                <p className="text-sm text-gray-600">Rendre votre profil visible par d&apos;autres utilisateurs</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Sauvegarde automatique</h4>
                <p className="text-sm text-gray-600">Sauvegarder automatiquement vos scores sur la blockchain</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>SOKAI Profile • Powered by Chiliz Spicy Testnet</p>
        </div>
      </div>
    </main>
  )
}
