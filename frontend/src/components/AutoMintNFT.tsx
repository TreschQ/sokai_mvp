'use client'

import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'

const DEFAULT_IMAGE = 'https://maroon-rapid-marten-423.mypinata.cloud/ipfs/bafkreiegstt4r3z3dxkxhhqliyaopotgc2f6tr265ulqnlzqddexiygery?pinataGatewayToken=IrdARsrQqs2JC3EhSZyQ5hg_8-AQTUNoNzDcuFKVDsVU6xFickDa3QT-Dv2jp6e8'

export default function AutoMintNFT() {
  const { user } = usePrivy()
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const claimNFT = async () => {
    if (!user?.wallet?.address) {
      setError('Veuillez connecter votre wallet')
      return
    }
    setIsProcessing(true)
    setError('')
    setResult(null)
    try {
      const nftData = {
        userAddress: user.wallet.address,
        score: 100,
        timeSpent: 60,
        exercise: 'Touch & Dash',
        userId: user.wallet.address.substring(0, 10),
        imageURI: DEFAULT_IMAGE
      }
      const response = await fetch('/api/mint-nft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nftData)
      })
      const data = await response.json()
      if (response.ok) {
        setResult({
          txHash: data.txHash,
          tokenId: data.tokenId,
          message: data.message
        })
      } else {
        if (data.hasNFT) {
          setError('🎉 Vous avez déjà un SOKAI NFT !')
        } else {
          setError(data.error || 'Erreur lors de la création du NFT')
        }
      }
    } catch (err: any) {
      setError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!user?.wallet?.address) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          🔐 Connexion requise
        </h3>
        <p className="text-yellow-700 mb-4">
          Connectez votre wallet pour réclamer votre NFT SOKAI gratuit
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-green-800 mb-4">
        🏆 Réclamez votre NFT SOKAI
      </h3>
      <div className="mb-4 p-3 bg-white border border-gray-200 rounded">
        <h4 className="font-medium text-gray-800 mb-2">Votre wallet:</h4>
        <p className="text-sm text-gray-600 font-mono">{user.wallet.address}</p>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      {result && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-green-800 mb-2">🎉 {result.message}</p>
          <div className="text-xs text-gray-600">
            <div><strong>Token ID:</strong> {result.tokenId}</div>
            <div>
              <strong>Transaction:</strong>{' '}
              <a 
                href={`https://testnet.chiliscan.com/tx/${result.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Voir sur Chiliscan
              </a>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={claimNFT}
        disabled={isProcessing}
        className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium transition-colors"
      >
        {isProcessing ? '⏳ Création en cours...' : '🎯 Réclamer mon NFT GRATUIT'}
      </button>
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          💡 <strong>100% GRATUIT</strong> - Aucun frais à payer
        </p>
        <p className="text-xs text-gray-500">
          🖼️ Votre NFT aura l'image officielle SOKAI
        </p>
      </div>
    </div>
  )
}
