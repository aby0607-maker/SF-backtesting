/**
 * Scoring Service — Orchestrates the scoring pipeline
 *
 * Ties together: metric resolution → scoring engine → backtesting.
 * The store calls this service; the service calls engines and data sources.
 *
 * Data access goes through CMOTS services (which handle mock/API mode internally),
 * so switching from mock to live data is just an env variable toggle.
 */

import type {
  ScorecardVersion,
  ModelRunResult,
  StockScoreResult,
  CohortDefinition,
  CohortFilter,
  BacktestConfig,
  BacktestResult,
  BacktestSnapshot,
  PipelineReviewSnapshot,
  CombinedRunResult,
  PriceDeltaRow,
  BacktestInterval,
} from '@/types/scoring'
import { scoreStock } from '@/lib/scoringEngine'
import { runBacktest } from '@/lib/backtestEngine'
import { resolveMetricValues, getStockInfo } from '@/services/metricResolver'
import { getCompanyMaster } from '@/services/cmots/companyMaster'
import { getBatchPrices } from '@/services/cmots/priceData'

// ─────────────────────────────────────────────────
// Combined Scoring + Backtest (new 5-stage pipeline)
// ─────────────────────────────────────────────────

export type CombinedProgressPhase = 'scoring' | 'backtest' | 'building_table'

/**
 * Score and backtest selected stocks in one combined operation.
 * This is the main entry point for the new 5-stage pipeline (Stage 4 → 5).
 *
 * Phase 1: Score all selected stocks using the scorecard
 * Phase 2: Run backtest using price data over the date range
 * Phase 3: Build the price delta table for interval-based view
 */
export async function scoreAndBacktest(
  stockIds: string[],
  scorecard: ScorecardVersion,
  config: BacktestConfig,
  options?: {
    signal?: AbortSignal
    onProgress?: (phase: CombinedProgressPhase, current: number, total: number) => void
  }
): Promise<CombinedRunResult> {
  // Phase 1: Score all stocks
  const scoring = await scoreWithScorecard(stockIds, scorecard, {
    signal: options?.signal,
    onProgress: (current, total) => options?.onProgress?.('scoring', current, total),
  })

  if (options?.signal?.aborted) {
    throw new Error('Operation cancelled')
  }

  // Phase 2: Run backtest
  options?.onProgress?.('backtest', 0, 1)
  const backtest = await backtestScorecard(config, scorecard, stockIds)
  options?.onProgress?.('backtest', 1, 1)

  if (options?.signal?.aborted) {
    throw new Error('Operation cancelled')
  }

  // Phase 3: Build price delta table
  options?.onProgress?.('building_table', 0, 1)
  const priceDeltaTable = await buildPriceDeltaTable(
    scoring.stocks,
    stockIds,
    config.dateRange.from,
    config.dateRange.to,
    config.interval,
  )
  options?.onProgress?.('building_table', 1, 1)

  return { scoring, backtest, priceDeltaTable }
}

/**
 * Build the price delta table — shows cumulative return % at each interval.
 * Columns: Stock | Score | Verdict | Month 1 | Month 2 | ... (or Week 1, etc.)
 */
export async function buildPriceDeltaTable(
  scoredStocks: StockScoreResult[],
  stockIds: string[],
  fromDate: string,
  toDate: string,
  interval: BacktestInterval,
): Promise<PriceDeltaRow[]> {
  // Fetch price data
  const batchPrices = await getBatchPrices(stockIds, fromDate, toDate)

  const rows: PriceDeltaRow[] = []

  for (const stock of scoredStocks) {
    const prices = batchPrices[stock.stockId]
    if (!prices || prices.length < 2) continue

    // Group prices by interval and compute cumulative returns
    const deltas: Record<string, number> = {}
    const basePrice = prices[0].Dayclose
    if (basePrice <= 0) continue

    const intervalDates = getIntervalDates(prices.map(p => p.Tradedate), interval)

    for (let i = 0; i < intervalDates.length; i++) {
      const date = intervalDates[i]
      // Find the closest price on or before this date
      const price = findClosestPrice(prices, date)
      if (price != null) {
        const cumulativeReturn = ((price - basePrice) / basePrice) * 100
        deltas[getIntervalLabel(interval, i + 1)] = Math.round(cumulativeReturn * 100) / 100
      }
    }

    rows.push({
      stockId: stock.stockId,
      stockName: stock.stockName,
      stockSymbol: stock.stockSymbol,
      score: stock.normalizedScore,
      verdict: stock.verdict,
      verdictColor: stock.verdictColor,
      deltas,
    })
  }

  // Sort by score descending
  rows.sort((a, b) => b.score - a.score)
  return rows
}

