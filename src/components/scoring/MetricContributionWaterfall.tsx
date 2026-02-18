/**
 * MetricContributionWaterfall — Stage 7: Per-stock waterfall showing metric contributions
 */

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useCurrentScores } from '@/store/useScoringStore'
import { NaExplainer } from './NaExplainer'

export function MetricContributionWaterfall() {
  const currentRun = useCurrentScores()
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null)

  const stocks = currentRun?.stocks ?? []
  const selectedStock = stocks.find(s => s.stockId === selectedStockId) ?? stocks[0]

  if (!currentRun || stocks.length === 0) return null

  return (
    <div className="rounded-xl bg-dark-800/60 border border-white/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-medium text-white">Metric Contribution</div>
          <div className="text-[10px] text-neutral-500">Segment scores for selected stock</div>
        </div>

        {/* Stock selector */}
        <select
          value={selectedStock?.stockId ?? ''}
          onChange={e => setSelectedStockId(e.target.value)}
          className="px-2 py-1 bg-dark-700/40 border border-white/5 rounded-lg text-xs text-white focus:outline-none focus:border-primary-500/30"
        >
          {stocks.slice(0, 20).map(s => (
            <option key={s.stockId} value={s.stockId}>
              {s.stockName} ({s.normalizedScore.toFixed(1)})
            </option>
          ))}
        </select>
      </div>

      {selectedStock && (
        <>
          {/* Stock summary */}
          <div className="flex items-center gap-3 mb-3 px-2 py-1.5 rounded-lg bg-dark-700/40">
            <span className="text-sm font-semibold text-white">{selectedStock.stockName}</span>
            <span className={cn('text-sm font-bold font-mono', selectedStock.verdictColor)}>
              {selectedStock.normalizedScore.toFixed(1)}
            </span>
            <span className={cn('text-xs font-medium', selectedStock.verdictColor)}>
              {selectedStock.verdict}
            </span>
          </div>

          {/* Segment score bars */}
          <div className="space-y-2">
            {selectedStock.segmentResults.map(seg => (
              <div key={seg.segmentId} className="flex items-center gap-3">
                <span className="text-[10px] text-neutral-400 w-24 truncate text-right">{seg.segmentName}</span>
                <div className="flex-1 h-5 bg-dark-700/40 rounded-full overflow-hidden relative">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      seg.segmentScore >= 80 ? 'bg-success-500/60'
                        : seg.segmentScore >= 65 ? 'bg-teal-500/60'
                        : seg.segmentScore >= 50 ? 'bg-warning-500/60'
                        : seg.segmentScore >= 35 ? 'bg-warning-500/40'
                        : 'bg-destructive-500/60',
                    )}
                    style={{ width: `${seg.segmentScore}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-white/70">
                    {seg.segmentScore.toFixed(1)}
                  </span>
                </div>
                {seg.verdict && (
                  <span className={cn('text-[9px] w-16 text-right', seg.verdictColor)}>
                    {seg.verdict}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Per-metric breakdown (expanded) */}
          <div className="mt-3 space-y-1">
            <div className="text-[10px] text-neutral-500 mb-1">Individual Metric Scores</div>
            {selectedStock.segmentResults.flatMap(seg =>
              seg.metricScores.map(ms => (
                <div key={ms.metricId} className="flex items-center gap-2 text-[10px]">
                  <span className="text-neutral-500 w-32 truncate">{ms.metricName}</span>
                  <span className="text-neutral-400 font-mono w-12 text-right">
                    {ms.rawValue !== null ? ms.rawValue.toFixed(1) : (
                      <NaExplainer label="N/A" reason={ms.excludeReason} className="text-neutral-500" />
                    )}
                  </span>
                  <div className="flex-1 h-1.5 bg-dark-700/40 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        ms.normalizedScore >= 65 ? 'bg-success-500/60'
                          : ms.normalizedScore >= 40 ? 'bg-warning-500/60'
                          : 'bg-destructive-500/60',
                      )}
                      style={{ width: `${ms.normalizedScore}%` }}
                    />
                  </div>
                  <span className="font-mono text-neutral-300 w-8 text-right">
                    {ms.normalizedScore.toFixed(0)}
                  </span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
