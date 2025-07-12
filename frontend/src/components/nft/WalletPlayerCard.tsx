'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import PlayerCard from './PlayerCard'
import SokaiABI from '../../../abis/SokaiSBT_abi.json'

interface WalletPlayerCardProps {
  walletAddress: string
  contractAddress: string
}

export default function WalletPlayerCard({ walletAddress, contractAddress }: WalletPlayerCardProps) {
  const [tokenId, setTokenId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (walletAddress && contractAddress) {
      findUserTokenId()
    }
  }, [walletAddress, contractAddress])

  const findUserTokenId = async () => {
    try {
      setLoading(true)
      setError('')

      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(contractAddress, SokaiABI, provider)
      
      // Vérifier d'abord le balance
      const balance = await contract.balanceOf(walletAddress)
      
      if (balance === BigInt(0)) {
        setError('Aucun SBT trouvé pour ce wallet')
        return
      }

      // Chercher le token ID en parcourant les tokens possibles
      // (méthode simple car on sait qu'il n'y a qu'un token par wallet)
      let foundTokenId = null
      
      // Essayer les premiers token IDs (ajustez selon vos besoins)
      for (let i = 1; i <= 1000; i++) {
        try {
          const owner = await contract.ownerOf(i)
          if (owner.toLowerCase() === walletAddress.toLowerCase()) {
            foundTokenId = i.toString()
            break
          }
        } catch (e) {
          // Token n'existe pas, continuer
          continue
        }
      }

      if (foundTokenId) {
        setTokenId(foundTokenId)
      } else {
        setError('Token ID introuvable pour ce wallet')
      }

    } catch (err: any) {
      console.error('Error finding token ID:', err)
      setError(err.message || 'Erreur lors de la recherche du token')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white/10 rounded-xl p-6 text-center">
        <div className="animate-pulse">
          <div className="text-white mb-2">🔍 Recherche de votre SOKAI Card...</div>
          <div className="text-green-200 text-sm">Analyse du wallet {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-xl p-6 text-center">
        <div className="text-red-200 mb-2">❌ {error}</div>
        <div className="text-red-300 text-sm">Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</div>
        <a 
          href="/" 
          className="inline-block mt-4 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Mint votre première SOKAI Card
        </a>
      </div>
    )
  }

  if (!tokenId) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-500 rounded-xl p-6 text-center">
        <div className="text-yellow-200 mb-2">⚠️ Aucune SOKAI Card trouvée</div>
        <div className="text-yellow-300 text-sm">Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</div>
      </div>
    )
  }

  return <PlayerCard tokenId={tokenId} contractAddress={contractAddress} />
}