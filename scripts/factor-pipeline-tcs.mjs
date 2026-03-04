/**
 * Factor Model Pipeline — Single-Stock Longitudinal Analysis
 *
 * Uses already-downloaded data from /tmp/tcs-api-dump/ (CMOTS co_code=476 = Reliance)
 * to compute ~50 metrics at each annual snapshot, correlate with forward returns,
 * and rank metrics by predictive power.
 *
 * Zero new API calls except one RBI scrape for current 91-day T-bill yield.
 *
 * Usage: node scripts/factor-pipeline-tcs.mjs
 */

import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'

// ─────────────────────────────────────────────────
// 1. DATA LOADING
// ─────────────────────────────────────────────────

const DATA_DIR = '/tmp/tcs-api-dump'

function loadJSON(file) {
  const raw = JSON.parse(readFileSync(`${DATA_DIR}/${file}`, 'utf8'))
  if (raw && typeof raw === 'object' && !Array.isArray(raw) && 'data' in raw) return raw.data
  return raw
}

const ttm        = loadJSON('ttm.json')
const findata    = loadJSON('findata.json')
const pnl        = loadJSON('pnl.json')
const bs         = loadJSON('bs.json')
const cf         = loadJSON('cf.json')
const quarterly  = loadJSON('quarterly.json')
const shareholding = loadJSON('shareholding.json')
const ohlcvRaw   = loadJSON('ohlcv.json')
const indianapi  = loadJSON('indianapi.json')

// ─────────────────────────────────────────────────
// 2. PARSE & INDEX DATA
// ─────────────────────────────────────────────────

/** Index statement rows by rowno → { Y202103: val, Y202203: val, ... } */
function indexStatementRows(rows) {
  const map = {}
  for (const row of rows) {
    const rn = row.rowno ?? row.RowNo
    if (rn == null) continue
    // Handle duplicate rownos (take first occurrence)
    if (map[rn]) continue
    const yearVals = {}
    for (const [k, v] of Object.entries(row)) {
      if (/^Y\d{6}$/.test(k)) yearVals[k] = v ?? 0
    }
    map[rn] = { name: (row.COLUMNNAME || row.rowdesc || '').trim(), values: yearVals }
  }
  return map
}

const PNL = indexStatementRows(pnl)
const BS  = indexStatementRows(bs)
const CF  = indexStatementRows(cf)

/** Get year columns sorted ascending */
function getYearCols(stmtMap) {
  const sample = Object.values(stmtMap)[0]
  if (!sample) return []
  return Object.keys(sample.values).sort()
}

const yearCols = getYearCols(PNL) // e.g., ['Y202103', 'Y202203', ...]

/** Get value from statement row at a year column */
function rv(stmtMap, rowno, yearCol) {
  return stmtMap[rowno]?.values?.[yearCol] ?? null
}

/** Parse OHLCV into sorted date-price array */
function parseOHLCV(data) {
  const records = data.map(r => ({
    date:   (r.Tradedate || r.tradedate || '').slice(0, 10),
    open:   r.DayOpen || r.dayopen || 0,
    high:   r.DayHigh || r.dayhigh || 0,
    low:    r.Daylow  || r.daylow  || 0,
    close:  r.Dayclose || r.dayclose || 0,
    volume: r.TotalVolume || r.totalvolume || 0,
    value:  r.TotalValue || r.totalvalue || 0,
    mcap:   r.DMCAP || r.dmcap || 0,
  }))
  // Sort ascending by date
  records.sort((a, b) => a.date.localeCompare(b.date))
  return records
}

const ohlcv = parseOHLCV(ohlcvRaw)

/** Find closest OHLCV record to a target date (YYYY-MM-DD) */
function priceAt(targetDate) {
  // Binary search for closest date
  let best = null
  let bestDiff = Infinity
  for (const r of ohlcv) {
    const diff = Math.abs(new Date(r.date) - new Date(targetDate))
    if (diff < bestDiff) { bestDiff = diff; best = r }
  }
  return best
}

/** Get price series (close prices) up to a target date */
function priceSeriesUpTo(targetDate, maxDays = 300) {
  const target = new Date(targetDate)
  const filtered = ohlcv.filter(r => new Date(r.date) <= target)
  return filtered.slice(-maxDays)
}

// ─────────────────────────────────────────────────
// 3. RISK-FREE RATE (RBI 91-Day T-Bill)
// ─────────────────────────────────────────────────

/**
 * Fetch current 91-day T-bill yield from RBI WSS page.
 * Historical values from RBI published auction data.
 */
