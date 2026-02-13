/**
 * ConfirmAndRunButton — Stage 6: CTA to confirm review and start backtest
 *
 * Shows readiness checklist, confirmation summary, and error banner if backtest fails.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  useScoringStore,
  useActiveScorecard,
  useScoringStatus,
  useScoringError,
  useCohort,
} from '@/store/useScoringStore'
import { backtestScorecard } from '@/services/scoringService'
import { Loader2, Rocket, AlertTriangle, X } from 'lucide-react'

export function ConfirmAndRunButton() {
  const scorecard = useActiveScorecard()
  const cohort = useCohort()
  const status = useScoringStatus()
  const errorMessage = useScoringError()
  const backtestConfig = useScoringStore(s => s.backtestConfig)
  const confirmReview = useScoringStore(s => s.confirmReview)
  const setBacktestResult = useScoringStore(s => s.setBacktestResult)
  const setStatus = useScoringStore(s => s.setStatus)
  const setError = useScoringStore(s => s.setError)
  const nextStage = useScoringStore(s => s.nextStage)

  const isRunning = status === 'backtesting'
  const isError = status === 'error'

  // Readiness checks
  const hasScorecard = !!scorecard && scorecard.segments.length > 0
  const hasCohort = !!cohort && cohort.stockIds.length > 0
  const hasDateRange = !!backtestConfig?.dateRange.from && !!backtestConfig?.dateRange.to
  const canRun = hasScorecard && hasCohort && hasDateRange && !isRunning

  const handleConfirmAndRun = async () => {
    if (!scorecard || !backtestConfig) return

    // Confirm the review
    confirmReview()

    // Run the backtest with cohort stocks
    setStatus('backtesting')
    try {
      const cohortIds = cohort?.stockIds
      const result = await backtestScorecard(backtestConfig, scorecard, cohortIds)

      if (!result || !result.comparisons || result.comparisons.length === 0) {
        setError('Backtest completed but no performance data was generated. This may indicate the date range has no price data available.')
        return
      }

      setBacktestResult(result)
      setStatus('idle')
      nextStage()
    } catch (err) {
      console.error('[Backtest] Failed:', err)
      const message = (err as Error)?.message || 'Unknown error'

      if (message.includes('fetch') || message.includes('network') || message.includes('Failed to fetch')) {
        setError('Network error — could not fetch price data. Check your internet connection and try again.')
      } else if (message.includes('401') || message.includes('403')) {
        setError('API authentication failed. The CMOTS API token may have expired.')
      } else if (message.includes('No price') || message.includes('no price')) {
        setError('No price data found for the selected date range. Try a different period.')
      } else {
        setError(`Backtest failed: ${message}`)
      }
    }
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
                onClick={handleConfirmAndRun}
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
          <CheckItem label="Cohort selected" done={hasCohort} detail={hasCohort ? `${cohort!.stockIds.length} stocks` : undefined} />
          <CheckItem label="Date range set" done={hasDateRange} detail={hasDateRange ? `${backtestConfig!.dateRange.from} → ${backtestConfig!.dateRange.to}` : undefined} />
        </div>
      </div>

      {/* Confirmation summary */}
      {canRun && scorecard && (
        <div className="text-xs text-neutral-400 text-center">
          Running <span className="text-white font-medium">{scorecard.versionInfo.displayVersion}</span> on{' '}
          <span className="text-white font-medium">{cohort!.stockIds.length} stocks</span>{' '}
          over <span className="text-white font-medium">{backtestConfig!.interval}</span> intervals
        </div>
      )}

      {/* CTA Button */}
      <motion.button
        onClick={handleConfirmAndRun}
        disabled={!canRun}
        className={cn(
          'w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all',
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
            <span>Running Backtest...</span>
          </>
        ) : (
          <>
            <Rocket className="w-4 h-4" />
            <span>Confirm & Run Backtest</span>
          </>
        )}
      </motion.button>
    </div>
  )
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
