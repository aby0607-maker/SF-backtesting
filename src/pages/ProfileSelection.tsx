import { useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles, BarChart2, Shield, TrendingUp, Layers } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { getProfilesByCategory, getCategoryInfo, getFocusTypeInfo, type ExtendedProfile } from '@/data/profiles'
import { cn, formatCurrency } from '@/lib/utils'
import { StaggerContainer, StaggerItem } from '@/components/motion'

// Risk indicator bar
function RiskIndicator({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-neutral-500 uppercase tracking-wide">Risk</span>
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-1.5 h-3 rounded-sm transition-colors',
              i < Math.ceil(level / 2)
                ? level <= 3
                  ? 'bg-success-400'
                  : level <= 6
                    ? 'bg-warning-400'
                    : 'bg-destructive-400'
                : 'bg-dark-600'
            )}
          />
        ))}
      </div>
    </div>
  )
}

// Analysis depth badge
function DepthBadge({ depth }: { depth: 'simplified' | 'detailed' }) {
  return (
    <span className={cn(
      'px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide',
      depth === 'detailed'
        ? 'bg-primary-500/15 text-primary-400'
        : 'bg-neutral-500/15 text-neutral-400'
    )}>
      {depth === 'detailed' ? '11 Segments' : 'Simplified'}
    </span>
  )
}

