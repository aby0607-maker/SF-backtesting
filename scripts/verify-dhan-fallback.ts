/**
 * Verification Script: DhanHQ Price Data Fallback
 *
 * Tests the full DhanHQ integration chain:
 *   1. Instrument CSV download + parsing
 *   2. ISIN → securityId mapping for known stocks
 *   3. Historical price fetch for each mapped stock
 *   4. Price data comparison with CMOTS (when available)
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/verify-dhan-fallback.ts
 *
 * Requires .env.local with:
 *   DHAN_ACCESS_TOKEN=your_token_here
 *   CMOTS_API_TOKEN=your_token_here   (optional — for comparison)
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ─── Config ────────────────────────────────────────

const DHAN_BASE = 'https://api.dhan.co/v2'
const CMOTS_BASE = 'https://deltastockzapis.cmots.com/api'
const SCRIP_MASTER_URL = 'https://images.dhan.co/api-data/api-scrip-master-detailed.csv'

// Test stocks: name, ISIN, CMOTS co_code, expected NSE symbol
const TEST_STOCKS = [
  { name: 'TCS', isin: 'INE467B01029', coCode: 476, nseSymbol: 'TCS' },
  { name: 'Axis Bank', isin: 'INE238A01034', coCode: 131, nseSymbol: 'AXISBANK' },
  { name: 'Zomato (Eternal)', isin: 'INE758T01015', coCode: 41887, nseSymbol: 'ETERNAL' },
  { name: 'Reliance', isin: 'INE002A01018', coCode: 6, nseSymbol: 'RELIANCE' },
  { name: 'Bharti Airtel', isin: 'INE397D01024', coCode: 15542, nseSymbol: 'BHARTIARTL' },
]

// Date range for price test: 6-year lookback from 2021 (for 5Y avg valuation)
const PRICE_FROM = '2015-01-01'
const PRICE_TO = '2021-12-31'

// ─── Read tokens from .env.local ───────────────────

const envPath = resolve(__dirname, '..', '.env.local')
let envContent = ''
try {
  envContent = readFileSync(envPath, 'utf-8')
} catch {
  console.error('ERROR: .env.local not found. Create it with DHAN_ACCESS_TOKEN=...')
  process.exit(1)
}

const dhanToken = envContent.match(/DHAN_ACCESS_TOKEN=(.+)/)?.[1]?.trim()
const cmotsToken = envContent.match(/CMOTS_API_TOKEN=(.+)/)?.[1]?.trim()

if (!dhanToken) {
  console.error('ERROR: DHAN_ACCESS_TOKEN not found in .env.local')
  process.exit(1)
}

console.log('─'.repeat(70))
console.log('DhanHQ Fallback Verification Script')
console.log('─'.repeat(70))
console.log(`DhanHQ token: ${dhanToken.slice(0, 8)}...`)
console.log(`CMOTS token: ${cmotsToken ? cmotsToken.slice(0, 8) + '...' : '(not configured — skipping comparison)'}`)
console.log(`Test stocks: ${TEST_STOCKS.length}`)
console.log(`Price range: ${PRICE_FROM} → ${PRICE_TO}`)
console.log()

// ─── Step 1: Download + Parse Instrument CSV ───────

interface DhanSecurity {
  securityId: string
  exchangeSegment: string
  tradingSymbol: string
  isin: string
}

async function downloadAndParseInstruments(): Promise<Map<string, DhanSecurity>> {
  console.log('STEP 1: Download DhanHQ Scrip Master CSV')
  console.log(`  URL: ${SCRIP_MASTER_URL}`)

  const start = Date.now()
  let res: Response
  try {
    res = await fetch(SCRIP_MASTER_URL)
  } catch (err) {
    console.warn(`  WARN: CSV download failed (${err instanceof Error ? err.message : err})`)
    console.log('  Using hardcoded test mappings instead (CSV host may be unreachable)')
    return getHardcodedTestMap()
  }
  const elapsed = Date.now() - start

  if (!res.ok) {
    console.error(`  FAIL: HTTP ${res.status} ${res.statusText}`)
    console.log('  Using hardcoded test mappings instead')
    return getHardcodedTestMap()
  }

  const csv = await res.text()
  const lines = csv.split('\n')
  console.log(`  Downloaded: ${lines.length} lines in ${elapsed}ms`)

  // Parse header
  const header = lines[0].split(',').map(h => h.trim())
  const idxExchange = header.indexOf('EXCH_ID')
  const idxSecurityId = header.indexOf('SECURITY_ID')
  const idxTradingSymbol = header.indexOf('SYMBOL_NAME')
  const idxIsin = header.indexOf('ISIN')
  const idxInstrument = header.indexOf('INSTRUMENT')

  console.log(`  Columns found: exchange=${idxExchange}, securityId=${idxSecurityId}, isin=${idxIsin}, instrument=${idxInstrument}`)

  if (idxExchange === -1 || idxSecurityId === -1 || idxIsin === -1) {
    console.error('  FAIL: Missing expected CSV columns')
    console.log('  Header (first 10):', header.slice(0, 10))
    return new Map()
  }

  // Parse rows — filter to equity only
  let totalParsed = 0
  let nseCount = 0
  let bseCount = 0
  const map = new Map<string, DhanSecurity>()

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const cols = line.split(',')
    const exchange = cols[idxExchange]?.trim()
    const instrument = idxInstrument !== -1 ? cols[idxInstrument]?.trim() : ''
    const isin = cols[idxIsin]?.trim()

    if (!isin || isin.length < 10) continue
    if (exchange !== 'NSE' && exchange !== 'BSE') continue
    if (instrument && instrument !== 'EQUITY') continue

    totalParsed++
    const exchangeSegment = exchange === 'NSE' ? 'NSE_EQ' : 'BSE'

    const sec: DhanSecurity = {
      securityId: cols[idxSecurityId]?.trim(),
      exchangeSegment,
      tradingSymbol: idxTradingSymbol !== -1 ? cols[idxTradingSymbol]?.trim() : '',
      isin,
    }

    // BSE first, then overwrite with NSE (preferred)
    if (exchangeSegment === 'BSE') {
      if (!map.has(isin)) {
        map.set(isin, sec)
        bseCount++
      }
    } else {
      map.set(isin, sec)
      nseCount++
    }
  }

  console.log(`  Parsed: ${totalParsed} equity instruments (${nseCount} NSE, ${bseCount} BSE-only)`)
  console.log(`  Unique ISINs in map: ${map.size}`)
  console.log(`  PASS`)
  console.log()

  return map
}

/**
 * Hardcoded test mappings for when the CSV download fails.
 * Security IDs sourced from DhanHQ docs / manual lookup.
 * These are NSE_EQ security IDs for the test stocks.
 */
