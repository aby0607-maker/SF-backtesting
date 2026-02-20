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
 *
 * Historical scoring:
 *   When `asOfDate` is provided, year/quarter columns are windowed to only include
 *   data available at that date. Valuation metrics use historical price instead of TTM.
 *   Technical metrics use price history up to asOfDate.
 */

import type { CMOTSTTMRecord, CMOTSFinancialRecord, CMOTSStatementRow, CMOTSShareholding, MetricResolutionConfig, CustomMetricDefinition } from '@/types/scoring'
import type { FundamentalsBundle } from '@/services/cmots/fundamentals'
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
// Row Numbers (from CMOTS API testing)
// ─────────────────────────────────────────────────

// P&L rows
const PNL_ROW_EBITDA = 46   // "Operation Profit before Depreciation"
const PNL_ROW_PAT = 35      // "Profit After Tax"
const PNL_ROW_REVENUE = 1   // "Revenue from Operations"
const PNL_ROW_EPS = 44      // "Earning Per Share - Basic"

// Cash Flow rows
const CF_ROW_OCF = 68       // "Net Cash Generated from (Used In) Operations"

// Balance Sheet rows
const BS_ROW_FIXED_ASSETS = 2     // "Fixed Assets" (Gross Block)
const BS_ROW_CASH = 29            // "Cash and Cash Equivalents"
const BS_ROW_ST_BORROWINGS = 44   // "Short term Borrowings"
const BS_ROW_LT_BORROWINGS = 58   // "Long term Borrowings"
const BS_ROW_SHAREHOLDERS_FUND = 80 // "Total Shareholder's Fund"
const BS_ROW_SHARES_OUTSTANDING = 91 // "Susbcribed & fully Paid up Shares"

// Quarterly rows
const QR_ROW_REVENUE = 1    // "Gross Sales/Income from operations"
const QR_ROW_OP_PROFIT = 14 // "Profit from operations before other income..."

// ─────────────────────────────────────────────────
// Year/Quarter Column Windowing (with memoization)
// ─────────────────────────────────────────────────

/** Cache getYearColumns() results per row object to avoid repeated regex + sort */
const yearColumnsCache = new WeakMap<CMOTSStatementRow, string[]>()

function getCachedYearColumns(row: CMOTSStatementRow): string[] {
  let cached = yearColumnsCache.get(row)
  if (cached) return cached
  cached = getYearColumns(row)
  yearColumnsCache.set(row, cached)
  return cached
}

/** Cache windowYearColumns() results per (row, asOfDate) pair */
const windowCache = new WeakMap<CMOTSStatementRow, Map<string, string[]>>()

/**
 * Filter year columns to only include those whose fiscal year end is ≤ asOfDate.
 * Year columns: Y202503 → fiscal year ending March 2025.
 * Returns newest first (same order as getYearColumns).
 *
 * Results are memoized per (row, asOfDate) pair since the same row is
 * queried many times during backtest interval scoring.
 */
function windowYearColumns(row: CMOTSStatementRow, asOfDate?: string): string[] {
  const allCols = getCachedYearColumns(row)  // Newest first (cached)
  if (!asOfDate) return allCols

  // Check memoization cache
  let dateMap = windowCache.get(row)
  if (dateMap) {
    const cached = dateMap.get(asOfDate)
    if (cached) return cached
  }

  const cutoff = new Date(asOfDate)
  const result = allCols.filter(col => {
    const year = parseInt(col.slice(1, 5))
    const month = Math.min(12, Math.max(1, parseInt(col.slice(5, 7))))
    // Fiscal year end: use actual last day of the month (day 0 of next month)
    const colDate = new Date(year, month, 0)
    return colDate <= cutoff
  })

  // Store in cache
  if (!dateMap) {
    dateMap = new Map()
    windowCache.set(row, dateMap)
  }
  dateMap.set(asOfDate, result)

  return result
}

/** Filter FinData records to those where fiscal year end ≤ asOfDate.
 *  FinData yrc is YYYYMM format (e.g., 202503 = FY ending March 2025).
 *  Only include if the fiscal year end date ≤ asOfDate. */
function windowFinData(finData: CMOTSFinancialRecord[], asOfDate?: string): CMOTSFinancialRecord[] {
  if (!asOfDate) return finData
  const cutoff = new Date(asOfDate)
  return finData.filter(f => {
    // yrc is YYYYMM (e.g., 202503 → year 2025, month 03)
    const year = Math.floor(f.yrc / 100)
    const month = Math.min(12, Math.max(1, f.yrc % 100))
    const fyEndDate = new Date(year, month, 0) // Actual last day of fiscal year end month
    return fyEndDate <= cutoff
  })
}

// ─────────────────────────────────────────────────
// Shareholding Windowing
// ─────────────────────────────────────────────────

/** Filter shareholding quarters to only those available at asOfDate (YRC ≤ cutoff) */
function windowShareholding(data: CMOTSShareholding[], asOfDate?: string): CMOTSShareholding[] {
  if (!asOfDate) return data  // Already sorted YRC descending from getShareholdingHistory
  const cutoffYRC = parseInt(asOfDate.slice(0, 4) + asOfDate.slice(5, 7))
  return data.filter(d => d.YRC <= cutoffYRC)
}

// ─────────────────────────────────────────────────
// Core Mapping Function (with optional asOfDate)
// ─────────────────────────────────────────────────

/**
 * Map all available CMOTS data to flat metric values for the scoring engine.
 * When asOfDate is provided, windows all statement data to that date and
 * computes valuation from historical price instead of TTM.
 */
