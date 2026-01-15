import { useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { profiles } from '@/data/profiles'
import { cn } from '@/lib/utils'
import { StaggerContainer, StaggerItem } from '@/components/motion'

export function ProfileSelection() {
  const navigate = useNavigate()
  const { setCurrentProfile } = useAppStore()

  const handleSelectProfile = (profileId: string) => {
    setCurrentProfile(profileId)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-600/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center pt-16 pb-8 px-4 relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <motion.span
            className="text-5xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            🦊
          </motion.span>
          <h1 className="text-display text-gradient-primary">StockFox</h1>
        </div>
        <p className="text-body-lg text-gray-400 max-w-md mx-auto">
          Your AI-powered stock research assistant.
          <br />
          <span className="text-gray-300">Institutional-grade analysis in plain English.</span>
        </p>
      </motion.div>

      {/* Profile Selection */}
      <div className="flex-1 px-4 pb-16 relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-h3 text-center mb-2 text-white">Choose a Demo Profile</h2>
            <p className="text-body text-gray-500 text-center mb-8">
              See how the same stock gets different verdicts based on investor profile
            </p>
          </motion.div>

          <StaggerContainer className="grid gap-4 md:grid-cols-3" staggerDelay={0.15} initialDelay={0.4}>
            {profiles.map(profile => (
              <StaggerItem key={profile.id}>
                <motion.button
                  onClick={() => handleSelectProfile(profile.id)}
                  className={cn(
                    'w-full text-left p-6 rounded-card',
                    'bg-dark-800/80 backdrop-blur-xl',
                    'border border-white/5',
                    'group transition-all duration-300',
                    'hover:bg-dark-700/80 hover:border-primary-500/30',
                    'hover:shadow-glow-purple'
                  )}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <motion.span
                      className="text-4xl"
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                      transition={{ duration: 0.4 }}
                    >
                      {profile.avatar}
                    </motion.span>
                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                  </div>

                  <h3 className="text-h4 text-white mb-1">{profile.displayName}</h3>
                  <p className="text-body-sm text-gray-400 mb-4">
                    {profile.investmentThesis.charAt(0).toUpperCase() + profile.investmentThesis.slice(1)} Investor
                  </p>

                  <div className="space-y-2 text-body-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Risk:</span>
                      <span className="font-medium text-gray-300 capitalize">{profile.riskTolerance}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Horizon:</span>
                      <span className="font-medium text-gray-300">
                        {profile.timeHorizon === 'very-long' ? '5+ years' : '3-5 years'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Level:</span>
                      <span className="font-medium text-gray-300 capitalize">{profile.experienceLevel}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-caption text-gray-500 group-hover:text-gray-400 transition-colors">
                      {profile.id === 'ankit' && '📈 Prioritizes growth & momentum'}
                      {profile.id === 'sneha' && '💎 Seeks margin of safety'}
                      {profile.id === 'kavya' && '📚 Learning-focused approach'}
                    </p>
                  </div>
                </motion.button>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Demo hint */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-8 p-4 rounded-card bg-primary-500/10 border border-primary-500/20 text-center"
          >
            <p className="text-body-sm text-primary-300 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              <strong>Demo Tip:</strong> Try switching profiles on any stock analysis to see how
              verdicts change based on investment style.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center pb-8 text-caption text-gray-600 relative z-10"
      >
        StockFox Demo • Investor Pitch Prototype
      </motion.div>
    </div>
  )
}
