/**
 * Scoring Diagnostic — Dev-only tool to verify data coverage & metric resolution
 *
 * Traces the same code paths as the real scoring pipeline but logs detailed
 * output for each metric: resolved value, null reasons, data coverage stats.
 *
 * Usage (browser console):
 *   window.__runScoringDiagnostic('476', '2025-01-01', '2026-01-27')
 */

import { getAllFundamentals, getYearColumns } from '@/services/cmots/fundamentals'
import { getHistoricalPrices } from '@/services/cmots/priceData'
import { resolveMetricsAtDate } from '@/services/metricResolver'

/**
 * Run a full scoring diagnostic for a stock over a date range.
 * Fetches data using the same paths as backtestScorecard(), then reports coverage.
 */
export async function runScoringDiagnostic(
  coCode: string,
  fromDate: string,
  toDate: string,
): Promise<void> {
  console.log('═══════════════════════════════════════════════════')
  console.log(`  SCORING DIAGNOSTIC: co_code=${coCode}`)
  console.log(`  Date range: ${fromDate} → ${toDate}`)
  console.log('═══════════════════════════════════════════════════')

  // ── Step 1: Fetch fundamentals ──
  console.log('\n📊 Step 1: Fetching fundamentals...')
  const fundamentals = await getAllFundamentals(coCode)

  const ttmStatus = fundamentals.ttm ? '✓ Available' : '✗ NULL'
  const finDataCount = fundamentals.finData.length
  const pnlCount = fundamentals.pnl.length
  const bsCount = fundamentals.balanceSheet.length
  const cfCount = fundamentals.cashFlow.length
  const qrCount = fundamentals.quarterly.length
  const shCount = fundamentals.shareholding.length

  console.log(`  TTM:          ${ttmStatus}`)
  console.log(`  FinData:      ${finDataCount} yearly records`)
  console.log(`  P&L rows:     ${pnlCount}`)
  console.log(`  Balance Sheet: ${bsCount} rows`)
  console.log(`  Cash Flow:    ${cfCount} rows`)
  console.log(`  Quarterly:    ${qrCount} rows`)
  console.log(`  Shareholding: ${shCount} quarters`)

  // ── Step 2: Check fiscal year columns ──
  console.log('\n📅 Step 2: Fiscal year columns...')
  if (fundamentals.pnl.length > 0) {
    const yearCols = getYearColumns(fundamentals.pnl[0])
    console.log(`  P&L year columns (${yearCols.length}): ${yearCols.join(', ')}`)

    // Show which columns would be available at fromDate
    const cutoff = new Date(fromDate)
    const availableAtFrom = yearCols.filter(col => {
      const year = parseInt(col.slice(1, 5))
      const month = parseInt(col.slice(5, 7))
      const colDate = new Date(year, month, 0)
      return colDate <= cutoff
    })
    console.log(`  Columns available at ${fromDate} (${availableAtFrom.length}): ${availableAtFrom.join(', ')}`)
    if (availableAtFrom.length < 2) {
      console.warn('  ⚠ LESS THAN 2 COLUMNS — Growth CAGR will be NULL')
    }
    if (availableAtFrom.length < 5) {
      console.warn(`  ⚠ Only ${availableAtFrom.length} columns — 5Y averages will use fewer years`)
    }
  } else {
    console.warn('  ⚠ No P&L data — most metrics will be NULL')
  }

  if (fundamentals.finData.length > 0) {
    const yrcValues = fundamentals.finData.map(f => f.yrc)
    console.log(`  FinData yrc codes: ${yrcValues.join(', ')}`)
  }

  // ── Step 3: Fetch price data with 6Y lookback ──
  console.log('\n💹 Step 3: Fetching price data (with 6Y lookback)...')
  const extendedFrom = new Date(fromDate)
  extendedFrom.setFullYear(extendedFrom.getFullYear() - 6)
  const extendedFromStr = extendedFrom.toISOString().split('T')[0]

  console.log(`  Extended from: ${extendedFromStr} (6Y before ${fromDate})`)
  console.log(`  API call: /AdjustedPriceChart/bse/${coCode}/${extendedFromStr}/${toDate}`)

  const prices = await getHistoricalPrices(coCode, extendedFromStr, toDate)
  console.log(`  Total records returned: ${prices.length}`)

  if (prices.length > 0) {
    const firstDate = prices[0].Tradedate.split('T')[0]
    const lastDate = prices[prices.length - 1].Tradedate.split('T')[0]
    console.log(`  Date range: ${firstDate} → ${lastDate}`)

    const beforeFrom = prices.filter(p => p.Tradedate.split('T')[0] < fromDate)
    console.log(`  Records before ${fromDate}: ${beforeFrom.length} (needed for lookback)`)
    if (beforeFrom.length < 200) {
      console.warn(`  ⚠ LESS THAN 200 records before start date — EMA200 will be NULL`)
    } else {
      console.log(`  ✓ ${beforeFrom.length} records — sufficient for EMA200`)
    }

    // Check FY-end price coverage for 5Y valuation average
    if (fundamentals.pnl.length > 0) {
      const yearCols = getYearColumns(fundamentals.pnl[0])
      const cutoff = new Date(fromDate)
      const availableCols = yearCols.filter(col => {
        const year = parseInt(col.slice(1, 5))
        const month = parseInt(col.slice(5, 7))
        return new Date(year, month, 0) <= cutoff
      })
      let fyEndMatches = 0
      for (const col of availableCols) {
        const year = parseInt(col.slice(1, 5))
        const month = parseInt(col.slice(5, 7))
        const lastDay = new Date(year, month, 0).getDate()
        const fyEndDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
        const hasPrice = prices.some(p => {
          const pDate = p.Tradedate.split('T')[0]
          // Within 7 days before FY-end
          return pDate <= fyEndDate && pDate >= `${year}-${String(month).padStart(2, '0')}-${String(Math.max(1, lastDay - 7)).padStart(2, '0')}`
        })
        if (hasPrice) fyEndMatches++
      }
      console.log(`  FY-end price matches: ${fyEndMatches}/${availableCols.length} (for 5Y avg valuation)`)
    }
  } else {
    console.error('  ✗ NO PRICE DATA RETURNED — all technical & valuation metrics will be NULL')
  }

  // Build price history for metric resolution
  const priceHistory = prices.map(p => ({
    date: p.Tradedate.split('T')[0],
    price: p.Dayclose,
    volume: p.TotalVolume,
  })).sort((a, b) => a.date.localeCompare(b.date))

  // ── Step 4: Resolve metrics at start date ──
  console.log(`\n🎯 Step 4: Resolving metrics at ${fromDate}...`)
  const resolvedAtStart = resolveMetricsAtDate(fundamentals, priceHistory, fromDate)
  printMetricReport(resolvedAtStart.data, 'Start Date')

  // ── Step 5: Resolve metrics at mid-interval date ──
  const midDate = computeMidDate(fromDate, toDate)
  console.log(`\n🎯 Step 5: Resolving metrics at ${midDate} (mid-interval)...`)
  const resolvedAtMid = resolveMetricsAtDate(fundamentals, priceHistory, midDate)
  printMetricReport(resolvedAtMid.data, 'Mid-Interval')

  // ── Step 6: Resolve metrics at end date ──
  console.log(`\n🎯 Step 6: Resolving metrics at ${toDate} (end date)...`)
  const resolvedAtEnd = resolveMetricsAtDate(fundamentals, priceHistory, toDate)
  printMetricReport(resolvedAtEnd.data, 'End Date')

  // ── Summary ──
  console.log('\n═══════════════════════════════════════════════════')
  console.log('  SUMMARY')
  console.log('═══════════════════════════════════════════════════')

  const startMetrics = Object.entries(resolvedAtStart.data)
  const startResolved = startMetrics.filter(([, v]) => v !== null).length
  const startNull = startMetrics.filter(([, v]) => v === null).length

  const endMetrics = Object.entries(resolvedAtEnd.data)
  const endResolved = endMetrics.filter(([, v]) => v !== null).length
  const endNull = endMetrics.filter(([, v]) => v === null).length

  console.log(`  Start date (${fromDate}): ${startResolved}/${startMetrics.length} resolved, ${startNull} null`)
  console.log(`  Mid date   (${midDate}):  ${Object.values(resolvedAtMid.data).filter(v => v !== null).length}/${Object.keys(resolvedAtMid.data).length} resolved`)
  console.log(`  End date   (${toDate}): ${endResolved}/${endMetrics.length} resolved, ${endNull} null`)

  if (startNull > 0) {
    console.log(`\n  Null metrics at start date:`)
    for (const [key, val] of startMetrics) {
      if (val === null) console.log(`    - ${key}`)
    }
  }

  console.log('\n═══════════════════════════════════════════════════')
  console.log('  DIAGNOSTIC COMPLETE')
  console.log('═══════════════════════════════════════════════════')
}

