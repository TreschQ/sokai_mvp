'use client'

import { useRef, useEffect } from 'react'

interface NFTImageGeneratorProps {
  score: number
  timeSpent: number
  exercise: string
  date: string
  userId: string
  onImageGenerated: (imageDataUrl: string) => void
  showPreview?: boolean
}

export default function NFTImageGenerator({
  score,
  timeSpent,
  exercise,
  date,
  userId,
  onImageGenerated,
  showPreview = false
}: NFTImageGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    generateImage()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, timeSpent, exercise, date, userId])

  const generateImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 400
    canvas.height = 500

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 500)
    gradient.addColorStop(0, '#1e40af') // Blue
    gradient.addColorStop(1, '#1e3a8a') // Darker blue
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 400, 500)

    // Header
    ctx.fillStyle = 'white'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('SOKAI', 200, 50)
    ctx.font = '16px Arial'
    ctx.fillText('Performance NFT', 200, 75)

    // Exercise type
    ctx.font = 'bold 20px Arial'
    ctx.fillStyle = '#fbbf24' // Yellow
    ctx.fillText(exercise, 200, 120)

    // Score circle
    const centerX = 200
    const centerY = 200
    const radius = 60

    // Score background circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.fill()

    // Score arc
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius - 10, -Math.PI / 2, (-Math.PI / 2) + (2 * Math.PI * score / 100))
    ctx.strokeStyle = '#10b981' // Green
    ctx.lineWidth = 12
    ctx.stroke()

    // Score text
    ctx.fillStyle = 'white'
    ctx.font = 'bold 36px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(score.toString(), centerX, centerY + 10)
    ctx.font = '14px Arial'
    ctx.fillText('SCORE', centerX, centerY + 30)

    // Performance details
    const details = [
      { label: 'Time Spent', value: `${timeSpent} min`, y: 320 },
      { label: 'Date', value: new Date(date).toLocaleDateString(), y: 360 },
      { label: 'Player ID', value: `${userId.slice(0, 6)}...${userId.slice(-4)}`, y: 400 }
    ]

    ctx.font = '14px Arial'
    ctx.textAlign = 'left'
    details.forEach(detail => {
      ctx.fillStyle = '#94a3b8' // Gray
      ctx.fillText(detail.label, 40, detail.y)
      ctx.fillStyle = 'white'
      ctx.fillText(detail.value, 160, detail.y)
    })

    // Footer
    ctx.fillStyle = '#64748b'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Soulbound Token on Chiliz Spicy', 200, 460)

    // Convert to data URL
    const imageDataUrl = canvas.toDataURL('image/png')
    onImageGenerated(imageDataUrl)
  }

  return (
    <div>
      {showPreview && (
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            🎨 Generated NFT Preview
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Your performance data is automatically converted into this unique NFT image:
          </p>
        </div>
      )}
      <canvas 
        ref={canvasRef} 
        className={showPreview ? "border rounded-lg max-w-full h-auto" : "hidden"}
        style={showPreview ? {} : { display: 'none' }}
      />
    </div>
  )
}
