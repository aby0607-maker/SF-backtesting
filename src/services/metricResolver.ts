/**
 * Metric Resolver — Maps scorecard metric IDs to actual data values
 *
 * This is the bridge between abstract metric definitions in scorecards
 * and concrete data from CMOTS (or mock sources). When we change a
 * CMOTS field name, only this file needs updating — scorecards stay stable.
 */

import type { CMOTSTTMRecord, CMOTSFinancialRecord } from '@/types/scoring'
import { getStockDataForScoring } from '@/data/mockScoringData'
import { isMockMode } from '@/services/cmots/client'
import { getAllFundamentals } from '@/services/cmots/fundamentals'
import { getCompanyBySymbol } from '@/services/cmots/companyMaster'

// ─────────────────────────────────────────────────
// CMOTS Field → Metric ID Mapping
// ─────────────────────────────────────────────────

/**
 * Map CMOTS TTM + Financial + Quarterly data to flat metric values.
 *
 * The scoring engine uses metric IDs like `v2_revenue_growth`.
 * CMOTS returns fields like `RevenueGrowth3Y`. This function bridges the two.
 *
 * Add new mappings here when new CMOTS fields become available or
 * when new metrics are added to scorecards.
 */
function mapCMOTSToMetricIds(
  ttm: CMOTSTTMRecord | null,
  quarterly: Record<string, number | null>,
  financials: CMOTSFinancialRecord | null,
  technicalData?: { ema20Dev: number; ema50Dev: number; ema200Dev: number; rsi: number; vpt: number }
): Record<string, number | null> {
  const metrics: Record<string, number | null> = {}

  // ── Financial Metrics (from TTM) ──
  if (ttm) {
    metrics['v2_revenue_growth'] = getField(ttm, 'RevenueGrowth3Y')
    metrics['v2_ebitda_growth'] = getField(ttm, 'EBITDAGrowth3Y')
    metrics['v2_earnings_growth'] = getField(ttm, 'EarningsGrowth3Y')
    metrics['v2_roe'] = getField(ttm, 'ROE')

    // OCF/EBITDA — derived from individual fields
    const ocf = getField(ttm, 'OCF')
    const ebitda = getField(ttm, 'EBITDA')
    metrics['v2_ocf_ebitda'] = ocf != null && ebitda != null && ebitda !== 0
      ? ocf / ebitda
      : null

    // Debt/EBITDA — derived
    const debt = getField(ttm, 'TotalDebt')
    metrics['v2_debt_ebitda'] = debt != null && ebitda != null && ebitda !== 0
      ? debt / ebitda
      : null

    // ── Valuation Metrics (from TTM, ratio vs 5Y average) ──
    metrics['v2_pe_vs_5y'] = getField(ttm, 'PE_vs_5YAvg')
    metrics['v2_pb_vs_5y'] = getField(ttm, 'PB_vs_5YAvg')
    metrics['v2_ev_vs_5y'] = getField(ttm, 'EV_EBITDA_vs_5YAvg')

    // Raw valuation for conditional logic
    metrics['raw_pe'] = getField(ttm, 'PE') ?? getField(ttm, 'PE_vs_5YAvg')
    metrics['raw_pb'] = getField(ttm, 'PB') ?? getField(ttm, 'PB_vs_5YAvg')
    metrics['raw_ev'] = getField(ttm, 'EV_EBITDA') ?? getField(ttm, 'EV_EBITDA_vs_5YAvg')
  }

  // ── Gross Block (from Balance Sheet) ──
  if (financials) {
    metrics['v2_gross_block'] = getField(financials, 'GrossBlockGrowth')
  }

  // ── Quarterly Momentum (from Quarterly Results) ──
  metrics['v2_revenue_multiplier'] = quarterly['RevenueMultiplier'] ?? null
  metrics['v2_ebitda_multiplier'] = quarterly['EBITDAMultiplier'] ?? null

  // ── Technical Metrics ──
  // These come from price data calculations, not CMOTS fundamentals
  if (technicalData) {
    metrics['v2_price_ema20'] = technicalData.ema20Dev
    metrics['v2_price_ema50'] = technicalData.ema50Dev
    metrics['v2_price_ema200'] = technicalData.ema200Dev
    metrics['v2_rsi'] = technicalData.rsi
    metrics['v2_vpt'] = technicalData.vpt
  } else {
    // When technical data is not provided (e.g., no price history for this stock),
    // set to null — the scoring engine will handle exclusion
    metrics['v2_price_ema20'] = null
    metrics['v2_price_ema50'] = null
    metrics['v2_price_ema200'] = null
    metrics['v2_rsi'] = null
    metrics['v2_vpt'] = null
  }

  return metrics
}

/** Safely extract a numeric field from a CMOTS record */
function getField(record: Record<string, unknown>, field: string): number | null {
  const val = record[field]
  if (val === undefined || val === null) return null
  if (typeof val === 'number' && !isNaN(val)) return val
  if (typeof val === 'string') {
    const parsed = parseFloat(val)
    return isNaN(parsed) ? null : parsed
  }
  return null
}

// ─────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────

/**
 * Resolve all metric values for a stock given its ID.
 * Returns a flat Record<metricId, value> suitable for the scoring engine.
 *
 * In mock mode: pulls from MOCK_STOCK_METRICS directly.
 * In API mode: fetches from CMOTS services and maps fields.
 */
export async function resolveMetricValues(
  stockId: string
): Promise<Record<string, number | null> | null> {
  if (isMockMode()) {
    const stockData = getStockDataForScoring(stockId)
    if (!stockData) return null
    return stockData.data
  }

  // API mode: fetch all fundamental data from CMOTS and map to metric IDs
  const { ttm, quarterly, financials } = await getAllFundamentals(stockId)

  // If no TTM data available, this stock can't be scored
  if (!ttm) {
    console.warn(`[MetricResolver] No TTM data for ${stockId}, skipping`)
    return null
  }

  return mapCMOTSToMetricIds(ttm, quarterly, financials)
}

/**
 * Resolve metric values for multiple stocks (batch).
 * Returns a map of stockId → metric values.
 */
export async function resolveMetricValuesBatch(
  stockIds: string[]
): Promise<Record<string, Record<string, number | null>>> {
  const result: Record<string, Record<string, number | null>> = {}

  if (isMockMode()) {
    for (const id of stockIds) {
      const data = await resolveMetricValues(id)
      if (data) result[id] = data
    }
    return result
  }

  // API mode: fetch in parallel for efficiency
  const fetches = stockIds.map(async id => {
    const data = await resolveMetricValues(id)
    if (data) result[id] = data
  })
  await Promise.all(fetches)
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

  return {
    id: company.NSESYMBOL ?? stockId,
    name: company.CompanyName,
    symbol: company.NSESYMBOL ?? stockId,
    sector: company.Sector,
    marketCap: company.MarketCap,
  }
}
