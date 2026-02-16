/**
 * PipelineNav — Horizontal step indicator for the 5-stage pipeline
 *
 * Shows: 1→2→3→4→5 with current stage highlighted.
 * Clickable in hybrid/dashboard mode; linear-only in wizard mode.
 */

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useScoringStore, useCurrentStage, useUIMode } from '@/store/useScoringStore'
import type { PipelineStage } from '@/types/scoring'
import {
  BarChart3, Layers, Settings, Rocket, LineChart,
} from 'lucide-react'

const STAGES: { stage: PipelineStage; label: string; icon: typeof BarChart3 }[] = [
  { stage: 1, label: 'Metrics', icon: BarChart3 },
  { stage: 2, label: 'Scorecard', icon: Layers },
  { stage: 3, label: 'Configure', icon: Settings },
  { stage: 4, label: 'Run', icon: Rocket },
  { stage: 5, label: 'Results', icon: LineChart },
]

export function PipelineNav() {
  const currentStage = useCurrentStage()
  const uiMode = useUIMode()
  const setStage = useScoringStore(s => s.setStage)

  const canClick = uiMode !== 'wizard'

  return (
    <nav className="flex items-center gap-1 overflow-x-auto px-1 py-2">
      {STAGES.map(({ stage, label, icon: Icon }, index) => {
        const isActive = stage === currentStage
        const isComplete = stage < currentStage
        const isRun = stage === 4

        return (
          <div key={stage} className="flex items-center">
            {index > 0 && (
              <div
                className={cn(
                  'w-6 h-px mx-0.5',
                  isComplete ? 'bg-primary-500/60' : 'bg-white/10'
                )}
              />
            )}
            <motion.button
              onClick={() => canClick && setStage(stage)}
              disabled={!canClick}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                'border whitespace-nowrap',
                isActive && 'bg-primary-500/20 border-primary-500/40 text-primary-400',
                isComplete && !isActive && 'bg-dark-700/60 border-white/10 text-neutral-300',
                !isActive && !isComplete && 'bg-dark-800/40 border-white/5 text-neutral-500',
                isRun && isActive && 'bg-warning-500/20 border-warning-500/40 text-warning-400',
                canClick && !isActive && 'cursor-pointer hover:bg-dark-700/80 hover:border-white/15',
                !canClick && 'cursor-default',
              )}
              whileHover={canClick && !isActive ? { scale: 1.02 } : undefined}
              whileTap={canClick ? { scale: 0.98 } : undefined}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
              {isComplete && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-1.5 h-1.5 rounded-full bg-success-400"
                />
              )}
            </motion.button>
          </div>
        )
      })}
    </nav>
  )
}
