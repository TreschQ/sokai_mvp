import type { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'
import SokaiABI from '../../../abis/SokaiSBT_abi.json'

interface UpdateStatsRequest {
  tokenId: string
  score: number
  timeSpent: number
  exercise: string
  date: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { tokenId, score, timeSpent, exercise, date }: UpdateStatsRequest = req.body

    // Validation des paramètres
    if (!tokenId || score === undefined || !timeSpent || !exercise || !date) {
      return res.status(400).json({ error: 'Missing required parameters' })
    }

    // Configuration du contrat avec wallet admin
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!
    const rpcUrl = process.env.NEXT_PUBLIC_CHILIZ_RPC!
    const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY!

    if (!contractAddress || !rpcUrl || !adminPrivateKey) {
      console.error('Missing environment variables')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    // Connexion avec wallet admin
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const adminWallet = new ethers.Wallet(adminPrivateKey, provider)
    const contract = new ethers.Contract(contractAddress, SokaiABI, adminWallet)

    console.log('🔄 Updating stats with admin wallet:', adminWallet.address)
    console.log('📊 Stats to update:', { tokenId, score, timeSpent, exercise, date })

    // Appel de la fonction updateStats du contrat
    const tx = await contract.updateStats(
      tokenId,
      score,
      timeSpent,
      exercise,
      date
    )

    console.log('📡 Transaction sent:', tx.hash)

    // Attendre la confirmation
    const receipt = await tx.wait()
    
    console.log('✅ Transaction confirmed in block:', receipt.blockNumber)

    res.status(200).json({
      success: true,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      stats: {
        tokenId,
        score,
        timeSpent,
        exercise,
        date
      }
    })

  } catch (error: any) {
    console.error('❌ Error updating stats:', error)
    
    // Analyse de l'erreur pour donner plus de contexte
    let errorMessage = 'Failed to update stats'
    
    if (error.message?.includes('Token does not exist')) {
      errorMessage = 'Token ID does not exist'
    } else if (error.message?.includes('Not authorized')) {
      errorMessage = 'Admin wallet not authorized'
    } else if (error.message?.includes('insufficient funds')) {
      errorMessage = 'Insufficient gas funds'
    }

    res.status(500).json({ 
      error: errorMessage,
      details: error.message
    })
  }
}