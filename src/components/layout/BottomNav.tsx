import { NavLink } from 'react-router-dom'
import { Home, Search, Briefcase, BookOpen, MessageSquare } from 'lucide-react'
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'text-primary-600'
                    : 'text-content-tertiary hover:text-content-secondary'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'w-6 h-6',
                      isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'
                    )}
                  />
                  <span className="text-caption font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
