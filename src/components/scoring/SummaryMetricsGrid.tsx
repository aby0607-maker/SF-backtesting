/**
 * SummaryMetricsGrid — Stage 7: Key summary metric cards
 */

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useBacktestResult } from '@/store/useScoringStore'
import { Target, TrendingUp, Award, AlertTriangle } from 'lucide-react'

export function SummaryMetricsGrid() {
  const result = useBacktestResult()

  if (!result) return null

  const { summaryMetrics } = result

  const cards = [
    {
      label: 'Hit Rate',
      value: `${summaryMetrics.hitRate.toFixed(0)}%`,
      description: 'High-scorers that outperformed',
      icon: Target,
      color: summaryMetrics.hitRate >= 50 ? 'text-success-400' : 'text-destructive-400',
      bgColor: summaryMetrics.hitRate >= 50 ? 'bg-success-500/10' : 'bg-destructive-500/10',
    },
    {
      label: 'Avg Alpha',
      value: `${summaryMetrics.avgAlpha >= 0 ? '+' : ''}${summaryMetrics.avgAlpha.toFixed(1)}%`,
      description: 'Average outperformance',
      icon: TrendingUp,
      color: summaryMetrics.avgAlpha >= 0 ? 'text-success-400' : 'text-destructive-400',
      bgColor: summaryMetrics.avgAlpha >= 0 ? 'bg-success-500/10' : 'bg-destructive-500/10',
    },
    {
      label: 'Best Performer',
      value: `+${summaryMetrics.bestPerformer.returnPct.toFixed(1)}%`,
      description: summaryMetrics.bestPerformer.name,
      icon: Award,
      color: 'text-success-400',
      bgColor: 'bg-success-500/10',
    },
    {
      label: 'Score-Return Corr.',
      value: summaryMetrics.correlationScoreVsReturn.toFixed(2),
      description: 'Higher = scorecard predicts returns',
      icon: AlertTriangle,
      color: summaryMetrics.correlationScoreVsReturn > 0.3 ? 'text-success-400'
        : summaryMetrics.correlationScoreVsReturn > 0 ? 'text-warning-400'
        : 'text-destructive-400',
      bgColor: summaryMetrics.correlationScoreVsReturn > 0.3 ? 'bg-success-500/10'
        : summaryMetrics.correlationScoreVsReturn > 0 ? 'bg-warning-500/10'
        : 'bg-destructive-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card, i) => {
        const Icon = card.icon
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl bg-dark-800/60 border border-white/5 p-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center', card.bgColor)}>
                <Icon className={cn('w-3.5 h-3.5', card.color)} />
              </div>
              <span className="text-[10px] text-neutral-500">{card.label}</span>
            </div>
            <div className={cn('text-xl font-bold font-mono', card.color)}>{card.value}</div>
            <div className="text-[10px] text-neutral-500 mt-0.5">{card.description}</div>
          </motion.div>
        )
      })}
    </div>
  )
}
