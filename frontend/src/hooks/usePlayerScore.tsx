'use client'

import { useState, useEffect } from 'react'
import { statsService } from '@/services/statsService'

interface UsePlayerScoreProps {
  tokenId: string | null
  enabled?: boolean
}

export function usePlayerScore({ tokenId, enabled = true }: UsePlayerScoreProps) {
  const [score, setScore] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tokenId || !enabled) {
      setScore(0)
      setLoading(false)
      setError(null)
      return
    }

    const fetchScore = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const stats = await statsService.getCurrentStats(tokenId)
        if (stats) {
          setScore(stats.currentScore)
        } else {
          setScore(0)
          setError('Impossible de récupérer le score')
        }
      } catch (err: any) {
        console.error('Erreur lors de la récupération du score:', err)
        setError(err.message || 'Erreur inconnue')
        setScore(0)
      } finally {
        setLoading(false)
      }
    }

    fetchScore()
  }, [tokenId, enabled])

  return {
    score,
    loading,
    error,
    // Fonction utilitaire pour refresh manuel
    refresh: () => {
      if (tokenId && enabled) {
        // Re-trigger l'effect en forçant un nouveau rendu
        setScore(prev => prev)
      }
    }
  }
}