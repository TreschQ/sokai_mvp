'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import SokaiCard from '../SokaiCard'
import SokaiABI from '../../../abis/SokaiSBT_abi.json'

interface SokaiPlayerCardProps {
  walletAddress: string
  contractAddress: string
}

interface PlayerStats {
  score: number
  timeSpent: number
  exercise: string
  date: string
  userId: string
  imageURI: string
}

export default function SokaiPlayerCard({ walletAddress, contractAddress }: SokaiPlayerCardProps) {
  const [tokenId, setTokenId] = useState<string | null>(null)
  const [stats, setStats] = useState<PlayerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (walletAddress && contractAddress) {
      findUserTokenIdAndStats()
    }
  }, [walletAddress, contractAddress])

  const findUserTokenIdAndStats = async () => {
    try {
      setLoading(true)
      setError('')

      if (!window.ethereum) {
        setError('Wallet provider non disponible')
        return
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(contractAddress, SokaiABI, provider)
      
      const balance = await contract.balanceOf(walletAddress)
      
      if (balance === BigInt(0)) {
        setError('Aucun SBT trouvé pour ce wallet')
        return
      }

      let foundTokenId = null
      
      for (let i = 1; i <= 1000; i++) {
        try {
          const owner = await contract.ownerOf(i)
          if (owner.toLowerCase() === walletAddress.toLowerCase()) {
            foundTokenId = i.toString()
            break
          }
        } catch (e) {
          continue
        }
      }

      if (!foundTokenId) {
        setError('Token ID introuvable pour ce wallet')
        return
      }

      setTokenId(foundTokenId)

      // Récupérer les stats du token
      const tokenURI = await contract.tokenURI(foundTokenId)

      if (tokenURI.startsWith("data:application/json;utf8,")) {
        const jsonData = tokenURI.replace("data:application/json;utf8,", "")
        const metadata = JSON.parse(jsonData)

        const attributes = metadata.attributes || []
        const statsData: PlayerStats = {
          score: attributes.find((attr: any) => attr.trait_type === "Score")?.value || 0,
          timeSpent: attributes.find((attr: any) => attr.trait_type === "Total Time")?.value || 0,
          exercise: attributes.find((attr: any) => attr.trait_type === "Exercise")?.value || "",
          date: attributes.find((attr: any) => attr.trait_type === "Date")?.value || "",
          userId: attributes.find((attr: any) => attr.trait_type === "Player")?.value || "",
          imageURI: metadata.image || "",
        }

        setStats(statsData)
      } else {
        throw new Error("Invalid token URI format")
      }

    } catch (err: any) {
      console.error('Error finding token ID and stats:', err)
      setError(err.message || 'Erreur lors de la recherche du token')
    } finally {
      setLoading(false)
    }
  }

  // Convert seconds to minutes with decimal precision
  const formatMinutes = (totalSeconds: number): number => {
    return Math.round((totalSeconds / 60) * 10) / 10 // Arrondi à 1 décimale
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

  if (!tokenId || !stats) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-500 rounded-xl p-6 text-center">
        <div className="text-yellow-200 mb-2">⚠️ Aucune SOKAI Card trouvée</div>
        <div className="text-yellow-300 text-sm">Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</div>
      </div>
    )
  }

  return (
    <SokaiCard 
      minutesPlayed={formatMinutes(stats.timeSpent)}
      gamesPlayed={5} // Valeur par défaut pour l'instant
      score={stats.score}
    />
  )
}