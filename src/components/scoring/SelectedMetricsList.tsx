/**
 * SelectedMetricsList — Stage 1: Shows metrics added to the current scorecard
 *
 * Each metric row shows: name, segment assignment, negative handling, weight,
 * growth period (for growth metrics), and calculation params (VPT, RSI, etc.)
 *
 * The params editor is toggled inline via a clickable badge — no modal overhead.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScoringStore, useActiveScorecard } from '@/store/useScoringStore'
import type { CompositeMetric } from '@/types/scoring'
import { X, GripVertical, Calculator, Database, ShieldAlert, SlidersHorizontal } from 'lucide-react'

// ─── Param Schema ───
// Maps metric categories to their editable calculation parameters.
// Each entry: key (stored in calculationParams), label, default, and options.

interface ParamDef {
  key: string
  label: string
  defaultVal: number
  options: number[]
}

const VPT_PARAMS: ParamDef[] = [
  { key: 'vptVolNumeratorDays', label: 'Vol Num', defaultVal: 5, options: [5, 10, 20] },
  { key: 'vptVolDenominatorDays', label: 'Vol Den', defaultVal: 50, options: [20, 50, 100] },
  { key: 'vptPriceChangeDays', label: 'Price Δ', defaultVal: 5, options: [5, 10, 20] },
]

const RSI_PARAMS: ParamDef[] = [
  { key: 'rsiPeriod', label: 'RSI Period', defaultVal: 14, options: [7, 14, 21] },
]

function getParamDefs(metric: CompositeMetric): ParamDef[] {
  const defs: ParamDef[] = []
  if (metric.scoringMethod === 'conditional_vpt') defs.push(...VPT_PARAMS)
  if (metric.id.includes('rsi')) defs.push(...RSI_PARAMS)
  return defs
}

function isGrowthMetric(metric: { id: string; rawMetric?: { cmots_field?: string } }) {
  return metric.id.includes('growth') || metric.rawMetric?.cmots_field?.includes('Growth')
}

// ─── Component ───

export function SelectedMetricsList() {
  const scorecard = useActiveScorecard()
  const removeMetric = useScoringStore(s => s.removeMetric)
  const addMetric = useScoringStore(s => s.addMetric)
  const updateMetric = useScoringStore(s => s.updateMetric)
  const [expandedMetricId, setExpandedMetricId] = useState<string | null>(null)

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
    const { segmentName, segmentId, ...metricData } = metric
    removeMetric(segmentId, metric.id)
    addMetric(newSegmentId, metricData)
  }

  const handleParamChange = (
    segmentId: string,
    metricId: string,
    currentParams: Record<string, number | string> | undefined,
    key: string,
    value: number,
  ) => {
    updateMetric(segmentId, metricId, {
      calculationParams: { ...currentParams, [key]: value },
    })
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
          const paramDefs = getParamDefs(metric)
          const hasParams = paramDefs.length > 0
          const isExpanded = expandedMetricId === metric.id

          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="rounded-lg bg-dark-800/40 border border-white/5 hover:border-white/10 transition-colors group"
            >
              {/* Main row */}
              <div className="flex items-center gap-2 px-2 py-3">
                <GripVertical className="w-3 h-3 text-neutral-500 opacity-0 group-hover:opacity-100 cursor-grab" />

                {metric.type === 'formula' ? (
                  <Calculator className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                ) : (
                  <Database className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{metric.name}</div>
                  <div className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
                    <select
                      value={metric.segmentId}
                      onChange={e => handleSegmentChange(metric, e.target.value)}
                      className="text-xs px-1.5 py-0.5 rounded bg-dark-700 text-neutral-300 border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500/30"
                    >
                      {segments.map(seg => (
                        <option key={seg.id} value={seg.id}>{seg.name}</option>
                      ))}
                    </select>

                    {negativeRules.filter(r => r.metricId === metric.id).length > 0 && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-warning-500/10 text-warning-400 text-xs">
                        <ShieldAlert className="w-3 h-3" />
                        {negativeRules.filter(r => r.metricId === metric.id).length}
                      </span>
                    )}
                  </div>
                </div>

                {/* Growth period selector */}
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

                {/* Calculation params toggle */}
                {hasParams && (
                  <button
                    onClick={() => setExpandedMetricId(isExpanded ? null : metric.id)}
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                      isExpanded
                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                        : 'bg-dark-700/60 text-neutral-400 hover:text-neutral-300 border border-transparent'
                    }`}
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    {paramDefs.length}
                  </button>
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
              </div>

              {/* Expanded params editor */}
              <AnimatePresence>
                {isExpanded && hasParams && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 pt-1 border-t border-white/5 flex flex-wrap gap-3">
                      {paramDefs.map(def => {
                        const currentVal = metric.calculationParams?.[def.key]
                        const val = currentVal != null ? Number(currentVal) : def.defaultVal

                        return (
                          <div key={def.key} className="flex items-center gap-1.5">
                            <label className="text-[10px] text-neutral-500 whitespace-nowrap">
                              {def.label}
                            </label>
                            <select
                              value={val}
                              onChange={e =>
                                handleParamChange(
                                  metric.segmentId,
                                  metric.id,
                                  metric.calculationParams,
                                  def.key,
                                  Number(e.target.value),
                                )
                              }
                              className="w-16 px-1 py-0.5 bg-dark-900/60 border border-white/10 rounded text-[10px] text-white focus:outline-none focus:border-primary-500/40"
                            >
                              {def.options.map(opt => (
                                <option key={opt} value={opt}>
                                  {opt}{def.key.includes('Days') ? 'D' : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
