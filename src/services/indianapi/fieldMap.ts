/**
 * IndianAPI.in → CMOTS Field Mapping & Data Conversion
 *
 * IndianAPI returns data as field-keyed objects with period keys:
 *   { "Sales": { "Mar 2014": 81809, "Mar 2015": 94648, ... }, ... }
 *
 * CMOTS returns row-based data:
 *   [{ COLUMNNAME: "Revenue from Operations", rowno: 1, Y202503: 255324, Y202403: 240893, ... }]
 *
 * This module converts IndianAPI format → CMOTSStatementRow[] so existing
 * metricResolver logic (windowYearColumns, findStatementRow, etc.) works unchanged.
 */

import type { CMOTSStatementRow } from '@/types/scoring'

// ─── Period key → CMOTS year column conversion ─────────

const MONTH_MAP: Record<string, string> = {
  'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
  'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
  'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12',
}

/**
 * Convert IndianAPI period key to CMOTS year column format.
 * "Mar 2025" → "Y202503", "Sep 2025" → "Y202509", "Dec 2022" → "Y202212"
 * "TTM" → null (skip TTM entries)
 */
export function periodToYearCol(period: string): string | null {
  if (period === 'TTM') return null
  const parts = period.split(' ')
  if (parts.length !== 2) return null
  const monthStr = MONTH_MAP[parts[0]]
  if (!monthStr) return null
  return `Y${parts[1]}${monthStr}`
}

// ─── IndianAPI → CMOTS row number mapping ───────────────

/**
 * P&L field mappings: IndianAPI field name → CMOTS rowno
 * Banking stocks use "Revenue" instead of "Sales"
 */
export const PNL_FIELD_MAP: Record<string, number> = {
  // Non-banking
  'Sales':                1,   // CMOTS: Revenue from Operations
  // Banking
  'Revenue':              1,   // CMOTS: Revenue from Operations (banking variant)
  'Operating Profit':     46,  // CMOTS: Operation Profit before Depreciation (EBITDA)
  'Financing Profit':     46,  // Banking: Financing Profit ≈ EBITDA equivalent
  'Profit before tax':    28,  // CMOTS: Profit Before Tax
  'Other Income':         9,   // CMOTS: Other Income
  'Net Profit':           35,  // CMOTS: Profit After Tax
  'EPS in Rs':            44,  // CMOTS: Earning Per Share - Basic
  'Depreciation':         20,  // CMOTS: Depreciation
  'Interest':             19,  // CMOTS: Finance Costs
  'Expenses':             6,   // CMOTS: Total Expenses (approximate)
}

/** Balance Sheet field mappings */
export const BS_FIELD_MAP: Record<string, number> = {
  'Fixed Assets':         2,   // CMOTS: Fixed Assets (Gross Block)
  'Borrowings':           58,  // CMOTS: Long term Borrowings (consolidated debt)
  'Equity Capital':       76,  // CMOTS: Equity Share Capital
  'Reserves':             78,  // CMOTS: Reserves and Surplus
  'Total Assets':         42,  // CMOTS: Total Assets
  'Total Liabilities':    42,  // Same as Total Assets (A=L in accounting)
  'CWIP':                 4,   // CMOTS: Capital Work in Progress
  'Investments':          27,  // CMOTS: Current Investments
  'Other Assets':         38,  // CMOTS: Other Current Assets
  'Other Liabilities':    52,  // CMOTS: Other Current Liabilities
}

/**
 * Synthetic row number for "Shareholders Fund" = Equity Capital + Reserves.
 * CMOTS has this as row 80 directly; for IndianAPI we compute it.
 */
export const BS_SHAREHOLDERS_FUND_ROWNO = 80

/** Cash Flow field mappings */
export const CF_FIELD_MAP: Record<string, number> = {
  'Cash from Operating Activity':  68,  // CMOTS: Net Cash from Operations
  'Cash from Investing Activity':  69,  // CMOTS: Net Cash from Investing
  'Cash from Financing Activity':  70,  // CMOTS: Net Cash from Financing
  'Net Cash Flow':                 73,  // CMOTS: Net Change in Cash
}

/** Quarterly Results field mappings (same structure as P&L) */
export const QR_FIELD_MAP: Record<string, number> = {
  'Sales':                1,   // CMOTS: Gross Sales/Income from operations
  'Revenue':              1,   // Banking variant
  'Operating Profit':     14,  // CMOTS: Profit from operations before other income
  'Financing Profit':     14,  // Banking variant
  'Net Profit':           35,  // CMOTS: Net Profit
  'EPS in Rs':            44,  // CMOTS: EPS
}

// ─── Conversion functions ───────────────────────────────

/** Raw IndianAPI stats response: field → { period → value } */
export type IndianAPIStatsResponse = Record<string, Record<string, number>>

/**
 * Convert an IndianAPI stats response to an array of CMOTS-compatible statement rows.
 *
 * @param data - Raw response from IndianAPI historical_stats endpoint
 * @param fieldMap - Mapping of IndianAPI field names to CMOTS row numbers
 * @returns CMOTSStatementRow[] compatible with existing scoring logic
 */
export function convertToCMOTSRows(
  data: IndianAPIStatsResponse,
  fieldMap: Record<string, number>,
): CMOTSStatementRow[] {
  const rows: CMOTSStatementRow[] = []

  for (const [fieldName, periodValues] of Object.entries(data)) {
    const rowno = fieldMap[fieldName]
    if (rowno === undefined) continue  // Skip unmapped fields

    const row: CMOTSStatementRow = {
      COLUMNNAME: fieldName,
      RID: rowno,
      rowno,
    }

    for (const [period, value] of Object.entries(periodValues)) {
      const yearCol = periodToYearCol(period)
      if (!yearCol) continue  // Skip TTM
      row[yearCol] = value
    }

    rows.push(row)
  }

  return rows
}

/**
 * Synthesize a "Shareholders Fund" row from Equity Capital + Reserves.
 * CMOTS has this as a single row (rowno 80), but IndianAPI splits them.
 */
export function synthesizeShareholdersFund(
  data: IndianAPIStatsResponse,
): CMOTSStatementRow | null {
  const equity = data['Equity Capital']
  const reserves = data['Reserves']
  if (!equity && !reserves) return null

  const row: CMOTSStatementRow = {
    COLUMNNAME: "Total Shareholder's Fund",
    RID: BS_SHAREHOLDERS_FUND_ROWNO,
    rowno: BS_SHAREHOLDERS_FUND_ROWNO,
  }

  // Merge all periods from both fields
  const allPeriods = new Set([
    ...Object.keys(equity || {}),
    ...Object.keys(reserves || {}),
  ])

  for (const period of allPeriods) {
    const yearCol = periodToYearCol(period)
    if (!yearCol) continue
    const eqVal = equity?.[period] ?? 0
    const resVal = reserves?.[period] ?? 0
    row[yearCol] = eqVal + resVal
  }

  return row
}

/**
 * Detect if a stock is a banking company based on IndianAPI P&L fields.
 * Banking stocks have "Revenue" and "Financing Profit" instead of "Sales" and "Operating Profit".
 */
export function isBankingStock(data: IndianAPIStatsResponse): boolean {
  return 'Revenue' in data && !('Sales' in data)
}