function mapCMOTSToMetricIds(
  ttm: CMOTSTTMRecord | null,
  finData: CMOTSFinancialRecord[],
  pnl: CMOTSStatementRow[],
  cashFlow: CMOTSStatementRow[],
  balanceSheet: CMOTSStatementRow[],
  quarterly: CMOTSStatementRow[],
  technicalData?: TechnicalResult,
  asOfDate?: string,
  priceAtDate?: number,
  config?: MetricResolutionConfig,
  _unused?: unknown,
  shareholding?: CMOTSShareholding[],
  priceHistory?: { date: string; price: number }[],
): Record<string, number | null> {
  const metrics: Record<string, number | null> = {}
  const gp = config?.growthPeriods

  // Window data to asOfDate
  const windowedFinData = windowFinData(finData, asOfDate)

  // ── Growth Metrics (derived from P&L + FinData, configurable period CAGR) ──
  metrics['v2_revenue_growth'] = computeRevenueGrowth5Y(windowedFinData, pnl, asOfDate, gp?.['v2_revenue_growth'])
  metrics['v2_ebitda_growth'] = computeRowGrowth5Y(pnl, PNL_ROW_EBITDA, asOfDate, gp?.['v2_ebitda_growth'])
  metrics['v2_earnings_growth'] = computeRowGrowth5Y(pnl, PNL_ROW_PAT, asOfDate, gp?.['v2_earnings_growth'])

  // ── Profitability: ROE (5Y average) ──
  // Average ROE across available fiscal years for stability. Uses statement data
  // for both backtest (windowed) and current scoring (all years).
  if (balanceSheet.length > 0 && pnl.length > 0) {
    metrics['v2_roe'] = computeAvgROE(pnl, balanceSheet, asOfDate)
  } else {
    metrics['v2_roe'] = ttm?.roe_ttm ?? null  // Fallback to TTM if no statement data
  }

  // ── Cash Flow Quality: OCF / EBITDA ──
  const ocf = getWindowedStatementValue(cashFlow, CF_ROW_OCF, asOfDate)
  const ebitdaVal = getWindowedStatementValue(pnl, PNL_ROW_EBITDA, asOfDate)
  metrics['v2_ocf_ebitda'] = ocf != null && ebitdaVal != null && ebitdaVal !== 0
    ? (ocf / ebitdaVal) * 100  // Bands expect percentage (73% not 0.73)
    : null

  // ── Leverage: Debt/EBITDA ──
  // Always compute from statements — TTM record has debttoequity (D/E), not Debt/EBITDA
  if (balanceSheet.length > 0 && pnl.length > 0) {
    metrics['v2_debt_ebitda'] = computeHistoricalDebtEBITDA(pnl, balanceSheet, asOfDate)
  } else {
    metrics['v2_debt_ebitda'] = null
  }

  // ── Gross Block Growth (from Balance Sheet Fixed Assets) ──
  if (balanceSheet.length > 0) {
    metrics['v2_gross_block'] = computeStatementGrowth(balanceSheet, BS_ROW_FIXED_ASSETS, asOfDate)
  } else {
    metrics['v2_gross_block'] = computeFinDataGrowth(windowedFinData, 'totalassets')
  }

  // ── Valuation: PE, PB, EV/EBITDA as RATIOS vs 5Y Average ──
  // Score bands are calibrated for ratios (0.44 = deeply undervalued, 1.5 = overvalued).
  // We compute current PE/PB/EV, then divide by the 5Y average to get the ratio.
  if (asOfDate && priceAtDate != null) {
    // Backtest mode: compute current PE/PB/EV from price at date
    const current = computeHistoricalValuation(priceAtDate, pnl, balanceSheet, asOfDate)
    metrics['raw_pe'] = current.pe
    metrics['raw_pb'] = current.pb
    metrics['raw_ev'] = current.evEbitda

    if (priceHistory && priceHistory.length > 0) {
      const avg = compute5YAvgValuation(pnl, balanceSheet, priceHistory, asOfDate)
      metrics['v2_pe_vs_5y'] = current.pe != null && avg.avgPE != null && avg.avgPE > 0
        ? current.pe / avg.avgPE : null
      metrics['v2_pb_vs_5y'] = current.pb != null && avg.avgPB != null && avg.avgPB > 0
        ? current.pb / avg.avgPB : null
      metrics['v2_ev_vs_5y'] = current.evEbitda != null && avg.avgEV != null && avg.avgEV > 0
        ? current.evEbitda / avg.avgEV : null
      // Historical 5Y averages — used by conditional valuation thresholds (PE>75, EV>35, PB>30)
      metrics['hist_avg_pe'] = avg.avgPE
      metrics['hist_avg_pb'] = avg.avgPB
      metrics['hist_avg_ev'] = avg.avgEV
    } else {
      metrics['v2_pe_vs_5y'] = null
      metrics['v2_pb_vs_5y'] = null
      metrics['v2_ev_vs_5y'] = null
      metrics['hist_avg_pe'] = null
      metrics['hist_avg_pb'] = null
      metrics['hist_avg_ev'] = null
    }
  } else if (asOfDate) {
    // Backtest mode but NO price at this date — valuation not possible.
    // Do NOT fall back to current TTM (that would mix future data into historical scoring).
    metrics['v2_pe_vs_5y'] = null
    metrics['v2_pb_vs_5y'] = null
    metrics['v2_ev_vs_5y'] = null
    metrics['raw_pe'] = null
    metrics['raw_pb'] = null
    metrics['raw_ev'] = null
    metrics['hist_avg_pe'] = null
    metrics['hist_avg_pb'] = null
    metrics['hist_avg_ev'] = null
  } else {
    // Current scoring (no backtest) — compute ratios from TTM + 5Y average
    const currentPE = ttm?.pe_ttm ?? null
    const currentPB = ttm?.pb_ttm ?? null
    const currentEV = ttm?.ev_ebitda ?? null
    metrics['raw_pe'] = currentPE
    metrics['raw_pb'] = currentPB
    metrics['raw_ev'] = currentEV

    if (priceHistory && priceHistory.length > 0) {
      const avg = compute5YAvgValuation(pnl, balanceSheet, priceHistory)
      metrics['v2_pe_vs_5y'] = currentPE != null && avg.avgPE != null && avg.avgPE > 0
        ? currentPE / avg.avgPE : null
      metrics['v2_pb_vs_5y'] = currentPB != null && avg.avgPB != null && avg.avgPB > 0
        ? currentPB / avg.avgPB : null
      metrics['v2_ev_vs_5y'] = currentEV != null && avg.avgEV != null && avg.avgEV > 0
        ? currentEV / avg.avgEV : null
      // Historical 5Y averages — used by conditional valuation thresholds (PE>75, EV>35, PB>30)
      metrics['hist_avg_pe'] = avg.avgPE
      metrics['hist_avg_pb'] = avg.avgPB
      metrics['hist_avg_ev'] = avg.avgEV
    } else {
      // No price history — cannot compute ratios
      metrics['v2_pe_vs_5y'] = null
      metrics['v2_pb_vs_5y'] = null
      metrics['v2_ev_vs_5y'] = null
      metrics['hist_avg_pe'] = null
      metrics['hist_avg_pb'] = null
      metrics['hist_avg_ev'] = null
    }
  }

  // ── Quarterly Momentum: Revenue & EBITDA Multipliers ──
  const { revenueMultiplier, ebitdaMultiplier } = computeQuarterlyMultipliers(quarterly, asOfDate)
  metrics['v2_revenue_multiplier'] = revenueMultiplier
  metrics['v2_ebitda_multiplier'] = ebitdaMultiplier

  // ── Technical Metrics ──
  if (technicalData) {
    metrics['v2_price_ema20'] = technicalData.ema20Dev
    metrics['v2_price_ema50'] = technicalData.ema50Dev
    metrics['v2_price_ema200'] = technicalData.ema200Dev
    metrics['v2_rsi'] = technicalData.rsi
    metrics['v2_vpt'] = technicalData.vpt
    // VPT two-input conditional scoring inputs
    metrics['v2_volume_change'] = technicalData.volumeChange
    metrics['v2_price_change'] = technicalData.priceChange
  } else {
    metrics['v2_price_ema20'] = null
    metrics['v2_price_ema50'] = null
    metrics['v2_price_ema200'] = null
    metrics['v2_rsi'] = null
    metrics['v2_vpt'] = null
    metrics['v2_volume_change'] = null
    metrics['v2_price_change'] = null
  }

  // ── Ownership Metrics (from shareholding pattern) ──
  if (shareholding && shareholding.length > 0) {
    const windowed = windowShareholding(shareholding, asOfDate)
    const latest = windowed[0]

    if (latest) {
      metrics['promoter_holding'] = latest.Promoters
      metrics['fii_holding'] = latest.ForeignInstitution
      metrics['dii_holding'] = latest.MutualFund + latest.OtherDomesticInstitution

      // 3M change: compare latest vs previous quarter
      const prev = windowed[1]
      if (prev) {
        metrics['promoter_holding_change_3m'] = latest.Promoters - prev.Promoters
        metrics['fii_holding_change_3m'] = latest.ForeignInstitution - prev.ForeignInstitution
      } else {
        metrics['promoter_holding_change_3m'] = null
        metrics['fii_holding_change_3m'] = null
      }
    }
  } else {
    metrics['promoter_holding'] = null
    metrics['fii_holding'] = null
    metrics['dii_holding'] = null
    metrics['promoter_holding_change_3m'] = null
    metrics['fii_holding_change_3m'] = null
  }

  return metrics
}

