import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Sparkles,
  BarChart2,
  Layers,
  Brain,
  Eye,
  Zap,
  GraduationCap,
  Gem,
  Target,
  Users,
  BookOpen,
  Compass,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { getProfilesByCategory, getCategoryInfo, getFocusTypeInfo, type ExtendedProfile } from '@/data/profiles'
import { cn, formatCurrency } from '@/lib/utils'
import { StaggerContainer, StaggerItem } from '@/components/motion'

// ===== CORE DATA =====

// 6 Core Principles
const corePrinciples = [
  {
    id: 'comprehensive',
    label: '360° Coverage',
    icon: Layers,
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/20',
    borderColor: 'border-primary-500/30',
    description: '11 segments, 200+ metrics - nothing missed',
  },
  {
    id: 'personalization',
    label: '6D Personalization',
    icon: Target,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30',
    description: 'Same stock, different verdict based on YOU',
  },
  {
    id: 'transparent',
    label: 'Transparent',
    icon: Eye,
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/20',
    borderColor: 'border-teal-500/30',
    description: 'Every score traced to primary sources',
  },
  {
    id: 'fast',
    label: 'Fast & Automatic',
    icon: Zap,
    color: 'text-warning-400',
    bgColor: 'bg-warning-500/20',
    borderColor: 'border-warning-500/30',
    description: 'Decisions in 30 seconds, not 30 minutes',
  },
  {
    id: 'educational',
    label: 'Educational',
    icon: GraduationCap,
    color: 'text-info-400',
    bgColor: 'bg-info-500/20',
    borderColor: 'border-info-500/30',
    description: 'Learn while you research - build real skills',
  },
  {
    id: 'simplicity',
    label: 'Simple Output',
    icon: Gem,
    color: 'text-success-400',
    bgColor: 'bg-success-500/20',
    borderColor: 'border-success-500/30',
    description: 'Complex analysis, plain English verdicts',
  },
]

// 6 Feature Clusters from PRD
const featureClusters = [
  {
    id: 'cvp',
    name: 'Core Analysis',
    count: 14,
    icon: BarChart2,
    color: 'text-primary-400',
    highlights: ['11-Segment Deep Dive', 'Red Flag Scanner', 'Evidence Citations', 'Peer Comparison'],
  },
  {
    id: 'pers',
    name: 'Personalization',
    count: 11,
    icon: Users,
    color: 'text-purple-400',
    highlights: ['6D Profiling', 'Adaptive Weights', 'Position Sizing', 'Entry/Exit Guidance'],
  },
  {
    id: 'learn',
    name: 'Learning',
    count: 14,
    icon: BookOpen,
    color: 'text-info-400',
    highlights: ['Investment Journal', 'Blind Spot Detection', 'Skill Badges', 'RAG AI Assistant'],
  },
  {
    id: 'ux',
    name: 'Experience',
    count: 12,
    icon: Compass,
    color: 'text-teal-400',
    highlights: ['DFY/DIY Toggle', 'Discovery Hub', 'Watchlist', 'Profile Switcher'],
  },
  {
    id: 'eng',
    name: 'Engagement',
    count: 9,
    icon: Bell,
    color: 'text-warning-400',
    highlights: ['Smart Alerts', 'Thesis-Breaking Alerts', 'Trending Stocks', 'News Feed'],
  },
  {
    id: 'val',
    name: 'Validation',
    count: 8,
    icon: CheckCircle2,
    color: 'text-success-400',
    highlights: ['Backtesting', 'Advisor Marketplace', 'Track Records', 'What-If Scenarios'],
  },
]

// Jobs To Be Done - Functional (What to accomplish) & Emotional (How to feel)
const functionalJTBD = [
  'Get a clear buy/sell verdict in 30 seconds, not hours',
  'Understand every metric without a finance degree',
  'Find new stocks matching MY investment thesis',
  'Track portfolio health beyond just P&L',
  'Never miss a red flag or thesis-breaking event',
  'Build a documented, repeatable investment process',
]

