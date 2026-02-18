/**
 * CompositeFormulaEditor — Stage 2: Visual weight editor for composite formula
 *
 * Flat weights only — no base/overlay distinction.
 * All segments use text % inputs (no sliders).
 * Live formula preview shows segment contributions.
 */

import { useScoringStore, useActiveScorecard } from '@/store/useScoringStore'
import { cn } from '@/lib/utils'
import type { CompositeFormula } from '@/types/scoring'

export function CompositeFormulaEditor() {
  const scorecard = useActiveScorecard()
  const updateCompositeFormula = useScoringStore(s => s.updateCompositeFormula)

  if (!scorecard) return null

  const { compositeFormula, segments } = scorecard

  // All segments in a flat list (combine base + overlay for backwards compat)
  const allSegmentWeights = [
    ...compositeFormula.baseSegments,
    ...(compositeFormula.overlaySegments ?? []),
  ]

  const updateSegmentFormulaWeight = (segmentId: string, weightPct: number) => {
    const weight = weightPct / 100
    const formula: CompositeFormula = {
      baseSegments: allSegmentWeights.map(s =>
        s.segmentId === segmentId ? { ...s, weight } : s
      ),
      baseWeight: 1.0,  // Always flat weights
    }
    updateCompositeFormula(formula)
  }

  // Build formula preview string
  const parts = allSegmentWeights
    .map(sw => {
      const seg = segments.find(s => s.id === sw.segmentId)
      return seg ? `${seg.name}(${(sw.weight * 100).toFixed(2)}%)` : null
    })
    .filter(Boolean)

  const formulaStr = parts.join(' + ')

  // Total weight for validation
  const totalPct = Math.round(allSegmentWeights.reduce((sum, s) => sum + s.weight, 0) * 100)
  const isValid = totalPct >= 99 && totalPct <= 101

  return (
    <div className="space-y-4">
      {/* Formula preview */}
      <div className="px-3 py-2.5 bg-dark-800/80 border border-white/5 rounded-lg">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs uppercase tracking-wider text-neutral-400">Composite Formula</span>
          <span className={cn(
            'text-xs font-mono',
            isValid ? 'text-success-400' : 'text-warning-400',
          )}>
            {totalPct}%
          </span>
        </div>
        <div className="text-sm font-mono text-primary-400">{formulaStr || 'No segments configured'}</div>
      </div>

      {/* Segment weights — flat list */}
      <div>
        <div className="text-xs font-medium text-neutral-400 mb-2">Segment Weights</div>
        <div className="space-y-1.5">
          {allSegmentWeights.map(sw => {
            const seg = segments.find(s => s.id === sw.segmentId)
            if (!seg) return null
            return (
              <div key={sw.segmentId} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-dark-800/40">
                <span className="text-sm text-neutral-300 flex-1">{seg.name}</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={parseFloat((sw.weight * 100).toFixed(2))}
                    onChange={e => {
                      const val = parseFloat(e.target.value)
                      if (!isNaN(val) && val >= 0 && val <= 100) {
                        updateSegmentFormulaWeight(sw.segmentId, val)
                      }
                    }}
                    className="w-16 px-2 py-1 bg-dark-700/60 border border-white/10 rounded text-sm font-mono text-white text-right focus:outline-none focus:border-primary-500/40"
                  />
                  <span className="text-xs text-neutral-400">%</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
