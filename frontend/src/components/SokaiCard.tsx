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
    <div className={`relative w-full max-w-[372px] mx-auto ${className}`}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="373" 
        height="603" 
        viewBox="0 0 373 603" 
        fill="none"
        className="w-full h-auto"
      >
        <path 
          d="M53.8657 43.4504C54.6378 68.6035 32.9074 80.5613 17.5672 83.525C13.0917 84.3896 9.25537 88.0597 9.25537 92.6179V494.936C9.25537 506.362 17.3371 516.147 28.4385 518.85C106.333 537.816 166.533 572.226 189.195 588.87C189.878 589.371 190.778 589.372 191.484 588.906C251.936 549.002 309.6 527.842 343.386 518.957C354.802 515.956 363.38 505.889 363.38 494.085V89.5665C363.38 85.0459 359.605 81.4904 355.1 81.1184C326.616 78.7662 320.774 58.5444 321.757 44.1475C322.007 40.5015 320.338 36.8205 317.049 35.2278C208.827 -17.1747 102.798 11.841 58.1293 35.386C55.2177 36.9207 53.7647 40.1606 53.8657 43.4504Z" 
          fill="#3F3F3F"
        />
      </svg>
      
      {/* NFT-top overlay */}
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-[310px] overflow-hidden">
        <Image 
          src="/makses-top-nft.png" 
          alt="NFT Top" 
          width={350} 
          height={150}
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Stats section */}
      <div className="absolute top-[240px] left-1/2 transform -translate-x-1/2 w-[300px] space-y-0">
        
        {/* SOKAI CLUB header */}
        <div className="bg-[#91CC26] border border-black border-t-0 px-4 py-1 text-left">
          <h2 className="font-esport text-black text-base font-normal">SOKAI CLUB</h2>
        </div>

        {/* Minutes played */}
        <div className="bg-[#C1DF8A] border border-black border-t-0 px-4 py-1 flex justify-between items-center">
          <span className="font-sans text-black italic text-sm">Minutes played</span>
          <span className="font-sans text-black font-bold text-sm">{minutesPlayed}</span>
        </div>

        {/* Games */}
        <div className="bg-[#C1DF8A] border border-black border-t-0 px-4 py-1 flex justify-between items-center">
          <span className="font-sans text-black italic text-sm">Games</span>
          <span className="font-sans text-black font-bold text-sm">{gamesPlayed}</span>
        </div>

        {/* Score */}
        <div className="bg-[#C1DF8A] border border-black border-t-0 px-4 py-1 flex justify-between items-center">
          <span className="font-sans text-black italic text-sm">Score</span>
          <span className="font-sans text-black font-bold text-sm">{score}</span>
        </div>
      </div>

      {/* Sokai Club logo */}
      <div className="absolute top-[375px] left-1/2 transform -translate-x-1/2">
        <Image 
          src="/sokaiclub.png" 
          alt="Sokai Club" 
          width={60} 
          height={65}
          className="w-24 h-24 object-contain"
        />
      </div>
    </div>
  )
}

export default SokaiCard