// ─────────────────────────────────────────────────
// Historical Valuation (PE, PB, EV/EBITDA from price + fundamentals)
// ─────────────────────────────────────────────────

function computeHistoricalValuation(
  priceAtDate: number,
  pnl: CMOTSStatementRow[],
  balanceSheet: CMOTSStatementRow[],
  asOfDate: string,
): { pe: number | null; pb: number | null; evEbitda: number | null } {
  // EPS from P&L — latest annual EPS before asOfDate
  const epsRow = findStatementRow(pnl, PNL_ROW_EPS)
  const epsCols = epsRow ? windowYearColumns(epsRow, asOfDate) : []
  const epsValue = epsCols.length > 0 && epsRow ? getStatementValue(epsRow, epsCols[0]) : null

  // PE = Price / EPS (only when EPS is positive; zero/negative EPS → PE undefined)
  const pe = epsValue != null && epsValue > 0 ? priceAtDate / epsValue : null

  // Book Value per share = Shareholders Fund / Shares Outstanding
  const shFundRow = findStatementRow(balanceSheet, BS_ROW_SHAREHOLDERS_FUND)
  const sharesRow = findStatementRow(balanceSheet, BS_ROW_SHARES_OUTSTANDING)
  const shFundCols = shFundRow ? windowYearColumns(shFundRow, asOfDate) : []
  const sharesCols = sharesRow ? windowYearColumns(sharesRow, asOfDate) : []

  let pb: number | null = null
  if (shFundCols.length > 0 && sharesCols.length > 0 && shFundRow && sharesRow) {
    const shFund = getStatementValue(shFundRow, shFundCols[0])
    // Shares are in absolute count (e.g., 187990000), Fund in crores
    // Divide fund by (shares / 10000000) to get per-share in same unit as price
    const sharesCount = getStatementValue(sharesRow, sharesCols[0])
    if (shFund && sharesCount && sharesCount > 0) {
      // shFund is in crores, shares in absolute count. BV = (shFund * 10^7) / shares = shFund * 10000000 / shares
      // But price is per share. So: BV per share = (shFund in Cr × 1e7) / sharesCount
      const bvPerShare = (shFund * 10000000) / sharesCount
      pb = bvPerShare > 0 ? priceAtDate / bvPerShare : null
    }
  }

  // EV/EBITDA = (MCap + Debt - Cash) / EBITDA
  // MCap = Price × Shares (need shares from BS)
  let evEbitda: number | null = null
  const ebitdaRow = findStatementRow(pnl, PNL_ROW_EBITDA)
  const ebitdaCols = ebitdaRow ? windowYearColumns(ebitdaRow, asOfDate) : []
  const ebitdaVal = ebitdaCols.length > 0 && ebitdaRow ? getStatementValue(ebitdaRow, ebitdaCols[0]) : null

  if (ebitdaVal && ebitdaVal > 0 && sharesCols.length > 0 && sharesRow) {
    const sharesCount = getStatementValue(sharesRow, sharesCols[0])
    if (sharesCount && sharesCount > 0) {
      // MCap in crores: (price × sharesCount) / 1e7
      const mcapCr = (priceAtDate * sharesCount) / 10000000

      // Debt = LT Borrowings + ST Borrowings (in crores)
      const ltDebtRow = findStatementRow(balanceSheet, BS_ROW_LT_BORROWINGS)
      const stDebtRow = findStatementRow(balanceSheet, BS_ROW_ST_BORROWINGS)
      const ltCols = ltDebtRow ? windowYearColumns(ltDebtRow, asOfDate) : []
      const stCols = stDebtRow ? windowYearColumns(stDebtRow, asOfDate) : []
      const ltDebt = ltCols.length > 0 && ltDebtRow ? (getStatementValue(ltDebtRow, ltCols[0]) ?? 0) : 0
      const stDebt = stCols.length > 0 && stDebtRow ? (getStatementValue(stDebtRow, stCols[0]) ?? 0) : 0
      const totalDebt = ltDebt + stDebt

      // Cash (in crores)
      const cashRow = findStatementRow(balanceSheet, BS_ROW_CASH)
      const cashCols = cashRow ? windowYearColumns(cashRow, asOfDate) : []
      const cash = cashCols.length > 0 && cashRow ? (getStatementValue(cashRow, cashCols[0]) ?? 0) : 0

      const ev = mcapCr + totalDebt - cash
      evEbitda = ev / ebitdaVal
    }
  }

  return { pe, pb, evEbitda }
}

