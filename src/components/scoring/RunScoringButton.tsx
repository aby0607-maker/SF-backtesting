/**
 * RunScoringButton — Stage 3: CTA to run scoring with progress animation
 *
 * Uses the universe filter from the store to determine which stocks to score.
 * In mock mode: scores the mock universe (~20 stocks).
 * In API mode: fetches company master, filters by mcap/sector, scores the subset.
 */

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useScoringStore, useActiveScorecard, useScoringStatus } from '@/store/useScoringStore'
import { scoreWithScorecard } from '@/services/scoringService'
import { getCompanyMaster } from '@/services/cmots/companyMaster'
import { isMockMode } from '@/services/cmots/client'
import { getAllStocksForScoring } from '@/data/mockScoringData'
import { Play, Loader2 } from 'lucide-react'

export function RunScoringButton() {
  const scorecard = useActiveScorecard()
  const status = useScoringStatus()
  const universeFilter = useScoringStore(s => s.universeFilter)
  const setCurrentRun = useScoringStore(s => s.setCurrentRun)
  const setStatus = useScoringStore(s => s.setStatus)
  const nextStage = useScoringStore(s => s.nextStage)

  const isRunning = status === 'scoring'
  const canRun = scorecard && scorecard.segments.length > 0 && !isRunning

  const handleRun = async () => {
    if (!scorecard) return
    setStatus('scoring')
    try {
      let stockIds: string[]

      if (isMockMode()) {
        stockIds = getAllStocksForScoring().map(s => s.info.id)
      } else {
        // Filter company master by universe selection
        const companies = await getCompanyMaster()
        const filtered = companies.filter(c => {
          if (!c.nsesymbol) return false
          if (universeFilter.mcapTypes.length > 0 && !universeFilter.mcapTypes.includes(c.mcaptype)) return false
          if (universeFilter.sectors.length > 0 && !universeFilter.sectors.includes(c.sectorname)) return false
          return true
        })
        stockIds = filtered.map(c => c.nsesymbol)

        // Add any custom symbols
        if (universeFilter.customSymbols.length > 0) {
          const existing = new Set(stockIds)
          for (const sym of universeFilter.customSymbols) {
            if (!existing.has(sym)) stockIds.push(sym)
          }
        }
      }

      console.log(`[RunScoring] Scoring ${stockIds.length} stocks...`)
      const result = await scoreWithScorecard(stockIds, scorecard)
      setCurrentRun(result)
      setStatus('idle')
      nextStage()
    } catch (err) {
      console.error('[RunScoring] Scoring failed:', err)
      setStatus('error')
    }
  }

  return (
    <motion.button
      onClick={handleRun}
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
      {isRunning ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Play className="w-4 h-4" />
      )}
      <span>{isRunning ? 'Scoring...' : 'Run Scoring'}</span>
      {scorecard && (
        <span className="text-xs opacity-70">
          {scorecard.versionInfo.displayVersion}
        </span>
      )}
    </motion.button>
  )
}
