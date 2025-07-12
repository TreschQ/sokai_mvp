'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import SokaiABI from '../../../abis/SokaiSBT_abi.json'
import { getDisplayImageURI, getImageOverrideInfo } from '../../utils/imageOverrides'

interface NFTDisplayProps {
  tokenId: string
  contractAddress: string
}

interface NFTMetadata {
  name?: string
  description?: string
  image?: string
  attributes?: Array<{
    trait_type: string
    value: string | number
  }>
}

export default function NFTDisplay({ tokenId, contractAddress }: NFTDisplayProps) {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [playerStats, setPlayerStats] = useState<any>(null)

  const fetchNFTMetadata = async () => {
    try {
      setLoading(true)
      setError('')

      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(contractAddress, SokaiABI, provider)
      
      // Récupérer les stats du joueur pour obtenir l'userId
      const stats = await contract.getPlayerStats(tokenId)
      setPlayerStats(stats)
      
      const tokenURI = await contract.tokenURI(tokenId)
      
      if (tokenURI) {
        // Parse le JSON directement depuis le tokenURI si c'est un data URI
        let metadata: NFTMetadata
        
        if (tokenURI.startsWith('data:application/json;utf8,')) {
          const jsonData = tokenURI.substring('data:application/json;utf8,'.length)
          metadata = JSON.parse(jsonData)
        } else {
          // Fetch metadata from URI
          const response = await fetch(tokenURI)
          if (response.ok) {
            metadata = await response.json()
          } else {
            throw new Error('Failed to fetch metadata')
          }
        }

        // Appliquer le remplacement d'image si disponible
        if (metadata.image) {
          const displayImageURI = getDisplayImageURI(
            tokenId, 
            stats.userId, 
            metadata.image
          )
          
          // Si l'image a été remplacée, l'indiquer dans les métadonnées
          if (displayImageURI !== metadata.image) {
            metadata.image = displayImageURI
            console.log(`🔄 Image overridden for NFT ${tokenId}`)
          }
        }

        setMetadata(metadata)
      } else {
        setError('No token URI found')
      }
    } catch (err: any) {
      console.error('Error fetching NFT metadata:', err)
      setError(err.message || 'Failed to load NFT metadata')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tokenId && contractAddress) {
      fetchNFTMetadata()
    }
  }, [tokenId, contractAddress])

  if (loading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-40 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          ⚠️ NFT Minted Successfully!
        </h3>
        <p className="text-yellow-700 text-sm mb-2">
          Token ID: {tokenId}
        </p>
        <p className="text-yellow-600 text-xs">
          Note: {error}
        </p>
      </div>
    )
  }

  // Informations sur le remplacement d'image
  const imageOverrideInfo = playerStats ? getImageOverrideInfo(tokenId, playerStats.userId) : null

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-green-800 mb-4">
        🎉 Your SOKAI NFT is Ready!
      </h3>
      
      {/* Indicateur de remplacement d'image */}
      {imageOverrideInfo && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-blue-600">🔄</span>
            <span className="text-sm text-blue-800 font-medium">Image mise à jour</span>
          </div>
          {imageOverrideInfo.reason && (
            <p className="text-xs text-blue-700 mt-1">{imageOverrideInfo.reason}</p>
          )}
          <p className="text-xs text-blue-600 mt-1">
            Mise à jour le: {new Date(imageOverrideInfo.updatedAt).toLocaleDateString()}
          </p>
        </div>
      )}
      
      <div className="grid gap-4 md:grid-cols-2">
        {/* NFT Image */}
        {metadata?.image && (
          <div className="space-y-2">
            <img
              src={metadata.image}
              alt={metadata.name || 'SOKAI NFT'}
              className="w-full h-48 object-cover rounded-lg border"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
            {imageOverrideInfo && (
              <p className="text-xs text-gray-500 text-center">
                ✨ Image personnalisée affichée
              </p>
            )}
          </div>
        )}
        
        {/* NFT Details */}
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-gray-900">
              {metadata?.name || 'SOKAI Soulbound NFT'}
            </h4>
            <p className="text-sm text-gray-600">
              Token ID: {tokenId}
            </p>
            {playerStats && (
              <p className="text-xs text-gray-500">
                User ID: {playerStats.userId}
              </p>
            )}
          </div>
          
          {metadata?.description && (
            <p className="text-sm text-gray-700">
              {metadata.description}
            </p>
          )}
          
          {/* Attributes */}
          {metadata?.attributes && metadata.attributes.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Attributes:</h5>
              <div className="grid grid-cols-2 gap-2">
                {metadata.attributes.map((attr, index) => (
                  <div key={index} className="bg-white rounded px-3 py-2 border">
                    <div className="text-xs text-gray-500">{attr.trait_type}</div>
                    <div className="text-sm font-medium">{attr.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Links */}
          <div className="flex flex-col space-y-2 pt-2">
            <a
              href={`https://testnet.chiliscan.com/token/${contractAddress}?a=${tokenId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              View on Chiliz Explorer →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
