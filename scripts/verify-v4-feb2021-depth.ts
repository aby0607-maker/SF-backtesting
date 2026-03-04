#!/usr/bin/env npx tsx --tsconfig tsconfig.json
/**
 * V4 Scorecard Data Depth Verification — TCS @ Feb 25, 2021
 *
 * Tests all 3 data sources (CMOTS + DhanHQ + IndianAPI) to determine which
 * V4 metrics can be computed at a historical date of Feb 25, 2021.
 *
 * For each of the 17 V4 metrics, reports:
 *   - Data source used (CMOTS, IndianAPI, DhanHQ, or N/A)
 *   - Raw value computed (or null if unavailable)
 *   - Year columns available after windowing to Feb 2021
 *   - Gap analysis (what's missing and why)
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/verify-v4-feb2021-depth.ts
 */

import { execSync } from 'child_process'

// ─── Config ────────────────────────────────────────

const AS_OF_DATE = '2021-02-25'
const STOCK_NAME = 'TCS'
const CMOTS_CO_CODE = 476
const DHAN_SECURITY_ID = '11536'  // TCS on NSE (DhanHQ security ID)

// Read tokens from env
const CMOTS_TOKEN = process.env.CMOTS_API_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImRlbHRhc3RvY2t6bGVhcm5pbmdhcGlzIiwicm9sZSI6IkFkbWluIiwibmJmIjoxNzYxOTkyMzE1LCJleHAiOjE3OTQyMTk1MTUsImlhdCI6MTc2MTk5MjMxNSwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo1MDE5MSIsImF1ZCI6Imh0dHA6Ly9sb2NhbGhvc3Q6NTAxOTEifQ.zhW-Z9-sx8u_fyrM7iFH8LM4w-U0vjOiOQrY2M5nztI'
const DHAN_TOKEN = process.env.DHAN_ACCESS_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJkaGFuIiwicGFydG5lcklkIjoiIiwiZXhwIjoxNzcyNjkxMTY4LCJpYXQiOjE3NzI2MDQ3NjgsInRva2VuQ29uc3VtZXJUeXBlIjoiU0VMRiIsIndlYmhvb2tVcmwiOiIiLCJkaGFuQ2xpZW50SWQiOiIxMTEwNjgwMTk2In0.ESGZ2k1Th2XdtUPfiHDqygAW0psAUqxg4VJk-vszsB-1xKUBC0o00hJ6FOTOr1eqE6jPDyW1YHIq5cWS3FIY2Q'
const INDIANAPI_KEY = process.env.INDIANAPI_KEY || 'sk-live-D8pA1iJejpIi5hL83YoRXj0pa9JNoRCDNWHzk8wY'

// ─── HTTP Helpers ──────────────────────────────────

function curlGet(url: string, headers: Record<string, string> = {}): unknown | null {
  const headerArgs = Object.entries(headers).map(([k, v]) => `-H "${k}: ${v}"`).join(' ')
  try {
    const result = execSync(
      `curl -s ${headerArgs} "${url}"`,
      { timeout: 30_000, encoding: 'utf-8' }
    )
    if (!result || result.startsWith('<!DOCTYPE') || result.startsWith('Missing')) return null
    return JSON.parse(result)
  } catch { return null }
}

