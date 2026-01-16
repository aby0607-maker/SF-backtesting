import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Dna, TrendingUp, BarChart3 } from 'lucide-react'
import type { Pattern } from '@/types'

interface ResearchDNACardProps {
  patterns: Pattern[]
  investmentThesis: string
  winRate?: number
  topSectors?: { name: string; percentage: number }[]
  className?: string
}

// Default sectors for demo
const defaultSectors = [
  { name: 'IT Services', percentage: 40 },
  { name: 'Banking', percentage: 30 },
  { name: 'FMCG', percentage: 20 },
  { name: 'Auto', percentage: 10 },
]

// Thesis to style mapping
const thesisStyles: Record<string, { label: string; description: string }> = {
  growth: { label: 'Growth Hunter', description: 'You chase high-growth opportunities with strong revenue momentum' },
  value: { label: 'Value Seeker', description: 'You look for undervalued gems trading below intrinsic worth' },
  quality: { label: 'Quality First', description: 'You prioritize companies with strong moats and consistent returns' },
  dividend: { label: 'Income Builder', description: 'You favor reliable dividend payers for steady cash flow' },
  momentum: { label: 'Momentum Rider', description: 'You follow price trends and technical signals' },
  balanced: { label: 'Balanced Investor', description: 'You weigh all factors equally in your analysis' },
  comprehensive: { label: 'Deep Diver', description: 'You analyze every segment thoroughly before deciding' },
  learning: { label: 'Curious Explorer', description: 'You\'re learning and developing your investment style' },
  agnostic: { label: 'Data Driven', description: 'You let the numbers guide you without style bias' },
  preservation: { label: 'Capital Preserver', description: 'You prioritize protecting capital over chasing returns' },
  income: { label: 'Yield Chaser', description: 'You focus on generating consistent income from investments' },
  compounding: { label: 'Compounder', description: 'You seek businesses that compound wealth over decades' },
  remote: { label: 'Global Thinker', description: 'You consider international exposure and currency factors' },
}

/**
 * Research DNA Card
 * Shows the user's investing style and patterns in a visual way
 */
export function ResearchDNACard({
  patterns,
  investmentThesis,
  winRate = 67,
  topSectors = defaultSectors,
  className,
}: ResearchDNACardProps) {
  const style = thesisStyles[investmentThesis] || thesisStyles.balanced
  const mainPattern = patterns[0]

  return (
    <div className={cn('rounded-xl bg-dark-800 border border-white/5 overflow-hidden', className)}>
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-primary-500/10 to-teal-500/10 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
            <Dna className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Research DNA</h3>
            <p className="text-xs text-neutral-400">Your investing personality</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Style */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-neutral-500 uppercase tracking-wide">Style</span>
          </div>
          <div className="text-lg font-semibold text-primary-400">{style.label}</div>
          <p className="text-sm text-neutral-400 mt-0.5">{style.description}</p>
        </div>

        {/* Main Pattern */}
        {mainPattern && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-success-500/10 rounded-xl border border-success-500/20"
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-success-400" />
              <span className="font-medium text-success-400 text-sm">{mainPattern.title}</span>
            </div>
            <p className="text-xs text-neutral-400">{mainPattern.description}</p>
          </motion.div>
        )}

        {/* Sector Preference */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-neutral-500" />
            <span className="text-xs text-neutral-500">Sector Focus</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {topSectors.slice(0, 4).map((sector, i) => (
              <span
                key={sector.name}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium',
                  i === 0 ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-700 text-neutral-400'
                )}
              >
                {sector.name} {sector.percentage}%
              </span>
            ))}
          </div>
        </div>

        {/* Win Rate */}
        <div className="pt-3 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-400">Win Rate</span>
            <span className={cn(
              'text-lg font-bold',
              winRate >= 60 ? 'text-success-400' : winRate >= 40 ? 'text-warning-400' : 'text-destructive-400'
            )}>
              {winRate}%
            </span>
          </div>
          <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden mt-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${winRate}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={cn(
                'h-full rounded-full',
                winRate >= 60 ? 'bg-success-500' : winRate >= 40 ? 'bg-warning-500' : 'bg-destructive-500'
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