const emotionalJTBD = [
  'Feel confident explaining WHY I bought a stock',
  'Sleep peacefully knowing my portfolio is protected',
  'Trust the analysis because every claim is sourced',
  'Feel empowered to make my own decisions, not follow tips',
  'Reduce anxiety about "what am I missing?"',
  'Feel proud of becoming a better investor over time',
]

// ===== COMPONENTS =====

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

// Profile card component
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

// Hero Section - Core Principles, Features, JTBD
function HeroSection() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="px-4 mb-8 relative z-10"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full mb-3"
          >
            <Brain className="w-4 h-4 text-primary-400" />
            <span className="text-xs font-medium text-primary-400">68 Features Across 6 Clusters</span>
          </motion.div>
          <h2 className="text-xl font-bold text-white mb-2">What Makes StockFox Different</h2>
          <p className="text-sm text-neutral-400 max-w-lg mx-auto">
            Institutional-grade research, personalized for retail investors.
            <span className="text-neutral-300"> Same stock, different verdict based on who YOU are.</span>
          </p>
        </div>

        {/* 6 Core Principles - Always Visible */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {corePrinciples.map((principle, i) => (
            <motion.div
              key={principle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className={cn(
                'p-3 rounded-xl border text-center',
                principle.bgColor,
                principle.borderColor
              )}
            >
              <principle.icon className={cn('w-5 h-5 mx-auto mb-2', principle.color)} />
              <p className={cn('text-xs font-semibold mb-1', principle.color)}>{principle.label}</p>
              <p className="text-[10px] text-neutral-400 leading-tight">{principle.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Jobs To Be Done - Functional & Emotional */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-2 gap-4 mb-4"
        >
          {/* Functional JTBD */}
          <div className="bg-dark-800/50 rounded-xl border border-white/5 p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary-400" />
              <span>What You Can Do</span>
              <span className="text-[10px] text-neutral-500 font-normal">(Functional)</span>
            </h3>
            <div className="space-y-2">
              {functionalJTBD.map((jtbd, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-neutral-300">{jtbd}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Emotional JTBD */}
          <div className="bg-gradient-to-br from-purple-500/10 to-primary-500/10 rounded-xl border border-purple-500/20 p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>How You Will Feel</span>
              <span className="text-[10px] text-neutral-500 font-normal">(Emotional)</span>
            </h3>
            <div className="space-y-2">
              {emotionalJTBD.map((jtbd, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-neutral-300">{jtbd}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Expandable Feature Clusters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <span>{isExpanded ? 'Hide' : 'Show'} Feature Clusters</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
                  {featureClusters.map((cluster, i) => (
                    <motion.div
                      key={cluster.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 bg-dark-800/50 rounded-xl border border-white/5"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <cluster.icon className={cn('w-4 h-4', cluster.color)} />
                        <span className="text-sm font-medium text-white">{cluster.name}</span>
                        <span className="ml-auto text-xs text-neutral-500">{cluster.count} features</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {cluster.highlights.map((h, j) => (
                          <span
                            key={j}
                            className="px-1.5 py-0.5 bg-dark-600/50 rounded text-[10px] text-neutral-400"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Total features summary */}
                <div className="mt-4 text-center">
                  <span className="text-xs text-neutral-500">
                    Total: <span className="text-white font-medium">68 features</span> delivering institutional-grade research to retail investors
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
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
        className="text-center pt-10 pb-4 px-4 relative z-10"
      >
        <div className="flex flex-col items-center justify-center mb-2">
          <img
            src="/High Resolution SF Logo.png"
            alt="StockFox"
            className="h-16 w-auto object-contain"
          />
        </div>
        <p className="text-sm text-neutral-400 max-w-md mx-auto">
          Every tool you need to invest with{' '}
          <span className="text-neutral-300 font-medium">conviction, not hope.</span>
        </p>
      </motion.div>

      {/* Hero Section - Core Principles, Features, JTBD */}
      <HeroSection />

      {/* Profile Selection */}
      <div className="flex-1 px-4 pb-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
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
            transition={{ delay: 1.1 }}
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
        transition={{ delay: 1.2 }}
        className="text-center pb-6 text-[11px] text-neutral-600 relative z-10"
      >
        StockFox Demo • Investor Pitch Prototype
      </motion.div>
    </div>
  )
}
