import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile, Alert } from '@/types'

// Import mock data (will be populated later)
import { profiles } from '@/data/profiles'

interface AppState {
  // Current profile
  currentProfileId: string
  currentProfile: UserProfile | null

  // UI state
  isSidebarOpen: boolean
  isSearchOpen: boolean

  // Alerts
  alerts: Alert[]
  unreadAlertCount: number

  // Actions
  setCurrentProfile: (profileId: string) => void
  toggleSidebar: () => void
  toggleSearch: () => void
  markAlertAsRead: (alertId: string) => void
  markAllAlertsAsRead: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentProfileId: 'ankit',
      currentProfile: profiles.find(p => p.id === 'ankit') || null,

      isSidebarOpen: false,
      isSearchOpen: false,

      alerts: [],
      unreadAlertCount: 0,

      // Actions
      setCurrentProfile: (profileId: string) => {
        const profile = profiles.find(p => p.id === profileId) || null
        set({
          currentProfileId: profileId,
          currentProfile: profile,
        })
      },

      toggleSidebar: () => {
        set(state => ({ isSidebarOpen: !state.isSidebarOpen }))
      },

      toggleSearch: () => {
        set(state => ({ isSearchOpen: !state.isSearchOpen }))
      },

      markAlertAsRead: (alertId: string) => {
        set(state => ({
          alerts: state.alerts.map(alert =>
            alert.id === alertId ? { ...alert, isRead: true } : alert
          ),
          unreadAlertCount: Math.max(0, state.unreadAlertCount - 1),
        }))
      },

      markAllAlertsAsRead: () => {
        set(state => ({
          alerts: state.alerts.map(alert => ({ ...alert, isRead: true })),
          unreadAlertCount: 0,
        }))
      },
    }),
    {
      name: 'stockfox-storage',
      partialize: state => ({
        currentProfileId: state.currentProfileId,
      }),
    }
  )
)
