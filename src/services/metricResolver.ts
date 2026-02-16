/**
 * Metric Resolver — Maps CMOTS data to scoring metric IDs
 *
 * This is the bridge between raw CMOTS API responses and the scoring engine's
 * abstract metric IDs. All field name mapping, growth derivation, and ratio
 * computation happens here. When CMOTS field names change, only this file
 * needs updating — scorecards stay stable.
 *
 * Data flow:
 *   CMOTS endpoints → fundamentals.ts (raw fetch) → THIS FILE (mapping) → scoringEngine
 */

import type { CMOTSTTMRecord, CMOTSFinancialRecord, CMOTSStatementRow } from '@/types/scoring'
import { getStockDataForScoring } from '@/data/mockScoringData'
import { isMockMode } from '@/services/cmots/client'
import { getAllFundamentals, findStatementRow, getStatementValue, getYearColumns } from '@/services/cmots/fundamentals'
import { getCompanyBySymbol } from '@/services/cmots/companyMaster'
import { getHistoricalPrices } from '@/services/cmots/priceData'
import { ema, rsi, volumePriceTrend, priceVsEMA } from '@/lib/technicalCalc'

// ─────────────────────────────────────────────────
// Return Type — includes context for negative handling
// ─────────────────────────────────────────────────

export interface ResolvedMetrics {
  data: Record<string, number | null>
  context?: Record<string, { startValue?: number; endValue?: number }>
}

// ─────────────────────────────────────────────────
// P&L / Cash Flow Row Numbers (from CMOTS API testing)
// ─────────────────────────────────────────────────
const PNL_ROW_EBITDA = 46   // "Operation Profit before Depreciation"
const PNL_ROW_PAT = 35      // "Profit After Tax"
const PNL_ROW_REVENUE = 1   // "Revenue from Operations"
const CF_ROW_OCF = 68       // "Net Cash Generated from (Used In) Operations"

// ─────────────────────────────────────────────────
// Core Mapping Function
// ─────────────────────────────────────────────────

/**
 * Map all available CMOTS data to flat metric values for the scoring engine.
 *
 * The scoring engine uses metric IDs like `v2_revenue_growth`.
 * CMOTS returns data across 5 different endpoints. This function unifies them.
 */
function mapCMOTSToMetricIds(
  ttm: CMOTSTTMRecord | null,
  finData: CMOTSFinancialRecord[],
  pnl: CMOTSStatementRow[],
  cashFlow: CMOTSStatementRow[],
  quarterly: CMOTSStatementRow[],
  technicalData?: { ema20Dev: number; ema50Dev: number; ema200Dev: number; rsi: number; vpt: number }
): Record<string, number | null> {
  const metrics: Record<string, number | null> = {}

  // ── Growth Metrics (derived from P&L + FinData, 5Y CAGR) ──
  metrics['v2_revenue_growth'] = computeRevenueGrowth5Y(finData, pnl)
  metrics['v2_ebitda_growth'] = computeRowGrowth5Y(pnl, PNL_ROW_EBITDA)
  metrics['v2_earnings_growth'] = computeRowGrowth5Y(pnl, PNL_ROW_PAT)

  // ── Profitability (from TTM) ──
  metrics['v2_roe'] = ttm?.roe_ttm ?? null

  // ── Cash Flow Quality: OCF / EBITDA ──
  const ocf = getLatestStatementValue(cashFlow, CF_ROW_OCF)
  const ebitda = getLatestStatementValue(pnl, PNL_ROW_EBITDA)
  metrics['v2_ocf_ebitda'] = ocf != null && ebitda != null && ebitda !== 0
    ? ocf / ebitda
    : null

  // ── Leverage: Debt/EBITDA ──
  // Use debttoequity from TTM as a proxy for debt burden
  // True Debt/EBITDA would need total debt from balance sheet
  metrics['v2_debt_ebitda'] = ttm?.debttoequity ?? null

  // ── Gross Block Growth (from FinData) ──
  metrics['v2_gross_block'] = computeFinDataGrowth(finData, 'totalassets')

  // ── Valuation: Current ratios ──
  // Ideally these would be "current / 5Y average" ratios.
  // For now we use raw current values — the score bands in the scorecard
  // template should be calibrated to raw PE/PB/EV ranges.
  metrics['v2_pe_vs_5y'] = ttm?.pe_ttm ?? null
  metrics['v2_pb_vs_5y'] = ttm?.pb_ttm ?? null
  metrics['v2_ev_vs_5y'] = ttm?.ev_ebitda ?? null

  // Raw valuation for conditional logic in the scoring engine
  metrics['raw_pe'] = ttm?.pe_ttm ?? null
  metrics['raw_pb'] = ttm?.pb_ttm ?? null
  metrics['raw_ev'] = ttm?.ev_ebitda ?? null

  // ── Quarterly Momentum: Revenue & EBITDA Multipliers ──
  const { revenueMultiplier, ebitdaMultiplier } = computeQuarterlyMultipliers(quarterly)
  metrics['v2_revenue_multiplier'] = revenueMultiplier
  metrics['v2_ebitda_multiplier'] = ebitdaMultiplier

  // ── Technical Metrics ──
  if (technicalData) {
    metrics['v2_price_ema20'] = technicalData.ema20Dev
    metrics['v2_price_ema50'] = technicalData.ema50Dev
    metrics['v2_price_ema200'] = technicalData.ema200Dev
    metrics['v2_rsi'] = technicalData.rsi
    metrics['v2_vpt'] = technicalData.vpt
  } else {
    metrics['v2_price_ema20'] = null
    metrics['v2_price_ema50'] = null
    metrics['v2_price_ema200'] = null
    metrics['v2_rsi'] = null
    metrics['v2_vpt'] = null
  }

  return metrics
}

