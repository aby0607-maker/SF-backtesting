/**
 * PriceDeltaTable — Stage 5 Tab 2: Interval-column price delta grid
 *
 * Shows stock performance deltas (cumulative return %) at each interval.
 * Sticky first 3 columns (Stock, Score, Verdict), horizontal scroll for intervals.
 * Green/red color coding for positive/negative returns. Sortable by any column.
 *
 * Click a row → expands to show:
 *   - Mini sparkline (stock vs cohort avg cumulative return)
 *   - Score at each interval (badges from backtest snapshots)
 *   - Segment heatmap (Financial | Valuation | Technical | QMom)
 */

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart, Line, ResponsiveContainer, YAxis, ReferenceLine,
} from 'recharts'
import { cn } from '@/lib/utils'
import { useCombinedResult, useBacktestResult } from '@/store/useScoringStore'
import type { PriceDeltaRow } from '@/types/scoring'
import { ArrowUpDown, ChevronRight } from 'lucide-react'

interface PriceDeltaTableProps {
  onSelectStock?: (stockId: string | null) => void
  selectedStockId?: string | null
}

export function PriceDeltaTable({ onSelectStock, selectedStockId }: PriceDeltaTableProps) {
  const combinedResult = useCombinedResult()
  const backtestResult = useBacktestResult()
  const [sortCol, setSortCol] = useState<string>('score')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [expandedStock, setExpandedStock] = useState<string | null>(null)

  const rows = combinedResult?.priceDeltaTable
  if (!rows || rows.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500 text-sm">
        No price delta data available. Run the scoring engine first.
      </div>
    )
  }

  // Get all interval column labels in order
  const intervalColumns = useMemo(() => {
    const cols = new Set<string>()
    for (const row of rows) {
      for (const key of Object.keys(row.deltas)) {
        cols.add(key)
      }
    }
    // Sort by extracting the number from labels like "Month 1", "Month 2"
    return [...cols].sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0
      const numB = parseInt(b.replace(/\D/g, '')) || 0
      return numA - numB
    })
  }, [rows])

  // Sort rows
  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      let valA: number, valB: number
      if (sortCol === 'score') {
        valA = a.score
        valB = b.score
      } else if (sortCol === 'name') {
        return sortDir === 'asc'
          ? a.stockName.localeCompare(b.stockName)
          : b.stockName.localeCompare(a.stockName)
      } else {
        valA = a.deltas[sortCol] ?? -Infinity
        valB = b.deltas[sortCol] ?? -Infinity
      }
      return sortDir === 'desc' ? valB - valA : valA - valB
    })
  }, [rows, sortCol, sortDir])

  const toggleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(col)
      setSortDir(col === 'name' ? 'asc' : 'desc')
    }
  }

  const toggleExpand = (stockId: string) => {
    const next = expandedStock === stockId ? null : stockId
    setExpandedStock(next)
    onSelectStock?.(next)
  }

  // Build lookup maps for expanded row data
  const comparisonMap = useMemo(() => {
    if (!backtestResult?.comparisons) return new Map()
    return new Map(backtestResult.comparisons.map(c => [c.targetStockId, c]))
  }, [backtestResult])

  const scoringStockMap = useMemo(() => {
    if (!combinedResult?.scoring?.stocks) return new Map()
    return new Map(combinedResult.scoring.stocks.map(s => [s.stockId, s]))
  }, [combinedResult])

  // Cohort avg performance for sparkline overlay
  const cohortAvgPeriods = useMemo(() => {
    const first = backtestResult?.comparisons?.[0]
    return first?.cohortAvg?.periods ?? []
  }, [backtestResult])

  return (
    <div className="rounded-xl bg-dark-800/40 border border-white/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          {/* Header */}
          <thead>
            <tr className="border-b border-white/5">
              {/* Sticky columns */}
              <th className="sticky left-0 z-10 bg-dark-800 px-3 py-2.5 text-left text-[10px] text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-neutral-300">
                  Stock
                  {sortCol === 'name' && <ArrowUpDown className="w-2.5 h-2.5" />}
                </button>
              </th>
              <th className="sticky left-[120px] z-10 bg-dark-800 px-2 py-2.5 text-right text-[10px] text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                <button onClick={() => toggleSort('score')} className="flex items-center gap-1 hover:text-neutral-300 ml-auto">
                  Score
                  {sortCol === 'score' && <ArrowUpDown className="w-2.5 h-2.5" />}
                </button>
              </th>
              <th className="sticky left-[180px] z-10 bg-dark-800 px-2 py-2.5 text-right text-[10px] text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                Verdict
              </th>

              {/* Interval columns */}
              {intervalColumns.map(col => (
                <th key={col} className="px-2 py-2.5 text-right text-[10px] text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                  <button onClick={() => toggleSort(col)} className="flex items-center gap-1 hover:text-neutral-300 ml-auto">
                    {col}
                    {sortCol === col && <ArrowUpDown className="w-2.5 h-2.5" />}
                  </button>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-white/5">
            {sortedRows.map(row => (
              <DeltaRow
                key={row.stockId}
                row={row}
                intervalColumns={intervalColumns}
                isExpanded={expandedStock === row.stockId}
                isSelected={selectedStockId === row.stockId}
                onToggle={() => toggleExpand(row.stockId)}
                comparison={comparisonMap.get(row.stockId)}
                scoringStock={scoringStockMap.get(row.stockId)}
                cohortAvgPeriods={cohortAvgPeriods}
                snapshots={backtestResult?.snapshots}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-white/5 text-[10px] text-neutral-500">
        {sortedRows.length} stocks • {intervalColumns.length} intervals • Click a row to drill down
      </div>
    </div>
  )
}

// ─── Row Component ───

interface DeltaRowProps {
  row: PriceDeltaRow
  intervalColumns: string[]
  isExpanded: boolean
  isSelected: boolean
  onToggle: () => void
  comparison?: { targetPerformance: { periods: { date: string; cumulativeReturn: number }[] }; cohortAvg: { periods: { date: string; cumulativeReturn: number }[] } }
  scoringStock?: { segmentResults: { segmentId: string; segmentName: string; segmentScore: number; verdict?: string }[] }
  cohortAvgPeriods: { date: string; cumulativeReturn: number }[]
  snapshots?: { date: string; stockScores: { stockId: string; normalizedScore: number; verdict: string }[] }[]
}

function DeltaRow({
  row, intervalColumns, isExpanded, isSelected, onToggle,
  comparison, scoringStock, cohortAvgPeriods, snapshots,
}: DeltaRowProps) {
  return (
    <>
      <tr
        onClick={onToggle}
        className={cn(
          'cursor-pointer transition-colors',
          isExpanded ? 'bg-dark-700/30' : 'hover:bg-dark-700/20',
          isSelected && !isExpanded && 'bg-primary-500/5',
        )}
      >
        {/* Sticky: Stock name */}
        <td className="sticky left-0 z-10 bg-dark-800/95 px-3 py-2 whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <ChevronRight className={cn(
              'w-3 h-3 text-neutral-500 transition-transform flex-shrink-0',
              isExpanded && 'rotate-90',
            )} />
            <div>
              <div className="text-xs font-medium text-white">{row.stockName}</div>
              <div className="text-[10px] text-neutral-500">{row.stockSymbol}</div>
            </div>
          </div>
        </td>

        {/* Sticky: Score */}
        <td className="sticky left-[120px] z-10 bg-dark-800/95 px-2 py-2 text-right whitespace-nowrap">
          <span className="text-xs font-semibold text-white">{row.score.toFixed(1)}</span>
        </td>

        {/* Sticky: Verdict */}
        <td className="sticky left-[180px] z-10 bg-dark-800/95 px-2 py-2 text-right whitespace-nowrap">
          <span className={cn(
            'inline-block px-1.5 py-0.5 rounded text-[9px] font-medium',
            getVerdictBg(row.verdict),
          )}>
            {row.verdict}
          </span>
        </td>

        {/* Interval delta cells */}
        {intervalColumns.map(col => {
          const delta = row.deltas[col]
          return (
            <td key={col} className="px-2 py-2 text-right whitespace-nowrap font-mono text-[11px]">
              {delta != null ? (
                <span className={cn(
                  delta > 0 ? 'text-success-400' : delta < 0 ? 'text-red-400' : 'text-neutral-500',
                )}>
                  {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
                </span>
              ) : (
                <span className="text-neutral-600">—</span>
              )}
            </td>
          )
        })}
      </tr>

      {/* Expanded detail panel */}
      <AnimatePresence>
        {isExpanded && (
          <tr>
            <td colSpan={3 + intervalColumns.length}>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <ExpandedPanel
                  row={row}
                  comparison={comparison}
                  scoringStock={scoringStock}
                  cohortAvgPeriods={cohortAvgPeriods}
                  snapshots={snapshots}
                />
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Expanded Panel ───

function ExpandedPanel({
  row, comparison, scoringStock, cohortAvgPeriods, snapshots,
}: {
  row: PriceDeltaRow
  comparison?: DeltaRowProps['comparison']
  scoringStock?: DeltaRowProps['scoringStock']
  cohortAvgPeriods: DeltaRowProps['cohortAvgPeriods']
  snapshots?: DeltaRowProps['snapshots']
}) {
  return (
    <div className="px-4 py-3 bg-dark-700/15 border-t border-white/5 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Left: Sparkline — stock vs cohort avg */}
        <div className="rounded-lg bg-dark-800/50 border border-white/5 p-3">
          <div className="text-[10px] text-neutral-500 mb-1.5">Cumulative Return vs Cohort Avg</div>
          <StockSparkline
            stockPeriods={comparison?.targetPerformance?.periods ?? []}
            cohortPeriods={cohortAvgPeriods}
          />
          <div className="flex items-center gap-3 mt-1.5 text-[9px] text-neutral-600">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-primary-400 inline-block rounded" /> {row.stockSymbol}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-neutral-500 inline-block rounded" /> Cohort Avg
            </span>
          </div>
        </div>

        {/* Middle: Score at each interval (from snapshots) */}
        <div className="rounded-lg bg-dark-800/50 border border-white/5 p-3">
          <div className="text-[10px] text-neutral-500 mb-1.5">Score History (per interval)</div>
          <ScoreHistory stockId={row.stockId} snapshots={snapshots} currentScore={row.score} />
        </div>

        {/* Right: Segment heatmap */}
        <div className="rounded-lg bg-dark-800/50 border border-white/5 p-3">
          <div className="text-[10px] text-neutral-500 mb-1.5">Segment Breakdown</div>
          <SegmentHeatmap segments={scoringStock?.segmentResults} />
        </div>
      </div>
    </div>
  )
}

// ─── Sparkline Chart ───

function StockSparkline({
  stockPeriods,
  cohortPeriods,
}: {
  stockPeriods: { date: string; cumulativeReturn: number }[]
  cohortPeriods: { date: string; cumulativeReturn: number }[]
}) {
  const chartData = useMemo(() => {
    if (stockPeriods.length === 0) return []
    return stockPeriods.map((p, i) => ({
      date: p.date,
      stock: p.cumulativeReturn,
      cohort: cohortPeriods[i]?.cumulativeReturn ?? 0,
    }))
  }, [stockPeriods, cohortPeriods])

  if (chartData.length === 0) {
    return <div className="text-[10px] text-neutral-600 py-4 text-center">No performance data</div>
  }

  return (
    <ResponsiveContainer width="100%" height={60}>
      <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <YAxis hide domain={['auto', 'auto']} />
        <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)" />
        <Line
          type="monotone"
          dataKey="cohort"
          stroke="#737373"
          strokeWidth={1}
          strokeDasharray="3 3"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="stock"
          stroke="#a78bfa"
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ─── Score History ───

function ScoreHistory({
  stockId,
  snapshots,
  currentScore,
}: {
  stockId: string
  snapshots?: { date: string; stockScores: { stockId: string; normalizedScore: number; verdict: string }[] }[]
  currentScore: number
}) {
  const history = useMemo(() => {
    if (!snapshots || snapshots.length === 0) return []
    return snapshots
      .map(snap => {
        const stock = snap.stockScores.find(s => s.stockId === stockId)
        return stock ? {
          date: snap.date,
          score: stock.normalizedScore,
          verdict: stock.verdict,
        } : null
      })
      .filter(Boolean) as { date: string; score: number; verdict: string }[]
  }, [snapshots, stockId])

  if (history.length === 0) {
    return (
      <div className="flex items-center gap-2 py-2">
        <ScoreBadge score={currentScore} label="Current" />
        <span className="text-[9px] text-neutral-600">No interval snapshots available</span>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {history.map((h, i) => {
        const shortDate = new Date(h.date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
        return (
          <ScoreBadge key={i} score={h.score} label={shortDate} />
        )
      })}
    </div>
  )
}

function ScoreBadge({ score, label }: { score: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded"
        style={{ backgroundColor: getScoreColor(score) + '20', color: getScoreColor(score) }}
      >
        {score.toFixed(0)}
      </span>
      <span className="text-[8px] text-neutral-500 mt-0.5">{label}</span>
    </div>
  )
}

// ─── Segment Heatmap ───

function SegmentHeatmap({
  segments,
}: {
  segments?: { segmentId: string; segmentName: string; segmentScore: number; verdict?: string }[]
}) {
  if (!segments || segments.length === 0) {
    return <div className="text-[10px] text-neutral-600 py-2">No segment data</div>
  }

  // Show abbreviated segment names
  const abbreviations: Record<string, string> = {
    financial: 'FIN',
    valuation: 'VAL',
    technical: 'TECH',
    quarterly_momentum: 'QMOM',
  }

  return (
    <div className="grid grid-cols-2 gap-1.5">
      {segments.map(seg => {
        const abbr = abbreviations[seg.segmentId] ?? seg.segmentName.slice(0, 4).toUpperCase()
        const color = getScoreColor(seg.segmentScore)
        return (
          <div
            key={seg.segmentId}
            className="rounded-md px-2 py-1.5 border border-white/5"
            style={{ backgroundColor: color + '12' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-neutral-400">{abbr}</span>
              <span className="text-[11px] font-mono font-semibold" style={{ color }}>
                {seg.segmentScore.toFixed(0)}
              </span>
            </div>
            {seg.verdict && (
              <div className="text-[8px] mt-0.5 truncate" style={{ color }}>
                {seg.verdict}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Helpers ───

function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 65) return '#84cc16'
  if (score >= 50) return '#eab308'
  if (score >= 35) return '#f97316'
  return '#ef4444'
}

function getVerdictBg(verdict: string): string {
  const v = verdict.toUpperCase()
  if (v.includes('STRONG BUY')) return 'bg-success-500/20 text-success-400'
  if (v.includes('BUY')) return 'bg-lime-500/20 text-lime-400'
  if (v.includes('HOLD')) return 'bg-warning-500/20 text-warning-400'
  if (v.includes('REVIEW')) return 'bg-orange-500/20 text-orange-400'
  return 'bg-red-500/20 text-red-400'
}