function printMetricReport(data: Record<string, number | null>, label: string): void {
  const categories: Record<string, string[]> = {
    'Growth': ['v2_revenue_growth', 'v2_ebitda_growth', 'v2_earnings_growth', 'v2_gross_block'],
    'Financial': ['v2_roe', 'v2_ocf_ebitda', 'v2_debt_ebitda'],
    'Valuation (raw)': ['raw_pe', 'raw_pb', 'raw_ev'],
    'Valuation (vs 5Y)': ['v2_pe_vs_5y', 'v2_pb_vs_5y', 'v2_ev_vs_5y'],
    'Valuation (hist avg)': ['hist_avg_pe', 'hist_avg_pb', 'hist_avg_ev'],
    'Technical': ['v2_price_ema20', 'v2_price_ema50', 'v2_price_ema200', 'v2_rsi', 'v2_vpt', 'v2_volume_change', 'v2_price_change'],
    'Quarterly Momentum': ['v2_revenue_multiplier', 'v2_ebitda_multiplier'],
    'Ownership': ['promoter_holding', 'fii_holding', 'dii_holding', 'promoter_holding_change_3m', 'fii_holding_change_3m'],
  }

  console.log(`\n  ┌─ ${label} ─────────────────────────────────────`)
  for (const [category, metricIds] of Object.entries(categories)) {
    console.log(`  │ ${category}:`)
    for (const id of metricIds) {
      const value = data[id]
      const status = value !== null && value !== undefined
        ? `✓ ${typeof value === 'number' ? value.toFixed(4) : value}`
        : '✗ null'
      console.log(`  │   ${id.padEnd(30)} ${status}`)
    }
  }
  console.log('  └──────────────────────────────────────────────────')
}

function computeMidDate(from: string, to: string): string {
  const fromMs = new Date(from).getTime()
  const toMs = new Date(to).getTime()
  const midMs = fromMs + (toMs - fromMs) / 2
  return new Date(midMs).toISOString().split('T')[0]
}
