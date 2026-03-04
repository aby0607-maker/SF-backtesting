/**
 * Scorecard V1 — Compute All Metrics
 *
 * Reads cached API data from data/api-cache/{co_code}/,
 * computes ~100 metrics across 9 segments at annual, quarterly, and monthly snapshots.
 * Saves results to data/results/{co_code}/all-metrics.json.
 *
 * Usage:
 *   node scripts/scorecard-v1/compute-all-metrics.mjs --co_code 476
 *   node scripts/scorecard-v1/compute-all-metrics.mjs --symbol TCS
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '../..')
const CACHE_DIR = resolve(PROJECT_ROOT, 'data/api-cache')
const RESULTS_DIR = resolve(PROJECT_ROOT, 'data/results')

// ── CLI ──
function parseArgs() {
  const args = process.argv.slice(2)
  const opts = { co_code: null, symbol: null }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--co_code' && args[i + 1]) opts.co_code = args[++i]
    else if (args[i] === '--symbol' && args[i + 1]) opts.symbol = args[++i].toUpperCase()
  }
  return opts
}

function resolveCoCode(opts) {
  if (opts.co_code) return opts.co_code
  // Find by symbol in cached meta files
  if (opts.symbol && existsSync(CACHE_DIR)) {
    for (const dir of readdirSync(CACHE_DIR)) {
      const metaPath = resolve(CACHE_DIR, dir, 'meta.json')
      if (existsSync(metaPath)) {
        const meta = JSON.parse(readFileSync(metaPath, 'utf8'))
        if (meta.symbol?.toUpperCase() === opts.symbol) return dir
      }
    }
  }
  console.error('Could not resolve co_code. Use --co_code or --symbol (after fetching data).')
  process.exit(1)
}

// ── Data Loading ──
function loadJSON(cacheDir, file) {
  const path = resolve(cacheDir, file)
  if (!existsSync(path)) return null
  const raw = JSON.parse(readFileSync(path, 'utf8'))
  if (raw && typeof raw === 'object' && !Array.isArray(raw) && 'data' in raw) return raw.data
  return raw
}

/** Index statement rows by rowno → { name, values: { Y202103: val, ... } } */
function indexStatementRows(rows) {
  if (!Array.isArray(rows)) return {}
  const map = {}
  for (const row of rows) {
    const rn = row.rowno ?? row.RowNo
    if (rn == null) continue
    if (map[rn]) continue
    const yearVals = {}
    for (const [k, v] of Object.entries(row)) {
      if (/^Y\d{6}$/.test(k)) yearVals[k] = v ?? 0
    }
    map[rn] = { name: (row.COLUMNNAME || row.rowdesc || '').trim(), values: yearVals }
  }
  return map
}

/** Index quarterly rows by rowno → { name, values: { Q202503: val, ... } } */
function indexQuarterlyRows(rows) {
  if (!Array.isArray(rows)) return {}
  const map = {}
  for (const row of rows) {
    const rn = row.rowno ?? row.RowNo
    if (rn == null) continue
    if (map[rn]) continue
    const qVals = {}
    for (const [k, v] of Object.entries(row)) {
      if (/^Q\d{6}$/.test(k) || /^Y\d{6}$/.test(k)) qVals[k] = v ?? 0
    }
    map[rn] = { name: (row.COLUMNNAME || row.rowdesc || '').trim(), values: qVals }
  }
  return map
}

function getYearCols(stmtMap) {
  const sample = Object.values(stmtMap)[0]
  if (!sample) return []
  return Object.keys(sample.values).filter(k => /^Y\d{6}$/.test(k)).sort()
}

function rv(stmtMap, rowno, col) {
  return stmtMap[rowno]?.values?.[col] ?? null
}

/**
 * Description-based row resolver.
 * Consolidated P&L/BS/CF have different row numbers than standalone.
 * This finds rows by matching description keywords, with rowno fallback.
 */
function buildRowResolver(stmtMap) {
  // Create name → rowno index (lowercase)
  const nameIndex = {}
  for (const [rn, entry] of Object.entries(stmtMap)) {
    const name = entry.name.toLowerCase()
    nameIndex[name] = parseInt(rn)
  }

  /**
   * Resolve a row by trying: exact rowno first, then keyword match in descriptions.
   * keywords is an array of strings to match (case-insensitive, in order of preference).
   */
  return function resolveRow(stmtMap, preferredRowno, keywords, col) {
    // Try preferred rowno first
    const val = rv(stmtMap, preferredRowno, col)
    if (val != null && val !== 0) return val

    // Try keyword matching
    for (const kw of keywords) {
      const kwLower = kw.toLowerCase()
      for (const [name, rn] of Object.entries(nameIndex)) {
        if (name.includes(kwLower) || name === kwLower) {
          const v = rv(stmtMap, rn, col)
          if (v != null && v !== 0) return v
        }
      }
    }
    return null
  }
}

/**
 * Auto-detect row mapping for P&L, BS, CF.
 * Returns a mapping object with logical names → actual row numbers.
 */
