/**
 * SegmentBuilder — Stage 2: Group metrics into segments, set weights
 *
 * Segment weight: text % input (replaces slider).
 * Metric weight within segment: text % input (editable).
 * Validation: segment weights should sum to ~100% (shown visually).
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useScoringStore, useActiveScorecard } from '@/store/useScoringStore'
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'

export function SegmentBuilder() {
  const scorecard = useActiveScorecard()
  const updateSegmentWeight = useScoringStore(s => s.updateSegmentWeight)
  const removeSegment = useScoringStore(s => s.removeSegment)
  const addSegment = useScoringStore(s => s.addSegment)
  const updateMetric = useScoringStore(s => s.updateMetric)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newSegName, setNewSegName] = useState('')

  if (!scorecard) return null

  const handleAddSegment = () => {
    if (!newSegName.trim()) return
    addSegment({
      id: `seg_${Date.now()}`,
      name: newSegName.trim(),
      metrics: [],
      segmentWeight: 0.1,
    })
    setNewSegName('')
  }

  // Sum of all segment weights for validation
  const totalWeight = scorecard.segments.reduce((sum, s) => sum + s.segmentWeight, 0)
  const totalPct = Math.round(totalWeight * 100)
  const isValidTotal = totalPct >= 99 && totalPct <= 101  // Allow ±1% rounding

  return (
    <div className="space-y-2">
      {/* Weight sum indicator */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-medium text-neutral-400">Segments</span>
        <span className={cn(
          'text-xs font-mono',
          isValidTotal ? 'text-success-400' : 'text-warning-400',
        )}>
          Total: {totalPct}%
          {!isValidTotal && ' (should be 100%)'}
        </span>
      </div>

      {scorecard.segments.map(segment => {
        const isExpanded = expandedId === segment.id
        // Sum of metric weights within this segment
        const metricWeightSum = segment.metrics.reduce((sum, m) => sum + (m.weight || 0), 0)
        const metricPct = Math.round(metricWeightSum * 100)

        return (
          <motion.div
            key={segment.id}
            layout
            className="rounded-xl bg-dark-800/60 border border-white/5 overflow-hidden"
          >
            {/* Segment header */}
            <div className="flex items-center gap-3 px-3 py-3">
              <button onClick={() => setExpandedId(isExpanded ? null : segment.id)}>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">{segment.name}</div>
                <div className="text-xs text-neutral-400">{segment.metrics.length} metrics</div>
              </div>

              {/* Weight text input */}
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={parseFloat((segment.segmentWeight * 100).toFixed(1))}
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

              <button
                onClick={() => removeSegment(segment.id)}
                className="p-1.5 rounded-md text-neutral-500 hover:text-destructive-400 hover:bg-destructive-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Expanded: show metrics with editable weights */}
            {isExpanded && (
              <div className="px-3 pb-3 border-t border-white/5 pt-2">
                {segment.metrics.length === 0 ? (
                  <div className="text-xs text-neutral-400 py-2">No metrics in this segment</div>
                ) : (
                  <div className="space-y-1.5">
                    {/* Metric weight sum */}
                    <div className="flex items-center justify-end px-2">
                      <span className={cn(
                        'text-xs font-mono',
                        metricPct >= 99 && metricPct <= 101 ? 'text-success-400' : 'text-warning-400',
                      )}>
                        Metric weights: {metricPct}%
                      </span>
                    </div>
                    {segment.metrics.map(m => (
                      <div key={m.id} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-dark-900/30">
                        <span className="text-sm text-neutral-300 truncate flex-1">{m.name}</span>
                        <div className="flex items-center gap-1 ml-2">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={0.5}
                            value={m.weight ? parseFloat((m.weight * 100).toFixed(1)) : 0}
                            onChange={e => {
                              const val = parseFloat(e.target.value)
                              if (!isNaN(val) && val >= 0 && val <= 100) {
                                updateMetric(segment.id, m.id, { weight: val / 100 })
                              }
                            }}
                            className="w-14 px-1.5 py-0.5 bg-dark-700/60 border border-white/10 rounded text-xs font-mono text-white text-right focus:outline-none focus:border-primary-500/40"
                          />
                          <span className="text-xs text-neutral-400">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {segment.description && (
                  <div className="text-xs text-neutral-400 mt-2">{segment.description}</div>
                )}
              </div>
            )}
          </motion.div>
        )
      })}

      {/* Add segment */}
      <div className="flex items-center gap-2 mt-2">
        <input
          type="text"
          value={newSegName}
          onChange={e => setNewSegName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddSegment()}
          placeholder="New segment name..."
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
  )
}