function getHardcodedTestMap(): Map<string, DhanSecurity> {
  const map = new Map<string, DhanSecurity>()
  const testEntries: DhanSecurity[] = [
    { securityId: '11536', exchangeSegment: 'NSE_EQ', tradingSymbol: 'TCS', isin: 'INE467B01029' },
    { securityId: '5900', exchangeSegment: 'NSE_EQ', tradingSymbol: 'AXISBANK', isin: 'INE238A01034' },
    { securityId: '5097', exchangeSegment: 'NSE_EQ', tradingSymbol: 'ETERNAL', isin: 'INE758T01015' },
    { securityId: '2885', exchangeSegment: 'NSE_EQ', tradingSymbol: 'RELIANCE', isin: 'INE002A01018' },
    { securityId: '10604', exchangeSegment: 'NSE_EQ', tradingSymbol: 'BHARTIARTL', isin: 'INE397D01024' },
  ]
  for (const entry of testEntries) {
    map.set(entry.isin, entry)
  }
  console.log(`  Hardcoded map: ${map.size} test stocks`)
  console.log(`  NOTE: These securityIds may need verification — run with CSV when network allows`)
  console.log()
  return map
}

// ─── Step 2: ISIN → Security Mapping ──────────────

function verifyMapping(map: Map<string, DhanSecurity>): DhanSecurity[] {
  console.log('STEP 2: ISIN → DhanHQ Security Mapping')

  const resolved: DhanSecurity[] = []
  let passCount = 0
  let failCount = 0

  for (const stock of TEST_STOCKS) {
    const sec = map.get(stock.isin)
    if (sec) {
      console.log(`  ${stock.name.padEnd(20)} ISIN=${stock.isin} → securityId=${sec.securityId}, segment=${sec.exchangeSegment}, symbol=${sec.tradingSymbol}`)
      passCount++
      resolved.push(sec)
    } else {
      console.log(`  ${stock.name.padEnd(20)} ISIN=${stock.isin} → NOT FOUND`)
      failCount++
      resolved.push(null as unknown as DhanSecurity) // placeholder
    }
  }

  console.log(`  Result: ${passCount} PASS, ${failCount} FAIL`)
  console.log()

  return resolved
}

