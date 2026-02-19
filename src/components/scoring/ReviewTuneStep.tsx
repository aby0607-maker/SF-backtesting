/**
 * ReviewTuneStep — Step 3: Review & Tune
 *
 * Segments: Summary Header, Segment Cards (with inline MetricDetailPanel),
 * Composite Formula (condensed + advanced), Output Configuration (collapsed).
 */

import { useState } from 'react'
import { useActiveScorecard, useScoringStore } from '@/store/useScoringStore'
import { ScorecardSummaryHeader } from './ScorecardSummaryHeader'
import { SegmentCard } from './SegmentCard'
import { CompositeFormulaEditor } from './CompositeFormulaEditor'
import { VerdictThresholdEditor } from './VerdictThresholdEditor'
import { NormalizationSelector } from './NormalizationSelector'
import { ValuationConditionalsEditor } from './ValuationConditionalsEditor'
import { Equal, ChevronDown, ChevronUp, Sliders, Scale, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ReviewTuneStep() {
  const scorecard = useActiveScorecard()
  const updateSegmentWeight = useScoringStore(s => s.updateSegmentWeight)
  const [showAdvancedComposite, setShowAdvancedComposite] = useState(false)
  const [showOutputConfig, setShowOutputConfig] = useState(false)

  if (!scorecard) {
    return (
      <div className="text-center py-12 text-neutral-400 text-sm">
        No scorecard loaded. Go back to Step 1 to choose a starting point.
      </div>
    )
  }

  const negativeRules = scorecard.negativeHandlingRules || []
  const totalWeight = scorecard.segments.reduce((sum, s) => sum + s.segmentWeight, 0)
  const totalPct = Math.round(totalWeight * 100)
  const isValidTotal = totalPct >= 99 && totalPct <= 101

  // Check if any segment is valuation-type (for showing ValuationConditionalsEditor)
  const valuationSegment = scorecard.segments.find(s =>
    s.name.toLowerCase().includes('valuation')
  )

  return (
    <div className="space-y-4">
      {/* Segment A: Scorecard Summary Header */}
      <ScorecardSummaryHeader />

      {/* Segment B: Segment Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-medium text-neutral-400">Segments & Metrics</span>
          <div className="flex items-center gap-3">
            {scorecard.segments.length > 1 && (
              <button
                onClick={() => {
                  const count = scorecard.segments.length
                  const equalWeight = 1 / count
                  scorecard.segments.forEach(seg => {
                    updateSegmentWeight(seg.id, equalWeight)
                  })
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-neutral-400 hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
              >
                <Equal className="w-3 h-3" />
                Distribute Equally
              </button>
            )}
            <span className={cn(
              'text-xs font-mono',
              isValidTotal ? 'text-success-400' : 'text-warning-400',
            )}>
              Segment total: {totalPct}%
              {!isValidTotal && ' (should be 100%)'}
            </span>
          </div>
        </div>

        {scorecard.segments.map((segment, i) => (
          <SegmentCard
            key={segment.id}
            segment={segment}
            defaultExpanded={i === 0}
            negativeRules={negativeRules}
          />
        ))}
      </div>

      {/* Segment C: Composite Formula (condensed visible, advanced collapsed) */}
      <div className="rounded-xl bg-dark-800/30 border border-white/5 overflow-hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-2 text-xs font-medium text-neutral-400">
              <Scale className="w-3.5 h-3.5" />
              Composite Formula
            </span>
            <button
              onClick={() => setShowAdvancedComposite(!showAdvancedComposite)}
              className="flex items-center gap-1 text-[10px] text-neutral-500 hover:text-primary-400 transition-colors"
            >
              Advanced
              {showAdvancedComposite ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Condensed: visual weight bar */}
          <div className="flex h-3 rounded-full overflow-hidden gap-px mb-2">
            {scorecard.segments.map((seg, i) => {
              const pct = Math.round(seg.segmentWeight * 100)
              const colors = [
                'bg-primary-500', 'bg-teal-500', 'bg-warning-500',
                'bg-success-500', 'bg-purple-500', 'bg-pink-500',
              ]
              return (
                <div
                  key={seg.id}
                  className={cn('h-full transition-all', colors[i % colors.length])}
                  style={{ width: `${Math.max(pct, 3)}%` }}
                  title={`${seg.name}: ${pct}%`}
                />
              )
            })}
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] text-neutral-500">
            {scorecard.segments.map(seg => (
              <span key={seg.id}>{seg.name}: {Math.round(seg.segmentWeight * 100)}%</span>
            ))}
          </div>
        </div>

        {/* Advanced: full CompositeFormulaEditor */}
        {showAdvancedComposite && (
          <div className="px-4 pb-4 border-t border-white/5 pt-3">
            <CompositeFormulaEditor />
          </div>
        )}
      </div>

      {/* Segment D: Output Configuration (collapsed by default) */}
      <div className="rounded-xl bg-dark-800/30 border border-white/5 overflow-hidden">
        <button
          onClick={() => setShowOutputConfig(!showOutputConfig)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-dark-700/20 transition-colors"
        >
          <span className="flex items-center gap-2 text-xs text-neutral-400">
            <Sliders className="w-3.5 h-3.5" />
            Output Configuration (Verdicts, Normalization{valuationSegment ? ', Valuation Rules' : ''})
          </span>
          {showOutputConfig ? (
            <ChevronUp className="w-4 h-4 text-neutral-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-500" />
          )}
        </button>
        {showOutputConfig && (
          <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-4">
            {/* Micro 1: Verdict Thresholds */}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-2">Verdict Thresholds</div>
              <VerdictThresholdEditor />
            </div>

            {/* Micro 2: Normalization */}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-2">Normalization Method</div>
              <NormalizationSelector />
            </div>

            {/* Micro 3: Valuation Conditionals (only if valuation segment exists) */}
            {valuationSegment && (
              <div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-2">Valuation Conditional Rules</div>
                <ValuationConditionalsEditor />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