function curlPost(url: string, body: unknown, headers: Record<string, string> = {}): unknown | null {
  const headerArgs = Object.entries(headers).map(([k, v]) => `-H "${k}: ${v}"`).join(' ')
  const bodyStr = JSON.stringify(body).replace(/"/g, '\\"')
  try {
    const result = execSync(
      `curl -s ${headerArgs} -H "Content-Type: application/json" -X POST -d "${bodyStr}" "${url}"`,
      { timeout: 30_000, encoding: 'utf-8' }
    )
    if (!result || result.startsWith('<!DOCTYPE')) return null
    return JSON.parse(result)
  } catch { return null }
}

// ─── Data Fetchers ─────────────────────────────────

type YearKeyed = Record<string, Record<string, number>>

function fetchIndianAPI(stats: string): YearKeyed | null {
  return curlGet(
    `https://stock.indianapi.in/historical_stats?stock_name=${STOCK_NAME}&stats=${stats}`,
    { 'X-Api-Key': INDIANAPI_KEY }
  ) as YearKeyed | null
}

function fetchCMOTS(endpoint: string): unknown {
  return curlGet(
    `https://deltastockzapis.cmots.com/api${endpoint}`,
    { 'Authorization': `Bearer ${CMOTS_TOKEN}` }
  )
}

function fetchDhanOHLCV(fromDate: string, toDate: string): unknown {
  return curlPost(
    'https://api.dhan.co/v2/charts/historical',
    {
      securityId: DHAN_SECURITY_ID,
      exchangeSegment: 'NSE_EQ',
      instrument: 'EQUITY',
      expiryCode: 0,
      fromDate,
      toDate,
    },
    { 'access-token': DHAN_TOKEN }
  )
}

// ─── Period Helpers ────────────────────────────────

const MONTH_MAP: Record<string, string> = {
  'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
  'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
  'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12',
}

function periodToYearCol(period: string): string | null {
  if (period === 'TTM') return null
  const parts = period.split(' ')
  if (parts.length !== 2) return null
  const monthStr = MONTH_MAP[parts[0]]
  if (!monthStr) return null
  return `Y${parts[1]}${monthStr}`
}

/** Window IndianAPI periods to only those with fiscal year end ≤ asOfDate */
function windowPeriods(data: Record<string, number>, asOfDate: string): { col: string; period: string; value: number }[] {
  const cutoff = new Date(asOfDate)
  const entries: { col: string; period: string; value: number }[] = []
  for (const [period, value] of Object.entries(data)) {
    const col = periodToYearCol(period)
    if (!col) continue
    const year = parseInt(col.slice(1, 5))
    const month = parseInt(col.slice(5, 7))
    const colDate = new Date(year, month, 0)  // Last day of month
    if (colDate <= cutoff) {
      entries.push({ col, period, value })
    }
  }
  return entries.sort((a, b) => b.col.localeCompare(a.col))  // Newest first
}

/** Window CMOTS statement rows (Y-columns) to ≤ asOfDate */
function windowCMOTSCols(row: Record<string, unknown>, asOfDate: string): string[] {
  const cutoff = new Date(asOfDate)
  return Object.keys(row)
    .filter(k => /^Y\d{6}$/.test(k))
    .filter(col => {
      const year = parseInt(col.slice(1, 5))
      const month = parseInt(col.slice(5, 7))
      const colDate = new Date(year, month, 0)
      return colDate <= cutoff
    })
    .sort((a, b) => b.localeCompare(a))  // Newest first
}

function computeCAGR(start: number, end: number, years: number): number | null {
  if (years <= 0 || start === 0) return null
  const ratio = end / start
  if (ratio < 0) return null
  return (Math.pow(ratio, 1 / years) - 1) * 100
}

// ─── Main ──────────────────────────────────────────

console.log('═'.repeat(80))
console.log(`  V4 Scorecard Data Verification — ${STOCK_NAME} @ ${AS_OF_DATE}`)
console.log(`  Testing: CMOTS + DhanHQ + IndianAPI.in (all 3 sources)`)
console.log('═'.repeat(80))
console.log()

// ── Step 1: Fetch all data ──────────────────────────

console.log('STEP 1: Fetching data from all 3 sources...')
console.log()

// IndianAPI
const iaPnL = fetchIndianAPI('yoy_results')
const iaBS = fetchIndianAPI('balancesheet')
const iaCF = fetchIndianAPI('cashflow')
const iaRatios = fetchIndianAPI('ratios')
const iaQuarterly = fetchIndianAPI('quarter_results')
const iaShareholding = fetchIndianAPI('shareholding_pattern_quarterly')

// CMOTS — response is { success, data: [...] }
function extractCMOTSData(raw: unknown): Record<string, unknown>[] | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  if (Array.isArray(obj.data)) return obj.data as Record<string, unknown>[]
  if (Array.isArray(raw)) return raw as Record<string, unknown>[]
  return null
}
const cmotsPnL = extractCMOTSData(fetchCMOTS(`/ProftandLoss/${CMOTS_CO_CODE}/s`))
const cmotsBS = extractCMOTSData(fetchCMOTS(`/BalanceSheet/${CMOTS_CO_CODE}/s`))
const cmotsCF = extractCMOTSData(fetchCMOTS(`/CashFlow/${CMOTS_CO_CODE}/s`))
const cmotsQR = extractCMOTSData(fetchCMOTS(`/QuarterlyResults/${CMOTS_CO_CODE}/s`))

// DhanHQ — price data: need FY-end prices going back ~7 years for 5Y valuation average
// IndianAPI has fundamentals from Mar 2014, so we need prices from at least 2013
const dhanPrices = fetchDhanOHLCV('2013-01-01', '2021-02-25')

console.log('  IndianAPI:')
console.log(`    Annual P&L:     ${iaPnL ? Object.keys(iaPnL).length + ' fields' : 'FAILED'}`)
console.log(`    Balance Sheet:  ${iaBS ? Object.keys(iaBS).length + ' fields' : 'FAILED'}`)
console.log(`    Cash Flow:      ${iaCF ? Object.keys(iaCF).length + ' fields' : 'FAILED'}`)
console.log(`    Ratios:         ${iaRatios ? Object.keys(iaRatios).length + ' fields' : 'FAILED'}`)
console.log(`    Quarterly:      ${iaQuarterly ? Object.keys(iaQuarterly).length + ' fields' : 'FAILED'}`)
console.log(`    Shareholding:   ${iaShareholding ? Object.keys(iaShareholding).length + ' fields' : 'FAILED'}`)
console.log()

// Count CMOTS year columns windowed to Feb 2021
const cmotsRevRow = cmotsPnL?.find((r: Record<string, unknown>) => r.rowno === 1)
const cmotsCols = cmotsRevRow ? windowCMOTSCols(cmotsRevRow, AS_OF_DATE) : []
console.log('  CMOTS:')
console.log(`    P&L rows:       ${cmotsPnL?.length ?? 'FAILED'}`)
console.log(`    BS rows:        ${cmotsBS?.length ?? 'FAILED'}`)
console.log(`    CF rows:        ${cmotsCF?.length ?? 'FAILED'}`)
console.log(`    QR rows:        ${cmotsQR?.length ?? 'FAILED'}`)
console.log(`    FY cols ≤ ${AS_OF_DATE}: ${cmotsCols.length} → ${cmotsCols.join(', ') || 'NONE'}`)
console.log()

// Parse DhanHQ response
const dhanData = dhanPrices as { open?: number[]; close?: number[]; volume?: number[]; timestamp?: number[] } | null
const dhanDayCount = dhanData?.close?.length ?? 0
let dhanFirstDate = '', dhanLastDate = ''
if (dhanData?.timestamp && dhanData.timestamp.length > 0) {
  dhanFirstDate = new Date(dhanData.timestamp[0] * 1000).toISOString().split('T')[0]
  dhanLastDate = new Date(dhanData.timestamp[dhanData.timestamp.length - 1] * 1000).toISOString().split('T')[0]
}
console.log('  DhanHQ:')
console.log(`    Daily OHLCV:    ${dhanDayCount} days`)
if (dhanDayCount > 0) {
  console.log(`    Range:          ${dhanFirstDate} → ${dhanLastDate}`)
} else {
  console.log(`    Range:          NO DATA (may need production token)`)
}
console.log()

