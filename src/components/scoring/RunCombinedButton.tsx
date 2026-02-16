/**
 * RunCombinedButton — Stage 4: Combined scoring + backtest trigger
 *
 * Readiness check → triggers scoreAndBacktest() → progress UI → auto-advance to Stage 5.
 */

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  useScoringStore,
  useActiveScorecard,
  useScoringStatus,
  useScoringError,
} from '@/store/useScoringStore'
import { scoreAndBacktest } from '@/services/scoringService'
import type { CombinedProgressPhase } from '@/services/scoringService'
import { getCompanyMaster } from '@/services/cmots/companyMaster'
import { isMockMode } from '@/services/cmots/client'
import { getAllStocksForScoring } from '@/data/mockScoringData'
import { Loader2, Rocket, AlertTriangle, X } from 'lucide-react'

const PHASE_LABELS: Record<CombinedProgressPhase, string> = {
  scoring: 'Scoring stocks',
  backtest: 'Running backtest',
  building_table: 'Building results table',
}

export function RunCombinedButton() {
  const scorecard = useActiveScorecard()
  const status = useScoringStatus()
  const errorMessage = useScoringError()
  const universeFilter = useScoringStore(s => s.universeFilter)
  const backtestConfig = useScoringStore(s => s.backtestConfig)
  const confirmReview = useScoringStore(s => s.confirmReview)
  const setCombinedResult = useScoringStore(s => s.setCombinedResult)
  const setStatus = useScoringStore(s => s.setStatus)
  const setError = useScoringStore(s => s.setError)
  const nextStage = useScoringStore(s => s.nextStage)

  const [progress, setProgress] = useState<{ phase: CombinedProgressPhase; current: number; total: number } | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const isRunning = status === 'scoring' || status === 'backtesting'
  const isError = status === 'error'

  // Readiness checks
  const hasScorecard = !!scorecard && scorecard.segments.length > 0
  const hasStocks =
    universeFilter.mode === 'all' ||
    universeFilter.customSymbols.length > 0 ||
    (universeFilter.mode === 'cohort' && (universeFilter.mcapTypes.length > 0 || universeFilter.sectors.length > 0))
  const hasDateRange = !!backtestConfig?.dateRange.from && !!backtestConfig?.dateRange.to
  const canRun = hasScorecard && hasStocks && hasDateRange && !isRunning

  const stockCount =
    universeFilter.mode === 'all'
      ? 'All BSE stocks'
      : universeFilter.mode === 'cohort'
        ? `${universeFilter.mcapTypes.join(', ') || ''} ${universeFilter.sectors.join(', ') || ''}`.trim() || 'Cohort'
        : `${universeFilter.customSymbols.length} stocks`

  const handleRun = async () => {
    if (!scorecard || !backtestConfig) return

    confirmReview()
    setStatus('scoring')
    setProgress(null)

    abortRef.current = new AbortController()

    try {
      // Resolve stock IDs based on selection mode
      const stockIds = await resolveStockIds(universeFilter)

      if (stockIds.length === 0) {
        setError('No stocks found matching your selection. Try broadening your filters.')
        return
      }

      const result = await scoreAndBacktest(
        stockIds,
        scorecard,
        backtestConfig,
        {
          signal: abortRef.current.signal,
          onProgress: (phase, current, total) => {
            setProgress({ phase, current, total })
          },
        }
      )

      if (!result || !result.scoring.stocks.length) {
        setError('Scoring completed but no results were generated. Check your stock selection.')
        return
      }

      setCombinedResult(result)
      setStatus('idle')
      setProgress(null)
      nextStage() // Auto-advance to Stage 5 (Results)
    } catch (err) {
      console.error('[Combined Run] Failed:', err)
      const message = (err as Error)?.message || 'Unknown error'

      if (message === 'Operation cancelled') {
        setStatus('idle')
        setProgress(null)
        return
      }

      if (message.includes('fetch') || message.includes('network')) {
        setError('Network error — could not fetch data. Check your internet connection.')
      } else if (message.includes('401') || message.includes('403')) {
        setError('API authentication failed. The CMOTS API token may have expired.')
      } else {
        setError(`Run failed: ${message}`)
      }
    }
  }

  const handleCancel = () => {
    abortRef.current?.abort()
    setStatus('idle')
    setProgress(null)
  }

  const dismissError = () => {
    setError(null)
  }

  return (
    <div className="space-y-3">
      {/* Error banner */}
      <AnimatePresence>
        {isError && errorMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 flex items-start gap-3"
          >
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-red-300 leading-relaxed">{errorMessage}</p>
              <button
                onClick={handleRun}
                disabled={!canRun}
                className="mt-2 text-[11px] font-medium text-red-400 hover:text-red-300 underline underline-offset-2"
              >
                Retry
              </button>
            </div>
            <button
              onClick={dismissError}
              className="text-red-400/60 hover:text-red-400 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Readiness checklist */}
      <div className="rounded-xl bg-dark-800/60 border border-white/5 p-3">
        <div className="text-xs font-medium text-neutral-400 mb-2">Readiness Check</div>
        <div className="space-y-1.5">
          <CheckItem label="Scorecard configured" done={hasScorecard} />
          <CheckItem label="Stocks selected" done={hasStocks} detail={hasStocks ? stockCount : undefined} />
          <CheckItem label="Date range set" done={hasDateRange} detail={hasDateRange ? `${backtestConfig!.dateRange.from} → ${backtestConfig!.dateRange.to}` : undefined} />
        </div>
      </div>

      {/* Progress display */}
      <AnimatePresence>
        {isRunning && progress && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl bg-primary-500/5 border border-primary-500/20 p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-primary-400 font-medium">
                {PHASE_LABELS[progress.phase]}
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">
                {progress.current}/{progress.total}
              </span>
            </div>
            <div className="w-full h-1.5 bg-dark-600 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation summary */}
      {canRun && scorecard && (
        <div className="text-xs text-neutral-400 text-center">
          Running <span className="text-white font-medium">{scorecard.versionInfo.displayVersion}</span> on{' '}
          <span className="text-white font-medium">{stockCount}</span>{' '}
          over <span className="text-white font-medium">{backtestConfig!.interval}</span> intervals
        </div>
      )}

      {/* CTA Button */}
      <div className="flex gap-2">
        <motion.button
          onClick={handleRun}
          disabled={!canRun}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all',
            canRun
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-400 hover:to-primary-500 shadow-lg shadow-primary-500/20'
              : 'bg-dark-700/60 text-neutral-500 cursor-not-allowed',
          )}
          whileHover={canRun ? { scale: 1.01 } : undefined}
          whileTap={canRun ? { scale: 0.99 } : undefined}
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{progress ? PHASE_LABELS[progress.phase] + '...' : 'Running...'}</span>
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4" />
              <span>Score & Backtest</span>
            </>
          )}
        </motion.button>

        {isRunning && (
          <button
            onClick={handleCancel}
            className="px-4 py-3 rounded-xl text-sm text-neutral-400 hover:text-white bg-dark-700/60 hover:bg-dark-600/60 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}

/** Resolve universe filter into concrete stock ID list */
async function resolveStockIds(
  filter: { mode: string; mcapTypes: string[]; sectors: string[]; customSymbols: string[] }
): Promise<string[]> {
  // Individual mode: symbols already specified
  if (filter.mode === 'individual') {
    return filter.customSymbols
  }

  // Mock mode shortcut: return all mock stocks (no company master API)
  if (isMockMode()) {
    return getAllStocksForScoring().map(s => s.info.id)
  }

  // API mode: fetch company master and filter
  const companies = await getCompanyMaster()

  if (filter.mode === 'all') {
    return companies.map(c => String(c.co_code))
  }

  // Cohort mode: apply mcap + sector filters
  const filtered = companies.filter(c => {
    if (filter.mcapTypes.length > 0 && !filter.mcapTypes.includes(c.mcaptype)) return false
    if (filter.sectors.length > 0 && !filter.sectors.includes(c.sectorname)) return false
    return true
  })

  // Include any custom additions on top of cohort filters
  const ids = new Set(filtered.map(c => String(c.co_code)))
  for (const sym of filter.customSymbols) {
    ids.add(sym)
  }

  return [...ids]
}

function CheckItem({ label, done, detail }: { label: string; done: boolean; detail?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        'w-3.5 h-3.5 rounded-full border flex items-center justify-center',
        done ? 'bg-success-500/20 border-success-500' : 'border-neutral-600',
      )}>
        {done && (
          <svg className="w-2 h-2 text-success-400" fill="currentColor" viewBox="0 0 12 12">
            <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className={cn('text-xs', done ? 'text-neutral-300' : 'text-neutral-500')}>{label}</span>
      {detail && <span className="text-[10px] text-neutral-500 ml-auto">{detail}</span>}
    </div>
  )
}
