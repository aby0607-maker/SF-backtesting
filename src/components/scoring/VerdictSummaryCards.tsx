/**
 * VerdictSummaryCards — Stage 3: Count cards per verdict band
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useCurrentScores } from '@/store/useScoringStore'
import { getVerdictDistribution } from '@/services/scoringService'

export function VerdictSummaryCards() {
  const currentRun = useCurrentScores()

  const distribution = useMemo(() => {
    if (!currentRun) return []
    return getVerdictDistribution(currentRun.stocks)
  }, [currentRun])

  if (!currentRun || distribution.length === 0) return null

  return (
    <div className="flex gap-2 flex-wrap">
      {distribution.map(({ verdict, count, color }, i) => (
        <motion.div
          key={verdict}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="px-3 py-2 rounded-xl bg-dark-800/60 border border-white/5 min-w-[100px]"
        >
          <div className={cn('text-xl font-bold font-mono', color)}>{count}</div>
          <div className={cn('text-xs font-medium', color)}>{verdict}</div>
        </motion.div>
      ))}
    </div>
  )
}