// ─────────────────────────────────────────────────
// Growth Derivation Helpers
// ─────────────────────────────────────────────────

/**
 * Compute 5-year revenue CAGR from FinData.
 * FinData has `revenue` for each year and `revenue_perc` (YoY growth).
 * We prefer CAGR from absolute values when 5+ years available.
 */
function computeRevenueGrowth5Y(
  finData: CMOTSFinancialRecord[],
  pnl: CMOTSStatementRow[]
): number | null {
  // Try FinData first (cleaner — has yearly revenue)
  if (finData.length >= 5) {
    const latest = finData[finData.length - 1]
    const fiveYearsAgo = finData[finData.length - 5]
    if (latest.revenue > 0 && fiveYearsAgo.revenue > 0) {
      return computeCAGR(fiveYearsAgo.revenue, latest.revenue, 5)
    }
  }

  // Fall back to P&L revenue row
  return computeRowGrowth5Y(pnl, PNL_ROW_REVENUE)
}

/**
 * Compute 5-year CAGR from a P&L or Cash Flow row.
 * Extracts the latest and 5th-oldest year column values.
 */
function computeRowGrowth5Y(rows: CMOTSStatementRow[], rowno: number): number | null {
  const row = findStatementRow(rows, rowno)
  if (!row) return null

  const yearCols = getYearColumns(row)  // Newest first
  if (yearCols.length < 5) return null

  const latest = getStatementValue(row, yearCols[0])
  const fiveYearsAgo = getStatementValue(row, yearCols[4])

  if (latest == null || fiveYearsAgo == null) return null
  if (fiveYearsAgo <= 0) return null  // Can't compute CAGR from negative base

  return computeCAGR(fiveYearsAgo, latest, 5)
}

/** Compute growth in a FinData field over the available period */
function computeFinDataGrowth(
  finData: CMOTSFinancialRecord[],
  field: keyof CMOTSFinancialRecord
): number | null {
  if (finData.length < 2) return null
  const oldest = finData[0][field] as number
  const latest = finData[finData.length - 1][field] as number
  if (!oldest || !latest || oldest <= 0) return null
  return computeCAGR(oldest, latest, finData.length - 1)
}

/** Standard CAGR: (end/start)^(1/years) - 1, returned as percentage */
function computeCAGR(start: number, end: number, years: number): number {
  if (start <= 0 || years <= 0) return 0
  return (Math.pow(end / start, 1 / years) - 1) * 100
}

/** Get the latest year's value from a statement row */
function getLatestStatementValue(rows: CMOTSStatementRow[], rowno: number): number | null {
  const row = findStatementRow(rows, rowno)
  if (!row) return null
  const yearCols = getYearColumns(row)
  if (yearCols.length === 0) return null
  return getStatementValue(row, yearCols[0])
}

// ─────────────────────────────────────────────────
// Growth Context Extraction (for negative handling)
// ─────────────────────────────────────────────────

/**
 * Extract start/end year raw values from a P&L row (5Y span).
 * These values feed the scoring engine's negative handling rules
 * (e.g., start_negative → exclude, both_negative → exclude).
 */
function extractRowContext(
  rows: CMOTSStatementRow[], rowno: number
): { startValue?: number; endValue?: number } | null {
  const row = findStatementRow(rows, rowno)
  if (!row) return null
  const yearCols = getYearColumns(row)
  if (yearCols.length < 5) return null
  const latest = getStatementValue(row, yearCols[0])
  const fiveYearsAgo = getStatementValue(row, yearCols[4])
  if (latest == null && fiveYearsAgo == null) return null
  return { startValue: fiveYearsAgo ?? undefined, endValue: latest ?? undefined }
}

