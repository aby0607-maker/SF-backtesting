import { NavLink } from 'react-router-dom'
import { Home, Search, Briefcase, BookOpen, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/discover', icon: Search, label: 'Discover' },
  { to: '/portfolio', icon: Briefcase, label: 'Portfolio' },
  { to: '/journal', icon: BookOpen, label: 'Journal' },
  { to: '/chat', icon: MessageSquare, label: 'Chat' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-dark-900/90 backdrop-blur-xl border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all',
                  isActive
                    ? 'text-primary-400'
                    : 'text-gray-500 hover:text-gray-300'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-primary-500/10 rounded-lg"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <item.icon
                    className={cn(
                      'w-6 h-6 relative z-10',
                      isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'
                    )}
                  />
                  <span className={cn(
                    'text-caption font-medium relative z-10',
                    isActive && 'text-primary-400'
                  )}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-glow"
                      className="absolute -bottom-2 w-8 h-1 bg-primary-500 rounded-full shadow-glow-purple"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
