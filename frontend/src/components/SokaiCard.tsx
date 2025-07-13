import React from 'react'
import Image from 'next/image'

interface SokaiCardProps {
  className?: string
  minutesPlayed?: number
  gamesPlayed?: number
  score?: number
}

const SokaiCard: React.FC<SokaiCardProps> = ({ 
  className = "", 
  minutesPlayed = 0, 
  gamesPlayed = 5, 
  score = 0 
}) => {
  return (
    <div className={`relative ${className}`}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="372" 
        height="612" 
        viewBox="0 0 372 612" 
        fill="none"
        className="w-full h-auto"
      >
        <path 
          fill="url(#paint0_linear_22_17)" 
          d="M47.6598 38.6043C48.6431 65.4007 25.4204 78.0145 9.28855 81.008C4.8065 81.8397 0.97168 85.5064 0.97168 90.065V510.391C0.97168 523.716 10.395 535.121 23.3256 538.338C103.82 558.368 165.919 594.007 189.381 611.297C190.064 611.8 190.965 611.8 191.672 611.332C215.134 594.042 277.233 558.403 357.728 538.373C370.659 535.156 380.082 523.751 380.082 510.426V90.1C380.082 85.5414 376.247 81.8747 371.765 81.0431C355.633 78.0496 332.41 65.4358 333.394 38.6394C333.514 35.3546 332.055 32.1124 329.147 30.5792C281.968 5.70133 170.31 -22.3257 56.25 32.8217C55.734 33.0712 55.149 33.2762 54.594 33.4217C23.06 41.6944 56.134 67.8306 16.132 77.3144C12.31 78.2207 9.38916 81.5255 9.38916 85.4539V509.431C9.38916 523.198 19.3902 534.952 32.677 538.557C68.339 548.234 127.467 570.385 189.381 611.367C190.088 611.835 190.989 611.835 191.672 611.332Z"
        />
        <defs>
          <linearGradient 
            id="paint0_linear_22_17" 
            x1="186.318" 
            y1="-0.58717" 
            x2="186.318" 
            y2="612.119" 
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#90CB25"/>
            <stop offset="0.0001" stopColor="#3F3E3E"/>
          </linearGradient>
        </defs>
      </svg>
      
      {/* NFT-top overlay */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-full max-w-[300px] overflow-hidden">
        <Image 
          src="/NFT-top.png" 
          alt="NFT Top" 
          width={300} 
          height={200}
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Stats section */}
      <div className="absolute top-[220px] left-1/2 transform -translate-x-1/2 w-full max-w-[300px] space-y-0">
        {/* SOKAI CLUB header */}
        <div className="bg-[#91CC26] border border-black px-4 py-3 text-center">
          <h2 className="font-esport text-black text-lg font-normal">SOKAI CLUB</h2>
        </div>

        {/* Minutes played */}
        <div className="bg-[#C1DF8A] border border-black border-t-0 px-4 py-3 flex justify-between items-center">
          <span className="font-sans text-black">Minutes played</span>
          <span className="font-sans text-black font-medium">{minutesPlayed}</span>
        </div>

        {/* Games */}
        <div className="bg-[#C1DF8A] border border-black border-t-0 px-4 py-3 flex justify-between items-center">
          <span className="font-sans text-black">Games</span>
          <span className="font-sans text-black font-medium">{gamesPlayed}</span>
        </div>

        {/* Score */}
        <div className="bg-[#C1DF8A] border border-black border-t-0 px-4 py-3 flex justify-between items-center">
          <span className="font-sans text-black">Score</span>
          <span className="font-sans text-black font-medium">{score}</span>
        </div>
      </div>
    </div>
  )
}

export default SokaiCard