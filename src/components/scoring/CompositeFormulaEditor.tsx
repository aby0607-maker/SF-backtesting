/**
 * CompositeFormulaEditor — Stage 1: Read-only formula preview
 *
 * Shows the composite formula derived from segment weights (managed by SegmentBuilder).
 * Weight editing is intentionally removed to avoid duplication — all weight
 * management happens in SegmentBuilder as the single source of truth.
 */

import { useActiveScorecard } from '@/store/useScoringStore'
import { cn } from '@/lib/utils'

export function CompositeFormulaEditor() {
  const scorecard = useActiveScorecard()

  if (!scorecard) return null

  const { compositeFormula, segments } = scorecard

  // All segments in a flat list (combine base + overlay for backwards compat)
  const allSegmentWeights = [
    ...compositeFormula.baseSegments,
    ...(compositeFormula.overlaySegments ?? []),
  ]

  // Build formula preview string
  const parts = allSegmentWeights
    .map(sw => {
      const seg = segments.find(s => s.id === sw.segmentId)
      return seg ? `${seg.name}(${(sw.weight * 100).toFixed(1)}%)` : null
    })
    .filter(Boolean)

  const formulaStr = parts.join(' + ')

  // Total weight for validation
  const totalPct = Math.round(allSegmentWeights.reduce((sum, s) => sum + s.weight, 0) * 100)
  const isValid = totalPct >= 99 && totalPct <= 101

  return (
    <div className="space-y-3">
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

      {/* Read-only segment weight display */}
      <div>
        <div className="text-xs font-medium text-neutral-400 mb-2">Segment Weights</div>
        <div className="space-y-1.5">
          {allSegmentWeights.map(sw => {
            const seg = segments.find(s => s.id === sw.segmentId)
            if (!seg) return null
            return (
              <div key={sw.segmentId} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-dark-800/40">
                <span className="text-sm text-neutral-300 flex-1">{seg.name}</span>
                <div className="flex items-center gap-2">
                  {/* Visual weight bar */}
                  <div className="w-20 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${sw.weight * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-neutral-400 w-10 text-right">
                    {(sw.weight * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-[10px] text-neutral-500 mt-2">
          Weights are managed in the Segments section above.
        </p>
      </div>
    </div>
  )
}
