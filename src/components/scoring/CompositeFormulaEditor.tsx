/**
 * CompositeFormulaEditor — Stage 2: Visual weight editor for composite formula
 *
 * Shows: segment weight sliders, base vs overlay distinction, live formula preview.
 */

import { useScoringStore, useActiveScorecard } from '@/store/useScoringStore'
import type { CompositeFormula } from '@/types/scoring'

export function CompositeFormulaEditor() {
  const scorecard = useActiveScorecard()
  const updateCompositeFormula = useScoringStore(s => s.updateCompositeFormula)

  if (!scorecard) return null

  const { compositeFormula, segments } = scorecard

  const updateBaseWeight = (value: number) => {
    updateCompositeFormula({ ...compositeFormula, baseWeight: value / 100 })
  }

  const updateSegmentFormulaWeight = (segmentId: string, weight: number, isOverlay: boolean) => {
    const formula: CompositeFormula = { ...compositeFormula }
    if (isOverlay) {
      formula.overlaySegments = (formula.overlaySegments ?? []).map(s =>
        s.segmentId === segmentId ? { ...s, weight: weight / 100 } : s
      )
    } else {
      formula.baseSegments = formula.baseSegments.map(s =>
        s.segmentId === segmentId ? { ...s, weight: weight / 100 } : s
      )
    }
    updateCompositeFormula(formula)
  }

  // Build formula preview string
  const baseParts = compositeFormula.baseSegments
    .map(bs => {
      const seg = segments.find(s => s.id === bs.segmentId)
      return seg ? `${seg.name}(${(bs.weight * 100).toFixed(0)}%)` : null
    })
    .filter(Boolean)
  const overlayParts = (compositeFormula.overlaySegments ?? [])
    .map(os => {
      const seg = segments.find(s => s.id === os.segmentId)
      return seg ? `${seg.name} × ${os.weight}` : null
    })
    .filter(Boolean)

  let formulaStr = baseParts.join(' + ')
  if (compositeFormula.baseWeight !== 1.0) {
    formulaStr = `(${formulaStr}) × ${compositeFormula.baseWeight}`
  }
  if (overlayParts.length > 0) {
    formulaStr += ' + ' + overlayParts.join(' + ')
  }

  return (
    <div className="space-y-4">
      {/* Formula preview */}
      <div className="px-3 py-2 bg-dark-800/80 border border-white/5 rounded-lg">
        <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Composite Formula</div>
        <div className="text-sm font-mono text-primary-400">{formulaStr || 'No segments configured'}</div>
      </div>

      {/* Base segments */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-neutral-400">Base Segments</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-500">Base Weight</span>
            <input
              type="range"
              min="10"
              max="100"
              value={Math.round(compositeFormula.baseWeight * 100)}
              onChange={e => updateBaseWeight(Number(e.target.value))}
              className="w-20 h-1 bg-dark-600 rounded-full appearance-none accent-primary-500"
            />
            <span className="text-xs font-mono text-neutral-400 w-8 text-right">
              {Math.round(compositeFormula.baseWeight * 100)}%
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          {compositeFormula.baseSegments.map(bs => {
            const seg = segments.find(s => s.id === bs.segmentId)
            if (!seg) return null
            return (
              <div key={bs.segmentId} className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-dark-800/40">
                <span className="text-sm text-neutral-300 flex-1">{seg.name}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(bs.weight * 100)}
                  onChange={e => updateSegmentFormulaWeight(bs.segmentId, Number(e.target.value), false)}
                  className="w-24 h-1 bg-dark-600 rounded-full appearance-none accent-teal-500"
                />
                <span className="text-xs font-mono text-teal-400 w-8 text-right">
                  {Math.round(bs.weight * 100)}%
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Overlay segments */}
      {compositeFormula.overlaySegments && compositeFormula.overlaySegments.length > 0 && (
        <div>
          <div className="text-xs font-medium text-neutral-400 mb-2">Overlay Segments</div>
          <div className="space-y-1.5">
            {compositeFormula.overlaySegments.map(os => {
              const seg = segments.find(s => s.id === os.segmentId)
              if (!seg) return null
              return (
                <div key={os.segmentId} className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-dark-800/40">
                  <span className="text-sm text-neutral-300 flex-1">{seg.name}</span>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={Math.round(os.weight * 100)}
                    onChange={e => updateSegmentFormulaWeight(os.segmentId, Number(e.target.value), true)}
                    className="w-24 h-1 bg-dark-600 rounded-full appearance-none accent-warning-500"
                  />
                  <span className="text-xs font-mono text-warning-400 w-8 text-right">
                    {Math.round(os.weight * 100)}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
