/**
 * Sector Rank Deviation Analysis — Score Rank vs Return Rank
 *
 * Reads existing V4 backtest data, groups stocks by sector, ranks each
 * by overall_score and return_pct, and measures how closely the two
 * rankings align using deviation buckets.
 *
 * Outputs:
 *   - rank-deviation-detail.csv         — Per-stock rank comparison
 *   - rank-deviation-sector-summary.csv — Per-sector deviation stats
 *   - rank-deviation-report.md          — Human-readable findings
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json scripts/sector-rank-deviation-analysis.ts
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ─── Configuration ────────────────────────────────────────
const INPUT_CSV = resolve(__dirname, '..', 'Backtest V4 - 26 Feb', 'stock-scores-and-returns.csv')
const OUTPUT_DIR = resolve(__dirname, '..', 'Backtest V4 - 26 Feb')
const MIN_SECTOR_SIZE = 5 // sectors below this excluded from aggregate stats

// ─── Types ────────────────────────────────────────────────

interface StockRow {
  stock_id: string
  stock_name: string
  symbol: string
  sector: string
  mcap_type: string
  overall_score: number
  verdict: string
  return_pct: number
}

interface RankedStock extends StockRow {
  score_rank: number
  return_rank: number
  rank_diff: number
  deviation_pct: number
  bucket: string
}

interface SectorSummary {
  sector: string
  stock_count: number
  exact_count: number
  exact_pct: number
  within_10_count: number
  within_10_pct: number
  within_25_count: number
  within_25_pct: number
  rest_count: number
  rest_pct: number
  cumulative_within_25_pct: number
  avg_deviation_pct: number
  spearman_correlation: number | null
  size_category: string
}

// ─── CSV Parsing ──────────────────────────────────────────

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n')
  const headers = parseCSVLine(lines[0])
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = values[i] || '' })
    return row
  })
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        current += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        result.push(current.trim())
        current = ''
      } else {
        current += ch
      }
    }
  }
  result.push(current.trim())
  return result
}

// ─── Dense Ranking ────────────────────────────────────────

/** Dense rank: tied values get same rank, next distinct value gets rank + 1 */
function denseRank(values: number[], descending = true): number[] {
  const indexed = values.map((v, i) => ({ v, i }))
  indexed.sort((a, b) => descending ? b.v - a.v : a.v - b.v)
  const ranks = new Array(values.length)
  let rank = 1
  for (let j = 0; j < indexed.length; j++) {
    if (j > 0 && indexed[j].v !== indexed[j - 1].v) {
      rank++
    }
    ranks[indexed[j].i] = rank
  }
  return ranks
}

// ─── Spearman Rank Correlation ────────────────────────────

