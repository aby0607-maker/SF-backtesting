/**
 * CMOTS Fundamentals — TTM, Financial, and Quarterly data
 *
 * Mock mode: converts MOCK_STOCK_METRICS to CMOTS record format
 * API mode: fetches from CMOTS TTM / P&L / Balance Sheet endpoints
 */

import type { CMOTSTTMRecord, CMOTSFinancialRecord } from '@/types/scoring'
import { MOCK_STOCK_METRICS } from '@/data/mockScoringData'
import { cmotsFetch, isMockMode } from './client'

const CACHE_TTL = 60 * 60 * 1000  // 1 hour

/** Find mock metrics by stock symbol/id */
function findMockMetrics(symbol: string) {
  return MOCK_STOCK_METRICS.find(m => m.stockId === symbol) ?? null
}

/**
 * Get TTM (Trailing Twelve Month) data for a stock.
 * Returns a flat record of metric field → value.
 */
export async function getTTMData(symbol: string): Promise<CMOTSTTMRecord | null> {
  if (isMockMode()) {
    const metrics = findMockMetrics(symbol)
    if (!metrics) return null

    return {
      CO_CODE: symbol.charCodeAt(0) * 100,
      // Financial metrics (mapped from v2_ prefixed fields)
      RevenueGrowth3Y: metrics.v2_revenue_growth ?? 0,
      EBITDAGrowth3Y: metrics.v2_ebitda_growth ?? 0,
      EarningsGrowth3Y: metrics.v2_earnings_growth ?? 0,
      ROE: metrics.v2_roe ?? 0,
      // Cash flow (for OCF/EBITDA formula)
      OCF: (metrics.v2_ocf_ebitda ?? 0) * (metrics.v2_debt_ebitda ?? 1) * 1000,
      EBITDA: (metrics.v2_debt_ebitda ?? 1) * 1000,
      TotalDebt: (metrics.v2_debt_ebitda ?? 0) * 1000,
      // Valuation vs 5Y averages
      PE_vs_5YAvg: metrics.v2_pe_vs_5y ?? 0,
      PB_vs_5YAvg: metrics.v2_pb_vs_5y ?? 0,
      EV_EBITDA_vs_5YAvg: metrics.v2_ev_vs_5y ?? 0,
    } as CMOTSTTMRecord
  }

  return await cmotsFetch<CMOTSTTMRecord>({
    endpoint: '/ttm',
    params: { symbol },
    cacheTTL: CACHE_TTL,
  })
}

/** Get quarterly results for a stock (for Revenue/EBITDA Multipliers) */
export async function getQuarterlyResults(symbol: string): Promise<Record<string, number | null>> {
  if (isMockMode()) {
    const metrics = findMockMetrics(symbol)
    if (!metrics) return {}

    return {
      RevenueMultiplier: metrics.v2_revenue_multiplier ?? null,
      EBITDAMultiplier: metrics.v2_ebitda_multiplier ?? null,
    }
  }

  const data = await cmotsFetch<Record<string, number | null>>({
    endpoint: '/quarterly',
    params: { symbol },
    cacheTTL: CACHE_TTL,
  })
  return data ?? {}
}

/** Get financial statements (P&L / Balance Sheet) for a stock */
export async function getFinancialData(
  symbol: string,
  type: 'pnl' | 'balance_sheet' = 'balance_sheet'
): Promise<CMOTSFinancialRecord | null> {
  if (isMockMode()) {
    const metrics = findMockMetrics(symbol)
    if (!metrics) return null

    return {
      CO_CODE: symbol.charCodeAt(0) * 100,
      YEAR: new Date().getFullYear().toString(),
      GrossBlockGrowth: metrics.v2_gross_block ?? 0,
      TotalDebt: (metrics.v2_debt_ebitda ?? 0) * 1000,
    } as CMOTSFinancialRecord
  }

  return await cmotsFetch<CMOTSFinancialRecord>({
    endpoint: `/financials/${type}`,
    params: { symbol },
    cacheTTL: CACHE_TTL,
  })
}

/**
 * Get all fundamental data for a stock in one call.
 * Convenience function that fetches TTM + quarterly + financials.
 */
export async function getAllFundamentals(symbol: string): Promise<{
  ttm: CMOTSTTMRecord | null
  quarterly: Record<string, number | null>
  financials: CMOTSFinancialRecord | null
}> {
  const [ttm, quarterly, financials] = await Promise.all([
    getTTMData(symbol),
    getQuarterlyResults(symbol),
    getFinancialData(symbol),
  ])
  return { ttm, quarterly, financials }
}
