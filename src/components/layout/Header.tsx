import { Link } from 'react-router-dom'
import { Search, Bell } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { ProfileSwitcher } from './ProfileSwitcher'

export function Header() {
  const { unreadAlertCount, toggleSearch } = useAppStore()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🦊</span>
            <span className="text-h4 text-primary-600 font-bold">StockFox</span>
          </Link>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Search button */}
            <button
              onClick={toggleSearch}
              className="p-2 rounded-full hover:bg-surface-tertiary transition-colors"
              aria-label="Search stocks"
            >
              <Search className="w-5 h-5 text-content-secondary" />
            </button>

            {/* Alerts */}
            <Link
              to="/alerts"
              className="relative p-2 rounded-full hover:bg-surface-tertiary transition-colors"
              aria-label="View alerts"
            >
              <Bell className="w-5 h-5 text-content-secondary" />
              {unreadAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-alert-critical text-white text-caption font-medium rounded-full flex items-center justify-center">
                  {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
                </span>
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
