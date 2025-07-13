'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { useActiveAccount } from 'thirdweb/react'
import { statsService, StatsService, type StatsUpdateData, type StatsUpdateResult } from '@/services/statsService'

export function useStatsManager() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [result, setResult] = useState<StatsUpdateResult | null>(null)
  
  const router = useRouter()
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
   * Met à jour les stats de façon complète avec gestion automatique
   */
  const updateGameStats = async (sessionScore: number, sessionTime: number = 30, exerciseName: string = 'Touch and Dash') => {
    try {
      setIsLoading(true)
      setError('')
      setResult(null)

      // 1. Vérifier la connexion wallet
      const walletAddress = getWalletAddress()
      if (!walletAddress) {
        throw new Error('Aucun wallet connecté')
      }

      // 2. Trouver le token ID
      const tokenId = await statsService.findUserTokenId(walletAddress)
      if (!tokenId) {
        throw new Error('Impossible de trouver votre SOKAI Card. Assurez-vous d\'être connecté avec le bon wallet.')
      }

      // 3. Récupérer les stats actuelles
      const currentStats = await statsService.getCurrentStats(tokenId)
      console.log('📊 Stats actuelles:', currentStats)

      // 4. Calculer les nouvelles stats (cumulatives)
      const newScore = (currentStats?.currentScore || 0) + sessionScore
      const newTimeSpent = (currentStats?.currentTimeSpent || 0) + sessionTime
      
      console.log('📈 Nouvelles stats:', { newScore, newTimeSpent })

      // 5. Préparer les données de mise à jour
      const updateData: StatsUpdateData = {
        tokenId,
        score: newScore,
        timeSpent: newTimeSpent,
        exercise: exerciseName,
        date: new Date().toISOString().split('T')[0]
      }

      // 6. Mettre à jour les stats
      const updateResult = await statsService.updateStats(updateData)
      setResult(updateResult)

      if (updateResult.success) {
        // Afficher le message de succès
        const level = StatsService.getLevel(newScore)
        const timeDisplay = StatsService.formatTimeDisplay(newTimeSpent)
        
        alert(`🎯 Entraînement terminé !
        
Score cette session: ${sessionScore} points
Score total: ${newScore} points  
Niveau: ${level}
Temps total: ${timeDisplay}
Exercice: ${exerciseName}

Transaction: ${updateResult.txHash?.substring(0, 10)}...`)

        // Redirection vers le profil avec refresh
        setTimeout(() => {
          router.push('/profile?refresh=true')
        }, 2000)
        
        return updateResult
      } else {
        throw new Error(updateResult.error || 'Échec de la mise à jour')
      }

    } catch (error: any) {
      console.error('❌ Erreur lors de la mise à jour des stats:', error)
      setError(error.message)
      
      // Affichage d'un message d'erreur plus convivial
      alert(`🎯 Entraînement terminé !
      
Score cette session: ${sessionScore} points
⚠️ Erreur de sauvegarde: ${error.message}

Vos stats locales sont conservées, réessayez plus tard.`)

      // Redirection même en cas d'erreur (après un délai plus long)
      setTimeout(() => {
        router.push('/profile?refresh=true')
      }, 3000)
      
      return null
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Réinitialise l'état du hook
   */
  const reset = () => {
    setError('')
    setResult(null)
  }

  return {
    updateGameStats,
    isLoading,
    error,
    result,
    reset,
    // Utilitaires
    getWalletAddress,
    getLevel: StatsService.getLevel,
    formatTimeDisplay: StatsService.formatTimeDisplay
  }
}