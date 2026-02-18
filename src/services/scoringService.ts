/**
 * Scoring Service — Orchestrates the scoring pipeline
 *
 * Ties together: metric resolution → scoring engine → backtesting.
 * The store calls this service; the service calls engines and data sources.
 *
 * Data access goes through CMOTS services (which fetch from the CMOTS API).
 * Errors propagate with descriptive reasoning for the UI to display.
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
  MetricResolutionConfig,
  CustomMetricDefinition,
} from '@/types/scoring'
import { scoreStock } from '@/lib/scoringEngine'
import { runBacktest } from '@/lib/backtestEngine'
import { resolveMetricValues, resolveMetricsAtDate, getStockInfo } from '@/services/metricResolver'
import { getCompanyMaster } from '@/services/cmots/companyMaster'
import { getBatchPrices } from '@/services/cmots/priceData'
import type { CMOTSOHLCVRecord } from '@/types/scoring'
import { getAllFundamentals, getYearColumns } from '@/services/cmots/fundamentals'
import type { FundamentalsBundle } from '@/services/cmots/fundamentals'

// ─────────────────────────────────────────────────
// Combined Scoring + Backtest (new 5-stage pipeline)
// ─────────────────────────────────────────────────

export type CombinedProgressPhase = 'scoring' | 'backtest' | 'building_table'

/**
 * Extract MetricResolutionConfig from a scorecard.
 * Scans all segments for growthPeriod overrides and collects custom metric IDs.
 */