async function getRiskFreeRates() {
  // Historical 91-day T-bill yields (source: RBI Weekly Statistical Supplement)
  // These are March-end values for each FY
  const historical = {
    '2021-03': 3.30,  // COVID-era low, Repo rate 4.00%
    '2022-03': 3.86,  // Repo still 4.00%, pre-hike cycle
    '2023-03': 6.81,  // Post aggressive hikes, Repo 6.50%
    '2024-03': 7.02,  // Peak rate cycle, Repo 6.50%
    '2025-03': 6.50,  // Easing began, Repo cut to 6.25% Feb 2025
  }

  // Scrape current from RBI WSS
  let current = 5.32 // fallback
  try {
    const html = execSync(
      'curl -sL "https://www.rbi.org.in/scripts/BS_NSDPDisplay.aspx?param=4" --max-time 15',
      { encoding: 'utf8', timeout: 20000 }
    )
    const match = html.match(/91-Day Treasury Bill.*?<\/tr>/s)
    if (match) {
      const tds = [...match[0].matchAll(/<td[^>]*>(.*?)<\/td>/gs)]
        .map(m => m[1].trim())
        .filter(v => v && v !== '..' && !isNaN(parseFloat(v)))
      if (tds.length > 0) {
        current = parseFloat(tds[tds.length - 1]) // latest value
        console.log(`  RBI 91-Day T-Bill (live scrape): ${current}%`)
      }
    }
  } catch (e) {
    console.log(`  RBI scrape failed, using fallback: ${current}%`)
  }

  historical['2026-03'] = current
  return historical
}

// ─────────────────────────────────────────────────
// 4. TECHNICAL INDICATOR CALCULATIONS
// ─────────────────────────────────────────────────

/** EMA calculation (matching src/lib/technicalCalc.ts) */
function ema(prices, period) {
  if (prices.length < period) return []
  const k = 2 / (period + 1)
  const result = []
  let sma = 0
  for (let i = 0; i < period; i++) sma += prices[i]
  sma /= period
  result.push(sma)
  let prev = sma
  for (let i = period; i < prices.length; i++) {
    const val = prices[i] * k + prev * (1 - k)
    result.push(val)
    prev = val
  }
  return result
}

/** SMA calculation */
function sma(prices, period) {
  if (prices.length < period) return []
  const result = []
  for (let i = period - 1; i < prices.length; i++) {
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) sum += prices[j]
    result.push(sum / period)
  }
  return result
}

/** RSI (14-period, matching src/lib/technicalCalc.ts) */
function rsi(prices, period = 14) {
  if (prices.length < period + 1) return null
  let avgGain = 0, avgLoss = 0
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1]
    if (diff > 0) avgGain += diff
    else avgLoss += Math.abs(diff)
  }
  avgGain /= period
  avgLoss /= period
  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1]
    const gain = diff > 0 ? diff : 0
    const loss = diff < 0 ? Math.abs(diff) : 0
    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period
  }
  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return 100 - (100 / (1 + rs))
}

/** MACD: returns { macd, signal, histogram } at last point */
function macd(prices) {
  const ema12 = ema(prices, 12)
  const ema26 = ema(prices, 26)
  if (ema12.length === 0 || ema26.length === 0) return null
  // Align: ema26 starts later
  const offset = ema12.length - ema26.length
  const macdLine = []
  for (let i = 0; i < ema26.length; i++) {
    macdLine.push(ema12[i + offset] - ema26[i])
  }
  const signal = ema(macdLine, 9)
  if (signal.length === 0) return null
  const macdVal = macdLine[macdLine.length - 1]
  const signalVal = signal[signal.length - 1]
  return { macd: macdVal, signal: signalVal, histogram: macdVal - signalVal }
}

/** Bollinger Band %B */
function bollingerB(prices, period = 20) {
  const smaVals = sma(prices, period)
  if (smaVals.length === 0) return null
  const lastSMA = smaVals[smaVals.length - 1]
  // Compute std dev of last `period` prices
  const recent = prices.slice(-period)
  const mean = recent.reduce((a, b) => a + b, 0) / recent.length
  const variance = recent.reduce((a, b) => a + (b - mean) ** 2, 0) / recent.length
  const std = Math.sqrt(variance)
  if (std === 0) return 0.5
  const upper = lastSMA + 2 * std
  const lower = lastSMA - 2 * std
  return (prices[prices.length - 1] - lower) / (upper - lower)
}

/** Max drawdown over a price series */
function maxDrawdown(prices) {
  let peak = prices[0]
  let maxDD = 0
  for (const p of prices) {
    if (p > peak) peak = p
    const dd = (peak - p) / peak
    if (dd > maxDD) maxDD = dd
  }
  return -maxDD * 100 // negative percentage
}

/** Annualized return from daily prices */
function annualizedReturn(prices) {
  if (prices.length < 2) return null
  const total = prices[prices.length - 1] / prices[0] - 1
  const days = prices.length
  return ((1 + total) ** (252 / days) - 1) * 100
}

