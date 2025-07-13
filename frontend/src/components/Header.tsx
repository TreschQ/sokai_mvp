import Image from 'next/image'

interface HeaderProps {
  performanceScore: number
}

const Header = ({ performanceScore }: HeaderProps) => {
  return (
    <header className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-[85vw] max-w-md">
      <div className="rounded-xl bg-gradient-to-r from-[#1C2127] to-[#3F3E3E] border border-gray-800 shadow-lg flex justify-between items-center h-20 px-4">
        <h1 className="text-white font-esport text-sm font-normal">PROFILE BADGE</h1>
        
        <div className="flex items-center gap-2">
          <Image 
            src="/SOKAI_TOKENFC.png" 
            alt="Sokai Token" 
            width={50} 
            height={50}
            className="object-contain"
          />
          <div className="flex flex-col items-center text-sm font-medium">
            <span className="text-[#7FB923] font-bold italic font-sans">
              {performanceScore || 0}
            </span>
            <span className="text-white text-xs font-bold italic font-sans">POINTS</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header