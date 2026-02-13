/**
 * RunScoringButton — Stage 3: Run/Stop scoring with progress + smart cache
 *
 * Features:
 * - Cancel: AbortController stops scoring mid-flight, partial results shown
 * - Cache: If universe filter hasn't changed since last run, skips re-scoring
 * - Progress: Shows "Scoring 34/100..." with a progress bar
 */

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useScoringStore, useActiveScorecard, useScoringStatus } from '@/store/useScoringStore'
import { scoreWithScorecard } from '@/services/scoringService'
import { getCompanyMaster } from '@/services/cmots/companyMaster'
import { isMockMode } from '@/services/cmots/client'
import { getAllStocksForScoring } from '@/data/mockScoringData'
import { Play, Loader2, Square, RotateCcw } from 'lucide-react'

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
  const universeFilter = useScoringStore(s => s.universeFilter)
  const currentRun = useScoringStore(s => s.currentRun)
  const setCurrentRun = useScoringStore(s => s.setCurrentRun)
  const setStatus = useScoringStore(s => s.setStatus)
  const nextStage = useScoringStore(s => s.nextStage)

  const [progress, setProgress] = useState<{ scored: number; total: number } | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  // Track which filter produced the current run
  const [lastRunFilterHash, setLastRunFilterHash] = useState<string | null>(null)

  const isRunning = status === 'scoring'
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
        // Individual mode: only score the explicitly selected stocks
        stockIds = [...universeFilter.customSymbols]
      } else if (universeFilter.mode === 'all') {
        // All mode: entire NSE universe
        const companies = await getCompanyMaster()
        stockIds = companies.filter(c => c.nsesymbol).map(c => c.nsesymbol)
      } else {
        // Cohort mode: filter by mcap/sector + any custom additions
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
        console.warn('[RunScoring] No stocks match the universe filter')
        setStatus('idle')
        return
      }

      console.log(`[RunScoring] Scoring ${stockIds.length} stocks...`)
      const result = await scoreWithScorecard(stockIds, scorecard, {
        signal: controller.signal,
        onProgress: (scored, total) => setProgress({ scored, total }),
      })

      setCurrentRun(result)
      setLastRunFilterHash(currentFilterHash)
      setStatus('idle')
      setProgress(null)
      abortRef.current = null

      if (!controller.signal.aborted) {
        nextStage()
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        console.error('[RunScoring] Scoring failed:', err)
      }
      setStatus('error')
      setProgress(null)
      abortRef.current = null
    }
  }

  const handleStop = () => {
    abortRef.current?.abort()
    setStatus('idle')
    setProgress(null)
  }

  // Progress percentage
  const pct = progress ? Math.round((progress.scored / progress.total) * 100) : 0

  return (
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
  )
}
