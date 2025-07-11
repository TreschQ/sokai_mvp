'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { usePrivy } from '@privy-io/react-auth'
import { useMetaMask } from './WalletProvider'
import { isAdminWallet, ADMIN_WALLET_ADDRESS } from '../utils/constants'

interface WalletInfoProps {
  isConnected: boolean
}

export default function WalletInfo({ isConnected }: WalletInfoProps) {
  const { user } = usePrivy()
  const { metamaskProvider } = useMetaMask()
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [balance, setBalance] = useState<string>('')
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [chainId, setChainId] = useState<number>(0)

  const getProvider = async () => {
    if (user?.wallet) {
      return new ethers.BrowserProvider(window.ethereum)
    } else if (metamaskProvider) {
      return new ethers.BrowserProvider(metamaskProvider)
    }
    throw new Error('No wallet provider found')
  }

  const updateWalletInfo = async () => {
    if (!isConnected) {
      setWalletAddress('')
      setBalance('')
      setIsAdmin(false)
      setChainId(0)
      return
    }

    try {
      const provider = await getProvider()
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()
      
      // Get balance
      const balanceWei = await provider.getBalance(address)
      const balanceEth = ethers.formatEther(balanceWei)
      
      setWalletAddress(address)
      setBalance(balanceEth)
      setIsAdmin(isAdminWallet(address))
      setChainId(Number(network.chainId))
      
    } catch (error) {
      console.error('Error updating wallet info:', error)
    }
  }

  useEffect(() => {
    updateWalletInfo()
  }, [isConnected])

  if (!isConnected) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          💼 Informations du Wallet
        </h3>
        <p className="text-gray-500">Connectez votre wallet pour voir les informations</p>
      </div>
    )
  }

  return (
    <div className={`border rounded-lg p-4 ${isAdmin ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
      <h3 className="text-lg font-medium mb-4">
        {isAdmin ? '👑 Wallet Admin Connecté' : '💼 Informations du Wallet'}
      </h3>
      
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600">Adresse:</p>
          <p className="font-mono text-sm bg-white rounded p-2 border break-all">
            {walletAddress}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Solde CHZ:</p>
            <p className={`font-medium ${parseFloat(balance) < 0.01 ? 'text-red-600' : 'text-green-600'}`}>
              {parseFloat(balance).toFixed(4)} CHZ
            </p>
            {parseFloat(balance) < 0.01 && (
              <p className="text-xs text-red-500 mt-1">
                ⚠️ Solde insuffisant pour les transactions
              </p>
            )}
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Réseau:</p>
            <p className={`font-medium ${chainId === 88882 ? 'text-green-600' : 'text-red-600'}`}>
              {chainId === 88882 ? '✅ Chiliz Spicy' : `❌ Chain ${chainId}`}
            </p>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Statut:</p>
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                👑 Administrateur
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                👤 Utilisateur
              </span>
            )}
          </div>
        </div>
        
        {isAdmin && (
          <div className="mt-4 p-3 bg-purple-100 border border-purple-200 rounded">
            <p className="text-sm text-purple-800">
              <strong>🔧 Privilèges admin :</strong>
            </p>
            <ul className="text-xs text-purple-700 mt-1 space-y-1">
              <li>• Peut minter des NFTs pour d&apos;autres utilisateurs</li>
              <li>• Peut mettre à jour les statistiques des NFTs</li>
              <li>• Peut payer les frais de gas pour les utilisateurs</li>
            </ul>
          </div>
        )}
        
        {!isAdmin && parseFloat(balance) < 0.01 && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>💡 Conseil :</strong>
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Votre solde est insuffisant pour les transactions. 
              L&apos;admin peut minter un NFT pour vous sans frais !
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Admin attendu: {ADMIN_WALLET_ADDRESS.slice(0, 6)}...{ADMIN_WALLET_ADDRESS.slice(-4)}
        </p>
      </div>
    </div>
  )
}
