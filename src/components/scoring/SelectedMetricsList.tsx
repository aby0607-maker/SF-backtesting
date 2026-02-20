/**
 * SelectedMetricsList — Stage 1: Shows metrics added to the current scorecard
 *
 * Simplified view: metric name, segment assignment dropdown, negative handling badge.
 * Weights and score bands are configured in Stage 2 (SegmentBuilder).
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useScoringStore, useActiveScorecard } from '@/store/useScoringStore'
import { X, GripVertical, Calculator, Database, ShieldAlert } from 'lucide-react'

function isGrowthMetric(metric: { id: string; rawMetric?: { cmots_field?: string } }) {
  return metric.id.includes('growth') || metric.rawMetric?.cmots_field?.includes('Growth')
}

export function SelectedMetricsList() {
  const scorecard = useActiveScorecard()
  const removeMetric = useScoringStore(s => s.removeMetric)
  const addMetric = useScoringStore(s => s.addMetric)
  const updateMetric = useScoringStore(s => s.updateMetric)

  if (!scorecard) {
    return (
      <div className="text-center py-8 text-neutral-400 text-sm">
        No scorecard selected. Pick a template or create one.
      </div>
    )
  }

  const negativeRules = scorecard.negativeHandlingRules || []
  const segments = scorecard.segments

  const allMetrics = segments.flatMap(seg =>
    seg.metrics.map(m => ({ ...m, segmentName: seg.name, segmentId: seg.id }))
  )

  if (allMetrics.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-400 text-sm">
        No metrics added yet. Browse the catalog to add metrics.
      </div>
    )
  }

  const handleSegmentChange = (metric: typeof allMetrics[0], newSegmentId: string) => {
    if (newSegmentId === metric.segmentId) return
    // Move metric: remove from old segment, add to new
    const { segmentName, segmentId, ...metricData } = metric
    removeMetric(segmentId, metric.id)
    addMetric(newSegmentId, metricData)
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-xs font-medium text-neutral-400">
          {allMetrics.length} metrics across {segments.length} segments
        </span>
      </div>

      <AnimatePresence>
        {allMetrics.map(metric => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-center gap-2 px-2 py-3 rounded-lg bg-dark-800/40 border border-white/5 hover:border-white/10 transition-colors group"
          >
            <GripVertical className="w-3 h-3 text-neutral-500 opacity-0 group-hover:opacity-100 cursor-grab" />

            {metric.type === 'formula' ? (
              <Calculator className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            ) : (
              <Database className="w-3.5 h-3.5 text-primary-400 shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <div className="text-sm text-white truncate">{metric.name}</div>
              <div className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
                {/* Segment assignment dropdown */}
                <select
                  value={metric.segmentId}
                  onChange={e => handleSegmentChange(metric, e.target.value)}
                  className="text-xs px-1.5 py-0.5 rounded bg-dark-700 text-neutral-300 border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500/30"
                >
                  {segments.map(seg => (
                    <option key={seg.id} value={seg.id}>{seg.name}</option>
                  ))}
                </select>

                {/* Negative handling badge */}
                {negativeRules.filter(r => r.metricId === metric.id).length > 0 && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-warning-500/10 text-warning-400 text-xs">
                    <ShieldAlert className="w-3 h-3" />
                    {negativeRules.filter(r => r.metricId === metric.id).length}
                  </span>
                )}
              </div>
            </div>

            {/* Growth period selector — for growth metrics */}
            {isGrowthMetric(metric) && (
              <select
                value={metric.growthPeriod ?? ''}
                onChange={e => updateMetric(metric.segmentId, metric.id, {
                  growthPeriod: e.target.value ? Number(e.target.value) as 2 | 3 | 5 : undefined,
                })}
                className="w-14 px-1 py-0.5 bg-dark-700/60 border border-white/10 rounded text-[10px] text-white"
              >
                <option value="">All</option>
                <option value="2">2Y</option>
                <option value="3">3Y</option>
                <option value="5">5Y</option>
              </select>
            )}

            {/* Calculation params indicator */}
            {metric.calculationParams && Object.keys(metric.calculationParams).length > 0 && (
              <span
                className="px-1.5 py-0.5 rounded bg-dark-700/60 text-[10px] text-neutral-400 cursor-default"
                title={Object.entries(metric.calculationParams).map(([k, v]) => `${k}: ${v}`).join(', ')}
              >
                {Object.keys(metric.calculationParams).length} params
              </span>
            )}

            {/* Metric weight input */}
            <div className="flex items-center gap-0.5 ml-1">
              <input
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={metric.weight ? parseFloat((metric.weight * 100).toFixed(2)) : 0}
                onChange={e => {
                  const val = parseFloat(e.target.value)
                  if (!isNaN(val) && val >= 0 && val <= 100) {
                    updateMetric(metric.segmentId, metric.id, { weight: val / 100 })
                  }
                }}
                className="w-14 px-1.5 py-0.5 bg-dark-700/60 border border-white/10 rounded text-xs font-mono text-white text-right focus:outline-none focus:border-primary-500/40"
              />
              <span className="text-[10px] text-neutral-500">%</span>
            </div>

            <button
              onClick={() => removeMetric(metric.segmentId, metric.id)}
              className="p-1 rounded-md text-neutral-500 hover:text-destructive-400 hover:bg-destructive-500/10 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
