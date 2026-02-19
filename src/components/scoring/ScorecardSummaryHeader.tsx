/**
 * ScorecardSummaryHeader — Read-only banner for Step 3 (Review & Tune)
 *
 * Shows: scorecard name, version, total segments, total metrics,
 * and composite formula preview string.
 */

import { useActiveScorecard } from '@/store/useScoringStore'
import { Layers, BarChart3, Tag } from 'lucide-react'

export function ScorecardSummaryHeader() {
  const scorecard = useActiveScorecard()

  if (!scorecard) {
    return (
      <div className="rounded-xl bg-dark-800/30 border border-white/5 px-4 py-3 text-sm text-neutral-400">
        No scorecard loaded. Go back to Step 1 to choose a starting point.
      </div>
    )
  }

  const totalMetrics = scorecard.segments.reduce((sum, seg) => sum + seg.metrics.length, 0)

  // Build human-readable formula string
  const baseParts = scorecard.compositeFormula.baseSegments
    .map(sw => {
      const seg = scorecard.segments.find(s => s.id === sw.segmentId)
      return seg ? `${seg.name}(${(sw.weight * 100).toFixed(0)}%)` : null
    })
    .filter(Boolean)

  let formulaStr = baseParts.join(' + ')
  if (scorecard.compositeFormula.baseWeight !== 1.0) {
    formulaStr = `(${formulaStr}) × ${scorecard.compositeFormula.baseWeight}`
  }
  if (scorecard.compositeFormula.overlaySegments) {
    for (const os of scorecard.compositeFormula.overlaySegments) {
      const seg = scorecard.segments.find(s => s.id === os.segmentId)
      if (seg) formulaStr += ` + ${seg.name} × ${os.weight}`
    }
  }

  return (
    <div className="rounded-xl bg-dark-800/30 border border-white/5 px-4 py-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">{scorecard.versionInfo.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-[10px] text-neutral-500">
                <Tag className="w-3 h-3" />
                {scorecard.versionInfo.displayVersion}
              </span>
              {scorecard.versionInfo.sourceReference && (
                <span className="text-[10px] text-neutral-600">
                  {scorecard.versionInfo.sourceReference}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[10px] text-neutral-400">
          <div className="flex items-center gap-1">
            <Layers className="w-3 h-3" />
            <span>{scorecard.segments.length} segments</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            <span>{totalMetrics} metrics</span>
          </div>
        </div>
      </div>

      {/* Formula preview */}
      {formulaStr && (
        <div className="mt-2 px-3 py-1.5 bg-dark-900/30 rounded-lg text-[10px] font-mono text-neutral-400 truncate">
          {formulaStr}
        </div>
      )}
    </div>
  )
}