/**
 * Build context for all growth metrics from P&L + FinData.
 * Context carries start/end year values so the scoring engine can determine
 * which negative handling rule applies (start_negative, end_negative, both_negative).
 */
function extractGrowthContext(
  pnl: CMOTSStatementRow[],
  finData: CMOTSFinancialRecord[]
): Record<string, { startValue?: number; endValue?: number }> {
  const context: Record<string, { startValue?: number; endValue?: number }> = {}

  // Revenue — try FinData first (cleaner yearly data), fall back to P&L
  if (finData.length >= 5) {
    context.v2_revenue_growth = {
      startValue: finData[finData.length - 5].revenue,
      endValue: finData[finData.length - 1].revenue,
    }
  } else {
    const revCtx = extractRowContext(pnl, PNL_ROW_REVENUE)
    if (revCtx) context.v2_revenue_growth = revCtx
  }

  // EBITDA
  const ebitdaCtx = extractRowContext(pnl, PNL_ROW_EBITDA)
  if (ebitdaCtx) context.v2_ebitda_growth = ebitdaCtx

  // Earnings (PAT)
  const patCtx = extractRowContext(pnl, PNL_ROW_PAT)
  if (patCtx) context.v2_earnings_growth = patCtx

  return context
}

// ─────────────────────────────────────────────────
// Technical Metrics from OHLCV Price Data
// ─────────────────────────────────────────────────

/**
 * Fetch 1 year of OHLCV data and compute all 5 technical metrics.
 * Returns raw values (deviation %, RSI, VPT) — the scorecard's score bands
 * handle the 0-100 scoring.
 */
async function computeTechnicalFromPrices(
  stockId: string
): Promise<{ ema20Dev: number; ema50Dev: number; ema200Dev: number; rsi: number; vpt: number } | null> {
  try {
    const to = new Date().toISOString().split('T')[0]
    const from = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const prices = await getHistoricalPrices(stockId, from, to)

    if (!prices || prices.length < 200) return null  // Need 200+ days for 200-day EMA

    const closes = prices.map(p => p.Dayclose)
    const volumes = prices.map(p => p.TotalVolume)
    const currentPrice = closes[closes.length - 1]

    const ema20 = ema(closes, 20)
    const ema50 = ema(closes, 50)
    const ema200 = ema(closes, 200)

    const latestEma20 = ema20.length > 0 ? ema20[ema20.length - 1] : null
    const latestEma50 = ema50.length > 0 ? ema50[ema50.length - 1] : null
    const latestEma200 = ema200.length > 0 ? ema200[ema200.length - 1] : null

    if (latestEma20 == null || latestEma50 == null || latestEma200 == null) return null

    const rsiValue = rsi(closes, 14)
    const vptValue = volumePriceTrend(closes, volumes)

    return {
      ema20Dev: priceVsEMA(currentPrice, latestEma20),
      ema50Dev: priceVsEMA(currentPrice, latestEma50),
      ema200Dev: priceVsEMA(currentPrice, latestEma200),
      rsi: rsiValue ?? 50,      // Neutral fallback
      vpt: vptValue ?? 0,       // Neutral fallback
    }
  } catch (err) {
    console.warn(`[MetricResolver] Failed to compute technical metrics for ${stockId}`, err)
    return null
  }
}

// ─────────────────────────────────────────────────
// Quarterly Momentum
// ─────────────────────────────────────────────────

/**
 * Compute Revenue and EBITDA multipliers from quarterly results.
 *
 * Multiplier = Current Quarter Value / Same Quarter Last Year Value
 * This measures YoY acceleration at the quarterly level.
 *
 * Quarterly row structure: COLUMNNAME + Y202512, Y202509, Y202506, Y202503, Y202412, ...
 * Revenue is typically row 1, EBITDA proxy around row 8-10 (Operating Profit).
 */
function computeQuarterlyMultipliers(quarterly: CMOTSStatementRow[]): {
  revenueMultiplier: number | null
  ebitdaMultiplier: number | null
} {
  if (quarterly.length === 0) {
    return { revenueMultiplier: null, ebitdaMultiplier: null }
  }

  // Find revenue row (rowno 1 = "Revenue from Operations" or similar)
  const revenueRow = findStatementRow(quarterly, 1)
  const revenueMultiplier = revenueRow ? computeYoYMultiplier(revenueRow) : null

  // Row 14 = "Profit from operations before other income, finance costs and exceptional items"
  // This is the closest quarterly proxy for EBITDA
  const ebitdaRow = findStatementRow(quarterly, 14)
  const ebitdaMultiplier = ebitdaRow ? computeYoYMultiplier(ebitdaRow) : null

  return { revenueMultiplier, ebitdaMultiplier }
}

