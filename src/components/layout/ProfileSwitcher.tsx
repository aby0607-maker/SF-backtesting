import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { profiles } from '@/data/profiles'
import { cn } from '@/lib/utils'

export function ProfileSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const { currentProfile, setCurrentProfile } = useAppStore()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectProfile = (profileId: string) => {
    setCurrentProfile(profileId)
    setIsOpen(false)
  }

  if (!currentProfile) return null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
          'hover:bg-surface-tertiary',
          isOpen && 'bg-surface-tertiary'
        )}
      >
        <span className="text-xl">{currentProfile.avatar}</span>
        <span className="text-body-sm font-medium text-content hidden sm:block">
          {currentProfile.displayName}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-content-tertiary transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-card shadow-dropdown border border-gray-100 py-2 animate-fade-in">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-caption text-content-tertiary">Switch demo profile</p>
          </div>

          {profiles.map(profile => (
            <button
              key={profile.id}
              onClick={() => handleSelectProfile(profile.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 hover:bg-surface-secondary transition-colors',
                currentProfile.id === profile.id && 'bg-primary-50'
              )}
            >
              <span className="text-2xl">{profile.avatar}</span>
              <div className="flex-1 text-left">
                <p className="text-body-sm font-medium text-content">
                  {profile.displayName}
                </p>
                <p className="text-caption text-content-tertiary">
                  {profile.investmentThesis.charAt(0).toUpperCase() + profile.investmentThesis.slice(1)} Investor
                </p>
              </div>
              {currentProfile.id === profile.id && (
                <Check className="w-5 h-5 text-primary-600" />
              )}
            </button>
          ))}

          <div className="px-3 py-2 mt-2 border-t border-gray-100">
            <p className="text-caption text-content-tertiary">
              💡 Switching profiles shows how the same stock gets different verdicts
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