/** Annualized volatility from daily prices */
function annualizedVolatility(prices) {
  if (prices.length < 2) return null
  const returns = []
  for (let i = 1; i < prices.length; i++) {
    returns.push(Math.log(prices[i] / prices[i - 1]))
  }
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / (returns.length - 1)
  return Math.sqrt(variance) * Math.sqrt(252) * 100
}

/** Sharpe ratio (annualized) */
function sharpeRatio(prices, riskFreeRate) {
  const ret = annualizedReturn(prices)
  const vol = annualizedVolatility(prices)
  if (ret === null || vol === null || vol === 0) return null
  return (ret - riskFreeRate) / vol
}

// ─────────────────────────────────────────────────
// 5. FUNDAMENTAL METRIC COMPUTATION
// ─────────────────────────────────────────────────

/** Compute all fundamental metrics at a given FY year column */
function computeFundamentals(yearCol, prevYearCol, price) {
  const metrics = {}

  // ── P&L values ──
  const revenue     = rv(PNL, 10, yearCol)  // Total Revenue
  const revFromOps  = rv(PNL, 1, yearCol)   // Revenue from Operations
  const cogs        = rv(PNL, 12, yearCol)  // Cost of Material Consumed
  const employeeCost= rv(PNL, 15, yearCol)  // Employee Benefits
  const otherExp    = rv(PNL, 16, yearCol)  // Total Other Expenses
  const financeCosts= rv(PNL, 20, yearCol)  // Finance Costs
  const da          = rv(PNL, 21, yearCol)  // Depreciation & Amortization
  const totalExp    = rv(PNL, 22, yearCol)  // Total Expenses
  const pbt         = rv(PNL, 28, yearCol)  // Profit Before Tax
  const tax         = rv(PNL, 29, yearCol)  // Taxation
  const pat         = rv(PNL, 35, yearCol)  // Profit After Tax
  const eps         = rv(PNL, 44, yearCol)  // EPS - Basic
  const ebitda      = rv(PNL, 46, yearCol)  // EBITDA
  const dps         = rv(PNL, 48, yearCol)  // Dividend Per Share
  const otherIncome = rv(PNL, 9, yearCol)   // Other Income

  // ── Balance Sheet values ──
  const fixedAssets   = rv(BS, 2, yearCol)
  const inventory     = rv(BS, 25, yearCol)
  const currentInv    = rv(BS, 27, yearCol)
  const cash          = rv(BS, 29, yearCol) ?? rv(BS, 28, yearCol)
  const tradeRecv     = rv(BS, 31, yearCol)
  const totalCA       = rv(BS, 41, yearCol)
  const totalAssets   = rv(BS, 42, yearCol)
  const stBorrowings  = rv(BS, 44, yearCol)
  const tradePay      = rv(BS, 46, yearCol)
  const totalCL       = rv(BS, 55, yearCol)
  const ltBorrowings  = rv(BS, 58, yearCol)
  const totalNCL      = rv(BS, 71, yearCol)
  const shareholderFund = rv(BS, 80, yearCol)
  const sharesOutstanding = rv(BS, 91, yearCol)

  // ── Cash Flow values ──
  const ocf         = rv(CF, 68, yearCol)
  const capex       = rv(CF, 72, yearCol)   // Negative (purchase of fixed assets)
  const cashInvesting = rv(CF, 94, yearCol)
  const divPaid     = rv(CF, 124, yearCol)
  const cashFinancing = rv(CF, 129, yearCol)

  // ══ PROFITABILITY ══
  if (pat && shareholderFund && shareholderFund !== 0)
    metrics.roe = (pat / shareholderFund) * 100
  if (pat && totalAssets && totalAssets !== 0)
    metrics.roa = (pat / totalAssets) * 100
  if (pat && revenue && revenue !== 0)
    metrics.net_profit_margin = (pat / revenue) * 100
  if (ebitda && revenue && revenue !== 0)
    metrics.operating_margin = (ebitda / revenue) * 100
  if (ocf && revenue && revenue !== 0)
    metrics.cash_flow_margin = (ocf / revenue) * 100
  if (pbt && financeCosts && totalAssets && totalCL) {
    const capitalEmployed = totalAssets - totalCL
    if (capitalEmployed !== 0)
      metrics.roce = ((pbt + financeCosts) / capitalEmployed) * 100
  }

  // ══ FINANCIAL RATIOS ══
  if (totalCA && totalCL && totalCL !== 0)
    metrics.current_ratio = totalCA / totalCL
  if (stBorrowings != null && ltBorrowings != null && shareholderFund && shareholderFund !== 0)
    metrics.debt_to_equity = (stBorrowings + ltBorrowings) / shareholderFund
  if (ebitda && financeCosts && financeCosts !== 0)
    metrics.interest_coverage = ebitda / financeCosts
  if (tradeRecv && revenue && revenue !== 0)
    metrics.dso = (tradeRecv / revenue) * 365
  if (inventory && cogs && cogs !== 0)
    metrics.dio = (inventory / cogs) * 365
  if (tradePay && cogs && cogs !== 0)
    metrics.dpo = (tradePay / cogs) * 365
  if (metrics.dio != null && metrics.dso != null && metrics.dpo != null)
    metrics.cash_conversion_cycle = metrics.dio + metrics.dso - metrics.dpo
  if (revenue && totalAssets && totalAssets !== 0)
    metrics.asset_turnover = revenue / totalAssets
  if (ebitda && ebitda !== 0)
    metrics.debt_to_ebitda = (stBorrowings + ltBorrowings) / ebitda
  if (ocf && ebitda && ebitda !== 0)
    metrics.ocf_to_ebitda = (ocf / ebitda) * 100

  // ══ GROWTH (YoY vs prev year) ══
  if (prevYearCol) {
    const prevRev    = rv(PNL, 10, prevYearCol)
    const prevEBITDA = rv(PNL, 46, prevYearCol)
    const prevPAT    = rv(PNL, 35, prevYearCol)
    const prevEPS    = rv(PNL, 44, prevYearCol)
    const prevOCF    = rv(CF, 68, prevYearCol)

    if (prevRev && prevRev !== 0)
      metrics.revenue_growth = ((revenue - prevRev) / Math.abs(prevRev)) * 100
    if (prevEBITDA && prevEBITDA !== 0)
      metrics.ebitda_growth = ((ebitda - prevEBITDA) / Math.abs(prevEBITDA)) * 100
    if (prevPAT && prevPAT !== 0)
      metrics.pat_growth = ((pat - prevPAT) / Math.abs(prevPAT)) * 100
    if (prevEPS && prevEPS !== 0)
      metrics.eps_growth = ((eps - prevEPS) / Math.abs(prevEPS)) * 100
    if (prevOCF && prevOCF !== 0)
      metrics.ocf_growth = ((ocf - prevOCF) / Math.abs(prevOCF)) * 100
  }

  // ══ VALUATION (need price) ══
  if (price && eps && eps > 0)
    metrics.pe_ratio = price / eps
  if (price && shareholderFund && sharesOutstanding && sharesOutstanding > 0) {
    const bvps = (shareholderFund * 1e7) / sharesOutstanding
    if (bvps > 0) metrics.pb_ratio = price / bvps
  }
  if (price && dps)
    metrics.dividend_yield = (dps / price) * 100
  if (dps && eps && eps > 0)
    metrics.payout_ratio = (dps / eps) * 100
  if (price && ebitda && ebitda > 0 && sharesOutstanding) {
    const mcap = (price * sharesOutstanding) / 1e7
    const netDebt = (stBorrowings || 0) + (ltBorrowings || 0) - (cash || 0) - (currentInv || 0)
    const ev = mcap + netDebt
    metrics.ev_ebitda = ev / ebitda
    if (revenue && revenue > 0) metrics.ev_revenue = ev / revenue
    if (ebitda - da !== 0) metrics.ev_ebit = ev / (ebitda - da)
    metrics.enterprise_value = ev
  }

  // ══ CASH FLOW ══
  metrics.ocf = ocf
  metrics.capex = capex ? Math.abs(capex) : null
  metrics.fcf = (ocf != null && capex != null) ? ocf + capex : null // capex is negative
  metrics.cash_from_investing = cashInvesting
  metrics.cash_from_financing = cashFinancing
  metrics.dividends_paid = divPaid ? Math.abs(divPaid) : null

  // ══ RAW VALUES for reference ══
  metrics._revenue = revenue
  metrics._ebitda = ebitda
  metrics._pat = pat
  metrics._eps = eps
  metrics._dps = dps
  metrics._total_assets = totalAssets
  metrics._total_equity = shareholderFund
  metrics._total_debt = (stBorrowings || 0) + (ltBorrowings || 0)

  return metrics
}

