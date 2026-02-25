/**
 * CMOTS Fundamentals — TTM, FinData, P&L, Cash Flow, Balance Sheet, Quarterly
 *
 * Endpoints:
 *   /TTMData/{co_code}/s         — Current trailing-twelve-month ratios
 *   /FinData/{co_code}/s         — Yearly financial metrics (5 years)
 *   /ProftandLoss/{co_code}/s    — P&L statement rows with year columns
 *   /CashFlow/{co_code}/s        — Cash flow rows with year columns
 *   /BalanceSheet/{co_code}/s    — Balance sheet rows with year columns
 *   /QuarterlyResults/{co_code}/s — Quarterly result rows with quarter columns
 *
 * On error: logs a warning with reasoning and returns null/empty arrays.
 */

import type {
  CMOTSTTMRecord,
  CMOTSFinancialRecord,
  CMOTSStatementRow,
} from '@/types/scoring'
import { cmotsFetch, cmotsFetchOne } from './client'
import { getCoCode } from './companyMaster'
import { getShareholdingHistory } from './shareholding'

const CACHE_TTL = 60 * 60 * 1000  // 1 hour — aligned with price data TTL for consistent backtests

// ── Individual endpoint fetchers ──
// Each accepts an optional pre-resolved coCode to avoid redundant lookups
// when called from getAllFundamentals().

/** Get TTM (Trailing Twelve Month) ratios for a stock */
export async function getTTMData(symbol: string, resolvedCoCode?: number): Promise<CMOTSTTMRecord | null> {
  const coCode = resolvedCoCode ?? await getCoCode(symbol)
  if (!coCode) {
    console.warn(`[Fundamentals] TTM data unavailable for ${symbol}: could not resolve co_code`)
    return null
  }

  return await cmotsFetchOne<CMOTSTTMRecord>({
    endpoint: `/TTMData/${coCode}/s`,
    cacheTTL: CACHE_TTL,
  })
}

/** Get yearly financial data (FinData) — returns multiple years, sorted oldest first */
export async function getFinancialData(symbol: string, resolvedCoCode?: number): Promise<CMOTSFinancialRecord[]> {
  const coCode = resolvedCoCode ?? await getCoCode(symbol)
  if (!coCode) {
    console.warn(`[Fundamentals] FinData unavailable for ${symbol}: could not resolve co_code`)
    return []
  }

  const data = await cmotsFetch<CMOTSFinancialRecord>({
    endpoint: `/FinData/${coCode}/s`,
    cacheTTL: CACHE_TTL,
  })
  // Sort by yrc ascending (oldest first) for growth calculations
  return data.sort((a, b) => a.yrc - b.yrc)
}

/** Get P&L statement rows (row-based with year columns) */
export async function getProfitAndLoss(symbol: string, resolvedCoCode?: number): Promise<CMOTSStatementRow[]> {
  const coCode = resolvedCoCode ?? await getCoCode(symbol)
  if (!coCode) {
    console.warn(`[Fundamentals] P&L data unavailable for ${symbol}: could not resolve co_code`)
    return []
  }

  return await cmotsFetch<CMOTSStatementRow>({
    endpoint: `/ProftandLoss/${coCode}/s`,
    cacheTTL: CACHE_TTL,
  })
}

/** Get cash flow statement rows (row-based with year columns) */
export async function getCashFlow(symbol: string, resolvedCoCode?: number): Promise<CMOTSStatementRow[]> {
  const coCode = resolvedCoCode ?? await getCoCode(symbol)
  if (!coCode) {
    console.warn(`[Fundamentals] Cash flow data unavailable for ${symbol}: could not resolve co_code`)
    return []
  }

  return await cmotsFetch<CMOTSStatementRow>({
    endpoint: `/CashFlow/${coCode}/s`,
    cacheTTL: CACHE_TTL,
  })
}

/** Get balance sheet rows (row-based with year columns) */
export async function getBalanceSheet(symbol: string, resolvedCoCode?: number): Promise<CMOTSStatementRow[]> {
  const coCode = resolvedCoCode ?? await getCoCode(symbol)
  if (!coCode) {
    console.warn(`[Fundamentals] Balance sheet data unavailable for ${symbol}: could not resolve co_code`)
    return []
  }

  return await cmotsFetch<CMOTSStatementRow>({
    endpoint: `/BalanceSheet/${coCode}/s`,
    cacheTTL: CACHE_TTL,
  })
}

/** Get quarterly results rows (row-based with quarter columns like Y202512) */
export async function getQuarterlyResults(symbol: string, resolvedCoCode?: number): Promise<CMOTSStatementRow[]> {
  const coCode = resolvedCoCode ?? await getCoCode(symbol)
  if (!coCode) {
    console.warn(`[Fundamentals] Quarterly results unavailable for ${symbol}: could not resolve co_code`)
    return []
  }

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
  balanceSheet: CMOTSStatementRow[]
  quarterly: CMOTSStatementRow[]
  shareholding: import('@/types/scoring').CMOTSShareholding[]
}

/**
 * Fetch all fundamental data for a stock in one call.
 * Resolves co_code once, then fetches all 7 endpoints in parallel.
 * Uses Promise.allSettled so individual endpoint failures return defaults
 * (null/[]) instead of killing all 7 fetches.
 * Each individual fetch has its own 20s timeout (via fetchWithRetry in client.ts).
 */
export async function getAllFundamentals(symbol: string): Promise<FundamentalsBundle> {
  const emptyBundle: FundamentalsBundle = {
    ttm: null, finData: [], pnl: [], cashFlow: [],
    balanceSheet: [], quarterly: [], shareholding: [],
  }

  // Resolve co_code once for all endpoints
  const coCode = await getCoCode(symbol)
  if (!coCode) {
    console.warn(`[Fundamentals] Could not resolve co_code for ${symbol} — returning empty bundle`)
    return emptyBundle
  }

  const results = await Promise.allSettled([
    getTTMData(symbol, coCode),
    getFinancialData(symbol, coCode),
    getProfitAndLoss(symbol, coCode),
    getCashFlow(symbol, coCode),
    getBalanceSheet(symbol, coCode),
    getQuarterlyResults(symbol, coCode),
    getShareholdingHistory(symbol, coCode),
  ])

  // Log any endpoint failures (non-fatal — we return defaults for failed endpoints)
  const failedCount = results.filter(r => r.status === 'rejected').length
  if (failedCount > 0) {
    console.warn(`[Fundamentals] ${failedCount}/7 endpoints failed for ${symbol}`)
  }

  const val = <T,>(r: PromiseSettledResult<T>, fallback: T): T =>
    r.status === 'fulfilled' ? r.value : fallback

  return {
    ttm: val(results[0], null),
    finData: val(results[1], []),
    pnl: val(results[2], []),
    cashFlow: val(results[3], []),
    balanceSheet: val(results[4], []),
    quarterly: val(results[5], []),
    shareholding: val(results[6], []),
  }
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