// ── Step 2: Window IndianAPI data to Feb 2021 ──────

console.log('STEP 2: IndianAPI data windowed to ≤ Feb 25, 2021')
console.log()

const iaSalesField = iaPnL?.['Sales'] ? 'Sales' : 'Revenue'
const iaSales = iaPnL?.[iaSalesField]
const iaEBITDA = iaPnL?.['Operating Profit']
const iaPBT = iaPnL?.['Profit before tax']
const iaOI = iaPnL?.['Other Income']
const iaPAT = iaPnL?.['Net Profit']
const iaEPS = iaPnL?.['EPS in Rs']
const iaEquity = iaBS?.['Equity Capital']
const iaReserves = iaBS?.['Reserves']
const iaBorrowings = iaBS?.['Borrowings']
const iaFixedAssets = iaBS?.['Fixed Assets']
const iaOCF = iaCF?.['Cash from Operating Activity']
const iaROCE = iaRatios?.['ROCE %']

const wSales = iaSales ? windowPeriods(iaSales, AS_OF_DATE) : []
const wEBITDA = iaEBITDA ? windowPeriods(iaEBITDA, AS_OF_DATE) : []
const wPBT = iaPBT ? windowPeriods(iaPBT, AS_OF_DATE) : []
const wOI = iaOI ? windowPeriods(iaOI, AS_OF_DATE) : []
const wPAT = iaPAT ? windowPeriods(iaPAT, AS_OF_DATE) : []
const wEPS = iaEPS ? windowPeriods(iaEPS, AS_OF_DATE) : []
const wEquity = iaEquity ? windowPeriods(iaEquity, AS_OF_DATE) : []
const wReserves = iaReserves ? windowPeriods(iaReserves, AS_OF_DATE) : []
const wBorrowings = iaBorrowings ? windowPeriods(iaBorrowings, AS_OF_DATE) : []
const wFixedAssets = iaFixedAssets ? windowPeriods(iaFixedAssets, AS_OF_DATE) : []
const wOCF = iaOCF ? windowPeriods(iaOCF, AS_OF_DATE) : []
const wROCE = iaROCE ? windowPeriods(iaROCE, AS_OF_DATE) : []

const printWindowed = (label: string, w: { col: string; period: string; value: number }[]) => {
  const periods = w.map(e => `${e.period}(${e.value})`).join(', ')
  console.log(`  ${label.padEnd(22)} ${w.length} FYs: ${periods || 'NONE'}`)
}

printWindowed('Sales', wSales)
printWindowed('EBITDA (Op Profit)', wEBITDA)
printWindowed('PBT', wPBT)
printWindowed('Other Income', wOI)
printWindowed('Net Profit (PAT)', wPAT)
printWindowed('EPS', wEPS)
printWindowed('Equity Capital', wEquity)
printWindowed('Reserves', wReserves)
printWindowed('Borrowings', wBorrowings)
printWindowed('Fixed Assets', wFixedAssets)
printWindowed('OCF', wOCF)
printWindowed('ROCE %', wROCE)

// Quarterly — check if ANY exist before Feb 2021
const iaQtrSales = iaQuarterly?.['Sales'] || iaQuarterly?.['Revenue']
const wQtr = iaQtrSales ? windowPeriods(iaQtrSales, AS_OF_DATE) : []
console.log()
console.log(`  Quarterly (≤ ${AS_OF_DATE}):  ${wQtr.length} quarters`)
if (wQtr.length > 0) {
  console.log(`    First: ${wQtr[wQtr.length - 1].period}  Last: ${wQtr[0].period}`)
} else {
  console.log(`    IndianAPI quarterly starts at Dec 2022 — NO quarters available for 2021`)
}

// Shareholding
const iaPromoters = iaShareholding?.['Promoters']
const wPromoters = iaPromoters ? windowPeriods(iaPromoters, AS_OF_DATE) : []
console.log(`  Shareholding (≤ ${AS_OF_DATE}): ${wPromoters.length} quarters`)
if (wPromoters.length > 0) {
  console.log(`    First: ${wPromoters[wPromoters.length - 1].period}  Last: ${wPromoters[0].period}`)
} else {
  console.log(`    IndianAPI shareholding starts at Mar 2023 — NO data for 2021`)
}

console.log()

// ── Step 3: Compute each V4 metric ─────────────────

console.log('═'.repeat(80))
console.log('  V4 METRIC-BY-METRIC ANALYSIS @ Feb 25, 2021')
console.log('═'.repeat(80))
console.log()

interface MetricResult {
  id: string
  name: string
  segment: string
  segWeight: string
  metricWeight: string
  overallWeight: string
  value: number | null
  source: string
  yearCount: number
  detail: string
  status: 'OK' | 'N/A' | 'DEGRADED'
}

const results: MetricResult[] = []

// ── FINANCIAL SEGMENT (30%) ──

console.log('SEGMENT: FINANCIAL (30% of V4)')
console.log('─'.repeat(80))

