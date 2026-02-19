/**
 * SegmentCard — Expandable card for a segment with inline metric rows
 *
 * Each metric row shows name, type icon, weight input, and expand chevron.
 * Expanding a metric reveals MetricDetailPanel (score bands, params, negative handling).
 * Segment weight is editable inline on the card header.
 * Used in Step 3 (Review & Tune).
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useScoringStore } from '@/store/useScoringStore'
import { MetricDetailPanel } from './MetricDetailPanel'
import type { ScorecardSegment, CompositeMetric } from '@/types/scoring'
import {
  ChevronDown,
  ChevronRight,
  Calculator,
  Database,
  ShieldAlert,
  X,
} from 'lucide-react'

interface SegmentCardProps {
  segment: ScorecardSegment
  defaultExpanded?: boolean
  /** Negative handling rules from the scorecard (for badge counts) */
  negativeRules?: { metricId: string }[]
}

export function SegmentCard({ segment, defaultExpanded = false, negativeRules = [] }: SegmentCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [expandedMetricId, setExpandedMetricId] = useState<string | null>(null)
  const updateSegmentWeight = useScoringStore(s => s.updateSegmentWeight)
  const updateMetric = useScoringStore(s => s.updateMetric)
  const removeMetric = useScoringStore(s => s.removeMetric)

  const metricWeightSum = segment.metrics.reduce((sum, m) => sum + (m.weight || 0), 0)
  const metricPct = Math.round(metricWeightSum * 100)

  return (
    <motion.div
      layout
      className="rounded-xl bg-dark-800/40 border border-white/5 overflow-hidden"
    >
      {/* Card header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-dark-700/20 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white">{segment.name}</div>
          <div className="text-xs text-neutral-500">{segment.metrics.length} metrics</div>
        </div>

        {/* Segment weight (editable) */}
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <input
            type="number"
            min={0}
            max={100}
            step={0.01}
            value={parseFloat((segment.segmentWeight * 100).toFixed(2))}
            onChange={e => {
              const val = parseFloat(e.target.value)
              if (!isNaN(val) && val >= 0 && val <= 100) {
                updateSegmentWeight(segment.id, val / 100)
              }
            }}
            className="w-16 px-2 py-1 bg-dark-700/60 border border-white/10 rounded text-sm font-mono text-white text-right focus:outline-none focus:border-primary-500/40"
          />
          <span className="text-xs text-neutral-400">%</span>
        </div>
      </div>

      {/* Card body — metric rows */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/5"
          >
            <div className="px-4 py-2">
              {/* Metric weight sum */}
              {segment.metrics.length > 0 && (
                <div className="flex items-center justify-end px-1 mb-2">
                  <span className={cn(
                    'text-xs font-mono',
                    metricPct >= 99 && metricPct <= 101 ? 'text-success-400' : 'text-warning-400',
                  )}>
                    Metric weights: {metricPct}%
                  </span>
                </div>
              )}

              {segment.metrics.length === 0 ? (
                <div className="text-xs text-neutral-400 py-3 text-center">
                  No metrics in this segment. Go to Step 2 to add metrics.
                </div>
              ) : (
                <div className="space-y-1">
                  {segment.metrics.map(metric => (
                    <MetricRow
                      key={metric.id}
                      metric={metric}
                      segmentId={segment.id}
                      isDetailExpanded={expandedMetricId === metric.id}
                      onToggleDetail={() => setExpandedMetricId(
                        expandedMetricId === metric.id ? null : metric.id
                      )}
                      negativeRuleCount={negativeRules.filter(r => r.metricId === metric.id).length}
                      updateMetric={updateMetric}
                      removeMetric={removeMetric}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Internal MetricRow ───

function MetricRow({
  metric,
  segmentId,
  isDetailExpanded,
  onToggleDetail,
  negativeRuleCount,
  updateMetric,
  removeMetric,
}: {
  metric: CompositeMetric
  segmentId: string
  isDetailExpanded: boolean
  onToggleDetail: () => void
  negativeRuleCount: number
  updateMetric: (segmentId: string, metricId: string, updates: Partial<CompositeMetric>) => void
  removeMetric: (segmentId: string, metricId: string) => void
}) {
  const isVPT = metric.scoringMethod === 'conditional_vpt'

  return (
    <div className="rounded-lg bg-dark-900/30 border border-white/[0.03] hover:border-white/10 transition-colors group">
      <div className="flex items-center gap-2 px-2 py-2">
        {/* Type icon */}
        {metric.type === 'formula' ? (
          <Calculator className="w-3.5 h-3.5 text-teal-400 shrink-0" />
        ) : (
          <Database className="w-3.5 h-3.5 text-primary-400 shrink-0" />
        )}

        {/* Name + badges */}
        <div className="flex-1 min-w-0">
          <div className="text-sm text-white truncate flex items-center gap-1.5">
            {metric.name}
            {isVPT && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 font-mono">VPT</span>
            )}
          </div>
          {negativeRuleCount > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-warning-400">
              <ShieldAlert className="w-3 h-3" />
              {negativeRuleCount} negative rules
            </span>
          )}
        </div>

        {/* Weight input */}
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
                updateMetric(segmentId, metric.id, { weight: val / 100 })
              }
            }}
            className="w-14 px-1.5 py-0.5 bg-dark-700/60 border border-white/10 rounded text-xs font-mono text-white text-right focus:outline-none focus:border-primary-500/40"
          />
          <span className="text-[10px] text-neutral-500">%</span>
        </div>

        {/* Expand chevron */}
        <button
          onClick={onToggleDetail}
          className="p-1 rounded-md text-neutral-500 hover:text-neutral-300 transition-colors"
          title="Configure score bands & parameters"
        >
          {isDetailExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {/* Remove button */}
        <button
          onClick={() => removeMetric(segmentId, metric.id)}
          className="p-1 rounded-md text-neutral-500 hover:text-destructive-400 hover:bg-destructive-500/10 transition-colors opacity-0 group-hover:opacity-100"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Expanded: MetricDetailPanel */}
      <AnimatePresence>
        {isDetailExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <MetricDetailPanel metric={metric} segmentId={segmentId} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
