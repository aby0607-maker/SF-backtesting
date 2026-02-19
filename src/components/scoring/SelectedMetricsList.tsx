/**
 * SelectedMetricsList — Stage 1: Shows metrics added to the current scorecard
 *
 * Shows: metric name, segment assignment, weight, growth period selector,
 * calculation params, scoring method badge, and negative handling badge.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScoringStore, useActiveScorecard } from '@/store/useScoringStore'
import { X, GripVertical, Calculator, Database, ShieldAlert, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

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

  const [expandedId, setExpandedId] = useState<string | null>(null)

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
        {allMetrics.map(metric => {
          const isExpanded = expandedId === metric.id
          const isGrowth = metric.name.toLowerCase().includes('growth') || metric.name.toLowerCase().includes('cagr')
          const isVPT = metric.scoringMethod === 'conditional_vpt'
          const hasParams = isGrowth || isVPT || (metric.calculationParams && Object.keys(metric.calculationParams).length > 0)

          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="rounded-lg bg-dark-800/40 border border-white/5 hover:border-white/10 transition-colors group"
            >
              <div className="flex items-center gap-2 px-2 py-3">
                <GripVertical className="w-3 h-3 text-neutral-500 opacity-0 group-hover:opacity-100 cursor-grab" />

                {metric.type === 'formula' ? (
                  <Calculator className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                ) : (
                  <Database className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate flex items-center gap-1.5">
                    {metric.name}
                    {isVPT && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 font-mono">VPT</span>
                    )}
                  </div>
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

                {/* Expand toggle for params */}
                {hasParams && (
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : metric.id)}
                    className="p-1 rounded-md text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                )}

                <button
                  onClick={() => removeMetric(metric.segmentId, metric.id)}
                  className="p-1 rounded-md text-neutral-500 hover:text-destructive-400 hover:bg-destructive-500/10 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Expanded params section */}
              {isExpanded && hasParams && (
                <div className="px-3 pb-3 pt-0 border-t border-white/5 space-y-2">
                  {/* Growth period selector */}
                  {isGrowth && (
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-[10px] text-neutral-500 w-20">Growth Period</span>
                      <div className="flex gap-0.5 bg-dark-800/60 border border-white/5 rounded-lg p-0.5">
                        {([2, 3, 5] as const).map(period => (
                          <button
                            key={period}
                            onClick={() => updateMetric(metric.segmentId, metric.id, { growthPeriod: period })}
                            className={cn(
                              'px-2 py-0.5 rounded-md text-xs font-medium transition-all',
                              (metric.growthPeriod ?? 5) === period
                                ? 'bg-primary-500/20 text-primary-400'
                                : 'text-neutral-500 hover:text-neutral-300',
                            )}
                          >
                            {period}Y
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* VPT calculation params */}
                  {isVPT && (
                    <div className="space-y-1.5 pt-2">
                      <div className="text-[10px] uppercase tracking-wider text-neutral-500">VPT Parameters</div>
                      {[
                        { key: 'vptVolNumeratorDays', label: 'Vol Numerator', default: 5, suffix: 'D' },
                        { key: 'vptVolDenominatorDays', label: 'Vol Denominator', default: 50, suffix: 'D' },
                        { key: 'vptPriceChangeDays', label: 'Price Period', default: 5, suffix: 'D' },
                      ].map(param => (
                        <div key={param.key} className="flex items-center gap-2">
                          <span className="text-[10px] text-neutral-400 w-24">{param.label}</span>
                          <input
                            type="number"
                            min={1}
                            max={200}
                            value={Number(metric.calculationParams?.[param.key] ?? param.default)}
                            onChange={e => {
                              const val = Number(e.target.value)
                              if (!isNaN(val) && val > 0) {
                                updateMetric(metric.segmentId, metric.id, {
                                  calculationParams: { ...metric.calculationParams, [param.key]: val },
                                })
                              }
                            }}
                            className="w-14 px-1.5 py-0.5 bg-dark-700 border border-white/10 rounded text-xs font-mono text-white text-right focus:outline-none focus:border-primary-500/40"
                          />
                          <span className="text-[10px] text-neutral-500">{param.suffix}</span>
                        </div>
                      ))}
                      <p className="text-[10px] text-neutral-500 mt-1">
                        TODO-SME: 5D price period inferred. Verify with Vishal.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
