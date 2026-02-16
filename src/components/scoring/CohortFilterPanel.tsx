/**
 * CohortFilterPanel — Stage 4: Multi-filter builder for cohort selection
 */

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useCurrentScores } from '@/store/useScoringStore'
import { getAvailableSectors } from '@/services/scoringService'
import type { CohortFilter } from '@/types/scoring'
import { Filter, X, CheckCircle2 } from 'lucide-react'

const VERDICT_OPTIONS = ['STRONG BUY', 'BUY', 'HOLD', 'REVIEW', 'SELL']

const MARKET_CAP_PRESETS = [
  { label: 'Large Cap (>₹20K Cr)', value: [20000, Infinity] as [number, number] },
  { label: 'Mid Cap (₹5K-20K Cr)', value: [5000, 20000] as [number, number] },
  { label: 'Small Cap (<₹5K Cr)', value: [0, 5000] as [number, number] },
]

export function CohortFilterPanel() {
  const currentRun = useCurrentScores()
  // Deprecated: cohort management removed in 5-stage pipeline
  const cohort = null as any
  const applyCohortFilter = (_filters: CohortFilter[]) => {}
  const setCohort = (_cohort: any) => {}

  const [filters, setFilters] = useState<CohortFilter[]>(cohort?.filters ?? [])

  const sectors = useMemo(() => {
    if (!currentRun) return []
    return getAvailableSectors(currentRun.stocks)
  }, [currentRun])

  // Count stocks matching current filters
  const matchCount = useMemo(() => {
    if (!currentRun) return 0
    let count = 0
    for (const stock of currentRun.stocks) {
      let matches = true
      for (const filter of filters) {
        switch (filter.type) {
          case 'sector':
            if (stock.sector !== filter.value) matches = false
            break
          case 'market_cap': {
            const [min, max] = filter.value as [number, number]
            if (stock.marketCap < min || stock.marketCap > max) matches = false
            break
          }
          case 'score_range': {
            const [minS, maxS] = filter.value as [number, number]
            if (stock.normalizedScore < minS || stock.normalizedScore > maxS) matches = false
            break
          }
          case 'verdict':
            if (stock.verdict !== filter.value) matches = false
            break
        }
        if (!matches) break
      }
      if (matches) count++
    }
    return count
  }, [currentRun, filters])

  if (!currentRun) return (
    <div className="rounded-xl bg-dark-800/60 border border-white/5 p-6 text-center">
      <Filter className="w-6 h-6 text-neutral-600 mx-auto mb-2" />
      <div className="text-sm text-neutral-400 mb-1">No scoring results yet</div>
      <div className="text-xs text-neutral-600">
        Go to <span className="text-primary-400 font-medium">Stage 3: Score & Rank</span> and click "Run Scoring" first
      </div>
    </div>
  )

  const addSectorFilter = (sector: string) => {
    const exists = filters.some(f => f.type === 'sector' && f.value === sector)
    if (exists) return
    setFilters([...filters, { type: 'sector', value: sector, label: `Sector: ${sector}` }])
  }

  const addMarketCapFilter = (preset: typeof MARKET_CAP_PRESETS[0]) => {
    const updated = filters.filter(f => f.type !== 'market_cap')
    setFilters([...updated, { type: 'market_cap', value: preset.value, label: preset.label }])
  }

  const addVerdictFilter = (verdict: string) => {
    const exists = filters.some(f => f.type === 'verdict' && f.value === verdict)
    if (exists) return
    setFilters([...filters, { type: 'verdict', value: verdict, label: `Verdict: ${verdict}` }])
  }

  const addScoreRangeFilter = (min: number, max: number) => {
    const updated = filters.filter(f => f.type !== 'score_range')
    setFilters([...updated, { type: 'score_range', value: [min, max], label: `Score: ${min}-${max}` }])
  }

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index))
  }

  const clearAll = () => {
    setFilters([])
    setCohort(null)
  }

  const applyFilters = () => {
    applyCohortFilter(filters)
  }

  return (
    <div className="space-y-3">
      {/* Active filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-neutral-500" />
        {filters.length === 0 ? (
          <span className="text-xs text-neutral-500">No filters applied — all stocks included</span>
        ) : (
          filters.map((filter, i) => (
            <motion.span
              key={`${filter.type}-${filter.value}-${i}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary-500/15 text-primary-400 text-xs"
            >
              {filter.label}
              <button onClick={() => removeFilter(i)} className="hover:text-white transition-colors">
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          ))
        )}
        {filters.length > 0 && (
          <button onClick={clearAll} className="text-[10px] text-neutral-500 hover:text-white transition-colors">
            Clear all
          </button>
        )}
      </div>

      {/* Filter builder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Sector filter */}
        <div className="rounded-xl bg-dark-800/60 border border-white/5 p-3">
          <div className="text-xs font-medium text-neutral-400 mb-2">Sector</div>
          <div className="flex flex-wrap gap-1">
            {sectors.map(sector => {
              const active = filters.some(f => f.type === 'sector' && f.value === sector)
              return (
                <button
                  key={sector}
                  onClick={() => active ? removeFilter(filters.findIndex(f => f.type === 'sector' && f.value === sector)) : addSectorFilter(sector)}
                  className={cn(
                    'px-2 py-1 rounded-md text-[10px] transition-colors',
                    active
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'bg-dark-700/60 text-neutral-500 hover:text-neutral-300',
                  )}
                >
                  {sector}
                </button>
              )
            })}
          </div>
        </div>

        {/* Market cap filter */}
        <div className="rounded-xl bg-dark-800/60 border border-white/5 p-3">
          <div className="text-xs font-medium text-neutral-400 mb-2">Market Cap</div>
          <div className="flex flex-wrap gap-1">
            {MARKET_CAP_PRESETS.map(preset => {
              const active = filters.some(f =>
                f.type === 'market_cap' &&
                (f.value as [number, number])[0] === preset.value[0]
              )
              return (
                <button
                  key={preset.label}
                  onClick={() => addMarketCapFilter(preset)}
                  className={cn(
                    'px-2 py-1 rounded-md text-[10px] transition-colors',
                    active
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'bg-dark-700/60 text-neutral-500 hover:text-neutral-300',
                  )}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Verdict filter */}
        <div className="rounded-xl bg-dark-800/60 border border-white/5 p-3">
          <div className="text-xs font-medium text-neutral-400 mb-2">Verdict</div>
          <div className="flex flex-wrap gap-1">
            {VERDICT_OPTIONS.map(verdict => {
              const active = filters.some(f => f.type === 'verdict' && f.value === verdict)
              return (
                <button
                  key={verdict}
                  onClick={() => active
                    ? removeFilter(filters.findIndex(f => f.type === 'verdict' && f.value === verdict))
                    : addVerdictFilter(verdict)
                  }
                  className={cn(
                    'px-2 py-1 rounded-md text-[10px] transition-colors',
                    active
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'bg-dark-700/60 text-neutral-500 hover:text-neutral-300',
                  )}
                >
                  {verdict}
                </button>
              )
            })}
          </div>
        </div>

        {/* Score range filter */}
        <div className="rounded-xl bg-dark-800/60 border border-white/5 p-3">
          <div className="text-xs font-medium text-neutral-400 mb-2">Score Range</div>
          <ScoreRangeInput
            current={filters.find(f => f.type === 'score_range')?.value as [number, number] | undefined}
            onApply={addScoreRangeFilter}
          />
        </div>
      </div>

      {/* Match count & apply */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-neutral-400">
          <span className="text-white font-semibold">{matchCount}</span> of {currentRun.stocks.length} stocks match
        </div>
        <button
          onClick={applyFilters}
          disabled={filters.length === 0}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors',
            filters.length > 0
              ? 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30'
              : 'bg-dark-700/60 text-neutral-600 cursor-not-allowed',
          )}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Apply Filters
        </button>
      </div>
    </div>
  )
}

function ScoreRangeInput({
  current,
  onApply,
}: {
  current?: [number, number]
  onApply: (min: number, max: number) => void
}) {
  const [min, setMin] = useState(current?.[0] ?? 0)
  const [max, setMax] = useState(current?.[1] ?? 100)

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        max={100}
        value={min}
        onChange={e => setMin(Number(e.target.value))}
        className="w-14 px-2 py-1 bg-dark-700/60 border border-white/5 rounded text-xs text-white text-center focus:outline-none focus:border-primary-500/30"
      />
      <span className="text-xs text-neutral-500">to</span>
      <input
        type="number"
        min={0}
        max={100}
        value={max}
        onChange={e => setMax(Number(e.target.value))}
        className="w-14 px-2 py-1 bg-dark-700/60 border border-white/5 rounded text-xs text-white text-center focus:outline-none focus:border-primary-500/30"
      />
      <button
        onClick={() => onApply(min, max)}
        className="px-2 py-1 rounded text-[10px] bg-primary-500/20 text-primary-400 hover:bg-primary-500/30"
      >
        Set
      </button>
    </div>
  )
}