// ─── Step 3: DhanHQ Price Fetch ────────────────────

interface PriceRecord {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

async function fetchDhanPrices(sec: DhanSecurity, from: string, to: string): Promise<PriceRecord[]> {
  const body = {
    securityId: sec.securityId,
    exchangeSegment: sec.exchangeSegment,
    instrument: 'EQUITY',
    fromDate: from,
    toDate: to,
    expiryCode: 0,
  }

  let res: Response
  try {
    res = await fetch(`${DHAN_BASE}/charts/historical`, {
      method: 'POST',
      headers: {
        'access-token': dhanToken!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  } catch (err) {
    console.error(`    Network error: ${err instanceof Error ? err.message : err}`)
    return []
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '(unreadable)')
    console.error(`    HTTP ${res.status}: ${text.slice(0, 200)}`)
    return []
  }

  const data = await res.json() as {
    open?: number[]
    high?: number[]
    low?: number[]
    close?: number[]
    volume?: number[]
    timestamp?: number[]
  }

  if (!Array.isArray(data.timestamp) || data.timestamp.length === 0) return []

  const records: PriceRecord[] = []
  for (let i = 0; i < data.timestamp.length; i++) {
    const d = new Date(data.timestamp[i] * 1000)
    records.push({
      date: d.toISOString().split('T')[0],
      open: data.open![i],
      high: data.high![i],
      low: data.low![i],
      close: data.close![i],
      volume: data.volume![i],
    })
  }

  records.sort((a, b) => a.date.localeCompare(b.date))
  return records
}

async function verifyPriceFetch(resolvedSecurities: DhanSecurity[]): Promise<void> {
  console.log('STEP 3: DhanHQ Historical Price Fetch')
  console.log(`  Range: ${PRICE_FROM} → ${PRICE_TO}`)
  console.log()

  for (let i = 0; i < TEST_STOCKS.length; i++) {
    const stock = TEST_STOCKS[i]
    const sec = resolvedSecurities[i]

    if (!sec) {
      console.log(`  ${stock.name.padEnd(20)} SKIPPED (no DhanHQ mapping)`)
      continue
    }

    const start = Date.now()
    const prices = await fetchDhanPrices(sec, PRICE_FROM, PRICE_TO)
    const elapsed = Date.now() - start

    if (prices.length === 0) {
      console.log(`  ${stock.name.padEnd(20)} FAIL — 0 records (${elapsed}ms)`)
      continue
    }

    const earliest = prices[0]
    const latest = prices[prices.length - 1]
    console.log(`  ${stock.name.padEnd(20)} ${prices.length} records (${elapsed}ms)`)
    console.log(`    Earliest: ${earliest.date} — Close: ${earliest.close}`)
    console.log(`    Latest:   ${latest.date} — Close: ${latest.close}`)

    // Check year coverage
    const years = new Set(prices.map(p => p.date.slice(0, 4)))
    console.log(`    Years covered: ${[...years].sort().join(', ')}`)
  }

  console.log()
}

// ─── Step 4: CMOTS vs DhanHQ Price Comparison ──────

interface CMOTSPriceRecord {
  CO_CODE: number
  companyname: string
  Tradedate: string
  DayOpen: number
  DayHigh: number
  Daylow: number
  Dayclose: number
  TotalVolume: number
}

async function fetchCmotsPrices(coCode: number, from: string, to: string): Promise<CMOTSPriceRecord[]> {
  const url = `${CMOTS_BASE}/AdjustedPriceChart/bse/${coCode}/${from}/${to}`
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${cmotsToken}` },
    })
    if (!res.ok) return []
    const json = await res.json()
    const data = Array.isArray(json) ? json : (json.data || [])
    return data as CMOTSPriceRecord[]
  } catch {
    return []
  }
}

async function comparePrices(resolvedSecurities: DhanSecurity[]): Promise<void> {
  if (!cmotsToken) {
    console.log('STEP 4: Price Comparison — SKIPPED (no CMOTS_API_TOKEN)')
    console.log()
    return
  }

  console.log('STEP 4: CMOTS vs DhanHQ Price Comparison')
  console.log('  Comparing close prices for overlapping dates')
  console.log()

  // Use a shorter range for comparison
  const compFrom = '2021-01-01'
  const compTo = '2021-03-31'

  for (let i = 0; i < TEST_STOCKS.length; i++) {
    const stock = TEST_STOCKS[i]
    const sec = resolvedSecurities[i]
    if (!sec) continue

    const [dhanPrices, cmotsPrices] = await Promise.all([
      fetchDhanPrices(sec, compFrom, compTo),
      fetchCmotsPrices(stock.coCode, compFrom, compTo),
    ])

    if (dhanPrices.length === 0 || cmotsPrices.length === 0) {
      console.log(`  ${stock.name.padEnd(20)} SKIP — DhanHQ: ${dhanPrices.length}, CMOTS: ${cmotsPrices.length} records`)
      continue
    }

    // Build date maps
    const dhanByDate = new Map(dhanPrices.map(p => [p.date, p]))
    const cmotsByDate = new Map(cmotsPrices.map(p => [p.Tradedate.split('T')[0], p]))

    // Find overlapping dates
    const overlap: string[] = []
    for (const d of dhanByDate.keys()) {
      if (cmotsByDate.has(d)) overlap.push(d)
    }
    overlap.sort()

    if (overlap.length === 0) {
      console.log(`  ${stock.name.padEnd(20)} No overlapping dates (DhanHQ=${dhanPrices.length}, CMOTS=${cmotsPrices.length})`)
      continue
    }

    // Compare close prices
    let totalDiff = 0
    let maxDiff = 0
    let maxDiffDate = ''

    for (const date of overlap) {
      const dhan = dhanByDate.get(date)!
      const cmots = cmotsByDate.get(date)!
      const diff = Math.abs(dhan.close - cmots.Dayclose)
      const pctDiff = cmots.Dayclose > 0 ? (diff / cmots.Dayclose) * 100 : 0
      totalDiff += pctDiff
      if (pctDiff > maxDiff) {
        maxDiff = pctDiff
        maxDiffDate = date
      }
    }

    const avgDiff = totalDiff / overlap.length
    console.log(`  ${stock.name.padEnd(20)} ${overlap.length} overlapping dates`)
    console.log(`    Avg close diff: ${avgDiff.toFixed(3)}% (BSE vs NSE)`)
    console.log(`    Max close diff: ${maxDiff.toFixed(3)}% on ${maxDiffDate}`)

    // Show a few sample rows
    const sampleDates = overlap.slice(0, 3)
    for (const date of sampleDates) {
      const dhan = dhanByDate.get(date)!
      const cmots = cmotsByDate.get(date)!
      console.log(`    ${date}: DhanHQ(NSE)=${dhan.close.toFixed(2)}  CMOTS(BSE)=${cmots.Dayclose.toFixed(2)}`)
    }
  }

  console.log()
}

// ─── Step 5: Backtest Coverage Analysis ────────────

async function analyzeBacktestCoverage(instrumentMap: Map<string, DhanSecurity>): Promise<void> {
  if (!cmotsToken) {
    console.log('STEP 5: Backtest Coverage Analysis — SKIPPED (no CMOTS_API_TOKEN)')
    console.log()
    return
  }

  console.log('STEP 5: Backtest Coverage Analysis')
  console.log('  Checking how many BSE stocks have DhanHQ price fallback via ISIN bridge')
  console.log()

  // Fetch CMOTS company master
  let res: Response
  try {
    res = await fetch(`${CMOTS_BASE}/companymaster`, {
      headers: { Authorization: `Bearer ${cmotsToken}` },
    })
  } catch (err) {
    console.log(`  FAIL: CMOTS companymaster network error (${err instanceof Error ? err.message : err})`)
    return
  }
  if (!res.ok) {
    console.log(`  FAIL: CMOTS companymaster HTTP ${res.status}`)
    return
  }

  const json = await res.json()
  const companies = (Array.isArray(json) ? json : json.data || []) as Array<{
    co_code: number
    isin: string
    companyname: string
    bselistedflag: string
    BSEStatus: string
    mcaptype: string
  }>

  const bseActive = companies.filter(c => c.bselistedflag === 'Y' || c.BSEStatus === 'Active')
  let hasIsin = 0
  let hasDhanMapping = 0
  let noDhanMapping = 0
  const unmappedByMcap: Record<string, number> = {}

  for (const c of bseActive) {
    if (!c.isin) continue
    hasIsin++

    if (instrumentMap.has(c.isin)) {
      hasDhanMapping++
    } else {
      noDhanMapping++
      const mcap = c.mcaptype || 'Unknown'
      unmappedByMcap[mcap] = (unmappedByMcap[mcap] || 0) + 1
    }
  }

  console.log(`  BSE active companies: ${bseActive.length}`)
  console.log(`  With ISIN: ${hasIsin}`)
  console.log(`  Mapped to DhanHQ: ${hasDhanMapping} (${((hasDhanMapping / hasIsin) * 100).toFixed(1)}%)`)
  console.log(`  Not in DhanHQ: ${noDhanMapping}`)
  console.log(`  Unmapped by market cap:`)
  for (const [mcap, count] of Object.entries(unmappedByMcap).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${mcap.padEnd(15)} ${count}`)
  }

  console.log()
}

// ─── Main ──────────────────────────────────────────

async function main() {
  const t0 = Date.now()

  // Step 1: Download + parse instrument CSV
  const instrumentMap = await downloadAndParseInstruments()
  if (instrumentMap.size === 0) {
    console.error('ABORT: Could not load instrument map')
    process.exit(1)
  }

  // Step 2: Verify ISIN → securityId mapping
  const resolved = verifyMapping(instrumentMap)

  // Step 3: Fetch prices from DhanHQ
  await verifyPriceFetch(resolved)

  // Step 4: Compare with CMOTS prices
  await comparePrices(resolved)

  // Step 5: Backtest coverage analysis
  await analyzeBacktestCoverage(instrumentMap)

  // Summary
  console.log('─'.repeat(70))
  console.log(`Done in ${((Date.now() - t0) / 1000).toFixed(1)}s`)
  console.log('─'.repeat(70))
}

main().catch(err => {
  console.error('FATAL:', err)
  process.exit(1)
})
