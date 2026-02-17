/**
 * NormalizationSelector — Stage 2: Pluggable normalization method selector
 */

import { cn } from '@/lib/utils'
import { useScoringStore, useActiveScorecard } from '@/store/useScoringStore'
import type { NormalizationConfig } from '@/types/scoring'
import { Scale } from 'lucide-react'

const METHODS: {
  method: NormalizationConfig['method']
  label: string
  description: string
  available: boolean
}[] = [
  {
    method: 'none',
    label: 'None',
    description: 'Raw scores without cross-stock normalization. Scores are purely metric-band based.',
    available: true,
  },
  {
    method: 'min-max',
    label: 'Min-Max',
    description: 'Scale scores to 0-100 based on universe min/max. Best for relative ranking.',
    available: true,
  },
  {
    method: 'percentile',
    label: 'Percentile',
    description: 'Rank-based scoring. Each stock scored by its percentile rank in the universe.',
    available: false,
  },
  {
    method: 'z-score',
    label: 'Z-Score',
    description: 'Standard deviations from mean. Good for normal distributions.',
    available: false,
  },
  {
    method: 'custom',
    label: 'Custom',
    description: 'Define your own normalization formula. Coming in a future release.',
    available: false,
  },
]

export function NormalizationSelector() {
  const scorecard = useActiveScorecard()
  const updateNormalization = useScoringStore(s => s.updateNormalization)

  if (!scorecard) return null

  const current = scorecard.normalization.method

  return (
    <div className="rounded-xl bg-dark-800/60 border border-white/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Scale className="w-3.5 h-3.5 text-primary-400" />
        <span className="text-sm font-medium text-white">Normalization Method</span>
      </div>

      <div className="space-y-2">
        {METHODS.map(m => (
          <button
            key={m.method}
            onClick={() => m.available && updateNormalization({ method: m.method })}
            disabled={!m.available}
            className={cn(
              'w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
              current === m.method
                ? 'bg-primary-500/15 border border-primary-500/30'
                : m.available
                  ? 'bg-dark-700/40 border border-white/5 hover:border-white/10'
                  : 'bg-dark-700/20 border border-white/5 opacity-50 cursor-not-allowed',
            )}
          >
            {/* Radio indicator */}
            <div className={cn(
              'w-3.5 h-3.5 rounded-full border mt-0.5 flex items-center justify-center',
              current === m.method ? 'border-primary-500' : 'border-neutral-500',
            )}>
              {current === m.method && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-xs font-medium',
                  current === m.method ? 'text-primary-400' : 'text-neutral-300',
                )}>
                  {m.label}
                </span>
                {!m.available && (
                  <span className="px-1.5 py-0.5 rounded bg-dark-600 text-xs text-neutral-400">
                    Coming Soon
                  </span>
                )}
              </div>
              <div className="text-xs text-neutral-400 mt-0.5">{m.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
