/**
 * SelectedMetricsList — Stage 1: Shows metrics added to the current scorecard
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useScoringStore, useActiveScorecard } from '@/store/useScoringStore'
import { X, GripVertical, Calculator, Database, ShieldAlert } from 'lucide-react'

export function SelectedMetricsList() {
  const scorecard = useActiveScorecard()
  const removeMetric = useScoringStore(s => s.removeMetric)

  if (!scorecard) {
    return (
      <div className="text-center py-8 text-neutral-500 text-sm">
        No scorecard selected. Pick a template or create one.
      </div>
    )
  }

  const negativeRules = scorecard.negativeHandlingRules || []

  const allMetrics = scorecard.segments.flatMap(seg =>
    seg.metrics.map(m => ({ ...m, segmentName: seg.name, segmentId: seg.id }))
  )

  if (allMetrics.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500 text-sm">
        No metrics added yet. Browse the catalog to add metrics.
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-xs font-medium text-neutral-400">
          {allMetrics.length} metrics across {scorecard.segments.length} segments
        </span>
      </div>

      <AnimatePresence>
        {allMetrics.map(metric => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-center gap-2 px-2 py-2 rounded-lg bg-dark-800/40 border border-white/5 hover:border-white/10 transition-colors group"
          >
            <GripVertical className="w-3 h-3 text-neutral-600 opacity-0 group-hover:opacity-100 cursor-grab" />

            {metric.type === 'formula' ? (
              <Calculator className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            ) : (
              <Database className="w-3.5 h-3.5 text-primary-400 shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <div className="text-sm text-white truncate">{metric.name}</div>
              <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                {metric.segmentName} • {metric.scoreBands.length} bands
                {metric.weight && ` • ${(metric.weight * 100).toFixed(0)}%`}
                {negativeRules.filter(r => r.metricId === metric.id).length > 0 && (
                  <span className="inline-flex items-center gap-0.5 px-1 py-px rounded bg-warning-500/10 text-warning-400">
                    <ShieldAlert className="w-2.5 h-2.5" />
                    {negativeRules.filter(r => r.metricId === metric.id).length}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => removeMetric(metric.segmentId, metric.id)}
              className="p-1 rounded-md text-neutral-600 hover:text-destructive-400 hover:bg-destructive-500/10 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
