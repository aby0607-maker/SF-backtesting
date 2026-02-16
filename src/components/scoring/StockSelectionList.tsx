/**
 * StockSelectionList — Stage 4: Checkbox list of stocks for cohort selection
 */

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useScoringStore, useCurrentScores } from '@/store/useScoringStore'
import type { CohortDefinition } from '@/types/scoring'
import { Check, CheckSquare, Square, Hash } from 'lucide-react'

export function StockSelectionList() {
  const currentRun = useCurrentScores()
  // Deprecated: cohort removed in 5-stage pipeline
  const cohort = null as any
  const setCohort = (_cohort: any) => {}
  const nextStage = useScoringStore(s => s.nextStage)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(cohort?.stockIds ?? [])
  )

  // Get stocks filtered by cohort filters (if any), or all stocks
  const stocks = useMemo(() => {
    if (!currentRun) return []
    if (cohort) {
      return currentRun.stocks.filter(s => cohort.stockIds.includes(s.stockId))
    }
    return currentRun.stocks
  }, [currentRun, cohort])

  if (!currentRun) return (
    <div className="rounded-xl bg-dark-800/60 border border-white/5 p-6 text-center">
      <Square className="w-6 h-6 text-neutral-600 mx-auto mb-2" />
      <div className="text-sm text-neutral-400 mb-1">No stocks to select</div>
      <div className="text-xs text-neutral-600">
        Run scoring in <span className="text-primary-400 font-medium">Stage 3</span> to see scored stocks here
      </div>
    </div>
  )

  const toggle = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const selectAll = () => {
    setSelectedIds(new Set(stocks.map(s => s.stockId)))
  }

  const deselectAll = () => {
    setSelectedIds(new Set())
  }

  const selectTopN = (n: number) => {
    const sorted = [...stocks].sort((a, b) => b.normalizedScore - a.normalizedScore)
    setSelectedIds(new Set(sorted.slice(0, n).map(s => s.stockId)))
  }

  const confirmSelection = () => {
    const ids = Array.from(selectedIds)
    const def: CohortDefinition = {
      id: `cohort_${Date.now()}`,
      name: `Selected Cohort (${ids.length} stocks)`,
      filters: cohort?.filters ?? [],
      stockIds: ids,
    }
    setCohort(def)
    nextStage()
  }

  const allSelected = selectedIds.size === stocks.length && stocks.length > 0

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={allSelected ? deselectAll : selectAll}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-neutral-400 hover:text-white bg-dark-700/40 hover:bg-dark-700/60 transition-colors"
          >
            {allSelected ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>

          {/* Quick-select top N */}
          <div className="flex items-center gap-1">
            <Hash className="w-3 h-3 text-neutral-500" />
            {[5, 10, 15].map(n => (
              <button
                key={n}
                onClick={() => selectTopN(n)}
                className="px-1.5 py-0.5 rounded text-[10px] text-neutral-500 hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
              >
                Top {n}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-neutral-400">
          <span className="text-white font-semibold">{selectedIds.size}</span> selected
        </span>
      </div>

      {/* Stock list */}
      <div className="rounded-xl border border-white/5 overflow-hidden max-h-[400px] overflow-y-auto">
        {stocks.map((stock, i) => {
          const isSelected = selectedIds.has(stock.stockId)
          return (
            <motion.div
              key={stock.stockId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => toggle(stock.stockId)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors border-b border-white/5 last:border-b-0',
                isSelected
                  ? 'bg-primary-500/10 hover:bg-primary-500/15'
                  : 'hover:bg-dark-700/30',
              )}
            >
              {/* Checkbox */}
              <div className={cn(
                'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                isSelected
                  ? 'bg-primary-500 border-primary-500'
                  : 'border-neutral-600',
              )}>
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>

              {/* Rank */}
              <span className="w-6 text-[10px] font-mono text-neutral-500">#{stock.rank}</span>

              {/* Stock info */}
              <div className="flex-1 min-w-0">
                <span className="text-sm text-white">{stock.stockName}</span>
                <span className="text-[10px] text-neutral-500 ml-1.5">{stock.stockSymbol}</span>
              </div>

              {/* Sector */}
              <span className="text-[10px] text-neutral-500 w-20 truncate hidden md:block">{stock.sector}</span>

              {/* Score */}
              <span className={cn('text-xs font-semibold font-mono w-10 text-right', getScoreColor(stock.normalizedScore))}>
                {stock.normalizedScore.toFixed(1)}
              </span>

              {/* Verdict */}
              <span className={cn('text-[10px] font-medium w-20 text-right', stock.verdictColor)}>
                {stock.verdict}
              </span>
            </motion.div>
          )
        })}
      </div>

      {/* Confirm */}
      <div className="flex items-center justify-between pt-1">
        <div className="text-[10px] text-neutral-500">
          {cohort?.filters.length ? `${cohort.filters.length} filter(s) applied` : 'No filters applied'}
        </div>
        <button
          onClick={confirmSelection}
          disabled={selectedIds.size === 0}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors',
            selectedIds.size > 0
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-400 hover:to-primary-500'
              : 'bg-dark-700/60 text-neutral-600 cursor-not-allowed',
          )}
        >
          Confirm Selection ({selectedIds.size})
        </button>
      </div>
    </div>
  )
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-success-400'
  if (score >= 65) return 'text-teal-400'
  if (score >= 50) return 'text-warning-400'
  return 'text-destructive-400'
}
