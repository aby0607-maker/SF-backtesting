/**
 * ConfirmAndRunButton — Stage 6: CTA to confirm review and start backtest
 */

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  useScoringStore,
  useActiveScorecard,
  useScoringStatus,
  useCohort,
} from '@/store/useScoringStore'
import { backtestScorecard } from '@/services/scoringService'
import { Loader2, Rocket } from 'lucide-react'

export function ConfirmAndRunButton() {
  const scorecard = useActiveScorecard()
  const cohort = useCohort()
  const status = useScoringStatus()
  const backtestConfig = useScoringStore(s => s.backtestConfig)
  const confirmReview = useScoringStore(s => s.confirmReview)
  const setBacktestResult = useScoringStore(s => s.setBacktestResult)
  const setStatus = useScoringStore(s => s.setStatus)
  const nextStage = useScoringStore(s => s.nextStage)

  const isRunning = status === 'backtesting'

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
      setBacktestResult(result)
      setStatus('idle')
      nextStage()
    } catch (err) {
      console.error('[Backtest] Failed:', err)
      setStatus('error')
    }
  }

  return (
    <div className="space-y-3">
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
