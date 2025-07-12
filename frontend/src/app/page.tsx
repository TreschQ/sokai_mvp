'use client'

import { useState, useEffect } from 'react'

import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import BottomBar from '@/components/BottomBar'


export default function HomePage() {
  const { ready, authenticated, login, logout } = usePrivy()
  const router = useRouter()


  useEffect(() => {
    if (ready && authenticated) {
      router.push('/profile')
    }
  }, [ready, authenticated, router])

  return (
    <main className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-[#23272F] to-[#444857] w-full px-4 py-8">
      <div className="flex flex-col items-center justify-center flex-1 w-full">
        <h1 className="text-3xl font-bold text-white mb-3 text-center">Welcome to Sokai Club</h1>
        <p className="text-white text-base mb-8 text-center">Join the club and track your football journey on-chain.</p>
        <div className="w-full max-w-xs">
          {ready && !authenticated ? (
            <button
              onClick={login}
              className="rounded-full bg-[#3AA93A] text-white px-8 py-3 text-lg font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-all w-full"
            >
              Connect Wallet
            </button>
          ) : null}
          {ready && authenticated ? (
            <button
              onClick={logout}
              className="rounded-full bg-red-600 text-white px-8 py-3 text-lg font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 transition-all w-full mt-4"
            >
              Disconnect
            </button>
          ) : null}
        </div>
      </div>
      <BottomBar />
    </main>
  )
}
