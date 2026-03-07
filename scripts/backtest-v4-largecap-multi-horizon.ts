/**
 * V4 Large Cap Multi-Horizon Backtest
 *
 * Scores all Large Cap non-banking stocks using V4 Scorecard at 4 dates:
 *   - 5Y: 2021-03-02 → 2025-03-02
 *   - 3Y: 2023-03-02 → 2025-03-02
 *   - 1Y: 2024-03-02 → 2025-03-02
 *   - Current: 2025-03-02 (benchmark, no returns)
 *
 * Fetches data ONCE per stock, scores at each date, computes returns,
 * generates per-horizon reports + cross-horizon comparison.
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json scripts/backtest-v4-largecap-multi-horizon.ts
 *   npx tsx --tsconfig tsconfig.json scripts/backtest-v4-largecap-multi-horizon.ts --limit 5
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from 'fs'
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
const END_DATE = '2025-03-02'
const HORIZONS = [
  { id: '5Y-2021-to-2025', label: '5Y Horizon', startDate: '2021-03-02', endDate: END_DATE, hasReturns: true },
  { id: '3Y-2023-to-2025', label: '3Y Horizon', startDate: '2023-03-02', endDate: END_DATE, hasReturns: true },
  { id: '1Y-2024-to-2025', label: '1Y Horizon', startDate: '2024-03-02', endDate: END_DATE, hasReturns: true },
  { id: 'Current-2025-Benchmark', label: 'Current Benchmark', startDate: END_DATE, endDate: END_DATE, hasReturns: false },
]

const OUTPUT_DIR = resolve(__dirname, '..', 'Backtest_2_V4_2021')
const CMOTS_BASE = 'https://deltastockzapis.cmots.com/api'
const DHAN_BASE = 'https://api.dhan.co/v2'
const CONCURRENCY = 4
const MAX_RETRIES = 2
const MIN_SECTOR_SIZE = 3 // Large caps have fewer stocks per sector

// Parse --limit flag
const limitArg = process.argv.find(a => a.startsWith('--limit'))
const STOCK_LIMIT = limitArg ? parseInt(limitArg.split('=')[1] || process.argv[process.argv.indexOf(limitArg) + 1] || '0') : 0

// Banking sector keywords to exclude
const BANKING_SECTOR_KEYWORDS = [
  'bank', 'banking', 'banks', 'nbfc', 'nidhi company',
  'housing finance', 'micro finance', 'microfinance',
]

// Read tokens
let CMOTS_TOKEN: string
let DHAN_TOKEN: string
try {
  const envPath = resolve(__dirname, '..', '.env.local')
  const envContent = readFileSync(envPath, 'utf-8')
  CMOTS_TOKEN = envContent.match(/CMOTS_API_TOKEN=(.+)/)?.[1]?.trim() || ''
  DHAN_TOKEN = envContent.match(/DHAN_ACCESS_TOKEN=(.+)/)?.[1]?.trim() || ''
} catch {
  CMOTS_TOKEN = process.env.CMOTS_API_TOKEN || ''
  DHAN_TOKEN = process.env.DHAN_ACCESS_TOKEN || ''
}
if (!CMOTS_TOKEN) {
  console.error('ERROR: CMOTS_API_TOKEN not found.')
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
  isin: string
}

interface PriceBar {
  date: string
  price: number
  volume: number
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

interface HorizonResult {
  horizon: typeof HORIZONS[number]
  scored: StockAnalysisResult[]
  valuationNA: StockAnalysisResult[]
  skipped: number
}

interface RankedStock {
  stockId: string
  companyName: string
  symbol: string
  sector: string
  overallScore: number
  verdict: string
  returnPct: number
  scoreRank: number
  returnRank: number
  rankDiff: number
  deviationPct: number
  bucket: string
}

interface SectorDevSummary {
  sector: string
  stockCount: number
  exactCount: number
  exactPct: number
  within10Count: number
  within10Pct: number
  within25Count: number
  within25Pct: number
  restCount: number
  restPct: number
  cumulativeWithin25Pct: number
  avgDeviationPct: number
  spearmanCorrelation: number | null
  sizeCategory: string
}

// ─── CMOTS Fetch Helper ──────────────────────────────────

async function cmotsFetch<T>(endpoint: string, retries = MAX_RETRIES): Promise<T[]> {
  const url = `${CMOTS_BASE}${endpoint}`
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000)
      const res = await proxyFetch(url, {
        headers: { Authorization: `Bearer ${CMOTS_TOKEN}` },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      if (!res.ok) {
        if ((res.status === 429 || res.status >= 500) && attempt < retries) {
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt) + Math.random() * 500))
          continue
        }
        return []
      }
      const text = await res.text()
      let json: any
      try { json = JSON.parse(text) } catch { return [] }
      if (Array.isArray(json)) return json
      if (json?.data && Array.isArray(json.data)) return json.data
      return []
    } catch (err: any) {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt) + Math.random() * 500))
        continue
      }
      return []
    }
  }
  return []
}

// ─── DhanHQ Fetch Helper ─────────────────────────────────

async function dhanFetchPrices(securityId: string, fromDate: string, toDate: string): Promise<PriceBar[]> {
  if (!DHAN_TOKEN) return []
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)
    const res = await proxyFetch(`${DHAN_BASE}/charts/historical`, {
      method: 'POST',
      headers: {
        'access-token': DHAN_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        securityId,
        exchangeSegment: 'NSE_EQ',
        instrument: 'EQUITY',
        expiryCode: 0,
        fromDate,
        toDate,
      }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    if (!res.ok) return []
    const data: any = await res.json()
    if (!data?.close || !data?.timestamp) return []
    const bars: PriceBar[] = []
    for (let i = 0; i < data.close.length; i++) {
      const d = new Date(data.timestamp[i] * 1000).toISOString().split('T')[0]
      bars.push({ date: d, price: data.close[i], volume: data.volume?.[i] ?? 0 })
    }
    return bars.sort((a, b) => a.date.localeCompare(b.date))
  } catch {
    return []
  }
}

// ─── DhanHQ ISIN → SecurityId mapping ────────────────────

let dhanScripMap: Map<string, string> | null = null

async function loadDhanScripMap(): Promise<Map<string, string>> {
  if (dhanScripMap) return dhanScripMap
  dhanScripMap = new Map()
  try {
    const res = await proxyFetch('https://images.dhan.co/api-data/api-scrip-master-detailed.csv')
    if (!res.ok) return dhanScripMap
    const text = await res.text()
    const lines = text.split('\n')
    const headers = lines[0].split(',')
    // Try both old (SEM_*) and new column names
    const secIdIdx = headers.findIndex(h => h.trim() === 'SECURITY_ID' || h.trim() === 'SEM_SMST_SECURITY_ID')
    const exchIdx = headers.findIndex(h => h.trim() === 'EXCH_ID' || h.trim() === 'SEM_EXM_EXCH_ID')
    const isinColIdx = headers.findIndex(h => h.trim() === 'ISIN' || h.trim() === 'SEM_ISIN')
    const instrIdx = headers.findIndex(h => h.trim() === 'INSTRUMENT' || h.trim() === 'SEM_INSTRUMENT_NAME')

    if (secIdIdx === -1 || isinColIdx === -1) {
      console.warn(`  DhanHQ scrip map: column mismatch. Headers: ${headers.slice(0, 10).join(', ')}`)
      return dhanScripMap
    }

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',')
      const isin = cols[isinColIdx]?.trim()
      const secId = cols[secIdIdx]?.trim()
      const exch = cols[exchIdx]?.trim()
      const instr = instrIdx >= 0 ? cols[instrIdx]?.trim() : ''
      // Accept NSE equity entries (filter out derivatives, currencies, etc.)
      if (isin && isin !== 'NA' && secId && (exch === 'NSE' || exch === 'NSE_EQ') && (!instr || instr === 'EQUITY')) {
        dhanScripMap.set(isin, secId)
      }
    }
    console.log(`  DhanHQ scrip map: ${dhanScripMap.size} NSE ISINs loaded`)
  } catch (err) {
    console.warn('  DhanHQ scrip map load failed:', err)
  }
  return dhanScripMap
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
      try { results[index] = await fn(items[index], index) } catch { results[index] = null }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()))
  return results
}

// ─── Price Helpers ────────────────────────────────────────

function findClosestPrice(prices: PriceBar[], targetDate: string): PriceBar | null {
  let closest: PriceBar | null = null
  for (const p of prices) {
    if (p.date <= targetDate) closest = p
    else break
  }
  return closest
}

// ─── Statistical Helpers ─────────────────────────────────

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

// ─── Rank Deviation Helpers ──────────────────────────────

function denseRank(values: number[], descending = true): number[] {
  const indexed = values.map((v, i) => ({ v, i }))
  indexed.sort((a, b) => descending ? b.v - a.v : a.v - b.v)
  const ranks = new Array(values.length)
  let rank = 1
  for (let j = 0; j < indexed.length; j++) {
    if (j > 0 && indexed[j].v !== indexed[j - 1].v) rank++
    ranks[indexed[j].i] = rank
  }
  return ranks
}

function spearmanCorrelation(ranks1: number[], ranks2: number[]): number | null {
  const n = ranks1.length
  if (n < 3) return null
  const mean1 = ranks1.reduce((s, v) => s + v, 0) / n
  const mean2 = ranks2.reduce((s, v) => s + v, 0) / n
  let cov = 0, var1 = 0, var2 = 0
  for (let i = 0; i < n; i++) {
    const d1 = ranks1[i] - mean1
    const d2 = ranks2[i] - mean2
    cov += d1 * d2
    var1 += d1 * d1
    var2 += d2 * d2
  }
  if (var1 === 0 || var2 === 0) return null
  return cov / Math.sqrt(var1 * var2)
}

function assignBucket(deviationPct: number): string {
  if (deviationPct === 0) return 'Exact'
  if (deviationPct <= 10) return 'Within 10%'
  if (deviationPct <= 25) return 'Within 25%'
  return 'Rest'
}

function sizeCategory(n: number): string {
  if (n >= 20) return 'Large'
  if (n >= 10) return 'Medium'
  if (n >= MIN_SECTOR_SIZE) return 'Small'
  return 'Tiny'
}

function csvQuote(s: string): string {
  return `"${s.replace(/"/g, '""')}"`
}

function pct(count: number, total: number): string {
  if (total === 0) return '0%'
  return `${(count / total * 100).toFixed(2)}%`
}

// ─── Quarterly Merge ─────────────────────────────────────

function mergeQuarterly(qPnL: any[], qResults: any[]): any[] {
  if (qPnL.length === 0) return qResults
  if (qResults.length === 0) return qPnL

  // Build a map of Q-P&L rows by rowno
  const pnlMap = new Map<number, any>()
  for (const row of qPnL) {
    if (row.rowno != null) pnlMap.set(row.rowno, { ...row })
  }

  // Merge newer columns from QuarterlyResults into Q-P&L
  for (const qrRow of qResults) {
    if (qrRow.rowno == null) continue
    const pnlRow = pnlMap.get(qrRow.rowno)
    if (!pnlRow) {
      // Row exists in QR but not Q-P&L — add it
      pnlMap.set(qrRow.rowno, { ...qrRow })
    } else {
      // Merge Y-columns from QR that don't exist in Q-P&L
      for (const key of Object.keys(qrRow)) {
        if (/^Y\d{6}$/.test(key) && pnlRow[key] == null) {
          pnlRow[key] = qrRow[key]
        }
      }
    }
  }

  return Array.from(pnlMap.values())
}

// ─── V4 Metric IDs ──────────────────────────────────────

const METRIC_IDS = [
  'v4_revenue_growth', 'v4_ebitda_growth', 'v4_earnings_pbt_oi', 'v4_roe',
  'v4_ocf_ebitda_cagr', 'v4_gross_block', 'v4_debt_ebitda',
  'v4_pe_vs_5y', 'v4_pb_vs_5y', 'v4_ev_vs_5y',
  'v4_revenue_multiplier', 'v4_ebitda_multiplier',
  'v4_20dma', 'v4_50dma', 'v4_200dma', 'v4_rsi', 'v4_vpt',
]
const METRIC_LABELS = [
  'Revenue Growth', 'EBITDA Growth', 'Earnings (PBT-OI)', 'ROE',
  'OCF/EBITDA CAGR', 'Gross Block', 'Debt/EBITDA',
  'PE vs 5Y', 'PB vs 5Y', 'EV vs 5Y',
  'Revenue Multiplier', 'EBITDA Multiplier',
  '20-DMA', '50-DMA', '200-DMA', 'RSI', 'VPT',
]

// ─── Report Generators ──────────────────────────────────

function generateHorizonReport(
  horizon: typeof HORIZONS[number],
  scoredStocks: StockAnalysisResult[],
  valuationNAStocks: StockAnalysisResult[],
  bankingCount: number,
  skipped: number,
): string {
  const scores = scoredStocks.map(s => s.scoreResult.normalizedScore)
  const returns = scoredStocks.map(s => s.returnPct)
  const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0

  let report = `# V4 Large Cap Backtest — ${horizon.label}\n`
  report += `## Score vs Price Prediction Analysis\n\n`
  report += `**Date Range:** ${horizon.startDate} to ${horizon.endDate}\n`
  report += `**Scorecard:** V4 Non-Banking Expert Model (F:30% + V:45% + QM:18% + T:7%)\n`
  report += `**Universe:** Large Cap BSE-listed non-banking stocks\n`
  report += `**Generated:** ${new Date().toISOString().split('T')[0]}\n\n`
  report += `---\n\n`
  report += `## Executive Summary\n\n`
  report += `| Metric | Value |\n|--------|-------|\n`
  report += `| Total stocks scored | ${scoredStocks.length} |\n`
  report += `| Valuation N/A (excluded) | ${valuationNAStocks.length} |\n`
  report += `| Banking stocks excluded | ${bankingCount} |\n`
  report += `| Stocks skipped (no data) | ${skipped} |\n`

  if (horizon.hasReturns) {
    const overallCorr = pearsonCorrelation(scores, returns)
    const winReturns = returns.map(r => winsorize(r))
    const winCorr = pearsonCorrelation(scores, winReturns)
    const topByReturn = [...scoredStocks].sort((a, b) => b.returnPct - a.returnPct)
    const bottomByReturn = [...scoredStocks].sort((a, b) => a.returnPct - b.returnPct)

    report += `| Score-Return Correlation (Pearson) | **${overallCorr}** |\n`
    report += `| Winsorized Correlation (±200% cap) | **${winCorr}** |\n`
    report += `| Average Return | ${avgReturn.toFixed(2)}% |\n`
    report += `| Median Return | ${median(returns).toFixed(2)}% |\n`
    report += `| Positive Return Hit Rate | ${(returns.filter(r => r > 0).length / returns.length * 100).toFixed(1)}% |\n`
    if (topByReturn.length > 0) {
      report += `| Best Performing | ${topByReturn[0].companyName} (${topByReturn[0].returnPct}%) |\n`
      report += `| Worst Performing | ${bottomByReturn[0].companyName} (${bottomByReturn[0].returnPct}%) |\n`
    }
  }
  report += `| Highest Score | ${scoredStocks[0]?.companyName} (${scoredStocks[0]?.scoreResult.normalizedScore.toFixed(1)}) |\n\n`

  // Quintile Analysis
  if (horizon.hasReturns && scoredStocks.length >= 5) {
    report += `---\n\n## Quintile Analysis\n\n`
    report += `| Quintile | Stocks | Avg Score | Avg Return % | Winsorized % | Median % | Hit Rate |\n`
    report += `|----------|--------|-----------|-------------|-------------|----------|----------|\n`
    const quintileSize = Math.ceil(scoredStocks.length / 5)
    const quintileLabels = ['Q1 (Top 20%)', 'Q2 (20-40%)', 'Q3 (40-60%)', 'Q4 (60-80%)', 'Q5 (Bottom 20%)']
    const quintiles: { label: string; avgReturn: number }[] = []

    for (let q = 0; q < 5; q++) {
      const start = q * quintileSize
      const end = Math.min(start + quintileSize, scoredStocks.length)
      const qStocks = scoredStocks.slice(start, end)
      if (qStocks.length === 0) continue
      const qScores = qStocks.map(s => s.scoreResult.normalizedScore)
      const qReturns = qStocks.map(s => s.returnPct)
      const qWin = qReturns.map(r => winsorize(r))
      const avgScore = qScores.reduce((a, b) => a + b, 0) / qScores.length
      const avgRet = qReturns.reduce((a, b) => a + b, 0) / qReturns.length
      const winAvg = qWin.reduce((a, b) => a + b, 0) / qWin.length
      const hitRate = qReturns.filter(r => r > 0).length / qReturns.length * 100
      quintiles.push({ label: quintileLabels[q], avgReturn: avgRet })
      report += `| ${quintileLabels[q]} | ${qStocks.length} | ${avgScore.toFixed(1)} | ${avgRet.toFixed(2)}% | ${winAvg.toFixed(2)}% | ${median(qReturns).toFixed(2)}% | ${hitRate.toFixed(1)}% |\n`
    }
    if (quintiles.length >= 2) {
      const spread = quintiles[0].avgReturn - quintiles[quintiles.length - 1].avgReturn
      report += `\n**Q1 vs Q5 Spread:** ${spread.toFixed(2)} percentage points\n`
    }
  }

  // Verdict Band Analysis
  if (horizon.hasReturns) {
    report += `\n---\n\n## Verdict Band Analysis\n\n`
    report += `| Verdict | Stocks | % | Avg Score | Avg Return % | Winsorized % | Median % | Hit Rate |\n`
    report += `|---------|--------|---|-----------|-------------|-------------|----------|----------|\n`
    for (const verdict of ['STRONG BUY', 'BUY', 'HOLD', 'REVIEW', 'SELL']) {
      const vStocks = scoredStocks.filter(s => s.scoreResult.verdict === verdict)
      if (vStocks.length === 0) continue
      const vReturns = vStocks.map(s => s.returnPct)
      const vScores = vStocks.map(s => s.scoreResult.normalizedScore)
      const vWin = vReturns.map(r => winsorize(r))
      report += `| ${verdict} | ${vStocks.length} | ${(vStocks.length / scoredStocks.length * 100).toFixed(1)}% | ${(vScores.reduce((a, b) => a + b, 0) / vScores.length).toFixed(1)} | ${(vReturns.reduce((a, b) => a + b, 0) / vReturns.length).toFixed(2)}% | ${(vWin.reduce((a, b) => a + b, 0) / vWin.length).toFixed(2)}% | ${median(vReturns).toFixed(2)}% | ${(vReturns.filter(r => r > 0).length / vReturns.length * 100).toFixed(1)}% |\n`
    }
  }

  // Segment Contribution
  if (horizon.hasReturns) {
    report += `\n---\n\n## Segment Contribution\n\n`
    report += `| Segment | Weight | Correlation with Returns |\n`
    report += `|---------|--------|-------------------------|\n`
    const segIds = ['v4_financial', 'v4_valuation', 'v4_technical', 'v4_quarterly_momentum']
    const segLabels = ['Financial', 'Valuation', 'Technical', 'Quarterly Momentum']
    const segWeights = ['30%', '45%', '7%', '18%']
    for (let i = 0; i < segIds.length; i++) {
      const segScores = scoredStocks.map(s => {
        const seg = s.scoreResult.segmentResults.find(sr => sr.segmentId === segIds[i])
        return seg?.segmentScore ?? 0
      })
      const corr = pearsonCorrelation(segScores, returns)
      report += `| ${segLabels[i]} | ${segWeights[i]} | ${corr} |\n`
    }
  }

  // Sector Analysis
  report += `\n---\n\n## Sector Analysis\n\n`
  report += `| Sector | Stocks | Avg Score |`
  if (horizon.hasReturns) report += ` Avg Return % | Winsorized % | Median % | Correlation |`
  report += `\n`
  report += `|--------|--------|-----------|`
  if (horizon.hasReturns) report += `-------------|-------------|----------|-------------|`
  report += `\n`

  const sectorMap = new Map<string, StockAnalysisResult[]>()
  for (const s of scoredStocks) {
    if (!sectorMap.has(s.sector)) sectorMap.set(s.sector, [])
    sectorMap.get(s.sector)!.push(s)
  }
  const sectorEntries = [...sectorMap.entries()].sort((a, b) => b[1].length - a[1].length)
  for (const [sector, stocks] of sectorEntries) {
    if (stocks.length < 2) continue
    const sScores = stocks.map(s => s.scoreResult.normalizedScore)
    const avgScore = sScores.reduce((a, b) => a + b, 0) / sScores.length
    report += `| ${sector} | ${stocks.length} | ${avgScore.toFixed(1)} |`
    if (horizon.hasReturns) {
      const sReturns = stocks.map(s => s.returnPct)
      const sWin = sReturns.map(r => winsorize(r))
      const corr = stocks.length >= 3 ? pearsonCorrelation(sScores, sReturns) : 0
      report += ` ${(sReturns.reduce((a, b) => a + b, 0) / sReturns.length).toFixed(2)}% | ${(sWin.reduce((a, b) => a + b, 0) / sWin.length).toFixed(2)}% | ${median(sReturns).toFixed(2)}% | ${corr} |`
    }
    report += `\n`
  }

  // Top/Bottom stocks
  report += `\n---\n\n## Top 20 by Score\n\n`
  report += `| # | Stock | Sector | Score | Verdict |`
  if (horizon.hasReturns) report += ` Return % |`
  report += `\n`
  report += `|---|-------|--------|-------|---------|`
  if (horizon.hasReturns) report += `----------|`
  report += `\n`
  for (let i = 0; i < Math.min(20, scoredStocks.length); i++) {
    const s = scoredStocks[i]
    report += `| ${i + 1} | ${s.companyName} | ${s.sector} | ${s.scoreResult.normalizedScore.toFixed(1)} | ${s.scoreResult.verdict} |`
    if (horizon.hasReturns) report += ` ${s.returnPct}% |`
    report += `\n`
  }

  if (horizon.hasReturns) {
    const topByReturn = [...scoredStocks].sort((a, b) => b.returnPct - a.returnPct)
    report += `\n## Top 20 by Return\n\n`
    report += `| # | Stock | Sector | Score | Verdict | Return % |\n`
    report += `|---|-------|--------|-------|---------|----------|\n`
    for (let i = 0; i < Math.min(20, topByReturn.length); i++) {
      const s = topByReturn[i]
      report += `| ${i + 1} | ${s.companyName} | ${s.sector} | ${s.scoreResult.normalizedScore.toFixed(1)} | ${s.scoreResult.verdict} | ${s.returnPct}% |\n`
    }
  }

  // Segment coverage
  let qmWithData = 0, techWithData = 0
  for (const s of scoredStocks) {
    const qmSeg = s.scoreResult.segmentResults.find(sr => sr.segmentId === 'v4_quarterly_momentum')
    const techSeg = s.scoreResult.segmentResults.find(sr => sr.segmentId === 'v4_technical')
    if (qmSeg && qmSeg.verdict !== 'N/A' && qmSeg.segmentScore > 0) qmWithData++
    if (techSeg && techSeg.verdict !== 'N/A' && techSeg.segmentScore > 0) techWithData++
  }
  report += `\n---\n\n## Data Coverage\n\n`
  report += `| Segment | Coverage |\n|---------|----------|\n`
  report += `| Financial | ${scoredStocks.length}/${scoredStocks.length} (100%) |\n`
  report += `| Valuation | ${scoredStocks.length}/${scoredStocks.length + valuationNAStocks.length} (${(scoredStocks.length / (scoredStocks.length + valuationNAStocks.length) * 100).toFixed(1)}%) |\n`
  report += `| Quarterly Momentum | ${qmWithData}/${scoredStocks.length} (${(qmWithData / scoredStocks.length * 100).toFixed(1)}%) |\n`
  report += `| Technical | ${techWithData}/${scoredStocks.length} (${(techWithData / scoredStocks.length * 100).toFixed(1)}%) |\n`

  return report
}

// ─── Rank Deviation Report ───────────────────────────────

function computeRankDeviation(scoredStocks: StockAnalysisResult[]): {
  allRanked: RankedStock[]
  sectorSummaries: SectorDevSummary[]
} {
  const sectorMap = new Map<string, StockAnalysisResult[]>()
  for (const s of scoredStocks) {
    if (!sectorMap.has(s.sector)) sectorMap.set(s.sector, [])
    sectorMap.get(s.sector)!.push(s)
  }

  const allRanked: RankedStock[] = []
  const sectorSummaries: SectorDevSummary[] = []

  for (const [sector, stocks] of sectorMap) {
    const N = stocks.length
    const scores = stocks.map(s => s.scoreResult.normalizedScore)
    const returns = stocks.map(s => s.returnPct)
    const scoreRanks = denseRank(scores, true)
    const returnRanks = denseRank(returns, true)

    let exactCount = 0, w10Count = 0, w25Count = 0, restCount = 0, totalDev = 0

    const ranked = stocks.map((stock, i) => {
      const rankDiff = Math.abs(scoreRanks[i] - returnRanks[i])
      const devPct = N > 0 ? (rankDiff / N) * 100 : 0
      const bucket = assignBucket(devPct)
      if (bucket === 'Exact') exactCount++
      else if (bucket === 'Within 10%') w10Count++
      else if (bucket === 'Within 25%') w25Count++
      else restCount++
      totalDev += devPct

      return {
        stockId: stock.stockId,
        companyName: stock.companyName,
        symbol: stock.symbol,
        sector: stock.sector,
        overallScore: stock.scoreResult.normalizedScore,
        verdict: stock.scoreResult.verdict,
        returnPct: stock.returnPct,
        scoreRank: scoreRanks[i],
        returnRank: returnRanks[i],
        rankDiff,
        deviationPct: Math.round(devPct * 100) / 100,
        bucket,
      }
    })

    ranked.sort((a, b) => a.scoreRank - b.scoreRank)
    allRanked.push(...ranked)

    const spearman = N >= MIN_SECTOR_SIZE ? spearmanCorrelation(scoreRanks, returnRanks) : null
    sectorSummaries.push({
      sector,
      stockCount: N,
      exactCount,
      exactPct: Math.round((exactCount / N) * 10000) / 100,
      within10Count: w10Count,
      within10Pct: Math.round((w10Count / N) * 10000) / 100,
      within25Count: w25Count,
      within25Pct: Math.round((w25Count / N) * 10000) / 100,
      restCount,
      restPct: Math.round((restCount / N) * 10000) / 100,
      cumulativeWithin25Pct: Math.round(((exactCount + w10Count + w25Count) / N) * 10000) / 100,
      avgDeviationPct: Math.round((totalDev / N) * 100) / 100,
      spearmanCorrelation: spearman !== null ? Math.round(spearman * 1000) / 1000 : null,
      sizeCategory: sizeCategory(N),
    })
  }

  sectorSummaries.sort((a, b) => b.stockCount - a.stockCount)
  allRanked.sort((a, b) => a.sector.localeCompare(b.sector) || a.scoreRank - b.scoreRank)

  return { allRanked, sectorSummaries }
}

function generateRankDeviationReport(
  horizon: typeof HORIZONS[number],
  sectorSummaries: SectorDevSummary[],
  allRanked: RankedStock[],
): string {
  const qualifying = sectorSummaries.filter(s => s.stockCount >= MIN_SECTOR_SIZE)
  const tiny = sectorSummaries.filter(s => s.stockCount < MIN_SECTOR_SIZE)
  const qualStocks = qualifying.reduce((s, q) => s + q.stockCount, 0)
  const totalExact = qualifying.reduce((s, q) => s + q.exactCount, 0)
  const totalW10 = qualifying.reduce((s, q) => s + q.within10Count, 0)
  const totalW25 = qualifying.reduce((s, q) => s + q.within25Count, 0)
  const totalRest = qualifying.reduce((s, q) => s + q.restCount, 0)
  const cumW25 = totalExact + totalW10 + totalW25

  let r = `# Rank Deviation Analysis — ${horizon.label}\n\n`
  r += `> Score rank vs return rank within each sector. If V4 works, highest-scored stocks should have highest returns.\n\n`

  r += `## 1. Executive Summary\n\n`
  r += `**${qualifying.length} sectors** with ≥${MIN_SECTOR_SIZE} stocks (${qualStocks} stocks). ${tiny.length} tiny sectors excluded.\n\n`
  r += `| Bucket | Count | % |\n|--------|------:|--:|\n`
  r += `| **Exact Match** | ${totalExact} | ${pct(totalExact, qualStocks)} |\n`
  r += `| **Within 10%** | ${totalW10} | ${pct(totalW10, qualStocks)} |\n`
  r += `| **Within 25%** | ${totalW25} | ${pct(totalW25, qualStocks)} |\n`
  r += `| **Rest (>25%)** | ${totalRest} | ${pct(totalRest, qualStocks)} |\n`
  r += `| **Cumulative ≤25%** | ${cumW25} | ${pct(cumW25, qualStocks)} |\n\n`

  // Top sectors by alignment
  const top15 = [...qualifying]
    .sort((a, b) => {
      const diff = b.cumulativeWithin25Pct - a.cumulativeWithin25Pct
      if (Math.abs(diff) > 0.01) return diff
      return (b.spearmanCorrelation || 0) - (a.spearmanCorrelation || 0)
    })
    .slice(0, 15)

  r += `## 2. Top Sectors by Rank Alignment\n\n`
  r += `| # | Sector | N | Exact | ≤10% | ≤25% | >25% | Cum ≤25% | Avg Dev | Spearman |\n`
  r += `|--:|--------|--:|------:|-----:|-----:|-----:|---------:|--------:|---------:|\n`
  top15.forEach((s, i) => {
    r += `| ${i + 1} | ${s.sector} | ${s.stockCount} | ${s.exactPct}% | ${s.within10Pct}% | ${s.within25Pct}% | ${s.restPct}% | **${s.cumulativeWithin25Pct}%** | ${s.avgDeviationPct}% | ${s.spearmanCorrelation?.toFixed(3) ?? 'N/A'} |\n`
  })

  // Bottom sectors
  const bottom15 = [...qualifying]
    .sort((a, b) => a.cumulativeWithin25Pct - b.cumulativeWithin25Pct || (a.spearmanCorrelation || 0) - (b.spearmanCorrelation || 0))
    .slice(0, 15)

  r += `\n## 3. Bottom Sectors by Rank Alignment\n\n`
  r += `| # | Sector | N | Exact | ≤10% | ≤25% | >25% | Cum ≤25% | Avg Dev | Spearman |\n`
  r += `|--:|--------|--:|------:|-----:|-----:|-----:|---------:|--------:|---------:|\n`
  bottom15.forEach((s, i) => {
    r += `| ${i + 1} | ${s.sector} | ${s.stockCount} | ${s.exactPct}% | ${s.within10Pct}% | ${s.within25Pct}% | ${s.restPct}% | **${s.cumulativeWithin25Pct}%** | ${s.avgDeviationPct}% | ${s.spearmanCorrelation?.toFixed(3) ?? 'N/A'} |\n`
  })

  // Full table
  r += `\n## 4. Full Sector Table (≥${MIN_SECTOR_SIZE} stocks)\n\n`
  r += `| Sector | N | Exact% | ≤10%% | ≤25%% | >25%% | Cum≤25% | AvgDev | Spearman |\n`
  r += `|--------|--:|-------:|------:|------:|------:|--------:|-------:|---------:|\n`
  for (const s of qualifying) {
    r += `| ${s.sector} | ${s.stockCount} | ${s.exactPct}% | ${s.within10Pct}% | ${s.within25Pct}% | ${s.restPct}% | ${s.cumulativeWithin25Pct}% | ${s.avgDeviationPct}% | ${s.spearmanCorrelation?.toFixed(3) ?? 'N/A'} |\n`
  }

  return r
}

// ─── Cross-Horizon Comparison ────────────────────────────

function generateCrossHorizonReport(
  horizonResults: Map<string, HorizonResult>,
  allStockScores: Map<string, Map<string, { score: number; verdict: string; returnPct: number }>>,
): string {
  let r = `# Cross-Horizon Comparison — V4 Large Cap Backtest\n\n`
  r += `**Generated:** ${new Date().toISOString().split('T')[0]}\n\n`

  // A: Correlation by horizon
  r += `## 1. Predictive Accuracy by Horizon\n\n`
  r += `| Metric | 5Y (2021→2025) | 3Y (2023→2025) | 1Y (2024→2025) |\n`
  r += `|--------|---------------|---------------|---------------|\n`

  const returnHorizons = HORIZONS.filter(h => h.hasReturns)
  const horizonMetrics: Record<string, { pearson: number; winPearson: number; spearman: number | null; q1Ret: number; q5Ret: number; spread: number; hitRate: number }> = {}

  for (const h of returnHorizons) {
    const hr = horizonResults.get(h.id)
    if (!hr) continue
    const stocks = hr.scored
    const scores = stocks.map(s => s.scoreResult.normalizedScore)
    const returns = stocks.map(s => s.returnPct)
    const winReturns = returns.map(r => winsorize(r))

    const scoreRanks = denseRank(scores, true)
    const returnRanks = denseRank(returns, true)

    const qSize = Math.ceil(stocks.length / 5)
    const q1Stocks = stocks.slice(0, qSize)
    const q5Stocks = stocks.slice(4 * qSize)
    const q1Ret = q1Stocks.length > 0 ? q1Stocks.map(s => s.returnPct).reduce((a, b) => a + b, 0) / q1Stocks.length : 0
    const q5Ret = q5Stocks.length > 0 ? q5Stocks.map(s => s.returnPct).reduce((a, b) => a + b, 0) / q5Stocks.length : 0

    horizonMetrics[h.id] = {
      pearson: pearsonCorrelation(scores, returns),
      winPearson: pearsonCorrelation(scores, winReturns),
      spearman: spearmanCorrelation(scoreRanks, returnRanks),
      q1Ret: Math.round(q1Ret * 100) / 100,
      q5Ret: Math.round(q5Ret * 100) / 100,
      spread: Math.round((q1Ret - q5Ret) * 100) / 100,
      hitRate: Math.round(returns.filter(r => r > 0).length / returns.length * 100 * 10) / 10,
    }
  }

  const vals = returnHorizons.map(h => horizonMetrics[h.id])
  const fmt = (v: number | null | undefined) => v != null ? String(v) : 'N/A'
  r += `| Pearson r | ${vals.map(v => fmt(v?.pearson)).join(' | ')} |\n`
  r += `| Winsorized Pearson r | ${vals.map(v => fmt(v?.winPearson)).join(' | ')} |\n`
  r += `| Spearman rho | ${vals.map(v => v?.spearman != null ? v.spearman.toFixed(3) : 'N/A').join(' | ')} |\n`
  r += `| Q1 Avg Return | ${vals.map(v => fmt(v?.q1Ret) + '%').join(' | ')} |\n`
  r += `| Q5 Avg Return | ${vals.map(v => fmt(v?.q5Ret) + '%').join(' | ')} |\n`
  r += `| Q1-Q5 Spread | ${vals.map(v => fmt(v?.spread) + 'pp').join(' | ')} |\n`
  r += `| Hit Rate (>0%) | ${vals.map(v => fmt(v?.hitRate) + '%').join(' | ')} |\n`

  // B: Rank Deviation comparison
  r += `\n## 2. Rank Deviation by Horizon\n\n`
  r += `| Bucket | 5Y | 3Y | 1Y |\n`
  r += `|--------|----|----|----|\n`
  for (const h of returnHorizons) {
    const hr = horizonResults.get(h.id)
    if (!hr) continue
  }

  // Compute rank dev per horizon
  const devByHorizon: Record<string, { exact: number; w10: number; w25: number; rest: number; total: number }> = {}
  for (const h of returnHorizons) {
    const hr = horizonResults.get(h.id)
    if (!hr) continue
    const { allRanked } = computeRankDeviation(hr.scored)
    let exact = 0, w10 = 0, w25 = 0, rest = 0
    for (const s of allRanked) {
      if (s.bucket === 'Exact') exact++
      else if (s.bucket === 'Within 10%') w10++
      else if (s.bucket === 'Within 25%') w25++
      else rest++
    }
    devByHorizon[h.id] = { exact, w10, w25, rest, total: allRanked.length }
  }

  const devVals = returnHorizons.map(h => devByHorizon[h.id])
  r += `| Exact Match | ${devVals.map(v => v ? `${v.exact} (${pct(v.exact, v.total)})` : 'N/A').join(' | ')} |\n`
  r += `| Within 10% | ${devVals.map(v => v ? `${v.w10} (${pct(v.w10, v.total)})` : 'N/A').join(' | ')} |\n`
  r += `| Within 25% | ${devVals.map(v => v ? `${v.w25} (${pct(v.w25, v.total)})` : 'N/A').join(' | ')} |\n`
  r += `| >25% | ${devVals.map(v => v ? `${v.rest} (${pct(v.rest, v.total)})` : 'N/A').join(' | ')} |\n`
  r += `| **Cumulative ≤25%** | ${devVals.map(v => v ? `**${pct(v.exact + v.w10 + v.w25, v.total)}**` : 'N/A').join(' | ')} |\n`

  // C: Score Stability
  r += `\n## 3. Score Stability Across Dates\n\n`
  r += `How much does the same stock's score change across scoring dates?\n\n`

  const stabilityData: { name: string; scores: number[]; stdDev: number }[] = []
  for (const [stockId, horizonScores] of allStockScores) {
    const allScores = [...horizonScores.values()].map(v => v.score)
    if (allScores.length < 3) continue
    const mean = allScores.reduce((a, b) => a + b, 0) / allScores.length
    const variance = allScores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / allScores.length
    const stdDev = Math.sqrt(variance)
    const name = [...horizonScores.values()][0] ? stockId : stockId
    stabilityData.push({ name: stockId, scores: allScores, stdDev })
  }
  stabilityData.sort((a, b) => a.stdDev - b.stdDev)

  if (stabilityData.length > 0) {
    r += `| Statistic | Value |\n|-----------|-------|\n`
    r += `| Stocks scored at all dates | ${stabilityData.length} |\n`
    const avgStdDev = stabilityData.reduce((s, d) => s + d.stdDev, 0) / stabilityData.length
    r += `| Avg Score StdDev | ${avgStdDev.toFixed(2)} |\n`
    r += `| Min StdDev (most stable) | ${stabilityData[0].stdDev.toFixed(2)} |\n`
    r += `| Max StdDev (least stable) | ${stabilityData[stabilityData.length - 1].stdDev.toFixed(2)} |\n\n`

    r += `### Most Stable Scores (Top 10)\n\n`
    r += `| Stock | StdDev | Scores |\n|-------|--------|--------|\n`
    for (const d of stabilityData.slice(0, 10)) {
      r += `| ${d.name} | ${d.stdDev.toFixed(2)} | ${d.scores.map(s => s.toFixed(1)).join(', ')} |\n`
    }

    r += `\n### Most Volatile Scores (Bottom 10)\n\n`
    r += `| Stock | StdDev | Scores |\n|-------|--------|--------|\n`
    for (const d of stabilityData.slice(-10).reverse()) {
      r += `| ${d.name} | ${d.stdDev.toFixed(2)} | ${d.scores.map(s => s.toFixed(1)).join(', ')} |\n`
    }
  }

  // D: Top 20 overlap
  r += `\n## 4. Top 20 Overlap Across Horizons\n\n`
  r += `Do the same stocks appear in the Top 20 by score across different dates?\n\n`

  const top20ByHorizon: Map<string, Set<string>> = new Map()
  for (const h of HORIZONS) {
    const hr = horizonResults.get(h.id)
    if (!hr) continue
    const top20 = hr.scored.slice(0, 20).map(s => s.stockId)
    top20ByHorizon.set(h.id, new Set(top20))
  }

  if (top20ByHorizon.size >= 2) {
    const horizonIds = [...top20ByHorizon.keys()]
    r += `| Comparison | Overlap (of 20) |\n|------------|----------------|\n`
    for (let i = 0; i < horizonIds.length; i++) {
      for (let j = i + 1; j < horizonIds.length; j++) {
        const set1 = top20ByHorizon.get(horizonIds[i])!
        const set2 = top20ByHorizon.get(horizonIds[j])!
        const overlap = [...set1].filter(id => set2.has(id)).length
        r += `| ${horizonIds[i]} vs ${horizonIds[j]} | ${overlap}/20 (${(overlap / 20 * 100).toFixed(0)}%) |\n`
      }
    }
  }

  return r
}

// ─── CSV Writers ─────────────────────────────────────────

function writeHorizonCSVs(
  dir: string,
  horizon: typeof HORIZONS[number],
  scoredStocks: StockAnalysisResult[],
  valuationNAStocks: StockAnalysisResult[],
  avgReturn: number,
) {
  // stock-scores-and-returns.csv
  const csvHeader1 = 'stock_id,stock_name,symbol,sector,mcap_type,overall_score,verdict,financial_score,valuation_score,qm_score,technical_score,start_price,end_price,return_pct,outperformance_vs_avg'
  const csvRows1 = scoredStocks.map(s => {
    const fin = s.scoreResult.segmentResults.find(sr => sr.segmentId === 'v4_financial')?.segmentScore ?? 0
    const val = s.scoreResult.segmentResults.find(sr => sr.segmentId === 'v4_valuation')?.segmentScore ?? 0
    const qm = s.scoreResult.segmentResults.find(sr => sr.segmentId === 'v4_quarterly_momentum')?.segmentScore ?? 0
    const tech = s.scoreResult.segmentResults.find(sr => sr.segmentId === 'v4_technical')?.segmentScore ?? 0
    const outperf = horizon.hasReturns ? Math.round((s.returnPct - avgReturn) * 100) / 100 : 'N/A'
    return [
      s.stockId, csvQuote(s.companyName), s.symbol, csvQuote(s.sector), s.mcapType,
      s.scoreResult.normalizedScore.toFixed(2), s.scoreResult.verdict,
      fin.toFixed(2), val.toFixed(2), qm.toFixed(2), tech.toFixed(2),
      s.startPrice, s.endPrice,
      horizon.hasReturns ? s.returnPct : 'N/A',
      outperf,
    ].join(',')
  })
  writeFileSync(resolve(dir, 'stock-scores-and-returns.csv'), [csvHeader1, ...csvRows1].join('\n'))

  // stock-metric-details.csv
  const metricHeaderCols = METRIC_IDS.flatMap((id, i) => [`${METRIC_LABELS[i]}_raw`, `${METRIC_LABELS[i]}_score`])
  const csvHeader3 = ['stock_id', 'stock_name', 'symbol', 'sector', 'overall_score', 'verdict', 'return_pct', ...metricHeaderCols].join(',')
  const csvRows3 = scoredStocks.map(s => {
    const metricCols = METRIC_IDS.flatMap(id => {
      const rawVal = s.resolvedData[id]
      let metricScore: number | null = null
      let excluded = false
      for (const seg of s.scoreResult.segmentResults) {
        const ms = seg.metricScores.find(m => m.metricId === id)
        if (ms) { metricScore = ms.normalizedScore; excluded = ms.isExcluded ?? false; break }
      }
      return [
        rawVal != null ? rawVal.toFixed(4) : 'NA',
        excluded ? 'EXCLUDED' : (metricScore != null ? String(metricScore) : 'NA'),
      ]
    })
    return [
      s.stockId, csvQuote(s.companyName), s.symbol, csvQuote(s.sector),
      s.scoreResult.normalizedScore.toFixed(2), s.scoreResult.verdict,
      horizon.hasReturns ? s.returnPct : 'N/A',
      ...metricCols,
    ].join(',')
  })
  writeFileSync(resolve(dir, 'stock-metric-details.csv'), [csvHeader3, ...csvRows3].join('\n'))

  if (!horizon.hasReturns) return

  // quintile-analysis.csv
  const quintileSize = Math.ceil(scoredStocks.length / 5)
  const quintileLabels = ['Q1 (Top 20%)', 'Q2 (20-40%)', 'Q3 (40-60%)', 'Q4 (60-80%)', 'Q5 (Bottom 20%)']
  const qHeader = 'quintile,label,stock_count,avg_score,avg_return_pct,winsorized_avg,median_return_pct,hit_rate_positive'
  const qRows: string[] = []
  for (let q = 0; q < 5; q++) {
    const start = q * quintileSize
    const end = Math.min(start + quintileSize, scoredStocks.length)
    const qStocks = scoredStocks.slice(start, end)
    if (qStocks.length === 0) continue
    const qScores = qStocks.map(s => s.scoreResult.normalizedScore)
    const qReturns = qStocks.map(s => s.returnPct)
    const qWin = qReturns.map(r => winsorize(r))
    qRows.push([
      q + 1, `"${quintileLabels[q]}"`, qStocks.length,
      (qScores.reduce((a, b) => a + b, 0) / qScores.length).toFixed(2),
      (qReturns.reduce((a, b) => a + b, 0) / qReturns.length).toFixed(2),
      (qWin.reduce((a, b) => a + b, 0) / qWin.length).toFixed(2),
      median(qReturns).toFixed(2),
      (qReturns.filter(r => r > 0).length / qReturns.length * 100).toFixed(2),
    ].join(','))
  }
  writeFileSync(resolve(dir, 'quintile-analysis.csv'), [qHeader, ...qRows].join('\n'))

  // sector-summary.csv
  const sectorMap = new Map<string, StockAnalysisResult[]>()
  for (const s of scoredStocks) {
    if (!sectorMap.has(s.sector)) sectorMap.set(s.sector, [])
    sectorMap.get(s.sector)!.push(s)
  }
  const secHeader = 'sector,stock_count,avg_score,avg_return_pct,winsorized_avg,median_return_pct,correlation'
  const secRows = [...sectorMap.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([sector, stocks]) => {
      const sReturns = stocks.map(s => s.returnPct)
      const sScores = stocks.map(s => s.scoreResult.normalizedScore)
      const sWin = sReturns.map(r => winsorize(r))
      return [
        csvQuote(sector), stocks.length,
        (sScores.reduce((a, b) => a + b, 0) / sScores.length).toFixed(2),
        (sReturns.reduce((a, b) => a + b, 0) / sReturns.length).toFixed(2),
        (sWin.reduce((a, b) => a + b, 0) / sWin.length).toFixed(2),
        median(sReturns).toFixed(2),
        stocks.length >= 3 ? pearsonCorrelation(sScores, sReturns) : 'N/A',
      ].join(',')
    })
  writeFileSync(resolve(dir, 'sector-summary.csv'), [secHeader, ...secRows].join('\n'))

  // verdict-band-analysis.csv
  const vHeader = 'verdict,stock_count,avg_score,avg_return_pct,winsorized_avg,median_return_pct,hit_rate_positive,pct_of_universe'
  const vRows: string[] = []
  for (const verdict of ['STRONG BUY', 'BUY', 'HOLD', 'REVIEW', 'SELL']) {
    const vStocks = scoredStocks.filter(s => s.scoreResult.verdict === verdict)
    if (vStocks.length === 0) continue
    const vReturns = vStocks.map(s => s.returnPct)
    const vScores = vStocks.map(s => s.scoreResult.normalizedScore)
    const vWin = vReturns.map(r => winsorize(r))
    vRows.push([
      verdict, vStocks.length,
      (vScores.reduce((a, b) => a + b, 0) / vScores.length).toFixed(2),
      (vReturns.reduce((a, b) => a + b, 0) / vReturns.length).toFixed(2),
      (vWin.reduce((a, b) => a + b, 0) / vWin.length).toFixed(2),
      median(vReturns).toFixed(2),
      (vReturns.filter(r => r > 0).length / vReturns.length * 100).toFixed(2),
      (vStocks.length / scoredStocks.length * 100).toFixed(2),
    ].join(','))
  }
  writeFileSync(resolve(dir, 'verdict-band-analysis.csv'), [vHeader, ...vRows].join('\n'))
}

// ─── Main ─────────────────────────────────────────────────

async function main() {
  console.log('\n' + '='.repeat(70))
  console.log('  V4 LARGE CAP MULTI-HORIZON BACKTEST')
  console.log('='.repeat(70))
  console.log(`  Horizons: ${HORIZONS.map(h => h.label).join(', ')}`)
  console.log(`  End Date: ${END_DATE}`)
  console.log(`  Output:   ${OUTPUT_DIR}`)
  console.log(`  Concurrency: ${CONCURRENCY}`)
  if (STOCK_LIMIT > 0) console.log(`  Limit: ${STOCK_LIMIT} stocks (testing mode)`)
  console.log('='.repeat(70) + '\n')

  // ── Step 1: Company Master ──
  console.log('[1/7] Fetching company master...')
  const allCompanies = await cmotsFetch<CompanyInfo>('/companymaster')
  if (allCompanies.length === 0) {
    console.error('ERROR: Could not fetch company master.')
    process.exit(1)
  }

  const bseActive = allCompanies.filter((c: any) => c.bselistedflag === 'Y' || c.BSEStatus === 'Active')
  console.log(`  BSE-active: ${bseActive.length}`)

  // Filter Large Cap + exclude banking
  let bankingCount = 0
  const largeCaps: CompanyInfo[] = []
  for (const c of bseActive) {
    const sector = (c.sectorname || '').toLowerCase()
    const industry = ((c as any).industryname || '').toLowerCase()
    const isBanking = BANKING_SECTOR_KEYWORDS.some(kw => sector.includes(kw) || industry.includes(kw))
    if (isBanking) { bankingCount++; continue }
    if (c.mcaptype === 'Large Cap') largeCaps.push(c)
  }

  console.log(`  Large Cap non-banking: ${largeCaps.length}`)
  console.log(`  Banking excluded: ${bankingCount}`)

  let targetStocks = largeCaps
  if (STOCK_LIMIT > 0) {
    targetStocks = largeCaps.slice(0, STOCK_LIMIT)
    console.log(`  Limited to: ${targetStocks.length} stocks`)
  }

  // ── Step 2: Load DhanHQ scrip map ──
  console.log('\n[2/7] Loading DhanHQ instrument map...')
  const scripMap = await loadDhanScripMap()

  // ── Step 3: Fetch & Score ──
  console.log(`\n[3/7] Fetching data & scoring (${targetStocks.length} stocks × ${HORIZONS.length} horizons)...`)
  const startTime = Date.now()
  let processed = 0
  let skippedCount = 0

  // Storage: horizonId → results
  const horizonResults = new Map<string, HorizonResult>()
  for (const h of HORIZONS) {
    horizonResults.set(h.id, { horizon: h, scored: [], valuationNA: [], skipped: 0 })
  }

  // Cross-horizon tracking: stockId → horizonId → { score, verdict, returnPct }
  const allStockScores = new Map<string, Map<string, { score: number; verdict: string; returnPct: number }>>()

  const results = await pMapConcurrent<CompanyInfo, boolean>(
    targetStocks,
    async (company) => {
      const coCode = company.co_code
      const stockId = String(coCode)

      try {
        // Fetch widest price range covering 6Y lookback from 2021
        const extendedFrom = '2015-01-01'

        // Fetch CMOTS fundamentals (skip broken AdjustedPriceChart endpoint — use DhanHQ for prices)
        const [ttmArr, finData, pnl, cashFlow, balanceSheet, qResults, qPnL, shareholding] =
          await Promise.all([
            cmotsFetch<any>(`/TTMData/${coCode}/s`),
            cmotsFetch<any>(`/FinData/${coCode}/s`),
            cmotsFetch<any>(`/ProftandLoss/${coCode}/s`),
            cmotsFetch<any>(`/CashFlow/${coCode}/s`),
            cmotsFetch<any>(`/BalanceSheet/${coCode}/s`),
            cmotsFetch<any>(`/QuarterlyResults/${coCode}/s`),
            cmotsFetch<any>(`/QuarterlyProfitandLoss/${coCode}/S`),
            cmotsFetch<any>(`/Aggregate-Share-Holding/${coCode}/s`),
          ])

        if (pnl.length === 0 && finData.length === 0) {
          console.warn(`  [SKIP] ${company.companyname}: no P&L or FinData`)
          skippedCount++; return false
        }

        // Fetch prices from DhanHQ (primary source — CMOTS AdjustedPriceChart currently returns 404)
        let priceHistory: PriceBar[] = []
        if (company.isin && scripMap.size > 0) {
          const secId = scripMap.get(company.isin)
          if (secId) {
            priceHistory = await dhanFetchPrices(secId, extendedFrom, END_DATE)
          }
        }

        // Fallback: try CMOTS price endpoint in case it comes back
        if (priceHistory.length < 10) {
          const priceData = await cmotsFetch<any>(`/AdjustedPriceChart/bse/${coCode}/${extendedFrom}/${END_DATE}`)
          if (priceData.length > 0) {
            priceHistory = priceData
              .map((p: any) => ({
                date: (p.Tradedate || p.tradedate || '').split('T')[0],
                price: p.Dayclose ?? p.dayclose ?? 0,
                volume: p.TotalVolume ?? p.totalvolume ?? 0,
              }))
              .filter((p: PriceBar) => p.date && p.price > 0)
              .sort((a: PriceBar, b: PriceBar) => a.date.localeCompare(b.date))
          }
        }

        if (priceHistory.length < 10) {
          console.warn(`  [SKIP] ${company.companyname}: insufficient price data (${priceHistory.length} bars)`)
          skippedCount++; return false
        }

        // Sort FinData ascending
        finData.sort((a: any, b: any) => a.yrc - b.yrc)

        // Merge quarterly: prefer QuarterlyProfitandLoss (25 qtrs) + QR newer columns
        const quarterly = mergeQuarterly(qPnL, qResults)

        const fundamentals: FundamentalsBundle = {
          ttm: ttmArr[0] ?? null,
          finData,
          pnl,
          cashFlow,
          balanceSheet,
          quarterly,
          shareholding,
        }

        // Score at each horizon
        const stockScoreMap = new Map<string, { score: number; verdict: string; returnPct: number }>()

        for (const h of HORIZONS) {
          const startBar = findClosestPrice(priceHistory, h.startDate)
          const endBar = findClosestPrice(priceHistory, h.endDate)

          // For historical horizons, need price at start date
          if (h.hasReturns && (!startBar || !endBar || startBar.price <= 0 || endBar.price <= 0)) {
            horizonResults.get(h.id)!.skipped++
            continue
          }

          // For current benchmark, just need any recent price
          if (!h.hasReturns && (!endBar || endBar.price <= 0)) {
            horizonResults.get(h.id)!.skipped++
            continue
          }

          const resolved = resolveMetricsAtDate(fundamentals, priceHistory, h.startDate)
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

          const returnPct = h.hasReturns
            ? Math.round(((endBar!.price - startBar!.price) / startBar!.price) * 100 * 100) / 100
            : 0

          const result: StockAnalysisResult = {
            stockId,
            companyName: company.companyname,
            symbol: company.nsesymbol || company.bsecode || stockId,
            sector: company.sectorname,
            mcapType: company.mcaptype || 'Large Cap',
            industry: company.industryname || '',
            scoreResult,
            resolvedData: resolved.data,
            startPrice: startBar ? Math.round(startBar.price * 100) / 100 : 0,
            endPrice: endBar ? Math.round(endBar.price * 100) / 100 : 0,
            returnPct,
          }

          const hr = horizonResults.get(h.id)!
          if (isNaN(scoreResult.normalizedScore) || scoreResult.normalizedScore <= 0) {
            hr.valuationNA.push(result)
          } else {
            hr.scored.push(result)
            stockScoreMap.set(h.id, { score: scoreResult.normalizedScore, verdict: scoreResult.verdict, returnPct })
          }
        }

        if (stockScoreMap.size > 0) {
          allStockScores.set(`${company.companyname} (${company.nsesymbol || company.bsecode})`, stockScoreMap)
        }

        processed++
        if (processed % 10 === 0 || processed === targetStocks.length) {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
          console.log(`  Processed: ${processed}/${targetStocks.length} (${skippedCount} skipped) [${elapsed}s]`)
        }

        return true
      } catch (err) {
        skippedCount++
        console.warn(`  [ERROR] ${company.companyname} (${coCode}): ${err instanceof Error ? err.message : String(err)}`)
        return false
      }
    },
    CONCURRENCY,
  )

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
  console.log(`\n  Completed in ${elapsed}s`)

  // Sort all horizon results by score descending
  for (const [, hr] of horizonResults) {
    hr.scored.sort((a, b) => b.scoreResult.normalizedScore - a.scoreResult.normalizedScore)
  }

  // ── Step 4: Generate Reports ──
  console.log('\n[4/7] Generating reports...')

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true })

  for (const h of HORIZONS) {
    const hr = horizonResults.get(h.id)!
    const dir = resolve(OUTPUT_DIR, h.id)
    // Clean directory to avoid stale data from previous runs
    if (existsSync(dir)) {
      const oldFiles = readdirSync(dir)
      for (const f of oldFiles) unlinkSync(resolve(dir, f))
    } else {
      mkdirSync(dir, { recursive: true })
    }

    console.log(`\n  ${h.label}: ${hr.scored.length} scored, ${hr.valuationNA.length} valuation N/A, ${hr.skipped} skipped`)

    if (hr.scored.length < 2) {
      // Write a note file explaining why no reports
      writeFileSync(resolve(dir, 'NOTE.md'), `# ${h.label} — No Data\n\nInsufficient data at scoring date ${h.startDate} to compute V4 scores.\nCMOTS annual data (P&L, FinData) only covers 5 years (FY2021-FY2025), so scoring at March 2021\nrequires FY2020 data which is not available.\n\n${hr.scored.length} stocks scored, ${hr.valuationNA.length} valuation N/A, ${hr.skipped} skipped.\n`)
      console.log(`    Skipping reports (insufficient scored stocks)`)
      continue
    }

    // Main report
    const report = generateHorizonReport(h, hr.scored, hr.valuationNA, bankingCount, hr.skipped)
    writeFileSync(resolve(dir, 'report.md'), report)
    console.log(`    Written: report.md`)

    // CSVs
    const returns = hr.scored.map(s => s.returnPct)
    const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0
    writeHorizonCSVs(dir, h, hr.scored, hr.valuationNA, avgReturn)
    console.log(`    Written: CSVs (scores, metrics, quintiles, sectors, verdicts)`)

    // Rank deviation (only for horizons with returns)
    if (h.hasReturns) {
      const { allRanked, sectorSummaries } = computeRankDeviation(hr.scored)
      const rankReport = generateRankDeviationReport(h, sectorSummaries, allRanked)
      writeFileSync(resolve(dir, 'rank-deviation-report.md'), rankReport)

      // Rank deviation CSVs
      const detailHeader = 'sector,stock_count,stock_name,symbol,overall_score,score_rank,return_pct,return_rank,rank_diff,deviation_pct,bucket'
      const detailRows = allRanked.map(r => {
        const sectorSize = sectorSummaries.find(s => s.sector === r.sector)?.stockCount ?? 0
        return [csvQuote(r.sector), sectorSize, csvQuote(r.companyName), r.symbol,
          r.overallScore.toFixed(2), r.scoreRank, r.returnPct, r.returnRank,
          r.rankDiff, r.deviationPct, csvQuote(r.bucket)].join(',')
      })
      writeFileSync(resolve(dir, 'rank-deviation-detail.csv'), [detailHeader, ...detailRows].join('\n'))

      const sumHeader = 'sector,stock_count,exact_pct,within_10_pct,within_25_pct,rest_pct,cumulative_within_25_pct,avg_deviation_pct,spearman_correlation'
      const sumRows = sectorSummaries.map(s => [
        csvQuote(s.sector), s.stockCount, s.exactPct, s.within10Pct, s.within25Pct,
        s.restPct, s.cumulativeWithin25Pct, s.avgDeviationPct,
        s.spearmanCorrelation?.toFixed(3) ?? 'N/A',
      ].join(','))
      writeFileSync(resolve(dir, 'rank-deviation-sector-summary.csv'), [sumHeader, ...sumRows].join('\n'))

      console.log(`    Written: rank-deviation-report.md + CSVs`)
    }
  }

  // ── Step 5: Cross-Horizon Comparison ──
  console.log('\n[5/7] Generating cross-horizon comparison...')
  const crossReport = generateCrossHorizonReport(horizonResults, allStockScores)
  writeFileSync(resolve(OUTPUT_DIR, 'cross-horizon-comparison.md'), crossReport)
  console.log('  Written: cross-horizon-comparison.md')

  // ── Step 6: Console Summary ──
  console.log('\n[6/7] Summary:')
  console.log('='.repeat(70))
  for (const h of HORIZONS) {
    const hr = horizonResults.get(h.id)!
    const scores = hr.scored.map(s => s.scoreResult.normalizedScore)
    const returns = hr.scored.map(s => s.returnPct)
    const corr = h.hasReturns && returns.length >= 3 ? pearsonCorrelation(scores, returns) : 'N/A'
    console.log(`  ${h.label.padEnd(20)} ${hr.scored.length} stocks | Correlation: ${corr}`)
  }

  console.log(`\n[7/7] Output saved to: ${OUTPUT_DIR}`)
  console.log('  Subdirectories:')
  for (const h of HORIZONS) console.log(`    - ${h.id}/`)
  console.log('    - cross-horizon-comparison.md')
  console.log('\n' + '='.repeat(70))
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
