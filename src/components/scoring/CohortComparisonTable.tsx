/**
 * CohortComparisonTable — Stage 7: All cohort stocks with score, return, alpha
 */

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useBacktestResult } from '@/store/useScoringStore'
import { ChevronUp, ChevronDown } from 'lucide-react'

type SortField = 'name' | 'score' | 'return' | 'alpha'
type SortDir = 'asc' | 'desc'

export function CohortComparisonTable() {
  const result = useBacktestResult()
  const [sortField, setSortField] = useState<SortField>('alpha')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const rows = useMemo(() => {
    if (!result || result.comparisons.length === 0) return []

    // Build row data from comparisons and snapshots
    const cohortPeriods = result.comparisons[0]?.cohortAvg?.periods
    const cohortAvgReturn = cohortPeriods && cohortPeriods.length > 0
      ? cohortPeriods[cohortPeriods.length - 1].cumulativeReturn
      : 0
    const targetIds = new Set(result.comparisons.map(c => c.targetStockId))

    // Get score from first snapshot
    const snapshot = result.snapshots?.[0]
    if (!snapshot) return []

    return snapshot.stockScores.map(stock => {
      const comp = result.comparisons.find(c => c.targetStockId === stock.stockId)
      const tPeriods = comp?.targetPerformance?.periods
      const finalReturn = tPeriods && tPeriods.length > 0
        ? tPeriods[tPeriods.length - 1].cumulativeReturn
        : 0
      const alpha = finalReturn - cohortAvgReturn

      return {
        id: stock.stockId,
        name: stock.stockName,
        symbol: stock.stockSymbol,
        score: stock.normalizedScore,
        verdict: stock.verdict,
        verdictColor: stock.verdictColor,
        returnPct: finalReturn,
        alpha,
        isTarget: targetIds.has(stock.stockId),
      }
    }).sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'name': cmp = a.name.localeCompare(b.name); break
        case 'score': cmp = a.score - b.score; break
        case 'return': cmp = a.returnPct - b.returnPct; break
        case 'alpha': cmp = a.alpha - b.alpha; break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [result, sortField, sortDir])

  if (!result) return null

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
  }

  return (
    <div className="rounded-xl border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-dark-700/40 text-[10px] uppercase tracking-wider text-neutral-500">
        <button onClick={() => toggleSort('name')} className="flex-1 flex items-center gap-0.5 text-left">
          Stock <SortIcon field="name" />
        </button>
        <button onClick={() => toggleSort('score')} className="w-14 flex items-center gap-0.5 justify-end">
          Score <SortIcon field="score" />
        </button>
        <div className="w-20 text-right">Verdict</div>
        <button onClick={() => toggleSort('return')} className="w-16 flex items-center gap-0.5 justify-end">
          Return <SortIcon field="return" />
        </button>
        <button onClick={() => toggleSort('alpha')} className="w-16 flex items-center gap-0.5 justify-end">
          Alpha <SortIcon field="alpha" />
        </button>
      </div>

      {/* Rows */}
      <div className="max-h-[400px] overflow-y-auto">
        {rows.map(row => (
          <div
            key={row.id}
            className={cn(
              'flex items-center gap-2 px-3 py-2 border-t border-white/5 text-xs',
              row.isTarget && 'bg-primary-500/5',
            )}
          >
            <div className="flex-1 min-w-0">
              <span className="text-white">{row.name}</span>
              <span className="text-neutral-500 ml-1">{row.symbol}</span>
              {row.isTarget && (
                <span className="text-[9px] text-primary-400 ml-1.5">selected</span>
              )}
            </div>
            <span className="w-14 text-right font-mono font-semibold text-neutral-300">
              {row.score.toFixed(1)}
            </span>
            <span className={cn('w-20 text-right text-[10px] font-medium', row.verdictColor)}>
              {row.verdict}
            </span>
            <span className={cn(
              'w-16 text-right font-mono',
              row.returnPct >= 0 ? 'text-success-400' : 'text-destructive-400',
            )}>
              {row.returnPct >= 0 ? '+' : ''}{row.returnPct.toFixed(1)}%
            </span>
            <span className={cn(
              'w-16 text-right font-mono font-semibold',
              row.alpha >= 0 ? 'text-success-400' : 'text-destructive-400',
            )}>
              {row.alpha >= 0 ? '+' : ''}{row.alpha.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
