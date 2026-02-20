/**
 * StepperNav — Horizontal 5-step stepper for the pipeline
 *
 * Replaces PipelineNav. Shows steps with completion state.
 * Completed steps are directly clickable for non-linear navigation.
 */

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useScoringStore, useCurrentStage, useStageCompletion } from '@/store/useScoringStore'
import type { PipelineStage } from '@/types/scoring'
import { Sparkles, BarChart3, SlidersHorizontal, Rocket, LineChart, Check } from 'lucide-react'

const STEPS: { stage: PipelineStage; label: string; icon: typeof Sparkles }[] = [
  { stage: 1, label: 'Start', icon: Sparkles },
  { stage: 2, label: 'Metrics', icon: BarChart3 },
  { stage: 3, label: 'Tune', icon: SlidersHorizontal },
  { stage: 4, label: 'Run', icon: Rocket },
  { stage: 5, label: 'Results', icon: LineChart },
]

export function StepperNav() {
  const currentStage = useCurrentStage()
  const completion = useStageCompletion()
  const setStage = useScoringStore(s => s.setStage)

  return (
    <nav className="flex items-center gap-1 overflow-x-auto px-1 py-2">
      {STEPS.map(({ stage, label, icon: Icon }, index) => {
        const isActive = stage === currentStage
        const isComplete = completion[stage]
        const canClick = isComplete || stage <= currentStage

        return (
          <div key={stage} className="flex items-center">
            {index > 0 && (
              <div
                className={cn(
                  'w-6 h-px mx-0.5',
                  isComplete || stage <= currentStage ? 'bg-primary-500/60' : 'bg-white/10'
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
                canClick && !isActive && 'cursor-pointer hover:bg-dark-700/80 hover:border-white/15',
                !canClick && 'cursor-not-allowed opacity-50',
              )}
              whileHover={canClick && !isActive ? { scale: 1.02 } : undefined}
              whileTap={canClick ? { scale: 0.98 } : undefined}
            >
              {isComplete && !isActive ? (
                <Check className="w-3.5 h-3.5 text-success-400" />
              ) : (
                <Icon className="w-3.5 h-3.5" />
              )}
              <span>{label}</span>
            </motion.button>
          </div>
        )
      })}
    </nav>
  )
}
