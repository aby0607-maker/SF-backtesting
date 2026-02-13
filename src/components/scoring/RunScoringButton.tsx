/**
 * RunScoringButton — Stage 3: CTA to run scoring with progress animation
 */

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useScoringStore, useActiveScorecard, useScoringStatus } from '@/store/useScoringStore'
import { scoreFullUniverse } from '@/services/scoringService'
import { Play, Loader2 } from 'lucide-react'

export function RunScoringButton() {
  const scorecard = useActiveScorecard()
  const status = useScoringStatus()
  const setCurrentRun = useScoringStore(s => s.setCurrentRun)
  const setStatus = useScoringStore(s => s.setStatus)
  const nextStage = useScoringStore(s => s.nextStage)

  const isRunning = status === 'scoring'
  const canRun = scorecard && scorecard.segments.length > 0 && !isRunning

  const handleRun = async () => {
    if (!scorecard) return
    setStatus('scoring')
    try {
      const result = await scoreFullUniverse(scorecard)
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
