'use client'

import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { usePrivy } from '@privy-io/react-auth'
import { useMetaMask } from '../wallet/WalletProvider'
import SokaiABI from '../../../abis/SokaiSBT_abi.json'
import PlayerCard from './PlayerCard'

interface ExistingPlayerCardProps {
  isConnected: boolean
}

export default function ExistingPlayerCard({ isConnected }: ExistingPlayerCardProps) {
  const { user } = usePrivy()
  const { metamaskProvider } = useMetaMask()
  const [tokenId, setTokenId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [hasExistingCard, setHasExistingCard] = useState(false)

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!
  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID!)

  const getProvider = useCallback(async () => {
    if (user?.wallet) {
      return new ethers.BrowserProvider(window.ethereum)
    } else if (metamaskProvider) {
      return new ethers.BrowserProvider(metamaskProvider)
    }
    throw new Error('No wallet provider found')
  }, [user, metamaskProvider])

  const fetchExistingCard = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const provider = await getProvider()
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()
      
      const network = await provider.getNetwork()
      if (Number(network.chainId) !== chainId) {
        console.log(`Not on Chiliz Spicy Testnet (Chain ID: ${chainId})`)
        return
      }

      const contract = new ethers.Contract(contractAddress, SokaiABI, signer)
      
      const hasMinted = await contract.hasMinted(userAddress)
      console.log('Has minted:', hasMinted)
      
      if (!hasMinted) {
        setHasExistingCard(false)
        setTokenId('')
        return
      }

      const filter = contract.filters.Minted(null, userAddress)
      const events = await contract.queryFilter(filter, 0, 'latest')
      
      if (events.length > 0) {
        const latestEvent = events[events.length - 1]
        const eventTokenId = (latestEvent as any).args?.tokenId
        
        if (eventTokenId) {
          setTokenId(eventTokenId.toString())
          setHasExistingCard(true)
          console.log('Found existing token ID:', eventTokenId.toString())
        }
      }
      
    } catch (error: any) {
      console.error('Error fetching existing card:', error)
      setError(`Error loading your SOKAI card: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }, [contractAddress, chainId, getProvider])

  useEffect(() => {
    if (isConnected) {
      fetchExistingCard()
    } else {
      setHasExistingCard(false)
      setTokenId('')
      setError('')
    }
  }, [isConnected, fetchExistingCard])

  if (!isConnected) {
    return null
  }

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading your SOKAI card...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mb-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={fetchExistingCard}
            className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (!hasExistingCard || !tokenId) {
    return null
  }

  return (
    <div className="max-w-md mx-auto mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        🎯 Your SOKAI Card
      </h3>
      <PlayerCard 
        tokenId={tokenId}
        contractAddress={contractAddress}
      />
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          ✅ You already have a SOKAI SBT! This wallet cannot mint another one.
        </p>
      </div>
    </div>
  )
}