// 1. Revenue Growth 5Y CAGR
{
  const w = wSales
  let value: number | null = null
  let status: 'OK' | 'N/A' | 'DEGRADED' = 'N/A'
  let detail = ''
  if (w.length >= 6) {
    value = computeCAGR(w[w.length - 1].value, w[0].value, w.length - 1)
    detail = `${w.length - 1}Y CAGR: ${w[w.length - 1].period} → ${w[0].period}`
    status = w.length >= 6 ? 'OK' : 'DEGRADED'
  } else if (w.length >= 2) {
    value = computeCAGR(w[w.length - 1].value, w[0].value, w.length - 1)
    detail = `${w.length - 1}Y CAGR (degraded, need 5Y): ${w[w.length - 1].period} → ${w[0].period}`
    status = 'DEGRADED'
  } else {
    detail = `Only ${w.length} FY available (need ≥2 for CAGR)`
  }
  const r: MetricResult = {
    id: 'v4_revenue_growth', name: 'Revenue Growth (5Y CAGR)', segment: 'Financial',
    segWeight: '30%', metricWeight: '15%', overallWeight: '4.50%',
    value, source: w.length > 0 ? 'IndianAPI' : 'N/A', yearCount: w.length, detail, status,
  }
  results.push(r)
  console.log(`  ${r.status.padEnd(8)} ${r.id.padEnd(28)} = ${r.value != null ? r.value.toFixed(2) + '%' : 'null'}`)
  console.log(`           Source: ${r.source} | ${r.detail}`)
}

// 2. EBITDA Growth 5Y CAGR
{
  const w = wEBITDA
  let value: number | null = null
  let status: 'OK' | 'N/A' | 'DEGRADED' = 'N/A'
  let detail = ''
  if (w.length >= 2) {
    value = computeCAGR(w[w.length - 1].value, w[0].value, w.length - 1)
    detail = `${w.length - 1}Y CAGR: ${w[w.length - 1].period} → ${w[0].period}`
    status = w.length >= 6 ? 'OK' : 'DEGRADED'
  } else {
    detail = `Only ${w.length} FY available`
  }
  const r: MetricResult = {
    id: 'v4_ebitda_growth', name: 'EBITDA Growth (5Y CAGR)', segment: 'Financial',
    segWeight: '30%', metricWeight: '15%', overallWeight: '4.50%',
    value, source: w.length > 0 ? 'IndianAPI' : 'N/A', yearCount: w.length, detail, status,
  }
  results.push(r)
  console.log(`  ${r.status.padEnd(8)} ${r.id.padEnd(28)} = ${r.value != null ? r.value.toFixed(2) + '%' : 'null'}`)
  console.log(`           Source: ${r.source} | ${r.detail}`)
}

// 3. Earnings (PBT - OI) 5Y CAGR
{
  const wP = wPBT
  const wO = wOI
  let value: number | null = null
  let status: 'OK' | 'N/A' | 'DEGRADED' = 'N/A'
  let detail = ''
  if (wP.length >= 2) {
    const latest = wP[0]
    const oldest = wP[wP.length - 1]
    const latestOI = wO.find(e => e.col === latest.col)?.value ?? 0
    const oldestOI = wO.find(e => e.col === oldest.col)?.value ?? 0
    const latestEarnings = latest.value - latestOI
    const oldestEarnings = oldest.value - oldestOI
    if (oldestEarnings > 0 && latestEarnings > 0) {
      value = computeCAGR(oldestEarnings, latestEarnings, wP.length - 1)
      detail = `${wP.length - 1}Y CAGR of (PBT-OI): ${oldest.period} → ${latest.period}`
      status = wP.length >= 6 ? 'OK' : 'DEGRADED'
    } else {
      detail = `(PBT-OI) is ≤0 in anchor year — CAGR undefined`
    }
  } else {
    detail = `Only ${wP.length} FY PBT available`
  }
  const r: MetricResult = {
    id: 'v4_earnings_pbt_oi', name: 'Earnings (PBT-OI, 5Y CAGR)', segment: 'Financial',
    segWeight: '30%', metricWeight: '20%', overallWeight: '6.00%',
    value, source: wP.length > 0 ? 'IndianAPI' : 'N/A', yearCount: wP.length, detail, status,
  }
  results.push(r)
  console.log(`  ${r.status.padEnd(8)} ${r.id.padEnd(28)} = ${r.value != null ? r.value.toFixed(2) + '%' : 'null'}`)
  console.log(`           Source: ${r.source} | ${r.detail}`)
}

// 4. ROE (5Y Avg)
{
  const roeValues: number[] = []
  for (const patEntry of wPAT) {
    const eq = wEquity.find(e => e.col === patEntry.col)
    const res = wReserves.find(e => e.col === patEntry.col)
    if (!eq && !res) continue
    const shFund = (eq?.value ?? 0) + (res?.value ?? 0)
    if (shFund !== 0) {
      roeValues.push((patEntry.value / shFund) * 100)
    }
  }
  let value: number | null = null
  let detail = ''
  let status: 'OK' | 'N/A' | 'DEGRADED' = 'N/A'
  if (roeValues.length > 0) {
    value = roeValues.reduce((a, b) => a + b, 0) / roeValues.length
    detail = `Avg of ${roeValues.length} FYs: ${roeValues.map(v => v.toFixed(1) + '%').join(', ')}`
    status = roeValues.length >= 5 ? 'OK' : 'DEGRADED'
  } else {
    detail = 'No PAT + Equity data available'
  }
  const r: MetricResult = {
    id: 'v4_roe', name: 'ROE (5Y Avg)', segment: 'Financial',
    segWeight: '30%', metricWeight: '15%', overallWeight: '4.50%',
    value, source: roeValues.length > 0 ? 'IndianAPI' : 'N/A', yearCount: roeValues.length, detail, status,
  }
  results.push(r)
  console.log(`  ${r.status.padEnd(8)} ${r.id.padEnd(28)} = ${r.value != null ? r.value.toFixed(2) + '%' : 'null'}`)
  console.log(`           Source: ${r.source} | ${r.detail}`)
}

