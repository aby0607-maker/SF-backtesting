/**
 * VerdictThresholdEditor — Stage 2: Color-coded verdict band editor
 */

import { cn } from '@/lib/utils'
import { useScoringStore, useActiveScorecard } from '@/store/useScoringStore'
import type { VerdictThreshold } from '@/types/scoring'

const VERDICT_COLORS = [
  { color: 'bg-success-500', textColor: 'text-success-400', borderColor: 'border-success-500/30' },
  { color: 'bg-teal-500', textColor: 'text-teal-400', borderColor: 'border-teal-500/30' },
  { color: 'bg-warning-500', textColor: 'text-warning-400', borderColor: 'border-warning-500/30' },
  { color: 'bg-warning-500/70', textColor: 'text-warning-400', borderColor: 'border-warning-500/20' },
  { color: 'bg-destructive-500', textColor: 'text-destructive-400', borderColor: 'border-destructive-500/30' },
]

export function VerdictThresholdEditor() {
  const scorecard = useActiveScorecard()
  const updateVerdictThresholds = useScoringStore(s => s.updateVerdictThresholds)
  const setVerdictDisplayMode = useScoringStore(s => s.setVerdictDisplayMode)

  if (!scorecard) return null

  const { verdictThresholds, verdictDisplayMode } = scorecard

  const updateThreshold = (index: number, field: keyof VerdictThreshold, value: string | number) => {
    const updated = [...verdictThresholds]
    updated[index] = { ...updated[index], [field]: value }
    updateVerdictThresholds(updated)
  }

  return (
    <div className="space-y-4">
      {/* Display mode toggle */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-neutral-400">Verdict Style:</span>
        <div className="flex gap-0.5 bg-dark-800/60 border border-white/5 rounded-lg p-0.5">
          <button
            onClick={() => setVerdictDisplayMode('action')}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
              verdictDisplayMode === 'action'
                ? 'bg-primary-500/20 text-primary-400'
                : 'text-neutral-500 hover:text-neutral-300',
            )}
          >
            Action (BUY/SELL)
          </button>
          <button
            onClick={() => setVerdictDisplayMode('assessment')}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
              verdictDisplayMode === 'assessment'
                ? 'bg-primary-500/20 text-primary-400'
                : 'text-neutral-500 hover:text-neutral-300',
            )}
          >
            Assessment
          </button>
        </div>
      </div>

      {/* Visual band bar */}
      <div className="flex h-4 rounded-full overflow-hidden">
        {verdictThresholds.map((t, i) => {
          const width = t.maxScore - t.minScore
          const vc = VERDICT_COLORS[i % VERDICT_COLORS.length]
          return (
            <div
              key={i}
              className={cn('h-full flex items-center justify-center text-[8px] font-bold text-white/80', vc.color)}
              style={{ width: `${width}%` }}
            >
              {width >= 15 && (verdictDisplayMode === 'action' ? t.verdict : t.altVerdict ?? t.verdict)}
            </div>
          )
        })}
      </div>

      {/* Threshold rows */}
      <div className="space-y-1.5">
        {verdictThresholds.map((threshold, i) => {
          const vc = VERDICT_COLORS[i % VERDICT_COLORS.length]
          return (
            <div
              key={i}
              className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors', vc.borderColor, 'bg-dark-800/40')}
            >
              <div className={cn('w-2 h-2 rounded-full shrink-0', vc.color)} />

              {/* Score range */}
              <div className="flex items-center gap-1 text-xs">
                <span className="font-mono text-neutral-400">{threshold.minScore}</span>
                <span className="text-neutral-600">-</span>
                <span className="font-mono text-neutral-400">{threshold.maxScore}</span>
              </div>

              {/* Verdict label */}
              <input
                type="text"
                value={verdictDisplayMode === 'action' ? threshold.verdict : (threshold.altVerdict ?? threshold.verdict)}
                onChange={e => {
                  if (verdictDisplayMode === 'action') {
                    updateThreshold(i, 'verdict', e.target.value)
                  } else {
                    updateThreshold(i, 'altVerdict', e.target.value)
                  }
                }}
                className={cn(
                  'flex-1 px-2 py-0.5 bg-transparent border-none text-sm font-medium focus:outline-none',
                  vc.textColor,
                )}
              />

              {/* Description */}
              <input
                type="text"
                value={threshold.description ?? ''}
                onChange={e => updateThreshold(i, 'description', e.target.value)}
                placeholder="Description..."
                className="w-48 px-2 py-0.5 bg-transparent border-none text-[10px] text-neutral-500 focus:outline-none focus:text-neutral-400 placeholder:text-neutral-600"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