// ─────────────────────────────────────────────────
// 5Y Average Valuation (PE, PB, EV/EBITDA at each FY-end)
// ─────────────────────────────────────────────────

/**
 * Compute 5Y average PE, PB, EV/EBITDA from historical FY-end prices + statements.
 *
 * For each fiscal year end (from year columns), finds the closing price near that
 * date from priceHistory and computes PE, PB, EV/EBITDA. Returns averages over
 * all available years (minimum 1 valid observation per metric).
 *
 * This enables the "PE vs 5Y Average" ratio: currentPE / avgPE.
 * Note: In backtest mode, the average only includes FY-end dates with available
 * price data. If the price fetch doesn't go back far enough, fewer years are used.
 */
function compute5YAvgValuation(
  pnl: CMOTSStatementRow[],
  balanceSheet: CMOTSStatementRow[],
  priceHistory: { date: string; price: number }[],
  asOfDate?: string,
): { avgPE: number | null; avgPB: number | null; avgEV: number | null } {
  const epsRow = findStatementRow(pnl, PNL_ROW_EPS)
  const ebitdaRow = findStatementRow(pnl, PNL_ROW_EBITDA)
  const shFundRow = findStatementRow(balanceSheet, BS_ROW_SHAREHOLDERS_FUND)
  const sharesRow = findStatementRow(balanceSheet, BS_ROW_SHARES_OUTSTANDING)
  const ltDebtRow = findStatementRow(balanceSheet, BS_ROW_LT_BORROWINGS)
  const stDebtRow = findStatementRow(balanceSheet, BS_ROW_ST_BORROWINGS)
  const cashRow = findStatementRow(balanceSheet, BS_ROW_CASH)

  // Use any available row to determine year columns
  const referenceRow = epsRow || ebitdaRow || shFundRow
  if (!referenceRow) return { avgPE: null, avgPB: null, avgEV: null }

  const yearCols = windowYearColumns(referenceRow, asOfDate)
  if (yearCols.length === 0) return { avgPE: null, avgPB: null, avgEV: null }

  const peValues: number[] = []
  const pbValues: number[] = []
  const evValues: number[] = []

  for (const col of yearCols) {
    // Parse FY-end date from column name (Y202503 → 2025-03-31)
    const year = parseInt(col.slice(1, 5))
    const month = parseInt(col.slice(5, 7))
    const lastDay = new Date(year, month, 0).getDate()
    const fyEndDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

    // Find closing price near FY-end (on or before)
    const fyPrice = findClosestPriceValue(priceHistory, fyEndDate)
    if (fyPrice == null || fyPrice <= 0) continue

    // PE = Price / EPS at this FY-end
    if (epsRow) {
      const eps = getStatementValue(epsRow, col)
      if (eps != null && eps > 0) {
        peValues.push(fyPrice / eps)
      }
    }

    // PB = Price / Book Value per share at this FY-end
    if (shFundRow && sharesRow) {
      const shFund = getStatementValue(shFundRow, col)
      const shares = getStatementValue(sharesRow, col)
      if (shFund != null && shares != null && shares > 0) {
        const bvPerShare = (shFund * 10000000) / shares
        if (bvPerShare > 0) {
          pbValues.push(fyPrice / bvPerShare)
        }
      }
    }

    // EV/EBITDA = (MCap + Debt - Cash) / EBITDA at this FY-end
    if (ebitdaRow && sharesRow) {
      const ebitda = getStatementValue(ebitdaRow, col)
      const shares = getStatementValue(sharesRow, col)
      if (ebitda != null && ebitda > 0 && shares != null && shares > 0) {
        const mcapCr = (fyPrice * shares) / 10000000
        const ltDebt = ltDebtRow ? (getStatementValue(ltDebtRow, col) ?? 0) : 0
        const stDebt = stDebtRow ? (getStatementValue(stDebtRow, col) ?? 0) : 0
        const cash = cashRow ? (getStatementValue(cashRow, col) ?? 0) : 0
        const ev = mcapCr + ltDebt + stDebt - cash
        if (ev > 0) {
          evValues.push(ev / ebitda)
        }
      }
    }
  }

  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null

  return {
    avgPE: avg(peValues),
    avgPB: avg(pbValues),
    avgEV: avg(evValues),
  }
}

// ─────────────────────────────────────────────────
// Historical ROE & Debt/EBITDA
// ─────────────────────────────────────────────────