function extractResolutionConfig(
  scorecard: ScorecardVersion,
  customMetrics?: CustomMetricDefinition[],
): MetricResolutionConfig | undefined {
  const growthPeriods: Record<string, number> = {}
  for (const seg of scorecard.segments) {
    for (const m of seg.metrics) {
      if (m.growthPeriod) {
        growthPeriods[m.id] = m.growthPeriod
      }
    }
  }

  const hasGrowthPeriods = Object.keys(growthPeriods).length > 0
  const hasCustomMetrics = customMetrics && customMetrics.length > 0

  if (!hasGrowthPeriods && !hasCustomMetrics) return undefined

  return {
    growthPeriods: hasGrowthPeriods ? growthPeriods : undefined,
    customMetrics: hasCustomMetrics ? customMetrics : undefined,
  }
}

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
    customMetrics?: CustomMetricDefinition[]
  }
): Promise<CombinedRunResult> {
  // Phase 1: Score all stocks
  const scoring = await scoreWithScorecard(stockIds, scorecard, {
    signal: options?.signal,
    onProgress: (current, total) => options?.onProgress?.('scoring', current, total),
    customMetrics: options?.customMetrics,
  })

  if (options?.signal?.aborted) {
    throw new Error('Operation cancelled')
  }

  // Phase 2: Run backtest (returns pre-fetched prices + interval dates for reuse)
  options?.onProgress?.('backtest', 0, 1)
  const { result: backtest, batchPrices, intervalDates } = await backtestScorecard(config, scorecard, stockIds, options?.signal)
  options?.onProgress?.('backtest', 1, 1)

  if (options?.signal?.aborted) {
    throw new Error('Operation cancelled')
  }

  // Phase 3: Build price delta table (reuses prices + dates from backtest — no redundant fetch)
  options?.onProgress?.('building_table', 0, 1)
  const priceDeltaTable = await buildPriceDeltaTable(
    scoring.stocks,
    stockIds,
    config.dateRange.from,
    config.dateRange.to,
    config.interval,
    batchPrices,
    intervalDates,
  )
  options?.onProgress?.('building_table', 1, 1)

  // Phase 4: Align priceDeltaTable scores with end-date snapshot (not one-shot scoring)
  // The one-shot scoring uses "latest" data; the end-date snapshot uses historical data at that date.
  // All tabs should show end-date scores for consistency.
  if (backtest.snapshots.length > 0) {
    const endSnapshot = backtest.snapshots[backtest.snapshots.length - 1]
    const endScoreMap = new Map(
      endSnapshot.stockScores.map(s => [s.stockId, s])
    )
    for (const row of priceDeltaTable) {
      const endStock = endScoreMap.get(row.stockId)
      if (endStock) {
        row.score = endStock.normalizedScore
        row.verdict = endStock.verdict
        row.verdictColor = endStock.verdictColor
      }
    }
  }

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
  prefetchedPrices?: Record<string, CMOTSOHLCVRecord[]>,
  prefetchedDates?: string[],
): Promise<PriceDeltaRow[]> {
  // Reuse pre-fetched prices if available (from backtestScorecard), otherwise fetch
  const batchPrices = prefetchedPrices ?? await getBatchPrices(stockIds, fromDate, toDate)

  const rows: PriceDeltaRow[] = []

  for (const stock of scoredStocks) {
    const prices = batchPrices[stock.stockId]
    if (!prices || prices.length < 2) continue

    // Group prices by interval and compute cumulative returns
    const deltas: Record<string, number> = {}
    const intervalPrices: Record<string, number> = {}
    const basePrice = prices[0].Dayclose
    if (basePrice <= 0) continue

    // Reuse pre-computed interval dates if available, otherwise compute from trade dates
    const intervalDates = prefetchedDates ?? getIntervalDates(prices.map(p => p.Tradedate), interval)

    for (let i = 0; i < intervalDates.length; i++) {
      const date = intervalDates[i]
      // Find the closest price on or before this date
      const price = findClosestPrice(prices, date)
      if (price != null) {
        const label = getIntervalLabel(interval, i + 1)
        const cumulativeReturn = ((price - basePrice) / basePrice) * 100
        deltas[label] = Math.round(cumulativeReturn * 100) / 100
        intervalPrices[label] = Math.round(price * 100) / 100
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
      basePrice: Math.round(basePrice * 100) / 100,
      prices: intervalPrices,
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
    customMetrics?: CustomMetricDefinition[]
  }
): Promise<ModelRunResult> {
  const stocks: StockScoreResult[] = []
  const warnings: string[] = []
  const total = stockIds.length
  const resConfig = extractResolutionConfig(scorecard, options?.customMetrics)

  for (let i = 0; i < stockIds.length; i++) {
    if (options?.signal?.aborted) {
      console.log(`[Scoring] Cancelled after ${i}/${total} stocks`)
      break
    }

    const stockId = stockIds[i]
    const info = await getStockInfo(stockId)
    if (!info) {
      warnings.push(`Stock ${stockId}: Company not found in BSE master`)
      options?.onProgress?.(i + 1, total)
      continue
    }

    const resolved = await resolveMetricValues(stockId, resConfig)
    if (!resolved) {
      warnings.push(`${info.name} (${stockId}): No fundamental data from API`)
      options?.onProgress?.(i + 1, total)
      continue
    }

    const scored = scoreStock(resolved.data, scorecard, info, resolved.context)
    stocks.push({ ...scored, rank: 0 })

    options?.onProgress?.(i + 1, total)
  }

  stocks.sort((a, b) => b.normalizedScore - a.normalizedScore)
  stocks.forEach((s, i) => { s.rank = i + 1 })

  if (warnings.length > 0) {
    console.warn(`[Scoring] ${warnings.length} stocks skipped:`, warnings)
  }

  return {
    scorecardId: scorecard.id,
    scorecardVersion: scorecard.versionInfo.displayVersion,
    stocks,
    rankedList: stocks.map(s => s.stockId),
    runTimestamp: Date.now(),
    universeSize: stocks.length,
    warnings: warnings.length > 0 ? warnings : undefined,
  }
}

/**
 * Score the full universe of stocks.
 */
export async function scoreFullUniverse(
  scorecard: ScorecardVersion
): Promise<ModelRunResult> {
  const companies = await getCompanyMaster()
  const allStockIds = companies.map(c => String(c.co_code))
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
 *
 * Fetches fundamentals + prices once per stock, then re-scores at each
 * interval date using windowed historical data (no additional network calls).
 */
export async function backtestScorecard(
  config: BacktestConfig,
  scorecard: ScorecardVersion,
  cohortStockIds?: string[],
  signal?: AbortSignal
): Promise<{ result: BacktestResult; batchPrices: Record<string, CMOTSOHLCVRecord[]>; intervalDates: string[] }> {
  const targetStockIds = cohortStockIds && cohortStockIds.length > 0
    ? cohortStockIds
    : (await getCompanyMaster()).map(c => String(c.co_code))

  // ── Phase 1: Fetch all data upfront (network-heavy, done once) ──

  // Extend price fetch 6 years before from-date:
  // - Technical metrics (EMA200) need 200+ trading days (~1 year)
  // - Valuation 5Y average needs FY-end prices going back 5 years
  const extendedFrom = new Date(config.dateRange.from)
  extendedFrom.setFullYear(extendedFrom.getFullYear() - 6)
  const extendedFromStr = extendedFrom.toISOString().split('T')[0]

  const batchPrices = await getBatchPrices(targetStockIds, extendedFromStr, config.dateRange.to)

  // Two views of price data:
  // - priceHistoryWithVolume: FULL extended range (for resolveMetricsAtDate — EMA200 needs 200+ days lookback)
  // - priceHistory: FILTERED to user's date range (for backtestEngine + interval computation)
  const priceHistory: Record<string, { date: string; price: number }[]> = {}
  const priceHistoryWithVolume: Record<string, { date: string; price: number; volume?: number }[]> = {}
  const fromDate = config.dateRange.from
  for (const [symbol, records] of Object.entries(batchPrices)) {
    if (records.length > 0) {
      // Full range with normalized dates — for metric resolution (technical lookback)
      // Sort ascending by date — CMOTS API may return descending order
      priceHistoryWithVolume[symbol] = records
        .map(r => ({
          date: r.Tradedate.split('T')[0],  // Normalize ISO datetime to plain date
          price: r.Dayclose,
          volume: r.TotalVolume,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
      // Filtered to user's range — for backtest engine + interval dates + cumulative returns
      const inRange = records.filter(r => r.Tradedate.split('T')[0] >= fromDate)
      priceHistory[symbol] = inRange
        .map(r => ({
          date: r.Tradedate.split('T')[0],
          price: r.Dayclose,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
    }
  }

  // Fetch fundamentals + stock info for each stock (parallel)
  const stockData: {
    stockId: string
    fundamentals: FundamentalsBundle
    info: { id: string; name: string; symbol: string; sector: string; marketCap: number }
  }[] = []
  const backtestWarnings: string[] = []

  // Track which stocks had no price data from the API
  const noPriceStocks: string[] = []
  for (const stockId of targetStockIds) {
    const records = batchPrices[stockId]
    if (!records || records.length === 0) {
      noPriceStocks.push(stockId)
    }
  }

  const settled = await Promise.allSettled(targetStockIds.map(async (stockId) => {
    const [fundamentals, info] = await Promise.all([
      getAllFundamentals(stockId),
      getStockInfo(stockId),
    ])
    return { stockId, fundamentals, info }
  }))

  for (const result of settled) {
    if (result.status === 'rejected') {
      const reason = result.reason instanceof Error ? result.reason.message : String(result.reason)
      backtestWarnings.push(`Stock data fetch failed: ${reason}`)
      continue
    }
    const { stockId, fundamentals, info } = result.value
    if (!info) {
      backtestWarnings.push(`Stock ${stockId}: Company not found in BSE master`)
      continue
    }
    if (noPriceStocks.includes(stockId)) {
      backtestWarnings.push(`${info.name}: No price data from API for ${config.dateRange.from} → ${config.dateRange.to}`)
    }
    if (!fundamentals.ttm && fundamentals.pnl.length === 0) {
      backtestWarnings.push(`${info.name}: No fundamental data (TTM/P&L) from API`)
    }
    stockData.push({ stockId, fundamentals, info })
  }

  // ── Data Coverage Check ──
  // Detect if the backtest start date is before the earliest scoreable date.
  // CMOTS provides ~5 recent fiscal year columns. If the start date is before
  // the oldest FY end, windowed year columns will be empty → all metrics N/A.
  const coverageInfo = computeDataCoverage(stockData, priceHistoryWithVolume, config.dateRange.from)
  if (coverageInfo.warning) {
    backtestWarnings.unshift(coverageInfo.warning)
  }

  // ── Phase 2: Compute interval dates ──

  const anyPriceHistory = Object.values(priceHistory)[0]
  const allTradeDates = anyPriceHistory
    ? anyPriceHistory.map(p => p.date).sort()  // Already plain dates, already filtered to user's range
    : []
  const intervalDates = getIntervalDates(allTradeDates, config.interval)

  // ── Phase 3: Score at each interval (CPU-only, no network) ──

  const resConfig = extractResolutionConfig(scorecard)

  const scoreAtDate = (asOfDate: string): StockScoreResult[] => {
    const stocks: StockScoreResult[] = []

    for (const { stockId, fundamentals, info } of stockData) {
      const prices = priceHistoryWithVolume[stockId]
      if (!prices || prices.length === 0) continue

      const resolved = resolveMetricsAtDate(fundamentals, prices, asOfDate, resConfig)
      const scored = scoreStock(resolved.data, scorecard, info, resolved.context)
      stocks.push({ ...scored, rank: 0 })
    }

    // Rank by score descending
    stocks.sort((a, b) => b.normalizedScore - a.normalizedScore)
    stocks.forEach((s, i) => { s.rank = i + 1 })
    return stocks
  }

  // Start snapshot (earliest date)
  const startStocks = scoreAtDate(config.dateRange.from)
  const snapshots: BacktestSnapshot[] = [{
    date: config.dateRange.from,
    stockScores: startStocks,
  }]

  // Interval snapshots — re-score at each date with windowed fundamentals + prices
  for (const date of intervalDates) {
    if (signal?.aborted) {
      throw new Error('Operation cancelled')
    }
    snapshots.push({
      date,
      stockScores: scoreAtDate(date),
    })
  }

  const reviewSnapshot = buildReviewSnapshot(scorecard, startStocks)

  // Filter batchPrices to user's date range for delta table (exclude extended lookback period)
  const filteredBatchPrices: Record<string, CMOTSOHLCVRecord[]> = {}
  for (const [symbol, records] of Object.entries(batchPrices)) {
    filteredBatchPrices[symbol] = records.filter(r => r.Tradedate.split('T')[0] >= fromDate)
  }

  if (backtestWarnings.length > 0) {
    console.warn(`[Backtest] ${backtestWarnings.length} data warnings:`, backtestWarnings)
  }

  const btResult = runBacktest(config, priceHistory, snapshots, reviewSnapshot)
  if (backtestWarnings.length > 0) {
    btResult.warnings = backtestWarnings
  }

  return {
    result: btResult,
    batchPrices: filteredBatchPrices,
    intervalDates,
  }
}

// ─────────────────────────────────────────────────
// Data Coverage Detection
// ─────────────────────────────────────────────────

/**
 * Compute the earliest date where meaningful scoring is possible.
 *
 * CMOTS provides ~5 recent fiscal year columns. Growth metrics need ≥ 2 windowed
 * year columns, and technical metrics need ≥ 200 trading days of price history.
 * If the user's backtest start date is before these thresholds, scores will be
 * mostly N/A at early intervals.
 */
function computeDataCoverage(
  stockData: { stockId: string; fundamentals: FundamentalsBundle; info: { name: string } }[],
  priceHistoryWithVolume: Record<string, { date: string; price: number; volume?: number }[]>,
  fromDate: string,
): { warning: string | null; earliestFundamental: string | null; earliestTechnical: string | null } {
  // Find the earliest fiscal year end across all stocks' P&L data.
  // Year columns are like Y202103 → fiscal year ending March 2021.
  let earliestFYEnd: Date | null = null
  let secondEarliestFYEnd: Date | null = null

  for (const { fundamentals } of stockData) {
    if (fundamentals.pnl.length === 0) continue

    // Check any P&L row for year columns (they're the same across rows)
    const sampleRow = fundamentals.pnl[0]
    const yearCols = getYearColumns(sampleRow)
    if (yearCols.length === 0) continue

    // Year columns are newest first — last one is oldest
    for (const col of yearCols) {
      const year = parseInt(col.slice(1, 5))
      const month = parseInt(col.slice(5, 7))
      const fyEnd = new Date(year, month, 0)  // Last day of the month (day 0 of next month)

      if (!earliestFYEnd || fyEnd < earliestFYEnd) {
        secondEarliestFYEnd = earliestFYEnd
        earliestFYEnd = fyEnd
      } else if (!secondEarliestFYEnd || fyEnd < secondEarliestFYEnd) {
        secondEarliestFYEnd = fyEnd
      }
    }

    // Only need to check one stock — year columns are the same across stocks
    break
  }

  // Earliest date for single-value metrics (ROE, valuation): 1 FY column needed
  const earliestFundamental = earliestFYEnd
    ? earliestFYEnd.toISOString().split('T')[0]
    : null

  // Earliest date for growth metrics: 2 FY columns needed
  const earliestGrowth = secondEarliestFYEnd
    ? secondEarliestFYEnd.toISOString().split('T')[0]
    : null

  // Earliest date for technical: first available price date + 200 trading days
  let earliestTechnical: string | null = null
  const allFirstDates: string[] = []
  for (const prices of Object.values(priceHistoryWithVolume)) {
    if (prices.length > 0) {
      allFirstDates.push(prices[0].date)
    }
  }
  if (allFirstDates.length > 0) {
    allFirstDates.sort()
    const first = allFirstDates[0]
    // ~200 trading days ≈ 10 calendar months
    const techDate = new Date(first)
    techDate.setMonth(techDate.getMonth() + 10)
    earliestTechnical = techDate.toISOString().split('T')[0]
  }

  // Build structured warning with per-category dates and reasons
  const thresholds: { category: string; metrics: string; availableFrom: string; reason: string }[] = []

  if (earliestFundamental && fromDate < earliestFundamental) {
    thresholds.push({
      category: 'Financial & Valuation',
      metrics: 'ROE, OCF/EBITDA, Debt/EBITDA, PE, PB, EV/EBITDA',
      availableFrom: formatFYDate(earliestFYEnd!),
      reason: `CMOTS P&L/Balance Sheet data starts from FY ending ${formatFYDate(earliestFYEnd!)}. Need ≥1 fiscal year column.`,
    })
  }
  if (earliestGrowth && fromDate < earliestGrowth) {
    thresholds.push({
      category: 'Growth',
      metrics: 'Revenue CAGR, EBITDA CAGR, Earnings CAGR, Gross Block Growth',
      availableFrom: formatFYDate(secondEarliestFYEnd!),
      reason: `CAGR computation needs ≥2 fiscal year columns. Second-oldest FY ends ${formatFYDate(secondEarliestFYEnd!)}.`,
    })
  }
  if (earliestTechnical && fromDate < earliestTechnical) {
    thresholds.push({
      category: 'Technical',
      metrics: 'EMA20/50/200, RSI, Volume-Price Trend',
      availableFrom: `~${earliestTechnical}`,
      reason: `EMA200 needs 200+ trading days. Price data starts ${allFirstDates[0]}, so ~10 months later.`,
    })
  }

  if (thresholds.length === 0) {
    return { warning: null, earliestFundamental, earliestTechnical }
  }

  // Compute recommended start date (max of all thresholds)
  const allDates = [earliestFundamental, earliestGrowth, earliestTechnical].filter(Boolean) as string[]
  const recommendedDate = allDates.sort().pop() ?? fromDate

  // Encode as JSON inside the ⚠ prefix so the UI can parse the structure
  const warning = `⚠ Data coverage: ${JSON.stringify({ fromDate, recommendedDate, thresholds })}`

  return { warning, earliestFundamental, earliestTechnical }
}

/** Format a fiscal year end date for display (e.g., "March 2021") */
function formatFYDate(date: Date): string {
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

// ─────────────────────────────────────────────────
// Pre-compute earliest scoreable date (for date picker enforcement)
// ─────────────────────────────────────────────────

export interface EarliestScoreableDateResult {
  /** Absolute minimum — any earlier and no scoring is possible */
  absoluteMin: string | null
  /** Per-category thresholds for tiered date-picker hints */
  categoryDates: {
    fundamental: string | null  // 1 FY column needed
    growth: string | null       // 2 FY columns needed
    technical: string | null    // ~200 trading days needed
  }
}

const EMPTY_RESULT: EarliestScoreableDateResult = {
  absoluteMin: null,
  categoryDates: { fundamental: null, growth: null, technical: null },
}

let cachedMinDate: { symbols: string; result: EarliestScoreableDateResult } | null = null

/**
 * Lightweight pre-computation of the earliest date where scoring is meaningful.
 *
 * Returns `absoluteMin` = earliest fundamental date (1 FY column available).
 * Before this, zero metrics can be scored. Between absoluteMin and later
 * category dates, scoring works with partial data — the scoring engine
 * handles weight redistribution for unavailable metrics.
 *
 * Also returns per-category dates so the date picker can show tiered hints.
 * Results are cached — safe to call multiple times.
 */
export async function computeEarliestScoreableDate(
  stockSymbols: string[],
): Promise<EarliestScoreableDateResult> {
  if (stockSymbols.length === 0) return EMPTY_RESULT

  // Cache key uses sorted symbols to avoid order-dependent misses
  const symbolsKey = [...stockSymbols].sort().join('\0')

  if (cachedMinDate && cachedMinDate.symbols === symbolsKey) {
    return cachedMinDate.result
  }

  const firstSymbol = stockSymbols[0]

  try {
    // Fetch P&L for one stock — FY year columns are the same across stocks
    const fundamentals = await getAllFundamentals(firstSymbol)

    // Fetch price history with a wide range to find the earliest date
    const prices = await getBatchPrices([firstSymbol], '2018-01-01', new Date().toISOString().split('T')[0])
    const priceList = prices[firstSymbol] ?? []

    // Compute FY boundaries from P&L year columns
    let earliestFYEnd: Date | null = null
    let secondEarliestFYEnd: Date | null = null

    if (fundamentals.pnl.length > 0) {
      const yearCols = getYearColumns(fundamentals.pnl[0])
      for (const col of yearCols) {
        const year = parseInt(col.slice(1, 5))
        const month = parseInt(col.slice(5, 7))
        const fyEnd = new Date(year, month, 0)  // Last day of the month (day 0 of next month)

        if (!earliestFYEnd || fyEnd < earliestFYEnd) {
          secondEarliestFYEnd = earliestFYEnd
          earliestFYEnd = fyEnd
        } else if (!secondEarliestFYEnd || fyEnd < secondEarliestFYEnd) {
          secondEarliestFYEnd = fyEnd
        }
      }
    }

    const earliestFundamental = earliestFYEnd?.toISOString().split('T')[0] ?? null
    const earliestGrowth = secondEarliestFYEnd?.toISOString().split('T')[0] ?? null

    // Technical: first price date + ~200 trading days (~10 months)
    let earliestTechnical: string | null = null
    if (priceList.length > 0) {
      const firstDate = priceList[0].Tradedate
      if (firstDate) {
        const techDate = new Date(firstDate)
        techDate.setMonth(techDate.getMonth() + 10)
        earliestTechnical = techDate.toISOString().split('T')[0]
      }
    }

    // absoluteMin = earliestFundamental (not max of all dates)
    // Partial scoring is valid — the engine redistributes weights for N/A metrics
    const result: EarliestScoreableDateResult = {
      absoluteMin: earliestFundamental,
      categoryDates: {
        fundamental: earliestFundamental,
        growth: earliestGrowth,
        technical: earliestTechnical,
      },
    }

    cachedMinDate = { symbols: symbolsKey, result }
    return result
  } catch (err) {
    console.warn('[computeEarliestScoreableDate] Failed:', err)
    cachedMinDate = { symbols: symbolsKey, result: EMPTY_RESULT }
    return EMPTY_RESULT
  }
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
