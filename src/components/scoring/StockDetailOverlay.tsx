/**
 * StockDetailOverlay — Full-screen modal with 3-level interval drill-down
 *
 * Level 1: Interval score table
 *   | Interval | Score | Rank | Verdict | Price Δ |
 *   Click a score → Level 2
 *
 * Level 2: Segment breakdown for that interval
 *   | Segment | Score | Verdict |
 *   Click a segment → Level 3
 *
 * Level 3: Metric evaluation for that segment
 *   | Metric | Raw Value | Score | Status |
 *
 * Data: backtest.snapshots[] for interval scores, priceDeltaTable for price deltas.
 */

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useBacktestResult, useCombinedResult } from '@/store/useScoringStore'
import type { SegmentResult } from '@/types/scoring'
import {
  X, ChevronRight, ChevronLeft, TrendingUp, TrendingDown, Minus,
  Calendar, BarChart3, Layers, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import { NaExplainer } from './NaExplainer'

interface StockDetailOverlayProps {
  stockId: string
  onClose: () => void
}

export function StockDetailOverlay({ stockId, onClose }: StockDetailOverlayProps) {
  const backtestResult = useBacktestResult()
  const combinedResult = useCombinedResult()
  const [selectedSnapshotIdx, setSelectedSnapshotIdx] = useState<number | null>(null)
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null)

  const snapshots = backtestResult?.snapshots ?? []

  // Find stock info from scoring results
  const stockInfo = combinedResult?.scoring?.stocks.find(s => s.stockId === stockId)

  // Get per-stock price performance from backtest comparisons (date-aligned, reliable)
  const stockPerformance = backtestResult?.comparisons?.find(c => c.targetStockId === stockId)?.targetPerformance

  // Build interval data: score + rank + price delta at each snapshot
  const intervals = useMemo(() => {
    if (snapshots.length === 0) return []

    // Build date→{cumulativeReturn, price} lookup from comparison's price performance
    const periodByDate = new Map<string, { cumulativeReturn: number; price: number }>()
    if (stockPerformance?.periods) {
      for (const p of stockPerformance.periods) {
        periodByDate.set(p.date.split('T')[0], { cumulativeReturn: p.cumulativeReturn, price: p.price })
      }
    }

    // Base price = the actual first trading day price used for return computation
    // (NOT periods[0].price, which may be a later sampled date)
    const basePrice = stockPerformance?.startPrice ?? stockPerformance?.periods?.[0]?.price ?? null

    return snapshots.map((snap, i) => {
      const stockScore = snap.stockScores.find(s => s.stockId === stockId)
      // Compute rank within this snapshot
      const sorted = [...snap.stockScores].sort((a, b) => b.normalizedScore - a.normalizedScore)
      const rank = sorted.findIndex(s => s.stockId === stockId) + 1

      // Price delta + price at this interval
      const snapDate = snap.date.split('T')[0]
      let priceDelta: number | null = null
      let priceAtInterval: number | null = null

      if (i === 0) {
        // Base interval — show base price
        priceAtInterval = basePrice
      } else {
        // Exact date match first, then closest date on or before
        const exact = periodByDate.get(snapDate)
        if (exact) {
          priceDelta = exact.cumulativeReturn
          priceAtInterval = exact.price
        } else if (stockPerformance?.periods) {
          let closestReturn: number | null = null
          let closestPrice: number | null = null
          for (const p of stockPerformance.periods) {
            if (p.date.split('T')[0] <= snapDate) {
              closestReturn = p.cumulativeReturn
              closestPrice = p.price
            }
          }
          priceDelta = closestReturn
          priceAtInterval = closestPrice
        }
      }

      return {
        date: snap.date,
        score: stockScore?.normalizedScore ?? 0,
        rank: rank > 0 ? rank : 0,
        totalStocks: snap.stockScores.length,
        verdict: stockScore?.verdict ?? '—',
        verdictColor: stockScore?.verdictColor ?? '',
        priceDelta,
        basePrice,
        priceAtInterval,
        segmentResults: stockScore?.segmentResults ?? [],
      }
    })
  }, [snapshots, stockId, stockPerformance])

  // Selected snapshot's segment data
  const selectedSnapshot = selectedSnapshotIdx !== null ? intervals[selectedSnapshotIdx] : null
  const selectedSegment = selectedSnapshot?.segmentResults.find(s => s.segmentId === selectedSegmentId)

  if (!stockInfo) {
    return (
      <Overlay onClose={onClose}>
        <div className="text-center py-12 text-neutral-500">
          Stock data not found.
        </div>
      </Overlay>
    )
  }

  return (
    <Overlay onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* Back navigation for drill-down levels */}
          {selectedSegmentId ? (
            <button
              onClick={() => setSelectedSegmentId(null)}
              className="p-1.5 rounded-lg bg-dark-700/60 hover:bg-dark-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-neutral-400" />
            </button>
          ) : selectedSnapshotIdx !== null ? (
            <button
              onClick={() => { setSelectedSnapshotIdx(null); setSelectedSegmentId(null) }}
              className="p-1.5 rounded-lg bg-dark-700/60 hover:bg-dark-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-neutral-400" />
            </button>
          ) : null}

          <div>
            <h2 className="text-lg font-semibold text-white">{stockInfo.stockName}</h2>
            <div className="flex items-center gap-2 text-[11px] text-neutral-400">
              <span className="font-mono">{stockInfo.stockSymbol}</span>
              <span className="text-neutral-600">·</span>
              <span>{stockInfo.sector}</span>
              <span className="text-neutral-600">·</span>
              <span className={cn(
                'px-1.5 py-0.5 rounded text-[10px] font-medium',
                getVerdictStyle(stockInfo.verdict),
              )}>
                {stockInfo.verdict}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-dark-700/60 transition-colors"
        >
          <X className="w-5 h-5 text-neutral-400" />
        </button>
      </div>

      {/* Breadcrumb */}
      <div className="px-6 py-2 text-[10px] text-neutral-500 flex items-center gap-1 border-b border-white/5">
        <button
          onClick={() => { setSelectedSnapshotIdx(null); setSelectedSegmentId(null) }}
          className={cn(
            'hover:text-primary-400 transition-colors',
            selectedSnapshotIdx === null && 'text-primary-400 font-medium',
          )}
        >
          Intervals ({intervals.length})
        </button>
        {selectedSnapshot && (
          <>
            <ChevronRight className="w-3 h-3" />
            <button
              onClick={() => setSelectedSegmentId(null)}
              className={cn(
                'hover:text-primary-400 transition-colors',
                selectedSnapshotIdx !== null && !selectedSegmentId && 'text-primary-400 font-medium',
              )}
            >
              {formatDate(selectedSnapshot.date)} — Segments
            </button>
          </>
        )}
        {selectedSegment && (
          <>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary-400 font-medium">{selectedSegment.segmentName} — Metrics</span>
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <AnimatePresence mode="wait">
          {/* Level 3: Metric evaluation */}
          {selectedSegment ? (
            <motion.div
              key="metrics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15 }}
            >
              <MetricLevel segment={selectedSegment} />
            </motion.div>
          ) : selectedSnapshot ? (
            /* Level 2: Segment breakdown */
            <motion.div
              key="segments"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15 }}
            >
              <SegmentLevel
                snapshot={selectedSnapshot}
                onSelectSegment={setSelectedSegmentId}
              />
            </motion.div>
          ) : (
            /* Level 1: Interval score table */
            <motion.div
              key="intervals"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <IntervalLevel
                intervals={intervals}
                onSelectInterval={setSelectedSnapshotIdx}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Overlay>
  )
}

// ─── Overlay wrapper ───

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-4xl max-h-[85vh] bg-dark-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

// ─── Level 1: Interval scores ───

interface IntervalData {
  date: string
  score: number
  rank: number
  totalStocks: number
  verdict: string
  priceDelta: number | null
  basePrice: number | null
  priceAtInterval: number | null
  segmentResults: SegmentResult[]
}

function IntervalLevel({
  intervals,
  onSelectInterval,
}: {
  intervals: IntervalData[]
  onSelectInterval: (idx: number) => void
}) {
  return (
    <div className="rounded-xl bg-dark-800/40 border border-white/5 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-dark-800/60">
        <Calendar className="w-3.5 h-3.5 text-primary-400" />
        <span className="text-xs font-medium text-white">Score at Each Interval</span>
        <span className="text-[10px] text-neutral-500 ml-auto">{intervals.length} intervals • Click score to drill down</span>
      </div>

      {/* Column header */}
      <div className="grid grid-cols-[100px_70px_60px_100px_1fr] px-4 py-2 border-b border-white/5 text-[9px] text-neutral-500 uppercase tracking-wider">
        <span>Interval</span>
        <span className="text-right">Score</span>
        <span className="text-right">Rank</span>
        <span className="text-center">Verdict</span>
        <span className="text-right">Price Δ</span>
      </div>

      <div className="divide-y divide-white/5 max-h-[50vh] overflow-auto">
        {intervals.map((interval, i) => (
          <button
            key={interval.date}
            onClick={() => onSelectInterval(i)}
            className="w-full grid grid-cols-[100px_70px_60px_100px_1fr] px-4 py-2.5 items-center hover:bg-dark-700/30 transition-colors text-left"
          >
            <span className="text-[11px] text-neutral-300 font-mono">
              {formatDate(interval.date)}
            </span>

            <div className="text-right">
              <span
                className="text-xs font-semibold font-mono cursor-pointer hover:underline"
                style={{ color: getScoreColor(interval.score) }}
              >
                {interval.score.toFixed(1)}
              </span>
            </div>

            <span className="text-[10px] text-neutral-500 text-right font-mono">
              #{interval.rank}
              <span className="text-neutral-500">/{interval.totalStocks}</span>
            </span>

            <div className="text-center">
              <span className={cn(
                'inline-block px-2 py-0.5 rounded-full text-[9px] font-medium',
                getVerdictStyle(interval.verdict),
              )}>
                {interval.verdict}
              </span>
            </div>

            <div className="text-right">
              {i === 0 ? (
                <div>
                  <span className="text-[10px] text-neutral-500">Base</span>
                  {interval.priceAtInterval != null && (
                    <div className="text-[9px] text-neutral-400 font-mono mt-0.5">
                      ₹{formatPrice(interval.priceAtInterval)}
                    </div>
                  )}
                </div>
              ) : interval.priceDelta != null ? (
                <div>
                  <span className={cn(
                    'text-[11px] font-medium font-mono inline-flex items-center gap-0.5 justify-end',
                    interval.priceDelta > 0 ? 'text-success-400' : interval.priceDelta < 0 ? 'text-red-400' : 'text-neutral-500',
                  )}>
                    {interval.priceDelta > 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : interval.priceDelta < 0 ? (
                      <ArrowDownRight className="w-3 h-3" />
                    ) : null}
                    {interval.priceDelta > 0 ? '+' : ''}{interval.priceDelta.toFixed(1)}%
                  </span>
                  {interval.basePrice != null && interval.priceAtInterval != null && (
                    <div className="text-[9px] text-neutral-400 font-mono mt-0.5">
                      ₹{formatPrice(interval.basePrice)} → ₹{formatPrice(interval.priceAtInterval)}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-[10px] text-neutral-500">—</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Level 2: Segment breakdown ───

function SegmentLevel({
  snapshot,
  onSelectSegment,
}: {
  snapshot: IntervalData
  onSelectSegment: (segmentId: string) => void
}) {
  return (
    <div className="space-y-4">
      {/* Summary card */}
      <div className="flex items-center gap-4 rounded-xl bg-dark-800/60 border border-white/5 p-4">
        <div>
          <div className="text-[10px] text-neutral-500 mb-0.5">Score</div>
          <div className="text-2xl font-bold font-mono" style={{ color: getScoreColor(snapshot.score) }}>
            {snapshot.score.toFixed(1)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-neutral-500 mb-0.5">Rank</div>
          <div className="text-lg font-semibold text-white font-mono">#{snapshot.rank}</div>
        </div>
        <div>
          <div className="text-[10px] text-neutral-500 mb-0.5">Verdict</div>
          <span className={cn(
            'inline-block px-2 py-0.5 rounded-full text-[10px] font-medium',
            getVerdictStyle(snapshot.verdict),
          )}>
            {snapshot.verdict}
          </span>
        </div>
        {snapshot.priceDelta != null && (
          <div>
            <div className="text-[10px] text-neutral-500 mb-0.5">Price Δ</div>
            <div className={cn(
              'text-lg font-semibold font-mono',
              snapshot.priceDelta > 0 ? 'text-success-400' : snapshot.priceDelta < 0 ? 'text-red-400' : 'text-neutral-500',
            )}>
              {snapshot.priceDelta > 0 ? '+' : ''}{snapshot.priceDelta.toFixed(1)}%
            </div>
            {snapshot.basePrice != null && snapshot.priceAtInterval != null && (
              <div className="text-[9px] text-neutral-400 font-mono mt-0.5">
                ₹{formatPrice(snapshot.basePrice)} → ₹{formatPrice(snapshot.priceAtInterval)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Segment cards */}
      <div className="rounded-xl bg-dark-800/40 border border-white/5 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-dark-800/60">
          <Layers className="w-3.5 h-3.5 text-primary-400" />
          <span className="text-xs font-medium text-white">Segment Breakdown</span>
          <span className="text-[10px] text-neutral-500 ml-auto">Click a segment to see metrics</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
          {snapshot.segmentResults.map(segment => (
            <button
              key={segment.segmentId}
              onClick={() => onSelectSegment(segment.segmentId)}
              className="rounded-xl bg-dark-700/40 border border-white/5 p-4 text-left hover:bg-dark-700/60 hover:border-primary-500/20 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-neutral-400 group-hover:text-neutral-300 transition-colors">
                  {segment.segmentName}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-primary-400 transition-colors" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl font-bold font-mono" style={{ color: getScoreColor(segment.segmentScore) }}>
                  {segment.segmentScore.toFixed(1)}
                </span>
                {segment.verdict && (
                  segment.verdict === 'N/A' ? (
                    <NaExplainer label="N/A" reason={segment.naReason} className="text-[10px] font-medium text-neutral-500" />
                  ) : (
                    <span className={cn('text-[10px] font-medium', getVerdictTextColor(segment.verdict))}>
                      {segment.verdict}
                    </span>
                  )
                )}
              </div>
              <div className="w-full h-1.5 bg-dark-600 rounded-full">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${segment.segmentScore}%`,
                    backgroundColor: getScoreColor(segment.segmentScore),
                  }}
                />
              </div>
              <div className="text-[9px] text-neutral-500 mt-1.5">
                {segment.metricScores.length} metrics
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Level 3: Metric evaluation ───

function MetricLevel({ segment }: { segment: SegmentResult }) {
  return (
    <div className="space-y-4">
      {/* Segment summary */}
      <div className="flex items-center gap-4 rounded-xl bg-dark-800/60 border border-white/5 p-4">
        <div>
          <div className="text-[10px] text-neutral-500 mb-0.5">{segment.segmentName}</div>
          <div className="text-2xl font-bold font-mono" style={{ color: getScoreColor(segment.segmentScore) }}>
            {segment.segmentScore.toFixed(1)}
          </div>
        </div>
        {segment.verdict && (
          <div>
            <div className="text-[10px] text-neutral-500 mb-0.5">Verdict</div>
            {segment.verdict === 'N/A' ? (
              <NaExplainer label="N/A" reason={segment.naReason} className="text-sm font-medium text-neutral-500" />
            ) : (
              <span className={cn('text-sm font-medium', getVerdictTextColor(segment.verdict))}>
                {segment.verdict}
              </span>
            )}
          </div>
        )}
        <div className="ml-auto text-[10px] text-neutral-500">
          {segment.metricScores.filter(m => !m.isExcluded).length}/{segment.metricScores.length} metrics scored
        </div>
      </div>

      {/* Metric table */}
      <div className="rounded-xl bg-dark-800/40 border border-white/5 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-dark-800/60">
          <BarChart3 className="w-3.5 h-3.5 text-primary-400" />
          <span className="text-xs font-medium text-white">Metric Evaluation</span>
        </div>

        <div className="grid grid-cols-[1fr_90px_70px_50px] px-4 py-2 border-b border-white/5 text-[9px] text-neutral-500 uppercase tracking-wider">
          <span>Metric</span>
          <span className="text-right">Raw Value</span>
          <span className="text-right">Score</span>
          <span className="text-right">Status</span>
        </div>

        <div className="divide-y divide-white/5">
          {segment.metricScores.map(metric => (
            <div
              key={metric.metricId}
              className="grid grid-cols-[1fr_90px_70px_50px] px-4 py-2.5 items-center"
            >
              <div>
                <span className="text-[11px] text-neutral-300">{metric.metricName}</span>
                {metric.isExcluded && metric.excludeReason && (
                  <div className="text-[9px] text-neutral-500 mt-0.5">{metric.excludeReason}</div>
                )}
                {metric.evidence && (metric.evidence.startValue != null || metric.evidence.endValue != null) && (
                  <div className="text-[9px] text-neutral-400 font-mono mt-0.5">
                    {metric.evidence.startValue != null && metric.evidence.endValue != null ? (
                      <span>{formatValue(metric.evidence.startValue)} → {formatValue(metric.evidence.endValue)}</span>
                    ) : metric.evidence.endValue != null ? (
                      <span>Latest: {formatValue(metric.evidence.endValue)}</span>
                    ) : metric.evidence.startValue != null ? (
                      <span>Start: {formatValue(metric.evidence.startValue)}</span>
                    ) : null}
                  </div>
                )}
              </div>

              <span className="text-[11px] text-neutral-400 text-right font-mono">
                {metric.rawValue != null ? formatValue(metric.rawValue) : (
                  <NaExplainer label="N/A" reason={metric.excludeReason} className="text-neutral-500" />
                )}
              </span>

              <div className="text-right">
                {!metric.isExcluded ? (
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-xs font-semibold font-mono" style={{ color: getScoreColor(metric.normalizedScore) }}>
                      {metric.normalizedScore.toFixed(0)}
                    </span>
                    <div className="w-8 h-1 bg-dark-600 rounded-full">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${metric.normalizedScore}%`,
                          backgroundColor: getScoreColor(metric.normalizedScore),
                        }}
                      />
                    </div>
                  </div>
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
                  <TrendingUp className="w-3.5 h-3.5 text-success-400 inline" />
                ) : metric.normalizedScore >= 35 ? (
                  <Minus className="w-3.5 h-3.5 text-warning-400 inline" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-red-400 inline" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ───

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
}

function formatPrice(price: number): string {
  if (price >= 10000) return price.toFixed(0)
  if (price >= 100) return price.toFixed(1)
  return price.toFixed(2)
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

function getVerdictStyle(verdict: string): string {
  const v = verdict.toUpperCase()
  if (v.includes('STRONG BUY') || v === 'EXCELLENT') return 'bg-success-500/20 text-success-400'
  if (v.includes('BUY') || v === 'GOOD') return 'bg-lime-500/20 text-lime-400'
  if (v.includes('HOLD') || v === 'FAIR') return 'bg-warning-500/20 text-warning-400'
  if (v.includes('REVIEW') || v === 'WEAK') return 'bg-orange-500/20 text-orange-400'
  return 'bg-red-500/20 text-red-400'
}

function getVerdictTextColor(verdict: string): string {
  const v = verdict.toUpperCase()
  if (v.includes('STRONG') || v.includes('EXCELLENT') || v.includes('BULLISH')) return 'text-success-400'
  if (v.includes('BUY') || v.includes('GOOD') || v.includes('MODERATE')) return 'text-lime-400'
  if (v.includes('HOLD') || v.includes('FAIR') || v.includes('NEUTRAL')) return 'text-warning-400'
  if (v.includes('REVIEW') || v.includes('WEAK')) return 'text-orange-400'
  return 'text-red-400'
}
