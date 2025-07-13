'use client'

import { useRouter } from 'next/navigation'
import BottomBar from '@/components/BottomBar'
import Image from 'next/image'
import { FaTrophy } from 'react-icons/fa'

const exercises = [
  {
    id: 1,
    title: 'Touch and Dash',
    description: 'Start training',
    difficulty: 'Beginner',
    duration: '30 sec',
  },
  
]

export default function ExercisesPage() {
  const router = useRouter()

  const handleExerciseClick = (exerciseId: number) => {
    if (exerciseId === 1) {
      router.push('/training')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0F11] to-[#006B15] text-white pb-24 flex flex-col">
      {/* BACK button en haut à gauche */}
      <div className="fixed top-8 left-4 z-50 flex items-center h-[50px]">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white font-sans italic font-bold"
        >
          <span className="text-2xl">‹</span>
          <span>BACK</span>
        </button>
      </div>

      {/* Sokai Token et points en haut à droite */}
      <div className="fixed top-8 right-4 z-50 flex items-center gap-2 h-[50px]">
        <Image 
          src="/SOKAI_TOKENFC.png" 
          alt="Sokai Token" 
          width={50} 
          height={50}
          className="object-contain"
        />
        <div className="flex flex-col items-center text-sm font-medium">
          <span className="text-[#7FB923] font-bold italic font-sans">1250</span>
          <span className="text-white text-xs font-bold italic font-sans">POINTS</span>
        </div>
        <FaTrophy className="text-[#7FB923] text-3xl ml-2" />
      </div>

      {/* Logo et bouton START GAME centrés verticalement */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <Image 
          src="/sokaiclub.png" 
          alt="Sokai Club Logo" 
          width={250} 
          height={250}
          className="mb-12"
        />
        <button 
          onClick={() => handleExerciseClick(1)}
          className="bg-[#7FB923] text-white px-12 py-4 rounded-3xl border border-white font-bold text-xl hover:bg-[#6A9B1F] transition-colors shadow-lg flex items-center justify-between gap-8 w-[18rem]"
        >
          <div className="flex flex-col items-start font-sans italic text-2xl">
            <span>START</span>
            <span>GAME</span>
          </div>
          <span className="text-white text-5xl">▶</span>
        </button>
      </div>
      
      <BottomBar />
    </div>
  )
}