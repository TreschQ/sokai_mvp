
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaHome, FaUserCircle } from 'react-icons/fa'
import { PiSoccerBallFill } from 'react-icons/pi'

const navItems = [
  { href: '/', label: 'Home', icon: <FaHome size={22} /> },
  { href: '/profile', label: 'Player', icon: <FaUserCircle size={22} /> },
  { href: '/training', label: 'Training', icon: <PiSoccerBallFill size={22} /> },
]

const BottomBar = () => {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95vw] max-w-md">
      <div className="rounded-full bg-[#23272F] border border-gray-800 shadow-lg flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-full py-2 ${pathname === item.href ? 'text-[#3AA93A]' : 'text-white'} text-xs font-medium transition-colors`}
          >
            <span className="mb-0.5">{item.icon}</span>
            <span className="text-[11px] leading-none">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default BottomBar
