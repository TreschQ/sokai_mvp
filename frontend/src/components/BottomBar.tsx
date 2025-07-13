
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaHome, FaFire, FaChartBar } from 'react-icons/fa'

const navItems = [
  { href: '/', label: 'Home', icon: <FaHome size={22} /> },
  { href: '/profile', label: 'Player', icon: <FaFire size={22} /> },
  { href: '/exercises', label: 'Training', icon: <FaChartBar size={22} /> },
]

import { useRouter } from 'next/navigation'

const BottomBar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const handleNav = (href: string) => {
    if (pathname !== href) {
      router.push(href)
    }
  }
  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[85vw] max-w-md">
      <div className="rounded-xl bg-gradient-to-r from-[#1C2127] to-[#3F3E3E] border border-gray-800 shadow-lg flex justify-around items-center h-12 px-2">
        {navItems.map((item) => (
          <button
            key={item.href}
            type="button"
            onClick={() => handleNav(item.href)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-2 ${pathname === item.href ? 'text-[#90CB25]' : 'text-white'} text-xs font-medium transition-colors cursor-pointer`}
            aria-label={item.label}
          >
            <span>{item.icon}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

export default BottomBar