function detectRowMapping(PNL, BS, CF) {
  const findRow = (stmtMap, keywords) => {
    for (const [rn, entry] of Object.entries(stmtMap)) {
      const name = entry.name.toLowerCase()
      for (const kw of keywords) {
        if (name === kw.toLowerCase() || name.includes(kw.toLowerCase())) {
          return parseInt(rn)
        }
      }
    }
    return null
  }

  const mapping = {
    // P&L
    pnl_revenue_ops: findRow(PNL, ['revenue from operations']),
    pnl_total_revenue: findRow(PNL, ['total revenue']),
    pnl_other_income: findRow(PNL, ['other income']),
    pnl_cogs: findRow(PNL, ['cost of material consumed', 'cost of materials consumed']),
    pnl_employee_cost: findRow(PNL, ['employee benefits', 'employee benefit']),
    pnl_finance_costs: findRow(PNL, ['finance costs', 'finance cost']),
    pnl_da: findRow(PNL, ['depreciation and amortization', 'depreciation and amortisation']),
    pnl_total_expenses: findRow(PNL, ['total expenses']),
    pnl_pbt: findRow(PNL, ['profit before tax']),
    pnl_tax: findRow(PNL, ['taxation']),
    pnl_pat: findRow(PNL, ['profit after tax']),
    pnl_pat_attr: findRow(PNL, ['profit attributable to shareholders']),
    pnl_eps: findRow(PNL, ['earning per share - basic', 'earnings per share - basic']),
    pnl_ebitda: findRow(PNL, ['operation profit before depreciation', 'operating profit before depreciation']),
    pnl_dps: findRow(PNL, ['dividend per share']),
    pnl_exceptional: findRow(PNL, ['exceptional items before tax']),
    pnl_shares_basic: findRow(PNL, ['weighted average shares - basic']),

    // BS
    bs_fixed_assets: findRow(BS, ['fixed assets']),
    bs_inventory: findRow(BS, ['inventories']),
    bs_current_inv: findRow(BS, ['current investments']),
    bs_cash: findRow(BS, ['cash and cash equivalents']),
    bs_trade_recv: findRow(BS, ['trade receivables']),
    bs_total_ca: findRow(BS, ['total current assets']),
    bs_total_assets: findRow(BS, ['total assets']),
    bs_st_borrowings: findRow(BS, ['short term borrowings', 'short-term borrowings']),
    bs_trade_pay: findRow(BS, ['trade payables']),
    bs_total_cl: findRow(BS, ['total current liabilities']),
    bs_lt_borrowings: findRow(BS, ['long term borrowings', 'long-term borrowings']),
    bs_shareholder_fund: findRow(BS, ["total shareholder's fund", 'total shareholders fund']),
    bs_total_equity: findRow(BS, ['total equity']),
    bs_shares: findRow(BS, ['susbcribed & fully paid up shares', 'subscribed & fully paid up shares', 'subscribed and fully paid up shares']),
    bs_par_value: findRow(BS, ['par value']),
    bs_equity_capital: findRow(BS, ['equity capital']),

    // CF
    cf_ocf: findRow(CF, ['net cash generated from (used in) operations', 'net cash from operating']),
    cf_capex: findRow(CF, ['purchase of fixed assets']),
    cf_cash_investing: findRow(CF, ['net cash from investing', 'net cash generated from (used in) investing']),
    cf_div_paid: findRow(CF, ['dividend paid', 'dividends paid']),
    cf_cash_financing: findRow(CF, ['net cash from financing', 'net cash generated from (used in) financing']),
  }

  return mapping
}

/** Parse OHLCV into sorted records */
function parseOHLCV(data) {
  if (!Array.isArray(data)) return []
  return data.map(r => ({
    date:   (r.Tradedate || r.tradedate || '').slice(0, 10),
    open:   r.DayOpen || r.dayopen || 0,
    high:   r.DayHigh || r.dayhigh || 0,
    low:    r.Daylow  || r.daylow  || 0,
    close:  r.Dayclose || r.dayclose || 0,
    volume: r.TotalVolume || r.totalvolume || 0,
    mcap:   r.DMCAP || r.dmcap || 0,
  })).sort((a, b) => a.date.localeCompare(b.date))
}

/** Find closest OHLCV record to target date */
function priceAt(ohlcv, targetDate) {
  let best = null, bestDiff = Infinity
  for (const r of ohlcv) {
    const diff = Math.abs(new Date(r.date) - new Date(targetDate))
    if (diff < bestDiff) { bestDiff = diff; best = r }
  }
  return best
}

/** Get price series up to target date */
function priceSeriesUpTo(ohlcv, targetDate, maxDays = 800) {
  const target = new Date(targetDate)
  return ohlcv.filter(r => new Date(r.date) <= target).slice(-maxDays)
}

// ─────────────────────────────────────────────────
// TECHNICAL INDICATOR CALCULATIONS
// ─────────────────────────────────────────────────

function ema(prices, period) {
  if (prices.length < period) return []
  const k = 2 / (period + 1)
  let prev = prices.slice(0, period).reduce((a, b) => a + b, 0) / period
  const result = [prev]
  for (let i = period; i < prices.length; i++) {
    prev = prices[i] * k + prev * (1 - k)
    result.push(prev)
  }
  return result
}

function smaArr(prices, period) {
  if (prices.length < period) return []
  const result = []
  for (let i = period - 1; i < prices.length; i++) {
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) sum += prices[j]
    result.push(sum / period)
  }
  return result
}

function rsi(prices, period = 14) {
  if (prices.length < period + 1) return null
  let avgGain = 0, avgLoss = 0
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1]
    if (diff > 0) avgGain += diff; else avgLoss += Math.abs(diff)
  }
  avgGain /= period; avgLoss /= period
  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1]
    avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period
    avgLoss = (avgLoss * (period - 1) + (diff < 0 ? Math.abs(diff) : 0)) / period
  }
  if (avgLoss === 0) return 100
  return 100 - (100 / (1 + avgGain / avgLoss))
}

function macd(prices) {
  const ema12 = ema(prices, 12), ema26 = ema(prices, 26)
  if (!ema12.length || !ema26.length) return null
  const offset = ema12.length - ema26.length
  const line = ema26.map((_, i) => ema12[i + offset] - ema26[i])
  const signal = ema(line, 9)
  if (!signal.length) return null
  return { macd: line[line.length - 1], signal: signal[signal.length - 1], histogram: line[line.length - 1] - signal[signal.length - 1] }
}

function bollingerB(prices, period = 20) {
  const s = smaArr(prices, period)
  if (!s.length) return null
  const lastSMA = s[s.length - 1]
  const recent = prices.slice(-period)
  const mean = recent.reduce((a, b) => a + b, 0) / recent.length
  const std = Math.sqrt(recent.reduce((a, b) => a + (b - mean) ** 2, 0) / recent.length)
  if (std === 0) return 0.5
  return (prices[prices.length - 1] - (lastSMA - 2 * std)) / (4 * std)
}

function maxDrawdown(prices) {
  let peak = prices[0], maxDD = 0
  for (const p of prices) {
    if (p > peak) peak = p
    const dd = (peak - p) / peak
    if (dd > maxDD) maxDD = dd
  }
  return -maxDD * 100
}

function annualizedReturn(prices) {
  if (prices.length < 2) return null
  const total = prices[prices.length - 1] / prices[0] - 1
  return ((1 + total) ** (252 / prices.length) - 1) * 100
}

function annualizedVolatility(prices) {
  if (prices.length < 2) return null
  const rets = []
  for (let i = 1; i < prices.length; i++) rets.push(Math.log(prices[i] / prices[i - 1]))
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length
  const variance = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / (rets.length - 1)
  return Math.sqrt(variance * 252) * 100
}