function spearmanCorrelation(ranks1: number[], ranks2: number[]): number | null {
  const n = ranks1.length
  if (n < 3) return null

  // Standard ranks for Spearman (convert dense ranks to average/competition isn't needed
  // since we compute Pearson on the rank vectors directly)
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

// ─── Bucket Assignment ────────────────────────────────────

function assignBucket(deviation_pct: number): string {
  if (deviation_pct === 0) return 'Exact'
  if (deviation_pct <= 10) return 'Within 10%'
  if (deviation_pct <= 25) return 'Within 25%'
  return 'Rest'
}

function sizeCategory(n: number): string {
  if (n >= 50) return 'Large'
  if (n >= 10) return 'Medium'
  if (n >= 5) return 'Small'
  return 'Tiny'
}

// ─── Main ─────────────────────────────────────────────────

function main() {
  console.log('═══════════════════════════════════════════════════════')
  console.log('  Sector Rank Deviation Analysis — Score vs Return')
  console.log('═══════════════════════════════════════════════════════')

  // Read input
  if (!existsSync(INPUT_CSV)) {
    console.error(`ERROR: Input file not found: ${INPUT_CSV}`)
    process.exit(1)
  }

  const rawContent = readFileSync(INPUT_CSV, 'utf-8')
  const rawRows = parseCSV(rawContent)
  console.log(`\nLoaded ${rawRows.length} stocks from CSV`)

  // Parse into typed rows
  const stocks: StockRow[] = rawRows.map(r => ({
    stock_id: r.stock_id,
    stock_name: r.stock_name,
    symbol: r.symbol,
    sector: r.sector,
    mcap_type: r.mcap_type,
    overall_score: parseFloat(r.overall_score) || 0,
    verdict: r.verdict,
    return_pct: parseFloat(r.return_pct) || 0,
  }))

  // Group by sector
  const sectorMap = new Map<string, StockRow[]>()
  for (const s of stocks) {
    if (!sectorMap.has(s.sector)) sectorMap.set(s.sector, [])
    sectorMap.get(s.sector)!.push(s)
  }
  console.log(`Found ${sectorMap.size} sectors`)

  // Process each sector
  const allRanked: RankedStock[] = []
  const sectorSummaries: SectorSummary[] = []

  for (const [sector, sectorStocks] of sectorMap) {
    const N = sectorStocks.length
    const scores = sectorStocks.map(s => s.overall_score)
    const returns = sectorStocks.map(s => s.return_pct)

    const scoreRanks = denseRank(scores, true)   // highest score = rank 1
    const returnRanks = denseRank(returns, true)  // highest return = rank 1

    let exactCount = 0, w10Count = 0, w25Count = 0, restCount = 0
    let totalDeviation = 0

    const ranked: RankedStock[] = sectorStocks.map((stock, i) => {
      const rankDiff = Math.abs(scoreRanks[i] - returnRanks[i])
      const deviationPct = N > 0 ? (rankDiff / N) * 100 : 0
      const bucket = assignBucket(deviationPct)

      if (bucket === 'Exact') exactCount++
      else if (bucket === 'Within 10%') w10Count++
      else if (bucket === 'Within 25%') w25Count++
      else restCount++

      totalDeviation += deviationPct

      return {
        ...stock,
        score_rank: scoreRanks[i],
        return_rank: returnRanks[i],
        rank_diff: rankDiff,
        deviation_pct: Math.round(deviationPct * 100) / 100,
        bucket,
      }
    })

    // Sort by score_rank within sector
    ranked.sort((a, b) => a.score_rank - b.score_rank)
    allRanked.push(...ranked)

    const spearman = N >= MIN_SECTOR_SIZE ? spearmanCorrelation(scoreRanks, returnRanks) : null

    sectorSummaries.push({
      sector,
      stock_count: N,
      exact_count: exactCount,
      exact_pct: Math.round((exactCount / N) * 10000) / 100,
      within_10_count: w10Count,
      within_10_pct: Math.round((w10Count / N) * 10000) / 100,
      within_25_count: w25Count,
      within_25_pct: Math.round((w25Count / N) * 10000) / 100,
      rest_count: restCount,
      rest_pct: Math.round((restCount / N) * 10000) / 100,
      cumulative_within_25_pct: Math.round(((exactCount + w10Count + w25Count) / N) * 10000) / 100,
      avg_deviation_pct: Math.round((totalDeviation / N) * 100) / 100,
      spearman_correlation: spearman !== null ? Math.round(spearman * 1000) / 1000 : null,
      size_category: sizeCategory(N),
    })
  }

  // Sort sector summaries by stock count desc
  sectorSummaries.sort((a, b) => b.stock_count - a.stock_count)

  // Sort detail by sector alpha, then score_rank
  allRanked.sort((a, b) => {
    const sectorCmp = a.sector.localeCompare(b.sector)
    if (sectorCmp !== 0) return sectorCmp
    return a.score_rank - b.score_rank
  })

  // ─── Write Detail CSV ──────────────────────────────
  const detailHeader = 'sector,stock_count,stock_name,symbol,overall_score,score_rank,return_pct,return_rank,rank_diff,deviation_pct,bucket'
  const detailRows = allRanked.map(r => {
    const sectorSize = sectorSummaries.find(s => s.sector === r.sector)!.stock_count
    return [
      csvQuote(r.sector), sectorSize, csvQuote(r.stock_name), r.symbol,
      r.overall_score, r.score_rank, r.return_pct, r.return_rank,
      r.rank_diff, r.deviation_pct, csvQuote(r.bucket),
    ].join(',')
  })
  const detailCSV = [detailHeader, ...detailRows].join('\n')
  writeFileSync(resolve(OUTPUT_DIR, 'rank-deviation-detail.csv'), detailCSV)
  console.log(`\nWrote rank-deviation-detail.csv (${allRanked.length} rows)`)

  // ─── Write Sector Summary CSV ──────────────────────
  const summaryHeader = 'sector,stock_count,exact_count,exact_pct,within_10_count,within_10_pct,within_25_count,within_25_pct,rest_count,rest_pct,cumulative_within_25_pct,avg_deviation_pct,spearman_correlation,size_category'
  const summaryRows = sectorSummaries.map(s => [
    csvQuote(s.sector), s.stock_count,
    s.exact_count, s.exact_pct,
    s.within_10_count, s.within_10_pct,
    s.within_25_count, s.within_25_pct,
    s.rest_count, s.rest_pct,
    s.cumulative_within_25_pct, s.avg_deviation_pct,
    s.spearman_correlation !== null ? s.spearman_correlation : 'N/A',
    s.size_category,
  ].join(','))
  const summaryCSV = [summaryHeader, ...summaryRows].join('\n')
  writeFileSync(resolve(OUTPUT_DIR, 'rank-deviation-sector-summary.csv'), summaryCSV)
  console.log(`Wrote rank-deviation-sector-summary.csv (${sectorSummaries.length} sectors)`)

  // ─── Write Markdown Report ─────────────────────────
  const report = generateReport(sectorSummaries, allRanked)
  writeFileSync(resolve(OUTPUT_DIR, 'rank-deviation-report.md'), report)
  console.log(`Wrote rank-deviation-report.md`)

  // ─── Console Summary ──────────────────────────────
  const qualifying = sectorSummaries.filter(s => s.stock_count >= MIN_SECTOR_SIZE)
  const qualifyingStocks = qualifying.reduce((s, q) => s + q.stock_count, 0)
  const totalExact = qualifying.reduce((s, q) => s + q.exact_count, 0)
  const totalW10 = qualifying.reduce((s, q) => s + q.within_10_count, 0)
  const totalW25 = qualifying.reduce((s, q) => s + q.within_25_count, 0)
  const totalRest = qualifying.reduce((s, q) => s + q.rest_count, 0)

  console.log(`\n─── Aggregate (sectors with ≥${MIN_SECTOR_SIZE} stocks) ───`)
  console.log(`Qualifying sectors: ${qualifying.length} (${qualifyingStocks} stocks)`)
  console.log(`Exact match:   ${totalExact} (${pct(totalExact, qualifyingStocks)})`)
  console.log(`Within 10%:    ${totalW10} (${pct(totalW10, qualifyingStocks)})`)
  console.log(`Within 25%:    ${totalW25} (${pct(totalW25, qualifyingStocks)})`)
  console.log(`Rest (>25%):   ${totalRest} (${pct(totalRest, qualifyingStocks)})`)
  console.log(`\nDone.`)
}

// ─── Report Generation ────────────────────────────────────

function generateReport(summaries: SectorSummary[], allRanked: RankedStock[]): string {
  const qualifying = summaries.filter(s => s.stock_count >= MIN_SECTOR_SIZE)
  const tiny = summaries.filter(s => s.stock_count < MIN_SECTOR_SIZE)
  const qualifyingStocks = qualifying.reduce((s, q) => s + q.stock_count, 0)
  const totalExact = qualifying.reduce((s, q) => s + q.exact_count, 0)
  const totalW10 = qualifying.reduce((s, q) => s + q.within_10_count, 0)
  const totalW25 = qualifying.reduce((s, q) => s + q.within_25_count, 0)
  const totalRest = qualifying.reduce((s, q) => s + q.rest_count, 0)
  const cumulW25 = totalExact + totalW10 + totalW25

  const lines: string[] = []

  // Title
  lines.push('# Sector Rank Deviation Analysis — Score Rank vs Return Rank')
  lines.push('')
  lines.push('> Within each sector, if our V4 scoring works, stocks scored highest should also have the highest returns.')
  lines.push('> This report measures how closely score-based rankings match return-based rankings.')
  lines.push('')

  // ─── Section 1: Executive Summary
  lines.push('## 1. Executive Summary')
  lines.push('')
  lines.push(`Analysis covers **${qualifying.length} sectors** with ≥${MIN_SECTOR_SIZE} stocks (${qualifyingStocks} stocks total). ${tiny.length} tiny sectors (<${MIN_SECTOR_SIZE} stocks, ${tiny.reduce((s, t) => s + t.stock_count, 0)} stocks) excluded from aggregates.`)
  lines.push('')
  lines.push('| Bucket | Count | % of Total |')
  lines.push('|--------|------:|----------:|')
  lines.push(`| **Exact Match** (rank identical) | ${totalExact} | ${pct(totalExact, qualifyingStocks)} |`)
  lines.push(`| **Within 10%** deviation | ${totalW10} | ${pct(totalW10, qualifyingStocks)} |`)
  lines.push(`| **Within 25%** deviation | ${totalW25} | ${pct(totalW25, qualifyingStocks)} |`)
  lines.push(`| **Rest** (>25% off) | ${totalRest} | ${pct(totalRest, qualifyingStocks)} |`)
  lines.push(`| **Cumulative ≤25%** | ${cumulW25} | ${pct(cumulW25, qualifyingStocks)} |`)
  lines.push('')

  // ─── Section 2: Aggregate by Sector Size
  lines.push('## 2. Aggregate by Sector Size')
  lines.push('')
  const sizeGroups = [
    { label: 'Large (50+)', sectors: qualifying.filter(s => s.size_category === 'Large') },
    { label: 'Medium (10–49)', sectors: qualifying.filter(s => s.size_category === 'Medium') },
    { label: 'Small (5–9)', sectors: qualifying.filter(s => s.size_category === 'Small') },
  ]

  lines.push('| Size Group | Sectors | Stocks | Exact % | ≤10% | ≤25% | >25% | Avg Dev % |')
  lines.push('|------------|--------:|-------:|--------:|-----:|-----:|-----:|----------:|')
  for (const g of sizeGroups) {
    const n = g.sectors.reduce((s, q) => s + q.stock_count, 0)
    if (n === 0) continue
    const ex = g.sectors.reduce((s, q) => s + q.exact_count, 0)
    const w10 = g.sectors.reduce((s, q) => s + q.within_10_count, 0)
    const w25 = g.sectors.reduce((s, q) => s + q.within_25_count, 0)
    const rest = g.sectors.reduce((s, q) => s + q.rest_count, 0)
    const avgDev = g.sectors.reduce((s, q) => s + q.avg_deviation_pct * q.stock_count, 0) / n
    lines.push(`| ${g.label} | ${g.sectors.length} | ${n} | ${pct(ex, n)} | ${pct(ex + w10, n)} | ${pct(ex + w10 + w25, n)} | ${pct(rest, n)} | ${avgDev.toFixed(1)}% |`)
  }
  lines.push('')

  // ─── Section 3: Top 15 by Rank Alignment
  lines.push('## 3. Top 15 Sectors by Rank Alignment')
  lines.push('')
  lines.push('Sectors where score ranking most closely matches return ranking (sorted by cumulative ≤25% deviation %, then Spearman correlation).')
  lines.push('')
  const top15 = [...qualifying]
    .sort((a, b) => {
      const diff = b.cumulative_within_25_pct - a.cumulative_within_25_pct
      if (Math.abs(diff) > 0.01) return diff
      return (b.spearman_correlation || 0) - (a.spearman_correlation || 0)
    })
    .slice(0, 15)

  lines.push('| # | Sector | N | Exact | ≤10% | ≤25% | >25% | Cum ≤25% | Avg Dev | Spearman |')
  lines.push('|--:|--------|--:|------:|-----:|-----:|-----:|---------:|--------:|---------:|')
  top15.forEach((s, i) => {
    lines.push(`| ${i + 1} | ${s.sector} | ${s.stock_count} | ${s.exact_pct}% | ${s.within_10_pct}% | ${s.within_25_pct}% | ${s.rest_pct}% | **${s.cumulative_within_25_pct}%** | ${s.avg_deviation_pct}% | ${s.spearman_correlation !== null ? s.spearman_correlation.toFixed(3) : 'N/A'} |`)
  })
  lines.push('')

  // ─── Section 4: Bottom 15 by Rank Alignment
  lines.push('## 4. Bottom 15 Sectors by Rank Alignment')
  lines.push('')
  lines.push('Sectors where score ranking diverges most from return ranking.')
  lines.push('')
  const bottom15 = [...qualifying]
    .sort((a, b) => {
      const diff = a.cumulative_within_25_pct - b.cumulative_within_25_pct
      if (Math.abs(diff) > 0.01) return diff
      return (a.spearman_correlation || 0) - (b.spearman_correlation || 0)
    })
    .slice(0, 15)

  lines.push('| # | Sector | N | Exact | ≤10% | ≤25% | >25% | Cum ≤25% | Avg Dev | Spearman |')
  lines.push('|--:|--------|--:|------:|-----:|-----:|-----:|---------:|--------:|---------:|')
  bottom15.forEach((s, i) => {
    lines.push(`| ${i + 1} | ${s.sector} | ${s.stock_count} | ${s.exact_pct}% | ${s.within_10_pct}% | ${s.within_25_pct}% | ${s.rest_pct}% | **${s.cumulative_within_25_pct}%** | ${s.avg_deviation_pct}% | ${s.spearman_correlation !== null ? s.spearman_correlation.toFixed(3) : 'N/A'} |`)
  })
  lines.push('')

  // ─── Section 5: Full Sector Summary Table
  lines.push('## 5. Full Sector Summary Table (≥5 stocks)')
  lines.push('')
  lines.push('| Sector | N | Exact | Exact% | ≤10% | ≤10%% | ≤25% | ≤25%% | >25% | >25%% | Cum≤25% | AvgDev | Spearman | Size |')
  lines.push('|--------|--:|------:|-------:|-----:|------:|-----:|------:|-----:|------:|--------:|-------:|---------:|------|')
  for (const s of qualifying) {
    lines.push(`| ${s.sector} | ${s.stock_count} | ${s.exact_count} | ${s.exact_pct}% | ${s.within_10_count} | ${s.within_10_pct}% | ${s.within_25_count} | ${s.within_25_pct}% | ${s.rest_count} | ${s.rest_pct}% | ${s.cumulative_within_25_pct}% | ${s.avg_deviation_pct}% | ${s.spearman_correlation !== null ? s.spearman_correlation.toFixed(3) : 'N/A'} | ${s.size_category} |`)
  }
  lines.push('')

  // ─── Section 6: Detailed Deep-Dives (top 5 largest sectors)
  lines.push('## 6. Detailed Deep-Dives — Top 5 Largest Sectors')
  lines.push('')
  const top5Sectors = qualifying.slice(0, 5) // already sorted by stock_count desc
  for (const sectorSum of top5Sectors) {
    const sectorStocks = allRanked
      .filter(r => r.sector === sectorSum.sector)
      .sort((a, b) => a.score_rank - b.score_rank)

    lines.push(`### ${sectorSum.sector} (${sectorSum.stock_count} stocks)`)
    lines.push('')
    lines.push(`Spearman correlation: **${sectorSum.spearman_correlation !== null ? sectorSum.spearman_correlation.toFixed(3) : 'N/A'}** | Avg deviation: **${sectorSum.avg_deviation_pct}%** | Cumulative ≤25%: **${sectorSum.cumulative_within_25_pct}%**`)
    lines.push('')

    // Show top 20 and bottom 20 for large sectors, all for smaller
    const showAll = sectorStocks.length <= 40
    const toShow = showAll ? sectorStocks : [
      ...sectorStocks.slice(0, 20),
      ...sectorStocks.slice(-20)
    ]

    lines.push('| Score Rank | Stock | Score | Return% | Return Rank | Rank Diff | Dev% | Bucket |')
    lines.push('|-----------:|-------|------:|--------:|------------:|----------:|-----:|--------|')

    let showed20 = false
    for (const r of toShow) {
      if (!showAll && !showed20 && r.score_rank > 20) {
        lines.push(`| ... | *${sectorStocks.length - 40} stocks omitted* | ... | ... | ... | ... | ... | ... |`)
        showed20 = true
      }
      lines.push(`| ${r.score_rank} | ${r.stock_name.length > 35 ? r.stock_name.slice(0, 32) + '...' : r.stock_name} | ${r.overall_score} | ${r.return_pct}% | ${r.return_rank} | ${r.rank_diff} | ${r.deviation_pct}% | ${r.bucket} |`)
    }
    lines.push('')
  }

  // ─── Section 7: Methodology
  lines.push('## 7. Methodology')
  lines.push('')
  lines.push('### Ranking')
  lines.push('- **Dense ranking** used: tied values get the same rank, next distinct value gets rank + 1')
  lines.push('- Stocks ranked independently by `overall_score` (descending) and `return_pct` (descending) within each sector')
  lines.push('')
  lines.push('### Deviation Formula')
  lines.push('```')
  lines.push('rank_diff     = |score_rank - return_rank|')
  lines.push('deviation_pct = rank_diff / N × 100   (N = total stocks in sector)')
  lines.push('```')
  lines.push('')
  lines.push('### Bucket Definitions')
  lines.push('| Bucket | Condition |')
  lines.push('|--------|-----------|')
  lines.push('| Exact | deviation_pct = 0% |')
  lines.push('| Within 10% | 0% < deviation_pct ≤ 10% |')
  lines.push('| Within 25% | 10% < deviation_pct ≤ 25% |')
  lines.push('| Rest | deviation_pct > 25% |')
  lines.push('')
  lines.push(`### Minimum Sector Size`)
  lines.push(`Sectors with fewer than ${MIN_SECTOR_SIZE} stocks are excluded from aggregate statistics and rankings but included in the detail CSV.`)
  lines.push('')
  lines.push('### Data Source')
  lines.push('- Input: `stock-scores-and-returns.csv` from V4 Backtest (Dec 24, 2024 → Feb 25, 2026)')
  lines.push('- 3,396 BSE non-banking stocks across 83 sectors')
  lines.push('')

  return lines.join('\n')
}

// ─── Helpers ──────────────────────────────────────────────

function csvQuote(s: string): string {
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return `"${s}"`
}

function pct(num: number, denom: number): string {
  if (denom === 0) return '0.00%'
  return ((num / denom) * 100).toFixed(2) + '%'
}

// ─── Run ──────────────────────────────────────────────────
main()
