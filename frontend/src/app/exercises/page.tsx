'use client'

import { useRouter } from 'next/navigation'
import BottomBar from '@/components/BottomBar'

const exercises = [
  {
    id: 1,
    title: 'Touch and Dash',
    description: 'Start training',
    difficulty: 'Beginner',
    duration: '30 sec',
  },
  {
    id: 2,
    title: 'Ball Control',
    description: 'Improve your touch',
    difficulty: 'Intermediate',
    duration: '3 min',
  },
  {
    id: 3,
    title: 'Shooting Accuracy',
    description: 'Perfect your aim',
    difficulty: 'Advanced',
    duration: '3 min',
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
    <div className="min-h-screen bg-[#0A0E1A] text-white pb-24">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-[#3AA93A]">
          Exercices
        </h1>
        
        <div className="space-y-4">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              onClick={() => handleExerciseClick(exercise.id)}
              className={`bg-[#23272F] border border-gray-800 rounded-lg p-6 cursor-pointer transition-all duration-300 hover:border-[#3AA93A] hover:shadow-lg ${
                exercise.id === 1 ? 'hover:bg-[#2A2F3A]' : 'opacity-60'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-semibold text-white">
                  {exercise.title}
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  exercise.difficulty === 'Beginner' ? 'bg-green-900 text-green-300' :
                  exercise.difficulty === 'Intermediate' ? 'bg-yellow-900 text-yellow-300' :
                  'bg-red-900 text-red-300'
                }`}>
                  {exercise.difficulty}
                </span>
              </div>
              
              <p className="text-gray-400 mb-3">{exercise.description}</p>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Duration: {exercise.duration}
                </span>
                {exercise.id === 1 && (
                  <button className="bg-[#3AA93A] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#2E8B2E] transition-colors">
                    Start training
                  </button>
                )}
              </div>
              
              {exercise.id !== 1 && (
                <div className="mt-3 text-sm text-gray-500 italic">
                  Bientôt disponible
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <BottomBar />
    </div>
  )
}