/** Compute technical metrics at a snapshot date */
function computeTechnicals(targetDate, rfRate) {
  const series = priceSeriesUpTo(targetDate, 300)
  if (series.length < 30) return {}

  const closes = series.map(r => r.close)
  const volumes = series.map(r => r.volume)
  const metrics = {}

  // RSI
  metrics.rsi_14 = rsi(closes)

  // EMAs
  const ema20  = ema(closes, 20)
  const ema50  = ema(closes, 50)
  const ema200 = ema(closes, 200)
  const lastPrice = closes[closes.length - 1]

  if (ema20.length > 0)
    metrics.ema20_dev = ((lastPrice - ema20[ema20.length - 1]) / ema20[ema20.length - 1]) * 100
  if (ema50.length > 0)
    metrics.ema50_dev = ((lastPrice - ema50[ema50.length - 1]) / ema50[ema50.length - 1]) * 100
  if (ema200.length > 0)
    metrics.ema200_dev = ((lastPrice - ema200[ema200.length - 1]) / ema200[ema200.length - 1]) * 100

  // SMAs
  for (const p of [10, 20, 50, 100, 200]) {
    const s = sma(closes, p)
    if (s.length > 0)
      metrics[`sma${p}_dev`] = ((lastPrice - s[s.length - 1]) / s[s.length - 1]) * 100
  }

  // MACD
  const m = macd(closes)
  if (m) {
    metrics.macd_line = m.macd
    metrics.macd_signal = m.signal
    metrics.macd_histogram = m.histogram
  }

  // Bollinger Band %B
  const bb = bollingerB(closes)
  if (bb !== null) metrics.bollinger_pctb = bb

  // Volume metrics
  if (volumes.length >= 20) {
    const avg20 = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20
    metrics.avg_volume_20d = avg20
    if (volumes.length >= 60) {
      const avg60 = volumes.slice(-60).reduce((a, b) => a + b, 0) / 60
      metrics.avg_volume_3m = avg60
      if (avg60 > 0) metrics.rvol = avg20 / avg60
    }
  }

  // Sharpe Ratio (1Y rolling)
  const prices1Y = closes.slice(-252)
  if (prices1Y.length >= 100) {
    metrics.sharpe_ratio = sharpeRatio(prices1Y, rfRate || 6.5)
  }

  // Max Drawdown (1Y)
  metrics.max_drawdown_1y = maxDrawdown(prices1Y)

  // Annualized Volatility
  metrics.volatility = annualizedVolatility(closes.slice(-252))

  // Annualized Return (1Y)
  metrics.return_1y = annualizedReturn(prices1Y)

  return metrics
}

