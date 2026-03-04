#!/usr/bin/env node
/**
 * Batch compute metrics for all stocks in the universe.
 * Reads data/nifty50-universe.json, runs compute-all-metrics for each stock.
 *
 * Usage:
 *   node scripts/scorecard-v1/batch-compute-universe.mjs [--skip-existing]
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '../..')

const args = process.argv.slice(2)
const skipExisting = args.includes('--skip-existing')

const universe = JSON.parse(readFileSync(resolve(PROJECT_ROOT, 'data/nifty50-universe.json'), 'utf8'))

console.log('═══════════════════════════════════════════════════════════')
console.log(`  BATCH COMPUTE — ${universe.stocks.length} stocks`)
console.log('═══════════════════════════════════════════════════════════')

const results = { success: [], failed: [], skipped: [] }

for (let i = 0; i < universe.stocks.length; i++) {
  const stock = universe.stocks[i]
  const { co_code, symbol } = stock
  const idx = `[${i + 1}/${universe.stocks.length}]`

  // Check if already computed
  const resultFile = resolve(PROJECT_ROOT, `data/results/${co_code}/all-metrics.json`)
  if (skipExisting && existsSync(resultFile)) {
    console.log(`  ${idx} ${symbol} (${co_code}) — SKIPPED (results exist)`)
    results.skipped.push(symbol)
    continue
  }

  // Check if data exists
  const cacheDir = resolve(PROJECT_ROOT, `data/api-cache/${co_code}`)
  const pnlFile = resolve(cacheDir, 'pnl.json')
  if (!existsSync(pnlFile)) {
    console.log(`  ${idx} ${symbol} (${co_code}) — SKIPPED (no P&L data)`)
    results.failed.push({ symbol, reason: 'no P&L data' })
    continue
  }

  // Check P&L has actual data (not just an envelope with empty array)
  try {
    const pnlRaw = JSON.parse(readFileSync(pnlFile, 'utf8'))
    const pnlData = pnlRaw.data || pnlRaw
    if (!Array.isArray(pnlData) || pnlData.length === 0) {
      console.log(`  ${idx} ${symbol} (${co_code}) — SKIPPED (empty P&L)`)
      results.failed.push({ symbol, reason: 'empty P&L' })
      continue
    }
  } catch {
    console.log(`  ${idx} ${symbol} (${co_code}) — SKIPPED (invalid P&L JSON)`)
    results.failed.push({ symbol, reason: 'invalid P&L' })
    continue
  }

  try {
    const output = execSync(
      `node scripts/scorecard-v1/compute-all-metrics.mjs --co_code ${co_code}`,
      { cwd: PROJECT_ROOT, timeout: 60000, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    )
    // Extract metric count from output
    const metricMatch = output.match(/TOTAL UNIQUE METRICS: (\d+)/)
    const count = metricMatch ? metricMatch[1] : '?'
    console.log(`  ${idx} ${symbol} (${co_code}) — OK (${count} metrics)`)
    results.success.push({ symbol, co_code, metricCount: parseInt(count) || 0 })
  } catch (err) {
    const msg = err.stderr?.split('\n')[0] || err.message?.split('\n')[0] || 'unknown error'
    console.log(`  ${idx} ${symbol} (${co_code}) — ERROR: ${msg}`)
    results.failed.push({ symbol, reason: msg })
  }
}

console.log('\n═══════════════════════════════════════════════════════════')
console.log(`  RESULTS: ${results.success.length} success, ${results.failed.length} failed, ${results.skipped.length} skipped`)

if (results.failed.length > 0) {
  console.log('\n  Failed stocks:')
  for (const f of results.failed) {
    console.log(`    ${f.symbol}: ${f.reason}`)
  }
}

if (results.success.length > 0) {
  const avgMetrics = Math.round(results.success.reduce((s, r) => s + r.metricCount, 0) / results.success.length)
  console.log(`\n  Average metrics per stock: ${avgMetrics}`)
  const minStock = results.success.reduce((a, b) => a.metricCount < b.metricCount ? a : b)
  const maxStock = results.success.reduce((a, b) => a.metricCount > b.metricCount ? a : b)
  console.log(`  Min: ${minStock.symbol} (${minStock.metricCount}), Max: ${maxStock.symbol} (${maxStock.metricCount})`)
}

console.log('═══════════════════════════════════════════════════════════')