/** ADX (Average Directional Index) — 14-period */
function adx(highs, lows, closes, period = 14) {
  if (highs.length < period * 2 + 1) return null
  const trueRanges = [], plusDMs = [], minusDMs = []
  for (let i = 1; i < highs.length; i++) {
    trueRanges.push(Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1])))
    const upMove = highs[i] - highs[i - 1], downMove = lows[i - 1] - lows[i]
    plusDMs.push(upMove > downMove && upMove > 0 ? upMove : 0)
    minusDMs.push(downMove > upMove && downMove > 0 ? downMove : 0)
  }
  // Smoothed sums
  let atr = trueRanges.slice(0, period).reduce((a, b) => a + b, 0)
  let plusDM = plusDMs.slice(0, period).reduce((a, b) => a + b, 0)
  let minusDM = minusDMs.slice(0, period).reduce((a, b) => a + b, 0)
  const dxValues = []
  for (let i = period; i < trueRanges.length; i++) {
    atr = atr - atr / period + trueRanges[i]
    plusDM = plusDM - plusDM / period + plusDMs[i]
    minusDM = minusDM - minusDM / period + minusDMs[i]
    const plusDI = atr > 0 ? (plusDM / atr) * 100 : 0
    const minusDI = atr > 0 ? (minusDM / atr) * 100 : 0
    const diSum = plusDI + minusDI
    dxValues.push(diSum > 0 ? Math.abs(plusDI - minusDI) / diSum * 100 : 0)
  }
  if (dxValues.length < period) return null
  let adxVal = dxValues.slice(0, period).reduce((a, b) => a + b, 0) / period
  for (let i = period; i < dxValues.length; i++) {
    adxVal = (adxVal * (period - 1) + dxValues[i]) / period
  }
  return adxVal
}

/** Stochastic %K (14-period) */
function stochasticK(highs, lows, closes, period = 14) {
  if (closes.length < period) return null
  const recentHighs = highs.slice(-period), recentLows = lows.slice(-period)
  const highest = Math.max(...recentHighs), lowest = Math.min(...recentLows)
  if (highest === lowest) return 50
  return ((closes[closes.length - 1] - lowest) / (highest - lowest)) * 100
}

/** OBV trend — slope of OBV over last 20 days (normalized) */
function obvTrend(closes, volumes, lookback = 20) {
  if (closes.length < lookback + 1 || volumes.length < lookback + 1) return null
  // Check if volumes are all zero (CMOTS BSE may not have volume)
  const recentVols = volumes.slice(-lookback)
  if (recentVols.every(v => v === 0)) return null
  // Compute OBV
  let obv = 0
  const obvArr = [0]
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > closes[i - 1]) obv += volumes[i]
    else if (closes[i] < closes[i - 1]) obv -= volumes[i]
    obvArr.push(obv)
  }
  // Linear regression slope over last `lookback` OBV values
  const recent = obvArr.slice(-lookback)
  const n = recent.length
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
  for (let i = 0; i < n; i++) {
    sumX += i; sumY += recent[i]; sumXY += i * recent[i]; sumX2 += i * i
  }
  const denom = n * sumX2 - sumX * sumX
  if (denom === 0) return 0
  const slope = (n * sumXY - sumX * sumY) / denom
  // Normalize by average OBV magnitude
  const avgOBV = Math.abs(sumY / n)
  return avgOBV > 0 ? slope / avgOBV * 100 : 0
}

// ─────────────────────────────────────────────────
// METRIC COMPUTATION FUNCTIONS
// ─────────────────────────────────────────────────

/** Safe division */
function div(a, b) { return (b != null && b !== 0 && a != null) ? a / b : null }
function pct(a, b) { const r = div(a, b); return r != null ? r * 100 : null }
function growth(curr, prev) { return (prev != null && prev !== 0 && curr != null) ? ((curr - prev) / Math.abs(prev)) * 100 : null }
function cagr(curr, prev, years) {
  if (prev == null || prev <= 0 || curr == null || curr <= 0 || years <= 0) return null
  return (Math.pow(curr / prev, 1 / years) - 1) * 100
}

/**
 * Compute ALL fundamental metrics at a given FY year column.
 * Maps to metricDefinitions.ts IDs where possible.
 */
