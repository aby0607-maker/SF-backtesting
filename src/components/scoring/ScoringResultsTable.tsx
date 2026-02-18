/**
 * ScoringResultsTable — Stage 5 Tab 1: Start/End scores with overlay drill-down
 *
 * Columns: Stock | Start Score | Start Rank | End Score | End Rank | Δ Score | Δ Price
 *
 * Start/End scores come from backtest.snapshots[0] and snapshots[last].
 * Δ Price comes from priceDeltaTable.deltas (last interval).
 * Click a stock row → opens StockDetailOverlay (parent handles via onSelectStock).
 * Existing segment expansion still works inline for quick glance.
 */

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useCombinedResult, useActiveScorecard, useBacktestResult } from '@/store/useScoringStore'
import type { SegmentResult, MetricScore } from '@/types/scoring'
import { TrendingUp, TrendingDown, Minus, Calendar, Layers, ExternalLink } from 'lucide-react'
import { NaExplainer } from './NaExplainer'

interface ScoringResultsTableProps {
  onSelectStock?: (stockId: string) => void
}

interface StockRow {
  stockId: string
  stockName: string
  stockSymbol: string
  sector: string
  startScore: number
  startRank: number
  endScore: number
  endRank: number
  deltaScore: number
  deltaPrice: number | null
  verdict: string
  verdictColor: string
  startSegmentResults: SegmentResult[]
  endSegmentResults: SegmentResult[]
}

/** Which score cell's drill-down is open */
type ScoreDrillDown = { stockId: string; type: 'start' | 'end' } | null

type SortField = 'name' | 'startScore' | 'endScore' | 'deltaScore' | 'deltaPrice'

