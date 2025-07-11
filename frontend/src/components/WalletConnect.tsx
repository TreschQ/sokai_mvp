'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { useMetaMask } from './WalletProvider'

interface WalletConnectProps {
  onConnectionChange: (connected: boolean) => void
}

export default function WalletConnect({ onConnectionChange }: WalletConnectProps) {
  const { ready, authenticated, login, logout, user } = usePrivy()
  const { metamaskProvider, isMetaMaskAvailable } = useMetaMask()
  const [metaMaskConnected, setMetaMaskConnected] = useState(false)
  const [metaMaskAccount, setMetaMaskAccount] = useState<string>('')
  const [isUsingMetaMask, setIsUsingMetaMask] = useState(false)

  console.log('Privy state:', { ready, authenticated, user: !!user })
  console.log('MetaMask available:', isMetaMaskAvailable)

  useEffect(() => {
    const connected = authenticated || metaMaskConnected
    onConnectionChange(connected)
  }, [authenticated, metaMaskConnected, onConnectionChange])

  const connectMetaMask = async () => {
    if (!metamaskProvider) {
      alert('MetaMask n\'est pas détecté. Veuillez installer MetaMask et désactiver temporairement Phantom.')
      return
    }
    
    try {
      const accounts = await metamaskProvider.request({
        method: 'eth_requestAccounts',
      })
      
      if (accounts.length > 0) {
        setMetaMaskAccount(accounts[0])
        setMetaMaskConnected(true)
        setIsUsingMetaMask(true)
        console.log('MetaMask connecté:', accounts[0])
      }
    } catch (error) {
      console.error('MetaMask connection failed:', error)
      alert('Erreur lors de la connexion à MetaMask')
    }
  }

  const disconnectMetaMask = () => {
    setMetaMaskConnected(false)
    setMetaMaskAccount('')
    setIsUsingMetaMask(false)
  }

  if (!ready) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded-lg"></div>
        <p className="text-center text-sm text-gray-500 mt-2">
          Chargement de Privy...
        </p>
      </div>
    )
  }

  if (authenticated && user) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-800 font-medium">Connected via Privy</span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            {user.wallet?.address || 'Wallet connected'}
          </p>
        </div>
        <button
          onClick={logout}
          className="btn-secondary w-full"
        >
          Disconnect Privy
        </button>
      </div>
    )
  }

  if (metaMaskConnected) {
    return (
      <div className="space-y-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-orange-800 font-medium">Connected via MetaMask</span>
          </div>
          <p className="text-orange-700 text-sm mt-1 break-all">
            {metaMaskAccount}
          </p>
        </div>
        <button
          onClick={disconnectMetaMask}
          className="btn-secondary w-full"
        >
          Disconnect MetaMask
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center text-gray-600 mb-4">
        <p>Connect your wallet to mint SOKAI NFTs</p>
      </div>
      
      <button
        onClick={login}
        className="btn-primary w-full"
      >
        Connect with Privy
      </button>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">or</span>
        </div>
      </div>
      
      <button
        onClick={connectMetaMask}
        className="btn-secondary w-full"
      >
        Connect with MetaMask (Fallback)
      </button>
    </div>
  )
}