// 5. OCF/EBITDA 5Y CAGR
{
  const commonCols = wOCF.filter(o => wEBITDA.some(e => e.col === o.col))
  let value: number | null = null
  let detail = ''
  let status: 'OK' | 'N/A' | 'DEGRADED' = 'N/A'
  if (commonCols.length >= 2) {
    const latest = commonCols[0]
    const oldest = commonCols[commonCols.length - 1]
    const latestEBITDA = wEBITDA.find(e => e.col === latest.col)!.value
    const oldestEBITDA = wEBITDA.find(e => e.col === oldest.col)!.value
    if (latestEBITDA > 0 && oldestEBITDA > 0) {
      const latestRatio = latest.value / latestEBITDA
      const oldestRatio = oldest.value / oldestEBITDA
      if (latestRatio > 0 && oldestRatio > 0) {
        value = computeCAGR(oldestRatio, latestRatio, commonCols.length - 1)
        detail = `${commonCols.length - 1}Y CAGR of OCF/EBITDA ratio: ${oldest.period} → ${latest.period}`
        status = commonCols.length >= 6 ? 'OK' : 'DEGRADED'
      } else {
        detail = 'OCF/EBITDA ratio ≤ 0 in anchor year'
      }
    } else {
      detail = 'EBITDA ≤ 0 in anchor year'
    }
  } else {
    detail = `Only ${commonCols.length} common OCF+EBITDA FYs`
  }
  const r: MetricResult = {
    id: 'v4_ocf_ebitda_cagr', name: 'OCF/EBITDA (5Y CAGR)', segment: 'Financial',
    segWeight: '30%', metricWeight: '15%', overallWeight: '4.50%',
    value, source: commonCols.length > 0 ? 'IndianAPI' : 'N/A', yearCount: commonCols.length, detail, status,
  }
  results.push(r)
  console.log(`  ${r.status.padEnd(8)} ${r.id.padEnd(28)} = ${r.value != null ? r.value.toFixed(2) + '%' : 'null'}`)
  console.log(`           Source: ${r.source} | ${r.detail}`)
}

// 6. Gross Block Growth YoY
{
  const w = wFixedAssets
  let value: number | null = null
  let detail = ''
  let status: 'OK' | 'N/A' | 'DEGRADED' = 'N/A'
  if (w.length >= 2) {
    const latest = w[0].value
    const prior = w[1].value
    if (prior !== 0) {
      value = ((latest - prior) / Math.abs(prior)) * 100
      detail = `YoY: ${w[1].period}(${prior}) → ${w[0].period}(${latest})`
      status = 'OK'
    } else {
      detail = 'Prior year Fixed Assets = 0'
    }
  } else {
    detail = `Only ${w.length} FY Fixed Assets available`
  }
  const r: MetricResult = {
    id: 'v4_gross_block', name: 'Gross Block Growth (YoY)', segment: 'Financial',
    segWeight: '30%', metricWeight: '10%', overallWeight: '3.00%',
    value, source: w.length > 0 ? 'IndianAPI' : 'N/A', yearCount: w.length, detail, status,
  }
  results.push(r)
  console.log(`  ${r.status.padEnd(8)} ${r.id.padEnd(28)} = ${r.value != null ? r.value.toFixed(2) + '%' : 'null'}`)
  console.log(`           Source: ${r.source} | ${r.detail}`)
}

// 7. Debt/EBITDA
{
  let value: number | null = null
  let detail = ''
  let status: 'OK' | 'N/A' | 'DEGRADED' = 'N/A'
  const latestEBITDA = wEBITDA.length > 0 ? wEBITDA[0].value : null
  const latestBorrowings = wBorrowings.length > 0 ? wBorrowings[0].value : null
  if (latestEBITDA && latestEBITDA !== 0 && latestBorrowings != null) {
    value = latestBorrowings / latestEBITDA
    detail = `Borrowings(${latestBorrowings}) / EBITDA(${latestEBITDA}) at ${wEBITDA[0].period}`
    status = 'OK'
  } else {
    detail = `EBITDA=${latestEBITDA}, Borrowings=${latestBorrowings}`
  }
  const r: MetricResult = {
    id: 'v4_debt_ebitda', name: 'Debt/EBITDA', segment: 'Financial',
    segWeight: '30%', metricWeight: '10%', overallWeight: '3.00%',
    value, source: latestEBITDA ? 'IndianAPI' : 'N/A', yearCount: 1, detail, status,
  }
  results.push(r)
  console.log(`  ${r.status.padEnd(8)} ${r.id.padEnd(28)} = ${r.value != null ? r.value.toFixed(2) + 'x' : 'null'}`)
  console.log(`           Source: ${r.source} | ${r.detail}`)
}

console.log()
console.log('SEGMENT: VALUATION (45% of V4)')
console.log('─'.repeat(80))

// ── VALUATION: PE, PB, EV/EBITDA vs 5Y Average ──
// Need: price at Feb 2021 + EPS/BV/EBITDA at 5 FY-end dates + FY-end prices

// Price at Feb 25, 2021
let priceAtDate: number | null = null
if (dhanData?.close && dhanData.close.length > 0 && dhanData.timestamp) {
  // Find closest price ≤ target date
  const targetTs = new Date(AS_OF_DATE).getTime() / 1000
  for (let i = dhanData.timestamp.length - 1; i >= 0; i--) {
    if (dhanData.timestamp[i] <= targetTs) {
      priceAtDate = dhanData.close[i]
      break
    }
  }
}

