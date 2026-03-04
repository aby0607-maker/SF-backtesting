/**
 * Verification Script: EODHD Fundamental Data Depth
 *
 * Tests whether EODHD can provide the fundamental data needed
 * for backtesting Scorecard V4 from 2021. Specifically checks:
 *   1. Quarterly Income Statement depth (for Quarterly Momentum — 18% weight)
 *   2. Annual P&L / Balance Sheet depth (for Financial Score — 30% weight)
 *   3. Data field coverage (ROE, EBITDA, Revenue, EPS, etc.)
 *   4. ISIN → EODHD ticker resolution
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/verify-eodhd-depth.ts
 *
 * Requires .env.local with:
 *   EODHD_API_TOKEN=your_token_here
 *   CMOTS_API_TOKEN=your_token_here   (optional — for comparison)
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ─── Config ────────────────────────────────────────

const EODHD_BASE = 'https://eodhd.com/api'

// Test stocks: name, ISIN, expected EODHD ticker, CMOTS co_code
const TEST_STOCKS = [
  { name: 'TCS', isin: 'INE467B01029', ticker: 'TCS.NSE', coCode: 476 },
  { name: 'Axis Bank', isin: 'INE238A01034', ticker: 'AXISBANK.NSE', coCode: 131 },
  { name: 'Reliance', isin: 'INE002A01018', ticker: 'RELIANCE.NSE', coCode: 6 },
  { name: 'Bharti Airtel', isin: 'INE397D01024', ticker: 'BHARTIARTL.NSE', coCode: 15542 },
  { name: 'Infosys', isin: 'INE009A01021', ticker: 'INFY.NSE', coCode: 95 },
  { name: 'HDFC Bank', isin: 'INE040A01034', ticker: 'HDFCBANK.NSE', coCode: 1245 },
  { name: 'Zomato (Eternal)', isin: 'INE758T01015', ticker: 'ETERNAL.NSE', coCode: 41887 },
]

// V4 scorecard needs data from 2021 with 5Y lookback → needs quarterly data from ~2016+
const BACKTEST_START = '2021-01-01'

// ─── Read tokens from .env.local ───────────────────

const envPath = resolve(__dirname, '..', '.env.local')
let envContent = ''
try {
  envContent = readFileSync(envPath, 'utf-8')
} catch {
  console.error('ERROR: .env.local not found. Create it with EODHD_API_TOKEN=...')
  process.exit(1)
}

const eodhToken = envContent.match(/EODHD_API_TOKEN=(.+)/)?.[1]?.trim()
const cmotsToken = envContent.match(/CMOTS_API_TOKEN=(.+)/)?.[1]?.trim()

if (!eodhToken) {
  console.error('ERROR: EODHD_API_TOKEN not found in .env.local')
  console.error('Get a token from https://eodhd.com/ (Fundamentals plan starts at $59.99/mo)')
  process.exit(1)
}

console.log('─'.repeat(70))
console.log('EODHD Fundamental Data Depth Verification')
console.log('─'.repeat(70))
console.log(`EODHD token: ${eodhToken.slice(0, 8)}...`)
console.log(`CMOTS token: ${cmotsToken ? cmotsToken.slice(0, 8) + '...' : '(not configured)'}`)
console.log(`Test stocks: ${TEST_STOCKS.length}`)
console.log(`Backtest start: ${BACKTEST_START} (need quarterly data from ~2016+)`)
console.log()

// ─── Helper: EODHD fetch ───────────────────────────

async function eodhFetch<T>(endpoint: string): Promise<T | null> {
  const separator = endpoint.includes('?') ? '&' : '?'
  const url = `${EODHD_BASE}${endpoint}${separator}api_token=${eodhToken}&fmt=json`
  try {
    const res = await fetch(url)
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error(`    HTTP ${res.status}: ${text.slice(0, 200)}`)
      return null
    }
    return await res.json() as T
  } catch (err) {
    console.error(`    Network error: ${err instanceof Error ? err.message : err}`)
    return null
  }
}

// ─── Step 1: ISIN → Ticker Resolution ──────────────

interface EODHDSearchResult {
  Code: string
  Exchange: string
  Name: string
  Type: string
  Country: string
  Currency: string
  ISIN: string
  previousClose: number
}

async function verifyTickerResolution(): Promise<Map<string, string>> {
  console.log('STEP 1: ISIN → EODHD Ticker Resolution')
  console.log()

  const isinToTicker = new Map<string, string>()

  for (const stock of TEST_STOCKS) {
    // Try ISIN search via EODHD search API
    const results = await eodhFetch<EODHDSearchResult[]>(`/search/${stock.isin}?type=stock&exchange=NSE`)

    if (!results || results.length === 0) {
      // Fallback: try the expected ticker directly via fundamentals
      console.log(`  ${stock.name.padEnd(20)} ISIN search: no results → trying ${stock.ticker} directly`)
      isinToTicker.set(stock.isin, stock.ticker)
      continue
    }

    const nseMatch = results.find(r => r.Exchange === 'NSE')
    if (nseMatch) {
      const resolvedTicker = `${nseMatch.Code}.NSE`
      console.log(`  ${stock.name.padEnd(20)} ISIN=${stock.isin} → ${resolvedTicker} (${nseMatch.Name})`)
      isinToTicker.set(stock.isin, resolvedTicker)
    } else {
      console.log(`  ${stock.name.padEnd(20)} ISIN=${stock.isin} → No NSE match (${results.length} results, exchanges: ${results.map(r => r.Exchange).join(',')})`)
      isinToTicker.set(stock.isin, stock.ticker) // use expected
    }
  }

  console.log()
  return isinToTicker
}

// ─── Step 2: Quarterly Income Statement Depth ──────

interface QuarterlyRecord {
  date: string
  filing_date: string
  currency_symbol: string
  totalRevenue: string
  grossProfit: string
  ebit: string
  netIncome: string
  [key: string]: string | number | undefined
}

async function verifyQuarterlyDepth(isinToTicker: Map<string, string>): Promise<void> {
  console.log('STEP 2: Quarterly Income Statement Depth')
  console.log('  (Needed for Quarterly Momentum — 18% of V4 score)')
  console.log()

  for (const stock of TEST_STOCKS) {
    const ticker = isinToTicker.get(stock.isin) || stock.ticker
    const data = await eodhFetch<Record<string, QuarterlyRecord>>(
      `/fundamentals/${ticker}?filter=Financials::Income_Statement::quarterly`
    )

    if (!data || typeof data !== 'object') {
      console.log(`  ${stock.name.padEnd(20)} FAIL — no quarterly income data`)
      continue
    }

    const quarters = Object.entries(data).sort(([a], [b]) => a.localeCompare(b))
    const earliest = quarters[0]
    const latest = quarters[quarters.length - 1]

    // Count quarters that have revenue data
    let withRevenue = 0
    let withEBIT = 0
    let withNetIncome = 0

    for (const [, q] of quarters) {
      if (q.totalRevenue && q.totalRevenue !== '0' && q.totalRevenue !== 'None') withRevenue++
      if (q.ebit && q.ebit !== '0' && q.ebit !== 'None') withEBIT++
      if (q.netIncome && q.netIncome !== '0' && q.netIncome !== 'None') withNetIncome++
    }

    // Check if data goes back far enough for 2021 backtest
    const earliestDate = earliest ? earliest[0] : 'N/A'
    const latestDate = latest ? latest[0] : 'N/A'
    const coversBacktest = earliestDate <= BACKTEST_START

    console.log(`  ${stock.name.padEnd(20)} ${quarters.length} quarters (${earliestDate} → ${latestDate})`)
    console.log(`    Revenue: ${withRevenue}q  |  EBIT: ${withEBIT}q  |  NetIncome: ${withNetIncome}q`)
    console.log(`    Covers 2021 backtest: ${coversBacktest ? 'YES' : 'NO — earliest is ' + earliestDate}`)

    // Show sample data for the quarter closest to 2021-01-01
    const q2021 = quarters.find(([date]) => date >= '2020-10-01' && date <= '2021-06-30')
    if (q2021) {
      const [date, vals] = q2021
      console.log(`    Sample (${date}): Revenue=${vals.totalRevenue}, EBIT=${vals.ebit}, NetIncome=${vals.netIncome}`)
    }
  }

  console.log()
}

// ─── Step 3: Annual Statement Depth ────────────────

interface AnnualRecord {
  date: string
  totalRevenue: string
  grossProfit: string
  ebit: string
  netIncome: string
  totalAssets?: string
  totalLiab?: string
  totalStockholderEquity?: string
  [key: string]: string | number | undefined
}

async function verifyAnnualDepth(isinToTicker: Map<string, string>): Promise<void> {
  console.log('STEP 3: Annual Financial Statement Depth')
  console.log('  (Needed for Financial Score — 30% of V4: ROE, growth CAGRs, debt ratios)')
  console.log()

  for (const stock of TEST_STOCKS) {
    const ticker = isinToTicker.get(stock.isin) || stock.ticker

    // Fetch P&L + Balance Sheet in parallel
    const [pnl, bs] = await Promise.all([
      eodhFetch<Record<string, AnnualRecord>>(`/fundamentals/${ticker}?filter=Financials::Income_Statement::yearly`),
      eodhFetch<Record<string, AnnualRecord>>(`/fundamentals/${ticker}?filter=Financials::Balance_Sheet::yearly`),
    ])

    const pnlYears = pnl ? Object.keys(pnl).sort() : []
    const bsYears = bs ? Object.keys(bs).sort() : []

    console.log(`  ${stock.name.padEnd(20)} P&L: ${pnlYears.length}Y (${pnlYears[0] || 'N/A'} → ${pnlYears[pnlYears.length - 1] || 'N/A'})`)
    console.log(`  ${' '.repeat(20)} BS:  ${bsYears.length}Y (${bsYears[0] || 'N/A'} → ${bsYears[bsYears.length - 1] || 'N/A'})`)

    // For V4 scoring at 2021-01-01, we need 5 annual statements → data from ~2016
    const fiveYearsBack = '2016-01-01'
    const pnlCoverage = pnlYears.filter(y => y >= fiveYearsBack && y <= '2021-12-31').length
    const bsCoverage = bsYears.filter(y => y >= fiveYearsBack && y <= '2021-12-31').length
    console.log(`  ${' '.repeat(20)} FYs in 2016-2021: P&L=${pnlCoverage}, BS=${bsCoverage} (need ≥5 for CAGR)`)

    // Check key fields exist
    if (pnl && pnlYears.length > 0) {
      const sampleYear = pnlYears.find(y => y.startsWith('2020') || y.startsWith('2021')) || pnlYears[pnlYears.length - 1]
      const sample = pnl[sampleYear]
      if (sample) {
        console.log(`  ${' '.repeat(20)} Sample P&L (${sampleYear}): Revenue=${sample.totalRevenue}, EBIT=${sample.ebit}, NetIncome=${sample.netIncome}`)
      }
    }

    if (bs && bsYears.length > 0) {
      const sampleYear = bsYears.find(y => y.startsWith('2020') || y.startsWith('2021')) || bsYears[bsYears.length - 1]
      const sample = bs[sampleYear]
      if (sample) {
        console.log(`  ${' '.repeat(20)} Sample BS (${sampleYear}): Equity=${sample.totalStockholderEquity}, Assets=${sample.totalAssets}, Liab=${sample.totalLiab}`)
      }
    }
  }

  console.log()
}

// ─── Step 4: Key Ratio Fields ──────────────────────

async function verifyRatioFields(isinToTicker: Map<string, string>): Promise<void> {
  console.log('STEP 4: Key Ratio / Highlights Fields')
  console.log('  Checking if EODHD provides pre-computed ratios (PE, ROE, ROCE, etc.)')
  console.log()

  // Just check one stock to see what fields are available
  const stock = TEST_STOCKS[0] // TCS
  const ticker = isinToTicker.get(stock.isin) || stock.ticker

  const data = await eodhFetch<Record<string, unknown>>(`/fundamentals/${ticker}?filter=Highlights`)

  if (!data) {
    console.log(`  ${stock.name}: No Highlights data`)
    return
  }

  // Fields that map to V4 scoring needs
  const relevantFields = [
    'MarketCapitalization', 'EBITDA', 'PERatio', 'PEGRatio',
    'BookValue', 'DividendYield', 'EarningsShare', 'ProfitMargin',
    'OperatingMarginTTM', 'ReturnOnAssetsTTM', 'ReturnOnEquityTTM',
    'RevenueTTM', 'RevenuePerShareTTM', 'QuarterlyRevenueGrowthYOY',
    'QuarterlyEarningsGrowthYOY', 'DilutedEpsTTM', 'MostRecentQuarter',
    'WallStreetTargetPrice', 'EPSEstimateCurrentYear',
  ]

  console.log(`  ${stock.name} (${ticker}) — Highlights fields:`)
  for (const field of relevantFields) {
    const val = data[field]
    const status = val !== undefined && val !== null && val !== 0 ? `${val}` : '(empty)'
    console.log(`    ${field.padEnd(35)} ${status}`)
  }

  // Also list any extra fields we didn't expect
  const extraFields = Object.keys(data).filter(k => !relevantFields.includes(k))
  if (extraFields.length > 0) {
    console.log(`\n  Additional fields available (${extraFields.length}):`)
    for (const f of extraFields.slice(0, 15)) {
      console.log(`    ${f.padEnd(35)} ${data[f]}`)
    }
    if (extraFields.length > 15) console.log(`    ... and ${extraFields.length - 15} more`)
  }

  console.log()
}

// ─── Step 5: Cash Flow Depth ───────────────────────

async function verifyCashFlowDepth(isinToTicker: Map<string, string>): Promise<void> {
  console.log('STEP 5: Annual Cash Flow Depth')
  console.log('  (Needed for OCF/EBITDA ratio in Financial Score)')
  console.log()

  // Check a couple stocks
  for (const stock of TEST_STOCKS.slice(0, 3)) {
    const ticker = isinToTicker.get(stock.isin) || stock.ticker
    const data = await eodhFetch<Record<string, Record<string, string>>>(
      `/fundamentals/${ticker}?filter=Financials::Cash_Flow::yearly`
    )

    if (!data) {
      console.log(`  ${stock.name.padEnd(20)} No cash flow data`)
      continue
    }

    const years = Object.keys(data).sort()
    console.log(`  ${stock.name.padEnd(20)} ${years.length}Y (${years[0]} → ${years[years.length - 1]})`)

    // Check for OCF field
    const sampleYear = years.find(y => y.startsWith('2020') || y.startsWith('2021')) || years[years.length - 1]
    const sample = data[sampleYear]
    if (sample) {
      console.log(`    Sample (${sampleYear}): OCF=${sample.totalCashFromOperatingActivities || sample.operatingCashflow || '?'}, CapEx=${sample.capitalExpenditures || '?'}`)
    }
  }

  console.log()
}

// ─── Step 6: CMOTS Quarterly Comparison ────────────

async function compareWithCMOTS(isinToTicker: Map<string, string>): Promise<void> {
  if (!cmotsToken) {
    console.log('STEP 6: CMOTS vs EODHD Quarterly Comparison — SKIPPED (no CMOTS_API_TOKEN)')
    console.log()
    return
  }

  console.log('STEP 6: CMOTS vs EODHD Quarterly Data Comparison')
  console.log('  Checking how many more quarters EODHD provides vs CMOTS')
  console.log()

  const CMOTS_BASE_URL = 'https://deltastockzapis.cmots.com/api'

  for (const stock of TEST_STOCKS.slice(0, 3)) {
    // Fetch CMOTS quarterly results
    const cmotsUrl = `${CMOTS_BASE_URL}/QuarterlyResults/${stock.coCode}/s`
    const cmotsRes = await fetch(cmotsUrl, {
      headers: { Authorization: `Bearer ${cmotsToken}` },
    })
    const cmotsJson = cmotsRes.ok ? await cmotsRes.json() : []
    const cmotsData = Array.isArray(cmotsJson) ? cmotsJson : (cmotsJson.data || [])

    // Count quarter columns in CMOTS (they follow Y{YYYYMM} pattern)
    let cmotsQuarters = 0
    if (cmotsData.length > 0) {
      const row = cmotsData[0]
      cmotsQuarters = Object.keys(row).filter(k => /^Y\d{6}$/.test(k)).length
    }

    // Fetch EODHD quarterly
    const ticker = isinToTicker.get(stock.isin) || stock.ticker
    const eodhData = await eodhFetch<Record<string, unknown>>(
      `/fundamentals/${ticker}?filter=Financials::Income_Statement::quarterly`
    )
    const eodhQuarters = eodhData ? Object.keys(eodhData).length : 0

    console.log(`  ${stock.name.padEnd(20)} CMOTS: ${cmotsQuarters} quarters  |  EODHD: ${eodhQuarters} quarters  |  Diff: +${eodhQuarters - cmotsQuarters}`)
  }

  console.log()
}

// ─── Main ──────────────────────────────────────────

async function main() {
  const t0 = Date.now()

  // Step 1: Verify ISIN → EODHD ticker resolution
  const isinToTicker = await verifyTickerResolution()

  // Step 2: Quarterly income statement depth
  await verifyQuarterlyDepth(isinToTicker)

  // Step 3: Annual P&L + Balance Sheet depth
  await verifyAnnualDepth(isinToTicker)

  // Step 4: Key ratio fields
  await verifyRatioFields(isinToTicker)

  // Step 5: Cash flow depth
  await verifyCashFlowDepth(isinToTicker)

  // Step 6: Compare with CMOTS quarterly depth
  await compareWithCMOTS(isinToTicker)

  // Summary
  console.log('─'.repeat(70))
  console.log('Summary')
  console.log('─'.repeat(70))
  console.log()
  console.log('V4 Scorecard Data Requirements for 2021 Backtest:')
  console.log('  Financial Score (30%): Needs ~5Y annual P&L/BS/CF → check Step 3')
  console.log('  Valuation (45%):       Needs PE/PB/EV history → check Step 4 + price data')
  console.log('  Quarterly Momentum (18%): Needs quarterly revenue/EBIT → check Step 2')
  console.log('  Technical (7%):        Needs OHLCV prices → use DhanHQ (separate script)')
  console.log()
  console.log(`Done in ${((Date.now() - t0) / 1000).toFixed(1)}s`)
  console.log('─'.repeat(70))
}

main().catch(err => {
  console.error('FATAL:', err)
  process.exit(1)
})
