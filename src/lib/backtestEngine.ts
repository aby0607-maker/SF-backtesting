/**
 * Backtest Engine — Evaluates scorecard performance over time
 *
 * Core question: "Did stocks that scored well on this scorecard
 * actually outperform their cohort over a given period?"
 *
 * Key outputs:
 * - Cohort comparison (stock vs cohort avg/median)
 * - Quintile analysis (Q1-Q5 performance breakdown)
 * - Metric contribution waterfall (per-stock score drivers)
 * - Score trajectory (score over time with price overlay)
 * - Summary metrics (hit rate, alpha, correlation)
 */

import type {
  BacktestConfig,
  BacktestResult,
  BacktestSnapshot,
  PricePerformance,
  CohortComparison,
  SummaryMetrics,
  QuintileResult,
  MetricContribution,
  ScoreTrajectoryPoint,
  StockScoreResult,
  ScorecardVersion,
  PipelineReviewSnapshot,
} from '@/types/scoring'

// ─────────────────────────────────────────────────
// Backtest Runner
// ─────────────────────────────────────────────────

/**
 * Run a full backtest: score universe at each interval, track performance.
 *
 * @param config - Backtest configuration (dates, interval, benchmark)
 * @param historicalPrices - Map of stockId → array of {date, price}
 * @param snapshots - Pre-computed score snapshots at each interval date
 * @param reviewSnapshot - Pipeline config snapshot for record keeping
 */
export function runBacktest(
  config: BacktestConfig,
  historicalPrices: Record<string, { date: string; price: number }[]>,
  snapshots: BacktestSnapshot[],
  reviewSnapshot: PipelineReviewSnapshot
): BacktestResult {
  // Build performance data for all stocks in the cohort
  const cohortStockIds = Object.keys(historicalPrices)

  // Use snapshot dates as the sample points so prices align exactly with scores
  const snapshotDates = snapshots.map(s => s.date.split('T')[0])

  // Compute price performance for each stock at snapshot dates
  const performances: Record<string, PricePerformance> = {}
  for (const stockId of cohortStockIds) {
    const prices = historicalPrices[stockId] || []
    performances[stockId] = aggregatePerformance(stockId, prices, config.interval, undefined, snapshotDates)
  }

  // Build cohort comparisons for each stock vs the rest
  const comparisons: CohortComparison[] = cohortStockIds.map(stockId => {
    const otherIds = cohortStockIds.filter(id => id !== stockId)
    const targetPerf = performances[stockId]
    const stockName = snapshots[0]?.stockScores.find(s => s.stockId === stockId)?.stockName || stockId

    return computeCohortComparison(stockId, stockName, targetPerf, otherIds, performances)
  })

  // Compute summary metrics
  const summaryMetrics = computeSummaryMetrics(comparisons, snapshots)

  // Compute quintile analysis from the first snapshot
  const quintileAnalysis = snapshots.length > 0
    ? computeQuintileAnalysis(snapshots[0].stockScores, performances, config.interval)
    : undefined

  return {
    config,
    reviewSnapshot,
    snapshots,
    comparisons,
    summaryMetrics,
    quintileAnalysis,
    runTimestamp: Date.now(),
  }
}

// ─────────────────────────────────────────────────
// Performance Aggregation
// ─────────────────────────────────────────────────

/**
 * Aggregate daily price data into the chosen interval.
 *
 * When `sampleDates` is provided, prices are sampled at those exact dates
 * (closest price on or before each date). This ensures performance periods
 * align exactly with scoring snapshots — no date mismatch.
 *
 * When `sampleDates` is not provided, falls back to interval-based sampling
 * (last trading day of each period).
 */
export function aggregatePerformance(
  stockId: string,
  priceData: { date: string; price: number }[],
  interval: string,
  stockName?: string,
  sampleDates?: string[]
): PricePerformance {
  if (priceData.length === 0) {
    return { stockId, stockName, startPrice: NaN, periods: [] }
  }

  // Sort by date
  const sorted = [...priceData].sort((a, b) => a.date.localeCompare(b.date))
  const startPrice = sorted[0].price

  // Sample at the right dates
  const sampled = sampleDates
    ? sampleAtExactDates(sorted, sampleDates)
    : sampleAtInterval(sorted, interval)

  const periods = sampled.map(point => {
    const cumulativeReturn = startPrice > 0
      ? Math.round(((point.price - startPrice) / startPrice) * 100 * 100) / 100
      : 0
    return {
      date: point.date,
      price: point.price,
      returnPct: 0,
      cumulativeReturn,
    }
  })

  // Calculate period-over-period returns (first period uses startPrice as base)
  for (let i = 0; i < periods.length; i++) {
    const prevPrice = i === 0 ? startPrice : periods[i - 1].price
    if (prevPrice > 0) {
      periods[i].returnPct = Math.round(((periods[i].price - prevPrice) / prevPrice) * 100 * 100) / 100
    }
  }

  return { stockId, stockName, startPrice, periods }
}