/** ROE = PAT / Shareholders Fund, averaged across available fiscal years (5Y avg) */
function computeAvgROE(
  pnl: CMOTSStatementRow[],
  balanceSheet: CMOTSStatementRow[],
  asOfDate?: string,
): number | null {
  const patRow = findStatementRow(pnl, PNL_ROW_PAT)
  const shFundRow = findStatementRow(balanceSheet, BS_ROW_SHAREHOLDERS_FUND)
  if (!patRow || !shFundRow) return null

  const patCols = windowYearColumns(patRow, asOfDate)
  const shFundCols = windowYearColumns(shFundRow, asOfDate)
  if (patCols.length === 0 || shFundCols.length === 0) return null

  const roeValues: number[] = []
  for (const col of patCols) {
    if (!shFundCols.includes(col)) continue  // Only use columns in BOTH P&L and BS
    const pat = getStatementValue(patRow, col)
    const shFund = getStatementValue(shFundRow, col)
    if (pat != null && shFund != null && shFund !== 0) {
      roeValues.push((pat / shFund) * 100)
    }
  }

  if (roeValues.length === 0) return null
  return roeValues.reduce((a, b) => a + b, 0) / roeValues.length
}

/** Debt/EBITDA = (LT Borrowings + ST Borrowings) / EBITDA */
function computeHistoricalDebtEBITDA(
  pnl: CMOTSStatementRow[],
  balanceSheet: CMOTSStatementRow[],
  asOfDate?: string,
): number | null {
  const ebitdaRow = findStatementRow(pnl, PNL_ROW_EBITDA)
  if (!ebitdaRow) return null

  const ebitdaCols = windowYearColumns(ebitdaRow, asOfDate)
  if (ebitdaCols.length === 0) return null
  const ebitdaVal = getStatementValue(ebitdaRow, ebitdaCols[0])
  if (!ebitdaVal || ebitdaVal === 0) return null

  const ltRow = findStatementRow(balanceSheet, BS_ROW_LT_BORROWINGS)
  const stRow = findStatementRow(balanceSheet, BS_ROW_ST_BORROWINGS)
  const ltCols = ltRow ? windowYearColumns(ltRow, asOfDate) : []
  const stCols = stRow ? windowYearColumns(stRow, asOfDate) : []
  const ltDebt = ltCols.length > 0 && ltRow ? (getStatementValue(ltRow, ltCols[0]) ?? 0) : 0
  const stDebt = stCols.length > 0 && stRow ? (getStatementValue(stRow, stCols[0]) ?? 0) : 0

  return (ltDebt + stDebt) / ebitdaVal
}

// ─────────────────────────────────────────────────
// Statement Growth from row-based data
// ─────────────────────────────────────────────────

/** Compute CAGR of a balance sheet row over available windowed years */
function computeStatementGrowth(
  rows: CMOTSStatementRow[],
  rowno: number,
  asOfDate?: string,
): number | null {
  const row = findStatementRow(rows, rowno)
  if (!row) return null
  const yearCols = windowYearColumns(row, asOfDate)
  if (yearCols.length < 2) return null

  const latest = getStatementValue(row, yearCols[0])
  const oldest = getStatementValue(row, yearCols[yearCols.length - 1])
  if (latest == null || oldest == null || oldest <= 0) return null

  return computeCAGR(oldest, latest, yearCols.length - 1)
}

// ─────────────────────────────────────────────────
// Growth Derivation Helpers (windowed)
// ─────────────────────────────────────────────────

/**
 * Compute revenue CAGR from FinData (windowed).
 * Falls back to P&L revenue row.
 * When maxYears is set, limits to that many years of data.
 */
function computeRevenueGrowth5Y(
  finData: CMOTSFinancialRecord[],
  pnl: CMOTSStatementRow[],
  asOfDate?: string,
  maxYears?: number,
): number | null {
  // Try FinData first (cleaner — has yearly revenue). Use available span (min 2 years).
  // finData is sorted ascending by yrc (oldest first), so [0]=oldest, [last]=latest.
  if (finData.length >= 2) {
    // If maxYears specified, keep only the most recent maxYears+1 records
    const limited = maxYears && finData.length > maxYears + 1
      ? finData.slice(finData.length - (maxYears + 1))
      : finData
    const oldestRecord = limited[0]                      // First element = oldest (ascending sort)
    const latestRecord = limited[limited.length - 1]     // Last element = latest (ascending sort)
    // Both same sign → CAGR works; mixed signs or zero → fall back to P&L
    if (oldestRecord.revenue !== 0 && (oldestRecord.revenue > 0) === (latestRecord.revenue > 0)) {
      return computeCAGR(oldestRecord.revenue, latestRecord.revenue, limited.length - 1)
    }
  }

  // Fall back to P&L revenue row
  return computeRowGrowth5Y(pnl, PNL_ROW_REVENUE, asOfDate, maxYears)
}

/**
 * Compute CAGR from a P&L or Cash Flow row using available windowed years.
 * Uses up to 5 years if available, but works with as few as 2 (min for CAGR).
 * When maxYears is set, limits to that many years of data (e.g., 3 = 3Y CAGR).
 */
function computeRowGrowth5Y(rows: CMOTSStatementRow[], rowno: number, asOfDate?: string, maxYears?: number): number | null {
  const row = findStatementRow(rows, rowno)
  if (!row) return null

  let yearCols = windowYearColumns(row, asOfDate)  // Newest first
  if (yearCols.length < 2) return null  // Need at least 2 years for CAGR

  // If maxYears specified, limit to maxYears+1 columns (need N+1 data points for N years of CAGR)
  if (maxYears && yearCols.length > maxYears + 1) {
    yearCols = yearCols.slice(0, maxYears + 1)
  }

  const latest = getStatementValue(row, yearCols[0])
  const oldest = getStatementValue(row, yearCols[yearCols.length - 1])

  if (latest == null || oldest == null) return null
  if (oldest === 0) return null                          // Division by zero
  if ((oldest < 0) !== (latest < 0)) return null         // Mixed signs → CAGR undefined
  // Both positive OR both negative → ratio is positive → CAGR works
  return computeCAGR(oldest, latest, yearCols.length - 1)
}

