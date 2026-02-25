/**
 * ScorecardInsights — Stage 5 Tab 4: Written-report-style narrative
 * summarizing scorecard accuracy across 4 dimensions.
 *
 * Sections:
 *   1. Overall Accuracy Grade
 *   2. Verdict Accuracy
 *   3. Interval Accuracy (Time Dimension)
 *   4. Key Wins & Misses
 *   5. Score vs Price Trajectory Accuracy
 */

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useBacktestResult, useCombinedResult } from '@/store/useScoringStore'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line,
} from 'recharts'
import type {
  BacktestResult, CohortComparison, BacktestSnapshot,
  QuintileResult, PriceDeltaRow,
} from '@/types/scoring'

// ─── Helpers ────────────────────────────────────────

function pearsonCorrelation(pairs: { x: number; y: number }[]): number {
  const n = pairs.length
  if (n < 3) return 0
  const sumX = pairs.reduce((s, p) => s + p.x, 0)
  const sumY = pairs.reduce((s, p) => s + p.y, 0)
  const sumXY = pairs.reduce((s, p) => s + p.x * p.y, 0)
  const sumX2 = pairs.reduce((s, p) => s + p.x * p.x, 0)
  const sumY2 = pairs.reduce((s, p) => s + p.y * p.y, 0)
  const num = n * sumXY - sumX * sumY
  const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
  if (Math.abs(den) < 1e-10) return 0
  return num / den
}

function fmt(n: number, decimals = 1): string {
  return n.toFixed(decimals)
}