function computeFundamentals(PNL, BS, CF, yearCol, prevYearCol, allYearCols, price, sharesOS, R) {
  const m = {}

  // ── P&L values (using auto-detected row mapping R) ──
  const revenue     = rv(PNL, R.pnl_total_revenue, yearCol) || rv(PNL, R.pnl_revenue_ops, yearCol)
  const revFromOps  = rv(PNL, R.pnl_revenue_ops, yearCol)
  const cogs        = rv(PNL, R.pnl_cogs, yearCol)
  const employeeCost= rv(PNL, R.pnl_employee_cost, yearCol)
  const otherIncome = rv(PNL, R.pnl_other_income, yearCol)
  const financeCosts= rv(PNL, R.pnl_finance_costs, yearCol)
  const da          = rv(PNL, R.pnl_da, yearCol)
  const pbt         = rv(PNL, R.pnl_pbt, yearCol)
  const tax         = rv(PNL, R.pnl_tax, yearCol)
  const pat         = rv(PNL, R.pnl_pat, yearCol) || rv(PNL, R.pnl_pat_attr, yearCol)
  const eps         = rv(PNL, R.pnl_eps, yearCol)
  const ebitda      = rv(PNL, R.pnl_ebitda, yearCol)
  const dps         = rv(PNL, R.pnl_dps, yearCol)

  // ── Balance Sheet values ──
  const fixedAssets    = rv(BS, R.bs_fixed_assets, yearCol)
  const inventory      = rv(BS, R.bs_inventory, yearCol)
  const currentInv     = rv(BS, R.bs_current_inv, yearCol)
  const cash           = rv(BS, R.bs_cash, yearCol)
  const tradeRecv      = rv(BS, R.bs_trade_recv, yearCol)
  const totalCA        = rv(BS, R.bs_total_ca, yearCol)
  const totalAssets    = rv(BS, R.bs_total_assets, yearCol)
  const stBorrowings   = rv(BS, R.bs_st_borrowings, yearCol)
  const tradePay       = rv(BS, R.bs_trade_pay, yearCol)
  const totalCL        = rv(BS, R.bs_total_cl, yearCol)
  const ltBorrowings   = rv(BS, R.bs_lt_borrowings, yearCol)
  const shareholderFund= rv(BS, R.bs_shareholder_fund, yearCol)
  const sharesOutstanding = sharesOS || rv(BS, R.bs_shares, yearCol)

  // ── Cash Flow values ──
  const ocf          = rv(CF, R.cf_ocf, yearCol)
  const capexRaw     = rv(CF, R.cf_capex, yearCol) // negative
  const cashInvesting= rv(CF, R.cf_cash_investing, yearCol)
  const divPaid      = rv(CF, R.cf_div_paid, yearCol)
  const cashFinancing= rv(CF, R.cf_cash_financing, yearCol)

  const totalDebt = (stBorrowings || 0) + (ltBorrowings || 0)
  const netDebt = totalDebt - (cash || 0) - (currentInv || 0)
  const capex = capexRaw ? Math.abs(capexRaw) : null
  const fcf = (ocf != null && capexRaw != null) ? ocf + capexRaw : null // capex is negative in CF
  const ebit = ebitda && da ? ebitda - da : null
  const capitalEmployed = totalAssets && totalCL ? totalAssets - totalCL : null

  // MCap in crores (shares in lakhs in CMOTS, prices in rupees)
  const mcap = (price && sharesOutstanding && sharesOutstanding > 0) ? (price * sharesOutstanding) / 1e7 : null
  const ev = mcap != null ? mcap + netDebt : null

  // ══════════════════════════════════════════
  // PROFITABILITY (13 metrics)
  // ══════════════════════════════════════════
  m.roce = pct(pbt != null && financeCosts != null ? pbt + financeCosts : null, capitalEmployed)
  m.roe = pct(pat, shareholderFund)
  m.roa = pct(pat, totalAssets)
  m.net_profit_margin = pct(pat, revenue)
  m.operating_profit_margin = revenue && cogs != null && employeeCost != null
    ? ((revenue - (cogs || 0) - (employeeCost || 0)) / revenue) * 100 : null
  m.ebitda_margin = pct(ebitda, revenue)
  m.gross_profit_margin = revenue && cogs != null ? ((revenue - cogs) / revenue) * 100 : null
  m.cash_flow_margin = pct(ocf, revenue)
  m.fcf_to_pat = pct(fcf, pat)
  m.earnings_quality = div(ocf, pat)
  m.earnings_yield = price && eps ? (eps / price) * 100 : null

  // 5Y averages (computed from all available year columns)
  const roeArr = [], roaArr = []
  for (const yc of allYearCols) {
    const p = rv(PNL, R.pnl_pat, yc) || rv(PNL, R.pnl_pat_attr, yc)
    const shf = rv(BS, R.bs_shareholder_fund, yc), ta = rv(BS, R.bs_total_assets, yc)
    if (p && shf && shf !== 0) roeArr.push((p / shf) * 100)
    if (p && ta && ta !== 0) roaArr.push((p / ta) * 100)
  }
  m.roe_5y_avg = roeArr.length >= 3 ? roeArr.reduce((a, b) => a + b, 0) / roeArr.length : null
  m.roa_5y_avg = roaArr.length >= 3 ? roaArr.reduce((a, b) => a + b, 0) / roaArr.length : null

  // ══════════════════════════════════════════
  // FINANCIAL RATIOS (14 metrics)
  // ══════════════════════════════════════════
  m.current_ratio = div(totalCA, totalCL)
  m.quick_ratio = totalCA != null && inventory != null && totalCL
    ? (totalCA - inventory) / totalCL : null
  m.debt_to_equity = div(totalDebt, shareholderFund)
  m.interest_coverage = div(ebitda, financeCosts)
  m.debt_to_ebitda = div(totalDebt, ebitda)
  m.dso = revenue ? (tradeRecv || 0) / revenue * 365 : null
  m.dio = cogs && cogs !== 0 ? (inventory || 0) / cogs * 365 : null
  m.dpo = cogs && cogs !== 0 ? (tradePay || 0) / cogs * 365 : null
  m.cash_conversion_cycle = (m.dio != null && m.dso != null && m.dpo != null)
    ? m.dio + m.dso - m.dpo : null
  m.asset_turnover = div(revenue, totalAssets)
  m.fixed_asset_turnover = div(revenue, fixedAssets)
  m.working_capital_to_sales = totalCA != null && totalCL != null && revenue
    ? (totalCA - totalCL) / revenue : null
  m.capex_to_revenue = revenue ? (capex || 0) / revenue : null

  // ICR trend (slope over available years)
  const icrArr = []
  for (const yc of allYearCols) {
    const eb = rv(PNL, R.pnl_ebitda, yc), fc = rv(PNL, R.pnl_finance_costs, yc)
    if (eb && fc && fc !== 0) icrArr.push(eb / fc)
  }
  m.icr_trend = icrArr.length >= 3
    ? (icrArr[icrArr.length - 1] - icrArr[0]) / (icrArr.length - 1) : null

  // ══════════════════════════════════════════
  // GROWTH (12 metrics)
  // ══════════════════════════════════════════
  if (prevYearCol) {
    m.revenue_growth_1y = growth(revenue, rv(PNL, R.pnl_total_revenue, prevYearCol) || rv(PNL, R.pnl_revenue_ops, prevYearCol))
    m.ebitda_growth_1y = growth(ebitda, rv(PNL, R.pnl_ebitda, prevYearCol))
    m.pat_growth_1y = growth(pat, rv(PNL, R.pnl_pat, prevYearCol) || rv(PNL, R.pnl_pat_attr, prevYearCol))
    m.eps_growth_1y = growth(eps, rv(PNL, R.pnl_eps, prevYearCol))
    m.ocf_growth_1y = growth(ocf, rv(CF, R.cf_ocf, prevYearCol))
    m.book_value_growth = growth(shareholderFund, rv(BS, R.bs_shareholder_fund, prevYearCol))
  }

  // CAGRs (3Y and 5Y)
  const ycIdx = allYearCols.indexOf(yearCol)
  if (ycIdx >= 3) {
    const yc3 = allYearCols[ycIdx - 3]
    m.revenue_growth_3y_cagr = cagr(revenue, rv(PNL, R.pnl_total_revenue, yc3) || rv(PNL, R.pnl_revenue_ops, yc3), 3)
    m.ebitda_growth_3y_cagr = cagr(ebitda, rv(PNL, R.pnl_ebitda, yc3), 3)
    m.pat_growth_3y_cagr = cagr(pat, rv(PNL, R.pnl_pat, yc3) || rv(PNL, R.pnl_pat_attr, yc3), 3)
    m.eps_growth_3y_cagr = cagr(eps, rv(PNL, R.pnl_eps, yc3), 3)
  }
  if (ycIdx >= 4) {
    const yc5 = allYearCols[ycIdx - 4]
    m.revenue_growth_5y_cagr = cagr(revenue, rv(PNL, R.pnl_total_revenue, yc5) || rv(PNL, R.pnl_revenue_ops, yc5), 4)
  }

  // ══════════════════════════════════════════
  // VALUATION (11 metrics)
  // ══════════════════════════════════════════
  m.pe_ratio = (price && eps && eps > 0) ? price / eps : null
  m.pb_ratio = (price && shareholderFund && sharesOutstanding && sharesOutstanding > 0)
    ? price / ((shareholderFund * 1e7) / sharesOutstanding) : null
  m.ev_ebitda = div(ev, ebitda)
  m.peg_ratio = m.pe_ratio && m.eps_growth_1y && m.eps_growth_1y > 0
    ? m.pe_ratio / m.eps_growth_1y : null
  m.dividend_yield = (price && dps) ? (dps / price) * 100 : null
  m.price_to_sales = div(mcap, revenue)
  m.price_to_fcf = (mcap && fcf && fcf > 0) ? mcap / fcf : null
  m.ev_to_revenue = div(ev, revenue)

  // vs 5Y averages
  const peArr = [], pbArr = [], evEbArr = []
  for (const yc of allYearCols) {
    const e = rv(PNL, 44, yc), sf = rv(BS, 80, yc), so = rv(BS, 91, yc), eb = rv(PNL, 46, yc)
    const fyDate = `${yc.slice(1, 5)}-${yc.slice(5, 7)}-28`
    const pr = priceAt([], fyDate) // We don't have ohlcv here, will compute in wrapper
    // These will be filled by the wrapper function that has access to OHLCV
    if (e && e > 0 && yc !== yearCol) {
      // We'll compute these in the main pipeline with access to price data
    }
  }
  // Placeholder — these are computed in the main function with OHLCV access
  m.pe_vs_5y_avg = null
  m.pb_vs_5y_avg = null
  m.ev_ebitda_vs_5y_avg = null

  // ══════════════════════════════════════════
  // INCOME STATEMENT (6 metrics)
  // ══════════════════════════════════════════
  m.revenue = revenue
  m.ebitda = ebitda
  m.pat = pat
  m.other_income_ratio = pct(otherIncome, revenue)
  m.tax_rate = (pbt && pbt > 0) ? pct(tax, pbt) : null
  const exceptionalItems = rv(PNL, R.pnl_exceptional, yearCol)
  m.exceptional_items = exceptionalItems

  // ══════════════════════════════════════════
  // BALANCE SHEET (8 metrics)
  // ══════════════════════════════════════════
  m.total_assets = totalAssets
  m.total_debt = totalDebt
  m.net_debt = netDebt
  m.book_value_per_share = (shareholderFund && sharesOutstanding && sharesOutstanding > 0)
    ? (shareholderFund * 1e7) / sharesOutstanding : null
  m.cash_and_equivalents = (cash || 0) + (currentInv || 0)
  m.receivables_turnover = div(revenue, tradeRecv)
  m.inventory_turnover = div(cogs, inventory)
  m.gross_block_growth = null // Computed if prev year available
  if (prevYearCol) {
    m.gross_block_growth = growth(fixedAssets, rv(BS, R.bs_fixed_assets, prevYearCol))
  }

  // ══════════════════════════════════════════
  // CASH FLOW (raw values for correlation)
  // ══════════════════════════════════════════
  m.ocf_val = ocf
  m.capex_val = capex
  m.fcf_val = fcf
  m.fcf_margin = pct(fcf, revenue)
  m.cash_from_investing = cashInvesting
  m.cash_from_financing = cashFinancing
  m.dividends_paid = divPaid ? Math.abs(divPaid) : null
  m.ocf_to_ebitda = pct(ocf, ebitda)

  // ══════════════════════════════════════════
  // RAW REFERENCES (prefixed with _ to exclude from correlation)
  // ══════════════════════════════════════════
  m._revenue = revenue
  m._ebitda = ebitda
  m._pat = pat
  m._eps = eps
  m._dps = dps
  m._total_assets = totalAssets
  m._total_equity = shareholderFund
  m._total_debt = totalDebt
  m._shares_outstanding = sharesOutstanding
  m._price = price

  return m
}

