import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { profiles } from '@/data/profiles'
import { cn } from '@/lib/utils'

export function ProfileSelection() {
  const navigate = useNavigate()
  const { setCurrentProfile } = useAppStore()

  const handleSelectProfile = (profileId: string) => {
    setCurrentProfile(profileId)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex flex-col">
      {/* Header */}
      <div className="text-center pt-16 pb-8 px-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-5xl">🦊</span>
          <h1 className="text-display text-primary-600">StockFox</h1>
        </div>
        <p className="text-body-lg text-content-secondary max-w-md mx-auto">
          Your AI-powered stock research assistant.
          <br />
          Institutional-grade analysis in plain English.
        </p>
      </div>

      {/* Profile Selection */}
      <div className="flex-1 px-4 pb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-h3 text-center mb-2">Choose a Demo Profile</h2>
          <p className="text-body text-content-secondary text-center mb-8">
            See how the same stock gets different verdicts based on investor profile
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            {profiles.map(profile => (
              <button
                key={profile.id}
                onClick={() => handleSelectProfile(profile.id)}
                className={cn(
                  'card card-hover text-left p-6 group',
                  'border-2 border-transparent hover:border-primary-200',
                  'transition-all duration-200'
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{profile.avatar}</span>
                  <ArrowRight className="w-5 h-5 text-content-tertiary group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                </div>

                <h3 className="text-h4 mb-1">{profile.displayName}</h3>
                <p className="text-body-sm text-content-secondary mb-4">
                  {profile.investmentThesis.charAt(0).toUpperCase() + profile.investmentThesis.slice(1)} Investor
                </p>

                <div className="space-y-2 text-body-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-content-tertiary">Risk:</span>
                    <span className="font-medium capitalize">{profile.riskTolerance}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-content-tertiary">Horizon:</span>
                    <span className="font-medium">
                      {profile.timeHorizon === 'very-long' ? '5+ years' : '3-5 years'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-content-tertiary">Level:</span>
                    <span className="font-medium capitalize">{profile.experienceLevel}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-caption text-content-tertiary">
                    {profile.id === 'ankit' && '📈 Prioritizes growth & momentum'}
                    {profile.id === 'sneha' && '💎 Seeks margin of safety'}
                    {profile.id === 'kavya' && '📚 Learning-focused approach'}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Demo hint */}
          <div className="mt-8 p-4 bg-primary-50 rounded-card text-center">
            <p className="text-body-sm text-primary-700">
              💡 <strong>Demo Tip:</strong> Try switching profiles on any stock analysis to see how
              verdicts change based on investment style.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-8 text-caption text-content-tertiary">
        StockFox Demo • Investor Pitch Prototype
      </div>
    </div>
  )
}
