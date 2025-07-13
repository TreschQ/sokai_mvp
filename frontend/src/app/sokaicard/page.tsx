'use client'

import SokaiCard from '@/components/SokaiCard'

export default function SokaiCardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0F11] to-[#006B15] flex items-center justify-center p-8">
      <div className="max-w-md">
        <h1 className="text-white text-2xl font-bold text-center mb-8">Sokai Card Preview</h1>
        <SokaiCard 
          className="w-full max-w-sm mx-auto" 
          minutesPlayed={45}
          gamesPlayed={8}
          score={1250}
        />
      </div>
    </div>
  )
}