/**
 * Sample price data at specific target dates.
 * For each target date, finds the closest price on or before that date.
 */
function sampleAtExactDates(
  sortedData: { date: string; price: number }[],
  targetDates: string[]
): { date: string; price: number }[] {
  const result: { date: string; price: number }[] = []

  for (const target of targetDates) {
    // Find closest price on or before this date
    let closest: { date: string; price: number } | null = null
    for (const point of sortedData) {
      if (point.date.split('T')[0] <= target) {
        closest = point
      } else {
        break  // sorted, so no need to continue
      }
    }
    // Always push an entry for every target date to maintain array alignment.
    // Use NaN when no price is available so downstream code can detect and skip.
    result.push({ date: target, price: closest ? closest.price : NaN })
  }

  return result
}

/**
 * Sample price data at the specified interval.
 */
function sampleAtInterval(
  data: { date: string; price: number }[],
  interval: string
): { date: string; price: number }[] {
  if (data.length === 0) return []

  switch (interval) {
    case 'daily':
      return data

    case 'weekly':
      return sampleByPeriod(data, (d) => {
        // ISO week calculation: week starts on Monday
        const date = new Date(d)
        const jan4 = new Date(date.getFullYear(), 0, 4)
        const daysSinceJan4 = Math.floor((date.getTime() - jan4.getTime()) / 86400000)
        const weekNum = Math.ceil((daysSinceJan4 + jan4.getDay() + 1) / 7)
        return `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
      })

    case 'monthly':
      return sampleByPeriod(data, (d) => d.substring(0, 7))  // YYYY-MM

    case 'quarterly':
      return sampleByPeriod(data, (d) => {
        const date = new Date(d)
        const q = Math.ceil((date.getMonth() + 1) / 3)
        return `${date.getFullYear()}-Q${q}`
      })

    case 'yearly':
      return sampleByPeriod(data, (d) => d.substring(0, 4))  // YYYY

    default:
      return data
  }
}

/**
 * Take the last data point in each period.
 */
function sampleByPeriod(
  data: { date: string; price: number }[],
  periodFn: (date: string) => string
): { date: string; price: number }[] {
  const grouped = new Map<string, { date: string; price: number }>()

  for (const point of data) {
    const period = periodFn(point.date)
    grouped.set(period, point)  // Last point wins
  }

  return Array.from(grouped.values())
}

// ─────────────────────────────────────────────────
// Cohort Comparison
// ─────────────────────────────────────────────────

/**
 * Compare a target stock's performance against the cohort.
 */
export function computeCohortComparison(
  targetStockId: string,
  targetStockName: string,
  targetPerformance: PricePerformance,
  cohortStockIds: string[],
  allPerformances: Record<string, PricePerformance>
): CohortComparison {
  const cohortPerfs = cohortStockIds
    .map(id => allPerformances[id])
    .filter(Boolean)

  // Compute cohort average performance
  const cohortAvg = computeAveragePerformance('cohort_avg', cohortPerfs)
  const cohortMedian = computeMedianPerformance('cohort_median', cohortPerfs)

  // Outperformance = target's final return - cohort average final return
  const targetFinal = targetPerformance.periods.length > 0
    ? targetPerformance.periods[targetPerformance.periods.length - 1].cumulativeReturn
    : 0
  const cohortAvgFinal = cohortAvg.periods.length > 0
    ? cohortAvg.periods[cohortAvg.periods.length - 1].cumulativeReturn
    : 0

  return {
    targetStockId,
    targetStockName,
    targetPerformance,
    cohortAvg,
    cohortMedian,
    cohortStocks: cohortPerfs,
    outperformancePct: Math.round((targetFinal - cohortAvgFinal) * 100) / 100,
  }
}

/**
 * Compute average performance across multiple stocks.
 */
function computeAveragePerformance(
  id: string,
  performances: PricePerformance[]
): PricePerformance {
  if (performances.length === 0) return { stockId: id, startPrice: 0, periods: [] }

  // Use the performance with the most periods as the template
  const maxPeriods = Math.max(...performances.map(p => p.periods.length))
  const template = performances.find(p => p.periods.length === maxPeriods)!

  const periods = template.periods.map((period, i) => {
    const returns = performances
      .filter(p => p.periods.length > i && isFinite(p.periods[i].cumulativeReturn))
      .map(p => p.periods[i].cumulativeReturn)

    const avgReturn = returns.length > 0
      ? returns.reduce((a, b) => a + b, 0) / returns.length
      : 0

    return {
      date: period.date,
      price: 0,  // Not meaningful for average
      returnPct: 0,
      cumulativeReturn: Math.round(avgReturn * 100) / 100,
    }
  })

  return { stockId: id, startPrice: 0, periods }
}

/**
 * Compute median performance across multiple stocks.
 */
function computeMedianPerformance(
  id: string,
  performances: PricePerformance[]
): PricePerformance {
  if (performances.length === 0) return { stockId: id, startPrice: 0, periods: [] }

  const maxPeriods = Math.max(...performances.map(p => p.periods.length))
  const template = performances.find(p => p.periods.length === maxPeriods)!

  const periods = template.periods.map((period, i) => {
    const returns = performances
      .filter(p => p.periods.length > i && isFinite(p.periods[i].cumulativeReturn))
      .map(p => p.periods[i].cumulativeReturn)
      .sort((a, b) => a - b)

    let medianReturn = 0
    if (returns.length > 0) {
      const mid = Math.floor(returns.length / 2)
      medianReturn = returns.length % 2 === 0
        ? (returns[mid - 1] + returns[mid]) / 2
        : returns[mid]
    }

    return {
      date: period.date,
      price: 0,
      returnPct: 0,
      cumulativeReturn: Math.round(medianReturn * 100) / 100,
    }
  })

  return { stockId: id, startPrice: 0, periods }
}

// ─────────────────────────────────────────────────
// Summary Metrics
// ─────────────────────────────────────────────────

/**
 * Compute summary metrics for the backtest.
 */
export function computeSummaryMetrics(
  comparisons: CohortComparison[],
  snapshots: BacktestSnapshot[]
): SummaryMetrics {
  if (comparisons.length === 0) {
    return {
      hitRate: 0,
      avgAlpha: 0,
      bestPerformer: { stockId: '', name: '', returnPct: 0 },
      worstPerformer: { stockId: '', name: '', returnPct: 0 },
      correlationScoreVsReturn: 0,
    }
  }

  // Hit rate: % of stocks that outperformed cohort average
  const hits = comparisons.filter(c => c.outperformancePct > 0).length
  const hitRate = Math.round((hits / comparisons.length) * 100 * 100) / 100

  // Average alpha
  const avgAlpha = Math.round(
    (comparisons.reduce((sum, c) => sum + c.outperformancePct, 0) / comparisons.length) * 100
  ) / 100

  // Best and worst performers
  const sorted = [...comparisons].sort((a, b) => {
    const aReturn = a.targetPerformance.periods.length > 0
      ? a.targetPerformance.periods[a.targetPerformance.periods.length - 1].cumulativeReturn
      : 0
    const bReturn = b.targetPerformance.periods.length > 0
      ? b.targetPerformance.periods[b.targetPerformance.periods.length - 1].cumulativeReturn
      : 0
    return bReturn - aReturn
  })

  const bestReturn = sorted[0]?.targetPerformance.periods.length > 0
    ? sorted[0].targetPerformance.periods[sorted[0].targetPerformance.periods.length - 1].cumulativeReturn
    : 0
  const worstReturn = sorted[sorted.length - 1]?.targetPerformance.periods.length > 0
    ? sorted[sorted.length - 1].targetPerformance.periods[sorted[sorted.length - 1].targetPerformance.periods.length - 1].cumulativeReturn
    : 0

  // Score-vs-return correlation
  const correlation = snapshots.length > 0
    ? computeScoreReturnCorrelation(snapshots[0], comparisons)
    : 0

  return {
    hitRate,
    avgAlpha,
    bestPerformer: {
      stockId: sorted[0]?.targetStockId || '',
      name: sorted[0]?.targetStockName || '',
      returnPct: bestReturn,
    },
    worstPerformer: {
      stockId: sorted[sorted.length - 1]?.targetStockId || '',
      name: sorted[sorted.length - 1]?.targetStockName || '',
      returnPct: worstReturn,
    },
    correlationScoreVsReturn: correlation,
  }
}

/**
 * Pearson correlation between initial scores and final returns.
 */
function computeScoreReturnCorrelation(
  initialSnapshot: BacktestSnapshot,
  comparisons: CohortComparison[]
): number {
  const pairs: { score: number; return_: number }[] = []

  for (const comp of comparisons) {
    const scoreResult = initialSnapshot.stockScores.find(s => s.stockId === comp.targetStockId)
    if (!scoreResult) continue

    const finalReturn = comp.targetPerformance.periods.length > 0
      ? comp.targetPerformance.periods[comp.targetPerformance.periods.length - 1].cumulativeReturn
      : 0

    pairs.push({ score: scoreResult.normalizedScore, return_: finalReturn })
  }

  if (pairs.length < 3) return 0
  if (pairs.length < 10) {
    console.warn(`[Backtest] Score-return correlation based on only ${pairs.length} samples — results may be unreliable (recommend 10+)`)
  }

  return pearsonCorrelation(
    pairs.map(p => p.score),
    pairs.map(p => p.return_)
  )
}

/**
 * Pearson correlation coefficient.
 */
function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length
  if (n !== y.length || n < 2) return 0

  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0)

  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
  )

  if (Math.abs(denominator) < 1e-10) return 0
  return Math.round((numerator / denominator) * 1000) / 1000
}

// ─────────────────────────────────────────────────
// Quintile Analysis
// ─────────────────────────────────────────────────

/**
 * Split scored universe into 5 quintiles by score, compute avg return per quintile.
 * The "staircase" pattern (Q1 > Q2 > ... > Q5) proves the scorecard works.
 */
export function computeQuintileAnalysis(
  scoredStocks: StockScoreResult[],
  performances: Record<string, PricePerformance>,
  _interval?: string
): QuintileResult[] {
  if (scoredStocks.length < 5) return []

  // Sort by score descending
  const sorted = [...scoredStocks].sort((a, b) => b.normalizedScore - a.normalizedScore)

  // Distribute stocks evenly across 5 quintiles, spreading remainder across first quintiles
  const baseSize = Math.floor(sorted.length / 5)
  const remainder = sorted.length % 5

  const quintiles: QuintileResult[] = []
  const labels = ['Top 20%', '20-40%', '40-60%', '60-80%', 'Bottom 20%']

  let offset = 0
  for (let q = 0; q < 5; q++) {
    const size = baseSize + (q < remainder ? 1 : 0)
    const stocks = sorted.slice(offset, offset + size)
    offset += size

    if (stocks.length === 0) continue

    // Get final returns for each stock in the quintile (filter out NaN/missing data)
    const returns = stocks
      .map(s => {
        const perf = performances[s.stockId]
        if (!perf || perf.periods.length === 0 || !isFinite(perf.startPrice)) return NaN
        return perf.periods[perf.periods.length - 1].cumulativeReturn
      })
      .filter(r => isFinite(r))

    const avgScore = stocks.reduce((sum, s) => sum + s.normalizedScore, 0) / stocks.length
    const avgReturn = returns.length > 0
      ? returns.reduce((sum, r) => sum + r, 0) / returns.length
      : 0

    // Median return
    let medianReturn = 0
    if (returns.length > 0) {
      const sortedReturns = [...returns].sort((a, b) => a - b)
      const mid = Math.floor(sortedReturns.length / 2)
      medianReturn = sortedReturns.length % 2 === 0
        ? (sortedReturns[mid - 1] + sortedReturns[mid]) / 2
        : sortedReturns[mid]
    }

    // % beating benchmark (positive return as basic benchmark)
    const pctBeatBenchmark = returns.length > 0
      ? (returns.filter(r => r > 0).length / returns.length) * 100
      : 0

    quintiles.push({
      quintile: `Q${q + 1}`,
      label: labels[q],
      avgScore: Math.round(avgScore * 100) / 100,
      avgReturn: Math.round(avgReturn * 100) / 100,
      medianReturn: Math.round(medianReturn * 100) / 100,
      pctBeatBenchmark: Math.round(pctBeatBenchmark * 100) / 100,
      stockCount: stocks.length,
    })
  }

  return quintiles
}

// ─────────────────────────────────────────────────
// Metric Contribution (Waterfall)
// ─────────────────────────────────────────────────

/**
 * Compute per-metric contribution to a stock's final composite score.
 * Returns data suitable for a waterfall chart.
 */
export function computeMetricContribution(
  stockResult: StockScoreResult,
  scorecard: ScorecardVersion
): MetricContribution[] {
  const contributions: MetricContribution[] = []

  for (const segResult of stockResult.segmentResults) {
    const segment = scorecard.segments.find(s => s.id === segResult.segmentId)
    if (!segment) continue

    // Determine the segment's effective weight in the composite
    let segmentEffectiveWeight = 0
    const formula = scorecard.compositeFormula

    // Check base segments
    const baseSeg = formula.baseSegments.find(bs => bs.segmentId === segment.id)
    if (baseSeg) {
      segmentEffectiveWeight = baseSeg.weight * formula.baseWeight
    }

    // Check overlay segments
    const overlaySeg = formula.overlaySegments?.find(os => os.segmentId === segment.id)
    if (overlaySeg) {
      segmentEffectiveWeight = overlaySeg.weight
    }

    // Compute per-metric contribution within this segment
    for (const metricScore of segResult.metricScores) {
      if (metricScore.isExcluded) continue

      const metric = segment.metrics.find(m => m.id === metricScore.metricId)
      const metricWeight = metric?.weight ?? (1 / segment.metrics.length)

      // Contribution = metricScore × metricWeightInSegment × segmentEffectiveWeight
      const activeMetrics = segResult.metricScores.filter(ms => !ms.isExcluded)
      const totalMetricWeight = activeMetrics.reduce(
        (sum, ms) => sum + (segment.metrics.find(m => m.id === ms.metricId)?.weight ?? (1 / segment.metrics.length)),
        0
      )
      const normalizedMetricWeight = totalMetricWeight > 0 ? metricWeight / totalMetricWeight : 0
      const contribution = metricScore.normalizedScore * normalizedMetricWeight * segmentEffectiveWeight

      contributions.push({
        metricId: metricScore.metricId,
        metricName: metricScore.metricName,
        segmentName: segResult.segmentName,
        rawValue: metricScore.rawValue,
        score: metricScore.normalizedScore,
        weight: normalizedMetricWeight * segmentEffectiveWeight,
        contribution: Math.round(contribution * 100) / 100,
      })
    }
  }

  // Sort by contribution magnitude (highest impact first)
  return contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
}

// ─────────────────────────────────────────────────
// Score Trajectory
// ─────────────────────────────────────────────────

/**
 * Compute score trajectory: how a stock's score changed over time.
 * Each point has the score, verdict, and price at that date.
 */
export function computeScoreTrajectory(
  stockId: string,
  snapshots: BacktestSnapshot[],
  priceData: { date: string; price: number }[]
): ScoreTrajectoryPoint[] {
  const priceMap = new Map(priceData.map(p => [p.date, p.price]))

  const points: ScoreTrajectoryPoint[] = []

  for (const snapshot of snapshots) {
    const stockScore = snapshot.stockScores.find(s => s.stockId === stockId)
    if (!stockScore) continue

    // Find the closest price to this snapshot date
    const price = priceMap.get(snapshot.date) ?? findClosestPrice(snapshot.date, priceData)

    // Build segment scores map
    const segmentScores: Record<string, number> = {}
    for (const seg of stockScore.segmentResults) {
      segmentScores[seg.segmentName] = seg.segmentScore
    }

    points.push({
      date: snapshot.date,
      overallScore: stockScore.normalizedScore,
      verdict: stockScore.verdict,
      verdictColor: stockScore.verdictColor,
      price,
      segmentScores,
    })
  }

  return points
}

/**
 * Find the closest price to a given date.
 */
function findClosestPrice(
  targetDate: string,
  priceData: { date: string; price: number }[]
): number {
  if (priceData.length === 0) return 0

  let closest = priceData[0]
  let minDiff = Math.abs(new Date(targetDate).getTime() - new Date(closest.date).getTime())

  for (const point of priceData) {
    const diff = Math.abs(new Date(targetDate).getTime() - new Date(point.date).getTime())
    if (diff < minDiff) {
      minDiff = diff
      closest = point
    }
  }

  return closest.price
}