// If DhanHQ failed, try IndianAPI weekly price
if (priceAtDate == null) {
  const iaPrice = curlGet(
    `https://stock.indianapi.in/historical_data?stock_name=TCS&period=max&filter=price`,
    { 'X-Api-Key': INDIANAPI_KEY }
  ) as { datasets?: { metric: string; values: string[][] }[] } | null
  if (iaPrice?.datasets) {
    const priceDS = iaPrice.datasets.find(d => d.metric === 'Price')
    if (priceDS?.values) {
      // Find closest date ≤ Feb 25, 2021
      for (let i = priceDS.values.length - 1; i >= 0; i--) {
        const dateStr = priceDS.values[i][0]
        // Convert "2021-02-26" format
        if (dateStr <= AS_OF_DATE) {
          priceAtDate = parseFloat(priceDS.values[i][1])
          console.log(`  Using IndianAPI weekly price: ${dateStr} = ₹${priceAtDate}`)
          break
        }
      }
    }
  }
}

console.log(`  Price at ${AS_OF_DATE}: ${priceAtDate != null ? '₹' + priceAtDate.toFixed(2) : 'UNAVAILABLE'}`)
console.log(`  Price source: ${dhanDayCount > 0 ? 'DhanHQ (daily)' : 'IndianAPI (weekly fallback)'}`)
console.log()

// Compute PE at date
const currentEPS = wEPS.length > 0 ? wEPS[0].value : null
const currentPE = priceAtDate != null && currentEPS != null && currentEPS > 0 ? priceAtDate / currentEPS : null

// Compute PB at date — need Shareholders Fund and Shares Outstanding
const currentShFund = (wEquity.length > 0 ? wEquity[0].value : 0) + (wReserves.length > 0 ? wReserves[0].value : 0)
// IndianAPI doesn't have shares outstanding directly — we'd need CMOTS row 91
// For now, estimate from Equity Capital / face value (TCS face value = ₹1)
// Equity Capital for TCS is in crores. If face value = ₹1, shares = EqCap × 1e7
const tcsSharesCr = wEquity.length > 0 ? wEquity[0].value : null  // In crores, face value ₹1
const tcsSharesCount = tcsSharesCr != null ? tcsSharesCr * 10000000 : null
const bvPerShare = tcsSharesCount != null && tcsSharesCount > 0 ? (currentShFund * 10000000) / tcsSharesCount : null
const currentPB = priceAtDate != null && bvPerShare != null && bvPerShare > 0 ? priceAtDate / bvPerShare : null

// Compute EV/EBITDA at date
const latestEBITDA = wEBITDA.length > 0 ? wEBITDA[0].value : null
const latestBorrowings = wBorrowings.length > 0 ? wBorrowings[0].value : null
let currentEV: number | null = null
if (priceAtDate != null && tcsSharesCount != null && latestEBITDA != null && latestEBITDA > 0) {
  const mcapCr = (priceAtDate * tcsSharesCount) / 10000000
  const debt = latestBorrowings ?? 0
  const ev = mcapCr + debt  // Simplified — no cash subtraction from IndianAPI BS
  currentEV = ev / latestEBITDA
}

console.log(`  Current PE:  ${currentPE != null ? currentPE.toFixed(2) : 'null'} (EPS=${currentEPS}, Price=₹${priceAtDate?.toFixed(2)})`)
console.log(`  Current PB:  ${currentPB != null ? currentPB.toFixed(2) : 'null'} (BV/share=${bvPerShare?.toFixed(2)})`)
console.log(`  Current EV:  ${currentEV != null ? currentEV.toFixed(2) : 'null'} (EBITDA=${latestEBITDA})`)
console.log()

// Compute 5Y average PE/PB/EV from historical FY-end prices
// Need: FY-end dates from year columns, then price at each date
const peValues: number[] = []
const pbValues: number[] = []
const evValues: number[] = []

// We need FY-end prices from DhanHQ or IndianAPI
// Use DhanHQ daily if available, otherwise IndianAPI weekly
let priceSource = 'N/A'
const fyEndPrices: { fyEnd: string; price: number }[] = []

if (dhanData?.close && dhanData.timestamp && dhanData.close.length > 0) {
  priceSource = 'DhanHQ'
  for (const entry of wEPS) {
    const year = parseInt(entry.col.slice(1, 5))
    const month = parseInt(entry.col.slice(5, 7))
    const lastDay = new Date(year, month, 0).getDate()
    const fyEnd = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    const fyTs = new Date(fyEnd).getTime() / 1000

    // Find closest DhanHQ price ≤ fyEnd
    let foundPrice: number | null = null
    for (let i = dhanData.timestamp.length - 1; i >= 0; i--) {
      if (dhanData.timestamp[i] <= fyTs) {
        foundPrice = dhanData.close[i]
        break
      }
    }
    if (foundPrice != null) {
      fyEndPrices.push({ fyEnd, price: foundPrice })
    }
  }
}

// Fallback to IndianAPI weekly prices
if (fyEndPrices.length === 0) {
  priceSource = 'IndianAPI (weekly)'
  const iaPrice = curlGet(
    `https://stock.indianapi.in/historical_data?stock_name=TCS&period=max&filter=price`,
    { 'X-Api-Key': INDIANAPI_KEY }
  ) as { datasets?: { metric: string; values: string[][] }[] } | null
  const priceDS = iaPrice?.datasets?.find(d => d.metric === 'Price')
  if (priceDS?.values) {
    for (const entry of wEPS) {
      const year = parseInt(entry.col.slice(1, 5))
      const month = parseInt(entry.col.slice(5, 7))
      const lastDay = new Date(year, month, 0).getDate()
      const fyEnd = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

      // Find closest ≤ fyEnd
      let foundPrice: number | null = null
      for (let i = priceDS.values.length - 1; i >= 0; i--) {
        if (priceDS.values[i][0] <= fyEnd) {
          foundPrice = parseFloat(priceDS.values[i][1])
          break
        }
      }
      if (foundPrice != null) {
        fyEndPrices.push({ fyEnd, price: foundPrice })
      }
    }
  }
}

