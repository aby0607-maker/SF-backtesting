/**
 * Scoring Service — Orchestrates the scoring pipeline
 *
 * Ties together: metric resolution → scoring engine → cohort building → backtesting.
 * The store calls this service; the service calls engines and data sources.
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
} from '@/types/scoring'
import { scoreStock } from '@/lib/scoringEngine'
import { runBacktest } from '@/lib/backtestEngine'
import { resolveMetricValues, getStockInfo } from '@/services/metricResolver'
import { getAllStocksForScoring, MOCK_COMPANIES, MOCK_OHLCV } from '@/data/mockScoringData'

/**
 * Score a list of stocks using a scorecard.
 * This is the main entry point for Stage 3.
 */
export async function scoreWithScorecard(
  stockIds: string[],
  scorecard: ScorecardVersion
): Promise<ModelRunResult> {
  const stocks: StockScoreResult[] = []

  for (const stockId of stockIds) {
    const metricValues = await resolveMetricValues(stockId)
    const info = getStockInfo(stockId)
    if (!metricValues || !info) continue

    const scored = scoreStock(metricValues, scorecard, info)
    stocks.push({ ...scored, rank: 0 })  // Rank assigned after sorting
  }

  // Sort by score descending, assign ranks
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
 * Score the entire mock universe.
 * Convenience for demo/testing.
 */
export async function scoreFullUniverse(
  scorecard: ScorecardVersion
): Promise<ModelRunResult> {
  const allStockIds = MOCK_COMPANIES.map(c => c.id)
  return scoreWithScorecard(allStockIds, scorecard)
}

/**
 * Build a cohort from scored stocks using filter criteria.
 * Stage 4 entry point.
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
 * Used when the store hasn't generated a full snapshot yet.
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
 * Run a full backtest using mock price data.
 * Stage 7 entry point.
 *
 * @param config - Backtest configuration (dates, interval)
 * @param scorecard - Active scorecard version
 * @param cohortStockIds - Stock IDs from cohort selection (Stage 4). All are evaluated as a group.
 */
export async function backtestScorecard(
  config: BacktestConfig,
  scorecard: ScorecardVersion,
  cohortStockIds?: string[]
): Promise<BacktestResult> {
  // Determine which stocks to include — cohort if provided, otherwise all
  const stockFilter = cohortStockIds && cohortStockIds.length > 0
    ? new Set(cohortStockIds)
    : null

  // Build price history from mock OHLCV, filtered to cohort + date range
  const priceHistory: Record<string, { date: string; price: number }[]> = {}
  for (const [symbol, data] of Object.entries(MOCK_OHLCV)) {
    if (stockFilter && !stockFilter.has(symbol)) continue
    const filtered = data.filter(d => d.date >= config.dateRange.from && d.date <= config.dateRange.to)
    if (filtered.length > 0) {
      priceHistory[symbol] = filtered
    }
  }

  // Build a single snapshot (current scoring) for cohort stocks only
  const allData = getAllStocksForScoring()
  const cohortData = stockFilter
    ? allData.filter(s => stockFilter.has(s.info.id))
    : allData

  const snapshotStocks: StockScoreResult[] = []
  for (const stock of cohortData) {
    const scored = scoreStock(stock.data, scorecard, {
      id: stock.info.id,
      name: stock.info.name,
      symbol: stock.info.symbol,
      sector: stock.info.sector,
      marketCap: stock.info.marketCap,
    })
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
 * Used by Stage 4 filter panel.
 */
export function getAvailableSectors(stocks: StockScoreResult[]): string[] {
  return [...new Set(stocks.map(s => s.sector))].sort()
}

/**
 * Get verdict distribution from scored stocks.
 * Used by Stage 3 summary cards.
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
