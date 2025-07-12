'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { usePrivy } from '@privy-io/react-auth'
import { useMetaMask } from '../wallet/WalletProvider'
import SokaiABI from '../../../abis/SokaiSBT_abi.json'
import NFTDisplay from './NFTDisplay'
import PlayerCard from '../PlayerCard'
import { isAdminWallet, ADMIN_WALLET_ADDRESS } from '../../utils/constants'

interface MintFormProps {
  isConnected: boolean
}

interface FormData {
  score: string
  timeSpent: string
  exercise: string
  date: string
  userId: string
  imageURI: string
}

export default function MintForm({ isConnected }: MintFormProps) {
  const { user } = usePrivy()
  const { metamaskProvider } = useMetaMask()
  const [formData, setFormData] = useState<FormData>({
    score: '85',
    timeSpent: '45',
    exercise: 'Touch & Dash',
    date: new Date().toISOString().split('T')[0],
    userId: 'player_demo_001',
    imageURI: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState<string>('')
  const [tokenId, setTokenId] = useState<string>('')
  const [error, setError] = useState<string>('')

  // Add debug info display
  const [debugInfo, setDebugInfo] = useState<string>('')

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID!)

  // Vérification de l'adresse du contrat
  if (!contractAddress || contractAddress === 'undefined' || contractAddress === 'null') {
    throw new Error('L\'adresse du contrat est manquante ou invalide. Vérifiez la variable NEXT_PUBLIC_CONTRACT_ADDRESS dans votre .env.local')
  }

  // Update userId when wallet connects
  useEffect(() => {
    if (isConnected) {
      updateUserIdFromWallet()
    }
  }, [isConnected])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const updateUserIdFromWallet = async () => {
    try {
      if (isConnected) {
        const provider = await getProvider()
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        
        setFormData(prev => ({
          ...prev,
          userId: address
        }))
        
        // Check if already minted
        const alreadyMinted = await checkIfAlreadyMinted()
        if (alreadyMinted) {
          setError('This wallet has already minted a SOKAI SBT. Only one per wallet is allowed.')
        }
      }
    } catch (error) {
      console.error('Error updating userId:', error)
    }
  }

  const getProvider = async () => {
    if (user?.wallet) {
      // Using Privy wallet
      return new ethers.BrowserProvider(window.ethereum)
    } else if (metamaskProvider) {
      // Using MetaMask specifically
      return new ethers.BrowserProvider(metamaskProvider)
    }
    throw new Error('No wallet provider found - MetaMask or Privy required')
  }

  const mintNFT = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      setTxHash('')
      
      const provider = await getProvider()
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()
      
      // Check network
      const network = await provider.getNetwork()
      if (Number(network.chainId) !== chainId) {
        throw new Error(`Please switch to Chiliz Spicy Testnet (Chain ID: ${chainId})`)
      }

      const contract = new ethers.Contract(contractAddress, SokaiABI, signer)
      
      // 🔍 Détection du type de wallet et logique de mint
      const isUserAdmin = isAdminWallet(userAddress)
      console.log('🔍 Wallet Analysis:')
      console.log('- User address:', userAddress)
      console.log('- Is admin wallet:', isUserAdmin)
      console.log('- Admin wallet address:', ADMIN_WALLET_ADDRESS)
      
      let targetAddress = userAddress // Par défaut, mint pour l'utilisateur connecté
      let mintFunction = 'mintSokaiNFT' // Fonction par défaut
      
      if (!isUserAdmin) {
        // Si ce n'est PAS le wallet admin, on utilise mintSokaiNFTFor
        // et on mint pour l'utilisateur connecté (mais payé par l'admin)
        console.log('🎯 Non-admin wallet detected: Using mintSokaiNFTFor')
        console.log('⚠️  Note: This requires the admin wallet to execute the transaction')
        
        // Vérifier si l'admin peut payer pour cet utilisateur
        // On garde la même adresse cible mais on change la méthode
        mintFunction = 'mintSokaiNFTFor'
        
        setError('⚠️ Wallet non-admin détecté. Cette fonctionnalité nécessite que le wallet admin execute la transaction. Veuillez vous connecter avec le wallet admin ou demander à l\'admin de minter pour vous.')
        return
      } else {
        console.log('� Admin wallet detected: Using standard mint or mintFor')
        
        // Si c'est l'admin, il peut soit:
        // 1. Minter pour lui-même avec mintSokaiNFT
        // 2. Minter pour quelqu'un d'autre avec mintSokaiNFTFor
        
        // Pour l'instant, on utilise mintSokaiNFT pour l'admin
        mintFunction = 'mintSokaiNFT'
      }
      
      console.log(`📝 Using function: ${mintFunction} for address: ${targetAddress}`)
      
      // Check if target wallet has already minted
      try {
        const targetBalance = await contract.balanceOf(targetAddress)
        console.log('Target balance:', targetBalance.toString())
        
        if (targetBalance > 0) {
          throw new Error('This wallet has already minted a SOKAI SBT. Only one per wallet is allowed.')
        }
        
        // Try static call first to get specific revert reason
        let staticCallArgs, gasEstimateArgs, txArgs
        
        if (mintFunction === 'mintSokaiNFTFor') {
          // Args pour mintSokaiNFTFor: (address to, uint256 score, uint256 timeSpent, string exercise, string date, string userId, string imageURI)
          staticCallArgs = gasEstimateArgs = txArgs = [
            targetAddress,
            parseInt(formData.score),
            parseInt(formData.timeSpent),
            formData.exercise.trim(),
            formData.date.trim(),
            formData.userId.trim(),
            formData.imageURI?.trim() || ""
          ]
        } else {
          // Args pour mintSokaiNFT: (uint256 score, uint256 timeSpent, string exercise, string date, string userId, string imageURI)
          staticCallArgs = gasEstimateArgs = txArgs = [
            parseInt(formData.score),
            parseInt(formData.timeSpent),
            formData.exercise.trim(),
            formData.date.trim(),
            formData.userId.trim(),
            formData.imageURI?.trim() || ""
          ]
        }
        
        try {
          await contract[mintFunction].staticCall(...staticCallArgs)
          console.log('✅ Static call successful - transaction should work')
        } catch (staticError: any) {
          console.error('❌ Static call failed:', staticError)
          
          // Try to get the actual revert reason
          if (staticError.data) {
            try {
              const decodedError = contract.interface.parseError(staticError.data)
              console.error('Decoded error:', decodedError)
              throw new Error(`Contract revert: ${decodedError?.name || decodedError?.args?.join(', ') || 'Unknown contract error'}`)
            } catch (decodeErr) {
              console.error('Could not decode error data:', staticError.data)
            }
          }
          
          // Extract revert reason from message
          if (staticError.reason) {
            throw new Error(`Contract revert: ${staticError.reason}`)
          }
          if (staticError.message.includes('revert')) {
            const revertMatch = staticError.message.match(/revert (.+?)(?:\s*\(|$)/)
            if (revertMatch) {
              throw new Error(`Contract revert: ${revertMatch[1]}`)
            }
          }
          
          throw new Error(`Transaction would fail: ${staticError.message || 'Unknown static call error'}`)
        }
        
        // Gas estimation
        const gasEstimate = await contract[mintFunction].estimateGas(...gasEstimateArgs)
        console.log('Gas estimate successful:', gasEstimate.toString())
        
      } catch (estimateError: any) {
        console.error('Gas estimation failed:', estimateError)
        
        // Common error scenarios
        if (estimateError.message.includes('One SBT per wallet')) {
          throw new Error('This wallet has already minted a SOKAI SBT. Only one per wallet is allowed.')
        }
        if (estimateError.message.includes('Not authorized')) {
          throw new Error('Not authorized to mint. Please check contract permissions.')
        }
        
        throw new Error(`Transaction would fail: ${estimateError.message || 'Unknown error'}`)
      }
      
      // Execute the transaction
      let finalTxArgs
      if (mintFunction === 'mintSokaiNFTFor') {
        finalTxArgs = [
          targetAddress,
          parseInt(formData.score),
          parseInt(formData.timeSpent),
          formData.exercise.trim(),
          formData.date.trim(),
          formData.userId.trim(),
          formData.imageURI?.trim() || ""
        ]
      } else {
        finalTxArgs = [
          parseInt(formData.score),
          parseInt(formData.timeSpent),
          formData.exercise.trim(),
          formData.date.trim(),
          formData.userId.trim(),
          formData.imageURI?.trim() || ""
        ]
      }
      
      console.log(`🚀 Executing ${mintFunction} with args:`, finalTxArgs)
      const tx = await contract[mintFunction](...finalTxArgs)

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

      // Reset form avec valeurs par défaut
      setFormData({
        score: '85',
        timeSpent: '45',
        exercise: 'Touch & Dash',
        date: new Date().toISOString().split('T')[0],
        userId: 'player_demo_001',
        imageURI: ''
      })

    } catch (err: any) {
      console.error('Mint error:', err)
      setError(err.message || 'Failed to mint NFT')
    } finally {
      setIsLoading(false)
    }
  }

  const checkIfAlreadyMinted = async () => {
    try {
      if (!metamaskProvider && !user?.wallet) return false
      
      const provider = await getProvider()
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()
      
      const contract = new ethers.Contract(contractAddress, SokaiABI, provider)
      
      // Check balance of user (should be 0 or 1 for SBT)
      const balance = await contract.balanceOf(userAddress)
      
      console.log('User balance:', balance.toString())
      return balance > 0
      
    } catch (error) {
      console.error('Error checking if already minted:', error)
      return false
    }
  }

  const checkContractInfo = async () => {
    try {
      const provider = await getProvider()
      const contract = new ethers.Contract(contractAddress, SokaiABI, provider)
      
      // Get contract name and symbol
      const name = await contract.name()
      const symbol = await contract.symbol()
      
      const info = `Contract: ${name} (${symbol}) at ${contractAddress}`
      console.log('Contract Info:', info)
      setDebugInfo(info)
      
      return { name, symbol }
    } catch (error) {
      console.error('Error checking contract:', error)
      setDebugInfo(`Error: ${error}`)
      return null
    }
  }

  const checkContractDetails = async () => {
    try {
      const provider = await getProvider()
      const contract = new ethers.Contract(contractAddress, SokaiABI, provider)
      
      console.log('=== CONTRACT DETAILS ===')
      console.log('Contract address:', contractAddress)
      console.log('Chain ID:', chainId)
      
      // Check if contract exists
      const code = await provider.getCode(contractAddress)
      console.log('Contract code exists:', code !== '0x')
      
      // Try to call some read functions
      try {
        const name = await contract.name()
        console.log('Contract name:', name)
      } catch (err) {
        console.error('Could not get contract name:', err)
      }
      
      try {
        const symbol = await contract.symbol()
        console.log('Contract symbol:', symbol)
      } catch (err) {
        console.error('Could not get contract symbol:', err)
      }
      
      try {
        const owner = await contract.owner()
        console.log('Contract owner:', owner)
      } catch (err) {
        console.error('Could not get contract owner:', err)
      }
      
      // If connected, check user balance
      if (isConnected) {
        const signer = await provider.getSigner()
        const userAddress = await signer.getAddress()
        
        try {
          const balance = await contract.balanceOf(userAddress)
          console.log('User balance:', balance.toString())
        } catch (err) {
          console.error('Could not get user balance:', err)
        }
      }
      
      console.log('=== END CONTRACT DETAILS ===')
    } catch (error) {
      console.error('Contract details check failed:', error)
    }
  }

  const checkOwnershipAndPermissions = async () => {
    try {
      const provider = await getProvider()
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(contractAddress, SokaiABI, provider)
      const userAddress = await signer.getAddress()
      
      console.log('=== OWNERSHIP & PERMISSIONS CHECK ===')
      
      try {
        const owner = await contract.owner()
        console.log('Contract owner:', owner)
        console.log('User address:', userAddress)
        console.log('Is owner:', owner.toLowerCase() === userAddress.toLowerCase())
        
        // Check if there's an admin role or similar
        try {
          // Some contracts have admin functions
          const hasAdminRole = await contract.hasRole?.(ethers.id("ADMIN_ROLE"), userAddress)
          console.log('Has admin role:', hasAdminRole)
        } catch {
          console.log('No admin role function found')
        }
        
        setDebugInfo(`Owner: ${owner}\nUser: ${userAddress}\nIs Owner: ${owner.toLowerCase() === userAddress.toLowerCase()}`)
        
      } catch (err) {
        console.error('Could not check ownership:', err)
        setDebugInfo('❌ Could not check contract ownership')
      }
      
      console.log('=== END OWNERSHIP CHECK ===')
      
    } catch (error: any) {
      console.error('Ownership check failed:', error)
      setDebugInfo(`❌ Ownership check failed: ${error.message}`)
    }
  }

  const debugTransactionData = (score: number, timeSpent: number, exercise: string, date: string, userId: string, imageURI: string) => {
    console.log('=== DEBUG TRANSACTION DATA ===')
    console.log('Score:', score, typeof score, 'Valid:', Number.isInteger(score) && score >= 0 && score <= 100)
    console.log('TimeSpent:', timeSpent, typeof timeSpent, 'Valid:', Number.isInteger(timeSpent) && timeSpent > 0)
    console.log('Exercise:', exercise, typeof exercise, 'Length:', exercise.length, 'Valid:', exercise.length > 0)
    console.log('Date:', date, typeof date, 'Length:', date.length, 'Valid:', date.length > 0)
    console.log('UserId:', userId, typeof userId, 'Length:', userId.length, 'Valid:', userId.length > 0)
    console.log('ImageURI:', imageURI, typeof imageURI, 'Length:', imageURI.length)
    
    // Vérifier les contraintes plus strictement
    const errors = []
    if (!Number.isInteger(score) || score < 0 || score > 100) errors.push(`❌ Score invalid: ${score}`)
    if (!Number.isInteger(timeSpent) || timeSpent < 1) errors.push(`❌ TimeSpent invalid: ${timeSpent}`)
    if (!exercise || exercise.trim().length === 0) errors.push('❌ Exercise empty')
    if (!date || date.trim().length === 0) errors.push('❌ Date empty')
    if (!userId || userId.trim().length === 0) errors.push('❌ UserId empty')
    
    if (errors.length > 0) {
      console.error('VALIDATION ERRORS:', errors)
    } else {
      console.log('✅ All parameters valid')
    }
    
    // Check if values would cause overflow in uint256
    if (score > Number.MAX_SAFE_INTEGER) console.error('❌ Score too large for uint256')
    if (timeSpent > Number.MAX_SAFE_INTEGER) console.error('❌ TimeSpent too large for uint256')
    
    console.log('=== END DEBUG ===')
  }

  const isFormValid = formData.score && formData.timeSpent && formData.exercise && 
                     formData.date && formData.userId

  const testMintWithMinimalData = async () => {
    try {
      const provider = await getProvider()
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(contractAddress, SokaiABI, signer)
      const userAddress = await signer.getAddress()
      
      console.log('🧪 Testing mint with minimal valid data...')
      
      // Minimal test data
      const testData = {
        score: 50,
        timeSpent: 30,
        exercise: "Test",
        date: "2024-01-01",
        userId: userAddress,
        imageURI: ""
      }
      
      console.log('Test data:', testData)
      
      // Check balance first
      const balance = await contract.balanceOf(userAddress)
      console.log('Current balance:', balance.toString())
      
      if (balance > 0) {
        setDebugInfo('❌ Cannot test - wallet already has SBT')
        return
      }
      
      // Try static call
      try {
        await contract.mintSokaiNFT.staticCall(
          testData.score,
          testData.timeSpent,
          testData.exercise,
          testData.date,
          testData.userId,
          testData.imageURI
        )
        setDebugInfo('✅ Test static call successful - contract logic OK')
      } catch (staticError: any) {
        console.error('Test static call failed:', staticError)
        setDebugInfo(`❌ Test failed: ${staticError.reason || staticError.message}`)
        
        // Try to parse the specific error
        if (staticError.data) {
          try {
            const iface = new ethers.Interface(SokaiABI)
            const decodedError = iface.parseError(staticError.data)
            console.error('Decoded test error:', decodedError)
            setDebugInfo(`❌ Contract error: ${decodedError?.name || 'Unknown'}`)
          } catch {
            console.error('Could not decode test error')
          }
        }
      }
      
    } catch (error: any) {
      console.error('Test mint failed:', error)
      setDebugInfo(`❌ Test setup failed: ${error.message}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Info Demo */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
            🎯
          </div>
          <div>
            <h3 className="text-blue-800 font-medium mb-1">
              Demo SOKAI - Soulbound Token
            </h3>
            <p className="text-blue-700 text-sm">
              Enregistrez vos performances sportives sur la blockchain Chiliz. 
              Les données sont immutables et prouvent votre activité physique !
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Score
          </label>
          <input
            type="number"
            name="score"
            value={formData.score}
            onChange={handleInputChange}
            placeholder="Touch & Dash exercise performance"
            className="input-field"
            min="0"
            max="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Spent (minutes)
          </label>
          <input
            type="number"
            name="timeSpent"
            value={formData.timeSpent}
            onChange={handleInputChange}
            placeholder="Touch & Dash session duration (minutes)"
            className="input-field"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Exercise Type
          </label>
          <input
            type="text"
            name="exercise"
            value={formData.exercise}
            onChange={handleInputChange}
            placeholder="Touch & Dash"
            className="input-field bg-gray-50"
            disabled
          />
          <p className="text-xs text-gray-500 mt-1">
            🎯 Exercise fixé pour la démo SOKAI
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Player ID
          </label>
          <input
            type="text"
            name="userId"
            value={formData.userId}
            onChange={handleInputChange}
            placeholder="Will be set to your wallet address"
            className="input-field"
          />
          <p className="text-xs text-gray-500 mt-1">
            🎮 Your wallet address will be used as Player ID
          </p>
          {isConnected && (
            <button
              type="button"
              onClick={updateUserIdFromWallet}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Use Connected Wallet Address
            </button>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Image URL (Optional)
          </label>
          <input
            type="url"
            name="imageURI"
            value={formData.imageURI}
            onChange={handleInputChange}
            placeholder="https://example.com/profile.jpg (leave empty for default)"
            className="input-field"
          />
          <p className="text-xs text-gray-500 mt-1">
            � Photo de profil du joueur (optionnel)
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Debug Section */}
      {isConnected && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">🔧 Debug Info</h4>
          <div className="space-y-2">
            <button
              type="button"
              onClick={checkContractInfo}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Test Contract Connection
            </button>
            <button
              type="button"
              onClick={async () => {
                const alreadyMinted = await checkIfAlreadyMinted()
                setDebugInfo(alreadyMinted ? 'Status: Already minted' : 'Status: Can mint')
              }}
              className="ml-4 text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Check Mint Status
            </button>
            <button
              type="button"
              onClick={checkContractDetails}
              className="ml-4 text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Check Contract Details
            </button>
            <button
              type="button"
              onClick={testMintWithMinimalData}
              className="ml-4 text-green-600 hover:text-green-800 text-sm underline"
            >
              Test Mint (Minimal Data)
            </button>
            <button
              type="button"
              onClick={checkOwnershipAndPermissions}
              className="ml-4 text-purple-600 hover:text-purple-800 text-sm underline"
            >
              Check Ownership
            </button>
            <button
              type="button"
              onClick={testMintWithMinimalData}
              className="ml-4 text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Test Mint with Minimal Data
            </button>
            <button
              type="button"
              onClick={checkOwnershipAndPermissions}
              className="ml-4 text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Check Ownership & Permissions
            </button>
          </div>
          {debugInfo && (
            <div className="mt-2 p-2 bg-white rounded text-xs font-mono text-gray-600">
              {debugInfo}
            </div>
          )}
        </div>
      )}

      {/* Mint Button */}
      <button
        onClick={mintNFT}
        disabled={!isConnected || !isFormValid || isLoading}
        className="btn-primary w-full"
      >
        {isLoading ? (
          <span className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Minting...</span>
          </span>
        ) : (
          'Mint my SOKAI NFT 🏆'
        )}
      </button>

      {/* Transaction Status */}
      {txHash && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm mb-2">
            <strong>Transaction Hash:</strong>
          </p>
          <p className="text-blue-700 text-xs break-all font-mono">
            {txHash}
          </p>
          <a
            href={`https://testnet.chiliscan.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm underline mt-2 inline-block"
          >
            View on Chiliz Explorer →
          </a>
        </div>
      )}

      {/* Player Card Display */}
      {tokenId && (
        <PlayerCard 
          tokenId={tokenId}
          contractAddress={contractAddress}
        />
      )}
    </div>
  )
}