function signed(n: number, decimals = 1): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(decimals)}%`
}

/** Color class for a numeric value where positive = good */
function clr(n: number): string {
  return n >= 0 ? 'text-success-400' : 'text-destructive-400'
}

// ─── Data Computation ───────────────────────────────

interface VerdictBucket {
  verdict: string
  count: number
  correct: number
  avgReturn: number
  stocks: { name: string; score: number; returnPct: number }[]
}

function computeVerdictAccuracy(
  snapshots: BacktestSnapshot[],
  comparisons: CohortComparison[],
): VerdictBucket[] {
  if (snapshots.length === 0) return []

  const initial = snapshots[0]
  const buckets = new Map<string, VerdictBucket>()

  for (const stock of initial.stockScores) {
    const comp = comparisons.find(c => c.targetStockId === stock.stockId)
    const periods = comp?.targetPerformance?.periods
    const finalReturn = periods && periods.length > 0
      ? periods[periods.length - 1].cumulativeReturn
      : 0

    const v = stock.verdict
    if (!buckets.has(v)) {
      buckets.set(v, { verdict: v, count: 0, correct: 0, avgReturn: 0, stocks: [] })
    }
    const b = buckets.get(v)!
    b.count++
    b.stocks.push({ name: stock.stockName, score: stock.normalizedScore, returnPct: finalReturn })

    // "Correct" logic
    const upper = v.toUpperCase()
    if ((upper.includes('BUY') || upper.includes('STRONG BUY')) && finalReturn > 0) b.correct++
    else if (upper.includes('SELL') && finalReturn < 0) b.correct++
    else if (upper.includes('HOLD') && Math.abs(finalReturn) <= 5) b.correct++
  }

  for (const b of buckets.values()) {
    b.avgReturn = b.stocks.reduce((s, st) => s + st.returnPct, 0) / b.count
  }

  // Sort by verdict severity: Strong Buy first, then Buy, Hold, Sell
  const order = ['STRONG BUY', 'BUY', 'HOLD', 'SELL']
  return [...buckets.values()].sort((a, b) => {
    const ai = order.findIndex(o => a.verdict.toUpperCase().includes(o))
    const bi = order.findIndex(o => b.verdict.toUpperCase().includes(o))
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
}

interface IntervalAccuracy {
  interval: string
  correlation: number
  hitRate: number
}

function computeIntervalAccuracy(
  rows: PriceDeltaRow[],
): IntervalAccuracy[] {
  if (!rows || rows.length === 0) return []

  // Collect all intervals
  const intervalSet = new Set<string>()
  for (const row of rows) {
    for (const key of Object.keys(row.deltas)) intervalSet.add(key)
  }
  const intervals = [...intervalSet].sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, '')) || 0
    const numB = parseInt(b.replace(/\D/g, '')) || 0
    return numA - numB
  })

  // Median score to define "high-scorer"
  const scores = rows.map(r => r.score).sort((a, b) => a - b)
  const medianScore = scores[Math.floor(scores.length / 2)]

  return intervals.map(interval => {
    const pairs = rows
      .filter(r => r.deltas[interval] != null)
      .map(r => ({ x: r.score, y: r.deltas[interval] }))

    const corr = pearsonCorrelation(pairs)

    // Hit rate at this interval: % of above-median-score stocks that beat average return
    const withReturn = rows.filter(r => r.deltas[interval] != null)
    const avgReturn = withReturn.length > 0
      ? withReturn.reduce((s, r) => s + r.deltas[interval], 0) / withReturn.length
      : 0
    const highScorers = withReturn.filter(r => r.score >= medianScore)
    const hits = highScorers.filter(r => r.deltas[interval] > avgReturn).length
    const hitRate = highScorers.length > 0 ? (hits / highScorers.length) * 100 : 0

    return { interval, correlation: corr, hitRate }
  })
}

interface StockWinMiss {
  name: string
  symbol: string
  score: number
  verdict: string
  verdictColor: string
  returnPct: number
  isWin: boolean
  topSegment?: string
  topSegmentScore?: number
  weakSegment?: string
  weakSegmentScore?: number
}

function computeWinsMisses(
  snapshots: BacktestSnapshot[],
  comparisons: CohortComparison[],
): { wins: StockWinMiss[]; misses: StockWinMiss[] } {
  if (snapshots.length === 0) return { wins: [], misses: [] }

  const initial = snapshots[0]
  const results: StockWinMiss[] = []

  for (const stock of initial.stockScores) {
    const comp = comparisons.find(c => c.targetStockId === stock.stockId)
    const periods = comp?.targetPerformance?.periods
    const finalReturn = periods && periods.length > 0
      ? periods[periods.length - 1].cumulativeReturn
      : 0

    const upper = stock.verdict.toUpperCase()
    let isWin = false
    if ((upper.includes('BUY') || upper.includes('STRONG BUY')) && finalReturn > 0) isWin = true
    else if (upper.includes('SELL') && finalReturn < 0) isWin = true
    else if (upper.includes('HOLD') && Math.abs(finalReturn) <= 5) isWin = true

    // Find strongest and weakest segment
    const segs = [...stock.segmentResults].sort((a, b) => b.segmentScore - a.segmentScore)
    const top = segs[0]
    const weak = segs[segs.length - 1]

    results.push({
      name: stock.stockName,
      symbol: stock.stockSymbol,
      score: stock.normalizedScore,
      verdict: stock.verdict,
      verdictColor: stock.verdictColor,
      returnPct: finalReturn,
      isWin,
      topSegment: top?.segmentName,
      topSegmentScore: top?.segmentScore,
      weakSegment: weak?.segmentName,
      weakSegmentScore: weak?.segmentScore,
    })
  }

  // Sort by absolute return magnitude (biggest first)
  const wins = results.filter(r => r.isWin).sort((a, b) => Math.abs(b.returnPct) - Math.abs(a.returnPct))
  const misses = results.filter(r => !r.isWin).sort((a, b) => Math.abs(b.returnPct) - Math.abs(a.returnPct))

  return { wins: wins.slice(0, 3), misses: misses.slice(0, 3) }
}

interface TrajectoryAlignment {
  name: string
  symbol: string
  scoreStart: number
  scoreEnd: number
  scoreTrend: 'up' | 'down' | 'flat'
  priceReturn: number
  priceTrend: 'up' | 'down' | 'flat'
  correlation: number
  alignment: 'Strong' | 'Partial' | 'Divergent'
}

function computeTrajectoryAlignment(
  snapshots: BacktestSnapshot[],
  comparisons: CohortComparison[],
): TrajectoryAlignment[] {
  if (snapshots.length < 2) return []

  const firstSnap = snapshots[0]
  const stockIds = firstSnap.stockScores.map(s => s.stockId)

  return stockIds.map(stockId => {
    const stock = firstSnap.stockScores.find(s => s.stockId === stockId)!
    const comp = comparisons.find(c => c.targetStockId === stockId)

    // Score trajectory across snapshots
    const scoreSeries = snapshots
      .map(snap => snap.stockScores.find(s => s.stockId === stockId)?.normalizedScore)
      .filter((s): s is number => s != null)

    // Price trajectory
    const priceSeries = comp?.targetPerformance?.periods?.map(p => p.cumulativeReturn) ?? []

    const scoreStart = scoreSeries[0] ?? 0
    const scoreEnd = scoreSeries[scoreSeries.length - 1] ?? 0
    const scoreDelta = scoreEnd - scoreStart

    const priceReturn = priceSeries.length > 0 ? priceSeries[priceSeries.length - 1] : 0

    // Trend classification
    const scoreTrend: 'up' | 'down' | 'flat' = Math.abs(scoreDelta) < 3 ? 'flat' : scoreDelta > 0 ? 'up' : 'down'
    const priceTrend: 'up' | 'down' | 'flat' = Math.abs(priceReturn) < 2 ? 'flat' : priceReturn > 0 ? 'up' : 'down'

    // Correlation between score series and price series (need aligned lengths)
    const minLen = Math.min(scoreSeries.length, priceSeries.length)
    const pairs = Array.from({ length: minLen }, (_, i) => ({
      x: scoreSeries[i],
      y: priceSeries[i],
    }))
    const corr = pearsonCorrelation(pairs)

    const alignment: 'Strong' | 'Partial' | 'Divergent' =
      corr > 0.5 ? 'Strong' : corr > 0 ? 'Partial' : 'Divergent'

    return {
      name: stock.stockName,
      symbol: stock.stockSymbol,
      scoreStart,
      scoreEnd,
      scoreTrend,
      priceReturn,
      priceTrend,
      correlation: corr,
      alignment,
    }
  })
}

interface AccuracyGrade {
  letter: string
  score: number
  color: string
  bgColor: string
  signals: { label: string; strength: 'Strong' | 'Moderate' | 'Weak'; value: string }[]
}

function computeAccuracyGrade(
  result: BacktestResult,
  quintiles: QuintileResult[],
): AccuracyGrade {
  const { summaryMetrics } = result

  // Hit rate signal (25%)
  const hitStrength = summaryMetrics.hitRate >= 60 ? 'Strong' : summaryMetrics.hitRate >= 50 ? 'Moderate' : 'Weak'
  const hitScore = hitStrength === 'Strong' ? 100 : hitStrength === 'Moderate' ? 60 : 20

  // Correlation signal (25%)
  const corrStrength = summaryMetrics.correlationScoreVsReturn > 0.5 ? 'Strong'
    : summaryMetrics.correlationScoreVsReturn > 0.3 ? 'Moderate' : 'Weak'
  const corrScore = corrStrength === 'Strong' ? 100 : corrStrength === 'Moderate' ? 60 : 20

  // Staircase signal (25%)
  const hasStaircase = quintiles.length >= 5 && quintiles.every((q, i) =>
    i === 0 || q.avgReturn <= quintiles[i - 1].avgReturn
  )
  const partialStaircase = quintiles.length >= 5 && !hasStaircase &&
    quintiles[0].avgReturn > quintiles[quintiles.length - 1].avgReturn
  const staircaseStrength = hasStaircase ? 'Strong' : partialStaircase ? 'Moderate' : 'Weak'
  const staircaseScore = staircaseStrength === 'Strong' ? 100 : staircaseStrength === 'Moderate' ? 60 : 20

  // Alpha signal (25%)
  const alphaStrength = summaryMetrics.avgAlpha > 5 ? 'Strong'
    : summaryMetrics.avgAlpha > 0 ? 'Moderate' : 'Weak'
  const alphaScore = alphaStrength === 'Strong' ? 100 : alphaStrength === 'Moderate' ? 60 : 20

  const composite = (hitScore + corrScore + staircaseScore + alphaScore) / 4

  // Map to letter grade
  let letter: string
  if (composite >= 90) letter = 'A+'
  else if (composite >= 80) letter = 'A'
  else if (composite >= 70) letter = 'B+'
  else if (composite >= 60) letter = 'B'
  else if (composite >= 50) letter = 'C+'
  else if (composite >= 40) letter = 'C'
  else if (composite >= 30) letter = 'D'
  else letter = 'F'

  const color = composite >= 60 ? 'text-success-400' : composite >= 40 ? 'text-warning-400' : 'text-destructive-400'
  const bgColor = composite >= 60 ? 'bg-success-500/15' : composite >= 40 ? 'bg-warning-500/15' : 'bg-destructive-500/15'

  return {
    letter,
    score: composite,
    color,
    bgColor,
    signals: [
      { label: 'Hit Rate', strength: hitStrength as 'Strong' | 'Moderate' | 'Weak', value: `${fmt(summaryMetrics.hitRate, 0)}%` },
      { label: 'Correlation', strength: corrStrength as 'Strong' | 'Moderate' | 'Weak', value: fmt(summaryMetrics.correlationScoreVsReturn, 2) },
      { label: 'Quintile Pattern', strength: staircaseStrength as 'Strong' | 'Moderate' | 'Weak', value: hasStaircase ? 'Staircase' : partialStaircase ? 'Partial' : 'Absent' },
      { label: 'Avg Alpha', strength: alphaStrength as 'Strong' | 'Moderate' | 'Weak', value: signed(summaryMetrics.avgAlpha) },
    ],
  }
}

// ─── Component ──────────────────────────────────────

export function ScorecardInsights() {
  const backtestResult = useBacktestResult()
  const combinedResult = useCombinedResult()

  const grade = useMemo(() => {
    if (!backtestResult) return null
    return computeAccuracyGrade(backtestResult, backtestResult.quintileAnalysis ?? [])
  }, [backtestResult])

  const verdictBuckets = useMemo(() => {
    if (!backtestResult) return []
    return computeVerdictAccuracy(backtestResult.snapshots, backtestResult.comparisons)
  }, [backtestResult])

  const intervalAccuracy = useMemo(() => {
    if (!combinedResult?.priceDeltaTable) return []
    return computeIntervalAccuracy(combinedResult.priceDeltaTable)
  }, [combinedResult])

  const { wins, misses } = useMemo(() => {
    if (!backtestResult) return { wins: [], misses: [] }
    return computeWinsMisses(backtestResult.snapshots, backtestResult.comparisons)
  }, [backtestResult])

  const trajectories = useMemo(() => {
    if (!backtestResult) return []
    return computeTrajectoryAlignment(backtestResult.snapshots, backtestResult.comparisons)
  }, [backtestResult])

  if (!backtestResult || !grade) {
    return (
      <div className="text-center py-12 text-neutral-500 text-sm">
        Insights require backtest data. Run a backtest first.
      </div>
    )
  }

  const { summaryMetrics } = backtestResult

  return (
    <div className="space-y-4">
      {/* Section 1: Overall Accuracy Grade */}
      <section className="rounded-xl bg-dark-800/60 border border-white/5 p-5">
        <div className="flex items-start gap-5">
          {/* Grade badge */}
          <div className={cn(
            'w-20 h-20 rounded-2xl flex items-center justify-center shrink-0',
            grade.bgColor,
          )}>
            <span className={cn('text-3xl font-bold font-mono', grade.color)}>
              {grade.letter}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-white mb-1">Scorecard Accuracy</h2>
            <p className="text-[12px] leading-relaxed text-neutral-400">
              {getOverallNarrative(summaryMetrics.hitRate, summaryMetrics.correlationScoreVsReturn, summaryMetrics.avgAlpha, backtestResult.comparisons.length)}
            </p>

            {/* Signal pills */}
            <div className="flex flex-wrap gap-2 mt-3">
              {grade.signals.map(s => (
                <div
                  key={s.label}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[10px] font-medium border',
                    s.strength === 'Strong' ? 'bg-success-500/10 border-success-500/20 text-success-400'
                      : s.strength === 'Moderate' ? 'bg-warning-500/10 border-warning-500/20 text-warning-400'
                      : 'bg-destructive-500/10 border-destructive-500/20 text-destructive-400',
                  )}
                >
                  {s.label}: {s.value}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Verdict Accuracy */}
      {verdictBuckets.length > 0 && (
        <section className="rounded-xl bg-dark-800/60 border border-white/5 p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Verdict Accuracy</h3>
          <p className="text-[10px] text-neutral-500 mb-3">Did BUY stocks go up? Did SELL stocks go down?</p>

          {/* Verdict bar chart */}
          <ResponsiveContainer width="100%" height={Math.max(120, verdictBuckets.length * 40)}>
            <BarChart
              data={verdictBuckets.map(b => ({
                verdict: b.verdict,
                avgReturn: Number(b.avgReturn.toFixed(2)),
                accuracy: b.count > 0 ? Number(((b.correct / b.count) * 100).toFixed(0)) : 0,
              }))}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#737373' }} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="verdict" tick={{ fontSize: 10, fill: '#a3a3a3' }} width={75} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a2e',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '11px',
                }}
                formatter={(value: number, name: string) => [
                  `${value}%`,
                  name === 'avgReturn' ? 'Avg Return' : 'Accuracy',
                ]}
              />
              <Bar dataKey="avgReturn" radius={[0, 4, 4, 0]} barSize={18}>
                {verdictBuckets.map((b, i) => (
                  <Cell key={i} fill={b.avgReturn >= 0 ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Verdict narrative */}
          <div className="mt-3 space-y-2">
            {verdictBuckets.map(b => (
              <p key={b.verdict} className="text-[11px] leading-relaxed text-neutral-400">
                <span className="font-semibold text-white">{b.verdict}</span>
                {' '}stocks ({b.count} total): {b.correct} of {b.count} were correct
                ({b.count > 0 ? fmt((b.correct / b.count) * 100, 0) : '0'}% accuracy).
                {' '}Average return: <span className={clr(b.avgReturn)}>{signed(b.avgReturn)}</span>.
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Section 3: Interval Accuracy */}
      {intervalAccuracy.length > 1 && (
        <section className="rounded-xl bg-dark-800/60 border border-white/5 p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Accuracy Over Time</h3>
          <p className="text-[10px] text-neutral-500 mb-3">
            Was the scorecard more accurate at short intervals or long?
          </p>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={intervalAccuracy} margin={{ top: 5, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="interval" tick={{ fontSize: 9, fill: '#737373' }} angle={-30} textAnchor="end" height={50} />
              <YAxis domain={[-1, 1]} tick={{ fontSize: 10, fill: '#737373' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a2e',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '11px',
                }}
                formatter={(value: number, name: string) => [
                  name === 'correlation' ? value.toFixed(3) : `${value.toFixed(0)}%`,
                  name === 'correlation' ? 'Correlation (r)' : 'Hit Rate',
                ]}
              />
              <Line
                type="monotone"
                dataKey="correlation"
                stroke="#a78bfa"
                strokeWidth={2}
                dot={{ fill: '#a78bfa', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Interval narrative */}
          <p className="text-[11px] leading-relaxed text-neutral-400 mt-2">
            {getIntervalNarrative(intervalAccuracy)}
          </p>
        </section>
      )}

      {/* Section 4: Key Wins & Misses */}
      {(wins.length > 0 || misses.length > 0) && (
        <section className="rounded-xl bg-dark-800/60 border border-white/5 p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Key Wins & Misses</h3>
          <p className="text-[10px] text-neutral-500 mb-3">
            Where the scorecard got it right — and where it didn't
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Wins */}
            <div>
              <div className="text-[10px] font-semibold text-success-400 uppercase tracking-wider mb-2">
                Wins
              </div>
              {wins.length === 0 && (
                <p className="text-[11px] text-neutral-500 italic">No clear wins in this run.</p>
              )}
              {wins.map(w => (
                <div key={w.symbol} className="mb-3 rounded-lg bg-success-500/5 border border-success-500/10 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-white">{w.name}</span>
                    <span className="text-[10px] font-mono text-neutral-500">{w.symbol}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] mb-1.5">
                    <span className="text-neutral-400">Score: <span className="font-mono text-white">{fmt(w.score)}</span></span>
                    <span className={cn('font-medium', w.verdictColor)}>{w.verdict}</span>
                    <span className={cn('font-mono font-semibold', clr(w.returnPct))}>{signed(w.returnPct)}</span>
                  </div>
                  <p className="text-[10px] text-neutral-500 leading-relaxed">
                    {w.topSegment && <>Strongest segment: <span className="text-neutral-300">{w.topSegment}</span> ({fmt(w.topSegmentScore ?? 0, 0)}). </>}
                    {w.weakSegment && w.weakSegment !== w.topSegment && <>Weakest: <span className="text-neutral-300">{w.weakSegment}</span> ({fmt(w.weakSegmentScore ?? 0, 0)}).</>}
                  </p>
                </div>
              ))}
            </div>

            {/* Misses */}
            <div>
              <div className="text-[10px] font-semibold text-destructive-400 uppercase tracking-wider mb-2">
                Misses
              </div>
              {misses.length === 0 && (
                <p className="text-[11px] text-neutral-500 italic">No misses — all verdicts aligned with returns.</p>
              )}
              {misses.map(m => (
                <div key={m.symbol} className="mb-3 rounded-lg bg-destructive-500/5 border border-destructive-500/10 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-white">{m.name}</span>
                    <span className="text-[10px] font-mono text-neutral-500">{m.symbol}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] mb-1.5">
                    <span className="text-neutral-400">Score: <span className="font-mono text-white">{fmt(m.score)}</span></span>
                    <span className={cn('font-medium', m.verdictColor)}>{m.verdict}</span>
                    <span className={cn('font-mono font-semibold', clr(m.returnPct))}>{signed(m.returnPct)}</span>
                  </div>
                  <p className="text-[10px] text-neutral-500 leading-relaxed">
                    {m.verdict.toUpperCase().includes('BUY') && m.returnPct < 0 && (
                      <>Despite the BUY rating, the stock declined.
                        {m.weakSegment && <> Weak <span className="text-neutral-300">{m.weakSegment}</span> ({fmt(m.weakSegmentScore ?? 0, 0)}) was a possible warning sign.</>}
                      </>
                    )}
                    {m.verdict.toUpperCase().includes('SELL') && m.returnPct > 0 && (
                      <>The SELL rating missed a rally.
                        {m.topSegment && <> Strong <span className="text-neutral-300">{m.topSegment}</span> ({fmt(m.topSegmentScore ?? 0, 0)}) could have signalled upside.</>}
                      </>
                    )}
                    {m.verdict.toUpperCase().includes('HOLD') && (
                      <>The stock moved significantly despite a HOLD rating, suggesting the scorecard underestimated momentum.</>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section 5: Score vs Price Trajectory */}
      {trajectories.length > 0 && (
        <section className="rounded-xl bg-dark-800/60 border border-white/5 p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Score vs Price Trajectory</h3>
          <p className="text-[10px] text-neutral-500 mb-3">
            Did score trends track price movements from start to end?
          </p>

          {/* Compact table */}
          <div className="rounded-lg border border-white/5 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-dark-700/40 text-[10px] uppercase tracking-wider text-neutral-500">
              <div className="flex-1">Stock</div>
              <div className="w-20 text-center">Score Trend</div>
              <div className="w-20 text-center">Price Trend</div>
              <div className="w-14 text-center">Corr.</div>
              <div className="w-20 text-right">Alignment</div>
            </div>
            {trajectories.map(t => (
              <div key={t.symbol} className="flex items-center gap-2 px-3 py-2 border-t border-white/5 text-xs">
                <div className="flex-1 min-w-0">
                  <span className="text-white">{t.name}</span>
                  <span className="text-neutral-500 ml-1 text-[10px]">{t.symbol}</span>
                </div>
                <div className="w-20 text-center">
                  <TrendArrow trend={t.scoreTrend} />
                  <span className="text-[9px] text-neutral-500 ml-1">
                    {fmt(t.scoreStart, 0)}→{fmt(t.scoreEnd, 0)}
                  </span>
                </div>
                <div className="w-20 text-center">
                  <TrendArrow trend={t.priceTrend} />
                  <span className={cn('text-[9px] font-mono ml-1', clr(t.priceReturn))}>
                    {signed(t.priceReturn)}
                  </span>
                </div>
                <div className="w-14 text-center font-mono text-[10px] text-neutral-300">
                  {fmt(t.correlation, 2)}
                </div>
                <div className={cn(
                  'w-20 text-right text-[10px] font-medium',
                  t.alignment === 'Strong' ? 'text-success-400'
                    : t.alignment === 'Partial' ? 'text-warning-400'
                    : 'text-destructive-400',
                )}>
                  {t.alignment}
                </div>
              </div>
            ))}
          </div>

          {/* Trajectory narrative */}
          <div className="mt-3 space-y-1.5">
            {trajectories.filter(t => t.alignment === 'Strong' || t.alignment === 'Divergent').slice(0, 3).map(t => (
              <p key={t.symbol} className="text-[11px] leading-relaxed text-neutral-400">
                <span className="font-semibold text-white">{t.name}</span>
                {t.alignment === 'Strong' ? (
                  <>{' '}showed strong score-price alignment (r = {fmt(t.correlation, 2)}). Score {t.scoreTrend === 'flat' ? 'held steady' : t.scoreTrend === 'up' ? 'rose' : 'fell'} while price {signed(t.priceReturn)} — the score correctly tracked the move.</>
                ) : (
                  <>{' '}showed divergent score-price behavior (r = {fmt(t.correlation, 2)}). Score moved {t.scoreTrend} but price went {signed(t.priceReturn)}, suggesting the scorecard missed external factors.</>
                )}
              </p>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────

function TrendArrow({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  if (trend === 'up') return <span className="text-success-400">↑</span>
  if (trend === 'down') return <span className="text-destructive-400">↓</span>
  return <span className="text-neutral-500">→</span>
}

// ─── Narrative generators ───────────────────────────

function getOverallNarrative(hitRate: number, correlation: number, avgAlpha: number, stockCount: number): string {
  const strength = correlation > 0.5 ? 'strong' : correlation > 0.3 ? 'moderate' : 'weak'
  const alphaDesc = avgAlpha > 5
    ? `generated meaningful excess returns (alpha: ${signed(avgAlpha)})`
    : avgAlpha > 0
    ? `generated modest excess returns (alpha: ${signed(avgAlpha)})`
    : avgAlpha === 0
    ? `did not generate meaningful excess returns`
    : `failed to generate positive excess returns (alpha: ${signed(avgAlpha)})`

  const hitDesc = hitRate >= 60
    ? `${fmt(hitRate, 0)}% of high-scoring stocks outperformed — a solid hit rate`
    : hitRate >= 50
    ? `${fmt(hitRate, 0)}% of high-scoring stocks outperformed — roughly coin-flip odds`
    : `only ${fmt(hitRate, 0)}% of high-scoring stocks outperformed — below the 50% threshold`

  return `Across ${stockCount} stocks in this backtest, the scorecard showed ${strength} predictive power (r = ${fmt(correlation, 2)}). It ${alphaDesc}. ${hitDesc}.`
}

function getIntervalNarrative(intervals: IntervalAccuracy[]): string {
  if (intervals.length < 2) return 'Not enough intervals for a time-based analysis.'

  const first = intervals[0]
  const last = intervals[intervals.length - 1]
  const improving = last.correlation > first.correlation

  const best = [...intervals].sort((a, b) => b.correlation - a.correlation)[0]

  if (improving) {
    return `Predictive power improved over time: correlation rose from ${fmt(first.correlation, 2)} at ${first.interval} to ${fmt(last.correlation, 2)} at ${last.interval}. This suggests the scorecard is better suited for medium-to-long-term trend identification.`
  }

  if (best.interval === first.interval) {
    return `The scorecard was most predictive at shorter intervals (r = ${fmt(first.correlation, 2)} at ${first.interval}), weakening to ${fmt(last.correlation, 2)} at ${last.interval}. Consider using it for shorter holding periods.`
  }

  return `Correlation peaked at ${best.interval} (r = ${fmt(best.correlation, 2)}), starting at ${fmt(first.correlation, 2)} and ending at ${fmt(last.correlation, 2)}. The scorecard's sweet spot appears to be around the ${best.interval} mark.`
}
