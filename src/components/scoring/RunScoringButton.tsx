/**
 * RunScoringButton — Stage 3: Run/Stop scoring with progress + smart cache
 *
 * Features:
 * - Cancel: AbortController stops scoring mid-flight, partial results shown
 * - Cache: If universe filter hasn't changed since last run, skips re-scoring
 * - Progress: Shows "Scoring 34/100..." with a progress bar
 * - Error banner: Shows what went wrong with a Retry button
 */

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useScoringStore, useActiveScorecard, useScoringStatus, useScoringError } from '@/store/useScoringStore'
import { scoreWithScorecard } from '@/services/scoringService'
import { getCompanyMaster } from '@/services/cmots/companyMaster'
import { isMockMode } from '@/services/cmots/client'
import { getAllStocksForScoring } from '@/data/mockScoringData'
import { Play, Loader2, Square, RotateCcw, AlertTriangle, X } from 'lucide-react'

/** Hash the universe filter to detect if it changed since last run */
function hashFilter(filter: { mode: string; mcapTypes: string[]; sectors: string[]; customSymbols: string[] }): string {
  return JSON.stringify([
    filter.mode,
    [...filter.mcapTypes].sort(),
    [...filter.sectors].sort(),
    [...filter.customSymbols].sort(),
  ])
}

export function RunScoringButton() {
  const scorecard = useActiveScorecard()
  const status = useScoringStatus()
  const errorMessage = useScoringError()
  const universeFilter = useScoringStore(s => s.universeFilter)
  const currentRun = useScoringStore(s => s.currentRun)
  const setCurrentRun = useScoringStore(s => s.setCurrentRun)
  const setStatus = useScoringStore(s => s.setStatus)
  const setError = useScoringStore(s => s.setError)
  const nextStage = useScoringStore(s => s.nextStage)

  const lastRunFilterHash = useScoringStore(s => s.currentRunFilterHash)

  const [progress, setProgress] = useState<{ scored: number; total: number } | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const isRunning = status === 'scoring'
  const isError = status === 'error'
  const hasStocks = universeFilter.mode !== 'individual' || universeFilter.customSymbols.length > 0
  const canRun = scorecard && scorecard.segments.length > 0 && !isRunning && hasStocks
  const currentFilterHash = hashFilter(universeFilter)
  const hasCachedRun = currentRun && currentRun.stocks.length > 0 && lastRunFilterHash === currentFilterHash

  const handleRun = async (forceRerun = false) => {
    if (!scorecard) return

    // Smart cache: skip if same filter and we have results
    if (!forceRerun && hasCachedRun) {
      nextStage()
      return
    }

    const controller = new AbortController()
    abortRef.current = controller

    setStatus('scoring')
    setProgress(null)

    try {
      let stockIds: string[]

      if (isMockMode()) {
        stockIds = getAllStocksForScoring().map(s => s.info.id)
      } else if (universeFilter.mode === 'individual') {
        stockIds = [...universeFilter.customSymbols]
      } else if (universeFilter.mode === 'all') {
        const companies = await getCompanyMaster()
        stockIds = companies.filter(c => c.nsesymbol).map(c => c.nsesymbol)
      } else {
        const companies = await getCompanyMaster()
        const filtered = companies.filter(c => {
          if (!c.nsesymbol) return false
          if (universeFilter.mcapTypes.length > 0 && !universeFilter.mcapTypes.includes(c.mcaptype)) return false
          if (universeFilter.sectors.length > 0 && !universeFilter.sectors.includes(c.sectorname)) return false
          return true
        })
        stockIds = filtered.map(c => c.nsesymbol)

        if (universeFilter.customSymbols.length > 0) {
          const existing = new Set(stockIds)
          for (const sym of universeFilter.customSymbols) {
            if (!existing.has(sym)) stockIds.push(sym)
          }
        }
      }

      if (stockIds.length === 0) {
        setError('No stocks match the current universe filter. Try selecting a different market cap or sector.')
        setProgress(null)
        return
      }

      console.log(`[RunScoring] Scoring ${stockIds.length} stocks...`)
      const result = await scoreWithScorecard(stockIds, scorecard, {
        signal: controller.signal,
        onProgress: (scored, total) => setProgress({ scored, total }),
      })

      if (result.stocks.length === 0) {
        setError('Scoring completed but no stocks returned valid scores. This may indicate missing fundamental data from the API.')
        setProgress(null)
        abortRef.current = null
        return
      }

      setCurrentRun(result, currentFilterHash)
      setStatus('idle')
      setProgress(null)
      abortRef.current = null

      if (!controller.signal.aborted) {
        nextStage()
      }
    } catch (err) {
      setProgress(null)
      abortRef.current = null

      if ((err as Error)?.name === 'AbortError') {
        setStatus('idle')
        return
      }

      console.error('[RunScoring] Scoring failed:', err)
      const message = (err as Error)?.message || 'Unknown error'

      if (message.includes('fetch') || message.includes('network') || message.includes('Failed to fetch')) {
        setError('Network error — could not reach the CMOTS API. Check your internet connection and try again.')
      } else if (message.includes('401') || message.includes('403') || message.includes('Unauthorized')) {
        setError('API authentication failed. The CMOTS API token may have expired.')
      } else if (message.includes('429') || message.includes('rate')) {
        setError('API rate limit reached. Wait a minute and try again with fewer stocks.')
      } else if (message.includes('timeout') || message.includes('Timeout')) {
        setError('Request timed out. Try scoring fewer stocks or check your connection.')
      } else {
        setError(`Scoring failed: ${message}`)
      }
    }
  }

  const handleStop = () => {
    abortRef.current?.abort()
    setStatus('idle')
    setProgress(null)
  }

  const dismissError = () => {
    setError(null)
  }

  // Progress percentage
  const pct = progress ? Math.round((progress.scored / progress.total) * 100) : 0

  return (
    <div className="space-y-2">
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
                onClick={() => handleRun(true)}
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

      {/* Buttons */}
      <div className="flex items-center gap-2">
        {isRunning ? (
          <>
            {/* Progress indicator */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-dark-700/60 border border-white/5">
              <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-neutral-300">
                  Scoring {progress?.scored ?? 0} / {progress?.total ?? '...'} stocks
                </span>
                {progress && (
                  <div className="w-32 h-1 bg-dark-600 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>
            </div>
            {/* Stop button */}
            <motion.button
              onClick={handleStop}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <Square className="w-3 h-3" />
              Stop
            </motion.button>
          </>
        ) : (
          <>
            {/* Run / Use Cached button */}
            <motion.button
              onClick={() => handleRun(false)}
              disabled={!canRun}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
                canRun
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-400 hover:to-primary-500 shadow-lg shadow-primary-500/20'
                  : 'bg-dark-700/60 text-neutral-500 cursor-not-allowed',
              )}
              whileHover={canRun ? { scale: 1.02 } : undefined}
              whileTap={canRun ? { scale: 0.98 } : undefined}
            >
              <Play className="w-4 h-4" />
              <span>{hasCachedRun ? 'View Results' : 'Run Scoring'}</span>
              {scorecard && (
                <span className="text-xs opacity-70">
                  {scorecard.versionInfo.displayVersion}
                </span>
              )}
            </motion.button>

            {/* Re-run button (when cached results exist) */}
            {hasCachedRun && (
              <motion.button
                onClick={() => handleRun(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-dark-700/40 border border-white/5 text-neutral-400 hover:text-white hover:border-white/10 transition-colors"
                whileTap={{ scale: 0.95 }}
                title="Re-run scoring with fresh data"
              >
                <RotateCcw className="w-3 h-3" />
                Re-run
              </motion.button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