/**
 * Compute YoY multiplier: latest quarter / same quarter last year.
 * Quarter columns: Y202512 (Dec 2025), Y202412 (Dec 2024) — same month, 1 year apart.
 */
function computeYoYMultiplier(row: CMOTSStatementRow): number | null {
  const yearCols = getYearColumns(row)  // Newest first
  if (yearCols.length < 5) return null  // Need at least 5 quarters to find same-quarter YoY

  const latestCol = yearCols[0]
  const latestMonth = latestCol.slice(5)  // e.g., "12" from "Y202512"

  // Find same month from previous year
  const sameQuarterLastYear = yearCols.find(col =>
    col !== latestCol && col.slice(5) === latestMonth
  )

  if (!sameQuarterLastYear) return null

  const current = getStatementValue(row, latestCol)
  const previous = getStatementValue(row, sameQuarterLastYear)

  if (current == null || previous == null || previous === 0) return null
  return current / previous
}

// ─────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────

/**
 * Resolve all metric values for a stock given its NSE symbol.
 * Returns metric data + context (start/end year values for negative handling).
 *
 * In mock mode: pulls from MOCK_STOCK_METRICS directly.
 * In API mode: fetches from CMOTS services, computes technical indicators,
 * and extracts growth context from P&L rows.
 */
export async function resolveMetricValues(
  stockId: string
): Promise<ResolvedMetrics | null> {
  if (isMockMode()) {
    const stockData = getStockDataForScoring(stockId)
    if (!stockData) return null
    return { data: stockData.data, context: stockData.context }
  }

  // API mode: fetch fundamentals + price data in parallel
  const [fundamentals, technicalData] = await Promise.all([
    getAllFundamentals(stockId),
    computeTechnicalFromPrices(stockId),
  ])

  const { ttm, finData, pnl, cashFlow, quarterly } = fundamentals

  // If no TTM data available, this stock can't be scored
  if (!ttm) {
    console.warn(`[MetricResolver] No TTM data for ${stockId}, skipping`)
    return null
  }

  const data = mapCMOTSToMetricIds(ttm, finData, pnl, cashFlow, quarterly, technicalData ?? undefined)
  const context = extractGrowthContext(pnl, finData)

  return {
    data,
    context: Object.keys(context).length > 0 ? context : undefined,
  }
}

/**
 * Resolve metric values for multiple stocks (batch).
 * Returns a map of stockId → resolved metrics (data + context).
 */
export async function resolveMetricValuesBatch(
  stockIds: string[]
): Promise<Record<string, ResolvedMetrics>> {
  const result: Record<string, ResolvedMetrics> = {}

  if (isMockMode()) {
    for (const id of stockIds) {
      const resolved = await resolveMetricValues(id)
      if (resolved) result[id] = resolved
    }
    return result
  }

  // API mode: fetch in parallel (batches of 10 to avoid rate limiting)
  const BATCH_SIZE = 10
  for (let i = 0; i < stockIds.length; i += BATCH_SIZE) {
    const batch = stockIds.slice(i, i + BATCH_SIZE)
    const fetches = batch.map(async id => {
      const resolved = await resolveMetricValues(id)
      if (resolved) result[id] = resolved
    })
    await Promise.all(fetches)
  }
  return result
}

/**
 * Get stock info (name, sector, market cap) for scoring result assembly.
 *
 * In mock mode: from MOCK_COMPANIES.
 * In API mode: from CMOTS Company Master.
 */
export async function getStockInfo(stockId: string): Promise<{
  id: string
  name: string
  symbol: string
  sector: string
  marketCap: number
} | null> {
  if (isMockMode()) {
    const stockData = getStockDataForScoring(stockId)
    if (!stockData) return null
    return stockData.info
  }

  // API mode: fetch from CMOTS Company Master
  const company = await getCompanyBySymbol(stockId)
  if (!company) return null

  // Numeric market cap comes from TTM, not company master.
  // Use mcaptype for an approximate bucket value (sufficient for cohort filtering).
  const mcapEstimate = company.mcaptype === 'Large Cap' ? 100000
    : company.mcaptype === 'Mid Cap' ? 25000
    : 5000

  return {
    id: company.nsesymbol ?? String(stockId),
    name: company.companyname,
    symbol: company.nsesymbol ?? stockId,
    sector: company.sectorname,
    marketCap: mcapEstimate,
  }
}