/**
 * Compute technical + price/volume metrics at a snapshot date.
 */
function computeTechnicals(ohlcv, targetDate, rfRate) {
  const series = priceSeriesUpTo(ohlcv, targetDate)
  if (series.length < 30) return {}

  const closes = series.map(r => r.close)
  const highs = series.map(r => r.high)
  const lows = series.map(r => r.low)
  const volumes = series.map(r => r.volume)
  const m = {}
  const lastPrice = closes[closes.length - 1]

  // ── Technical (7 TickerTape + 13 extra) ──
  m.rsi_14 = rsi(closes)

  const mc = macd(closes)
  if (mc) {
    m.macd_signal = mc.signal
    m.macd_line = mc.macd
    m.macd_histogram = mc.histogram
  }

  const ema20v = ema(closes, 20), ema50v = ema(closes, 50)
  m.ema_crossover = (ema20v.length > 0 && ema50v.length > 0)
    ? (ema20v[ema20v.length - 1] > ema50v[ema50v.length - 1] ? 1 : 0) : null

  m.bb_position = bollingerB(closes)
  m.adx_14 = adx(highs, lows, closes)
  m.stochastic_k = stochasticK(highs, lows, closes)
  m.obv_trend = obvTrend(closes, volumes)

  // Extra: EMA deviations
  const ema200v = ema(closes, 200)
  if (ema20v.length > 0) m.ema20_dev = ((lastPrice - ema20v[ema20v.length - 1]) / ema20v[ema20v.length - 1]) * 100
  if (ema50v.length > 0) m.ema50_dev = ((lastPrice - ema50v[ema50v.length - 1]) / ema50v[ema50v.length - 1]) * 100
  if (ema200v.length > 0) m.ema200_dev = ((lastPrice - ema200v[ema200v.length - 1]) / ema200v[ema200v.length - 1]) * 100

  // Extra: SMA deviations
  for (const p of [10, 20, 50, 100, 200]) {
    const s = smaArr(closes, p)
    if (s.length > 0) m[`sma${p}_dev`] = ((lastPrice - s[s.length - 1]) / s[s.length - 1]) * 100
  }

  // Extra: Risk metrics
  const prices1Y = closes.slice(-252)
  if (prices1Y.length >= 100) {
    m.sharpe_ratio = (annualizedReturn(prices1Y) - (rfRate || 6.5)) / (annualizedVolatility(prices1Y) || 1)
  }
  m.max_drawdown_1y = maxDrawdown(prices1Y)
  m.volatility = annualizedVolatility(closes.slice(-252))
  m.return_1y_ann = annualizedReturn(prices1Y)

  // Volume metrics
  if (volumes.length >= 20) {
    const avg20 = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20
    m.avg_volume_20d = avg20
    if (volumes.length >= 60) {
      const avg60 = volumes.slice(-60).reduce((a, b) => a + b, 0) / 60
      m.avg_volume_3m = avg60
      if (avg60 > 0) m.rvol = avg20 / avg60
    }
  }
  // Volume surge
  if (volumes.length >= 21 && volumes[volumes.length - 1] > 0) {
    const avg20 = volumes.slice(-21, -1).reduce((a, b) => a + b, 0) / 20
    if (avg20 > 0) m.volume_surge_20d = volumes[volumes.length - 1] / avg20
  }

  // ── Price & Volume (8 TickerTape metrics) ──
  // 52-week high/low distance
  const prices52w = closes.slice(-252)
  if (prices52w.length >= 100) {
    const high52w = Math.max(...prices52w)
    const low52w = Math.min(...prices52w)
    m.price_52w_high_dist = ((lastPrice - high52w) / high52w) * 100
    m.price_52w_low_dist = ((lastPrice - low52w) / low52w) * 100
  }

  // Returns
  if (closes.length >= 22) m.price_return_1m = ((lastPrice / closes[closes.length - 22]) - 1) * 100
  if (closes.length >= 63) m.price_return_3m = ((lastPrice / closes[closes.length - 63]) - 1) * 100
  if (closes.length >= 126) m.price_return_6m = ((lastPrice / closes[closes.length - 126]) - 1) * 100
  if (closes.length >= 252) m.price_return_1y = ((lastPrice / closes[closes.length - 252]) - 1) * 100
  if (closes.length >= 756) m.price_return_3y = ((lastPrice / closes[closes.length - 756]) - 1) * 100

  return m
}

