'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
// Update the import path below if PlayerCard is located elsewhere
import PlayerCard from '@/components/nft/PlayerCard'
import BottomBar from '@/components/BottomBar'

function ProfilePage() {
  const { user, ready, authenticated, logout } = usePrivy()
  const router = useRouter()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/')
    }
  }, [ready, authenticated, router])

  useEffect(() => {
    setIsConnected(!!user?.wallet)
  }, [user])

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#23272F] to-[#444857] flex items-center justify-center">
        <div className="animate-pulse w-full max-w-xs mx-auto">
          <div className="h-8 bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return (
    <main className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-[#23272F] to-[#444857] w-full px-2 py-6">
      <header className="flex items-center justify-between w-full max-w-xs mx-auto">
        <h1 className="text-base font-bold text-white text-center flex-1">My SOKAI PASSPORT</h1>
        {isConnected && (
          <button
            onClick={logout}
            className="ml-2 rounded-full bg-red-600 text-white px-4 py-2 text-sm font-semibold shadow focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
          >
            Disconnect
          </button>
        )}
      </header>
      <div className="flex flex-col items-center justify-center flex-1 w-full -mt-16">
        {isConnected && user?.wallet?.address && (
          <div className="w-full max-w-xs mx-auto">
            <PlayerCard tokenId={"1"} contractAddress={process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!} />
          </div>
        )}
        {!isConnected && (
          <p className="text-white text-center">Connect your wallet to view your SOKAI NFT card.</p>
        )}
      </div>
      <BottomBar />
    </main>
  )
}

export default ProfilePage
