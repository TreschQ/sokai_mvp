'use client'

import { useState } from 'react'
import WalletConnect from '@/components/WalletConnect'
import MintForm from '@/components/MintForm'
import NetworkChecker from '@/components/NetworkChecker'
import PrivyTest from '@/components/PrivyTest'
import ExistingPlayerCard from '@/components/ExistingPlayerCard'
import WalletInfo from '@/components/WalletInfo'
import AdminMintFor from '@/components/AdminMintFor'

export default function Home() {
  const [isConnected, setIsConnected] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🏆 SOKAI MVP
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Mint your Soulbound NFT on Chiliz Spicy Testnet. 
            Track your football journey with blockchain-verified achievements.
          </p>
        </div>

        {/* Network Checker */}
        <NetworkChecker />

        {/* Phantom/MetaMask Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
              ℹ️
            </div>
            <div>
              <h3 className="text-blue-800 font-medium mb-1">
                Problème détecté avec Phantom Wallet
              </h3>
              <p className="text-blue-700 text-sm">
                Si le bouton &quot;Switch Network&quot; ouvre Phantom au lieu de MetaMask, 
                désactivez temporairement Phantom dans vos extensions de navigateur : 
                <code className="bg-blue-100 px-1 rounded mx-1">chrome://extensions/</code>
              </p>
            </div>
          </div>
        </div>

        {/* Privy Debug Test */}
        <PrivyTest />

        {/* Existing Player Card - Show if user has already minted */}
        <ExistingPlayerCard isConnected={isConnected} />

        {/* Wallet Information */}
        <WalletInfo isConnected={isConnected} />

        {/* Admin Mint For - Only show if admin is connected */}
        <AdminMintFor 
          contractAddress={process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!}
          chainId={Number(process.env.NEXT_PUBLIC_CHAIN_ID!)}
        />

        {/* Main Content */}
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
          {/* Wallet Connection */}
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">Connect Wallet</h2>
            <WalletConnect 
              onConnectionChange={setIsConnected}
            />
          </div>

          {/* Mint Form */}
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">Mint SOKAI NFT</h2>
            <MintForm isConnected={isConnected} />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Built for hackathons • Powered by Chiliz Spicy Testnet</p>
        </div>
      </div>
    </main>
  )
}
