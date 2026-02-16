/**
 * PipelineReviewPanel — Stage 4: Read-only summary of pipeline config (Stages 1-3)
 *
 * In the 5-stage pipeline, this shows in Stage 4 (Review & Run) so users can
 * verify all configuration before triggering the combined scoring + backtest run.
 *
 * Sections:
 *   1. Metrics — selected metrics by segment
 *   2. Scorecard — segment weights, composite formula, verdict thresholds
 *   3. Configuration — stock selection, date range, benchmark
 */

import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useScoringStore, useActiveScorecard, useReviewSnapshot } from '@/store/useScoringStore'
import { ReviewSectionCard } from './ReviewSectionCard'
import { FileText } from 'lucide-react'

export function PipelineReviewPanel() {
  const scorecard = useActiveScorecard()
  const snapshot = useReviewSnapshot()
  const generateReviewSnapshot = useScoringStore(s => s.generateReviewSnapshot)
  const editFromReview = useScoringStore(s => s.editFromReview)

  // Auto-generate snapshot when entering review
  useEffect(() => {
    generateReviewSnapshot()
  }, [])

  if (!snapshot || !scorecard) {
    return (
      <div className="text-center py-8 text-neutral-500 text-sm">
        No pipeline configuration to review. Complete earlier stages first.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Version badge */}
      <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-dark-800/60 border border-white/5">
        <FileText className="w-4 h-4 text-primary-400" />
        <div>
          <div className="text-sm font-semibold text-white">
            {scorecard.versionInfo.name}
            <span className="text-xs text-primary-400 ml-2">{scorecard.versionInfo.displayVersion}</span>
          </div>
          {scorecard.versionInfo.sourceReference && (
            <div className="text-[10px] text-neutral-500">{scorecard.versionInfo.sourceReference}</div>
          )}
        </div>
      </div>

      {/* Stage 1: Metrics */}
      <ReviewSectionCard
        stageNumber={1}
        title="Metrics"
        summary={`${snapshot.selectedMetricsSummary.totalMetrics} metrics across ${snapshot.selectedMetricsSummary.bySegment.length} segments`}
        onEdit={() => editFromReview(1)}
      >
        <div className="space-y-1.5">
          {snapshot.selectedMetricsSummary.bySegment.map(seg => (
            <div key={seg.segmentName} className="flex items-center justify-between text-xs">
              <span className="text-neutral-300">{seg.segmentName}</span>
              <span className="text-neutral-500">{seg.metricCount} metrics</span>
            </div>
          ))}
        </div>
      </ReviewSectionCard>

      {/* Stage 2: Scorecard */}
      <ReviewSectionCard
        stageNumber={2}
        title="Scorecard Structure"
        summary={`${snapshot.segmentsSummary.totalSegments} segments • ${snapshot.segmentsSummary.compositeFormula}`}
        onEdit={() => editFromReview(2)}
      >
        <div className="space-y-2">
          {/* Segments with weights */}
          <div className="space-y-1.5">
            {snapshot.segmentsSummary.segments.map(seg => (
              <div key={seg.name} className="flex items-center gap-2">
                <div className="flex-1 text-xs text-neutral-300">{seg.name}</div>
                <div className="w-24 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${seg.weight * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-neutral-500 w-8 text-right">
                  {Math.round(seg.weight * 100)}%
                </span>
              </div>
            ))}
          </div>

          {/* Formula */}
          <div className="mt-2 px-2 py-1.5 rounded-lg bg-dark-700/40 text-[10px] text-neutral-400 font-mono">
            {snapshot.segmentsSummary.compositeFormula}
          </div>

          {/* Verdict thresholds */}
          <div className="flex gap-1 mt-2">
            {scorecard.verdictThresholds.map(vt => (
              <div
                key={vt.verdict}
                className={cn('flex-1 text-center py-1 rounded text-[9px] font-medium', vt.color)}
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                {vt.verdict}
              </div>
            ))}
          </div>
        </div>
      </ReviewSectionCard>

      {/* Stage 3: Configuration (stocks + dates + benchmark) */}
      <ReviewSectionCard
        stageNumber={3}
        title="Run Configuration"
        summary={buildConfigSummary(snapshot)}
        onEdit={() => editFromReview(3)}
      >
        <div className="space-y-3">
          {/* Stock selection */}
          {snapshot.stockSelectionSummary && (
            <div>
              <div className="text-[10px] text-neutral-500 mb-1">Stock Selection</div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-white font-medium">
                  {snapshot.stockSelectionSummary.totalStocks === -1
                    ? 'Filter-based'
                    : `${snapshot.stockSelectionSummary.totalStocks} stocks`}
                </span>
                <span className="text-neutral-600">•</span>
                <span className="text-neutral-400 capitalize">
                  {snapshot.stockSelectionSummary.selectionMode} selection
                </span>
              </div>
              {snapshot.stockSelectionSummary.stockNames.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {snapshot.stockSelectionSummary.stockNames.slice(0, 8).map(name => (
                    <span
                      key={name}
                      className="px-2 py-0.5 rounded bg-dark-700/60 text-[10px] text-neutral-400"
                    >
                      {name}
                    </span>
                  ))}
                  {snapshot.stockSelectionSummary.stockNames.length > 8 && (
                    <span className="px-2 py-0.5 rounded bg-dark-700/60 text-[10px] text-neutral-500">
                      +{snapshot.stockSelectionSummary.stockNames.length - 8} more
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Date range */}
          {snapshot.dateConfig ? (
            <div>
              <div className="text-[10px] text-neutral-500 mb-1">Date Range</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <div className="text-[10px] text-neutral-500">From</div>
                  <div className="text-xs text-white">{snapshot.dateConfig.from}</div>
                </div>
                <div>
                  <div className="text-[10px] text-neutral-500">To</div>
                  <div className="text-xs text-white">{snapshot.dateConfig.to}</div>
                </div>
                <div>
                  <div className="text-[10px] text-neutral-500">Interval</div>
                  <div className="text-xs text-white capitalize">{snapshot.dateConfig.interval}</div>
                </div>
                <div>
                  <div className="text-[10px] text-neutral-500">Benchmark</div>
                  <div className="text-xs text-white">{snapshot.dateConfig.benchmark ?? 'None'}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-neutral-500">
              Set date range in Stage 3 to see configuration here.
            </div>
          )}
        </div>
      </ReviewSectionCard>
    </div>
  )
}

/** Build a short summary string for the configuration section header */
function buildConfigSummary(snapshot: NonNullable<ReturnType<typeof useReviewSnapshot>>): string {
  const parts: string[] = []

  if (snapshot.stockSelectionSummary) {
    const count = snapshot.stockSelectionSummary.totalStocks
    parts.push(count === -1 ? `${snapshot.stockSelectionSummary.selectionMode} filter` : `${count} stocks`)
  }

  if (snapshot.dateConfig) {
    parts.push(`${snapshot.dateConfig.from} → ${snapshot.dateConfig.to}`)
    parts.push(snapshot.dateConfig.interval)
  }

  return parts.length > 0 ? parts.join(' • ') : 'Not configured'
}