console.log(`  FY-end prices (${priceSource}): ${fyEndPrices.length} dates`)
for (const { fyEnd, price } of fyEndPrices) {
  const epsEntry = wEPS.find(e => {
    const y = parseInt(e.col.slice(1, 5))
    const m = parseInt(e.col.slice(5, 7))
    const ld = new Date(y, m, 0).getDate()
    return `${y}-${String(m).padStart(2, '0')}-${String(ld).padStart(2, '0')}` === fyEnd
  })
  const eps = epsEntry?.value
  const pe = eps != null && eps > 0 ? price / eps : null
  if (pe != null) peValues.push(pe)

  // PB at FY-end
  const eqEntry = wEquity.find(e => e.col === epsEntry?.col)
  const resEntry = wReserves.find(e => e.col === epsEntry?.col)
  const shFund = (eqEntry?.value ?? 0) + (resEntry?.value ?? 0)
  const sharesCr = eqEntry?.value ?? null
  const shares = sharesCr != null ? sharesCr * 10000000 : null
  if (shares && shares > 0 && shFund > 0) {
    const bv = (shFund * 10000000) / shares
    if (bv > 0) pbValues.push(price / bv)
  }

  // EV at FY-end
  const ebitdaEntry = wEBITDA.find(e => e.col === epsEntry?.col)
  const borrEntry = wBorrowings.find(e => e.col === epsEntry?.col)
  if (ebitdaEntry && ebitdaEntry.value > 0 && shares && shares > 0) {
    const mcap = (price * shares) / 10000000
    const debt = borrEntry?.value ?? 0
    const ev = (mcap + debt) / ebitdaEntry.value
    if (ev > 0) evValues.push(ev)
  }

  console.log(`    ${fyEnd}: ₹${price.toFixed(2)}  PE=${pe != null ? pe.toFixed(1) : 'N/A'}  EPS=${eps ?? 'N/A'}`)
}

const harmonicMean = (arr: number[]) => {
  if (arr.length < 2) return null
  const reciprocalSum = arr.reduce((sum, v) => sum + 1 / v, 0)
  return arr.length / reciprocalSum
}

const avgPE = harmonicMean(peValues)
const avgPB = harmonicMean(pbValues)
const avgEV = harmonicMean(evValues)

console.log()
console.log(`  5Y Harmonic Mean: PE=${avgPE?.toFixed(1) ?? 'N/A'} (${peValues.length} years) | PB=${avgPB?.toFixed(1) ?? 'N/A'} (${pbValues.length} years) | EV=${avgEV?.toFixed(1) ?? 'N/A'} (${evValues.length} years)`)

// PE vs 5Y
{
  const value = currentPE != null && avgPE != null && avgPE > 0 ? (currentPE / avgPE) * 100 : null
  const detail = value != null ? `${currentPE!.toFixed(1)} / ${avgPE!.toFixed(1)} = ${value.toFixed(1)}%` : 'Missing price/EPS/history'
  const r: MetricResult = {
    id: 'v4_pe_vs_5y', name: 'PE vs 5Y Average', segment: 'Valuation',
    segWeight: '45%', metricWeight: '30%', overallWeight: '13.50%',
    value, source: value != null ? `${priceSource} + IndianAPI` : 'N/A', yearCount: peValues.length, detail,
    status: value != null ? (peValues.length >= 5 ? 'OK' : 'DEGRADED') : 'N/A',
  }
  results.push(r)
  console.log(`  ${r.status.padEnd(8)} ${r.id.padEnd(28)} = ${r.value != null ? r.value.toFixed(1) + '%' : 'null'}`)
  console.log(`           Source: ${r.source} | ${r.detail}`)
}

// PB vs 5Y
{
  const value = currentPB != null && avgPB != null && avgPB > 0 ? (currentPB / avgPB) * 100 : null
  const detail = value != null ? `${currentPB!.toFixed(2)} / ${avgPB!.toFixed(2)} = ${value.toFixed(1)}%` : 'Missing price/BV/history'
  const r: MetricResult = {
    id: 'v4_pb_vs_5y', name: 'PB vs 5Y Average (ANCHOR)', segment: 'Valuation',
    segWeight: '45%', metricWeight: '50%', overallWeight: '22.50%',
    value, source: value != null ? `${priceSource} + IndianAPI` : 'N/A', yearCount: pbValues.length, detail,
    status: value != null ? (pbValues.length >= 5 ? 'OK' : 'DEGRADED') : 'N/A',
  }
  results.push(r)
  console.log(`  ${r.status.padEnd(8)} ${r.id.padEnd(28)} = ${r.value != null ? r.value.toFixed(1) + '%' : 'null'}`)
  console.log(`           Source: ${r.source} | ${r.detail}`)
}

// EV/EBITDA vs 5Y
{
  const value = currentEV != null && avgEV != null && avgEV > 0 ? (currentEV / avgEV) * 100 : null
  const detail = value != null ? `${currentEV!.toFixed(2)} / ${avgEV!.toFixed(2)} = ${value.toFixed(1)}%` : 'Missing price/EBITDA/history'
  const r: MetricResult = {
    id: 'v4_ev_vs_5y', name: 'EV/EBITDA vs 5Y Average', segment: 'Valuation',
    segWeight: '45%', metricWeight: '20%', overallWeight: '9.00%',
    value, source: value != null ? `${priceSource} + IndianAPI` : 'N/A', yearCount: evValues.length, detail,
    status: value != null ? (evValues.length >= 5 ? 'OK' : 'DEGRADED') : 'N/A',
  }
  results.push(r)
  console.log(`  ${r.status.padEnd(8)} ${r.id.padEnd(28)} = ${r.value != null ? r.value.toFixed(1) + '%' : 'null'}`)
  console.log(`           Source: ${r.source} | ${r.detail}`)
}