/** Compute ownership metrics at closest quarter */
function computeOwnership(targetDate) {
  if (!Array.isArray(shareholding) || shareholding.length === 0) return {}

  // Find closest quarter to target date
  // YRC format: YYYYMM (e.g., 202503 = March 2025)
  const targetYM = parseInt(targetDate.slice(0, 4) + targetDate.slice(5, 7))
  let best = null, bestDiff = Infinity
  for (const q of shareholding) {
    const yrc = q.YRC || q.yrc
    const diff = Math.abs(yrc - targetYM)
    if (diff < bestDiff) { bestDiff = diff; best = q }
  }

  if (!best) return {}

  const metrics = {
    promoter_holding: best.Promoters,
    fii_holding: best.ForeignInstitution,
    mf_holding: best.MutualFund,
    dii_holding: (best.MutualFund || 0) + (best.OtherDomesticInstitution || 0),
    retail_holding: best.Retail,
  }

  // Find previous quarter for change computation
  const sorted = [...shareholding].sort((a, b) => (b.YRC || b.yrc) - (a.YRC || a.yrc))
  const currIdx = sorted.findIndex(q => q === best)
  if (currIdx >= 0 && currIdx + 1 < sorted.length) {
    const prev = sorted[currIdx + 1]
    metrics.promoter_change_qoq = best.Promoters - prev.Promoters
    metrics.fii_change_qoq = best.ForeignInstitution - prev.ForeignInstitution
    metrics.mf_change_qoq = best.MutualFund - prev.MutualFund
  }

  return metrics
}

// ─────────────────────────────────────────────────
// 6. FORWARD RETURN COMPUTATION
// ─────────────────────────────────────────────────

function computeForwardReturns(fromDate) {
  const from = priceAt(fromDate)
  if (!from) return {}

  const returns = {}

  // 1Y forward
  const d1y = new Date(fromDate)
  d1y.setFullYear(d1y.getFullYear() + 1)
  const to1y = priceAt(d1y.toISOString().slice(0, 10))
  if (to1y) returns['1Y'] = ((to1y.close - from.close) / from.close) * 100

  // 2Y forward
  const d2y = new Date(fromDate)
  d2y.setFullYear(d2y.getFullYear() + 2)
  const to2y = priceAt(d2y.toISOString().slice(0, 10))
  if (to2y) returns['2Y'] = ((to2y.close - from.close) / from.close) * 100

  // 5Y forward
  const d5y = new Date(fromDate)
  d5y.setFullYear(d5y.getFullYear() + 5)
  const to5y = priceAt(d5y.toISOString().slice(0, 10))
  if (to5y) returns['5Y'] = ((to5y.close - from.close) / from.close) * 100

  return returns
}

// ─────────────────────────────────────────────────
// 7. CORRELATION ANALYSIS
// ─────────────────────────────────────────────────

function pearson(x, y) {
  const n = x.length
  if (n < 3) return null
  const mx = x.reduce((a, b) => a + b, 0) / n
  const my = y.reduce((a, b) => a + b, 0) / n
  let num = 0, dx2 = 0, dy2 = 0
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx
    const dy = y[i] - my
    num += dx * dy
    dx2 += dx * dx
    dy2 += dy * dy
  }
  const denom = Math.sqrt(dx2 * dy2)
  return denom === 0 ? 0 : num / denom
}

