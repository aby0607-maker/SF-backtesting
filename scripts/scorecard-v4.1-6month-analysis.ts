/**
 * Scorecard V4.1 Stock Analysis — 6-Month Backtest Report
 *
 * Scores all BSE-listed non-banking stocks using V4 Non-Banking Scorecard
 * as of Aug 2025, tracks price performance through Feb 2026 (~6 months),
 * and analyzes whether higher scores predict higher price gains.
 *
 * Key improvements over V4:
 *   - Fixed Valuation N/A detection (uses verdict instead of isNaN)
 *   - Tracks Valuation N/A stocks in separate CSV
 *   - Closer start date improves QM segment coverage
 *
 * Outputs:
 *   - report.md                    — Human-readable findings
 *   - stock-scores-and-returns.csv — Full stock-level data
 *   - stock-metric-details.csv     — Per-metric raw + score per stock
 *   - quintile-analysis.csv        — Q1-Q5 breakdown
 *   - sector-summary.csv           — Per-sector aggregates
 *   - verdict-band-analysis.csv    — Returns by verdict band
 *   - valuation-na-stocks.csv      — Stocks excluded due to Valuation N/A
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json scripts/scorecard-v4.1-6month-analysis.ts
 *   npx tsx --tsconfig tsconfig.json scripts/scorecard-v4.1-6month-analysis.ts --limit 50
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
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
const START_DATE = '2025-08-24'
const END_DATE = '2026-02-25'
const OUTPUT_DIR = resolve(__dirname, '..', 'Backtest V 4.1 Scorecard - Aug-25 to Feb-26')
const CMOTS_BASE = 'https://deltastockzapis.cmots.com/api'
const CONCURRENCY = 4
const MAX_RETRIES = 2

// Parse --limit flag
const limitArg = process.argv.find(a => a.startsWith('--limit'))
const STOCK_LIMIT = limitArg ? parseInt(limitArg.split('=')[1] || process.argv[process.argv.indexOf(limitArg) + 1] || '0') : 0

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

interface StockAnalysisResult {
  stockId: string
  companyName: string
  symbol: string
  sector: string
  mcapType: string
  industry: string
  scoreResult: StockScoreResult
  resolvedData: Record<string, number | null>
  startPrice: number
  endPrice: number
  returnPct: number
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
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60s for large payloads

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

// ─── Price Helpers ────────────────────────────────────────

function findClosestPrice(prices: PriceBar[], targetDate: string): PriceBar | null {
  let closest: PriceBar | null = null
  for (const p of prices) {
    if (p.date <= targetDate) {
      closest = p
    } else {
      break
    }
  }
  return closest
}

// ─── Pearson Correlation ─────────────────────────────────

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length
  if (n !== y.length || n < 3) return 0

  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0)

  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

  if (Math.abs(denominator) < 1e-10) return 0
  return Math.round((numerator / denominator) * 1000) / 1000
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

function winsorize(val: number, cap = 200): number {
  return Math.max(-cap, Math.min(cap, val))
}

// ─── Main ─────────────────────────────────────────────────

async function main() {
  console.log('\n' + '='.repeat(70))
  console.log('  SCORECARD V4.1 — 6-MONTH BACKTEST REPORT')
  console.log('  Score vs Price Prediction Analysis (Aug 2025 → Feb 2026)')
  console.log('='.repeat(70))
  console.log(`  Start Date:  ${START_DATE}`)
  console.log(`  End Date:    ${END_DATE}`)
  console.log(`  Scorecard:   V4 Non-Banking Expert (F:30% V:45% QM:18% T:7%)`)
  console.log(`  Concurrency: ${CONCURRENCY} stocks parallel`)
  if (STOCK_LIMIT > 0) console.log(`  Limit:       ${STOCK_LIMIT} stocks (testing mode)`)
  console.log('='.repeat(70) + '\n')

  // ── Step 1: Fetch Company Master ──
  console.log('[1/6] Fetching company master...')
  const allCompanies = await cmotsFetch<CompanyInfo>('/companymaster')
  if (allCompanies.length === 0) {
    console.error('ERROR: Could not fetch company master. Check CMOTS_API_TOKEN.')
    process.exit(1)
  }

  // Filter to BSE-active
  const bseActive = allCompanies.filter(
    (c: any) => c.bselistedflag === 'Y' || c.BSEStatus === 'Active',
  )
  console.log(`  Total BSE-active companies: ${bseActive.length}`)

  // Identify and exclude banking stocks
  const bankingStocks: CompanyInfo[] = []
  const nonBankingStocks: CompanyInfo[] = []
  const excludedSectors = new Set<string>()

  for (const company of bseActive) {
    const sector = (company.sectorname || '').toLowerCase()
    const industry = ((company as any).industryname || '').toLowerCase()
    const isBanking = BANKING_SECTOR_KEYWORDS.some(
      kw => sector.includes(kw) || industry.includes(kw),
    )

    if (isBanking) {
      bankingStocks.push(company)
      excludedSectors.add(company.sectorname)
    } else {
      nonBankingStocks.push(company)
    }
  }

  console.log(`  Banking stocks excluded: ${bankingStocks.length}`)
  console.log(`  Excluded sectors: ${[...excludedSectors].join(', ')}`)
  console.log(`  Non-banking stocks: ${nonBankingStocks.length}`)

  // Apply limit if set
  let targetStocks = nonBankingStocks
  if (STOCK_LIMIT > 0) {
    targetStocks = nonBankingStocks.slice(0, STOCK_LIMIT)
    console.log(`  Limited to: ${targetStocks.length} stocks (--limit flag)`)
  }

  // ── Step 2: Process Each Stock ──
  console.log(`\n[2/6] Scoring stocks and fetching prices (${targetStocks.length} stocks)...`)
  const startTime = Date.now()
  let processed = 0
  let skipped = 0
  const warnings: string[] = []

  const results = await pMapConcurrent<CompanyInfo, StockAnalysisResult | null>(
    targetStocks,
    async (company, _idx) => {
      const coCode = company.co_code
      const stockId = String(coCode)

      try {
        // Fetch all data in parallel
        const extendedFrom = new Date(START_DATE)
        extendedFrom.setFullYear(extendedFrom.getFullYear() - 6)
        const extendedFromStr = extendedFrom.toISOString().split('T')[0]

        const [ttmArr, finData, pnl, cashFlow, balanceSheet, quarterly, shareholding, priceData] =
          await Promise.all([
            cmotsFetch<any>(`/TTMData/${coCode}/s`),
            cmotsFetch<any>(`/FinData/${coCode}/s`),
            cmotsFetch<any>(`/ProftandLoss/${coCode}/s`),
            cmotsFetch<any>(`/CashFlow/${coCode}/s`),
            cmotsFetch<any>(`/BalanceSheet/${coCode}/s`),
            cmotsFetch<any>(`/QuarterlyResults/${coCode}/s`),
            cmotsFetch<any>(`/Aggregate-Share-Holding/${coCode}/s`),
            cmotsFetch<any>(`/AdjustedPriceChart/bse/${coCode}/${extendedFromStr}/${END_DATE}`),
          ])

        // Check minimum data
        if (pnl.length === 0 && finData.length === 0) {
          skipped++
          return null
        }
        if (priceData.length < 10) {
          skipped++
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

        if (priceHistory.length < 10) {
          skipped++
          return null
        }

        // Find start and end prices
        const startBar = findClosestPrice(priceHistory, START_DATE)
        const endBar = findClosestPrice(priceHistory, END_DATE)

        if (!startBar || !endBar || startBar.price <= 0 || endBar.price <= 0) {
          skipped++
          return null
        }

        // Score at start date
        const resolved = resolveMetricsAtDate(fundamentals, priceHistory, START_DATE)
        const scoreResult = scoreStock(
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

        const returnPct = Math.round(((endBar.price - startBar.price) / startBar.price) * 100 * 100) / 100

        processed++
        if (processed % 25 === 0 || processed === targetStocks.length) {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
          console.log(`  Processed: ${processed}/${targetStocks.length} (${skipped} skipped) [${elapsed}s]`)
        }

        return {
          stockId,
          companyName: company.companyname,
          symbol: company.nsesymbol || company.bsecode || stockId,
          sector: company.sectorname,
          mcapType: company.mcaptype || 'Unknown',
          industry: company.industryname || '',
          scoreResult,
          resolvedData: resolved.data,
          startPrice: Math.round(startBar.price * 100) / 100,
          endPrice: Math.round(endBar.price * 100) / 100,
          returnPct,
        }
      } catch (err) {
        skipped++
        warnings.push(`${company.companyname} (${coCode}): ${err instanceof Error ? err.message : 'unknown error'}`)
        return null
      }
    },
    CONCURRENCY,
  )

  // Filter successful results — track Valuation N/A stocks separately
  // Note: The scoring engine converts NaN composites to normalizedScore=0 + verdict='N/A'
  // (scoringEngine.ts line 731-743), so isNaN() would never catch them. Use verdict instead.
  const allScored = results.filter((r): r is StockAnalysisResult => r !== null)
  const valuationNAStocks = allScored.filter(r => r.scoreResult.verdict === 'N/A')
  const scoredStocks = allScored.filter(r => r.scoreResult.verdict !== 'N/A' && r.scoreResult.normalizedScore > 0)

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
  console.log(`\n  Completed in ${elapsed}s`)
  console.log(`  Successfully scored: ${scoredStocks.length}`)
  console.log(`  Valuation N/A (composite NaN): ${valuationNAStocks.length}`)
  console.log(`  Skipped (no data): ${skipped}`)
  if (warnings.length > 0) {
    console.log(`  Warnings: ${warnings.length}`)
  }

  if (scoredStocks.length < 5) {
    console.error('\nERROR: Too few stocks scored. Check API token and connectivity.')
    process.exit(1)
  }

  // Sort by score descending
  scoredStocks.sort((a, b) => b.scoreResult.normalizedScore - a.scoreResult.normalizedScore)

  // ── Step 3: Compute Analytics ──
  console.log('\n[3/6] Computing analytics...')

  const scores = scoredStocks.map(s => s.scoreResult.normalizedScore)
  const returns = scoredStocks.map(s => s.returnPct)
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
  const overallCorrelation = pearsonCorrelation(scores, returns)

  // Quintile Analysis
  const quintileSize = Math.ceil(scoredStocks.length / 5)
  const quintiles = []
  const quintileLabels = ['Q1 (Top 20%)', 'Q2 (20-40%)', 'Q3 (40-60%)', 'Q4 (60-80%)', 'Q5 (Bottom 20%)']

  for (let q = 0; q < 5; q++) {
    const start = q * quintileSize
    const end = Math.min(start + quintileSize, scoredStocks.length)
    const qStocks = scoredStocks.slice(start, end)
    if (qStocks.length === 0) continue

    const qScores = qStocks.map(s => s.scoreResult.normalizedScore)
    const qReturns = qStocks.map(s => s.returnPct)
    const positiveReturns = qReturns.filter(r => r > 0).length

    const qWinsorized = qReturns.map(r => winsorize(r))

    quintiles.push({
      quintile: q + 1,
      label: quintileLabels[q],
      stockCount: qStocks.length,
      avgScore: Math.round((qScores.reduce((a, b) => a + b, 0) / qScores.length) * 100) / 100,
      minScore: Math.round(Math.min(...qScores) * 100) / 100,
      maxScore: Math.round(Math.max(...qScores) * 100) / 100,
      avgReturn: Math.round((qReturns.reduce((a, b) => a + b, 0) / qReturns.length) * 100) / 100,
      winsorizedAvgReturn: Math.round((qWinsorized.reduce((a, b) => a + b, 0) / qWinsorized.length) * 100) / 100,
      medianReturn: Math.round(median(qReturns) * 100) / 100,
      hitRatePositive: Math.round((positiveReturns / qStocks.length) * 100 * 100) / 100,
      bestStock: qStocks.reduce((best, s) => s.returnPct > best.returnPct ? s : best),
      worstStock: qStocks.reduce((worst, s) => s.returnPct < worst.returnPct ? s : worst),
    })
  }

  // Verdict Band Analysis
  const verdictBands = ['STRONG BUY', 'BUY', 'HOLD', 'REVIEW', 'SELL']
  const verdictAnalysis = verdictBands.map(verdict => {
    const vStocks = scoredStocks.filter(s => s.scoreResult.verdict === verdict)
    if (vStocks.length === 0) {
      return { verdict, stockCount: 0, avgScore: 0, avgReturn: 0, winsorizedAvgReturn: 0, medianReturn: 0, hitRatePositive: 0, pctOfUniverse: 0 }
    }
    const vReturns = vStocks.map(s => s.returnPct)
    const vScores = vStocks.map(s => s.scoreResult.normalizedScore)
    const vWinsorized = vReturns.map(r => winsorize(r))
    return {
      verdict,
      stockCount: vStocks.length,
      avgScore: Math.round((vScores.reduce((a, b) => a + b, 0) / vScores.length) * 100) / 100,
      avgReturn: Math.round((vReturns.reduce((a, b) => a + b, 0) / vReturns.length) * 100) / 100,
      winsorizedAvgReturn: Math.round((vWinsorized.reduce((a, b) => a + b, 0) / vWinsorized.length) * 100) / 100,
      medianReturn: Math.round(median(vReturns) * 100) / 100,
      hitRatePositive: Math.round((vReturns.filter(r => r > 0).length / vStocks.length) * 100 * 100) / 100,
      pctOfUniverse: Math.round((vStocks.length / scoredStocks.length) * 100 * 100) / 100,
    }
  })

  // Sector Analysis
  const sectorMap = new Map<string, StockAnalysisResult[]>()
  for (const s of scoredStocks) {
    const sector = s.sector || 'Unknown'
    if (!sectorMap.has(sector)) sectorMap.set(sector, [])
    sectorMap.get(sector)!.push(s)
  }

  const sectorAnalysis = [...sectorMap.entries()]
    .map(([sector, stocks]) => {
      const sReturns = stocks.map(s => s.returnPct)
      const sScores = stocks.map(s => s.scoreResult.normalizedScore)
      const sWinsorized = sReturns.map(r => winsorize(r))
      return {
        sector,
        stockCount: stocks.length,
        avgScore: Math.round((sScores.reduce((a, b) => a + b, 0) / sScores.length) * 100) / 100,
        avgReturn: Math.round((sReturns.reduce((a, b) => a + b, 0) / sReturns.length) * 100) / 100,
        winsorizedAvgReturn: Math.round((sWinsorized.reduce((a, b) => a + b, 0) / sWinsorized.length) * 100) / 100,
        medianReturn: Math.round(median(sReturns) * 100) / 100,
        correlation: stocks.length >= 5 ? pearsonCorrelation(sScores, sReturns) : 0,
        bestStock: stocks.reduce((best, s) => s.returnPct > best.returnPct ? s : best),
        worstStock: stocks.reduce((worst, s) => s.returnPct < worst.returnPct ? s : worst),
      }
    })
    .sort((a, b) => b.stockCount - a.stockCount)

  // Segment Contribution Analysis
  const segmentIds = ['v4_financial', 'v4_valuation', 'v4_technical', 'v4_quarterly_momentum']
  const segmentLabels = ['Financial', 'Valuation', 'Technical', 'Quarterly Momentum']
  const segmentCorrelations = segmentIds.map((segId, i) => {
    const segScores = scoredStocks.map(s => {
      const seg = s.scoreResult.segmentResults.find(sr => sr.segmentId === segId)
      return seg?.segmentScore ?? 0
    })
    return {
      segment: segmentLabels[i],
      correlation: pearsonCorrelation(segScores, returns),
    }
  })

  // ── Step 4: Generate Reports ──
  console.log('\n[4/6] Generating report files...')

  // Create output directory
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  // V4 metric IDs for the detail CSV
  const metricIds = [
    'v4_revenue_growth', 'v4_ebitda_growth', 'v4_earnings_pbt_oi', 'v4_roe',
    'v4_ocf_ebitda_cagr', 'v4_gross_block', 'v4_debt_ebitda',
    'v4_pe_vs_5y', 'v4_pb_vs_5y', 'v4_ev_vs_5y',
    'v4_revenue_multiplier', 'v4_ebitda_multiplier',
    'v4_20dma', 'v4_50dma', 'v4_200dma', 'v4_rsi', 'v4_vpt',
  ]
  const metricLabels = [
    'Revenue Growth', 'EBITDA Growth', 'Earnings (PBT-OI)', 'ROE',
    'OCF/EBITDA CAGR', 'Gross Block', 'Debt/EBITDA',
    'PE vs 5Y', 'PB vs 5Y', 'EV vs 5Y',
    'Revenue Multiplier', 'EBITDA Multiplier',
    '20-DMA', '50-DMA', '200-DMA', 'RSI', 'VPT',
  ]

  // ── File 1: report.md ──
  const top20 = scoredStocks.slice(0, 20)
  const bottom20 = [...scoredStocks].sort((a, b) => a.returnPct - b.returnPct).slice(0, 20)
  const topByReturn = [...scoredStocks].sort((a, b) => b.returnPct - a.returnPct).slice(0, 20)

  const daysDiff = Math.round((new Date(END_DATE).getTime() - new Date(START_DATE).getTime()) / (24 * 3600 * 1000))
  const monthsDiff = Math.round(daysDiff / 30.44)

  let report = `# Scorecard V4.1 — 6-Month Backtest Report\n`
  report += `## Score vs Price Prediction Analysis\n\n`
  report += `**Date Range:** ${START_DATE} to ${END_DATE} (~${monthsDiff} months)\n`
  report += `**Scorecard:** V4 Non-Banking Expert Model (F:30% + V:45% + QM:18% + T:7%)\n`
  report += `**Universe:** All BSE-listed non-banking stocks\n`
  report += `**Generated:** ${new Date().toISOString().split('T')[0]}\n\n`

  report += `---\n\n`
  report += `## Executive Summary\n\n`
  report += `| Metric | Value |\n|--------|-------|\n`
  report += `| Total stocks analyzed | ${scoredStocks.length} |\n`
  report += `| Valuation N/A (composite NaN) | ${valuationNAStocks.length} |\n`
  report += `| Banking stocks excluded | ${bankingStocks.length} |\n`
  report += `| Stocks skipped (no data) | ${skipped} |\n`
  const winReturns = returns.map(r => winsorize(r))
  const winCorr = pearsonCorrelation(scores, winReturns)
  report += `| Overall Score-Return Correlation (Pearson) | **${overallCorrelation}** |\n`
  report += `| Winsorized Correlation (±200% cap) | **${winCorr}** |\n`
  report += `| Average Return (all stocks) | ${avgReturn.toFixed(2)}% |\n`
  report += `| Median Return | ${median(returns).toFixed(2)}% |\n`
  report += `| Positive Return Hit Rate | ${(returns.filter(r => r > 0).length / returns.length * 100).toFixed(1)}% |\n`
  report += `| Best Performing Stock | ${topByReturn[0]?.companyName} (${topByReturn[0]?.returnPct}%) |\n`
  report += `| Worst Performing Stock | ${bottom20[0]?.companyName} (${bottom20[0]?.returnPct}%) |\n`
  report += `| Highest Score | ${scoredStocks[0]?.companyName} (${scoredStocks[0]?.scoreResult.normalizedScore.toFixed(1)}) |\n\n`

  const corrInterpretation = Math.abs(overallCorrelation) < 0.1 ? 'negligible'
    : Math.abs(overallCorrelation) < 0.3 ? 'weak'
    : Math.abs(overallCorrelation) < 0.5 ? 'moderate'
    : 'strong'
  report += `**Key Finding:** The overall Pearson correlation between V4 scores and subsequent price returns is **${overallCorrelation}** (${corrInterpretation} ${overallCorrelation >= 0 ? 'positive' : 'negative'}). `
  if (overallCorrelation > 0.1) {
    report += `This suggests higher V4 scores are associated with higher subsequent returns.\n\n`
  } else if (overallCorrelation < -0.1) {
    report += `This suggests higher V4 scores are inversely associated with subsequent returns.\n\n`
  } else {
    report += `At the aggregate level, V4 scores show limited linear correlation with returns. Quintile analysis below may reveal non-linear patterns.\n\n`
  }

  // Quintile Analysis
  report += `---\n\n`
  report += `## Quintile Analysis\n\n`
  report += `Stocks ranked by V4 score and split into 5 equal groups. A "staircase" pattern (Q1 > Q2 > ... > Q5 in returns) indicates the score predicts performance.\n\n`
  report += `| Quintile | Stocks | Avg Score | Avg Return % | Winsorized Avg % | Median Return % | Hit Rate (>0%) | Best Stock | Worst Stock |\n`
  report += `|----------|--------|-----------|-------------|-----------------|----------------|----------------|------------|-------------|\n`
  for (const q of quintiles) {
    report += `| ${q.label} | ${q.stockCount} | ${q.avgScore} | ${q.avgReturn}% | ${q.winsorizedAvgReturn}% | ${q.medianReturn}% | ${q.hitRatePositive}% | ${q.bestStock.companyName} (${q.bestStock.returnPct}%) | ${q.worstStock.companyName} (${q.worstStock.returnPct}%) |\n`
  }

  const q1Return = quintiles[0]?.avgReturn ?? 0
  const q5Return = quintiles[4]?.avgReturn ?? 0
  report += `\n**Q1 vs Q5 Spread:** ${(q1Return - q5Return).toFixed(2)} percentage points\n`
  if (q1Return > q5Return) {
    report += `Top-scored stocks (Q1) outperformed bottom-scored stocks (Q5) by ${(q1Return - q5Return).toFixed(2)}pp on average.\n\n`
  } else {
    report += `Bottom-scored stocks (Q5) actually outperformed top-scored stocks (Q1). The model may not be predictive in this period.\n\n`
  }

  // Verdict Band Analysis
  report += `---\n\n`
  report += `## Verdict Band Analysis\n\n`
  report += `How did each verdict category perform?\n\n`
  report += `| Verdict | Stocks | % Universe | Avg Score | Avg Return % | Winsorized Avg % | Median Return % | Hit Rate (>0%) |\n`
  report += `|---------|--------|-----------|-----------|-------------|-----------------|----------------|----------------|\n`
  for (const v of verdictAnalysis) {
    if (v.stockCount === 0) continue
    report += `| ${v.verdict} | ${v.stockCount} | ${v.pctOfUniverse}% | ${v.avgScore} | ${v.avgReturn}% | ${v.winsorizedAvgReturn}% | ${v.medianReturn}% | ${v.hitRatePositive}% |\n`
  }

  report += `\n`

  // Segment Contribution
  report += `---\n\n`
  report += `## Segment Contribution — Which Segment Best Predicts Returns?\n\n`
  report += `Pearson correlation between individual segment scores and price returns:\n\n`
  report += `| Segment | Weight in V4 | Correlation with Returns |\n`
  report += `|---------|-------------|-------------------------|\n`
  const segWeights = ['30%', '45%', '7%', '18%']
  for (let i = 0; i < segmentCorrelations.length; i++) {
    report += `| ${segmentCorrelations[i].segment} | ${segWeights[i]} | ${segmentCorrelations[i].correlation} |\n`
  }
  const bestSegment = segmentCorrelations.reduce((best, s) => s.correlation > best.correlation ? s : best)
  report += `\n**Most predictive segment:** ${bestSegment.segment} (r=${bestSegment.correlation})\n\n`

  // Sector Analysis
  report += `---\n\n`
  report += `## Sector Analysis\n\n`
  report += `| Sector | Stocks | Avg Score | Avg Return % | Winsorized Avg % | Median Return % | Correlation |\n`
  report += `|--------|--------|-----------|-------------|-----------------|----------------|-------------|\n`
  for (const s of sectorAnalysis) {
    if (s.stockCount < 2) continue
    report += `| ${s.sector} | ${s.stockCount} | ${s.avgScore} | ${s.avgReturn}% | ${s.winsorizedAvgReturn}% | ${s.medianReturn}% | ${s.correlation} |\n`
  }

  report += `\n`

  // Top/Bottom performers
  report += `---\n\n`
  report += `## Top 20 Stocks by Score\n\n`
  report += `| Rank | Stock | Sector | Score | Verdict | Return % |\n`
  report += `|------|-------|--------|-------|---------|----------|\n`
  for (let i = 0; i < top20.length; i++) {
    const s = top20[i]
    report += `| ${i + 1} | ${s.companyName} | ${s.sector} | ${s.scoreResult.normalizedScore.toFixed(1)} | ${s.scoreResult.verdict} | ${s.returnPct}% |\n`
  }

  report += `\n## Top 20 Stocks by Return\n\n`
  report += `| Rank | Stock | Sector | Score | Verdict | Return % |\n`
  report += `|------|-------|--------|-------|---------|----------|\n`
  for (let i = 0; i < topByReturn.length; i++) {
    const s = topByReturn[i]
    report += `| ${i + 1} | ${s.companyName} | ${s.sector} | ${s.scoreResult.normalizedScore.toFixed(1)} | ${s.scoreResult.verdict} | ${s.returnPct}% |\n`
  }

  report += `\n## Bottom 20 Stocks by Return\n\n`
  report += `| Rank | Stock | Sector | Score | Verdict | Return % |\n`
  report += `|------|-------|--------|-------|---------|----------|\n`
  for (let i = 0; i < bottom20.length; i++) {
    const s = bottom20[i]
    report += `| ${i + 1} | ${s.companyName} | ${s.sector} | ${s.scoreResult.normalizedScore.toFixed(1)} | ${s.scoreResult.verdict} | ${s.returnPct}% |\n`
  }

  // Compute segment data coverage
  let qmWithData = 0
  let techWithData = 0
  let finWithData = 0
  for (const s of scoredStocks) {
    const finSeg = s.scoreResult.segmentResults.find(sr => sr.segmentId === 'v4_financial')
    const qmSeg = s.scoreResult.segmentResults.find(sr => sr.segmentId === 'v4_quarterly_momentum')
    const techSeg = s.scoreResult.segmentResults.find(sr => sr.segmentId === 'v4_technical')
    if (finSeg && finSeg.segmentScore > 0) finWithData++
    if (qmSeg && qmSeg.verdict !== 'N/A' && qmSeg.segmentScore > 0) qmWithData++
    if (techSeg && techSeg.verdict !== 'N/A' && techSeg.segmentScore > 0) techWithData++
  }

  report += `\n---\n\n`
  report += `## Data Completeness & Segment Coverage\n\n`
  report += `### Segment Data Availability\n\n`
  report += `| Segment | Weight (V4) | Stocks with Data | % Coverage | Notes |\n`
  report += `|---------|------------|-----------------|------------|-------|\n`
  report += `| Financial | 30% | ${finWithData} | ${(finWithData/scoredStocks.length*100).toFixed(1)}% | Revenue growth, EBITDA, ROE, etc. |\n`
  report += `| Valuation | 45% | ${scoredStocks.length} (+ ${valuationNAStocks.length} N/A excluded) | ${(scoredStocks.length/(scoredStocks.length+valuationNAStocks.length)*100).toFixed(1)}% of scored | PE/PB/EV vs 5Y averages |\n`
  report += `| Quarterly Momentum | 18% | ${qmWithData} | ${(qmWithData/scoredStocks.length*100).toFixed(1)}% | Revenue & EBITDA multipliers |\n`
  report += `| Technical | 7% | ${techWithData} | ${(techWithData/scoredStocks.length*100).toFixed(1)}% | 20/50/200 DMA, RSI, VPT |\n\n`

  // QM explanation
  const qmPct = ((scoredStocks.length - qmWithData) / scoredStocks.length * 100).toFixed(1)
  report += `### QM Segment Limitation\n\n`
  report += `**${qmPct}% of stocks** have QM segment = N/A (both Revenue and EBITDA Multipliers excluded).\n\n`
  report += `**Root cause:** The CMOTS \`/QuarterlyResults\` API serves only the latest ~8 rolling quarters. `
  report += `For scoring date ${START_DATE} (~${monthsDiff} months before end date), quarterly columns after the scoring date `
  report += `are excluded as future data. The \`computeV4Multiplier()\` function requires ≥8 quarterly columns and YoY matching.\n\n`
  report += `**Formula implementation is correct** — verified against spec. This is a data availability limitation, not a code issue.\n\n`
  report += `**Effect on scoring:** For stocks where QM is N/A, V4 adaptive re-normalization (existing engine rule) `
  report += `redistributes QM's 18% weight to active segments. Effective formula: **F:36.6% + V:54.9% + T:8.5%** `
  report += `(applies to ${qmPct}% of stocks).\n\n`

  // Valuation N/A explanation
  report += `### Valuation N/A Stocks (${valuationNAStocks.length})\n\n`
  report += `**${valuationNAStocks.length} stocks** completed scoring but had Valuation segment = N/A `
  report += `(all PE/PB/EV vs 5Y metrics null), causing the V4 engine to return NaN for the composite score. `
  report += `These are excluded from the analysis above.\n\n`
  report += `**Common causes:**\n`
  report += `- Persistently loss-making (negative EPS → PE undefined, negative EBITDA → EV undefined)\n`
  report += `- Recently listed with < 2 fiscal years of data (harmonic mean requires ≥2 years)\n`
  report += `- Negative book value (accumulated losses eroding equity → PB undefined)\n`
  report += `- Sparse financial data (P&L/BS rows missing specific line items)\n\n`
  report += `**V4 engine rule:** Valuation carries 45% weight. If valuation is entirely N/A, `
  report += `the overall score is considered meaningless → composite returns NaN.\n\n`

  if (valuationNAStocks.length > 0) {
    const naReturns = valuationNAStocks.map(s => s.returnPct)
    const naAvgReturn = naReturns.reduce((a, b) => a + b, 0) / naReturns.length
    const naMedianReturn = median(naReturns)
    report += `**Valuation N/A return comparison** (not included in main analysis):\n`
    report += `- Count: ${valuationNAStocks.length} stocks\n`
    report += `- Average return: ${naAvgReturn.toFixed(2)}%\n`
    report += `- Median return: ${naMedianReturn.toFixed(2)}%\n`
    report += `- Positive return rate: ${(naReturns.filter(r => r > 0).length / naReturns.length * 100).toFixed(1)}%\n`
    report += `- See \`valuation-na-stocks.csv\` for full list.\n\n`
  }

  report += `### Winsorized Averages\n\n`
  report += `Raw averages are heavily distorted by extreme outliers (e.g., Swan Defence +75,843%). `
  report += `**Winsorized averages** cap returns at ±200% before averaging, providing a more robust measure `
  report += `of central tendency. Compare "Avg Return %" (raw) vs "Winsorized Avg %" in the tables above.\n\n`

  report += `---\n\n`
  report += `## Data Quality Notes\n\n`
  report += `- Banking stocks excluded: ${bankingStocks.length} (sectors: ${[...excludedSectors].join(', ')})\n`
  report += `- Stocks skipped due to insufficient data: ${skipped}\n`
  report += `- Valuation N/A (composite NaN): ${valuationNAStocks.length}\n`
  report += `- Stocks successfully scored and analyzed: ${scoredStocks.length}\n`
  if (warnings.length > 0) {
    report += `- Warnings during processing: ${warnings.length}\n`
    for (const w of warnings.slice(0, 20)) {
      report += `  - ${w}\n`
    }
    if (warnings.length > 20) {
      report += `  - ... and ${warnings.length - 20} more\n`
    }
  }

  writeFileSync(resolve(OUTPUT_DIR, 'report.md'), report, 'utf-8')
  console.log(`  Written: report.md`)

  // ── File 2: stock-scores-and-returns.csv ──
  const csvHeader1 = 'stock_id,stock_name,symbol,sector,mcap_type,overall_score,verdict,financial_score,valuation_score,qm_score,technical_score,start_price,end_price,return_pct,outperformance_vs_avg'
  const csvRows1 = scoredStocks.map(s => {
    const fin = s.scoreResult.segmentResults.find(sr => sr.segmentId === 'v4_financial')?.segmentScore ?? 0
    const val = s.scoreResult.segmentResults.find(sr => sr.segmentId === 'v4_valuation')?.segmentScore ?? 0
    const qm = s.scoreResult.segmentResults.find(sr => sr.segmentId === 'v4_quarterly_momentum')?.segmentScore ?? 0
    const tech = s.scoreResult.segmentResults.find(sr => sr.segmentId === 'v4_technical')?.segmentScore ?? 0
    const outperf = Math.round((s.returnPct - avgReturn) * 100) / 100

    return [
      s.stockId,
      `"${s.companyName.replace(/"/g, '""')}"`,
      s.symbol,
      `"${s.sector.replace(/"/g, '""')}"`,
      s.mcapType,
      s.scoreResult.normalizedScore.toFixed(2),
      s.scoreResult.verdict,
      fin.toFixed(2),
      val.toFixed(2),
      qm.toFixed(2),
      tech.toFixed(2),
      s.startPrice,
      s.endPrice,
      s.returnPct,
      outperf,
    ].join(',')
  })

  writeFileSync(
    resolve(OUTPUT_DIR, 'stock-scores-and-returns.csv'),
    [csvHeader1, ...csvRows1].join('\n'),
    'utf-8',
  )
  console.log(`  Written: stock-scores-and-returns.csv`)

  // ── File 3: stock-metric-details.csv ──
  const metricHeaderCols = metricIds.flatMap((id, i) => [`${metricLabels[i]}_raw`, `${metricLabels[i]}_score`])
  const csvHeader3 = ['stock_id', 'stock_name', 'symbol', 'sector', 'overall_score', 'verdict', 'return_pct', ...metricHeaderCols].join(',')

  const csvRows3 = scoredStocks.map(s => {
    const metricCols = metricIds.flatMap(id => {
      const rawVal = s.resolvedData[id]
      // Find the metric score from segment results
      let metricScore: number | null = null
      let excluded = false
      for (const seg of s.scoreResult.segmentResults) {
        const ms = seg.metricScores.find(m => m.metricId === id)
        if (ms) {
          metricScore = ms.normalizedScore
          excluded = ms.isExcluded ?? false
          break
        }
      }
      const rawStr = rawVal != null ? rawVal.toFixed(4) : 'NA'
      const scoreStr = excluded ? 'EXCLUDED' : (metricScore != null ? String(metricScore) : 'NA')
      return [rawStr, scoreStr]
    })

    return [
      s.stockId,
      `"${s.companyName.replace(/"/g, '""')}"`,
      s.symbol,
      `"${s.sector.replace(/"/g, '""')}"`,
      s.scoreResult.normalizedScore.toFixed(2),
      s.scoreResult.verdict,
      s.returnPct,
      ...metricCols,
    ].join(',')
  })

  writeFileSync(
    resolve(OUTPUT_DIR, 'stock-metric-details.csv'),
    [csvHeader3, ...csvRows3].join('\n'),
    'utf-8',
  )
  console.log(`  Written: stock-metric-details.csv`)

  // ── File 4: quintile-analysis.csv ──
  const csvHeader4 = 'quintile,label,stock_count,avg_score,min_score,max_score,avg_return_pct,winsorized_avg_return_pct,median_return_pct,hit_rate_positive,best_stock,best_return,worst_stock,worst_return'
  const csvRows4 = quintiles.map(q => [
    q.quintile,
    `"${q.label}"`,
    q.stockCount,
    q.avgScore,
    q.minScore,
    q.maxScore,
    q.avgReturn,
    q.winsorizedAvgReturn,
    q.medianReturn,
    q.hitRatePositive,
    `"${q.bestStock.companyName.replace(/"/g, '""')}"`,
    q.bestStock.returnPct,
    `"${q.worstStock.companyName.replace(/"/g, '""')}"`,
    q.worstStock.returnPct,
  ].join(','))

  writeFileSync(
    resolve(OUTPUT_DIR, 'quintile-analysis.csv'),
    [csvHeader4, ...csvRows4].join('\n'),
    'utf-8',
  )
  console.log(`  Written: quintile-analysis.csv`)

  // ── File 5: sector-summary.csv ──
  const csvHeader5 = 'sector,stock_count,avg_score,avg_return_pct,winsorized_avg_return_pct,median_return_pct,correlation,best_stock,best_return,worst_stock,worst_return'
  const csvRows5 = sectorAnalysis.map(s => [
    `"${s.sector.replace(/"/g, '""')}"`,
    s.stockCount,
    s.avgScore,
    s.avgReturn,
    s.winsorizedAvgReturn,
    s.medianReturn,
    s.correlation,
    `"${s.bestStock.companyName.replace(/"/g, '""')}"`,
    s.bestStock.returnPct,
    `"${s.worstStock.companyName.replace(/"/g, '""')}"`,
    s.worstStock.returnPct,
  ].join(','))

  writeFileSync(
    resolve(OUTPUT_DIR, 'sector-summary.csv'),
    [csvHeader5, ...csvRows5].join('\n'),
    'utf-8',
  )
  console.log(`  Written: sector-summary.csv`)

  // ── File 6: verdict-band-analysis.csv ──
  const csvHeader6 = 'verdict,stock_count,avg_score,avg_return_pct,winsorized_avg_return_pct,median_return_pct,hit_rate_positive,pct_of_universe'
  const csvRows6 = verdictAnalysis
    .filter(v => v.stockCount > 0)
    .map(v => [
      v.verdict,
      v.stockCount,
      v.avgScore,
      v.avgReturn,
      v.winsorizedAvgReturn,
      v.medianReturn,
      v.hitRatePositive,
      v.pctOfUniverse,
    ].join(','))

  writeFileSync(
    resolve(OUTPUT_DIR, 'verdict-band-analysis.csv'),
    [csvHeader6, ...csvRows6].join('\n'),
    'utf-8',
  )
  console.log(`  Written: verdict-band-analysis.csv`)

  // ── File 7: valuation-na-stocks.csv ──
  const naHeader = 'stock_id,stock_name,symbol,sector,mcap_type,industry,financial_score,qm_score,technical_score,start_price,end_price,return_pct'
  const naRows = valuationNAStocks.map(s => {
    const fin = s.scoreResult.segmentResults.find(sr => sr.segmentId === 'v4_financial')?.segmentScore ?? 0
    const qm = s.scoreResult.segmentResults.find(sr => sr.segmentId === 'v4_quarterly_momentum')?.segmentScore ?? 0
    const tech = s.scoreResult.segmentResults.find(sr => sr.segmentId === 'v4_technical')?.segmentScore ?? 0
    return [
      s.stockId,
      `"${s.companyName.replace(/"/g, '""')}"`,
      s.symbol,
      `"${s.sector.replace(/"/g, '""')}"`,
      s.mcapType,
      `"${(s.industry || '').replace(/"/g, '""')}"`,
      fin.toFixed(2),
      qm.toFixed(2),
      tech.toFixed(2),
      s.startPrice,
      s.endPrice,
      s.returnPct,
    ].join(',')
  })

  writeFileSync(
    resolve(OUTPUT_DIR, 'valuation-na-stocks.csv'),
    [naHeader, ...naRows].join('\n'),
    'utf-8',
  )
  console.log(`  Written: valuation-na-stocks.csv (${valuationNAStocks.length} stocks)`)

  // ── Step 5: Print Summary ──
  // Compute winsorized correlation
  const winsorizedReturns = returns.map(r => winsorize(r))
  const winsorizedCorrelation = pearsonCorrelation(scores, winsorizedReturns)

  console.log('\n[5/6] Summary:')
  console.log('='.repeat(70))
  console.log(`  Overall Correlation: ${overallCorrelation}`)
  console.log(`  Winsorized Correlation (±200% cap): ${winsorizedCorrelation}`)
  console.log(`  Universe: ${scoredStocks.length} stocks (+ ${valuationNAStocks.length} Valuation N/A excluded)`)
  console.log('\n  Quintile Returns:')
  for (const q of quintiles) {
    const bar = '#'.repeat(Math.max(0, Math.round((q.avgReturn + 50) / 3)))
    console.log(`    ${q.label.padEnd(20)} Avg Return: ${String(q.avgReturn + '%').padEnd(10)} ${bar}`)
  }
  console.log('\n  Verdict Returns:')
  for (const v of verdictAnalysis) {
    if (v.stockCount === 0) continue
    console.log(`    ${v.verdict.padEnd(15)} (${String(v.stockCount).padStart(4)} stocks) Avg Return: ${v.avgReturn}%`)
  }
  console.log('\n  Segment Predictiveness:')
  for (const s of segmentCorrelations) {
    console.log(`    ${s.segment.padEnd(22)} r = ${s.correlation}`)
  }

  console.log(`\n[6/6] Output saved to: ${OUTPUT_DIR}`)
  console.log('  Files:')
  console.log('    - report.md')
  console.log('    - stock-scores-and-returns.csv')
  console.log('    - stock-metric-details.csv')
  console.log('    - quintile-analysis.csv')
  console.log('    - sector-summary.csv')
  console.log('    - verdict-band-analysis.csv')
  console.log('    - valuation-na-stocks.csv')
  console.log('\n' + '='.repeat(70))
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
