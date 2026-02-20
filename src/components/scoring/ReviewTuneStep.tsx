/**
 * ReviewTuneStep — Step 3: Review & Tune
 *
 * Segments: Summary Header, Segment Cards (with inline MetricDetailPanel),
 * Composite Formula (condensed + advanced), Output Configuration (collapsed),
 * Preview Impact (live scoring against CSV reference stocks).
 */

import { useState, useMemo } from 'react'
import { useActiveScorecard, useScoringStore } from '@/store/useScoringStore'
import { ScorecardSummaryHeader } from './ScorecardSummaryHeader'
import { SegmentCard } from './SegmentCard'
import { CompositeFormulaEditor } from './CompositeFormulaEditor'
import { VerdictThresholdEditor } from './VerdictThresholdEditor'
import { NormalizationSelector } from './NormalizationSelector'
import { ValuationConditionalsEditor } from './ValuationConditionalsEditor'
import { Equal, ChevronDown, ChevronUp, Sliders, Scale, FlaskConical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { previewScore } from '@/lib/scoringEngine'
import { CSV_REFERENCE_STOCKS } from '@/data/csvReferenceData'

export function ReviewTuneStep() {
  const scorecard = useActiveScorecard()
  const updateSegmentWeight = useScoringStore(s => s.updateSegmentWeight)
  const [showAdvancedComposite, setShowAdvancedComposite] = useState(false)
  const [showOutputConfig, setShowOutputConfig] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

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

  // Live preview: score CSV reference stocks against current scorecard (updates on every edit)
  const previewResults = useMemo(() => {
    if (!showPreview) return []
    return CSV_REFERENCE_STOCKS.map(stock => {
      const result = previewScore(
        stock.rawMetrics,
        scorecard,
        { id: stock.id, name: stock.name, symbol: stock.symbol, sector: stock.sector, marketCap: stock.marketCap }
      )
      return {
        stock,
        live: result,
        delta: stock.expectedScores.overall != null
          ? Math.round((result.composite - stock.expectedScores.overall) * 100) / 100
          : null,
      }
    })
  }, [showPreview, scorecard])

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

      {/* Segment E: Preview Impact (live scoring against CSV reference stocks) */}
      <div className="rounded-xl bg-dark-800/30 border border-white/5 overflow-hidden">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-dark-700/20 transition-colors"
        >
          <span className="flex items-center gap-2 text-xs text-neutral-400">
            <FlaskConical className="w-3.5 h-3.5" />
            Preview Impact — Score CSV reference stocks with current model
          </span>
          {showPreview ? (
            <ChevronUp className="w-4 h-4 text-neutral-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-500" />
          )}
        </button>
        {showPreview && (
          <div className="px-4 pb-4 border-t border-white/5 pt-3">
            <p className="text-[10px] text-neutral-500 mb-3">
              Live scores using your current scorecard configuration vs SME expected scores.
              Tweak bands, weights, or formulas above and see the impact instantly.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-neutral-500 border-b border-white/5">
                    <th className="text-left py-1.5 pr-2">Stock</th>
                    {scorecard.segments.map(seg => (
                      <th key={seg.id} className="text-right py-1.5 px-2 whitespace-nowrap">{seg.name.replace(' Score', '')}</th>
                    ))}
                    <th className="text-right py-1.5 px-2">Overall</th>
                    <th className="text-right py-1.5 px-2">CSV</th>
                    <th className="text-right py-1.5 px-2">Delta</th>
                    <th className="text-left py-1.5 pl-2">Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {previewResults.map(({ stock, live, delta }) => (
                    <tr key={stock.id} className="border-b border-white/5 last:border-0 hover:bg-dark-700/20">
                      <td className="py-1.5 pr-2 text-neutral-300 font-medium whitespace-nowrap">{stock.name}</td>
                      {live.segments.map(seg => (
                        <td key={seg.id} className="text-right py-1.5 px-2 font-mono text-neutral-400">
                          {seg.score > 0 ? seg.score.toFixed(1) : <span className="text-neutral-600">N/A</span>}
                        </td>
                      ))}
                      <td className="text-right py-1.5 px-2 font-mono font-medium text-neutral-200">
                        {live.composite.toFixed(1)}
                      </td>
                      <td className="text-right py-1.5 px-2 font-mono text-neutral-500">
                        {stock.expectedScores.overall != null ? stock.expectedScores.overall.toFixed(1) : 'N/A'}
                      </td>
                      <td className={cn(
                        'text-right py-1.5 px-2 font-mono text-[10px]',
                        delta == null ? 'text-neutral-600' :
                        Math.abs(delta) <= 2 ? 'text-success-400' :
                        Math.abs(delta) <= 5 ? 'text-warning-400' :
                        'text-destructive-400'
                      )}>
                        {delta != null ? (delta >= 0 ? '+' : '') + delta.toFixed(1) : '—'}
                      </td>
                      <td className={cn('py-1.5 pl-2 text-[10px] font-medium', live.verdictColor)}>
                        {live.verdict}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-4 mt-2 text-[10px] text-neutral-600">
              <span><span className="text-success-400">Green</span> = within 2 pts</span>
              <span><span className="text-warning-400">Yellow</span> = 2-5 pts</span>
              <span><span className="text-destructive-400">Red</span> = &gt;5 pts</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
