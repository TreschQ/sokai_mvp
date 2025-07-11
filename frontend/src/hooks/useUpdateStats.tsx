'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import SokaiABI from '../../abis/SokaiSBT_abi.json'

interface UpdateStatsParams {
  tokenId: string
  score: number
  timeSpent: number
  exercise: string
  date: string
}

export function useUpdateStats() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string>('')
  const [txHash, setTxHash] = useState<string>('')

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!
  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID!)

  const updateStats = async (params: UpdateStatsParams): Promise<boolean> => {
    try {
      setIsUpdating(true)
      setError('')
      setTxHash('')

      // Check if we have a wallet provider
      if (!window.ethereum) {
        throw new Error('No wallet provider found')
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      // Check network
      const network = await provider.getNetwork()
      if (Number(network.chainId) !== chainId) {
        throw new Error(`Please switch to Chiliz Spicy Testnet (Chain ID: ${chainId})`)
      }

      const contract = new ethers.Contract(contractAddress, SokaiABI, signer)
      
      // Call updateStats function (only admin or owner can call this)
      const tx = await contract.updateStats(
        params.tokenId,
        params.score,
        params.timeSpent,
        params.exercise,
        params.date
      )

      setTxHash(tx.hash)
      
      // Wait for transaction confirmation
      await tx.wait()
      
      console.log('Stats updated successfully:', tx.hash)
      return true

    } catch (err: any) {
      console.error('Update stats error:', err)
      setError(err.message || 'Failed to update stats')
      return false
    } finally {
      setIsUpdating(false)
    }
  }

  const resetState = () => {
    setError('')
    setTxHash('')
  }

  return {
    updateStats,
    isUpdating,
    error,
    txHash,
    resetState
  }
}