function spearman(x, y) {
  const n = x.length
  if (n < 3) return null
  // Rank
  const rank = arr => {
    const sorted = [...arr].map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v)
    const ranks = new Array(n)
    for (let i = 0; i < n; i++) ranks[sorted[i].i] = i + 1
    return ranks
  }
  return pearson(rank(x), rank(y))
}

// ─────────────────────────────────────────────────
// 8. MAIN PIPELINE
// ─────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('  FACTOR MODEL PIPELINE — co_code 476 (Reliance Industries)')
  console.log('  Longitudinal Single-Stock Analysis')
  console.log('═══════════════════════════════════════════════════════════════')

  // ── Step 1: Risk-Free Rate ──
  console.log('\n[1] Fetching risk-free rate from RBI...')
  const rfRates = await getRiskFreeRates()
  console.log('  Historical 91-Day T-Bill Yields:')
  for (const [k, v] of Object.entries(rfRates).sort()) {
    console.log(`    ${k}: ${v}%`)
  }

  // ── Step 2: OHLCV Summary ──
  console.log(`\n[2] OHLCV data: ${ohlcv.length} records`)
  console.log(`    Date range: ${ohlcv[0]?.date} → ${ohlcv[ohlcv.length - 1]?.date}`)

  // ── Step 3: Compute metrics at each FY snapshot ──
  console.log('\n[3] Computing metrics at annual snapshots...')

  const snapshots = {}

  for (let i = 0; i < yearCols.length; i++) {
    const yc = yearCols[i]
    const prevYC = i > 0 ? yearCols[i - 1] : null

    // FY end date: Y202103 → 2021-03-31
    const yr = yc.slice(1, 5)
    const mo = yc.slice(5, 7)
    const fyEndDate = `${yr}-${mo}-28` // approximate last trading day

    // Get price at FY end
    const priceRecord = priceAt(fyEndDate)
    const price = priceRecord?.close ?? null

    console.log(`\n  ── ${yc} (FY End ~${fyEndDate}) | Price: ${price ?? 'N/A'} ──`)

    // Fundamental metrics
    const fundMetrics = computeFundamentals(yc, prevYC, price)

    // Risk-free rate for this period
    const rfKey = `${yr}-${mo}`
    const rf = rfRates[rfKey] ?? rfRates['2026-03']

    // Technical metrics
    const techMetrics = computeTechnicals(fyEndDate, rf)

    // Ownership metrics
    const ownMetrics = computeOwnership(fyEndDate)

    // Forward returns
    const fwdReturns = computeForwardReturns(fyEndDate)

    const allMetrics = { ...fundMetrics, ...techMetrics, ...ownMetrics }

    // Print summary
    const metricCount = Object.keys(allMetrics).filter(k => !k.startsWith('_') && allMetrics[k] != null).length
    console.log(`    Metrics computed: ${metricCount}`)
    console.log(`    Forward returns: ${JSON.stringify(fwdReturns)}`)

    // Print key metrics
    const keyOnes = ['roe', 'roa', 'operating_margin', 'current_ratio', 'debt_to_equity',
                     'pe_ratio', 'pb_ratio', 'ev_ebitda', 'revenue_growth', 'ebitda_growth',
                     'rsi_14', 'ema50_dev', 'sharpe_ratio', 'promoter_holding', 'fii_holding']
    for (const k of keyOnes) {
      if (allMetrics[k] != null) {
        console.log(`    ${k}: ${typeof allMetrics[k] === 'number' ? allMetrics[k].toFixed(2) : allMetrics[k]}`)
      }
    }

    snapshots[yc] = {
      date: fyEndDate,
      price,
      metrics: allMetrics,
      forwardReturns: fwdReturns,
      riskFreeRate: rf,
    }
  }

  // ── Step 4: Monthly Technical Snapshots ──
  console.log('\n[4] Computing monthly technical snapshots for finer-grained correlation...')

  const monthlySnapshots = []
  // Get month-end dates from OHLCV
  const monthEnds = {}
  for (const r of ohlcv) {
    const ym = r.date.slice(0, 7)
    monthEnds[ym] = r // last record of each month (data is sorted ascending)
  }

  const monthKeys = Object.keys(monthEnds).sort()
  for (const ym of monthKeys) {
    const r = monthEnds[ym]
    const rfKey = `${ym.slice(0, 4)}-03`
    const rf = rfRates[rfKey] ?? rfRates['2026-03']
    const techMetrics = computeTechnicals(r.date, rf)
    const fwdReturns = computeForwardReturns(r.date)

    monthlySnapshots.push({
      date: r.date,
      price: r.close,
      metrics: techMetrics,
      forwardReturns: fwdReturns,
    })
  }

  console.log(`  Monthly snapshots: ${monthlySnapshots.length}`)

  // ── Step 5: Correlation Analysis ──
  console.log('\n[5] Computing correlations...')

  const correlations = {}
  const horizons = ['1Y', '2Y', '5Y']

  // A. Annual fundamental correlations (N=5, low power but directional)
  console.log('\n  ── A. Annual Fundamental Metric Correlations ──')
  const annualKeys = Object.keys(snapshots).sort()

  for (const horizon of horizons) {
    correlations[`annual_${horizon}`] = {}

    // Get all metric names that appear in at least 3 snapshots
    const allMetricNames = new Set()
    for (const k of annualKeys) {
      for (const mk of Object.keys(snapshots[k].metrics)) {
        if (!mk.startsWith('_')) allMetricNames.add(mk)
      }
    }

    for (const metricName of allMetricNames) {
      const xs = [], ys = []
      for (const k of annualKeys) {
        const mv = snapshots[k].metrics[metricName]
        const rv = snapshots[k].forwardReturns[horizon]
        if (mv != null && rv != null && isFinite(mv) && isFinite(rv)) {
          xs.push(mv)
          ys.push(rv)
        }
      }
      if (xs.length >= 3) {
        const p = pearson(xs, ys)
        const s = spearman(xs, ys)
        correlations[`annual_${horizon}`][metricName] = {
          pearson: p ? +p.toFixed(4) : null,
          spearman: s ? +s.toFixed(4) : null,
          n: xs.length,
          direction: p > 0 ? 'positive' : 'negative',
        }
      }
    }
  }

  // B. Monthly technical correlations (higher N)
  console.log('  ── B. Monthly Technical Metric Correlations ──')

  for (const horizon of ['1Y']) { // Only 1Y has enough data for monthly
    correlations[`monthly_${horizon}`] = {}

    const allTechMetrics = new Set()
    for (const s of monthlySnapshots) {
      for (const mk of Object.keys(s.metrics)) allTechMetrics.add(mk)
    }

    for (const metricName of allTechMetrics) {
      const xs = [], ys = []
      for (const s of monthlySnapshots) {
        const mv = s.metrics[metricName]
        const rv = s.forwardReturns[horizon]
        if (mv != null && rv != null && isFinite(mv) && isFinite(rv)) {
          xs.push(mv)
          ys.push(rv)
        }
      }
      if (xs.length >= 5) {
        const p = pearson(xs, ys)
        const s = spearman(xs, ys)
        correlations[`monthly_${horizon}`][metricName] = {
          pearson: p ? +p.toFixed(4) : null,
          spearman: s ? +s.toFixed(4) : null,
          n: xs.length,
          direction: p > 0 ? 'positive' : 'negative',
        }
      }
    }
  }

  // ── Step 6: Ranking ──
  console.log('\n[6] Ranking metrics by |correlation|...')

  const rankings = {}

  // Segment assignments
  const segmentMap = {
    roe: 'Profitability', roa: 'Profitability', net_profit_margin: 'Profitability',
    operating_margin: 'Profitability', cash_flow_margin: 'Profitability', roce: 'Profitability',
    current_ratio: 'Financial Ratios', debt_to_equity: 'Financial Ratios',
    interest_coverage: 'Financial Ratios', dso: 'Financial Ratios', dio: 'Financial Ratios',
    dpo: 'Financial Ratios', cash_conversion_cycle: 'Financial Ratios',
    asset_turnover: 'Financial Ratios', debt_to_ebitda: 'Financial Ratios',
    ocf_to_ebitda: 'Financial Ratios',
    revenue_growth: 'Growth', ebitda_growth: 'Growth', pat_growth: 'Growth',
    eps_growth: 'Growth', ocf_growth: 'Growth',
    pe_ratio: 'Valuation', pb_ratio: 'Valuation', ev_ebitda: 'Valuation',
    ev_revenue: 'Valuation', ev_ebit: 'Valuation', dividend_yield: 'Valuation',
    payout_ratio: 'Valuation',
    rsi_14: 'Technical', ema20_dev: 'Technical', ema50_dev: 'Technical',
    ema200_dev: 'Technical', macd_line: 'Technical', macd_histogram: 'Technical',
    bollinger_pctb: 'Technical', sharpe_ratio: 'Technical', max_drawdown_1y: 'Technical',
    volatility: 'Technical', rvol: 'Technical', return_1y: 'Technical',
    sma10_dev: 'Technical', sma20_dev: 'Technical', sma50_dev: 'Technical',
    sma100_dev: 'Technical', sma200_dev: 'Technical',
    promoter_holding: 'Ownership', fii_holding: 'Ownership', mf_holding: 'Ownership',
    dii_holding: 'Ownership', retail_holding: 'Ownership',
    promoter_change_qoq: 'Ownership', fii_change_qoq: 'Ownership', mf_change_qoq: 'Ownership',
  }

  for (const [corrKey, metricCorrs] of Object.entries(correlations)) {
    const ranked = Object.entries(metricCorrs)
      .map(([metric, data]) => ({
        metric,
        segment: segmentMap[metric] || 'Other',
        absCorr: Math.abs(data.pearson ?? 0),
        pearson: data.pearson,
        spearman: data.spearman,
        direction: data.direction,
        n: data.n,
      }))
      .sort((a, b) => b.absCorr - a.absCorr)

    rankings[corrKey] = ranked
  }

  // ── Step 7: Segment Importance ──
  console.log('\n[7] Computing segment importance...')

  const segmentImportance = {}
  for (const [corrKey, ranked] of Object.entries(rankings)) {
    const segScores = {}
    const segCounts = {}
    for (const item of ranked) {
      if (!segScores[item.segment]) { segScores[item.segment] = 0; segCounts[item.segment] = 0 }
      segScores[item.segment] += item.absCorr
      segCounts[item.segment]++
    }
    segmentImportance[corrKey] = {}
    for (const [seg, total] of Object.entries(segScores)) {
      segmentImportance[corrKey][seg] = +(total / segCounts[seg]).toFixed(4)
    }
  }

  // ── Output ──
  console.log('\n' + '═'.repeat(65))
  console.log('  RESULTS')
  console.log('═'.repeat(65))

  // Print top metrics per horizon
  for (const [corrKey, ranked] of Object.entries(rankings)) {
    console.log(`\n  ── ${corrKey} — Top 15 Metrics by |Correlation| ──`)
    console.log(`  ${'Rank'.padEnd(5)} ${'Metric'.padEnd(28)} ${'Segment'.padEnd(18)} ${'Pearson'.padEnd(10)} ${'Spearman'.padEnd(10)} ${'Dir'.padEnd(5)} N`)
    console.log('  ' + '─'.repeat(85))
    for (let i = 0; i < Math.min(15, ranked.length); i++) {
      const r = ranked[i]
      console.log(`  ${(i + 1 + '.').padEnd(5)} ${r.metric.padEnd(28)} ${r.segment.padEnd(18)} ${(r.pearson?.toFixed(3) ?? 'N/A').padEnd(10)} ${(r.spearman?.toFixed(3) ?? 'N/A').padEnd(10)} ${r.direction.padEnd(5).slice(0, 4)} ${r.n}`)
    }
  }

  // Print segment importance
  console.log('\n  ── Segment Importance (Avg |Correlation| per segment) ──')
  for (const [corrKey, segs] of Object.entries(segmentImportance)) {
    console.log(`\n  ${corrKey}:`)
    const sorted = Object.entries(segs).sort((a, b) => b[1] - a[1])
    for (const [seg, score] of sorted) {
      const bar = '█'.repeat(Math.round(score * 20))
      console.log(`    ${seg.padEnd(20)} ${score.toFixed(3)}  ${bar}`)
    }
  }

  // API Credit Cost Assessment
  console.log('\n  ── API Credit Cost Assessment ──')
  console.log('  Per stock: 8 CMOTS + 1 IndianAPI = 9 API calls')
  console.log('  Nifty 50:  50 × 9 = 450 calls')
  console.log('  Nifty 200: 200 × 9 = 1,800 calls')
  console.log('  IndianAPI key concern: Rate limits per plan tier')

  // Statistical caveat
  console.log('\n  ── Statistical Caveats ──')
  console.log('  • Annual fundamental correlations: N=3-5 → INSUFFICIENT for significance')
  console.log('  • Monthly technical correlations: N≈48 → borderline useful')
  console.log('  • Single-stock = time-series only, not cross-sectional')
  console.log('  • Minimum for statistical significance: 30+ stocks (Nifty 50 recommended)')
  console.log('  • Correlations shown are DIRECTIONAL only — not statistically validated')

  // Save results
  const output = {
    stock: 'co_code_476_reliance',
    generatedAt: new Date().toISOString(),
    riskFreeRates: rfRates,
    ohlcvRange: { from: ohlcv[0]?.date, to: ohlcv[ohlcv.length - 1]?.date, count: ohlcv.length },
    annualSnapshots: snapshots,
    monthlySnapshotCount: monthlySnapshots.length,
    correlations,
    rankings: Object.fromEntries(
      Object.entries(rankings).map(([k, v]) => [k, v.slice(0, 30)])
    ),
    segmentImportance,
    apiCreditCost: { perStock: 9, nifty50: 450, nifty200: 1800 },
  }

  writeFileSync('/tmp/tcs-factor-results.json', JSON.stringify(output, null, 2))
  console.log('\n  Results saved to: /tmp/tcs-factor-results.json')
  console.log('\n' + '═'.repeat(65))
  console.log('  PIPELINE COMPLETE')
  console.log('═'.repeat(65))
}

main().catch(e => {
  console.error('Fatal error:', e)
  process.exit(1)
})
