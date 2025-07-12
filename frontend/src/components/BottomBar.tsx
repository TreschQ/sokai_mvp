import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/profile', label: 'Player', icon: '🧑‍🎤' },
  { href: '/training', label: 'Training', icon: '⚽' },
]

export default function BottomBar() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#23272F] border-t border-gray-800 flex justify-around items-center h-14 z-50">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} className={`flex flex-col items-center justify-center flex-1 h-full ${pathname === item.href ? 'text-[#3AA93A]' : 'text-white'} text-xs font-medium transition-colors`}>
          <span className="text-xl mb-1">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