/** Get interval boundary dates from a list of all trade dates */
function getIntervalDates(tradeDates: string[], interval: BacktestInterval): string[] {
  if (tradeDates.length === 0) return []

  const dates: string[] = []
  const sorted = [...tradeDates].sort()

  switch (interval) {
    case 'daily':
      // Every trading day
      return sorted.slice(1) // Skip first (base) date

    case 'weekly': {
      // Every ~7 days
      let nextTarget = addDays(sorted[0], 7)
      for (const d of sorted) {
        if (d >= nextTarget) {
          dates.push(d)
          nextTarget = addDays(d, 7)
        }
      }
      return dates
    }

    case 'monthly': {
      // Month boundaries
      let currentMonth = sorted[0].slice(0, 7) // "YYYY-MM"
      for (const d of sorted) {
        const month = d.slice(0, 7)
        if (month !== currentMonth) {
          dates.push(d) // First trading day of new month
          currentMonth = month
        }
      }
      return dates
    }

    case 'quarterly': {
      // Every 3 months
      const firstDate = new Date(sorted[0])
      let nextQ = new Date(firstDate)
      nextQ.setMonth(nextQ.getMonth() + 3)
      for (const d of sorted) {
        if (new Date(d) >= nextQ) {
          dates.push(d)
          nextQ = new Date(d)
          nextQ.setMonth(nextQ.getMonth() + 3)
        }
      }
      return dates
    }

    case 'yearly': {
      let currentYear = sorted[0].slice(0, 4)
      for (const d of sorted) {
        const year = d.slice(0, 4)
        if (year !== currentYear) {
          dates.push(d)
          currentYear = year
        }
      }
      return dates
    }

    default:
      return sorted.slice(1)
  }
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function findClosestPrice(
  prices: { Tradedate: string; Dayclose: number }[],
  targetDate: string
): number | null {
  // Prices are sorted by date — find the closest on or before target
  let closest: number | null = null
  for (const p of prices) {
    const pDate = p.Tradedate.split('T')[0]
    if (pDate <= targetDate) {
      closest = p.Dayclose
    } else {
      break
    }
  }
  return closest
}

function getIntervalLabel(interval: BacktestInterval, index: number): string {
  switch (interval) {
    case 'daily': return `Day ${index}`
    case 'weekly': return `Week ${index}`
    case 'monthly': return `Month ${index}`
    case 'quarterly': return `Q${index}`
    case 'yearly': return `Year ${index}`
    default: return `Period ${index}`
  }
}

// ─────────────────────────────────────────────────
// Original scoring functions (still used internally)
// ─────────────────────────────────────────────────

/**
 * Score a list of stocks using a scorecard.
 * Supports cancellation via AbortSignal and progress callbacks.
 */
export async function scoreWithScorecard(
  stockIds: string[],
  scorecard: ScorecardVersion,
  options?: {
    signal?: AbortSignal
    onProgress?: (scored: number, total: number) => void
  }
): Promise<ModelRunResult> {
  const stocks: StockScoreResult[] = []
  const total = stockIds.length

  for (let i = 0; i < stockIds.length; i++) {
    if (options?.signal?.aborted) {
      console.log(`[Scoring] Cancelled after ${i}/${total} stocks`)
      break
    }

    const stockId = stockIds[i]
    const resolved = await resolveMetricValues(stockId)
    const info = await getStockInfo(stockId)
    if (!resolved || !info) continue

    const scored = scoreStock(resolved.data, scorecard, info, resolved.context)
    stocks.push({ ...scored, rank: 0 })

    options?.onProgress?.(i + 1, total)
  }

  stocks.sort((a, b) => b.normalizedScore - a.normalizedScore)
  stocks.forEach((s, i) => { s.rank = i + 1 })

  return {
    scorecardId: scorecard.id,
    scorecardVersion: scorecard.versionInfo.displayVersion,
    stocks,
    rankedList: stocks.map(s => s.stockId),
    runTimestamp: Date.now(),
    universeSize: stocks.length,
  }
}

/**
 * Score the full universe of stocks.
 */
export async function scoreFullUniverse(
  scorecard: ScorecardVersion
): Promise<ModelRunResult> {
  const companies = await getCompanyMaster()
  const allStockIds = companies.map(c => c.nsesymbol ?? String(c.co_code))
  return scoreWithScorecard(allStockIds, scorecard)
}

/**
 * Build a cohort from scored stocks using filter criteria.
 */
export function buildCohort(
  scoredStocks: StockScoreResult[],
  filters: CohortFilter[],
  name?: string
): CohortDefinition {
  const matching = scoredStocks.filter(stock => {
    for (const filter of filters) {
      switch (filter.type) {
        case 'sector':
          if (stock.sector !== filter.value) return false
          break
        case 'market_cap': {
          const [min, max] = filter.value as [number, number]
          if (stock.marketCap < min || stock.marketCap > max) return false
          break
        }
        case 'score_range': {
          const [minS, maxS] = filter.value as [number, number]
          if (stock.normalizedScore < minS || stock.normalizedScore > maxS) return false
          break
        }
        case 'verdict':
          if (stock.verdict !== filter.value) return false
          break
      }
    }
    return true
  })

  return {
    id: `cohort-${Date.now()}`,
    name: name ?? `Filtered Cohort (${matching.length} stocks)`,
    filters,
    stockIds: matching.map(s => s.stockId),
  }
}

/**
 * Build a minimal review snapshot from scorecard + run data.
 */
function buildReviewSnapshot(
  scorecard: ScorecardVersion,
  stocks?: StockScoreResult[]
): PipelineReviewSnapshot {
  const bySegment = scorecard.segments.map(seg => ({
    segmentName: seg.name,
    metricCount: seg.metrics.length,
  }))

  return {
    scorecardVersion: scorecard,
    selectedMetricsSummary: {
      totalMetrics: bySegment.reduce((sum, s) => sum + s.metricCount, 0),
      bySegment,
    },
    segmentsSummary: {
      totalSegments: scorecard.segments.length,
      segments: scorecard.segments.map(seg => ({
        name: seg.name,
        weight: seg.segmentWeight,
        metricCount: seg.metrics.length,
      })),
      compositeFormula: scorecard.compositeFormula.baseSegments
        .map(bs => {
          const seg = scorecard.segments.find(s => s.id === bs.segmentId)
          return seg ? `${seg.name}(${(bs.weight * 100).toFixed(0)}%)` : ''
        })
        .filter(Boolean)
        .join(' + '),
    },
    scoringResultsSummary: stocks ? {
      universeSize: stocks.length,
      scoreDistribution: getVerdictDistribution(stocks).map(v => ({ band: v.verdict, count: v.count })),
      topFive: stocks.slice(0, 5).map(s => ({ name: s.stockName, score: s.normalizedScore, verdict: s.verdict })),
      bottomFive: stocks.slice(-5).map(s => ({ name: s.stockName, score: s.normalizedScore, verdict: s.verdict })),
    } : undefined,
  }
}

/**
 * Run a full backtest using price data from CMOTS service.
 */
export async function backtestScorecard(
  config: BacktestConfig,
  scorecard: ScorecardVersion,
  cohortStockIds?: string[]
): Promise<BacktestResult> {
  const targetStockIds = cohortStockIds && cohortStockIds.length > 0
    ? cohortStockIds
    : (await getCompanyMaster()).map(c => c.nsesymbol ?? String(c.co_code))

  const batchPrices = await getBatchPrices(targetStockIds, config.dateRange.from, config.dateRange.to)

  const priceHistory: Record<string, { date: string; price: number }[]> = {}
  for (const [symbol, records] of Object.entries(batchPrices)) {
    if (records.length > 0) {
      priceHistory[symbol] = records.map(r => ({
        date: r.Tradedate,
        price: r.Dayclose,
      }))
    }
  }

  const snapshotStocks: StockScoreResult[] = []
  for (const stockId of targetStockIds) {
    const resolved = await resolveMetricValues(stockId)
    const info = await getStockInfo(stockId)
    if (!resolved || !info) continue

    const scored = scoreStock(resolved.data, scorecard, info, resolved.context)
    snapshotStocks.push({ ...scored, rank: 0 })
  }
  snapshotStocks.sort((a, b) => b.normalizedScore - a.normalizedScore)
  snapshotStocks.forEach((s, i) => { s.rank = i + 1 })

  const snapshots: BacktestSnapshot[] = [{
    date: config.dateRange.from,
    stockScores: snapshotStocks,
  }]

  const reviewSnapshot = buildReviewSnapshot(scorecard, snapshotStocks)

  return runBacktest(config, priceHistory, snapshots, reviewSnapshot)
}

/**
 * Get unique sectors from the scored universe.
 */
export function getAvailableSectors(stocks: StockScoreResult[]): string[] {
  return [...new Set(stocks.map(s => s.sector))].sort()
}

/**
 * Get verdict distribution from scored stocks.
 */
export function getVerdictDistribution(
  stocks: StockScoreResult[]
): { verdict: string; count: number; color: string }[] {
  const counts: Record<string, { count: number; color: string }> = {}
  for (const stock of stocks) {
    if (!counts[stock.verdict]) {
      counts[stock.verdict] = { count: 0, color: stock.verdictColor }
    }
    counts[stock.verdict].count++
  }
  return Object.entries(counts)
    .map(([verdict, { count, color }]) => ({ verdict, count, color }))
    .sort((a, b) => b.count - a.count)
}
