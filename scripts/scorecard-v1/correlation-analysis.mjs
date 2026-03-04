/**
 * Scorecard V1 — Correlation Analysis
 *
 * Reads computed metrics from data/results/{co_code}/all-metrics.json,
 * correlates each metric with forward stock returns, ranks by predictive power,
 * and computes segment importance.
 *
 * Usage:
 *   node scripts/scorecard-v1/correlation-analysis.mjs --co_code 476
 *   node scripts/scorecard-v1/correlation-analysis.mjs --symbol TCS
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '../..')
const RESULTS_DIR = resolve(PROJECT_ROOT, 'data/results')
const CACHE_DIR = resolve(PROJECT_ROOT, 'data/api-cache')

// ── CLI ──
function parseArgs() {
  const args = process.argv.slice(2)
  const opts = { co_code: null, symbol: null }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--co_code' && args[i + 1]) opts.co_code = args[++i]
    else if (args[i] === '--symbol' && args[i + 1]) opts.symbol = args[++i].toUpperCase()
  }
  return opts
}

function resolveCoCode(opts) {
  if (opts.co_code) return opts.co_code
  if (opts.symbol && existsSync(CACHE_DIR)) {
    for (const dir of readdirSync(CACHE_DIR)) {
      const metaPath = resolve(CACHE_DIR, dir, 'meta.json')
      if (existsSync(metaPath)) {
        const meta = JSON.parse(readFileSync(metaPath, 'utf8'))
        if (meta.symbol?.toUpperCase() === opts.symbol) return dir
      }
    }
  }
  console.error('Could not resolve co_code. Use --co_code or --symbol.')
  process.exit(1)
}

// ── Correlation Functions ──
function pearson(x, y) {
  const n = x.length
  if (n < 3) return null
  const mx = x.reduce((a, b) => a + b, 0) / n
  const my = y.reduce((a, b) => a + b, 0) / n
  let num = 0, dx2 = 0, dy2 = 0
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx, dy = y[i] - my
    num += dx * dy; dx2 += dx * dx; dy2 += dy * dy
  }
  const denom = Math.sqrt(dx2 * dy2)
  return denom === 0 ? 0 : num / denom
}

function spearman(x, y) {
  const n = x.length
  if (n < 3) return null
  const rank = arr => {
    const sorted = arr.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v)
    const ranks = new Array(n)
    for (let i = 0; i < n; i++) ranks[sorted[i].i] = i + 1
    return ranks
  }
  return pearson(rank(x), rank(y))
}

/** t-statistic for correlation significance */
function corrTStat(r, n) {
  if (n < 4 || Math.abs(r) >= 1) return null
  return r * Math.sqrt((n - 2) / (1 - r * r))
}

/** Approximate p-value from t-stat (two-tailed, rough) */
function approxPValue(t, df) {
  if (t == null || df < 1) return null
  const absT = Math.abs(t)
  // Rough approximation using normal distribution for df > 30
  if (df > 30) {
    const z = absT
    return 2 * (1 - 0.5 * (1 + Math.sign(z) * (1 - Math.exp(-2 * z * z / Math.PI))))
  }
  // For small df, use very rough categories
  if (absT > 3.5) return 0.01
  if (absT > 2.5) return 0.05
  if (absT > 2.0) return 0.10
  if (absT > 1.5) return 0.20
  return 0.50
}

