'use client'

import { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useActiveAccount } from 'thirdweb/react'
import { statsService } from '@/services/statsService'

export function useAutoMint() {
  const [isChecking, setIsChecking] = useState(false)
  const [hasSBT, setHasSBT] = useState<boolean | null>(null)
  const [tokenId, setTokenId] = useState<string | null>(null)
  const [isMinting, setIsMinting] = useState(false)
  
  const { user } = usePrivy()
  const thirdwebAccount = useActiveAccount()

  /**
   * Récupère l'adresse du wallet connecté
   */
  const getWalletAddress = (): string | null => {
    if (thirdwebAccount?.address) {
      return thirdwebAccount.address
    } else if (user?.wallet?.address) {
      return user.wallet.address
    }
    return null
  }

  /**
   * Vérifie si le wallet a déjà un SBT et mint automatiquement si nécessaire
   */
  const checkAndMintIfNeeded = async () => {
    const walletAddress = getWalletAddress()
    if (!walletAddress) {
      setHasSBT(null)
      setTokenId(null)
      return
    }

    setIsChecking(true)
    try {
      console.log('🔍 Vérification SBT pour:', walletAddress)
      
      // D'abord vérifier sans auto-mint
      const existingTokenId = await statsService.findUserTokenId(walletAddress, false)
      
      if (existingTokenId) {
        // Le wallet a déjà un SBT
        console.log('✅ SBT existant trouvé:', existingTokenId)
        setHasSBT(true)
        setTokenId(existingTokenId)
      } else {
        // Pas de SBT, mint automatique
        console.log('🎨 Aucun SBT trouvé, mint automatique...')
        setIsMinting(true)
        
        const newTokenId = await statsService.findUserTokenId(walletAddress, true)
        
        if (newTokenId) {
          console.log('✅ Nouveau SBT créé:', newTokenId)
          setHasSBT(true)
          setTokenId(newTokenId)
          
          // Notification utilisateur
          setTimeout(() => {
            alert('🎉 Bienvenue ! Votre SOKAI Card a été créée automatiquement !')
          }, 1000)
        } else {
          console.error('❌ Échec de la création automatique du SBT')
          setHasSBT(false)
          setTokenId(null)
        }
        
        setIsMinting(false)
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification/mint:', error)
      setHasSBT(false)
      setTokenId(null)
      setIsMinting(false)
    } finally {
      setIsChecking(false)
    }
  }

  /**
   * Effect pour déclencher la vérification à la connexion
   */
  useEffect(() => {
    const walletAddress = getWalletAddress()
    
    if (walletAddress) {
      // Délai pour laisser le temps aux providers de s'initialiser
      const timer = setTimeout(() => {
        checkAndMintIfNeeded()
      }, 2000)
      
      return () => clearTimeout(timer)
    } else {
      // Reset si plus de wallet connecté
      setHasSBT(null)
      setTokenId(null)
    }
  }, [thirdwebAccount?.address, user?.wallet?.address])

  /**
   * Force une nouvelle vérification
   */
  const refresh = () => {
    checkAndMintIfNeeded()
  }

  return {
    isChecking,
    hasSBT,
    tokenId,
    isMinting,
    refresh,
    walletAddress: getWalletAddress(),
    // États combinés pour l'UI
    isReady: !isChecking && !isMinting && hasSBT === true && tokenId !== null,
    isLoading: isChecking || isMinting,
    needsSetup: !isChecking && !isMinting && hasSBT === false
  }
}