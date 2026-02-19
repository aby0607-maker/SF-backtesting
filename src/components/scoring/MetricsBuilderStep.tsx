/**
 * MetricsBuilderStep — Step 2: Metrics & Segments
 *
 * Two-column layout: Segments Panel (left) + Metric Catalog (right)
 * Bottom: Selected Metrics Summary + Custom Metric Creation (collapsed)
 */

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useScoringStore, useActiveScorecard } from '@/store/useScoringStore'
import { MetricCatalogBrowser } from './MetricCatalogBrowser'
import { FormulaBuilder } from './FormulaBuilder'
import { CustomMetricCreator } from './CustomMetricCreator'
import type { MetricCatalogEntry, PipelineStage } from '@/types/scoring'
import { Plus, Trash2, ChevronDown, ChevronUp, Wrench } from 'lucide-react'

export function MetricsBuilderStep() {
  const scorecard = useActiveScorecard()
  const addMetric = useScoringStore(s => s.addMetric)
  const addSegment = useScoringStore(s => s.addSegment)
  const removeSegment = useScoringStore(s => s.removeSegment)
  const [activeSegmentId, setActiveSegmentId] = useState<string>('')
  const [newSegName, setNewSegName] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  if (!scorecard) {
    return (
      <div className="text-center py-12 text-neutral-400 text-sm">
        No scorecard selected. Go back to Step 1 to pick a starting point.
      </div>
    )
  }

  const segments = scorecard.segments
  const effectiveActiveId = activeSegmentId || segments[0]?.id || ''

  // All selected metric IDs (across all segments) for "Added" badge
  const selectedIds = useMemo(
    () => new Set(segments.flatMap(seg => seg.metrics.map(m => m.id))),
    [segments]
  )

  // Total metrics
  const totalMetrics = segments.reduce((sum, seg) => sum + seg.metrics.length, 0)

  const handleSelectMetric = (metric: MetricCatalogEntry) => {
    if (!effectiveActiveId) return
    addMetric(effectiveActiveId, {
      id: metric.id,
      name: metric.name,
      type: 'raw',
      rawMetric: {
        id: metric.id,
        name: metric.name,
        cmots_source: metric.cmots_source,
        cmots_field: metric.cmots_field,
        unit: metric.unit,
        description: metric.description,
      },
      scoreBands: [],
      description: metric.description,
    })
  }

  const handleAddSegment = () => {
    if (!newSegName.trim()) return
    const id = `seg_${Date.now()}`
    addSegment({
      id,
      name: newSegName.trim(),
      metrics: [],
      segmentWeight: 0.1,
    })
    setNewSegName('')
    setActiveSegmentId(id)
  }

  // Segment colors for chips
  const SEGMENT_COLORS = [
    'bg-primary-500/20 text-primary-400',
    'bg-teal-500/20 text-teal-400',
    'bg-warning-500/20 text-warning-400',
    'bg-success-500/20 text-success-400',
    'bg-purple-500/20 text-purple-400',
    'bg-pink-500/20 text-pink-400',
  ]

  return (
    <div className="space-y-4">
      {/* Two-column: Segments + Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Segment A: Segments Panel (left, 1 col) */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-neutral-400">Segments</span>
          <div className="space-y-1">
            {segments.map((seg, i) => (
              <button
                key={seg.id}
                onClick={() => setActiveSegmentId(seg.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors group',
                  effectiveActiveId === seg.id
                    ? 'bg-primary-500/15 border border-primary-500/30 text-white'
                    : 'bg-dark-800/40 border border-white/5 text-neutral-400 hover:bg-dark-700/40',
                )}
              >
                <div className={cn('w-2 h-2 rounded-full shrink-0', SEGMENT_COLORS[i % SEGMENT_COLORS.length].split(' ')[0])} />
                <span className="flex-1 truncate">{seg.name}</span>
                <span className="text-xs text-neutral-500">{seg.metrics.length}</span>
                {segments.length > 1 && (
                  <button
                    onClick={e => { e.stopPropagation(); removeSegment(seg.id) }}
                    className="p-0.5 rounded text-neutral-600 hover:text-destructive-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </button>
            ))}
          </div>

          {/* Add Segment */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newSegName}
              onChange={e => setNewSegName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddSegment()}
              placeholder="New segment..."
              className="flex-1 px-3 py-2 bg-dark-800/40 border border-white/5 rounded-lg text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-primary-500/30"
            />
            <button
              onClick={handleAddSegment}
              disabled={!newSegName.trim()}
              className={cn(
                'flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                newSegName.trim()
                  ? 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30'
                  : 'bg-dark-800/40 text-neutral-500 cursor-not-allowed',
              )}
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        {/* Segment B: Metric Catalog (right, 2 cols) */}
        <div className="lg:col-span-2 flex flex-col">
          {/* Target segment indicator */}
          {segments.length > 1 && (
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="text-[10px] text-neutral-500">Adding to:</span>
              <select
                value={effectiveActiveId}
                onChange={e => setActiveSegmentId(e.target.value)}
                className="px-2 py-1 bg-dark-700/60 border border-white/10 rounded text-xs text-white focus:outline-none focus:border-primary-500/30"
              >
                {segments.map(seg => (
                  <option key={seg.id} value={seg.id}>{seg.name} ({seg.metrics.length})</option>
                ))}
              </select>
            </div>
          )}
          <MetricCatalogBrowser onSelectMetric={handleSelectMetric} selectedMetricIds={selectedIds} />
        </div>
      </div>

      {/* Segment C: Selected Metrics Summary */}
      <div className="px-3 py-2 rounded-lg bg-dark-800/30 border border-white/5 flex items-center gap-3 flex-wrap">
        <span className="text-xs text-neutral-400">
          {totalMetrics} metrics across {segments.length} segments
        </span>
        <div className="flex items-center gap-1.5">
          {segments.map((seg, i) => (
            <span
              key={seg.id}
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-medium',
                SEGMENT_COLORS[i % SEGMENT_COLORS.length],
              )}
            >
              {seg.name} ({seg.metrics.length})
            </span>
          ))}
        </div>
      </div>

      {/* Segment D: Custom Metric Creation (collapsed) */}
      <div className="rounded-xl bg-dark-800/30 border border-white/5 overflow-hidden">
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-dark-700/20 transition-colors"
        >
          <span className="flex items-center gap-2 text-xs text-neutral-400">
            <Wrench className="w-3.5 h-3.5" />
            Create Custom Metric
          </span>
          {showCustom ? (
            <ChevronUp className="w-4 h-4 text-neutral-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-500" />
          )}
        </button>
        {showCustom && (
          <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-2">Formula (combine 2 metrics)</div>
                <FormulaBuilder />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-2">Custom CMOTS Metric</div>
                <CustomMetricCreator />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
