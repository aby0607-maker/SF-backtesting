/**
 * Scorecard V1 — Stock Data Fetcher
 *
 * Fetches all CMOTS (consolidated) + IndianAPI data for a stock,
 * saves to persistent cache in data/api-cache/{co_code}/.
 *
 * Usage:
 *   node scripts/scorecard-v1/fetch-stock-data.mjs --symbol TCS
 *   node scripts/scorecard-v1/fetch-stock-data.mjs --symbol TCS --force
 *   node scripts/scorecard-v1/fetch-stock-data.mjs --co_code 476
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '../..')
const CACHE_DIR = resolve(PROJECT_ROOT, 'data/api-cache')

// ── API Config ──
const CMOTS_BASE = 'https://deltastockzapis.cmots.com/api'
const CMOTS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImRlbHRhc3RvY2t6bGVhcm5pbmdhcGlzIiwicm9sZSI6IkFkbWluIiwibmJmIjoxNzYxOTkyMzE1LCJleHAiOjE3OTQyMTk1MTUsImlhdCI6MTc2MTk5MjMxNSwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo1MDE5MSIsImF1ZCI6Imh0dHA6Ly9sb2NhbGhvc3Q6NTAxOTEifQ.zhW-Z9-sx8u_fyrM7iFH8LM4w-U0vjOiOQrY2M5nztI'

const INDIANAPI_BASE = 'https://stock.indianapi.in'
const INDIANAPI_KEY = 'sk-live-D8pA1iJejpIi5hL83YoRXj0pa9JNoRCDNWHzk8wY'

const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24h
const RATE_LIMIT_MS = 500 // 500ms between CMOTS calls

// ── CLI Argument Parsing ──
function parseArgs() {
  const args = process.argv.slice(2)
  const opts = { symbol: null, co_code: null, force: false }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--symbol' && args[i + 1]) opts.symbol = args[++i].toUpperCase()
    else if (args[i] === '--co_code' && args[i + 1]) opts.co_code = parseInt(args[++i])
    else if (args[i] === '--force') opts.force = true
  }
  if (!opts.symbol && !opts.co_code) {
    console.error('Usage: node fetch-stock-data.mjs --symbol TCS [--force]')
    process.exit(1)
  }
  return opts
}

// ── API Helpers ──
function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function cmotsFetch(path) {
  const url = `${CMOTS_BASE}${path}`
  console.log(`  → GET ${url}`)
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CMOTS_TOKEN}`,
    },
  })
  if (!res.ok) throw new Error(`CMOTS ${path}: HTTP ${res.status} ${res.statusText}`)
  const json = await res.json()
  if (json && typeof json === 'object' && !Array.isArray(json) && 'data' in json) return json.data
  return json
}

async function indianapiFetch(path) {
  const url = `${INDIANAPI_BASE}${path}`
  console.log(`  → GET ${url}`)
  const res = await fetch(url, {
    headers: { 'X-Api-Key': INDIANAPI_KEY },
  })
  if (!res.ok) throw new Error(`IndianAPI ${path}: HTTP ${res.status} ${res.statusText}`)
  return res.json()
}

// ── Cache Helpers ──
function isCacheFresh(dir) {
  const metaPath = resolve(dir, 'meta.json')
  if (!existsSync(metaPath)) return false
  try {
    const meta = JSON.parse(readFileSync(metaPath, 'utf8'))
    const age = Date.now() - new Date(meta.fetchDate).getTime()
    return age < CACHE_MAX_AGE_MS
  } catch { return false }
}

function saveJSON(dir, filename, data) {
  writeFileSync(resolve(dir, filename), JSON.stringify(data, null, 2))
}

// ── Main ──
async function main() {
  const opts = parseArgs()

  console.log('═══════════════════════════════════════════════════════════')
  console.log('  SCORECARD V1 — Stock Data Fetcher (Consolidated)')
  console.log('═══════════════════════════════════════════════════════════')

  // Step 1: Resolve co_code from symbol if needed
  let co_code = opts.co_code
  let symbol = opts.symbol
  let companyRecord = null

  if (!co_code) {
    console.log(`\n[1] Looking up co_code for ${symbol}...`)
    const master = await cmotsFetch('/companymaster')
    await sleep(RATE_LIMIT_MS)

    if (!Array.isArray(master)) {
      console.error('  ERROR: companymaster did not return an array')
      process.exit(1)
    }

    // Search by NSE symbol (primary), then by company name
    companyRecord = master.find(c =>
      (c.nsesymbol || '').toUpperCase() === symbol
    )
    if (!companyRecord) {
      companyRecord = master.find(c =>
        (c.companyname || '').toUpperCase().includes(symbol) ||
        (c.companyshortname || '').toUpperCase().includes(symbol)
      )
    }

    if (!companyRecord) {
      console.error(`  ERROR: Could not find ${symbol} in CMOTS company master`)
      console.error(`  Total companies in master: ${master.length}`)
      // Try partial matches
      const partial = master.filter(c =>
        JSON.stringify(c).toUpperCase().includes(symbol)
      ).slice(0, 5)
      if (partial.length > 0) {
        console.error('  Partial matches:')
        for (const p of partial) {
          console.error(`    co_code=${p.co_code} nsesymbol=${p.nsesymbol} name=${p.companyname}`)
        }
      }
      process.exit(1)
    }

    co_code = companyRecord.co_code
    symbol = companyRecord.nsesymbol || symbol
    console.log(`  Found: co_code=${co_code}, NSE=${symbol}, BSE=${companyRecord.bsecode}`)
    console.log(`  Company: ${companyRecord.companyname}`)
  }

  // Step 2: Check cache
  const cacheDir = resolve(CACHE_DIR, String(co_code))

  if (!opts.force && isCacheFresh(cacheDir)) {
    const meta = JSON.parse(readFileSync(resolve(cacheDir, 'meta.json'), 'utf8'))
    console.log(`\n  Cache is fresh (fetched ${meta.fetchDate}). Use --force to re-fetch.`)
    console.log(`  Cache dir: ${cacheDir}`)
    return
  }

  mkdirSync(cacheDir, { recursive: true })
  console.log(`\n[2] Fetching data for co_code=${co_code} (consolidated)...`)

  // Step 3: Fetch all endpoints
  const endpoints = [
    { name: 'ttm', path: `/TTMData/${co_code}/c` },
    { name: 'findata', path: `/FinData/${co_code}/c` },
    { name: 'pnl', path: `/ProftandLoss/${co_code}/c` },
    { name: 'bs', path: `/BalanceSheet/${co_code}/c` },
    { name: 'cf', path: `/CashFlow/${co_code}/c` },
    { name: 'quarterly', path: `/QuarterlyResults/${co_code}/c` },
    { name: 'shareholding', path: `/Aggregate-Share-Holding/${co_code}` },
    { name: 'ohlcv', path: `/AdjustedPriceChart/bse/${co_code}/2020-01-01/2026-03-04` },
  ]

  let fetchedCount = 0
  for (const ep of endpoints) {
    try {
      const data = await cmotsFetch(ep.path)
      saveJSON(cacheDir, `${ep.name}.json`, data)
      const count = Array.isArray(data) ? data.length : Object.keys(data).length
      console.log(`    ✓ ${ep.name}: ${count} records`)
      fetchedCount++
    } catch (e) {
      console.error(`    ✗ ${ep.name}: ${e.message}`)
      // Save empty to prevent re-fetch errors
      saveJSON(cacheDir, `${ep.name}.json`, [])
    }
    await sleep(RATE_LIMIT_MS)
  }

  // IndianAPI
  console.log('\n  Fetching IndianAPI...')
  try {
    const ia = await indianapiFetch(`/stock?name=${symbol}`)
    saveJSON(cacheDir, 'indianapi.json', ia)
    const fieldCount = typeof ia === 'object' ? Object.keys(ia).length : 0
    console.log(`    ✓ indianapi: ${fieldCount} top-level fields`)
    fetchedCount++
  } catch (e) {
    console.error(`    ✗ indianapi: ${e.message}`)
    saveJSON(cacheDir, 'indianapi.json', {})
  }

  // Save company record if we have it
  if (companyRecord) {
    saveJSON(cacheDir, 'company.json', companyRecord)
  }

  // Save meta
  const meta = {
    co_code,
    symbol,
    companyName: companyRecord?.companyname || `co_code_${co_code}`,
    bseCode: companyRecord?.bsecode || null,
    statementType: 'consolidated',
    fetchDate: new Date().toISOString(),
    endpointsFetched: fetchedCount,
  }
  saveJSON(cacheDir, 'meta.json', meta)

  console.log('\n═══════════════════════════════════════════════════════════')
  console.log(`  DONE — ${fetchedCount}/9 endpoints fetched`)
  console.log(`  Cache dir: ${cacheDir}`)
  console.log('═══════════════════════════════════════════════════════════')
}

main().catch(e => {
  console.error('Fatal error:', e)
  process.exit(1)
})
