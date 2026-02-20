/**
 * CompositeFormulaEditor — Stage 1: Editable composite formula
 *
 * Allows editing:
 * - Base weight (scaling factor for base group, e.g. 0.75)
 * - Base vs overlay group assignment per segment
 * - Segment weights within the formula
 */

import { useActiveScorecard, useScoringStore } from '@/store/useScoringStore'
import { cn } from '@/lib/utils'
import type { CompositeFormula } from '@/types/scoring'

export function CompositeFormulaEditor() {
  const scorecard = useActiveScorecard()
  const updateCompositeFormula = useScoringStore(s => s.updateCompositeFormula)

  if (!scorecard) return null

  const { compositeFormula, segments } = scorecard

  // All segments in flat list
  const allSegmentWeights = [
    ...compositeFormula.baseSegments,
    ...(compositeFormula.overlaySegments ?? []),
  ]

  // Build formula preview string
  const baseParts = compositeFormula.baseSegments
    .map(sw => {
      const seg = segments.find(s => s.id === sw.segmentId)
      return seg ? `${seg.name}×${(sw.weight * 100).toFixed(0)}%` : null
    })
    .filter(Boolean)

  const overlayParts = (compositeFormula.overlaySegments ?? [])
    .map(sw => {
      const seg = segments.find(s => s.id === sw.segmentId)
      return seg ? `${seg.name}×${(sw.weight * 100).toFixed(0)}%` : null
    })
    .filter(Boolean)

  const formulaStr = compositeFormula.overlaySegments?.length
    ? `(${baseParts.join(' + ')}) × ${(compositeFormula.baseWeight * 100).toFixed(0)}% + ${overlayParts.join(' + ')}`
    : baseParts.join(' + ')

  // Total weight for validation
  const totalPct = Math.round(allSegmentWeights.reduce((sum, s) => sum + s.weight, 0) * 100)
  const isValid = totalPct >= 99 && totalPct <= 101

  const isBaseSegment = (segId: string) =>
    compositeFormula.baseSegments.some(s => s.segmentId === segId)

  const toggleSegmentGroup = (segId: string) => {
    const current = isBaseSegment(segId)
    const sw = allSegmentWeights.find(s => s.segmentId === segId)
    if (!sw) return

    const updated: CompositeFormula = current
      ? {
          ...compositeFormula,
          baseSegments: compositeFormula.baseSegments.filter(s => s.segmentId !== segId),
          overlaySegments: [...(compositeFormula.overlaySegments ?? []), sw],
        }
      : {
          ...compositeFormula,
          baseSegments: [...compositeFormula.baseSegments, sw],
          overlaySegments: (compositeFormula.overlaySegments ?? []).filter(s => s.segmentId !== segId),
        }
    updateCompositeFormula(updated)
  }

  const updateSegmentWeight = (segId: string, newWeight: number) => {
    const updated: CompositeFormula = {
      ...compositeFormula,
      baseSegments: compositeFormula.baseSegments.map(s =>
        s.segmentId === segId ? { ...s, weight: newWeight } : s
      ),
      overlaySegments: (compositeFormula.overlaySegments ?? []).map(s =>
        s.segmentId === segId ? { ...s, weight: newWeight } : s
      ),
    }
    updateCompositeFormula(updated)
  }

  const updateBaseWeight = (bw: number) => {
    updateCompositeFormula({ ...compositeFormula, baseWeight: bw })
  }

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
        <div className="text-sm font-mono text-primary-400 break-words">{formulaStr || 'No segments configured'}</div>
      </div>

      {/* Base weight slider */}
      {(compositeFormula.overlaySegments ?? []).length > 0 && (
        <div className="px-3 py-2 bg-dark-800/40 border border-white/5 rounded-lg">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-neutral-400">Base Group Weight</span>
            <span className="text-xs font-mono text-white">{(compositeFormula.baseWeight * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={compositeFormula.baseWeight * 100}
            onChange={e => updateBaseWeight(Number(e.target.value) / 100)}
            className="w-full h-1.5 bg-dark-600 rounded-full appearance-none cursor-pointer accent-primary-500"
          />
        </div>
      )}

      {/* Segment list with group toggle + weight inputs */}
      <div>
        <div className="text-xs font-medium text-neutral-400 mb-2">Segments</div>
        <div className="space-y-1.5">
          {allSegmentWeights.map(sw => {
            const seg = segments.find(s => s.id === sw.segmentId)
            if (!seg) return null
            const inBase = isBaseSegment(sw.segmentId)
            return (
              <div key={sw.segmentId} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-800/40">
                {/* Base/Overlay toggle pill */}
                <button
                  onClick={() => toggleSegmentGroup(sw.segmentId)}
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-medium shrink-0 transition-colors',
                    inBase
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'bg-teal-500/20 text-teal-400',
                  )}
                >
                  {inBase ? 'Base' : 'Overlay'}
                </button>

                <span className="text-sm text-neutral-300 flex-1 truncate">{seg.name}</span>

                {/* Weight input */}
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${sw.weight * 100}%` }}
                    />
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={Math.round(sw.weight * 100)}
                    onChange={e => updateSegmentWeight(sw.segmentId, Number(e.target.value) / 100)}
                    className="w-12 px-1 py-0.5 bg-dark-800 border border-white/10 rounded text-xs font-mono text-white text-right"
                  />
                  <span className="text-[10px] text-neutral-500">%</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