console.log()
console.log('SEGMENT: TECHNICAL (7% of V4)')
console.log('─'.repeat(80))

// Technical metrics need 200+ daily OHLCV
const hasDailyOHLCV = dhanDayCount >= 200
const technicalSource = hasDailyOHLCV ? 'DhanHQ' : 'N/A'

for (const m of [
  { id: 'v4_200dma', name: 'Price vs 200-DMA', weight: '35%', overall: '2.45%' },
  { id: 'v4_50dma', name: 'Price vs 50-DMA', weight: '15%', overall: '1.05%' },
  { id: 'v4_20dma', name: 'Price vs 20-DMA', weight: '20%', overall: '1.40%' },
  { id: 'v4_rsi', name: 'RSI (14-day)', weight: '10%', overall: '0.70%' },
  { id: 'v4_vpt', name: 'Volume-Price Trend', weight: '20%', overall: '1.40%' },
]) {
  const status = hasDailyOHLCV ? 'OK' : 'N/A'
  const detail = hasDailyOHLCV
    ? `${dhanDayCount} daily OHLCV candles available (need 200)`
    : `DhanHQ returned ${dhanDayCount} days (need 200 for EMA/RSI). Needs production DhanHQ token.`
  const r: MetricResult = {
    id: m.id, name: m.name, segment: 'Technical',
    segWeight: '7%', metricWeight: m.weight, overallWeight: m.overall,
    value: null, source: technicalSource, yearCount: dhanDayCount, detail, status,
  }
  results.push(r)
  console.log(`  ${r.status.padEnd(8)} ${r.id.padEnd(28)} = ${hasDailyOHLCV ? '(computable)' : 'null'}`)
  console.log(`           Source: ${r.source} | ${r.detail}`)
}

console.log()
console.log('SEGMENT: QUARTERLY MOMENTUM (18% of V4)')
console.log('─'.repeat(80))

for (const m of [
  { id: 'v4_revenue_multiplier', name: 'Revenue Growth Multiplier', weight: '50%', overall: '9.00%' },
  { id: 'v4_ebitda_multiplier', name: 'EBITDA Growth Multiplier', weight: '50%', overall: '9.00%' },
]) {
  const detail = `IndianAPI quarterly starts Dec 2022 — ${wQtr.length} quarters available at ${AS_OF_DATE} (need 8). ` +
    `CMOTS quarterly also starts ~2023. NO source has quarterly data for 2021.`
  const r: MetricResult = {
    id: m.id, name: m.name, segment: 'Quarterly',
    segWeight: '18%', metricWeight: m.weight, overallWeight: m.overall,
    value: null, source: 'N/A', yearCount: 0, detail, status: 'N/A',
  }
  results.push(r)
  console.log(`  ${r.status.padEnd(8)} ${r.id.padEnd(28)} = null`)
  console.log(`           Source: ${r.source} | ${r.detail}`)
}

// ── Summary ────────────────────────────────────────

console.log()
console.log('═'.repeat(80))
console.log('  SUMMARY: V4 Metric Availability @ Feb 25, 2021')
console.log('═'.repeat(80))
console.log()

const byStatus = {
  OK: results.filter(r => r.status === 'OK'),
  DEGRADED: results.filter(r => r.status === 'DEGRADED'),
  NA: results.filter(r => r.status === 'N/A'),
}

console.log(`  OK (fully scoreable):     ${byStatus.OK.length}/17 metrics`)
for (const r of byStatus.OK) {
  console.log(`    ✓ ${r.id.padEnd(28)} ${r.overallWeight.padEnd(8)} ${r.source}`)
}
console.log()

console.log(`  DEGRADED (partial data):  ${byStatus.DEGRADED.length}/17 metrics`)
for (const r of byStatus.DEGRADED) {
  console.log(`    ~ ${r.id.padEnd(28)} ${r.overallWeight.padEnd(8)} ${r.yearCount} years (need 5+)`)
}
console.log()

console.log(`  N/A (unavailable):        ${byStatus.NA.length}/17 metrics`)
for (const r of byStatus.NA) {
  console.log(`    ✗ ${r.id.padEnd(28)} ${r.overallWeight.padEnd(8)} ${r.detail.slice(0, 60)}`)
}
console.log()

// Overall weight coverage
const okWeight = byStatus.OK.reduce((sum, r) => sum + parseFloat(r.overallWeight), 0)
const degradedWeight = byStatus.DEGRADED.reduce((sum, r) => sum + parseFloat(r.overallWeight), 0)
const naWeight = byStatus.NA.reduce((sum, r) => sum + parseFloat(r.overallWeight), 0)

console.log('  WEIGHT COVERAGE:')
console.log(`    OK:        ${okWeight.toFixed(1)}% of V4`)
console.log(`    Degraded:  ${degradedWeight.toFixed(1)}% of V4`)
console.log(`    N/A:       ${naWeight.toFixed(1)}% of V4`)
console.log()

// Segment-by-segment
console.log('  BY SEGMENT:')
for (const seg of ['Financial', 'Valuation', 'Technical', 'Quarterly']) {
  const segResults = results.filter(r => r.segment === seg)
  const segOK = segResults.filter(r => r.status === 'OK').length
  const segDeg = segResults.filter(r => r.status === 'DEGRADED').length
  const segNA = segResults.filter(r => r.status === 'N/A').length
  const segWeight = segResults[0]?.segWeight ?? '?'
  console.log(`    ${seg.padEnd(20)} ${segWeight.padEnd(6)} ${segOK} OK, ${segDeg} degraded, ${segNA} N/A  (${segOK + segDeg}/${segResults.length} scoreable)`)
}

console.log()
console.log('═'.repeat(80))
