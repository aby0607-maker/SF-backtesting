/**
 * SegmentBuilder — Stage 2: Group metrics into segments, set weights
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

  return (
    <div className="space-y-2">
      {scorecard.segments.map(segment => {
        const isExpanded = expandedId === segment.id
        return (
          <motion.div
            key={segment.id}
            layout
            className="rounded-xl bg-dark-800/60 border border-white/5 overflow-hidden"
          >
            {/* Segment header */}
            <div className="flex items-center gap-3 px-3 py-2.5">
              <button onClick={() => setExpandedId(isExpanded ? null : segment.id)}>
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">{segment.name}</div>
                <div className="text-[10px] text-neutral-500">{segment.metrics.length} metrics</div>
              </div>

              {/* Weight slider */}
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(segment.segmentWeight * 100)}
                  onChange={e => updateSegmentWeight(segment.id, Number(e.target.value) / 100)}
                  className="w-20 h-1 bg-dark-600 rounded-full appearance-none accent-primary-500"
                />
                <span className="text-xs font-mono text-neutral-400 w-8 text-right">
                  {Math.round(segment.segmentWeight * 100)}%
                </span>
              </div>

              <button
                onClick={() => removeSegment(segment.id)}
                className="p-1 rounded-md text-neutral-600 hover:text-destructive-400 hover:bg-destructive-500/10 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {/* Expanded: show metrics */}
            {isExpanded && (
              <div className="px-3 pb-2.5 border-t border-white/5 pt-2">
                {segment.metrics.length === 0 ? (
                  <div className="text-xs text-neutral-500 py-2">No metrics in this segment</div>
                ) : (
                  <div className="space-y-1">
                    {segment.metrics.map(m => (
                      <div key={m.id} className="flex items-center justify-between px-2 py-1 text-xs">
                        <span className="text-neutral-300">{m.name}</span>
                        <span className="text-neutral-500">
                          {m.weight ? `${(m.weight * 100).toFixed(0)}%` : 'equal'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {segment.description && (
                  <div className="text-[10px] text-neutral-500 mt-2">{segment.description}</div>
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
          className="flex-1 px-3 py-1.5 bg-dark-800/40 border border-white/5 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary-500/30"
        />
        <button
          onClick={handleAddSegment}
          disabled={!newSegName.trim()}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
            newSegName.trim()
              ? 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30'
              : 'bg-dark-800/40 text-neutral-600 cursor-not-allowed',
          )}
        >
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>
    </div>
  )
}
