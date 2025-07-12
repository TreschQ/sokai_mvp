'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import SokaiABI from '../../../abis/SokaiSBT_abi.json'

interface PlayerCardProps {
  tokenId: string
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

export default function PlayerCard({ tokenId, contractAddress }: PlayerCardProps) {
  const [stats, setStats] = useState<PlayerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (tokenId && contractAddress) {
      fetchPlayerStats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenId, contractAddress])

  const fetchPlayerStats = async () => {
    try {
      setLoading(true)
      setError('')
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(contractAddress, SokaiABI, provider)
      const tokenURI = await contract.tokenURI(tokenId)
      if (tokenURI.startsWith('data:application/json;utf8,')) {
        const jsonData = tokenURI.replace('data:application/json;utf8,', '')
        const metadata = JSON.parse(jsonData)
        const attributes = metadata.attributes || []
        const statsData: PlayerStats = {
          score: attributes.find((attr: any) => attr.trait_type === 'Score')?.value || 0,
          timeSpent: attributes.find((attr: any) => attr.trait_type === 'Total Time')?.value || 0,
          exercise: attributes.find((attr: any) => attr.trait_type === 'Exercise')?.value || '',
          date: attributes.find((attr: any) => attr.trait_type === 'Date')?.value || '',
          userId: attributes.find((attr: any) => attr.trait_type === 'Player')?.value || '',
          imageURI: metadata.image || ''
        }
        setStats(statsData)
      } else {
        throw new Error('Invalid token URI format')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load player stats')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-700 rounded w-32"></div>
              <div className="h-4 bg-gray-700 rounded w-24"></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-yellow-900 border border-yellow-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-yellow-200 mb-2">
          ⚠️ SBT Created Successfully!
        </h3>
        <p className="text-yellow-300 text-sm mb-2">
          Token ID: {tokenId}
        </p>
        <p className="text-yellow-400 text-xs">
          Error loading stats: {error}
        </p>
      </div>
    )
  }

  if (!stats) return null

  // Score color based on performance
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-900 border-green-700'
    if (score >= 60) return 'text-yellow-300 bg-yellow-900 border-yellow-700'
    return 'text-red-300 bg-red-900 border-red-700'
  }

  // Utility function to truncate address
  const truncateAddress = (address: string): string => {
    if (!address) return ''
    if (address.length <= 10) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 shadow-sm text-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">
          🏆 SOKAI Player Card
        </h3>
        <div className="text-sm text-gray-300">
          Token #{tokenId}
        </div>
      </div>
      {/* Player Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative">
          {stats.imageURI ? (
            <img
              src={stats.imageURI}
              alt={`${stats.userId} profile`}
              className="w-16 h-16 rounded-full object-cover border-4 border-gray-700"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = `https://ui-avatars.com/api/?name=${stats.userId}&background=3b82f6&color=fff&size=64`
              }}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-green-700 flex items-center justify-center border-4 border-gray-700">
              <span className="text-white font-bold text-xl">
                {stats.userId.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-white text-xs">⚽</span>
          </div>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white">
            {truncateAddress(stats.userId)}
          </h4>
          <p className="text-sm text-gray-300">
            Football Player
          </p>
        </div>
      </div>
      {/* Performance Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Score */}
        <div className={`p-4 rounded-lg border ${getScoreColor(stats.score)}`}>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {stats.score}
            </div>
            <div className="text-sm font-medium">
              Performance Score
            </div>
          </div>
        </div>
        {/* Time */}
        <div className="p-4 rounded-lg border bg-purple-900 border-purple-700 text-purple-300">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {stats.timeSpent}
            </div>
            <div className="text-sm font-medium">
              Minutes Played
            </div>
          </div>
        </div>
      </div>
      {/* Exercise Details */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center py-2 border-b border-gray-700">
          <span className="text-sm font-medium text-gray-300">Exercise</span>
          <span className="text-sm font-semibold text-white bg-gray-700 px-2 py-1 rounded">
            {stats.exercise}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-700">
          <span className="text-sm font-medium text-gray-300">Date</span>
          <span className="text-sm text-white">
            {new Date(stats.date).toLocaleDateString('fr-FR')}
          </span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-sm font-medium text-gray-300">Blockchain Proof</span>
          <span className="text-sm text-green-400 font-medium">
            ✅ Verified
          </span>
        </div>
      </div>
      {/* Actions */}
      <div className="flex space-x-3">
        <a
          href={`https://testnet.chiliscan.com/token/${contractAddress}?a=${tokenId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-[#3AA93A] hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-full transition-colors text-center"
        >
          View on Explorer 🔍
        </a>
        <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2 px-4 rounded-full transition-colors">
          Share Card 📤
        </button>
      </div>
    </div>
  )
}
