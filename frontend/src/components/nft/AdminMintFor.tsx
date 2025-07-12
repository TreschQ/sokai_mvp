'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import { usePrivy } from '@privy-io/react-auth'
import { useMetaMask } from '../wallet/WalletProvider'
import SokaiABI from '../../../abis/SokaiSBT_abi.json'
import { isAdminWallet } from '../../utils/constants'

interface AdminMintForProps {
  contractAddress: string
  chainId: number
}

interface FormData {
  targetAddress: string
  score: string
  timeSpent: string
  exercise: string
  date: string
  userId: string
  imageURI: string
}

export default function AdminMintFor({ contractAddress, chainId }: AdminMintForProps) {
  const { user } = usePrivy()
  const { metamaskProvider } = useMetaMask()
  const [formData, setFormData] = useState<FormData>({
    targetAddress: '',
    score: '85',
    timeSpent: '45',
    exercise: 'Touch & Dash',
    date: new Date().toISOString().split('T')[0],
    userId: '',
    imageURI: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState<string>('')
  const [tokenId, setTokenId] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [isAdmin, setIsAdmin] = useState<boolean>(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Auto-update userId when target address changes
    if (name === 'targetAddress' && value) {
      setFormData(prev => ({
        ...prev,
        userId: value
      }))
    }
  }

  const getProvider = async () => {
    if (user?.wallet) {
      return new ethers.BrowserProvider(window.ethereum)
    } else if (metamaskProvider) {
      return new ethers.BrowserProvider(metamaskProvider)
    }
    throw new Error('No wallet provider found')
  }

  const checkAdminStatus = async () => {
    try {
      const provider = await getProvider()
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()
      
      const adminStatus = isAdminWallet(userAddress)
      setIsAdmin(adminStatus)
      
      if (!adminStatus) {
        setError('❌ Vous devez être connecté avec le wallet admin pour utiliser cette fonctionnalité.')
      } else {
        setError('')
        setSuccess(`✅ Wallet admin connecté: ${userAddress}`)
      }
      
      return adminStatus
    } catch (error) {
      console.error('Error checking admin status:', error)
      setError('Erreur lors de la vérification du statut admin')
      return false
    }
  }

  const mintForUser = async () => {
    if (!await checkAdminStatus()) {
      return
    }

    if (!formData.targetAddress || !ethers.isAddress(formData.targetAddress)) {
      setError('Veuillez entrer une adresse de wallet valide')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      setSuccess('')
      setTxHash('')
      setTokenId('')
      
      const provider = await getProvider()
      const signer = await provider.getSigner()
      const adminAddress = await signer.getAddress()
      
      // Verify network
      const network = await provider.getNetwork()
      if (Number(network.chainId) !== chainId) {
        throw new Error(`Please switch to Chiliz Spicy Testnet (Chain ID: ${chainId})`)
      }

      const contract = new ethers.Contract(contractAddress, SokaiABI, signer)
      
      console.log('🔍 Admin Mint Analysis:')
      console.log('- Admin address:', adminAddress)
      console.log('- Target address:', formData.targetAddress)
      console.log('- Is admin wallet:', isAdminWallet(adminAddress))
      
      // Check if target address already has an NFT
      const targetBalance = await contract.balanceOf(formData.targetAddress)
      if (targetBalance > 0) {
        throw new Error('Cette adresse possède déjà un SOKAI SBT. Un seul par wallet autorisé.')
      }
      
      // Prepare transaction arguments for mintSokaiNFTFor
      const txArgs = [
        formData.targetAddress,
        parseInt(formData.score),
        parseInt(formData.timeSpent),
        formData.exercise.trim(),
        formData.date.trim(),
        formData.userId.trim(),
        formData.imageURI?.trim() || ""
      ]
      
      console.log('🚀 Minting NFT for user with args:', txArgs)
      
      // Static call first
      try {
        await contract.mintSokaiNFTFor.staticCall(...txArgs)
        console.log('✅ Static call successful')
      } catch (staticError: any) {
        console.error('❌ Static call failed:', staticError)
        throw new Error(`Transaction would fail: ${staticError.reason || staticError.message}`)
      }
      
      // Gas estimation
      const gasEstimate = await contract.mintSokaiNFTFor.estimateGas(...txArgs)
      console.log('Gas estimate:', gasEstimate.toString())
      
      // Execute transaction
      const tx = await contract.mintSokaiNFTFor(...txArgs)
      setTxHash(tx.hash)
      console.log('Transaction sent:', tx.hash)
      
      const receipt = await tx.wait()
      console.log('Transaction confirmed:', receipt)
      
      // Extract token ID from logs
      if (receipt.logs && receipt.logs.length > 0) {
        const tokenMintEvent = receipt.logs.find((log: any) => 
          log.topics && log.topics[0] === ethers.id('Transfer(address,address,uint256)')
        )
        if (tokenMintEvent) {
          const decodedTokenId = ethers.AbiCoder.defaultAbiCoder().decode(
            ['uint256'], 
            tokenMintEvent.topics[3]
          )[0]
          setTokenId(decodedTokenId.toString())
        }
      }
      
      setSuccess(`🎉 NFT minté avec succès pour ${formData.targetAddress}! Token ID: ${tokenId || 'Calculating...'}`)
      
      // Reset form
      setFormData({
        targetAddress: '',
        score: '85',
        timeSpent: '45',
        exercise: 'Touch & Dash',
        date: new Date().toISOString().split('T')[0],
        userId: '',
        imageURI: ''
      })

    } catch (err: any) {
      console.error('Admin mint error:', err)
      setError(err.message || 'Erreur lors du mint du NFT')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-purple-800 mb-4">
        👑 Mint Admin - Payer pour un autre utilisateur
      </h3>
      
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>ℹ️ Fonctionnalité:</strong> Permet au wallet admin de payer les frais de mint pour d&apos;autres utilisateurs qui n&apos;ont pas assez de CHZ.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adresse du destinataire *
          </label>
          <input
            type="text"
            name="targetAddress"
            value={formData.targetAddress}
            onChange={handleInputChange}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            User ID
          </label>
          <input
            type="text"
            name="userId"
            value={formData.userId}
            onChange={handleInputChange}
            placeholder="Auto-rempli avec l'adresse"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Score
          </label>
          <input
            type="number"
            name="score"
            value={formData.score}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Temps passé (secondes)
          </label>
          <input
            type="number"
            name="timeSpent"
            value={formData.timeSpent}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exercice
          </label>
          <input
            type="text"
            name="exercise"
            value={formData.exercise}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL de l&apos;image (optionnel)
        </label>
        <input
          type="url"
          name="imageURI"
          value={formData.imageURI}
          onChange={handleInputChange}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <button
          onClick={checkAdminStatus}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={isLoading}
        >
          🔍 Vérifier le statut admin
        </button>
        
        <button
          onClick={mintForUser}
          disabled={isLoading || !isAdmin}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
        >
          {isLoading ? '⏳ Mint en cours...' : '🎯 Minter pour cet utilisateur'}
        </button>
      </div>

      {txHash && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
          <p className="text-sm text-gray-700">
            <strong>Transaction:</strong>{' '}
            <a 
              href={`https://testnet.chiliscan.com/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {txHash}
            </a>
          </p>
          {tokenId && (
            <p className="text-sm text-gray-700 mt-1">
              <strong>Token ID:</strong> {tokenId}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
