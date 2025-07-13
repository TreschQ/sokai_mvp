'use client'

import SokaiCard from '@/components/SokaiCard'

export default function SokaiCardPage() {
  return (
    <div className="min-h-screen bg-[#71E582] flex items-center justify-center p-8">
      <div className="max-w-md">
       
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