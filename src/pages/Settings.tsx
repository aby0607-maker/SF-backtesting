import { Settings as SettingsIcon, User, Bell, Shield, HelpCircle, LogOut } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export function Settings() {
  const { currentProfile } = useAppStore()

  if (!currentProfile) return null

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-h2 flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-primary-600" />
          Settings
        </h1>
        <p className="text-body text-content-secondary mt-1">
          Manage your profile and preferences
        </p>
      </div>

      {/* Profile Summary */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="text-5xl">{currentProfile.avatar}</div>
          <div className="flex-1">
            <h2 className="text-h4">{currentProfile.displayName}</h2>
            <p className="text-body-sm text-content-secondary capitalize">
              {currentProfile.investmentThesis} Investor • {currentProfile.experienceLevel}
            </p>
          </div>
          <button className="btn-secondary">Edit Profile</button>
        </div>
      </div>

      {/* Investment Profile */}
      <div className="card">
        <h3 className="text-h4 flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary-600" />
          Investment Profile
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
            <div>
              <div className="font-medium">Investment Style</div>
              <div className="text-body-sm text-content-secondary">Your primary investment approach</div>
            </div>
            <div className="text-right">
              <span className="badge bg-primary-100 text-primary-700 capitalize">
                {currentProfile.investmentThesis}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
            <div>
              <div className="font-medium">Risk Tolerance</div>
              <div className="text-body-sm text-content-secondary">How much volatility you can handle</div>
            </div>
            <div className="text-right capitalize">{currentProfile.riskTolerance}</div>
          </div>

          <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
            <div>
              <div className="font-medium">Time Horizon</div>
              <div className="text-body-sm text-content-secondary">Typical holding period</div>
            </div>
            <div className="text-right">
              {currentProfile.timeHorizon === 'very-long' ? '5+ years' : '3-5 years'}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
            <div>
              <div className="font-medium">Experience Level</div>
              <div className="text-body-sm text-content-secondary">Your investing experience</div>
            </div>
            <div className="text-right capitalize">{currentProfile.experienceLevel}</div>
          </div>
        </div>
      </div>

      {/* Quick Settings */}
      <div className="card">
        <h3 className="text-h4 mb-4">Quick Settings</h3>
        <div className="space-y-2">
          {[
            { icon: Bell, label: 'Notification Preferences', link: '/alerts' },
            { icon: Shield, label: 'Privacy & Security', link: '#' },
            { icon: HelpCircle, label: 'Help & Support', link: '#' },
          ].map((item, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-secondary transition-colors text-left"
            >
              <item.icon className="w-5 h-5 text-content-secondary" />
              <span className="flex-1">{item.label}</span>
              <span className="text-content-tertiary">→</span>
            </button>
          ))}
        </div>
      </div>

      {/* Demo Note */}
      <div className="card bg-surface-tertiary">
        <div className="text-center py-4">
          <p className="text-body-sm text-content-secondary">
            🦊 <strong>Demo Mode</strong> - Settings changes won't persist across sessions
          </p>
        </div>
      </div>

      {/* Sign Out */}
      <button className="w-full btn-ghost text-verdict-avoid flex items-center justify-center gap-2">
        <LogOut className="w-5 h-5" />
        Sign Out (Demo)
      </button>
    </div>
  )
}