/** Compute growth in a FinData field over the available period */
function computeFinDataGrowth(
  finData: CMOTSFinancialRecord[],
  field: keyof CMOTSFinancialRecord
): number | null {
  if (finData.length < 2) return null
  const oldest = finData[0][field] as number
  const latest = finData[finData.length - 1][field] as number
  if (oldest == null || latest == null || oldest === 0) return null
  if ((oldest < 0) !== (latest < 0)) return null  // Mixed signs
  return computeCAGR(oldest, latest, finData.length - 1)
}

/** Standard CAGR: (end/start)^(1/years) - 1, returned as percentage.
 *  Works when both values share the same sign (ratio is positive).
 *  Returns 0 for mixed signs or zero base (CAGR undefined). */
function computeCAGR(start: number, end: number, years: number): number {
  if (years <= 0 || start === 0) return 0
  const ratio = end / start
  if (ratio < 0) return 0  // Mixed signs → CAGR undefined
  return (Math.pow(ratio, 1 / years) - 1) * 100
}

/** Get the latest windowed year's value from a statement row */
function getWindowedStatementValue(rows: CMOTSStatementRow[], rowno: number, asOfDate?: string): number | null {
  const row = findStatementRow(rows, rowno)
  if (!row) return null
  const yearCols = windowYearColumns(row, asOfDate)
  if (yearCols.length === 0) return null
  return getStatementValue(row, yearCols[0])
}

// ─────────────────────────────────────────────────
// Growth Context Extraction (for negative handling)
// ─────────────────────────────────────────────────

function extractRowContext(
  rows: CMOTSStatementRow[], rowno: number, asOfDate?: string, maxYears?: number,
): { startValue?: number; endValue?: number } | null {
  const row = findStatementRow(rows, rowno)
  if (!row) return null
  let yearCols = windowYearColumns(row, asOfDate)
  if (yearCols.length < 2) return null  // Match computeRowGrowth5Y's 2-year minimum
  // Respect same period windowing as growth computation
  if (maxYears && yearCols.length > maxYears + 1) {
    yearCols = yearCols.slice(0, maxYears + 1)
  }
  const latest = getStatementValue(row, yearCols[0])
  const oldest = getStatementValue(row, yearCols[yearCols.length - 1])
  if (latest == null && oldest == null) return null
  return { startValue: oldest ?? undefined, endValue: latest ?? undefined }
}

function extractGrowthContext(
  pnl: CMOTSStatementRow[],
  finData: CMOTSFinancialRecord[],
  asOfDate?: string,
  growthPeriods?: Record<string, number>,
): Record<string, { startValue?: number; endValue?: number }> {
  const context: Record<string, { startValue?: number; endValue?: number }> = {}
  const windowedFinData = windowFinData(finData, asOfDate)

  if (windowedFinData.length >= 2) {
    const maxYears = growthPeriods?.['v2_revenue_growth']
    const limited = maxYears && windowedFinData.length > maxYears + 1
      ? windowedFinData.slice(windowedFinData.length - (maxYears + 1))
      : windowedFinData
    context.v2_revenue_growth = {
      startValue: limited[0].revenue,
      endValue: limited[limited.length - 1].revenue,
    }
  } else {
    const revCtx = extractRowContext(pnl, PNL_ROW_REVENUE, asOfDate, growthPeriods?.['v2_revenue_growth'])
    if (revCtx) context.v2_revenue_growth = revCtx
  }

  const ebitdaCtx = extractRowContext(pnl, PNL_ROW_EBITDA, asOfDate, growthPeriods?.['v2_ebitda_growth'])
  if (ebitdaCtx) context.v2_ebitda_growth = ebitdaCtx

  const patCtx = extractRowContext(pnl, PNL_ROW_PAT, asOfDate, growthPeriods?.['v2_earnings_growth'])
  if (patCtx) context.v2_earnings_growth = patCtx

  return context
}

// ─────────────────────────────────────────────────
// Technical Metrics from OHLCV Price Data
// ─────────────────────────────────────────────────

type TechnicalResult = {
  ema20Dev: number; ema50Dev: number; ema200Dev: number; rsi: number; vpt: number
  /** VPT two-input conditional: avg(5D vol) / avg(50D vol) */
  volumeChange: number | null
  /** VPT two-input conditional: 5D price change % */
  priceChange: number | null
}

/**
 * Compute technical metrics from an array of price records.
 * When asOfDate is provided, only uses prices up to that date.
 */
function computeTechnicalFromPriceArray(
  closes: number[],
  volumes: number[],
): TechnicalResult | null {
  if (closes.length < 200) return null

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

  // VPT two-input conditional: volume_change = avg(5D vol) / avg(50D vol)
  let volumeChange: number | null = null
  let priceChange: number | null = null
  if (closes.length >= 50 && volumes.length >= 50) {
    const recent5Vol = volumes.slice(-5)
    const recent50Vol = volumes.slice(-50)
    const avg5Vol = recent5Vol.reduce((a, b) => a + b, 0) / recent5Vol.length
    const avg50Vol = recent50Vol.reduce((a, b) => a + b, 0) / recent50Vol.length
    volumeChange = avg50Vol > 0 ? avg5Vol / avg50Vol : null

    // 5D price change %
    const price5DAgo = closes[closes.length - 6] // 5 trading days ago
    if (price5DAgo != null && price5DAgo > 0) {
      priceChange = ((currentPrice - price5DAgo) / price5DAgo) * 100
    }
  }

  return {
    ema20Dev: priceVsEMA(currentPrice, latestEma20),
    ema50Dev: priceVsEMA(currentPrice, latestEma50),
    ema200Dev: priceVsEMA(currentPrice, latestEma200),
    rsi: rsiValue ?? 50,
    vpt: vptValue ?? 0,
    volumeChange,
    priceChange,
  }
}

/**
 * Fetch 6 years of OHLCV data. Computes technical metrics (needs 200+ days)
 * and returns the full price history for valuation 5Y average computation.
 */
