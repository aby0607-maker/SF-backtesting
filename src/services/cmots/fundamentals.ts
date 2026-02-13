/**
 * CMOTS Fundamentals — TTM, FinData, P&L, Cash Flow, Quarterly
 *
 * Endpoints:
 *   /TTMData/{co_code}/s         — Current trailing-twelve-month ratios
 *   /FinData/{co_code}/s         — Yearly financial metrics (5 years)
 *   /ProftandLoss/{co_code}/s    — P&L statement rows with year columns
 *   /CashFlow/{co_code}/s        — Cash flow rows with year columns
 *   /QuarterlyResults/{co_code}/s — Quarterly result rows with quarter columns
 *
 * Mock mode: converts MOCK_STOCK_METRICS to compatible format
 * API mode: resolves symbol→co_code, fetches all endpoints in parallel
 */

import type {
  CMOTSTTMRecord,
  CMOTSFinancialRecord,
  CMOTSStatementRow,
} from '@/types/scoring'
import { MOCK_STOCK_METRICS } from '@/data/mockScoringData'
import { cmotsFetch, cmotsFetchOne, isMockMode } from './client'
import { getCoCode } from './companyMaster'

const CACHE_TTL = 12 * 60 * 60 * 1000  // 12 hours — fundamentals barely change intra-day

// ── Individual endpoint fetchers ──

/** Get TTM (Trailing Twelve Month) ratios for a stock */
export async function getTTMData(symbol: string): Promise<CMOTSTTMRecord | null> {
  if (isMockMode()) {
    return buildMockTTM(symbol)
  }

  const coCode = await getCoCode(symbol)
  if (!coCode) return null

  return await cmotsFetchOne<CMOTSTTMRecord>({
    endpoint: `/TTMData/${coCode}/s`,
    cacheTTL: CACHE_TTL,
  })
}

/** Get yearly financial data (FinData) — returns multiple years, sorted oldest first */
export async function getFinancialData(symbol: string): Promise<CMOTSFinancialRecord[]> {
  if (isMockMode()) return []

  const coCode = await getCoCode(symbol)
  if (!coCode) return []

  const data = await cmotsFetch<CMOTSFinancialRecord>({
    endpoint: `/FinData/${coCode}/s`,
    cacheTTL: CACHE_TTL,
  })
  // Sort by yrc ascending (oldest first) for growth calculations
  return data.sort((a, b) => a.yrc - b.yrc)
}

/** Get P&L statement rows (row-based with year columns) */
export async function getProfitAndLoss(symbol: string): Promise<CMOTSStatementRow[]> {
  if (isMockMode()) return []

  const coCode = await getCoCode(symbol)
  if (!coCode) return []

  return await cmotsFetch<CMOTSStatementRow>({
    endpoint: `/ProftandLoss/${coCode}/s`,
    cacheTTL: CACHE_TTL,
  })
}

/** Get cash flow statement rows (row-based with year columns) */
export async function getCashFlow(symbol: string): Promise<CMOTSStatementRow[]> {
  if (isMockMode()) return []

  const coCode = await getCoCode(symbol)
  if (!coCode) return []

  return await cmotsFetch<CMOTSStatementRow>({
    endpoint: `/CashFlow/${coCode}/s`,
    cacheTTL: CACHE_TTL,
  })
}

/** Get quarterly results rows (row-based with quarter columns like Y202512) */
export async function getQuarterlyResults(symbol: string): Promise<CMOTSStatementRow[]> {
  if (isMockMode()) return []

  const coCode = await getCoCode(symbol)
  if (!coCode) return []

  return await cmotsFetch<CMOTSStatementRow>({
    endpoint: `/QuarterlyResults/${coCode}/s`,
    cacheTTL: CACHE_TTL,
  })
}

// ── Convenience: fetch all fundamental data in parallel ──

export interface FundamentalsBundle {
  ttm: CMOTSTTMRecord | null
  finData: CMOTSFinancialRecord[]
  pnl: CMOTSStatementRow[]
  cashFlow: CMOTSStatementRow[]
  quarterly: CMOTSStatementRow[]
}

/**
 * Fetch all fundamental data for a stock in one call.
 * All 5 endpoints are fetched in parallel for efficiency.
 */
export async function getAllFundamentals(symbol: string): Promise<FundamentalsBundle> {
  if (isMockMode()) {
    return {
      ttm: buildMockTTM(symbol),
      finData: [],
      pnl: [],
      cashFlow: [],
      quarterly: [],
    }
  }

  const [ttm, finData, pnl, cashFlow, quarterly] = await Promise.all([
    getTTMData(symbol),
    getFinancialData(symbol),
    getProfitAndLoss(symbol),
    getCashFlow(symbol),
    getQuarterlyResults(symbol),
  ])

  return { ttm, finData, pnl, cashFlow, quarterly }
}

// ── Statement row helpers (exported for metricResolver) ──

/**
 * Extract a numeric value from a statement row for a given year column.
 * Year columns look like "Y202503" or "Y202412".
 */
export function getStatementValue(row: CMOTSStatementRow, yearCol: string): number | null {
  const val = row[yearCol]
  if (val === undefined || val === null || val === '') return null
  const num = typeof val === 'number' ? val : parseFloat(String(val))
  return isNaN(num) ? null : num
}

/**
 * Find a row in a statement by its rowno.
 * P&L key rows: 46 = EBITDA ("Operation Profit before Depreciation"), 35 = PAT
 * Cash Flow key rows: 68 = OCF ("Net Cash Generated from Operations")
 */
export function findStatementRow(rows: CMOTSStatementRow[], rowno: number): CMOTSStatementRow | null {
  return rows.find(r => r.rowno === rowno) ?? null
}

/**
 * Get the sorted year column names from a statement row (newest first).
 * Filters to columns matching /^Y\d{6}$/ pattern.
 */
export function getYearColumns(row: CMOTSStatementRow): string[] {
  return Object.keys(row)
    .filter(k => /^Y\d{6}$/.test(k))
    .sort((a, b) => b.localeCompare(a))  // Newest first
}

// ── Mock helpers ──

function findMockMetrics(symbol: string) {
  return MOCK_STOCK_METRICS.find(m => m.stockId === symbol) ?? null
}

function buildMockTTM(symbol: string): CMOTSTTMRecord | null {
  const metrics = findMockMetrics(symbol)
  if (!metrics) return null

  return {
    co_code: symbol.charCodeAt(0) * 100,
    pe_ttm: metrics.raw_pe ?? metrics.v2_pe_vs_5y ?? 0,
    dividendyield: 0,
    roe_ttm: metrics.v2_roe ?? 0,
    roce_ttm: metrics.v2_roe ?? 0,  // approximate
    mcap: 0,
    pb_ttm: metrics.raw_pb ?? metrics.v2_pb_vs_5y ?? 0,
    eps_ttm: 0,
    debttoequity: metrics.v2_debt_ebitda ?? 0,
    ev_ebitda: metrics.raw_ev ?? metrics.v2_ev_vs_5y ?? 0,
    currentratio: 0,
    returnonassets: 0,
    operatingprofitmargin: 0,
    netprofitmargin: 0,
    quickratio: 0,
    assetturnover_ttm: 0,
    pegratio: 0,
  }
}
