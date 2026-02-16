/**
 * ScoringResultsTable — Stage 5 Tab 1: 3-level progressive disclosure
 *
 * Level 1 (row): Stock | Sector | Overall Score (color bar) | Verdict (badge)
 * Level 2 (click row → expand): Segment cards — Financial, Valuation, Technical, QMomentum
 * Level 3 (click segment → expand): Metric rows — name | raw value | score (0-100) | band color
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useCombinedResult, useActiveScorecard, useBacktestResult } from '@/store/useScoringStore'
import type { SegmentResult, MetricScore } from '@/types/scoring'
import { ChevronRight, TrendingUp, TrendingDown, Minus, Calendar, Layers } from 'lucide-react'

export function ScoringResultsTable() {
  const combinedResult = useCombinedResult()
  const [expandedStock, setExpandedStock] = useState<string | null>(null)
  const [expandedSegment, setExpandedSegment] = useState<string | null>(null)
  const [sortField, setSortField] = useState<'score' | 'name'>('score')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const scorecard = useActiveScorecard()
  const backtestResult = useBacktestResult()

  if (!combinedResult?.scoring) {
    return (
      <div className="text-center py-8 text-neutral-500 text-sm">
        No scoring results. Run the scoring engine first.
      </div>
    )
  }

  const scoredAt = new Date(combinedResult.scoring.runTimestamp).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
  const backtestFrom = backtestResult?.config?.dateRange?.from
  const backtestTo = backtestResult?.config?.dateRange?.to

  const stocks = [...combinedResult.scoring.stocks]
  if (sortField === 'score') {
    stocks.sort((a, b) => sortDir === 'desc' ? b.normalizedScore - a.normalizedScore : a.normalizedScore - b.normalizedScore)
  } else {
    stocks.sort((a, b) => sortDir === 'asc' ? a.stockName.localeCompare(b.stockName) : b.stockName.localeCompare(a.stockName))
  }

  const toggleSort = (field: 'score' | 'name') => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir(field === 'score' ? 'desc' : 'asc')
    }
  }

  const toggleStock = (stockId: string) => {
    setExpandedStock(prev => prev === stockId ? null : stockId)
    setExpandedSegment(null)
  }

  return (
    <div className="rounded-xl bg-dark-800/40 border border-white/5 overflow-hidden">
      {/* Context header */}
      <div className="flex items-center gap-4 px-4 py-2.5 border-b border-white/5 bg-dark-800/60">
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
          <Calendar className="w-3 h-3 text-primary-400" />
          <span>Scored: <span className="text-white font-medium">{scoredAt}</span></span>
        </div>
        {backtestFrom && backtestTo && (
          <div className="text-[11px] text-neutral-400">
            Period: <span className="text-white font-medium">{backtestFrom}</span>
            <span className="text-neutral-600 mx-1">→</span>
            <span className="text-white font-medium">{backtestTo}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 ml-auto">
          <Layers className="w-3 h-3 text-primary-400" />
          <span className="text-white font-medium">{stocks.length}</span> stocks
          {scorecard && (
            <>
              <span className="text-neutral-600 mx-0.5">·</span>
              <span className="text-primary-400 font-medium">{scorecard.versionInfo.displayVersion}</span>
            </>
          )}
        </div>
      </div>

      {/* Column header */}
      <div className="grid grid-cols-[1fr_100px_80px_80px] px-4 py-2.5 border-b border-white/5 text-[10px] text-neutral-500 uppercase tracking-wider">
        <button onClick={() => toggleSort('name')} className="text-left hover:text-neutral-300 transition-colors">
          Stock {sortField === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
        </button>
        <span>Sector</span>
        <button onClick={() => toggleSort('score')} className="text-right hover:text-neutral-300 transition-colors">
          Score {sortField === 'score' && (sortDir === 'asc' ? '↑' : '↓')}
        </button>
        <span className="text-right">Verdict</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/5">
        {stocks.map(stock => (
          <div key={stock.stockId}>
            {/* Level 1: Stock row */}
            <button
              onClick={() => toggleStock(stock.stockId)}
              className={cn(
                'w-full grid grid-cols-[1fr_100px_80px_80px] px-4 py-2.5 text-left hover:bg-dark-700/30 transition-colors items-center',
                expandedStock === stock.stockId && 'bg-dark-700/20',
              )}
            >
              <div className="flex items-center gap-2">
                <ChevronRight className={cn(
                  'w-3 h-3 text-neutral-500 transition-transform',
                  expandedStock === stock.stockId && 'rotate-90',
                )} />
                <div>
                  <div className="text-xs font-medium text-white">{stock.stockName}</div>
                  <div className="text-[10px] text-neutral-500">{stock.stockSymbol}</div>
                </div>
              </div>
              <span className="text-[10px] text-neutral-400 truncate">{stock.sector}</span>
              <div className="text-right">
                <div className="text-sm font-semibold text-white">{stock.normalizedScore.toFixed(1)}</div>
                <div className="w-full h-1 bg-dark-600 rounded-full mt-0.5">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${stock.normalizedScore}%`,
                      backgroundColor: getScoreColor(stock.normalizedScore),
                    }}
                  />
                </div>
              </div>
              <div className="text-right">
                <span className={cn(
                  'inline-block px-2 py-0.5 rounded-full text-[10px] font-medium',
                  getVerdictStyle(stock.verdict),
                )}>
                  {stock.verdict}
                </span>
              </div>
            </button>

            {/* Level 2: Segment cards */}
            <AnimatePresence>
              {expandedStock === stock.stockId && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-3 pt-1">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {stock.segmentResults.map(segment => (
                        <SegmentCard
                          key={segment.segmentId}
                          segment={segment}
                          isExpanded={expandedSegment === segment.segmentId}
                          onToggle={() => setExpandedSegment(
                            prev => prev === segment.segmentId ? null : segment.segmentId
                          )}
                        />
                      ))}
                    </div>

                    {/* Level 3: Metric detail */}
                    <AnimatePresence>
                      {expandedSegment && (
                        <MetricDetail
                          segment={stock.segmentResults.find(s => s.segmentId === expandedSegment)}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-white/5 text-[10px] text-neutral-500">
        {stocks.length} stocks scored • Click a row to see segment scores • Click a segment to see metrics
      </div>
    </div>
  )
}

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
          <span className={cn('text-[9px] font-medium', getVerdictTextColor(segment.verdict))}>
            {segment.verdict}
          </span>
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
        {metric.rawValue != null ? formatValue(metric.rawValue) : 'N/A'}
      </span>
      <div className="text-right">
        {!metric.isExcluded ? (
          <span className="text-[11px] font-medium" style={{ color: getScoreColor(metric.normalizedScore) }}>
            {metric.normalizedScore.toFixed(0)}
          </span>
        ) : (
          <span className="text-[10px] text-neutral-600">—</span>
        )}
      </div>
      <div className="text-right">
        {metric.isExcluded ? (
          <span className="text-[9px] text-neutral-600" title={metric.excludeReason}>
            {metric.excludeReason === 'No data available' ? 'N/A' : 'Excl.'}
          </span>
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

function formatValue(value: number): string {
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(1)}B`
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}K`
  if (Number.isInteger(value)) return value.toString()
  return value.toFixed(2)
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e' // green
  if (score >= 65) return '#84cc16' // lime
  if (score >= 50) return '#eab308' // yellow
  if (score >= 35) return '#f97316' // orange
  return '#ef4444' // red
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
