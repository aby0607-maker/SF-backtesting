/**
 * CompositeFormulaEditor — Stage 1: Editable composite formula
 *
 * Allows editing:
 * - Base weight (scaling factor for base group)
 * - Base vs overlay group assignment per segment
 * - Per-segment weights within the composite formula
 */

import { useActiveScorecard, useScoringStore } from '@/store/useScoringStore'
import { cn } from '@/lib/utils'
import type { CompositeFormula } from '@/types/scoring'

export function CompositeFormulaEditor() {
  const scorecard = useActiveScorecard()
  const updateCompositeFormula = useScoringStore(s => s.updateCompositeFormula)

  if (!scorecard) return null

  const { compositeFormula, segments } = scorecard

  // Build formula preview string
  const baseParts = compositeFormula.baseSegments
    .map(sw => {
      const seg = segments.find(s => s.id === sw.segmentId)
      return seg ? `${seg.name}(${(sw.weight * 100).toFixed(0)}%)` : null
    })
    .filter(Boolean)
  const overlayParts = (compositeFormula.overlaySegments ?? [])
    .map(sw => {
      const seg = segments.find(s => s.id === sw.segmentId)
      return seg ? `${seg.name}(${(sw.weight * 100).toFixed(0)}%)` : null
    })
    .filter(Boolean)

  const formulaStr = baseParts.length > 0
    ? `(${baseParts.join(' + ')}) × ${(compositeFormula.baseWeight * 100).toFixed(0)}%` +
      (overlayParts.length > 0 ? ` + ${overlayParts.join(' + ')}` : '')
    : 'No segments configured'

  // Total weight validation
  const totalBase = compositeFormula.baseSegments.reduce((sum, s) => sum + s.weight, 0)
  const totalOverlay = (compositeFormula.overlaySegments ?? []).reduce((sum, s) => sum + s.weight, 0)
  const effectiveTotal = totalBase * compositeFormula.baseWeight + totalOverlay
  const totalPct = Math.round(effectiveTotal * 100)
  const isValid = totalPct >= 99 && totalPct <= 101

  const updateFormula = (updates: Partial<CompositeFormula>) => {
    updateCompositeFormula({ ...compositeFormula, ...updates })
  }

  const moveToOverlay = (segmentId: string) => {
    const seg = compositeFormula.baseSegments.find(s => s.segmentId === segmentId)
    if (!seg) return
    updateFormula({
      baseSegments: compositeFormula.baseSegments.filter(s => s.segmentId !== segmentId),
      overlaySegments: [...(compositeFormula.overlaySegments ?? []), seg],
    })
  }

  const moveToBase = (segmentId: string) => {
    const seg = (compositeFormula.overlaySegments ?? []).find(s => s.segmentId === segmentId)
    if (!seg) return
    updateFormula({
      baseSegments: [...compositeFormula.baseSegments, seg],
      overlaySegments: (compositeFormula.overlaySegments ?? []).filter(s => s.segmentId !== segmentId),
    })
  }

  const updateSegmentWeight = (segmentId: string, group: 'base' | 'overlay', newWeight: number) => {
    if (group === 'base') {
      updateFormula({
        baseSegments: compositeFormula.baseSegments.map(s =>
          s.segmentId === segmentId ? { ...s, weight: newWeight } : s
        ),
      })
    } else {
      updateFormula({
        overlaySegments: (compositeFormula.overlaySegments ?? []).map(s =>
          s.segmentId === segmentId ? { ...s, weight: newWeight } : s
        ),
      })
    }
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
        <div className="text-sm font-mono text-primary-400">{formulaStr}</div>
      </div>

      {/* Base weight slider */}
      <div className="px-3 py-2 bg-dark-800/40 rounded-lg">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-neutral-400">Base Group Weight</span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={Math.round(compositeFormula.baseWeight * 100)}
              onChange={e => {
                const val = Number(e.target.value)
                if (!isNaN(val) && val >= 0 && val <= 100) {
                  updateFormula({ baseWeight: val / 100 })
                }
              }}
              className="w-14 px-1.5 py-0.5 bg-dark-700 border border-white/10 rounded text-xs font-mono text-white text-right focus:outline-none focus:border-primary-500/40"
            />
            <span className="text-[10px] text-neutral-500">%</span>
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(compositeFormula.baseWeight * 100)}
          onChange={e => updateFormula({ baseWeight: Number(e.target.value) / 100 })}
          className="w-full h-1 bg-dark-600 rounded-full appearance-none cursor-pointer accent-primary-500"
        />
      </div>

      {/* Base segments */}
      {compositeFormula.baseSegments.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1.5 px-1">Base Group</div>
          <div className="space-y-1">
            {compositeFormula.baseSegments.map(sw => {
              const seg = segments.find(s => s.id === sw.segmentId)
              if (!seg) return null
              return (
                <div key={sw.segmentId} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-800/40">
                  <span className="text-xs text-neutral-300 flex-1 truncate">{seg.name}</span>
                  <button
                    onClick={() => moveToOverlay(sw.segmentId)}
                    className="px-1.5 py-0.5 text-[10px] bg-dark-700 border border-white/10 rounded text-neutral-400 hover:text-white transition-colors"
                    title="Move to overlay group"
                  >
                    Overlay
                  </button>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={parseFloat((sw.weight * 100).toFixed(1))}
                      onChange={e => {
                        const val = parseFloat(e.target.value)
                        if (!isNaN(val) && val >= 0 && val <= 100) {
                          updateSegmentWeight(sw.segmentId, 'base', val / 100)
                        }
                      }}
                      className="w-14 px-1.5 py-0.5 bg-dark-700 border border-white/10 rounded text-xs font-mono text-white text-right focus:outline-none focus:border-primary-500/40"
                    />
                    <span className="text-[10px] text-neutral-500">%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Overlay segments */}
      {(compositeFormula.overlaySegments ?? []).length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1.5 px-1">Overlay Group</div>
          <div className="space-y-1">
            {(compositeFormula.overlaySegments ?? []).map(sw => {
              const seg = segments.find(s => s.id === sw.segmentId)
              if (!seg) return null
              return (
                <div key={sw.segmentId} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-800/40 border-l-2 border-primary-500/30">
                  <span className="text-xs text-neutral-300 flex-1 truncate">{seg.name}</span>
                  <button
                    onClick={() => moveToBase(sw.segmentId)}
                    className="px-1.5 py-0.5 text-[10px] bg-dark-700 border border-white/10 rounded text-neutral-400 hover:text-white transition-colors"
                    title="Move to base group"
                  >
                    Base
                  </button>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={parseFloat((sw.weight * 100).toFixed(1))}
                      onChange={e => {
                        const val = parseFloat(e.target.value)
                        if (!isNaN(val) && val >= 0 && val <= 100) {
                          updateSegmentWeight(sw.segmentId, 'overlay', val / 100)
                        }
                      }}
                      className="w-14 px-1.5 py-0.5 bg-dark-700 border border-white/10 rounded text-xs font-mono text-white text-right focus:outline-none focus:border-primary-500/40"
                    />
                    <span className="text-[10px] text-neutral-500">%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <p className="text-[10px] text-neutral-500">
        Base group is scaled by base weight, overlay segments are added directly.
      </p>
    </div>
  )
}
