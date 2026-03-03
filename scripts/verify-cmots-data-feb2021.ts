/**
 * Verify CMOTS Data Availability for V4 Scorecard — 24 Feb 2021
 *
 * Fetches CMOTS data for a sample of stocks and checks which V4 metrics
 * are available vs unavailable when scored as of 2021-02-24.
 *
 * Reports:
 *   - Per-metric availability across all sampled stocks
 *   - Per-segment availability summary
 *   - Root causes of unavailability (insufficient years, missing rows, etc.)
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json scripts/verify-cmots-data-feb2021.ts
 *   npx tsx --tsconfig tsconfig.json scripts/verify-cmots-data-feb2021.ts --limit 20
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import { resolveMetricsAtDate } from '@/services/metricResolver'
import { scoreStock } from '@/lib/scoringEngine'
import { V4_NONBANKING_SCORECARD } from '@/data/scorecardTemplates'
import { getYearColumns } from '@/services/cmots/fundamentals'
import type { FundamentalsBundle } from '@/services/cmots/fundamentals'
import type { StockScoreResult } from '@/types/scoring'

// Use undici with ProxyAgent for environments with https_proxy
const require = createRequire(import.meta.url)
const { ProxyAgent, fetch: undiciFetch } = require('undici')
const httpsProxy = process.env.https_proxy || process.env.HTTPS_PROXY
const proxyDispatcher = httpsProxy ? new ProxyAgent(httpsProxy) : undefined
const proxyFetch: typeof globalThis.fetch = proxyDispatcher
  ? (url: any, init?: any) => undiciFetch(url, { ...init, dispatcher: proxyDispatcher })
  : globalThis.fetch

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ─── Configuration ────────────────────────────────────────
const SCORING_DATE = '2021-02-24'
const CMOTS_BASE = 'https://deltastockzapis.cmots.com/api'
const CONCURRENCY = 4
const MAX_RETRIES = 2

// Parse --limit flag
const limitArg = process.argv.find(a => a.startsWith('--limit'))
const STOCK_LIMIT = limitArg ? parseInt(limitArg.split('=')[1] || process.argv[process.argv.indexOf(limitArg) + 1] || '50') : 50

// Banking sector keywords to exclude
const BANKING_SECTOR_KEYWORDS = [
  'bank', 'banking', 'banks', 'nbfc', 'nidhi company',
  'housing finance', 'micro finance', 'microfinance',
]

// Read CMOTS API Token
let TOKEN: string
try {
  const envPath = resolve(__dirname, '..', '.env.local')
  const envContent = readFileSync(envPath, 'utf-8')
  const match = envContent.match(/CMOTS_API_TOKEN=(.+)/)
  TOKEN = match?.[1]?.trim() || ''
} catch {
  TOKEN = process.env.CMOTS_API_TOKEN || ''
}
if (!TOKEN) {
  console.error('ERROR: CMOTS_API_TOKEN not found. Set in .env.local or CMOTS_API_TOKEN environment variable.')
  process.exit(1)
}

// ─── Types ────────────────────────────────────────────────

interface CompanyInfo {
  co_code: number
  companyname: string
  nsesymbol: string
  bsecode: string
  sectorname: string
  mcaptype: string
  industryname: string
}

interface PriceBar {
  date: string
  price: number
  volume: number
}

// ─── CMOTS Fetch Helper ──────────────────────────────────

async function cmotsFetch<T>(endpoint: string, retries = MAX_RETRIES): Promise<T[]> {
  const url = `${CMOTS_BASE}${endpoint}`

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000)

      const res = await proxyFetch(url, {
        headers: { Authorization: `Bearer ${TOKEN}` },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!res.ok) {
        if ((res.status === 429 || res.status >= 500) && attempt < retries) {
          const delay = 1000 * Math.pow(2, attempt) + Math.random() * 500
          await new Promise(r => setTimeout(r, delay))
          continue
        }
        console.warn(`  [CMOTS] HTTP ${res.status} for ${endpoint}`)
        return []
      }

      const text = await res.text()
      let json: any
      try {
        json = JSON.parse(text)
      } catch {
        console.warn(`  [CMOTS] Invalid JSON for ${endpoint} (${text.length} bytes)`)
        return []
      }

      if (Array.isArray(json)) return json
      if (json?.data && Array.isArray(json.data)) return json.data
      if (json?.success === false) {
        console.warn(`  [CMOTS] API returned success=false for ${endpoint}`)
        return []
      }
      return []
    } catch (err: any) {
      if (attempt < retries) {
        const delay = 1000 * Math.pow(2, attempt) + Math.random() * 500
        console.warn(`  [CMOTS] ${err?.name === 'AbortError' ? 'Timeout' : 'Error'} for ${endpoint}, retry ${attempt + 1}...`)
        await new Promise(r => setTimeout(r, delay))
        continue
      }
      console.warn(`  [CMOTS] Failed after ${retries + 1} attempts for ${endpoint}: ${err?.message || err}`)
      return []
    }
  }
  return []
}

// ─── Concurrency Helper ──────────────────────────────────

async function pMapConcurrent<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  concurrency: number,
): Promise<(R | null)[]> {
  const results: (R | null)[] = new Array(items.length).fill(null)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++
      try {
        results[index] = await fn(items[index], index)
      } catch {
        results[index] = null
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
  await Promise.all(workers)
  return results
}

// ─── V4 Metrics Definition ───────────────────────────────

const V4_METRICS = [
  // Financial Segment (30%)
  { id: 'v4_revenue_growth', name: 'Revenue Growth (5Y CAGR)', segment: 'Financial', weight: '15%', source: 'FinData + P&L', requirement: '≥2 fiscal years before scoring date' },
  { id: 'v4_ebitda_growth', name: 'EBITDA Growth (5Y CAGR)', segment: 'Financial', weight: '15%', source: 'P&L row 46', requirement: '≥2 fiscal years before scoring date' },
  { id: 'v4_earnings_pbt_oi', name: 'Earnings (PBT-OI, 5Y CAGR)', segment: 'Financial', weight: '20%', source: 'P&L rows 28, 9', requirement: '≥2 fiscal years, PBT-OI > 0 both anchors' },
  { id: 'v4_roe', name: 'ROE (5Y Avg, PAT/AvgEquity)', segment: 'Financial', weight: '15%', source: 'P&L row 35 + BS row 80', requirement: '≥1 fiscal year with PAT > 0' },
  { id: 'v4_ocf_ebitda_cagr', name: 'OCF/EBITDA (5Y CAGR)', segment: 'Financial', weight: '15%', source: 'CashFlow row 68 + P&L row 46', requirement: '≥2 common years, EBITDA > 0 both, ratio > 0 both' },
  { id: 'v4_gross_block', name: 'Gross Block Growth (YoY)', segment: 'Financial', weight: '10%', source: 'BS row 2', requirement: '≥2 fiscal years' },
  { id: 'v4_debt_ebitda', name: 'Debt/EBITDA', segment: 'Financial', weight: '10%', source: 'BS (debt rows) + P&L row 46', requirement: '≥1 fiscal year with EBITDA ≠ 0' },
  // Valuation Segment (45%)
  { id: 'v4_pe_vs_5y', name: 'PE vs 5Y Average (%)', segment: 'Valuation', weight: '30%', source: 'P&L row 44 (EPS) + Price', requirement: 'EPS > 0, ≥2 FY-end prices, price at scoring date' },
  { id: 'v4_pb_vs_5y', name: 'PB vs 5Y Average (%)', segment: 'Valuation', weight: '50%', source: 'BS rows 80,91 + Price', requirement: 'BV > 0, ≥2 FY-end prices, price at scoring date' },
  { id: 'v4_ev_vs_5y', name: 'EV/EBITDA vs 5Y Average (%)', segment: 'Valuation', weight: '20%', source: 'P&L 46 + BS debt/cash + Price', requirement: 'EBITDA > 0, ≥2 FY-end prices, price at scoring date' },
  // Technical Segment (7%)
  { id: 'v4_20dma', name: 'Price vs 20-DMA', segment: 'Technical', weight: '20%', source: 'Price history (EMA calc)', requirement: '≥200 trading days of price data before scoring date' },
  { id: 'v4_50dma', name: 'Price vs 50-DMA', segment: 'Technical', weight: '15%', source: 'Price history (EMA calc)', requirement: '≥200 trading days of price data' },
  { id: 'v4_200dma', name: 'Price vs 200-DMA', segment: 'Technical', weight: '35%', source: 'Price history (EMA calc)', requirement: '≥200 trading days of price data' },
  { id: 'v4_rsi', name: 'RSI (14-day)', segment: 'Technical', weight: '10%', source: 'Price history', requirement: '≥200 trading days of price data' },
  { id: 'v4_vpt', name: 'Volume-Price Trend (VPT)', segment: 'Technical', weight: '20%', source: 'Price + Volume history', requirement: '≥200 trading days of price+volume data' },
  // Quarterly Momentum Segment (18%)
  { id: 'v4_revenue_multiplier', name: 'Revenue Growth Multiplier', segment: 'Quarterly Momentum', weight: '50%', source: 'QuarterlyResults row 1', requirement: '≥8 quarterly columns before scoring date + revenue CAGR > 0' },
  { id: 'v4_ebitda_multiplier', name: 'EBITDA Growth Multiplier', segment: 'Quarterly Momentum', weight: '50%', source: 'QuarterlyResults row 14', requirement: '≥8 quarterly columns before scoring date + EBITDA CAGR > 0' },
]

// ─── Data Diagnostics ────────────────────────────────────

interface StockDiagnostics {
  company: CompanyInfo
  resolvedMetrics: Record<string, number | null>
  scoreResult: StockScoreResult | null
  rawDataInfo: {
    ttmAvailable: boolean
    finDataYears: number
    pnlYearCols: string[]
    cashFlowYearCols: string[]
    balanceSheetYearCols: string[]
    quarterlyYearCols: string[]
    priceDataDays: number
    priceDataDaysBeforeScoringDate: number
    shareholdingQuarters: number
    pnlYearColsWindowed: string[]
    cashFlowYearColsWindowed: string[]
    balanceSheetYearColsWindowed: string[]
    quarterlyYearColsWindowed: string[]
  }
}

function getWindowedCols(rows: any[], asOfDate: string): string[] {
  if (!rows || rows.length === 0) return []
  // Pick first row that has year columns
  for (const row of rows) {
    const allCols = getYearColumns(row)
    if (allCols.length === 0) continue
    const cutoff = new Date(asOfDate)
    return allCols.filter((col: string) => {
      const year = parseInt(col.slice(1, 5))
      const month = Math.min(12, Math.max(1, parseInt(col.slice(5, 7))))
      const colDate = new Date(year, month, 0)
      return colDate <= cutoff
    })
  }
  return []
}

function getAllCols(rows: any[]): string[] {
  if (!rows || rows.length === 0) return []
  for (const row of rows) {
    const cols = getYearColumns(row)
    if (cols.length > 0) return cols
  }
  return []
}

// ─── Main ─────────────────────────────────────────────────

async function main() {
  console.log('\n' + '='.repeat(80))
  console.log('  CMOTS DATA AVAILABILITY VERIFICATION — V4 SCORECARD')
  console.log('  Scoring Date: ' + SCORING_DATE + ' (24 Feb 2021)')
  console.log('='.repeat(80) + '\n')

  // ── Step 1: Fetch Company Master ──
  console.log('[1/4] Fetching company master...')
  const allCompanies = await cmotsFetch<CompanyInfo>('/companymaster')
  if (allCompanies.length === 0) {
    console.error('ERROR: Could not fetch company master. Check CMOTS_API_TOKEN.')
    process.exit(1)
  }

  // Filter to BSE-active non-banking
  const bseActive = allCompanies.filter(
    (c: any) => c.bselistedflag === 'Y' || c.BSEStatus === 'Active',
  )

  const nonBankingStocks: CompanyInfo[] = []
  for (const company of bseActive) {
    const sector = (company.sectorname || '').toLowerCase()
    const industry = ((company as any).industryname || '').toLowerCase()
    const isBanking = BANKING_SECTOR_KEYWORDS.some(
      kw => sector.includes(kw) || industry.includes(kw),
    )
    if (!isBanking) nonBankingStocks.push(company)
  }

  console.log(`  BSE-active: ${bseActive.length}, Non-banking: ${nonBankingStocks.length}`)

  // Take a sample
  const targetStocks = nonBankingStocks.slice(0, STOCK_LIMIT)
  console.log(`  Sampling ${targetStocks.length} stocks for verification\n`)

  // ── Step 2: Fetch & Diagnose Each Stock ──
  console.log(`[2/4] Fetching data and diagnosing ${targetStocks.length} stocks...`)
  const startTime = Date.now()
  let processed = 0

  const results = await pMapConcurrent<CompanyInfo, StockDiagnostics | null>(
    targetStocks,
    async (company, _idx) => {
      const coCode = company.co_code
      const stockId = String(coCode)

      try {
        // Fetch 7 years of price data to cover 5Y valuation + 200 DMA
        const extendedFrom = new Date(SCORING_DATE)
        extendedFrom.setFullYear(extendedFrom.getFullYear() - 7)
        const extendedFromStr = extendedFrom.toISOString().split('T')[0]
        // Fetch prices up to a year after scoring date for end-of-period reference
        const endDateStr = '2022-02-24'

        const [ttmArr, finData, pnl, cashFlow, balanceSheet, quarterly, shareholding, priceData] =
          await Promise.all([
            cmotsFetch<any>(`/TTMData/${coCode}/s`),
            cmotsFetch<any>(`/FinData/${coCode}/s`),
            cmotsFetch<any>(`/ProftandLoss/${coCode}/s`),
            cmotsFetch<any>(`/CashFlow/${coCode}/s`),
            cmotsFetch<any>(`/BalanceSheet/${coCode}/s`),
            cmotsFetch<any>(`/QuarterlyResults/${coCode}/s`),
            cmotsFetch<any>(`/Aggregate-Share-Holding/${coCode}/s`),
            cmotsFetch<any>(`/AdjustedPriceChart/bse/${coCode}/${extendedFromStr}/${endDateStr}`),
          ])

        // Check minimum data
        if (pnl.length === 0 && finData.length === 0 && priceData.length < 10) {
          processed++
          return null
        }

        // Sort FinData ascending by yrc
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

        // Convert price data
        const priceHistory: PriceBar[] = priceData
          .map((p: any) => ({
            date: (p.Tradedate || p.tradedate || '').split('T')[0],
            price: p.Dayclose ?? p.dayclose ?? 0,
            volume: p.TotalVolume ?? p.totalvolume ?? 0,
          }))
          .filter((p: PriceBar) => p.date && p.price > 0)
          .sort((a: PriceBar, b: PriceBar) => a.date.localeCompare(b.date))

        const priceBeforeScoringDate = priceHistory.filter(p => p.date <= SCORING_DATE)

        // Window finData for asOfDate
        const cutoff = new Date(SCORING_DATE)
        const windowedFinData = finData.filter((f: any) => {
          const year = Math.floor(f.yrc / 100)
          const month = Math.min(12, Math.max(1, f.yrc % 100))
          const fyEndDate = new Date(year, month, 0)
          return fyEndDate <= cutoff
        })

        // Get year columns info
        const pnlAllCols = getAllCols(pnl)
        const cfAllCols = getAllCols(cashFlow)
        const bsAllCols = getAllCols(balanceSheet)
        const qrAllCols = getAllCols(quarterly)
        const pnlWindowed = getWindowedCols(pnl, SCORING_DATE)
        const cfWindowed = getWindowedCols(cashFlow, SCORING_DATE)
        const bsWindowed = getWindowedCols(balanceSheet, SCORING_DATE)
        const qrWindowed = getWindowedCols(quarterly, SCORING_DATE)

        // Score at scoring date
        const resolved = resolveMetricsAtDate(fundamentals, priceHistory, SCORING_DATE)
        let scoreResult: StockScoreResult | null = null
        try {
          scoreResult = scoreStock(
            resolved.data,
            V4_NONBANKING_SCORECARD,
            {
              id: stockId,
              name: company.companyname,
              symbol: company.nsesymbol || company.bsecode,
              sector: company.sectorname,
              marketCap: 0,
            },
            resolved.context,
          )
        } catch {
          // Score may fail for some stocks
        }

        processed++
        if (processed % 10 === 0 || processed === targetStocks.length) {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
          console.log(`  Processed: ${processed}/${targetStocks.length} [${elapsed}s]`)
        }

        return {
          company,
          resolvedMetrics: resolved.data,
          scoreResult,
          rawDataInfo: {
            ttmAvailable: ttmArr.length > 0,
            finDataYears: windowedFinData.length,
            pnlYearCols: pnlAllCols,
            cashFlowYearCols: cfAllCols,
            balanceSheetYearCols: bsAllCols,
            quarterlyYearCols: qrAllCols,
            priceDataDays: priceHistory.length,
            priceDataDaysBeforeScoringDate: priceBeforeScoringDate.length,
            shareholdingQuarters: shareholding.length,
            pnlYearColsWindowed: pnlWindowed,
            cashFlowYearColsWindowed: cfWindowed,
            balanceSheetYearColsWindowed: bsWindowed,
            quarterlyYearColsWindowed: qrWindowed,
          },
        }
      } catch (err) {
        processed++
        return null
      }
    },
    CONCURRENCY,
  )

  const diagnostics = results.filter((r): r is StockDiagnostics => r !== null)
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
  console.log(`\n  Completed in ${elapsed}s — ${diagnostics.length} stocks with data\n`)

  if (diagnostics.length === 0) {
    console.error('ERROR: No stocks returned data. Check API token.')
    process.exit(1)
  }

  // ── Step 3: Analyze Metric Availability ──
  console.log('[3/4] Analyzing metric availability...\n')

  // Per-metric stats
  const metricStats = V4_METRICS.map(metricDef => {
    let available = 0
    let unavailable = 0
    const reasons: Record<string, number> = {}

    for (const diag of diagnostics) {
      const value = diag.resolvedMetrics[metricDef.id]
      if (value != null && !isNaN(value)) {
        available++
      } else {
        unavailable++
        // Diagnose why
        const info = diag.rawDataInfo
        let reason = 'Unknown'
        if (metricDef.segment === 'Financial') {
          if (metricDef.id === 'v4_revenue_growth') {
            if (info.finDataYears < 2 && info.pnlYearColsWindowed.length < 2) reason = 'Insufficient fiscal years (<2) before scoring date'
            else reason = 'Negative/zero anchor values (CAGR undefined)'
          } else if (metricDef.id === 'v4_ebitda_growth') {
            if (info.pnlYearColsWindowed.length < 2) reason = 'Insufficient P&L years (<2) before scoring date'
            else reason = 'Negative/zero anchor EBITDA (CAGR undefined)'
          } else if (metricDef.id === 'v4_earnings_pbt_oi') {
            if (info.pnlYearColsWindowed.length < 2) reason = 'Insufficient P&L years (<2) before scoring date'
            else reason = 'PBT-OI ≤ 0 in anchor year(s)'
          } else if (metricDef.id === 'v4_roe') {
            if (info.pnlYearColsWindowed.length === 0 || info.balanceSheetYearColsWindowed.length === 0) reason = 'No P&L or BS data before scoring date'
            else reason = 'All fiscal years have PAT ≤ 0'
          } else if (metricDef.id === 'v4_ocf_ebitda_cagr') {
            if (info.cashFlowYearColsWindowed.length < 2 || info.pnlYearColsWindowed.length < 2) reason = 'Insufficient CashFlow/P&L years (<2 common)'
            else reason = 'EBITDA ≤ 0 or OCF/EBITDA ratio ≤ 0 in anchor year(s)'
          } else if (metricDef.id === 'v4_gross_block') {
            if (info.balanceSheetYearColsWindowed.length < 2) reason = 'Insufficient BS years (<2) before scoring date'
            else reason = 'Fixed Assets row missing or zero prior year'
          } else if (metricDef.id === 'v4_debt_ebitda') {
            if (info.pnlYearColsWindowed.length === 0) reason = 'No P&L data before scoring date'
            else reason = 'EBITDA = 0 in latest year'
          }
        } else if (metricDef.segment === 'Valuation') {
          if (info.priceDataDaysBeforeScoringDate === 0) reason = 'No price data before scoring date'
          else if (info.pnlYearColsWindowed.length < 2 || info.balanceSheetYearColsWindowed.length < 2) reason = 'Insufficient statement years for 5Y avg (need ≥2 for harmonic mean)'
          else reason = 'Negative EPS/BV/EBITDA or insufficient FY-end price matches'
        } else if (metricDef.segment === 'Technical') {
          if (info.priceDataDaysBeforeScoringDate < 200) reason = `Only ${info.priceDataDaysBeforeScoringDate} trading days (need ≥200)`
          else reason = 'EMA/RSI computation failed'
        } else if (metricDef.segment === 'Quarterly Momentum') {
          const qrCount = info.quarterlyYearColsWindowed.length
          if (qrCount < 8) reason = `Only ${qrCount} quarterly columns before scoring date (need ≥8)`
          else reason = 'No YoY match found or annual CAGR ≤ 0'
        }
        reasons[reason] = (reasons[reason] || 0) + 1
      }
    }

    return {
      ...metricDef,
      available,
      unavailable,
      availabilityPct: Math.round((available / diagnostics.length) * 100 * 10) / 10,
      reasons,
    }
  })

  // ── Step 4: Print Results ──
  console.log('[4/4] Results:\n')
  console.log('='.repeat(80))
  console.log('  METRIC-LEVEL DATA AVAILABILITY (as of ' + SCORING_DATE + ')')
  console.log('='.repeat(80))

  const segments = ['Financial', 'Valuation', 'Technical', 'Quarterly Momentum']
  for (const segment of segments) {
    const segMetrics = metricStats.filter(m => m.segment === segment)
    const segAvail = segMetrics.reduce((sum, m) => sum + m.available, 0)
    const segTotal = segMetrics.reduce((sum, m) => sum + m.available + m.unavailable, 0)
    const segPct = segTotal > 0 ? Math.round((segAvail / segTotal) * 100 * 10) / 10 : 0

    console.log(`\n── ${segment} Segment (Overall: ${segPct}% available) ──`)
    console.log('─'.repeat(80))

    for (const m of segMetrics) {
      const status = m.availabilityPct >= 80 ? '✓' : m.availabilityPct >= 50 ? '△' : '✗'
      console.log(`  ${status} ${m.name.padEnd(40)} ${String(m.availabilityPct + '%').padStart(7)} available  (${m.available}/${m.available + m.unavailable})`)
      console.log(`    Weight: ${m.weight} | Source: ${m.source}`)
      console.log(`    Requirement: ${m.requirement}`)
      if (Object.keys(m.reasons).length > 0) {
        console.log(`    Unavailability reasons:`)
        const sortedReasons = Object.entries(m.reasons).sort((a, b) => b[1] - a[1])
        for (const [reason, count] of sortedReasons) {
          console.log(`      - ${reason}: ${count} stocks (${Math.round(count / (m.available + m.unavailable) * 100)}%)`)
        }
      }
    }
  }

  // Segment-level scoring analysis
  console.log('\n' + '='.repeat(80))
  console.log('  SEGMENT-LEVEL SCORING RESULTS')
  console.log('='.repeat(80))

  const scoredStocks = diagnostics.filter(d => d.scoreResult != null)
  console.log(`\n  Stocks with valid score results: ${scoredStocks.length}/${diagnostics.length}`)

  for (const segment of ['v4_financial', 'v4_valuation', 'v4_technical', 'v4_quarterly_momentum']) {
    const segName = segment.replace('v4_', '').replace('_', ' ')
    let withData = 0
    let withScore = 0
    let withNA = 0

    for (const diag of scoredStocks) {
      const seg = diag.scoreResult!.segmentResults.find(s => s.segmentId === segment)
      if (!seg) { withNA++; continue }
      if (seg.segmentScore > 0) withScore++
      else withNA++
      withData++
    }

    console.log(`  ${segName.toUpperCase().padEnd(25)} Score>0: ${withScore}/${scoredStocks.length} (${Math.round(withScore/scoredStocks.length*100)}%)  N/A: ${withNA}/${scoredStocks.length} (${Math.round(withNA/scoredStocks.length*100)}%)`)
  }

  // Raw data availability summary
  console.log('\n' + '='.repeat(80))
  console.log('  RAW CMOTS DATA AVAILABILITY SUMMARY')
  console.log('='.repeat(80))

  const dataStats = {
    ttm: diagnostics.filter(d => d.rawDataInfo.ttmAvailable).length,
    finData: { min: Infinity, max: -Infinity, avg: 0, zero: 0 },
    pnl: { min: Infinity, max: -Infinity, avg: 0, zero: 0 },
    cashFlow: { min: Infinity, max: -Infinity, avg: 0, zero: 0 },
    balanceSheet: { min: Infinity, max: -Infinity, avg: 0, zero: 0 },
    quarterly: { min: Infinity, max: -Infinity, avg: 0, zero: 0 },
    price: { min: Infinity, max: -Infinity, avg: 0, lessThan200: 0 },
    shareholding: { min: Infinity, max: -Infinity, avg: 0, zero: 0 },
  }

  for (const diag of diagnostics) {
    const info = diag.rawDataInfo

    // FinData (windowed)
    const fd = info.finDataYears
    dataStats.finData.min = Math.min(dataStats.finData.min, fd)
    dataStats.finData.max = Math.max(dataStats.finData.max, fd)
    dataStats.finData.avg += fd
    if (fd === 0) dataStats.finData.zero++

    // P&L (windowed)
    const pl = info.pnlYearColsWindowed.length
    dataStats.pnl.min = Math.min(dataStats.pnl.min, pl)
    dataStats.pnl.max = Math.max(dataStats.pnl.max, pl)
    dataStats.pnl.avg += pl
    if (pl === 0) dataStats.pnl.zero++

    // CashFlow (windowed)
    const cf = info.cashFlowYearColsWindowed.length
    dataStats.cashFlow.min = Math.min(dataStats.cashFlow.min, cf)
    dataStats.cashFlow.max = Math.max(dataStats.cashFlow.max, cf)
    dataStats.cashFlow.avg += cf
    if (cf === 0) dataStats.cashFlow.zero++

    // BS (windowed)
    const bs = info.balanceSheetYearColsWindowed.length
    dataStats.balanceSheet.min = Math.min(dataStats.balanceSheet.min, bs)
    dataStats.balanceSheet.max = Math.max(dataStats.balanceSheet.max, bs)
    dataStats.balanceSheet.avg += bs
    if (bs === 0) dataStats.balanceSheet.zero++

    // Quarterly (windowed)
    const qr = info.quarterlyYearColsWindowed.length
    dataStats.quarterly.min = Math.min(dataStats.quarterly.min, qr)
    dataStats.quarterly.max = Math.max(dataStats.quarterly.max, qr)
    dataStats.quarterly.avg += qr
    if (qr === 0) dataStats.quarterly.zero++

    // Price (before scoring date)
    const pr = info.priceDataDaysBeforeScoringDate
    dataStats.price.min = Math.min(dataStats.price.min, pr)
    dataStats.price.max = Math.max(dataStats.price.max, pr)
    dataStats.price.avg += pr
    if (pr < 200) dataStats.price.lessThan200++

    // Shareholding
    const sh = info.shareholdingQuarters
    dataStats.shareholding.min = Math.min(dataStats.shareholding.min, sh)
    dataStats.shareholding.max = Math.max(dataStats.shareholding.max, sh)
    dataStats.shareholding.avg += sh
    if (sh === 0) dataStats.shareholding.zero++
  }

  const n = diagnostics.length
  console.log(`\n  TTM data available: ${dataStats.ttm}/${n} (${Math.round(dataStats.ttm/n*100)}%)`)
  console.log(`  Note: TTM is current (not historical) — used only as fallback for ROE\n`)

  const printStat = (label: string, stat: { min: number; max: number; avg: number; zero: number }) => {
    const avg = Math.round(stat.avg / n * 10) / 10
    console.log(`  ${label.padEnd(30)} Min: ${stat.min}  Max: ${stat.max}  Avg: ${avg}  None: ${stat.zero} (${Math.round(stat.zero/n*100)}%)`)
  }

  printStat('FinData (windowed years)', dataStats.finData)
  printStat('P&L (windowed year cols)', dataStats.pnl)
  printStat('CashFlow (windowed year cols)', dataStats.cashFlow)
  printStat('BalanceSheet (windowed years)', dataStats.balanceSheet)
  printStat('Quarterly (windowed Q cols)', dataStats.quarterly)
  console.log(`  ${'Price (trading days ≤ date)'.padEnd(30)} Min: ${dataStats.price.min}  Max: ${dataStats.price.max}  Avg: ${Math.round(dataStats.price.avg/n)}  <200 days: ${dataStats.price.lessThan200} (${Math.round(dataStats.price.lessThan200/n*100)}%)`)
  printStat('Shareholding (quarters)', dataStats.shareholding)

  // Show a few example year columns
  console.log('\n  Example P&L year columns (all vs windowed to ' + SCORING_DATE + '):')
  for (const diag of diagnostics.slice(0, 3)) {
    console.log(`    ${diag.company.companyname}:`)
    console.log(`      All:      ${diag.rawDataInfo.pnlYearCols.join(', ') || '(none)'}`)
    console.log(`      Windowed: ${diag.rawDataInfo.pnlYearColsWindowed.join(', ') || '(none)'}`)
  }

  console.log('\n  Example Quarterly columns (all vs windowed to ' + SCORING_DATE + '):')
  for (const diag of diagnostics.slice(0, 3)) {
    console.log(`    ${diag.company.companyname}:`)
    console.log(`      All:      ${diag.rawDataInfo.quarterlyYearCols.join(', ') || '(none)'}`)
    console.log(`      Windowed: ${diag.rawDataInfo.quarterlyYearColsWindowed.join(', ') || '(none)'}`)
  }

  // Key findings summary
  console.log('\n' + '='.repeat(80))
  console.log('  KEY FINDINGS & DATA GAPS FOR ' + SCORING_DATE)
  console.log('='.repeat(80))

  const criticalGaps: string[] = []
  for (const m of metricStats) {
    if (m.availabilityPct < 50) {
      criticalGaps.push(`  ✗ ${m.name} (${m.segment}): Only ${m.availabilityPct}% available`)
      const topReason = Object.entries(m.reasons).sort((a, b) => b[1] - a[1])[0]
      if (topReason) {
        criticalGaps.push(`    → Primary cause: ${topReason[0]}`)
      }
    }
  }

  const warningGaps: string[] = []
  for (const m of metricStats) {
    if (m.availabilityPct >= 50 && m.availabilityPct < 80) {
      warningGaps.push(`  △ ${m.name} (${m.segment}): ${m.availabilityPct}% available`)
      const topReason = Object.entries(m.reasons).sort((a, b) => b[1] - a[1])[0]
      if (topReason) {
        warningGaps.push(`    → Primary cause: ${topReason[0]}`)
      }
    }
  }

  const goodMetrics: string[] = []
  for (const m of metricStats) {
    if (m.availabilityPct >= 80) {
      goodMetrics.push(`  ✓ ${m.name} (${m.segment}): ${m.availabilityPct}% available`)
    }
  }

  if (criticalGaps.length > 0) {
    console.log('\n  CRITICAL GAPS (< 50% availability):')
    criticalGaps.forEach(g => console.log(g))
  }

  if (warningGaps.length > 0) {
    console.log('\n  WARNING (50-80% availability):')
    warningGaps.forEach(g => console.log(g))
  }

  if (goodMetrics.length > 0) {
    console.log('\n  GOOD (≥ 80% availability):')
    goodMetrics.forEach(g => console.log(g))
  }

  // Overall assessment
  const overallAvailPct = Math.round(metricStats.reduce((s, m) => s + m.availabilityPct, 0) / metricStats.length * 10) / 10
  console.log(`\n  OVERALL METRIC AVAILABILITY: ${overallAvailPct}%`)
  console.log('='.repeat(80) + '\n')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