// ── Main ──
async function main() {
  const opts = parseArgs()
  const co_code = resolveCoCode(opts)
  const metricsPath = resolve(RESULTS_DIR, String(co_code), 'all-metrics.json')

  if (!existsSync(metricsPath)) {
    console.error(`No metrics file found at ${metricsPath}. Run compute-all-metrics.mjs first.`)
    process.exit(1)
  }

  const data = JSON.parse(readFileSync(metricsPath, 'utf8'))

  console.log('═══════════════════════════════════════════════════════════')
  console.log('  SCORECARD V1 — Correlation Analysis')
  console.log(`  Stock: ${data.stock.symbol} (co_code=${data.stock.co_code})`)
  console.log(`  Metrics: ${data.metricCount} | Annual: ${Object.keys(data.annualSnapshots).length} | Monthly: ${data.monthlySnapshots.length}`)
  console.log('═══════════════════════════════════════════════════════════')

  const segmentMap = data.segmentMap
  const correlations = {}
  const rankings = {}

  // ── A. Annual Fundamental Correlations ──
  console.log('\n[1] Annual fundamental metric correlations...')
  const annualKeys = Object.keys(data.annualSnapshots).sort()
  const annualHorizons = ['1M', '3M', '6M', '1Y', '2Y']

  for (const horizon of annualHorizons) {
    const corrKey = `annual_${horizon}`
    correlations[corrKey] = {}

    // Collect all metric names
    const allMetrics = new Set()
    for (const k of annualKeys) {
      for (const mk of Object.keys(data.annualSnapshots[k].metrics)) {
        if (!mk.startsWith('_')) allMetrics.add(mk)
      }
    }

    for (const metricName of allMetrics) {
      const xs = [], ys = []
      for (const k of annualKeys) {
        const mv = data.annualSnapshots[k].metrics[metricName]
        const rv = data.annualSnapshots[k].forwardReturns[horizon]
        if (mv != null && rv != null && isFinite(mv) && isFinite(rv)) {
          xs.push(mv); ys.push(rv)
        }
      }
      if (xs.length >= 3) {
        const p = pearson(xs, ys)
        const s = spearman(xs, ys)
        const tStat = corrTStat(p, xs.length)
        correlations[corrKey][metricName] = {
          pearson: p ? +p.toFixed(4) : null,
          spearman: s ? +s.toFixed(4) : null,
          n: xs.length,
          tStat: tStat ? +tStat.toFixed(3) : null,
          pValue: approxPValue(tStat, xs.length - 2),
          direction: p > 0 ? 'positive' : 'negative',
          segment: segmentMap[metricName] || 'Other',
        }
      }
    }

    const count = Object.keys(correlations[corrKey]).length
    console.log(`  ${corrKey}: ${count} metrics correlated`)
  }

  // ── B. Monthly Technical Correlations ──
  console.log('\n[2] Monthly technical metric correlations...')
  const monthlyHorizons = ['1M', '3M', '6M', '1Y']

  for (const horizon of monthlyHorizons) {
    const corrKey = `monthly_${horizon}`
    correlations[corrKey] = {}

    const allMetrics = new Set()
    for (const s of data.monthlySnapshots) {
      for (const mk of Object.keys(s.metrics)) {
        if (!mk.startsWith('_')) allMetrics.add(mk)
      }
    }

    for (const metricName of allMetrics) {
      const xs = [], ys = []
      for (const s of data.monthlySnapshots) {
        const mv = s.metrics[metricName]
        const rv = s.forwardReturns[horizon]
        if (mv != null && rv != null && isFinite(mv) && isFinite(rv)) {
          xs.push(mv); ys.push(rv)
        }
      }
      if (xs.length >= 5) {
        const p = pearson(xs, ys)
        const s = spearman(xs, ys)
        const tStat = corrTStat(p, xs.length)
        correlations[corrKey][metricName] = {
          pearson: p ? +p.toFixed(4) : null,
          spearman: s ? +s.toFixed(4) : null,
          n: xs.length,
          tStat: tStat ? +tStat.toFixed(3) : null,
          pValue: approxPValue(tStat, xs.length - 2),
          direction: p > 0 ? 'positive' : 'negative',
          segment: segmentMap[metricName] || 'Other',
        }
      }
    }

    const count = Object.keys(correlations[corrKey]).length
    console.log(`  ${corrKey}: ${count} metrics correlated`)
  }

  // ── C. Rankings ──
  console.log('\n[3] Ranking metrics by |correlation|...')

  for (const [corrKey, metricCorrs] of Object.entries(correlations)) {
    rankings[corrKey] = Object.entries(metricCorrs)
      .map(([metric, d]) => ({
        metric,
        segment: d.segment,
        absCorr: Math.abs(d.pearson ?? 0),
        pearson: d.pearson,
        spearman: d.spearman,
        direction: d.direction,
        n: d.n,
        tStat: d.tStat,
        pValue: d.pValue,
      }))
      .sort((a, b) => b.absCorr - a.absCorr)
  }

  // ── D. Segment Importance ──
  console.log('\n[4] Computing segment importance...')
  const segmentImportance = {}

  for (const [corrKey, ranked] of Object.entries(rankings)) {
    const segScores = {}, segCounts = {}
    for (const item of ranked) {
      if (!segScores[item.segment]) { segScores[item.segment] = 0; segCounts[item.segment] = 0 }
      segScores[item.segment] += item.absCorr
      segCounts[item.segment]++
    }
    segmentImportance[corrKey] = {}
    for (const [seg, total] of Object.entries(segScores)) {
      segmentImportance[corrKey][seg] = {
        avgAbsCorr: +(total / segCounts[seg]).toFixed(4),
        metricCount: segCounts[seg],
        topMetric: ranked.find(r => r.segment === seg)?.metric || null,
        topCorr: ranked.find(r => r.segment === seg)?.pearson || null,
      }
    }
  }

  // ── E. Print Results ──
  console.log('\n' + '═'.repeat(90))
  console.log('  RESULTS')
  console.log('═'.repeat(90))

  for (const [corrKey, ranked] of Object.entries(rankings)) {
    console.log(`\n  ── ${corrKey} — Top 20 Metrics ──`)
    console.log(`  ${'#'.padEnd(4)} ${'Metric'.padEnd(28)} ${'Segment'.padEnd(20)} ${'Pearson'.padEnd(9)} ${'Spearman'.padEnd(9)} ${'t-stat'.padEnd(8)} ${'N'.padEnd(4)} Dir`)
    console.log('  ' + '─'.repeat(86))
    for (let i = 0; i < Math.min(20, ranked.length); i++) {
      const r = ranked[i]
      console.log(
        `  ${(i + 1 + '.').padEnd(4)} ${r.metric.padEnd(28)} ${r.segment.padEnd(20)} ` +
        `${(r.pearson?.toFixed(3) ?? 'N/A').padEnd(9)} ${(r.spearman?.toFixed(3) ?? 'N/A').padEnd(9)} ` +
        `${(r.tStat?.toFixed(2) ?? 'N/A').padEnd(8)} ${String(r.n).padEnd(4)} ${r.direction.slice(0, 3)}`
      )
    }
  }

  // Segment importance summary
  console.log('\n  ── Segment Importance Summary ──')
  for (const [corrKey, segs] of Object.entries(segmentImportance)) {
    console.log(`\n  ${corrKey}:`)
    const sorted = Object.entries(segs).sort((a, b) => b[1].avgAbsCorr - a[1].avgAbsCorr)
    for (const [seg, info] of sorted) {
      const bar = '█'.repeat(Math.round(info.avgAbsCorr * 20))
      console.log(
        `    ${seg.padEnd(20)} avg|r|=${info.avgAbsCorr.toFixed(3)}  (${info.metricCount} metrics)  ` +
        `top: ${info.topMetric} (${info.topCorr?.toFixed(3)})  ${bar}`
      )
    }
  }

  // Cross-horizon consistency
  console.log('\n  ── Cross-Horizon Consistency (metrics strong across multiple horizons) ──')
  const metricScores = {}
  for (const [corrKey, ranked] of Object.entries(rankings)) {
    for (const r of ranked) {
      if (!metricScores[r.metric]) metricScores[r.metric] = { totalAbsCorr: 0, horizons: 0, segment: r.segment, maxCorr: 0 }
      metricScores[r.metric].totalAbsCorr += r.absCorr
      metricScores[r.metric].horizons++
      if (r.absCorr > metricScores[r.metric].maxCorr) metricScores[r.metric].maxCorr = r.absCorr
    }
  }
  const consistent = Object.entries(metricScores)
    .map(([metric, info]) => ({
      metric,
      avgAbsCorr: info.totalAbsCorr / info.horizons,
      horizons: info.horizons,
      segment: info.segment,
      maxCorr: info.maxCorr,
    }))
    .filter(m => m.horizons >= 3) // Appears in at least 3 horizon combos
    .sort((a, b) => b.avgAbsCorr - a.avgAbsCorr)

  console.log(`  ${'#'.padEnd(4)} ${'Metric'.padEnd(28)} ${'Segment'.padEnd(20)} ${'Avg|r|'.padEnd(9)} ${'Max|r|'.padEnd(9)} Horizons`)
  console.log('  ' + '─'.repeat(78))
  for (let i = 0; i < Math.min(25, consistent.length); i++) {
    const c = consistent[i]
    console.log(
      `  ${(i + 1 + '.').padEnd(4)} ${c.metric.padEnd(28)} ${c.segment.padEnd(20)} ` +
      `${c.avgAbsCorr.toFixed(3).padEnd(9)} ${c.maxCorr.toFixed(3).padEnd(9)} ${c.horizons}`
    )
  }

  // Statistical caveats
  console.log('\n  ── Statistical Caveats ──')
  console.log('  • Annual fundamental correlations: N=3-5 → INSUFFICIENT for statistical significance')
  console.log('  • Monthly technical correlations: N≈50-58 → borderline useful for strong effects')
  console.log('  • Single-stock time-series ≠ cross-sectional factor model')
  console.log('  • These are DIRECTIONAL hypotheses for cross-sectional validation (Nifty 50)')
  console.log('  • Metrics with |r| > 0.5 on monthly data with N>30 are worth prioritizing')

  // ── Save Results ──
  const output = {
    stock: data.stock,
    generatedAt: new Date().toISOString(),
    metricCount: data.metricCount,
    correlations,
    rankings: Object.fromEntries(
      Object.entries(rankings).map(([k, v]) => [k, v.slice(0, 50)])
    ),
    segmentImportance,
    crossHorizonConsistency: consistent.slice(0, 40),
    caveats: [
      'Annual N=3-5: insufficient for significance, directional only',
      'Monthly N≈50-58: borderline, interpret cautiously',
      'Single-stock time-series, not cross-sectional',
      'Requires Nifty 50+ cross-sectional validation',
    ],
  }

  const outPath = resolve(RESULTS_DIR, String(co_code), 'correlations.json')
  writeFileSync(outPath, JSON.stringify(output, null, 2))

  console.log(`\n  Results saved: ${outPath}`)
  console.log('═══════════════════════════════════════════════════════════')
  console.log('  CORRELATION ANALYSIS COMPLETE')
  console.log('═══════════════════════════════════════════════════════════')
}

main().catch(e => {
  console.error('Fatal error:', e)
  process.exit(1)
})
