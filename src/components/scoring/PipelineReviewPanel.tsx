/**
 * PipelineReviewPanel — Stage 6: Full read-only summary of all pipeline config
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

      {/* Stage 3: Scoring Results */}
      <ReviewSectionCard
        stageNumber={3}
        title="Scoring Results"
        summary={
          snapshot.scoringResultsSummary
            ? `${snapshot.scoringResultsSummary.universeSize} stocks scored`
            : 'Not yet scored'
        }
        onEdit={() => editFromReview(3)}
      >
        {snapshot.scoringResultsSummary ? (
          <div className="space-y-3">
            {/* Score distribution */}
            <div>
              <div className="text-[10px] text-neutral-500 mb-1">Score Distribution</div>
              <div className="flex gap-1">
                {snapshot.scoringResultsSummary.scoreDistribution.map(d => (
                  <div key={d.band} className="flex-1 text-center">
                    <div className="text-sm font-semibold text-white">{d.count}</div>
                    <div className="text-[9px] text-neutral-500">{d.band}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 */}
            <div>
              <div className="text-[10px] text-neutral-500 mb-1">Top 5</div>
              {snapshot.scoringResultsSummary.topFive.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between text-xs py-0.5">
                  <span className="text-neutral-300">{i + 1}. {s.name}</span>
                  <span className="text-success-400 font-mono">{s.score.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-xs text-neutral-500">Run scoring in Stage 3 to see results here.</div>
        )}
      </ReviewSectionCard>

      {/* Stage 4: Cohort */}
      <ReviewSectionCard
        stageNumber={4}
        title="Cohort Selection"
        summary={
          snapshot.cohortSummary
            ? `${snapshot.cohortSummary.totalStocks} stocks selected`
            : 'No cohort defined'
        }
        onEdit={() => editFromReview(4)}
      >
        {snapshot.cohortSummary ? (
          <div className="space-y-2">
            {/* Filters */}
            {snapshot.cohortSummary.filters.length > 0 && (
              <div>
                <div className="text-[10px] text-neutral-500 mb-1">Filters Applied</div>
                <div className="flex flex-wrap gap-1">
                  {snapshot.cohortSummary.filters.map((f, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-dark-700/60 text-[10px] text-neutral-400">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sector breakdown */}
            {snapshot.cohortSummary.sectorBreakdown.length > 0 && (
              <div>
                <div className="text-[10px] text-neutral-500 mb-1">Sector Breakdown</div>
                <div className="grid grid-cols-2 gap-1">
                  {snapshot.cohortSummary.sectorBreakdown.map(sb => (
                    <div key={sb.sector} className="flex items-center justify-between text-[10px]">
                      <span className="text-neutral-400">{sb.sector}</span>
                      <span className="text-neutral-500">{sb.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-neutral-500">Define a cohort in Stage 4 to see details here.</div>
        )}
      </ReviewSectionCard>

      {/* Stage 5: Date Range */}
      <ReviewSectionCard
        stageNumber={5}
        title="Backtest Configuration"
        summary={
          snapshot.dateConfig
            ? `${snapshot.dateConfig.from} → ${snapshot.dateConfig.to} (${snapshot.dateConfig.interval})`
            : 'No date range set'
        }
        onEdit={() => editFromReview(5)}
      >
        {snapshot.dateConfig ? (
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
        ) : (
          <div className="text-xs text-neutral-500">Set date range in Stage 5 to see configuration here.</div>
        )}
      </ReviewSectionCard>
    </div>
  )
}
