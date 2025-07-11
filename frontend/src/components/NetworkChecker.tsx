'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { useMetaMask } from './WalletProvider'

interface NetworkCheckerProps {}

export default function NetworkChecker({}: NetworkCheckerProps) {
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean | null>(null)
  const [currentNetwork, setCurrentNetwork] = useState<string>('')
  const { metamaskProvider, isMetaMaskAvailable } = useMetaMask()

  const targetChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID!) // 88882
  const targetNetworkName = 'Chiliz Spicy Testnet'

  useEffect(() => {
    if (metamaskProvider) {
      checkNetwork()
      
      // Listen for network changes on MetaMask specifically
      metamaskProvider.on('chainChanged', () => {
        checkNetwork()
      })

      return () => {
        metamaskProvider.removeAllListeners('chainChanged')
      }
    }
  }, [metamaskProvider])

  const checkNetwork = async () => {
    try {
      if (metamaskProvider) {
        const provider = new ethers.BrowserProvider(metamaskProvider)
        const network = await provider.getNetwork()
        const chainId = Number(network.chainId)
        
        setIsCorrectNetwork(chainId === targetChainId)
        
        // Afficher le nom personnalisé selon le Chain ID
        let networkName = network.name || `Chain ID: ${chainId}`
        if (chainId === 88882) {
          networkName = 'Chiliz Spicy Testnet'
        } else if (chainId === 88888) {
          networkName = 'Chiliz Mainnet'
        }
        
        setCurrentNetwork(networkName)
        
        console.log('Réseau actuel:', chainId, 'Réseau cible:', targetChainId)
        console.log('Network name detected:', network.name)
        console.log('Custom network name:', networkName)
      }
    } catch (error) {
      console.error('Network check failed:', error)
      setIsCorrectNetwork(null)
    }
  }

  const switchNetwork = async () => {
    if (!metamaskProvider) {
      alert('MetaMask n\'est pas disponible. Veuillez installer MetaMask et désactiver temporairement Phantom.')
      return
    }

    console.log('Tentative de changement vers Chain ID:', targetChainId, '(0x' + targetChainId.toString(16) + ')')

    try {
      // D'abord essayer de changer vers le réseau
      await metamaskProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      })
      console.log('Changement de réseau réussi')
      
      // Forcer une nouvelle vérification après un petit délai
      setTimeout(() => {
        checkNetwork()
      }, 1000)
      
    } catch (switchError: any) {
      console.error('Erreur lors du changement:', switchError)
      
      // If the chain doesn't exist, add it
      if (switchError.code === 4902) {
        console.log('Réseau non trouvé, tentative d\'ajout...')
        try {
          await metamaskProvider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${targetChainId.toString(16)}`,
                chainName: targetNetworkName,
                nativeCurrency: {
                  name: 'CHZ',
                  symbol: 'CHZ',
                  decimals: 18,
                },
                rpcUrls: [process.env.NEXT_PUBLIC_CHILIZ_RPC!],
                blockExplorerUrls: ['https://testnet.chiliscan.com'],
              },
            ],
          })
          console.log('Réseau ajouté avec succès')
          
          // Forcer une nouvelle vérification après ajout
          setTimeout(() => {
            checkNetwork()
          }, 1000)
          
        } catch (addError) {
          console.error('Failed to add network:', addError)
          alert('Erreur lors de l\'ajout du réseau. Veuillez ajouter manuellement le réseau Chiliz Spicy Testnet.')
        }
      } else {
        console.error('Failed to switch network:', switchError)
        alert('Erreur lors du changement de réseau. Assurez-vous que MetaMask est actif.')
      }
    }
  }

  if (!isMetaMaskAvailable) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-yellow-800 font-medium">
            ⚠️ MetaMask non détecté
          </span>
        </div>
        <p className="text-yellow-700 text-sm mt-2">
          MetaMask n&apos;est pas disponible. Si vous avez Phantom installé, essayez de le désactiver temporairement.
        </p>
      </div>
    )
  }

  if (isCorrectNetwork === null) {
    return null // Loading or no wallet
  }

  if (isCorrectNetwork) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-green-800 font-medium">
            ✅ Connected to {targetNetworkName}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-red-800 font-medium">
              ❌ Wrong Network
            </span>
          </div>
          <p className="text-red-700 text-sm">
            Please switch to {targetNetworkName}
          </p>
          <p className="text-red-600 text-xs">
            Current: {currentNetwork}
          </p>
          <p className="text-red-500 text-xs mt-1">
            Target Chain ID: {targetChainId} (0x{targetChainId.toString(16)})
          </p>
        </div>
        <div className="flex flex-col space-y-2">
          <button
            onClick={switchNetwork}
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Switch Network
          </button>
          <button
            onClick={checkNetwork}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1 px-3 rounded transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  )
}