/**
 * Compute ownership metrics at closest quarter.
 */
function computeOwnership(shareholding, targetDate) {
  if (!Array.isArray(shareholding) || shareholding.length === 0) return {}
  const targetYM = parseInt(targetDate.slice(0, 4) + targetDate.slice(5, 7))
  let best = null, bestDiff = Infinity
  for (const q of shareholding) {
    const yrc = q.YRC || q.yrc
    if (!yrc) continue
    const diff = Math.abs(yrc - targetYM)
    if (diff < bestDiff) { bestDiff = diff; best = q }
  }
  if (!best) return {}

  const m = {
    promoter_holding: best.Promoters ?? best.promoters,
    fii_holding: best.ForeignInstitution ?? best.foreigninstitution,
    mf_holding: best.MutualFund ?? best.mutualfund,
    dii_holding: ((best.MutualFund ?? best.mutualfund ?? 0) + (best.OtherDomesticInstitution ?? best.otherdomesticinstitution ?? 0)),
    retail_holding: best.Retail ?? best.retail,
  }

  // QoQ changes
  const sorted = [...shareholding].sort((a, b) => (b.YRC || b.yrc) - (a.YRC || a.yrc))
  const currIdx = sorted.findIndex(q => q === best)
  if (currIdx >= 0 && currIdx + 1 < sorted.length) {
    const prev = sorted[currIdx + 1]
    m.promoter_change_3m = (best.Promoters ?? 0) - (prev.Promoters ?? 0)
    m.fii_change_3m = (best.ForeignInstitution ?? 0) - (prev.ForeignInstitution ?? 0)
    m.mf_change_3m = (best.MutualFund ?? 0) - (prev.MutualFund ?? 0)
  }

  return m
}

// ─────────────────────────────────────────────────
// SEGMENT MAPPING
// ─────────────────────────────────────────────────
const SEGMENT_MAP = {
  // Profitability
  roce: 'Profitability', roe: 'Profitability', roe_5y_avg: 'Profitability',
  roa: 'Profitability', roa_5y_avg: 'Profitability',
  net_profit_margin: 'Profitability', operating_profit_margin: 'Profitability',
  ebitda_margin: 'Profitability', gross_profit_margin: 'Profitability',
  cash_flow_margin: 'Profitability', fcf_to_pat: 'Profitability',
  earnings_quality: 'Profitability', earnings_yield: 'Profitability',

  // Financial Ratios
  current_ratio: 'Financial Ratios', quick_ratio: 'Financial Ratios',
  debt_to_equity: 'Financial Ratios', interest_coverage: 'Financial Ratios',
  debt_to_ebitda: 'Financial Ratios', icr_trend: 'Financial Ratios',
  dso: 'Financial Ratios', dio: 'Financial Ratios', dpo: 'Financial Ratios',
  cash_conversion_cycle: 'Financial Ratios', asset_turnover: 'Financial Ratios',
  fixed_asset_turnover: 'Financial Ratios', working_capital_to_sales: 'Financial Ratios',
  capex_to_revenue: 'Financial Ratios',

  // Growth
  revenue_growth_1y: 'Growth', revenue_growth_3y_cagr: 'Growth', revenue_growth_5y_cagr: 'Growth',
  ebitda_growth_1y: 'Growth', ebitda_growth_3y_cagr: 'Growth',
  pat_growth_1y: 'Growth', pat_growth_3y_cagr: 'Growth',
  eps_growth_1y: 'Growth', eps_growth_3y_cagr: 'Growth',
  ocf_growth_1y: 'Growth', book_value_growth: 'Growth', earnings_momentum: 'Growth',

  // Valuation
  pe_ratio: 'Valuation', pe_vs_5y_avg: 'Valuation',
  pb_ratio: 'Valuation', pb_vs_5y_avg: 'Valuation',
  ev_ebitda: 'Valuation', ev_ebitda_vs_5y_avg: 'Valuation',
  peg_ratio: 'Valuation', dividend_yield: 'Valuation',
  price_to_sales: 'Valuation', price_to_fcf: 'Valuation', ev_to_revenue: 'Valuation',

  // Price & Volume
  price_52w_high_dist: 'Price & Volume', price_52w_low_dist: 'Price & Volume',
  price_return_1m: 'Price & Volume', price_return_3m: 'Price & Volume',
  price_return_6m: 'Price & Volume', price_return_1y: 'Price & Volume',
  price_return_3y: 'Price & Volume', volume_surge_20d: 'Price & Volume',

  // Technical
  rsi_14: 'Technical', macd_signal: 'Technical', macd_line: 'Technical',
  macd_histogram: 'Technical', ema_crossover: 'Technical', bb_position: 'Technical',
  adx_14: 'Technical', stochastic_k: 'Technical', obv_trend: 'Technical',
  ema20_dev: 'Technical', ema50_dev: 'Technical', ema200_dev: 'Technical',
  sma10_dev: 'Technical', sma20_dev: 'Technical', sma50_dev: 'Technical',
  sma100_dev: 'Technical', sma200_dev: 'Technical',
  sharpe_ratio: 'Technical', max_drawdown_1y: 'Technical', volatility: 'Technical',
  return_1y_ann: 'Technical', rvol: 'Technical',
  avg_volume_20d: 'Price & Volume', avg_volume_3m: 'Price & Volume',

  // Ownership
  promoter_holding: 'Ownership', promoter_change_3m: 'Ownership',
  fii_holding: 'Ownership', fii_change_3m: 'Ownership',
  dii_holding: 'Ownership', mf_holding: 'Ownership', mf_change_3m: 'Ownership',
  retail_holding: 'Ownership',

  // Income Statement
  revenue: 'Income Statement', ebitda: 'Income Statement', pat: 'Income Statement',
  other_income_ratio: 'Income Statement', tax_rate: 'Income Statement',
  exceptional_items: 'Income Statement',

  // Balance Sheet
  total_assets: 'Balance Sheet', total_debt: 'Balance Sheet', net_debt: 'Balance Sheet',
  book_value_per_share: 'Balance Sheet', cash_and_equivalents: 'Balance Sheet',
  receivables_turnover: 'Balance Sheet', inventory_turnover: 'Balance Sheet',
  gross_block_growth: 'Balance Sheet',

  // Cash Flow
  ocf_val: 'Cash Flow', capex_val: 'Cash Flow', fcf_val: 'Cash Flow',
  fcf_margin: 'Cash Flow', cash_from_investing: 'Cash Flow',
  cash_from_financing: 'Cash Flow', dividends_paid: 'Cash Flow', ocf_to_ebitda: 'Cash Flow',
}

