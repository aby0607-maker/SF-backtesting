/**
 * Verification Script: Bharti Airtel V4 Non-Banking Scorecard
 *
 * Fetches CMOTS data directly, computes V4 metrics at a given date,
 * and prints a comparison table against the CSV reference values.
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/verify-bharti-v4.ts
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { resolveMetricsAtDate } from '@/services/metricResolver'
import { scoreStock } from '@/lib/scoringEngine'
import { V4_NONBANKING_SCORECARD } from '@/data/scorecardTemplates'
import {
  findStatementRow,
  getStatementValue,
  getYearColumns,
} from '@/services/cmots/fundamentals'
import type { FundamentalsBundle } from '@/services/cmots/fundamentals'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ─── Config ────────────────────────────────────────
const CO_CODE = 15542        // Bharti Airtel (CMOTS co_code, NOT BSE scrip code)
const AS_OF_DATE = '2026-01-06'
const CMOTS_BASE = 'https://deltastockzapis.cmots.com/api'

// Read token from .env.local
const envPath = resolve(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const tokenMatch = envContent.match(/CMOTS_API_TOKEN=(.+)/)
const TOKEN = tokenMatch?.[1]?.trim()
if (!TOKEN) throw new Error('CMOTS_API_TOKEN not found in .env.local')

// ─── CMOTS Fetch Helper ───────────────────────────
async function cmotsFetch<T>(endpoint: string): Promise<T[]> {
  const url = `${CMOTS_BASE}${endpoint}`
  console.log(`  Fetching: ${endpoint}`)

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  })

  if (!res.ok) {
    console.warn(`  WARN: ${endpoint} → ${res.status} ${res.statusText}`)
    return []
  }

  const json = await res.json()

  // Handle both raw array and envelope formats
  if (Array.isArray(json)) return json
  if (json?.data && Array.isArray(json.data)) return json.data
  return []
}

// ─── Main ──────────────────────────────────────────
async function main() {
  console.log(`\n🔍 Verifying Bharti Airtel (co_code=${CO_CODE}) at ${AS_OF_DATE}\n`)
  console.log('Fetching CMOTS data...')

  // Fetch all endpoints in parallel
  const [ttmArr, finData, pnl, cashFlow, balanceSheet, quarterly, shareholding, priceData] =
    await Promise.all([
      cmotsFetch<any>(`/TTMData/${CO_CODE}/s`),
      cmotsFetch<any>(`/FinData/${CO_CODE}/s`),
      cmotsFetch<any>(`/ProftandLoss/${CO_CODE}/s`),
      cmotsFetch<any>(`/CashFlow/${CO_CODE}/s`),
      cmotsFetch<any>(`/BalanceSheet/${CO_CODE}/s`),
      cmotsFetch<any>(`/QuarterlyResults/${CO_CODE}/s`),
      cmotsFetch<any>(`/ShareholdingHistory/${CO_CODE}/s`),
      cmotsFetch<any>(`/AdjustedPriceChart/bse/${CO_CODE}/2020-01-06/2026-02-25`),
    ])

  console.log(`\n  TTM: ${ttmArr.length} records`)
  console.log(`  FinData: ${finData.length} records`)
  console.log(`  P&L: ${pnl.length} rows`)
  console.log(`  CashFlow: ${cashFlow.length} rows`)
  console.log(`  BalanceSheet: ${balanceSheet.length} rows`)
  console.log(`  Quarterly: ${quarterly.length} rows`)
  console.log(`  Shareholding: ${shareholding.length} records`)
  console.log(`  Price data: ${priceData.length} bars`)

  // Sort FinData ascending by yrc (oldest first) — mirrors getFinancialData() in fundamentals.ts
  finData.sort((a: any, b: any) => a.yrc - b.yrc)

  // Build FundamentalsBundle
  const fundamentals: FundamentalsBundle = {
    ttm: ttmArr[0] ?? null,
    finData,
    pnl,
    cashFlow,
    balanceSheet,
    quarterly,
    shareholding,
  }

  // Convert price data to the format resolveMetricsAtDate expects
  const priceHistory = priceData.map((p: any) => ({
    date: p.Tradedate?.split('T')[0] ?? p.tradedate?.split('T')[0] ?? '',
    price: p.Dayclose ?? p.dayclose ?? 0,
    volume: p.TotalVolume ?? p.totalvolume ?? 0,
  })).filter((p: any) => p.date && p.price > 0)

  // Sort price history ascending by date — resolveMetricsAtDate uses binary search (ascending)
  priceHistory.sort((a: any, b: any) => a.date.localeCompare(b.date))

  console.log(`  Usable price bars: ${priceHistory.length}`)

  // ─── Resolve Metrics ─────────────────────────────
  console.log(`\nResolving metrics at ${AS_OF_DATE}...`)
  const resolved = resolveMetricsAtDate(fundamentals, priceHistory, AS_OF_DATE)

  // ─── Score ────────────────────────────────────────
  console.log('Scoring against V4 Non-Banking Scorecard...')
  const result = scoreStock(
    resolved.data,
    V4_NONBANKING_SCORECARD,
    {
      id: '15542',
      name: 'Bharti Airtel Ltd',
      symbol: 'BHARTIARTL',
      sector: 'Telecom',
      marketCap: 1000000,
    },
    resolved.context,
  )

  // ─── Print Results ────────────────────────────────
  console.log('\n' + '═'.repeat(80))
  console.log('  BHARTI AIRTEL V4 SCORECARD — ENGINE vs CSV REFERENCE')
  console.log('═'.repeat(80))

  // Financial metrics
  const financialMetrics = [
    { id: 'v4_revenue_growth',   label: 'Revenue Growth',   csvRaw: '14%',    csvScore: 80 },
    { id: 'v4_ebitda_growth',    label: 'EBITDA Growth',    csvRaw: '19.3%',  csvScore: 95 },
    { id: 'v4_earnings_pbt_oi',  label: 'Earnings (PBT-OI)', csvRaw: 'NA',    csvScore: 0 },
    { id: 'v4_roe',              label: 'ROE (5Y Avg)',     csvRaw: '5.64%',  csvScore: 45 },
    { id: 'v4_ocf_ebitda_cagr',  label: 'OCF/EBITDA CAGR',  csvRaw: '17.85%', csvScore: 95 },
    { id: 'v4_gross_block',      label: 'Gross Block',      csvRaw: '2.2%',   csvScore: 45 },
    { id: 'v4_debt_ebitda',      label: 'Debt/EBITDA',      csvRaw: '1.17',   csvScore: 80 },
  ]

  console.log('\n── FINANCIAL METRICS ──')
  console.log(
    'Metric'.padEnd(22) +
    'Engine Raw'.padEnd(14) +
    'CSV Raw'.padEnd(12) +
    'Engine Score'.padEnd(14) +
    'CSV Score'.padEnd(12) +
    'Status'
  )
  console.log('─'.repeat(80))

  // Find segment results (V4 segment IDs are prefixed with 'v4_')
  const finSegment = result.segmentResults.find(s => s.segmentId === 'v4_financial')
  const valSegment = result.segmentResults.find(s => s.segmentId === 'v4_valuation')
  const techSegment = result.segmentResults.find(s => s.segmentId === 'v4_technical')
  const qmSegment = result.segmentResults.find(s => s.segmentId === 'v4_quarterly_momentum')

  for (const m of financialMetrics) {
    const raw = resolved.data[m.id]
    const metricScore = finSegment?.metricScores.find(ms => ms.metricId === m.id)
    const engScore = metricScore?.normalizedScore ?? 0
    const excluded = metricScore?.isExcluded ?? false
    const engStatus = excluded ? 'Excl' : (metricScore ? 'scored' : 'N/A')
    const rawStr = raw != null ? raw.toFixed(2) : 'null'
    const scoreMatch = engScore === m.csvScore ? '✅' : '❌'
    const statusStr = engStatus !== 'scored' ? ` [${engStatus}]` : ''
    console.log(
      m.label.padEnd(22) +
      rawStr.padEnd(14) +
      m.csvRaw.padEnd(12) +
      String(engScore).padEnd(14) +
      String(m.csvScore).padEnd(12) +
      scoreMatch + statusStr
    )
  }

  // Segment scores
  console.log('\n── SEGMENT SCORES ──')
  console.log(
    'Segment'.padEnd(22) +
    'Engine'.padEnd(14) +
    'CSV'.padEnd(14) +
    'Match'
  )
  console.log('─'.repeat(60))

  const segments = [
    { seg: finSegment, label: 'Financial', csv: 59.75 },
    { seg: valSegment, label: 'Valuation', csv: 76.5 },
    { seg: techSegment, label: 'Technical', csv: 42.5 },
    { seg: qmSegment, label: 'QM', csv: 60 },
  ]

  for (const s of segments) {
    const score = s.seg?.segmentScore ?? 0
    const match = Math.abs(score - s.csv) < 1 ? '✅' : score === 0 ? '⚠️ N/A' : '⚠️ data timing'
    console.log(
      s.label.padEnd(22) +
      score.toFixed(2).padEnd(14) +
      String(s.csv).padEnd(14) +
      match
    )
  }

  // Composite
  console.log('\n── COMPOSITE ──')
  const composite = result.normalizedScore
  console.log(`  Engine:  ${composite.toFixed(2)}  Verdict: ${result.verdict}`)
  console.log(`  CSV:     66.13      Verdict: BUY`)

  // Key checks
  console.log('\n── BUG FIX VERIFICATION ──')
  const roeRaw = resolved.data['v4_roe']
  const ocfRaw = resolved.data['v4_ocf_ebitda_cagr']
  const ocfMetric = finSegment?.metricScores.find(ms => ms.metricId === 'v4_ocf_ebitda_cagr')

  const ocfExcluded = ocfMetric?.isExcluded ?? true
  console.log(`  Bug #6 (ROE):        ${roeRaw != null ? roeRaw.toFixed(2) + '%' : 'null'}  — ${roeRaw != null && roeRaw > 0 ? '✅ POSITIVE (was -2.54)' : '❌ STILL NEGATIVE'}`)
  console.log(`  Bug #7 (OCF/EBITDA): ${ocfRaw != null ? ocfRaw.toFixed(2) + '%' : 'null'}  — excluded: ${ocfExcluded}  ${!ocfExcluded ? '✅ SCORED (was Excl)' : ocfRaw == null ? '⚠️ null raw value' : '❌ STILL EXCLUDED'}`)
  console.log(`  QM Score:            ${(qmSegment?.segmentScore ?? 0).toFixed(2)}  — ${Math.abs((qmSegment?.segmentScore ?? 0) - 60) < 1 ? '✅ matches CSV' : '⚠️ differs'}`)

  // All V4 metrics dump
  console.log('\n── ALL V4 METRICS (raw dump) ──')
  const v4Keys = Object.keys(resolved.data)
    .filter(k => k.startsWith('v4_'))
    .sort()
  for (const key of v4Keys) {
    const val = resolved.data[key]
    const ctx = resolved.context?.[key]
    const ctxStr = ctx ? `  ctx: start=${ctx.startValue?.toFixed(2)}, end=${ctx.endValue?.toFixed(2)}` : ''
    console.log(`  ${key.padEnd(28)} = ${val != null ? val.toFixed(4) : 'null'}${ctxStr}`)
  }

  // ═══════════════════════════════════════════════════
  // DEBUG SECTIONS — Detailed data for Bugs #8-#12
  // ═══════════════════════════════════════════════════

  // ─── Local helper: windowYearColumns (mirrors metricResolver internal) ───
  function windowCols(row: any, asOf: string): string[] {
    const allCols = getYearColumns(row) // newest first
    const cutoff = new Date(asOf)
    return allCols.filter((col: string) => {
      const yr = parseInt(col.slice(1, 5))
      const mo = Math.min(12, Math.max(1, parseInt(col.slice(5, 7))))
      const colDate = new Date(yr, mo, 0) // last day of FY-end month
      return colDate <= cutoff
    })
  }

  // ─── Local helper: find closest price on or before a date ───
  function findPrice(date: string): number | null {
    let lo = 0, hi = priceHistory.length - 1
    if (hi < 0 || priceHistory[0].date > date) return null
    if (priceHistory[hi].date <= date) return priceHistory[hi].price
    while (lo < hi) {
      const mid = Math.ceil((lo + hi + 1) / 2)
      if (priceHistory[mid].date <= date) lo = mid
      else hi = mid - 1
    }
    return priceHistory[lo].price
  }

  // Row constants (from metricResolver.ts)
  const PNL_PAT = 35, PNL_EBITDA = 46, PNL_EPS = 44
  const BS_SHFUND = 80, BS_LT_BORROW = 58, BS_ST_BORROW = 44, BS_CASH = 29, BS_SHARES = 91
  const CF_OCF = 68

  console.log('\n' + '═'.repeat(80))
  console.log('  DETAILED DEBUG — Bugs #8-#12')
  console.log('═'.repeat(80))

  // ─── DEBUG 1: ROE (Bug #8) ─────────────────────────
  console.log('\n── DEBUG 1: ROE Computation (Bug #8) ──')
  console.log('  CSV target: ROE = 5.64%, Score = 45')
  const patRow = findStatementRow(pnl, PNL_PAT)
  const shFundRow = findStatementRow(balanceSheet, BS_SHFUND)
  if (patRow && shFundRow) {
    const patCols = windowCols(patRow, AS_OF_DATE)
    const shCols = windowCols(shFundRow, AS_OF_DATE)
    console.log(`  PAT year columns: ${patCols.join(', ')}`)
    console.log(`  ShFund year columns: ${shCols.join(', ')}`)

    const allROE: { col: string; pat: number; avgEq: number; roe: number }[] = []
    for (let i = 0; i < patCols.length; i++) {
      const col = patCols[i]
      if (!shCols.includes(col)) continue
      const pat = getStatementValue(patRow, col)
      const shCurr = getStatementValue(shFundRow, col)
      if (pat == null || shCurr == null) continue
      const priorCol = patCols[i + 1]
      const shPrior = (priorCol && shCols.includes(priorCol)) ? getStatementValue(shFundRow, priorCol) : null
      const avgEq = shPrior != null ? (shCurr + shPrior) / 2 : shCurr
      if (avgEq === 0) continue
      const roe = (pat / avgEq) * 100
      allROE.push({ col, pat, avgEq, roe })
    }

    console.log(`\n  ${'FY'.padEnd(12)} ${'PAT'.padEnd(14)} ${'Avg Equity'.padEnd(14)} ${'ROE %'.padEnd(10)} Include?`)
    console.log(`  ${'─'.repeat(60)}`)
    for (const r of allROE) {
      const include = r.pat > 0 ? '✅ YES' : '❌ NO (PAT ≤ 0)'
      console.log(`  ${r.col.padEnd(12)} ${r.pat.toFixed(2).padEnd(14)} ${r.avgEq.toFixed(2).padEnd(14)} ${r.roe.toFixed(2).padEnd(10)} ${include}`)
    }

    const allAvg = allROE.length > 0 ? allROE.reduce((s, r) => s + r.roe, 0) / allROE.length : null
    const posROE = allROE.filter(r => r.pat > 0)
    const posAvg = posROE.length > 0 ? posROE.reduce((s, r) => s + r.roe, 0) / posROE.length : null
    console.log(`\n  Average (all ${allROE.length} years):    ${allAvg?.toFixed(2) ?? 'null'}%  ← current engine`)
    console.log(`  Average (${posROE.length} positive-PAT): ${posAvg?.toFixed(2) ?? 'null'}%  ← proposed fix`)
    console.log(`  CSV reference:             5.64%`)
  } else {
    console.log('  ERROR: PAT or ShFund row not found')
  }

  // ─── DEBUG 2: OCF/EBITDA CAGR (Bug #9) ─────────────
  console.log('\n── DEBUG 2: OCF/EBITDA CAGR (Bug #9) ──')
  console.log('  CSV target: OCF/EBITDA CAGR = 17.85%, Score = 95')
  const ocfRow = findStatementRow(cashFlow, CF_OCF)
  const ebitdaRow = findStatementRow(pnl, PNL_EBITDA)
  if (ocfRow && ebitdaRow) {
    const ocfCols = windowCols(ocfRow, AS_OF_DATE)
    const ebitdaCols = windowCols(ebitdaRow, AS_OF_DATE)
    const common = ocfCols.filter((c: string) => ebitdaCols.includes(c))
    console.log(`  OCF cols: ${ocfCols.join(', ')}`)
    console.log(`  EBITDA cols: ${ebitdaCols.join(', ')}`)
    console.log(`  Common cols: ${common.join(', ')}`)

    console.log(`\n  ${'FY'.padEnd(12)} ${'OCF'.padEnd(16)} ${'EBITDA'.padEnd(16)} ${'Ratio'.padEnd(12)} Note`)
    console.log(`  ${'─'.repeat(65)}`)
    for (let i = 0; i < common.length; i++) {
      const col = common[i]
      const ocf = getStatementValue(ocfRow, col)
      const ebitda = getStatementValue(ebitdaRow, col)
      const ratio = (ocf != null && ebitda != null && ebitda !== 0) ? ocf / ebitda : null
      const isAnchor = (i === 0) ? '← LATEST anchor' : (i === common.length - 1) ? '← OLDEST anchor' : ''
      const flag = (ebitda != null && ebitda <= 0) ? ' ⚠️ EBITDA≤0' : (ocf != null && ocf < 0) ? ' ⚠️ OCF<0' : ''
      console.log(`  ${col.padEnd(12)} ${(ocf?.toFixed(2) ?? 'null').padEnd(16)} ${(ebitda?.toFixed(2) ?? 'null').padEnd(16)} ${(ratio?.toFixed(4) ?? 'null').padEnd(12)} ${isAnchor}${flag}`)
    }

    if (common.length >= 2) {
      const latOCF = getStatementValue(ocfRow, common[0])
      const latEBITDA = getStatementValue(ebitdaRow, common[0])
      const oldOCF = getStatementValue(ocfRow, common[common.length - 1])
      const oldEBITDA = getStatementValue(ebitdaRow, common[common.length - 1])
      if (latOCF != null && latEBITDA != null && oldOCF != null && oldEBITDA != null && latEBITDA > 0 && oldEBITDA > 0) {
        const latR = latOCF / latEBITDA
        const oldR = oldOCF / oldEBITDA
        const years = common.length - 1
        const cagr = latR > 0 && oldR > 0 ? (Math.pow(latR / oldR, 1 / years) - 1) * 100 : null
        console.log(`\n  CAGR computation:`)
        console.log(`    Latest ratio (${common[0]}): ${latR.toFixed(4)}`)
        console.log(`    Oldest ratio (${common[common.length - 1]}): ${oldR.toFixed(4)}`)
        console.log(`    Years: ${years}`)
        console.log(`    CAGR: (${latR.toFixed(4)} / ${oldR.toFixed(4)})^(1/${years}) - 1 = ${cagr?.toFixed(2) ?? 'null'}%`)
        console.log(`    CSV reference: 17.85%`)
      }
    }
  } else {
    console.log('  ERROR: OCF or EBITDA row not found')
  }

  // ─── DEBUG 3: Debt/EBITDA (Bug #10) ─────────────────
  console.log('\n── DEBUG 3: Debt/EBITDA (Bug #10) ──')
  console.log('  CSV target: Debt/EBITDA = 1.17, Score = 80')
  const ltRow = findStatementRow(balanceSheet, BS_LT_BORROW)
  const stRow = findStatementRow(balanceSheet, BS_ST_BORROW)
  if (ebitdaRow) {
    const eCols = windowCols(ebitdaRow, AS_OF_DATE)
    const ltCols = ltRow ? windowCols(ltRow, AS_OF_DATE) : []
    const stCols = stRow ? windowCols(stRow, AS_OF_DATE) : []

    console.log(`  EBITDA cols: ${eCols.join(', ')}`)
    console.log(`  LT Borrow cols: ${ltCols.join(', ')}`)
    console.log(`  ST Borrow cols: ${stCols.join(', ')}`)

    // Show latest FY values
    const latestFY = eCols[0]
    if (latestFY) {
      const ebitdaVal = getStatementValue(ebitdaRow, latestFY)
      const ltVal = ltRow ? (getStatementValue(ltRow, ltCols[0] ?? '') ?? 0) : 0
      const stVal = stRow ? (getStatementValue(stRow, stCols[0] ?? '') ?? 0) : 0
      const totalDebt = ltVal + stVal
      const ratio = ebitdaVal && ebitdaVal !== 0 ? totalDebt / ebitdaVal : null

      const cashBSRow = findStatementRow(balanceSheet, BS_CASH)
      const cashCols = cashBSRow ? windowCols(cashBSRow, AS_OF_DATE) : []
      const cashVal = cashBSRow && cashCols.length > 0 ? (getStatementValue(cashBSRow, cashCols[0]) ?? 0) : 0
      const netDebt = totalDebt - cashVal
      const netRatio = ebitdaVal && ebitdaVal !== 0 ? netDebt / ebitdaVal : null

      console.log(`\n  Latest FY: ${latestFY}`)
      console.log(`    LT Borrowings (BS row 58):  ${ltVal.toFixed(2)}`)
      console.log(`    ST Borrowings (BS row 44):  ${stVal.toFixed(2)}`)
      console.log(`    Total Debt (LT + ST):       ${totalDebt.toFixed(2)}`)
      console.log(`    Cash (BS row 29):           ${cashVal.toFixed(2)}`)
      console.log(`    Net Debt (LT + ST - Cash):  ${netDebt.toFixed(2)}`)
      console.log(`    EBITDA (P&L row 46):        ${ebitdaVal?.toFixed(2) ?? 'null'}`)
      console.log(`    Gross Debt/EBITDA:          ${ratio?.toFixed(4) ?? 'null'}  ← engine`)
      console.log(`    Net Debt/EBITDA:            ${netRatio?.toFixed(4) ?? 'null'}  ← likely CSV method`)
      console.log(`    CSV reference:              1.17`)
    }

    // Show all FY years for pattern detection
    console.log(`\n  ${'FY'.padEnd(12)} ${'LT Borrow'.padEnd(14)} ${'ST Borrow'.padEnd(14)} ${'Total Debt'.padEnd(14)} ${'EBITDA'.padEnd(14)} ${'Ratio'}`)
    console.log(`  ${'─'.repeat(75)}`)
    for (const col of eCols) {
      const eVal = getStatementValue(ebitdaRow, col)
      const ltV = ltRow && ltCols.includes(col) ? (getStatementValue(ltRow, col) ?? 0) : 0
      const stV = stRow && stCols.includes(col) ? (getStatementValue(stRow, col) ?? 0) : 0
      const tot = ltV + stV
      const r = eVal && eVal !== 0 ? tot / eVal : null
      console.log(`  ${col.padEnd(12)} ${ltV.toFixed(2).padEnd(14)} ${stV.toFixed(2).padEnd(14)} ${tot.toFixed(2).padEnd(14)} ${(eVal?.toFixed(2) ?? 'null').padEnd(14)} ${r?.toFixed(4) ?? 'null'}`)
    }

    // Check FinData for alternative debt fields
    console.log(`\n  FinData debt-related fields (latest record):`)
    const latestFin = finData[finData.length - 1]
    if (latestFin) {
      const debtKeys = Object.keys(latestFin).filter((k: string) =>
        /debt|borrow|loan/i.test(k)
      )
      if (debtKeys.length > 0) {
        for (const k of debtKeys) {
          console.log(`    ${k} = ${latestFin[k]}`)
        }
      } else {
        console.log(`    No debt-related fields found in FinData`)
      }
      // Also print all FinData keys for reference
      console.log(`\n  All FinData keys: ${Object.keys(latestFin).sort().join(', ')}`)
    }
  } else {
    console.log('  ERROR: EBITDA row not found')
  }

  // ─── DEBUG 4: Valuation PE/PB/EV (Bug #11) ─────────
  console.log('\n── DEBUG 4: Valuation Averages (Bug #11) ──')
  console.log('  CSV target: Valuation = 76.5, hist_avg_pe = 64.4')
  const epsRow = findStatementRow(pnl, PNL_EPS)
  const sharesRow = findStatementRow(balanceSheet, BS_SHARES)
  const cashRow = findStatementRow(balanceSheet, BS_CASH)
  const ltDebtRow = findStatementRow(balanceSheet, BS_LT_BORROW)
  const stDebtRow = findStatementRow(balanceSheet, BS_ST_BORROW)

  if (epsRow) {
    const yearCols = windowCols(epsRow, AS_OF_DATE)
    console.log(`  Year columns: ${yearCols.join(', ')}`)

    console.log(`\n  PE computation per FY:`)
    console.log(`  ${'FY'.padEnd(12)} ${'EPS'.padEnd(12)} ${'FY Price'.padEnd(12)} ${'PE'.padEnd(12)} Included?`)
    console.log(`  ${'─'.repeat(55)}`)

    const peVals: number[] = []
    const pbVals: number[] = []
    const evVals: number[] = []

    for (const col of yearCols) {
      const yr = parseInt(col.slice(1, 5))
      const mo = parseInt(col.slice(5, 7))
      const lastDay = new Date(yr, mo, 0).getDate()
      const fyEnd = `${yr}-${String(mo).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
      const fyPrice = findPrice(fyEnd)

      // PE
      const eps = getStatementValue(epsRow, col)
      const peOk = eps != null && eps > 0 && fyPrice != null && fyPrice > 0
      const pe = peOk ? fyPrice! / eps! : null
      if (pe != null) peVals.push(pe)
      const peInc = peOk ? '✅' : `❌ (EPS=${eps?.toFixed(2) ?? 'null'})`
      console.log(`  ${col.padEnd(12)} ${(eps?.toFixed(2) ?? 'null').padEnd(12)} ${(fyPrice?.toFixed(2) ?? 'null').padEnd(12)} ${(pe?.toFixed(2) ?? 'N/A').padEnd(12)} ${peInc}`)

      // PB
      if (shFundRow && sharesRow && fyPrice != null && fyPrice > 0) {
        const shF = getStatementValue(shFundRow, col)
        const sh = getStatementValue(sharesRow, col)
        if (shF != null && sh != null && sh > 0) {
          const bvps = (shF * 10000000) / sh
          if (bvps > 0) pbVals.push(fyPrice / bvps)
        }
      }

      // EV/EBITDA
      if (ebitdaRow && sharesRow && fyPrice != null && fyPrice > 0) {
        const ebitda = getStatementValue(ebitdaRow, col)
        const sh = getStatementValue(sharesRow, col)
        if (ebitda != null && ebitda > 0 && sh != null && sh > 0) {
          const mcap = (fyPrice * sh) / 10000000
          const lt = ltDebtRow ? (getStatementValue(ltDebtRow, col) ?? 0) : 0
          const st = stDebtRow ? (getStatementValue(stDebtRow, col) ?? 0) : 0
          const cash = cashRow ? (getStatementValue(cashRow, col) ?? 0) : 0
          const ev = mcap + lt + st - cash
          if (ev > 0) evVals.push(ev / ebitda)
        }
      }
    }

    const avgArr = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null
    console.log(`\n  Summary:`)
    console.log(`    hist_avg_pe:       ${avgArr(peVals)?.toFixed(2) ?? 'null'}  (${peVals.length} obs)  — CSV: 64.4`)
    console.log(`    hist_avg_pb:       ${avgArr(pbVals)?.toFixed(2) ?? 'null'}  (${pbVals.length} obs)`)
    console.log(`    hist_avg_ev:       ${avgArr(evVals)?.toFixed(2) ?? 'null'}  (${evVals.length} obs)`)
    console.log(`    PE values:         [${peVals.map(v => v.toFixed(2)).join(', ')}]`)
    console.log(`    PB values:         [${pbVals.map(v => v.toFixed(2)).join(', ')}]`)
    console.log(`    EV/EBITDA values:  [${evVals.map(v => v.toFixed(2)).join(', ')}]`)

    // Check FinData for pre-computed PE
    console.log(`\n  FinData PE fields (all records):`)
    for (const fd of finData) {
      const peField = (fd as any).pe ?? (fd as any).PE ?? (fd as any).Pe
      const yrc = (fd as any).yrc ?? (fd as any).YRC
      if (peField !== undefined) {
        console.log(`    yrc=${yrc}  pe=${peField}`)
      }
    }
    // Check if pe field exists at all
    if (finData.length > 0) {
      const peKeys = Object.keys(finData[0]).filter((k: string) => /^pe$/i.test(k))
      if (peKeys.length === 0) {
        console.log(`    No 'pe' field found in FinData. Available keys: ${Object.keys(finData[0]).sort().join(', ')}`)
      }
    }
  } else {
    console.log('  ERROR: EPS row not found')
  }

  // ─── DEBUG 5: Technical (Bug #12) ───────────────────
  console.log('\n── DEBUG 5: Technical Indicators (Bug #12) ──')
  console.log('  CSV target: Technical = 42.5')
  console.log(`  Total price records: ${priceHistory.length}`)
  if (priceHistory.length > 0) {
    console.log(`  Date range: ${priceHistory[0].date} to ${priceHistory[priceHistory.length - 1].date}`)
    const currentPrice = findPrice(AS_OF_DATE)
    console.log(`  Price at ${AS_OF_DATE}: ${currentPrice?.toFixed(2) ?? 'null'}`)

    console.log(`\n  Last 10 closing prices:`)
    const lastN = priceHistory.slice(-10)
    for (const p of lastN) {
      console.log(`    ${p.date}  ₹${p.price.toFixed(2)}  vol=${(p as any).volume ?? 'N/A'}`)
    }

    // Technical metrics from resolved data (actual metric IDs from V4 scorecard)
    console.log(`\n  Engine technical metrics:`)
    const techKeys = ['v4_200dma', 'v4_50dma', 'v4_20dma', 'v4_rsi', 'v4_vpt']
    for (const k of techKeys) {
      const v = resolved.data[k]
      console.log(`    ${k.padEnd(20)} = ${v != null ? v.toFixed(4) : 'null'}`)
    }

    // CSV comparison
    console.log(`\n  CSV vs Engine:`)
    console.log(`    200-DMA deviation: CSV=+1.98%   engine=${resolved.data['v4_200dma']?.toFixed(2) ?? 'null'}%   diff=${((resolved.data['v4_200dma'] ?? 0) - 1.98).toFixed(2)}`)
    console.log(`    50-DMA deviation:  CSV=-1.22%   engine=${resolved.data['v4_50dma']?.toFixed(2) ?? 'null'}%   diff=${((resolved.data['v4_50dma'] ?? 0) - (-1.22)).toFixed(2)}`)
    console.log(`    20-DMA deviation:  CSV=-0.57%   engine=${resolved.data['v4_20dma']?.toFixed(2) ?? 'null'}%   diff=${((resolved.data['v4_20dma'] ?? 0) - (-0.57)).toFixed(2)}`)
    console.log(`    RSI:               CSV=36.3     engine=${resolved.data['v4_rsi']?.toFixed(2) ?? 'null'}     diff=${((resolved.data['v4_rsi'] ?? 0) - 36.3).toFixed(2)}`)
    console.log(`    VPT:               CSV=3        engine=${resolved.data['v4_vpt']?.toFixed(2) ?? 'null'}`)
  }

  // ═══════════════════════════════════════════════════
  // FIX 1 & 2: DUMP ALL ROWS — Identify correct OCF row and lease liabilities
  // ═══════════════════════════════════════════════════

  // ─── FIX 1: ALL CASHFLOW ROWS ─────────────────────
  // SME OCF reference values: FY21=31,347  FY22=29,159  FY23=37,807  FY24=44,407  FY25=49,328
  // Our row 68 gives:         FY21=34,392  FY22=36,754  FY23=43,583  FY24=53,209  FY25=62,336
  console.log('\n' + '═'.repeat(100))
  console.log('  FIX 1: ALL CASHFLOW ROWS — Finding correct OCF row')
  console.log('  SME FY25 OCF target: ~49,328 Cr')
  console.log('═'.repeat(100))

  if (cashFlow.length > 0) {
    // Get available year columns from first row, window to asOfDate
    const cfSampleCols = windowCols(cashFlow[0], AS_OF_DATE)
    console.log(`  Year columns (windowed): ${cfSampleCols.join(', ')}`)
    console.log(`  Total CashFlow rows: ${cashFlow.length}\n`)

    // Table header
    const hdr = '  ' + 'Row#'.padEnd(6) + 'Description'.padEnd(55) + cfSampleCols.map(c => c.padStart(12)).join('')
    console.log(hdr)
    console.log('  ' + '─'.repeat(hdr.length))

    for (const row of cashFlow) {
      const rn = String(row.rowno ?? '?').padEnd(6)
      const desc = String(row.COLUMNNAME ?? '').substring(0, 53).padEnd(55)
      const vals = cfSampleCols.map(col => {
        const v = getStatementValue(row, col)
        return (v != null ? v.toFixed(0) : '-').padStart(12)
      }).join('')
      // Highlight rows close to SME's FY25 OCF target (~49,328)
      const fy25Col = cfSampleCols[0] // newest year
      const fy25Val = fy25Col ? getStatementValue(row, fy25Col) : null
      const marker = (fy25Val != null && Math.abs(fy25Val - 49328) < 5000) ? ' ◀◀◀ CLOSE TO SME OCF' : ''
      console.log(`  ${rn}${desc}${vals}${marker}`)
    }
  } else {
    console.log('  ERROR: No CashFlow rows found')
  }

  // ─── FIX 2: ALL BALANCE SHEET ROWS ────────────────
  // SME Net Debt ≈ 150,000 Cr.  Our LT(90,280) + ST(20,560) = 110,840.
  // Gap ≈ 40,000 Cr — looking for lease liabilities / right-of-use obligations.
  console.log('\n' + '═'.repeat(100))
  console.log('  FIX 2: ALL BALANCE SHEET ROWS — Finding lease liabilities')
  console.log('  SME Net Debt target: ~150,000 Cr  (engine LT+ST = 110,840, gap ~40,000)')
  console.log('═'.repeat(100))

  if (balanceSheet.length > 0) {
    const bsSampleCols = windowCols(balanceSheet[0], AS_OF_DATE)
    console.log(`  Year columns (windowed): ${bsSampleCols.join(', ')}`)
    console.log(`  Total BalanceSheet rows: ${balanceSheet.length}\n`)

    const bsHdr = '  ' + 'Row#'.padEnd(6) + 'Description'.padEnd(55) + bsSampleCols.map(c => c.padStart(12)).join('')
    console.log(bsHdr)
    console.log('  ' + '─'.repeat(bsHdr.length))

    for (const row of balanceSheet) {
      const rn = String(row.rowno ?? '?').padEnd(6)
      const desc = String(row.COLUMNNAME ?? '').substring(0, 53).padEnd(55)
      const vals = bsSampleCols.map(col => {
        const v = getStatementValue(row, col)
        return (v != null ? v.toFixed(0) : '-').padStart(12)
      }).join('')
      // Highlight rows that could be lease liabilities (~30,000-50,000 range)
      const fy25Col = bsSampleCols[0]
      const fy25Val = fy25Col ? getStatementValue(row, fy25Col) : null
      const marker = (fy25Val != null && fy25Val >= 25000 && fy25Val <= 55000) ? ' ◀◀◀ POSSIBLE LEASE LIABILITY' : ''
      // Also flag rows whose description mentions lease/right-of-use
      const descLower = String(row.COLUMNNAME ?? '').toLowerCase()
      const leaseMarker = /lease|right.of.use|rou|rental/i.test(descLower) ? ' 🔍 LEASE?' : ''
      console.log(`  ${rn}${desc}${vals}${marker}${leaseMarker}`)
    }

    // Summary: show known debt rows and compute what's needed
    console.log(`\n  ── Debt Summary ──`)
    const bsFY = bsSampleCols[0]
    if (bsFY) {
      const ltV = ltRow ? (getStatementValue(ltRow, bsFY) ?? 0) : 0
      const stV = stRow ? (getStatementValue(stRow, bsFY) ?? 0) : 0
      console.log(`    LT Borrowings (row 58): ${ltV.toFixed(0)}`)
      console.log(`    ST Borrowings (row 44): ${stV.toFixed(0)}`)
      console.log(`    LT + ST:               ${(ltV + stV).toFixed(0)}`)
      console.log(`    SME target:            ~150,000`)
      console.log(`    Gap to find:           ~${(150000 - ltV - stV).toFixed(0)}`)
    }
  } else {
    console.log('  ERROR: No BalanceSheet rows found')
  }

  // ─── FIX 3: ALL QUARTERLY RESULTS ROWS ──────────
  // Bug #13: Current QR_ROW_OP_PROFIT = 14 is Operating Profit (after depreciation).
  // Need to find the EBITDA row (before depreciation).
  console.log('\n' + '═'.repeat(100))
  console.log('  FIX 3: ALL QUARTERLY RESULTS ROWS — Finding correct EBITDA row')
  console.log('  Current row 14 = "Profit from operations before other income" (Operating Profit, NOT EBITDA)')
  console.log('═'.repeat(100))

  if (quarterly.length > 0) {
    const qrSampleCols = windowCols(quarterly[0], AS_OF_DATE).slice(0, 8) // Show last 8 quarters
    console.log(`  Quarter columns (windowed, last 8): ${qrSampleCols.join(', ')}`)
    console.log(`  Total Quarterly rows: ${quarterly.length}\n`)

    const qrHdr = '  ' + 'Row#'.padEnd(6) + 'Description'.padEnd(55) + qrSampleCols.map(c => c.padStart(12)).join('')
    console.log(qrHdr)
    console.log('  ' + '─'.repeat(qrHdr.length))

    for (const row of quarterly) {
      const rn = String(row.rowno ?? '?').padEnd(6)
      const desc = String(row.COLUMNNAME ?? '').substring(0, 53).padEnd(55)
      const vals = qrSampleCols.map(col => {
        const v = getStatementValue(row, col)
        return (v != null ? v.toFixed(0) : '-').padStart(12)
      }).join('')
      // Highlight EBITDA-related rows
      const descLower = String(row.COLUMNNAME ?? '').toLowerCase()
      const ebitdaMarker = /ebitda|before depreciation|deprec|operating profit/i.test(descLower) ? ' 🔍 EBITDA?' : ''
      console.log(`  ${rn}${desc}${vals}${ebitdaMarker}`)
    }
  } else {
    console.log('  ERROR: No Quarterly rows found')
  }

  console.log('\n' + '═'.repeat(80))
  console.log('Done.\n')
}

main().catch(err => {
  console.error('Script failed:', err)
  process.exit(1)
})
