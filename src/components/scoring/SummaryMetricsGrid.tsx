/**
 * SummaryMetricsGrid — Stage 5: Key summary metric cards
 *
 * Two modes:
 *   - Aggregate (default): Hit Rate, Avg Alpha, Best Performer, Correlation
 *   - Per-stock (selectedStockId): Stock Score, Total Return, Alpha vs Avg, Rank
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useBacktestResult, useCombinedResult } from '@/store/useScoringStore'
import { Target, TrendingUp, Award, AlertTriangle, Hash, BarChart3 } from 'lucide-react'

interface SummaryMetricsGridProps {
  selectedStockId?: string | null
}

export function SummaryMetricsGrid({ selectedStockId }: SummaryMetricsGridProps) {
  const result = useBacktestResult()
  const combinedResult = useCombinedResult()

  // Per-stock data when a stock is selected
  const stockCards = useMemo(() => {
    if (!selectedStockId || !combinedResult) return null

    const deltaRow = combinedResult.priceDeltaTable?.find(r => r.stockId === selectedStockId)
    const comparison = result?.comparisons?.find(c => c.targetStockId === selectedStockId)

    if (!deltaRow) return null

    // Find total return (last interval)
    const deltaKeys = Object.keys(deltaRow.deltas)
    const lastKey = deltaKeys.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0
      const numB = parseInt(b.replace(/\D/g, '')) || 0
      return numA - numB
    })[deltaKeys.length - 1]
    const totalReturn = lastKey ? deltaRow.deltas[lastKey] ?? 0 : 0

    // Compute alpha vs cohort avg
    const cohortAvgReturn = result?.comparisons?.length
      ? result.comparisons.reduce((sum, c) => {
          const periods = c.targetPerformance?.periods ?? []
          const last = periods[periods.length - 1]
          return sum + (last?.cumulativeReturn ?? 0)
        }, 0) / result.comparisons.length
      : 0
    const alpha = totalReturn - cohortAvgReturn

    // Rank by score
    const allScores = (combinedResult.priceDeltaTable ?? [])
      .map(r => r.score)
      .sort((a, b) => b - a)
    const rank = allScores.indexOf(deltaRow.score) + 1

    return [
      {
        label: 'Score',
        value: deltaRow.score.toFixed(1),
        description: deltaRow.verdict,
        icon: BarChart3,
        color: deltaRow.score >= 65 ? 'text-success-400' : deltaRow.score >= 50 ? 'text-warning-400' : 'text-destructive-400',
        bgColor: deltaRow.score >= 65 ? 'bg-success-500/10' : deltaRow.score >= 50 ? 'bg-warning-500/10' : 'bg-destructive-500/10',
      },
      {
        label: 'Total Return',
        value: `${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(1)}%`,
        description: `Over ${deltaKeys.length} intervals`,
        icon: TrendingUp,
        color: totalReturn >= 0 ? 'text-success-400' : 'text-destructive-400',
        bgColor: totalReturn >= 0 ? 'bg-success-500/10' : 'bg-destructive-500/10',
      },
      {
        label: 'Alpha vs Avg',
        value: `${alpha >= 0 ? '+' : ''}${alpha.toFixed(1)}%`,
        description: comparison ? 'vs cohort average' : 'vs peer average',
        icon: Target,
        color: alpha >= 0 ? 'text-success-400' : 'text-destructive-400',
        bgColor: alpha >= 0 ? 'bg-success-500/10' : 'bg-destructive-500/10',
      },
      {
        label: 'Rank',
        value: `#${rank}`,
        description: `of ${allScores.length} stocks`,
        icon: Hash,
        color: rank <= 3 ? 'text-success-400' : rank <= Math.ceil(allScores.length / 2) ? 'text-warning-400' : 'text-destructive-400',
        bgColor: rank <= 3 ? 'bg-success-500/10' : rank <= Math.ceil(allScores.length / 2) ? 'bg-warning-500/10' : 'bg-destructive-500/10',
      },
    ]
  }, [selectedStockId, combinedResult, result])

  // Aggregate cards (default)
  const aggregateCards = useMemo(() => {
    if (!result) return null
    const { summaryMetrics } = result

    return [
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
  }, [result])

  const cards = stockCards ?? aggregateCards
  if (!cards) return null

  // Find stock name for header when in per-stock mode
  const stockName = selectedStockId
    ? combinedResult?.priceDeltaTable?.find(r => r.stockId === selectedStockId)?.stockName
    : null

  return (
    <div>
      {stockName && (
        <div className="text-[10px] text-primary-400 font-medium mb-1.5">
          Showing metrics for {stockName}
        </div>
      )}
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
    </div>
  )
}