// ─────────────────────────────────────────────────
// FORWARD RETURN COMPUTATION
// ─────────────────────────────────────────────────
function computeForwardReturns(ohlcv, fromDate, horizons = {}) {
  const from = priceAt(ohlcv, fromDate)
  if (!from) return {}
  const returns = {}

  const check = (label, years, months) => {
    const d = new Date(fromDate)
    if (years) d.setFullYear(d.getFullYear() + years)
    if (months) d.setMonth(d.getMonth() + months)
    const to = priceAt(ohlcv, d.toISOString().slice(0, 10))
    // Only count if the found date is within 30 days of target
    if (to && Math.abs(new Date(to.date) - d) < 30 * 86400000) {
      returns[label] = ((to.close - from.close) / from.close) * 100
    }
  }

  check('1M', 0, 1)
  check('3M', 0, 3)
  check('6M', 0, 6)
  check('1Y', 1, 0)
  check('2Y', 2, 0)

  return returns
}

// ─────────────────────────────────────────────────
// RBI RISK-FREE RATE
// ─────────────────────────────────────────────────
function getRiskFreeRates() {
  return {
    '2021-03': 3.30, '2022-03': 3.86, '2023-03': 6.81,
    '2024-03': 7.02, '2025-03': 6.50, '2026-03': 5.32,
  }
}