export function ScoringResultsTable({ onSelectStock }: ScoringResultsTableProps) {
  const combinedResult = useCombinedResult()
  const backtestResult = useBacktestResult()
  const scorecard = useActiveScorecard()
  const [expandedSegment, setExpandedSegment] = useState<string | null>(null)
  const [scoreDrillDown, setScoreDrillDown] = useState<ScoreDrillDown>(null)
  const [sortField, setSortField] = useState<SortField>('endScore')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  // Build enriched rows with start/end scores from snapshots
  const rows = useMemo<StockRow[]>(() => {
    if (!combinedResult?.scoring) return []

    const snapshots = backtestResult?.snapshots ?? []
    const firstSnapshot = snapshots.length > 0 ? snapshots[0] : null
    const lastSnapshot = snapshots.length > 1 ? snapshots[snapshots.length - 1] : firstSnapshot

    // Build start score/rank/segments map
    const startMap = new Map<string, { score: number; rank: number; segments: SegmentResult[] }>()
    if (firstSnapshot) {
      const sorted = [...firstSnapshot.stockScores].sort((a, b) => b.normalizedScore - a.normalizedScore)
      sorted.forEach((s, i) => startMap.set(s.stockId, { score: s.normalizedScore, rank: i + 1, segments: s.segmentResults }))
    }

    // Build end score/rank/segments map
    const endMap = new Map<string, { score: number; rank: number; segments: SegmentResult[] }>()
    if (lastSnapshot) {
      const sorted = [...lastSnapshot.stockScores].sort((a, b) => b.normalizedScore - a.normalizedScore)
      sorted.forEach((s, i) => endMap.set(s.stockId, { score: s.normalizedScore, rank: i + 1, segments: s.segmentResults }))
    }

    // Build price delta map (total return = last interval value)
    const priceMap = new Map<string, number>()
    if (combinedResult.priceDeltaTable) {
      for (const row of combinedResult.priceDeltaTable) {
        const keys = Object.keys(row.deltas)
        if (keys.length > 0) {
          // Sort interval keys by their numeric portion
          const sortedKeys = keys.sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, '')) || 0
            const numB = parseInt(b.replace(/\D/g, '')) || 0
            return numA - numB
          })
          const lastKey = sortedKeys[sortedKeys.length - 1]
          priceMap.set(row.stockId, row.deltas[lastKey])
        }
      }
    }

    return combinedResult.scoring.stocks.map(stock => {
      const start = startMap.get(stock.stockId)
      const end = endMap.get(stock.stockId)

      return {
        stockId: stock.stockId,
        stockName: stock.stockName,
        stockSymbol: stock.stockSymbol,
        sector: stock.sector,
        startScore: start?.score ?? stock.normalizedScore,
        startRank: start?.rank ?? stock.rank,
        endScore: end?.score ?? stock.normalizedScore,
        endRank: end?.rank ?? stock.rank,
        deltaScore: (end?.score ?? stock.normalizedScore) - (start?.score ?? stock.normalizedScore),
        deltaPrice: priceMap.get(stock.stockId) ?? null,
        verdict: stock.verdict,
        verdictColor: stock.verdictColor,
        startSegmentResults: start?.segments ?? stock.segmentResults,
        endSegmentResults: end?.segments ?? stock.segmentResults,
      }
    })
  }, [combinedResult, backtestResult])

  if (rows.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500 text-sm">
        No scoring results. Run the scoring engine first.
      </div>
    )
  }

  // Sort rows (memoized to avoid re-sorting on every render)
  const sorted = useMemo(() => [...rows].sort((a, b) => {
    const dir = sortDir === 'desc' ? -1 : 1
    switch (sortField) {
      case 'name': return dir * a.stockName.localeCompare(b.stockName)
      case 'startScore': return dir * (a.startScore - b.startScore)
      case 'endScore': return dir * (a.endScore - b.endScore)
      case 'deltaScore': return dir * (a.deltaScore - b.deltaScore)
      case 'deltaPrice': return dir * ((a.deltaPrice ?? -Infinity) - (b.deltaPrice ?? -Infinity))
      default: return 0
    }
  }), [rows, sortField, sortDir])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir(field === 'name' ? 'asc' : 'desc')
    }
  }

  const toggleScoreDrillDown = (stockId: string, type: 'start' | 'end') => {
    setScoreDrillDown(prev =>
      prev?.stockId === stockId && prev.type === type ? null : { stockId, type }
    )
    setExpandedSegment(null)
  }

  const sortIndicator = (field: SortField) =>
    sortField === field ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''

  // Date context
  const snapshots = backtestResult?.snapshots ?? []
  const startDate = snapshots.length > 0
    ? formatDate(snapshots[0].date)
    : null
  const endDate = snapshots.length > 1
    ? formatDate(snapshots[snapshots.length - 1].date)
    : null
  const scoredAt = combinedResult?.scoring
    ? new Date(combinedResult.scoring.runTimestamp).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : null

  return (
    <div className="rounded-xl bg-dark-800/40 border border-white/5 overflow-hidden">
      {/* Context header */}
      <div className="flex items-center gap-4 px-4 py-2.5 border-b border-white/5 bg-dark-800/60">
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
          <Calendar className="w-3 h-3 text-primary-400" />
          {startDate && endDate ? (
            <span>
              <span className="text-white font-medium">{startDate}</span>
              <span className="text-neutral-500 mx-1">→</span>
              <span className="text-white font-medium">{endDate}</span>
            </span>
          ) : (
            <span>Scored: <span className="text-white font-medium">{scoredAt}</span></span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 ml-auto">
          <Layers className="w-3 h-3 text-primary-400" />
          <span className="text-white font-medium">{rows.length}</span> stocks
          {scorecard && (
            <>
              <span className="text-neutral-500 mx-0.5">·</span>
              <span className="text-primary-400 font-medium">{scorecard.versionInfo.displayVersion}</span>
            </>
          )}
        </div>
      </div>

      {/* Column header */}
      <div className="grid grid-cols-[1fr_70px_40px_70px_40px_60px_70px] px-4 py-2 border-b border-white/5 text-[9px] text-neutral-500 uppercase tracking-wider">
        <button onClick={() => toggleSort('name')} className="text-left hover:text-neutral-300 transition-colors">
          Stock{sortIndicator('name')}
        </button>
        <button onClick={() => toggleSort('startScore')} className="text-right hover:text-neutral-300 transition-colors">
          Start{sortIndicator('startScore')}
        </button>
        <span className="text-right">#</span>
        <button onClick={() => toggleSort('endScore')} className="text-right hover:text-neutral-300 transition-colors">
          End{sortIndicator('endScore')}
        </button>
        <span className="text-right">#</span>
        <button onClick={() => toggleSort('deltaScore')} className="text-right hover:text-neutral-300 transition-colors">
          Δ Score{sortIndicator('deltaScore')}
        </button>
        <button onClick={() => toggleSort('deltaPrice')} className="text-right hover:text-neutral-300 transition-colors">
          Δ Price{sortIndicator('deltaPrice')}
        </button>
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/5">
        {sorted.map(row => (
          <div key={row.stockId}>
            {/* Level 1: Stock row */}
            <div
              className="grid grid-cols-[1fr_70px_40px_70px_40px_60px_70px] px-4 py-2.5 items-center hover:bg-dark-700/30 transition-colors"
            >
              {/* Stock name + overlay link */}
              <div className="flex items-center gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-medium text-white truncate">{row.stockName}</div>
                  <div className="text-[10px] text-neutral-500">{row.stockSymbol}</div>
                </div>
                {onSelectStock && (
                  <button
                    onClick={() => onSelectStock(row.stockId)}
                    className="ml-1 p-1 rounded hover:bg-primary-500/20 transition-colors flex-shrink-0"
                    title="View interval details"
                  >
                    <ExternalLink className="w-3 h-3 text-primary-400" />
                  </button>
                )}
              </div>

              {/* Start Score — clickable for segment drill-down */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleScoreDrillDown(row.stockId, 'start') }}
                className={cn(
                  'text-right rounded px-1 -mx-1 py-0.5 transition-colors',
                  scoreDrillDown?.stockId === row.stockId && scoreDrillDown.type === 'start'
                    ? 'bg-primary-500/15 ring-1 ring-primary-500/30'
                    : 'hover:bg-dark-600/40',
                )}
                title="Click to view segment breakdown at start date"
              >
                <span className="text-xs font-semibold font-mono" style={{ color: getScoreColor(row.startScore) }}>
                  {row.startScore.toFixed(1)}
                </span>
              </button>

              {/* Start Rank */}
              <span className="text-[10px] text-neutral-500 text-right font-mono">#{row.startRank}</span>

              {/* End Score — clickable for segment drill-down */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleScoreDrillDown(row.stockId, 'end') }}
                className={cn(
                  'text-right rounded px-1 -mx-1 py-0.5 transition-colors',
                  scoreDrillDown?.stockId === row.stockId && scoreDrillDown.type === 'end'
                    ? 'bg-primary-500/15 ring-1 ring-primary-500/30'
                    : 'hover:bg-dark-600/40',
                )}
                title="Click to view segment breakdown at end date"
              >
                <span className="text-xs font-semibold font-mono" style={{ color: getScoreColor(row.endScore) }}>
                  {row.endScore.toFixed(1)}
                </span>
              </button>

              {/* End Rank */}
              <span className="text-[10px] text-neutral-500 text-right font-mono">#{row.endRank}</span>

              {/* Δ Score */}
              <div className="text-right">
                <span className={cn(
                  'text-[11px] font-medium font-mono',
                  row.deltaScore > 0 ? 'text-success-400' : row.deltaScore < 0 ? 'text-red-400' : 'text-neutral-500',
                )}>
                  {row.deltaScore > 0 ? '+' : ''}{row.deltaScore.toFixed(1)}
                </span>
              </div>

              {/* Δ Price */}
              <div className="text-right">
                {row.deltaPrice != null ? (
                  <span className={cn(
                    'text-[11px] font-medium font-mono',
                    row.deltaPrice > 0 ? 'text-success-400' : row.deltaPrice < 0 ? 'text-red-400' : 'text-neutral-500',
                  )}>
                    {row.deltaPrice > 0 ? '+' : ''}{row.deltaPrice.toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-[10px] text-neutral-500">—</span>
                )}
              </div>
            </div>

            {/* Score drill-down: segment breakdown for Start or End date */}
            <AnimatePresence>
              {scoreDrillDown?.stockId === row.stockId && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-3 pt-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-medium text-primary-400">
                        {scoreDrillDown.type === 'start' ? 'Start' : 'End'} Date Breakdown
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        {scoreDrillDown.type === 'start' ? startDate : endDate}
                      </span>
                    </div>

                    {(() => {
                      const segments = scoreDrillDown.type === 'start'
                        ? row.startSegmentResults
                        : row.endSegmentResults
                      return (
                        <>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {segments.map(segment => (
                              <SegmentCard
                                key={segment.segmentId}
                                segment={segment}
                                isExpanded={expandedSegment === `${scoreDrillDown.type}-${segment.segmentId}`}
                                onToggle={() => setExpandedSegment(
                                  prev => prev === `${scoreDrillDown.type}-${segment.segmentId}` ? null : `${scoreDrillDown.type}-${segment.segmentId}`
                                )}
                              />
                            ))}
                          </div>

                          <AnimatePresence>
                            {expandedSegment?.startsWith(`${scoreDrillDown.type}-`) && (
                              <MetricDetail
                                segment={segments.find(s => `${scoreDrillDown.type}-${s.segmentId}` === expandedSegment)}
                              />
                            )}
                          </AnimatePresence>
                        </>
                      )
                    })()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-white/5 text-[10px] text-neutral-500">
        {rows.length} stocks • Click Start/End scores for segment breakdown at that date • Click <ExternalLink className="w-2.5 h-2.5 inline" /> for interval drill-down
      </div>
    </div>
  )
}

// ─── Sub-components ───

function SegmentCard({
  segment,
  isExpanded,
  onToggle,
}: {
  segment: SegmentResult
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'rounded-lg p-2.5 text-left transition-all border',
        isExpanded
          ? 'bg-primary-500/10 border-primary-500/30'
          : 'bg-dark-700/40 border-white/5 hover:bg-dark-700/60',
      )}
    >
      <div className="text-[10px] text-neutral-400 mb-1">{segment.segmentName}</div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white">
          {segment.segmentScore.toFixed(1)}
        </span>
        {segment.verdict && (
          segment.verdict === 'N/A' ? (
            <NaExplainer label="N/A" reason={segment.naReason} className="text-[9px] font-medium text-neutral-500" />
          ) : (
            <span className={cn('text-[9px] font-medium', getVerdictTextColor(segment.verdict))}>
              {segment.verdict}
            </span>
          )
        )}
      </div>
      <div className="w-full h-1 bg-dark-600 rounded-full mt-1.5">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${segment.segmentScore}%`,
            backgroundColor: getScoreColor(segment.segmentScore),
          }}
        />
      </div>
    </button>
  )
}

function MetricDetail({ segment }: { segment?: SegmentResult }) {
  if (!segment) return null

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden"
    >
      <div className="mt-2 rounded-lg bg-dark-700/30 border border-white/5 overflow-hidden">
        <div className="grid grid-cols-[1fr_80px_60px_60px] px-3 py-1.5 border-b border-white/5 text-[9px] text-neutral-500 uppercase tracking-wider">
          <span>Metric</span>
          <span className="text-right">Raw Value</span>
          <span className="text-right">Score</span>
          <span className="text-right">Status</span>
        </div>
        <div className="divide-y divide-white/5">
          {segment.metricScores.map(metric => (
            <MetricRow key={metric.metricId} metric={metric} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function MetricRow({ metric }: { metric: MetricScore }) {
  return (
    <div className="grid grid-cols-[1fr_80px_60px_60px] px-3 py-1.5 items-center">
      <span className="text-[11px] text-neutral-300">{metric.metricName}</span>
      <span className="text-[11px] text-neutral-400 text-right font-mono">
        {metric.rawValue != null ? formatValue(metric.rawValue) : (
          <NaExplainer label="N/A" reason={metric.excludeReason} className="text-neutral-500" />
        )}
      </span>
      <div className="text-right">
        {!metric.isExcluded ? (
          <span className="text-[11px] font-medium" style={{ color: getScoreColor(metric.normalizedScore) }}>
            {metric.normalizedScore.toFixed(0)}
          </span>
        ) : (
          <NaExplainer label="—" reason={metric.excludeReason} className="text-[10px] text-neutral-500" />
        )}
      </div>
      <div className="text-right">
        {metric.isExcluded ? (
          <NaExplainer
            label={metric.excludeReason === 'No data available' ? 'N/A' : 'Excl.'}
            reason={metric.excludeReason}
            className="text-[9px] text-neutral-500"
          />
        ) : metric.normalizedScore >= 65 ? (
          <TrendingUp className="w-3 h-3 text-success-400 inline" />
        ) : metric.normalizedScore >= 35 ? (
          <Minus className="w-3 h-3 text-warning-400 inline" />
        ) : (
          <TrendingDown className="w-3 h-3 text-red-400 inline" />
        )}
      </div>
    </div>
  )
}

// ─── Helpers ───

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatValue(value: number): string {
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(1)}B`
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}K`
  if (Number.isInteger(value)) return value.toString()
  return value.toFixed(2)
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 65) return '#84cc16'
  if (score >= 50) return '#eab308'
  if (score >= 35) return '#f97316'
  return '#ef4444'
}

function getVerdictTextColor(verdict: string): string {
  const v = verdict.toUpperCase()
  if (v.includes('STRONG') || v.includes('EXCELLENT') || v.includes('BULLISH')) return 'text-success-400'
  if (v.includes('BUY') || v.includes('GOOD') || v.includes('MODERATE')) return 'text-lime-400'
  if (v.includes('HOLD') || v.includes('FAIR') || v.includes('NEUTRAL')) return 'text-warning-400'
  if (v.includes('REVIEW') || v.includes('WEAK')) return 'text-orange-400'
  return 'text-red-400'
}
