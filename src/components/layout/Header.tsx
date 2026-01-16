import { Link } from 'react-router-dom'
import { Search, Bell } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { ProfileSwitcher } from './ProfileSwitcher'

export function Header() {
  const { unreadAlertCount, toggleSearch } = useAppStore()

  return (
    <header className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <motion.span
              className="text-2xl"
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.4 }}
            >
              🦊
            </motion.span>
            <span className="text-h4 text-gradient-primary font-bold">StockFox</span>
          </Link>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Search button */}
            <button
              onClick={toggleSearch}
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              aria-label="Search stocks"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Alerts */}
            <Link
              to="/alerts"
              className="relative p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              aria-label="View alerts"
            >
              <Bell className="w-5 h-5" />
              {unreadAlertCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-destructive-500 text-white text-caption font-medium rounded-full flex items-center justify-center shadow-glow-red"
                >
                  {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
                </motion.span>
              )}
            </Link>

            {/* Profile Switcher */}
            <ProfileSwitcher />
          </div>
        </div>
      </div>
    </header>
  )
}
