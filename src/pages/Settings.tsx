import { useState } from 'react'
import { Settings as SettingsIcon, User, Bell, Shield, HelpCircle, LogOut, ChevronRight, CheckCircle, X, Edit3 } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export function Settings() {
  const { currentProfile } = useAppStore()
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  if (!currentProfile) return null

  const quickSettings = [
    { icon: Bell, label: 'Notification Preferences', action: () => navigate('/alerts') },
    { icon: Shield, label: 'Privacy & Security', action: () => showToast('Privacy settings coming soon') },
    { icon: HelpCircle, label: 'Help & Support', action: () => showToast('Help center coming soon') },
  ]

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-primary-500/20 border border-primary-500/30 rounded-xl px-5 py-3 flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 text-primary-400" />
            <span className="text-white font-medium">{toast}</span>
            <button onClick={() => setToast(null)} className="text-neutral-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-primary-500" />
          Settings
        </h1>
        <p className="text-neutral-400 mt-1">
          Manage your profile and preferences
        </p>
      </div>

      {/* Profile Summary */}
      <div className="bg-dark-800 rounded-2xl border border-white/5 p-5">
        <div className="flex items-center gap-4">
          <div className="text-5xl">{currentProfile.avatar}</div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-white">{currentProfile.displayName}</h2>
            <p className="text-sm text-neutral-400 capitalize">
              {currentProfile.investmentThesis} Investor • {currentProfile.experienceLevel}
            </p>
          </div>
          <button
            onClick={() => showToast('Profile editing coming soon')}
            className="flex items-center gap-2 px-4 py-2 bg-dark-700 border border-white/10 rounded-xl text-neutral-300 hover:bg-dark-600 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Investment Profile */}
      <div className="bg-dark-800 rounded-2xl border border-white/5 p-5">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary-500" />
          Investment Profile
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-dark-700/50 rounded-xl border border-white/5">
            <div>
              <div className="font-medium text-white">Investment Style</div>
              <div className="text-sm text-neutral-500">Your primary investment approach</div>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-lg text-sm font-medium capitalize">
                {currentProfile.investmentThesis}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-dark-700/50 rounded-xl border border-white/5">
            <div>
              <div className="font-medium text-white">Risk Tolerance</div>
              <div className="text-sm text-neutral-500">How much volatility you can handle</div>
            </div>
            <div className="text-right capitalize text-neutral-300">{currentProfile.riskTolerance}</div>
          </div>

          <div className="flex items-center justify-between p-3 bg-dark-700/50 rounded-xl border border-white/5">
            <div>
              <div className="font-medium text-white">Time Horizon</div>
              <div className="text-sm text-neutral-500">Typical holding period</div>
            </div>
            <div className="text-right text-neutral-300">
              {currentProfile.timeHorizon === 'very-long' ? '5+ years' : '3-5 years'}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-dark-700/50 rounded-xl border border-white/5">
            <div>
              <div className="font-medium text-white">Experience Level</div>
              <div className="text-sm text-neutral-500">Your investing experience</div>
            </div>
            <div className="text-right capitalize text-neutral-300">{currentProfile.experienceLevel}</div>
          </div>
        </div>
      </div>

      {/* Quick Settings */}
      <div className="bg-dark-800 rounded-2xl border border-white/5 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Settings</h3>
        <div className="space-y-2">
          {quickSettings.map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-dark-700/50 transition-colors text-left border border-transparent hover:border-white/5"
            >
              <item.icon className="w-5 h-5 text-neutral-400" />
              <span className="flex-1 text-white">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-neutral-600" />
            </button>
          ))}
        </div>
      </div>

      {/* Demo Note */}
      <div className="bg-dark-700/30 rounded-2xl border border-white/5 p-4">
        <div className="text-center">
          <p className="text-sm text-neutral-400">
            <strong className="text-neutral-300">Demo Mode</strong> - Settings changes won't persist across sessions
          </p>
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={() => showToast('Sign out is disabled in demo mode')}
        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-destructive-400 hover:bg-destructive-500/10 transition-colors border border-transparent hover:border-destructive-500/20"
      >
        <LogOut className="w-5 h-5" />
        Sign Out (Demo)
      </button>
    </motion.div>
  )
}