// ─────────────────────────────────────────────────
// MAIN PIPELINE
// ─────────────────────────────────────────────────
async function main() {
  const opts = parseArgs()
  const co_code = resolveCoCode(opts)
  const cacheDir = resolve(CACHE_DIR, String(co_code))

  if (!existsSync(resolve(cacheDir, 'meta.json'))) {
    console.error(`No cached data for co_code=${co_code}. Run fetch-stock-data.mjs first.`)
    process.exit(1)
  }

  const meta = JSON.parse(readFileSync(resolve(cacheDir, 'meta.json'), 'utf8'))
  console.log('═══════════════════════════════════════════════════════════')
  console.log(`  SCORECARD V1 — Compute All Metrics`)
  console.log(`  Stock: ${meta.symbol} (co_code=${co_code}, ${meta.statementType})`)
  console.log('═══════════════════════════════════════════════════════════')

  // Load data
  const pnlRaw = loadJSON(cacheDir, 'pnl.json')
  const bsRaw = loadJSON(cacheDir, 'bs.json')
  const cfRaw = loadJSON(cacheDir, 'cf.json')
  const quarterlyRaw = loadJSON(cacheDir, 'quarterly.json')
  const shareholding = loadJSON(cacheDir, 'shareholding.json')
  const ohlcvRaw = loadJSON(cacheDir, 'ohlcv.json')

  const PNL = indexStatementRows(pnlRaw)
  const BS = indexStatementRows(bsRaw)
  const CF = indexStatementRows(cfRaw)
  const QR = indexQuarterlyRows(quarterlyRaw)
  const ohlcv = parseOHLCV(ohlcvRaw)
  const yearCols = getYearCols(PNL)
  const rfRates = getRiskFreeRates()

  console.log(`\n  P&L rows: ${Object.keys(PNL).length}, BS rows: ${Object.keys(BS).length}, CF rows: ${Object.keys(CF).length}`)
  console.log(`  Year columns: ${yearCols.join(', ')}`)
  console.log(`  OHLCV records: ${ohlcv.length} (${ohlcv[0]?.date} → ${ohlcv[ohlcv.length - 1]?.date})`)
  console.log(`  Shareholding quarters: ${Array.isArray(shareholding) ? shareholding.length : 0}`)

  // ── Auto-detect Row Mapping ──
  const R = detectRowMapping(PNL, BS, CF)
  console.log('\n  Auto-detected row mapping:')
  const latestYC = yearCols[yearCols.length - 1]
  const keyChecks = [
    ['Revenue', 'pnl_total_revenue', PNL], ['PAT', 'pnl_pat', PNL], ['PAT(attr)', 'pnl_pat_attr', PNL],
    ['EPS', 'pnl_eps', PNL], ['EBITDA', 'pnl_ebitda', PNL], ['DPS', 'pnl_dps', PNL],
    ['TotalAssets', 'bs_total_assets', BS], ['TotalCL', 'bs_total_cl', BS],
    ['ShareholderFund', 'bs_shareholder_fund', BS], ['Shares', 'bs_shares', BS],
    ['OCF', 'cf_ocf', CF], ['CapEx', 'cf_capex', CF],
  ]
  for (const [label, key, stmtMap] of keyChecks) {
    const rn = R[key]
    const row = rn != null ? stmtMap[rn] : null
    const val = row?.values?.[latestYC]
    console.log(`    ${label.padEnd(16)} R${String(rn ?? '?').padEnd(4)} "${(row?.name || 'NOT FOUND').slice(0, 45)}" = ${val ?? 'N/A'}`)
  }

  // ── ANNUAL SNAPSHOTS ──
  console.log('\n[1] Computing annual snapshots...')
  const annualSnapshots = {}

  // Collect historical PE/PB/EV for vs-5Y-avg calculations
  const historicalPE = [], historicalPB = [], historicalEvEbitda = []

  for (let i = 0; i < yearCols.length; i++) {
    const yc = yearCols[i]
    const prevYC = i > 0 ? yearCols[i - 1] : null
    const yr = yc.slice(1, 5), mo = yc.slice(5, 7)
    const fyEndDate = `${yr}-${mo}-28`

    const priceRecord = priceAt(ohlcv, fyEndDate)
    const price = priceRecord?.close ?? null
    const sharesOS = rv(BS, R.bs_shares, yc)

    const rfKey = `${yr}-${mo.padStart(2, '0')}`
    const rf = rfRates[rfKey] ?? rfRates['2026-03']

    // Fundamental metrics
    const fundMetrics = computeFundamentals(PNL, BS, CF, yc, prevYC, yearCols, price, sharesOS, R)

    // Technical metrics (at FY end date)
    const techMetrics = computeTechnicals(ohlcv, fyEndDate, rf)

    // Ownership
    const ownMetrics = computeOwnership(shareholding, fyEndDate)

    // Forward returns
    const fwdReturns = computeForwardReturns(ohlcv, fyEndDate)

    // Earnings momentum from quarterly data (latest Q PAT / same Q last year)
    const qCols = Object.keys(QR[Object.keys(QR)[0]]?.values || {}).filter(k => /^[YQ]\d{6}$/.test(k)).sort()
    if (qCols.length >= 5) {
      const latestQ = qCols[qCols.length - 1]
      const latestQYr = parseInt(latestQ.slice(1, 5))
      const latestQMo = latestQ.slice(5, 7)
      // Find same quarter last year
      const sameQLY = qCols.find(c => c.slice(5, 7) === latestQMo && parseInt(c.slice(1, 5)) === latestQYr - 1)
      if (sameQLY) {
        // Find PAT row in quarterly (rowno 30 or by name match)
        const qPATRow = Object.entries(QR).find(([, e]) => e.name.toLowerCase().includes('net profit after tax'))?.[0]
        if (qPATRow) {
          const currPAT = QR[qPATRow]?.values[latestQ]
          const prevPAT = QR[qPATRow]?.values[sameQLY]
          if (currPAT && prevPAT && prevPAT !== 0) {
            fundMetrics.earnings_momentum = ((currPAT / prevPAT) - 1) * 100
          }
        }
      }
    }

    // Merge all
    const allMetrics = { ...fundMetrics, ...techMetrics, ...ownMetrics }

    // Track historical valuations for vs-5Y-avg
    if (allMetrics.pe_ratio != null) historicalPE.push(allMetrics.pe_ratio)
    if (allMetrics.pb_ratio != null) historicalPB.push(allMetrics.pb_ratio)
    if (allMetrics.ev_ebitda != null) historicalEvEbitda.push(allMetrics.ev_ebitda)

    // Compute vs-5Y-avg (using all available historical data up to this point)
    if (historicalPE.length >= 2 && allMetrics.pe_ratio != null) {
      const avg = historicalPE.reduce((a, b) => a + b, 0) / historicalPE.length
      allMetrics.pe_vs_5y_avg = allMetrics.pe_ratio / avg
    }
    if (historicalPB.length >= 2 && allMetrics.pb_ratio != null) {
      const avg = historicalPB.reduce((a, b) => a + b, 0) / historicalPB.length
      allMetrics.pb_vs_5y_avg = allMetrics.pb_ratio / avg
    }
    if (historicalEvEbitda.length >= 2 && allMetrics.ev_ebitda != null) {
      const avg = historicalEvEbitda.reduce((a, b) => a + b, 0) / historicalEvEbitda.length
      allMetrics.ev_ebitda_vs_5y_avg = allMetrics.ev_ebitda / avg
    }

    const metricCount = Object.keys(allMetrics).filter(k => !k.startsWith('_') && allMetrics[k] != null).length
    console.log(`  ${yc} (${fyEndDate}) | Price: ${price ?? 'N/A'} | Metrics: ${metricCount} | Fwd: ${JSON.stringify(fwdReturns)}`)

    annualSnapshots[yc] = {
      date: fyEndDate,
      price,
      metrics: allMetrics,
      forwardReturns: fwdReturns,
      riskFreeRate: rf,
    }
  }

  // ── MONTHLY TECHNICAL SNAPSHOTS ──
  console.log('\n[2] Computing monthly technical snapshots...')
  const monthlySnapshots = []
  const monthEnds = {}
  for (const r of ohlcv) {
    const ym = r.date.slice(0, 7)
    monthEnds[ym] = r
  }

  for (const ym of Object.keys(monthEnds).sort()) {
    const r = monthEnds[ym]
    const rfKey = `${ym.slice(0, 4)}-03`
    const rf = rfRates[rfKey] ?? rfRates['2026-03']
    const techMetrics = computeTechnicals(ohlcv, r.date, rf)
    const ownMetrics = computeOwnership(shareholding, r.date)
    const fwdReturns = computeForwardReturns(ohlcv, r.date)

    monthlySnapshots.push({
      date: r.date,
      price: r.close,
      metrics: { ...techMetrics, ...ownMetrics },
      forwardReturns: fwdReturns,
    })
  }
  console.log(`  Monthly snapshots: ${monthlySnapshots.length}`)

  // ── SUMMARY ──
  // Count unique non-underscore metrics across all snapshots
  const allMetricNames = new Set()
  for (const snap of Object.values(annualSnapshots)) {
    for (const k of Object.keys(snap.metrics)) {
      if (!k.startsWith('_') && snap.metrics[k] != null) allMetricNames.add(k)
    }
  }
  for (const snap of monthlySnapshots) {
    for (const k of Object.keys(snap.metrics)) {
      if (!k.startsWith('_') && snap.metrics[k] != null) allMetricNames.add(k)
    }
  }

  // Count by segment
  const segmentCounts = {}
  for (const name of allMetricNames) {
    const seg = SEGMENT_MAP[name] || 'Unmapped'
    segmentCounts[seg] = (segmentCounts[seg] || 0) + 1
  }

  console.log(`\n  TOTAL UNIQUE METRICS: ${allMetricNames.size}`)
  console.log('  By segment:')
  for (const [seg, count] of Object.entries(segmentCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${seg.padEnd(20)} ${count}`)
  }

  // ── Save Results ──
  const resultsDir = resolve(RESULTS_DIR, String(co_code))
  mkdirSync(resultsDir, { recursive: true })

  const output = {
    stock: {
      co_code: parseInt(co_code),
      symbol: meta.symbol,
      name: meta.companyName,
      statementType: meta.statementType,
    },
    generatedAt: new Date().toISOString(),
    riskFreeRates: rfRates,
    ohlcvRange: { from: ohlcv[0]?.date, to: ohlcv[ohlcv.length - 1]?.date, count: ohlcv.length },
    metricCount: allMetricNames.size,
    segmentCounts,
    segmentMap: SEGMENT_MAP,
    annualSnapshots,
    monthlySnapshots,
  }

  const outPath = resolve(resultsDir, 'all-metrics.json')
  writeFileSync(outPath, JSON.stringify(output, null, 2))

  console.log(`\n  Results saved: ${outPath}`)
  console.log('═══════════════════════════════════════════════════════════')
  console.log('  COMPUTE COMPLETE')
  console.log('═══════════════════════════════════════════════════════════')
}

main().catch(e => {
  console.error('Fatal error:', e)
  process.exit(1)
})