// Mini portfolio preview
function PortfolioPreview({ portfolio }: { portfolio: ExtendedProfile['portfolio'] }) {
  if (!portfolio || portfolio.length === 0) return null

  const totalValue = portfolio.reduce((sum, p) => sum + p.currentValue, 0)

  return (
    <div className="mt-3 pt-3 border-t border-white/5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-neutral-500 uppercase tracking-wide">Sample Portfolio</span>
        <span className="text-xs text-neutral-400">{formatCurrency(totalValue)}</span>
      </div>
      <div className="flex gap-1">
        {portfolio.slice(0, 3).map((holding, i) => (
          <div
            key={holding.symbol}
            className="flex-1 h-1.5 rounded-full bg-dark-600 overflow-hidden"
          >
            <div
              className={cn(
                'h-full rounded-full',
                i === 0 ? 'bg-primary-400' : i === 1 ? 'bg-teal-400' : 'bg-warning-400'
              )}
              style={{ width: `${holding.allocation}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-1.5">
        {portfolio.slice(0, 3).map((holding) => (
          <span key={holding.symbol} className="text-[10px] text-neutral-500 truncate">
            {holding.symbol}
          </span>
        ))}
      </div>
    </div>
  )
}

// Profile card component - Option D: JTBD-focused with priorities
function ProfileCard({ profile, onSelect }: { profile: ExtendedProfile; onSelect: () => void }) {
  const focusInfo = getFocusTypeInfo(profile.focusType)

  return (
    <motion.button
      onClick={onSelect}
      className={cn(
        'w-full text-left p-5 rounded-2xl',
        'bg-dark-800/80 backdrop-blur-xl',
        'border border-white/5',
        'group transition-all duration-300',
        'hover:bg-dark-700/80 hover:border-primary-500/30',
        'hover:shadow-glow-purple'
      )}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Header: Avatar, Name, Arrow */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <motion.span
            className="text-3xl"
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
            transition={{ duration: 0.4 }}
          >
            {profile.avatar}
          </motion.span>
          <div>
            <h3 className="text-base font-semibold text-white">{profile.displayName}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <RiskIndicator level={profile.riskLevel} />
              <DepthBadge depth={profile.analysisDepth} />
            </div>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-neutral-600 group-hover:text-primary-400 group-hover:translate-x-1 transition-all mt-1" />
      </div>

      {/* JTBD / Tagline - Prominent */}
      <p className="text-sm text-neutral-300 leading-relaxed mb-3 italic">
        "{profile.tagline}"
      </p>

      {/* Focus badge (for focused profiles) */}
      {focusInfo && (
        <div className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-lg mb-3', focusInfo.bgColor)}>
          <span className={cn('text-xs font-medium', focusInfo.color)}>{focusInfo.label}</span>
        </div>
      )}

      {/* Priorities */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-neutral-500 uppercase tracking-wide">Priorities</span>
        <div className="flex flex-wrap gap-1.5">
          {profile.priorities.slice(0, 3).map((priority, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-dark-600/50 rounded text-[11px] text-neutral-400"
            >
              {priority}
            </span>
          ))}
        </div>
      </div>

      {/* Portfolio preview */}
      <PortfolioPreview portfolio={profile.portfolio} />
    </motion.button>
  )
}

// Category section
function CategorySection({
  category,
  profiles,
  onSelectProfile
}: {
  category: 'balanced' | 'focused'
  profiles: ExtendedProfile[]
  onSelectProfile: (id: string) => void
}) {
  const info = getCategoryInfo(category)

  return (
    <div className="mb-8">
      {/* Category header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{info.icon}</span>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">{info.title}</h3>
            {category === 'balanced' && (
              <span className="px-2 py-0.5 bg-success-500/15 text-success-400 text-[10px] font-medium rounded uppercase">
                Most Common
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500">{info.description}</p>
        </div>
      </div>

      {/* Profile cards */}
      <StaggerContainer
        className={cn(
          'grid gap-4',
          category === 'balanced' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'
        )}
        staggerDelay={0.08}
        initialDelay={category === 'balanced' ? 0.3 : 0.6}
      >
        {profiles.map(profile => (
          <StaggerItem key={profile.id}>
            <ProfileCard
              profile={profile}
              onSelect={() => onSelectProfile(profile.id)}
            />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  )
}

export function ProfileSelection() {
  const navigate = useNavigate()
  const { setCurrentProfile } = useAppStore()

  const handleSelectProfile = (profileId: string) => {
    setCurrentProfile(profileId)
    navigate('/dashboard')
  }

  const { balanced, focused } = getProfilesByCategory()

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
        className="text-center pt-12 pb-6 px-4 relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <motion.span
            className="text-4xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            🦊
          </motion.span>
          <h1 className="text-3xl font-bold text-gradient-primary">StockFox</h1>
        </div>
        <p className="text-sm text-neutral-400 max-w-md mx-auto">
          AI-powered stock research.{' '}
          <span className="text-neutral-300">Institutional-grade analysis in plain English.</span>
        </p>
      </motion.div>

      {/* What makes StockFox different - value props */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-4 mb-6 relative z-10"
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Layers, label: '11-Segment Analysis', desc: 'Complete coverage' },
              { icon: BarChart2, label: 'Sector Anchoring', desc: 'Contextual scores' },
              { icon: Shield, label: 'Red Flag Scanner', desc: 'Risk alerts' },
              { icon: TrendingUp, label: 'Personalized', desc: 'Your style matters' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="p-3 bg-dark-800/50 rounded-xl border border-white/5 text-center">
                <Icon className="w-5 h-5 text-primary-400 mx-auto mb-1.5" />
                <p className="text-xs font-medium text-white">{label}</p>
                <p className="text-[10px] text-neutral-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Profile Selection */}
      <div className="flex-1 px-4 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mb-6"
          >
            <h2 className="text-xl font-semibold text-center mb-1 text-white">Choose Your Demo Profile</h2>
            <p className="text-sm text-neutral-500 text-center">
              See how the same stock gets different verdicts based on your investment style
            </p>
          </motion.div>

          {/* Balanced profiles (majority) */}
          <CategorySection
            category="balanced"
            profiles={balanced}
            onSelectProfile={handleSelectProfile}
          />

          {/* Focused profiles */}
          <CategorySection
            category="focused"
            profiles={focused}
            onSelectProfile={handleSelectProfile}
          />

          {/* Demo hint */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-6 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 text-center"
          >
            <p className="text-xs text-primary-300 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>
                <strong>Demo Tip:</strong> Try switching profiles on any stock to see how verdicts change based on investment style.
              </span>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center pb-6 text-[11px] text-neutral-600 relative z-10"
      >
        StockFox Demo • Investor Pitch Prototype
      </motion.div>
    </div>
  )
}