async function fetchPriceDataForScoring(
  stockId: string
): Promise<{ technicalData: TechnicalResult | null; priceHistory: { date: string; price: number }[] }> {
  try {
    const to = new Date().toISOString().split('T')[0]
    // 6 years: enough for 5 FY-end prices (valuation avg) + 200 trading days (EMA200)
    const from = new Date(Date.now() - 6 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const prices = await getHistoricalPrices(stockId, from, to)

    if (!prices || prices.length === 0) return { technicalData: null, priceHistory: [] }

    // Sort ascending by date — CMOTS API may return descending order
    prices.sort((a, b) => a.Tradedate.localeCompare(b.Tradedate))

    const closes = prices.map(p => p.Dayclose)
    const volumes = prices.map(p => p.TotalVolume)
    const technicalData = closes.length >= 200 ? computeTechnicalFromPriceArray(closes, volumes) : null

    const priceHistory = prices.map(p => ({
      date: p.Tradedate.split('T')[0],
      price: p.Dayclose,
    }))

    return { technicalData, priceHistory }
  } catch (err) {
    console.warn(`[MetricResolver] Failed to fetch price data for ${stockId}`, err)
    return { technicalData: null, priceHistory: [] }
  }
}

// ─────────────────────────────────────────────────
// Quarterly Momentum (windowed)
// ─────────────────────────────────────────────────

function computeQuarterlyMultipliers(quarterly: CMOTSStatementRow[], asOfDate?: string): {
  revenueMultiplier: number | null
  ebitdaMultiplier: number | null
} {
  if (quarterly.length === 0) {
    return { revenueMultiplier: null, ebitdaMultiplier: null }
  }

  const revenueRow = findStatementRow(quarterly, QR_ROW_REVENUE)
  const revenueMultiplier = revenueRow ? computeYoYMultiplier(revenueRow, asOfDate) : null

  const ebitdaRow = findStatementRow(quarterly, QR_ROW_OP_PROFIT)
  const ebitdaMultiplier = ebitdaRow ? computeYoYMultiplier(ebitdaRow, asOfDate) : null

  return { revenueMultiplier, ebitdaMultiplier }
}

function computeYoYMultiplier(row: CMOTSStatementRow, asOfDate?: string): number | null {
  const yearCols = windowYearColumns(row, asOfDate)  // Newest first
  if (yearCols.length < 5) return null

  const latestCol = yearCols[0]
  const latestMonth = latestCol.slice(5)

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
// Custom Metric Resolution (user-defined metrics)
// ─────────────────────────────────────────────────

/**
 * Resolve user-defined custom metrics from CMOTS data.
 * For TTM source: direct field lookup. For statements: row-based derivation.
 */
function resolveCustomMetrics(
  customMetrics: CustomMetricDefinition[],
  ttm: CMOTSTTMRecord | null,
  pnl: CMOTSStatementRow[],
  cashFlow: CMOTSStatementRow[],
  balanceSheet: CMOTSStatementRow[],
  quarterly: CMOTSStatementRow[],
  asOfDate?: string,
): Record<string, number | null> {
  const result: Record<string, number | null> = {}

  for (const metric of customMetrics) {
    result[metric.id] = resolveOneCustomMetric(
      metric, ttm, pnl, cashFlow, balanceSheet, quarterly, asOfDate,
    )
  }

  return result
}

function resolveOneCustomMetric(
  metric: CustomMetricDefinition,
  ttm: CMOTSTTMRecord | null,
  pnl: CMOTSStatementRow[],
  cashFlow: CMOTSStatementRow[],
  balanceSheet: CMOTSStatementRow[],
  quarterly: CMOTSStatementRow[],
  asOfDate?: string,
): number | null {
  switch (metric.cmots_source) {
    case 'ttm': {
      if (!ttm) return null
      const value = (ttm as unknown as Record<string, unknown>)[metric.cmots_field]
      if (value === undefined) {
        console.warn(`[MetricResolver] TTM field '${metric.cmots_field}' not found for custom metric '${metric.name}'`)
      }
      return typeof value === 'number' ? value : null
    }
    case 'pnl':
      return resolveStatementCustomMetric(pnl, metric, asOfDate)
    case 'balanceSheet':
      return resolveStatementCustomMetric(balanceSheet, metric, asOfDate)
    case 'cashFlow':
      return resolveStatementCustomMetric(cashFlow, metric, asOfDate)
    case 'quarterly':
      return resolveStatementCustomMetric(quarterly, metric, asOfDate)
    default:
      // Shareholding and other sources are resolved in mapCMOTSToMetricIds, not here
      return null
  }
}

/** Resolve a custom metric from statement row data using the specified derivation */
function resolveStatementCustomMetric(
  rows: CMOTSStatementRow[],
  metric: CustomMetricDefinition,
  asOfDate?: string,
): number | null {
  if (metric.cmots_rowno == null) return null
  const row = findStatementRow(rows, metric.cmots_rowno)
  if (!row) return null

  const yearCols = windowYearColumns(row, asOfDate)

  switch (metric.derivation) {
    case 'latest': {
      if (yearCols.length === 0) return null
      return getStatementValue(row, yearCols[0])
    }
    case 'growth_cagr': {
      if (yearCols.length < 2) return null
      const latest = getStatementValue(row, yearCols[0])
      const oldest = getStatementValue(row, yearCols[yearCols.length - 1])
      if (latest == null || oldest == null || oldest <= 0) return null
      return computeCAGR(oldest, latest, yearCols.length - 1)
    }
    case 'yoy_change': {
      if (yearCols.length < 2) return null
      const current = getStatementValue(row, yearCols[0])
      const previous = getStatementValue(row, yearCols[1])
      if (current == null || previous == null || previous === 0) return null
      return ((current - previous) / Math.abs(previous)) * 100
    }
    case 'yoy_ratio': {
      if (yearCols.length < 2) return null
      const current = getStatementValue(row, yearCols[0])
      const previous = getStatementValue(row, yearCols[1])
      if (current == null || previous == null || previous === 0) return null
      return current / previous
    }
    default:
      return null
  }
}

// ─────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────

/**
 * Resolve all metric values for a stock given its NSE symbol.
 * Returns metric data + context (start/end year values for negative handling).
 *
 * Fetches from CMOTS services, computes technical indicators,
 * and extracts growth context from P&L rows.
 * Returns null with a warning if data is unavailable.
 */
export async function resolveMetricValues(
  stockId: string,
  config?: MetricResolutionConfig,
): Promise<ResolvedMetrics | null> {
  // Fetch fundamentals + price data in parallel
  const [fundamentals, priceResult] = await Promise.all([
    getAllFundamentals(stockId),
    fetchPriceDataForScoring(stockId),
  ])
  const technicalData = priceResult.technicalData

  const { ttm, finData, pnl, cashFlow, balanceSheet, quarterly, shareholding } = fundamentals

  // If no TTM data available, this stock can't be scored
  if (!ttm) {
    console.warn(`[MetricResolver] No TTM data for ${stockId}, skipping`)
    return null
  }

  const data = mapCMOTSToMetricIds(
    ttm, finData, pnl, cashFlow, balanceSheet, quarterly,
    technicalData ?? undefined, undefined, undefined, config,
    undefined, shareholding, priceResult.priceHistory,
  )
  const context = extractGrowthContext(pnl, finData, undefined, config?.growthPeriods)

  return {
    data,
    context: Object.keys(context).length > 0 ? context : undefined,
  }
}

/**
 * Resolve metrics at a specific historical date using pre-fetched data.
 * This is the key function for backtesting — called once per stock per interval.
 *
 * All data (fundamentals, prices) is fetched ONCE upstream and passed in.
 * This function only does in-memory windowing + arithmetic — no network calls.
 */
export function resolveMetricsAtDate(
  fundamentals: FundamentalsBundle,
  priceHistory: { date: string; price: number; volume?: number }[],
  asOfDate: string,
  config?: MetricResolutionConfig,
): ResolvedMetrics {
  const { ttm, finData, pnl, cashFlow, balanceSheet, quarterly, shareholding } = fundamentals

  // Find price at asOfDate (closest trading day on or before)
  const priceAtDate = findClosestPriceValue(priceHistory, asOfDate)

  // Compute technical metrics from windowed price history
  const windowedPrices = priceHistory.filter(p => p.date <= asOfDate)
  let technicalData: TechnicalResult | undefined
  if (windowedPrices.length >= 200) {
    const closes = windowedPrices.map(p => p.price)
    const volumes = windowedPrices.map(p => p.volume ?? 1000000)
    technicalData = computeTechnicalFromPriceArray(closes, volumes) ?? undefined
  }

  const data = mapCMOTSToMetricIds(
    ttm, finData, pnl, cashFlow, balanceSheet, quarterly,
    technicalData, asOfDate, priceAtDate ?? undefined, config,
    undefined, shareholding, priceHistory,
  )
  const context = extractGrowthContext(pnl, finData, asOfDate, config?.growthPeriods)

  // Resolve custom metrics and merge
  if (config?.customMetrics && config.customMetrics.length > 0) {
    const customValues = resolveCustomMetrics(
      config.customMetrics, ttm, pnl, cashFlow, balanceSheet, quarterly, asOfDate,
    )
    Object.assign(data, customValues)
  }

  return {
    data,
    context: Object.keys(context).length > 0 ? context : undefined,
  }
}

/**
 * Find the price on or just before a target date using binary search.
 * INVARIANT: priceHistory must be sorted ascending by date.
 * This is guaranteed by getHistoricalPrices() which sorts on fetch,
 * and Array.filter() which preserves order.
 *
 * O(log n) instead of O(n) — significant for large price histories
 * queried multiple times per stock during backtesting.
 */
function findClosestPriceValue(
  priceHistory: { date: string; price: number }[],
  targetDate: string,
): number | null {
  if (priceHistory.length === 0) return null

  // Binary search for the rightmost entry with date <= targetDate
  let lo = 0
  let hi = priceHistory.length - 1

  // Quick bounds check: if all dates are after target, no match
  if (priceHistory[0].date > targetDate) return null
  // If last date is <= target, it's the answer
  if (priceHistory[hi].date <= targetDate) return priceHistory[hi].price

  // Binary search: find largest index where date <= targetDate
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1  // Ceiling division to avoid infinite loop
    if (priceHistory[mid].date <= targetDate) {
      lo = mid
    } else {
      hi = mid - 1
    }
  }

  return priceHistory[lo].date <= targetDate ? priceHistory[lo].price : null
}

/**
 * Resolve metric values for multiple stocks (batch).
 * Uses Promise.allSettled so a single stock failure doesn't crash the entire batch.
 */
export async function resolveMetricValuesBatch(
  stockIds: string[],
  config?: MetricResolutionConfig,
): Promise<Record<string, ResolvedMetrics>> {
  const result: Record<string, ResolvedMetrics> = {}

  const BATCH_SIZE = 10
  for (let i = 0; i < stockIds.length; i += BATCH_SIZE) {
    const batch = stockIds.slice(i, i + BATCH_SIZE)
    const settled = await Promise.allSettled(
      batch.map(async id => {
        const resolved = await resolveMetricValues(id, config)
        if (resolved) result[id] = resolved
      })
    )
    for (let j = 0; j < settled.length; j++) {
      if (settled[j].status === 'rejected') {
        console.warn(`[MetricResolver] Failed to resolve metrics for ${batch[j]}:`, (settled[j] as PromiseRejectedResult).reason)
      }
    }
  }
  return result
}

/**
 * Get stock info (name, sector, market cap) for scoring result assembly.
 */
export async function getStockInfo(stockId: string): Promise<{
  id: string
  name: string
  symbol: string
  sector: string
  marketCap: number
} | null> {
  const company = await getCompanyBySymbol(stockId)
  if (!company) return null

  const mcapEstimate = company.mcaptype === 'Large Cap' ? 100000
    : company.mcaptype === 'Mid Cap' ? 25000
    : 5000

  const displaySymbol = company.nsesymbol || company.bsecode || company.companyshortname || String(company.co_code)
  return {
    id: String(company.co_code),
    name: company.companyname,
    symbol: displaySymbol,
    sector: company.sectorname,
    marketCap: mcapEstimate,
  }
}
