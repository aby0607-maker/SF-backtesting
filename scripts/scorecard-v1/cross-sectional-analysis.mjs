#!/usr/bin/env node
/**
 * Cross-Sectional Correlation Analysis
 *
 * Instead of time-series (1 stock, N years), this analyzes cross-sectionally:
 * For each metric, across all 48 stocks at the latest FY, what is the
 * correlation between metric value and forward returns?
 *
 * This gives N=48 (one per stock) for each metric — far more statistical
 * power than the N=4-5 we had with single-stock time series.
 *
 * Output: segment weights, metric importance, and normalization parameters
 * for the scorecard engine.
 *
 * Usage: node scripts/scorecard-v1/cross-sectional-analysis.mjs
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '../..')
const RESULTS_DIR = resolve(PROJECT_ROOT, 'data/results')

// ── Load all stock results ──
function loadAllStockResults() {
  const universe = JSON.parse(readFileSync(resolve(PROJECT_ROOT, 'data/nifty50-universe.json'), 'utf8'))
  const stocks = []

  for (const entry of universe.stocks) {
    const file = resolve(RESULTS_DIR, String(entry.co_code), 'all-metrics.json')
    if (!existsSync(file)) continue

    const data = JSON.parse(readFileSync(file, 'utf8'))
    const yearCols = Object.keys(data.annualSnapshots).sort()
    if (yearCols.length === 0) continue

    // Use latest annual snapshot
    const latestYC = yearCols[yearCols.length - 1]
    const snap = data.annualSnapshots[latestYC]
    if (!snap || !snap.forwardReturns) continue

    stocks.push({
      symbol: entry.symbol,
      co_code: entry.co_code,
      sector: entry.sector,
      date: snap.date,
      metrics: snap.metrics,
      forwardReturns: snap.forwardReturns,
      segmentMap: data.segmentMap,
    })
  }

  return stocks
}

// ── Statistical helpers ──
function pearson(x, y) {
  const n = x.length
  if (n < 5) return { r: null, t: null, n }
  const mx = x.reduce((a, b) => a + b) / n
  const my = y.reduce((a, b) => a + b) / n
  let sxy = 0, sxx = 0, syy = 0
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx, dy = y[i] - my
    sxy += dx * dy; sxx += dx * dx; syy += dy * dy
  }
  if (sxx === 0 || syy === 0) return { r: 0, t: 0, n }
  const r = sxy / Math.sqrt(sxx * syy)
  const t = r * Math.sqrt((n - 2) / (1 - r * r + 1e-15))
  return { r, t, n }
}

function spearman(x, y) {
  const rank = arr => {
    const sorted = arr.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v)
    const ranks = new Array(arr.length)
    for (let i = 0; i < sorted.length; i++) ranks[sorted[i].i] = i + 1
    return ranks
  }
  return pearson(rank(x), rank(y))
}

// ── Percentile computation ──
function percentileRanks(values) {
  const sorted = [...values].sort((a, b) => a - b)
  return values.map(v => {
    const idx = sorted.indexOf(v)
    return (idx / (sorted.length - 1)) * 100
  })
}

// ── Main analysis ──
function main() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('  CROSS-SECTIONAL ANALYSIS — Nifty 50 Universe')
  console.log('═══════════════════════════════════════════════════════════')

  const stocks = loadAllStockResults()
  console.log(`\n  Stocks loaded: ${stocks.length}`)

  // Identify forward return horizons available
  const allHorizons = new Set()
  for (const s of stocks) {
    for (const h of Object.keys(s.forwardReturns)) allHorizons.add(h)
  }
  const horizons = [...allHorizons].sort()
  console.log(`  Forward return horizons: ${horizons.join(', ')}`)

  // Collect all unique metric names (excluding underscore-prefixed raw values)
  const allMetricNames = new Set()
  for (const s of stocks) {
    for (const k of Object.keys(s.metrics)) {
      if (!k.startsWith('_')) allMetricNames.add(k)
    }
  }
  console.log(`  Unique metrics across universe: ${allMetricNames.size}`)

  // Build segment map from first stock that has it
  const SEGMENT_MAP = stocks[0]?.segmentMap || {}

  // ── For each horizon, correlate each metric cross-sectionally ──
  console.log('\n[1] Computing cross-sectional correlations...')

  const metricResults = {}  // metricName → { horizonResults, segment, coverage }
  const segmentResults = {} // segment → { avgAbsR, metrics, ... }

  for (const horizon of horizons) {
    console.log(`\n  ── Horizon: ${horizon} ──`)

    // Get stocks that have this forward return
    const validStocks = stocks.filter(s => s.forwardReturns[horizon] != null)
    console.log(`    Stocks with ${horizon} forward return: ${validStocks.length}`)

    if (validStocks.length < 10) {
      console.log(`    SKIP: insufficient stocks (need >= 10)`)
      continue
    }

    const returns = validStocks.map(s => s.forwardReturns[horizon])

    for (const metricName of allMetricNames) {
      // Get metric values for stocks that have both metric and return
      const pairs = []
      for (let i = 0; i < validStocks.length; i++) {
        const val = validStocks[i].metrics[metricName]
        if (val != null && isFinite(val) && !isNaN(val)) {
          pairs.push({ metric: val, ret: returns[i] })
        }
      }

      if (pairs.length < 10) continue

      const x = pairs.map(p => p.metric)
      const y = pairs.map(p => p.ret)

      const p = pearson(x, y)
      const s = spearman(x, y)

      if (!metricResults[metricName]) {
        metricResults[metricName] = {
          segment: SEGMENT_MAP[metricName] || 'Unmapped',
          horizonResults: {},
          coverage: 0,
        }
      }

      metricResults[metricName].horizonResults[horizon] = {
        pearson: p.r,
        spearman: s.r,
        tStat: p.t,
        n: p.n,
        significant: Math.abs(p.t) >= 2.0,
      }
    }

    // Count significant metrics
    let sigCount = 0
    for (const [name, mr] of Object.entries(metricResults)) {
      if (mr.horizonResults[horizon]?.significant) sigCount++
    }
    console.log(`    Significant metrics (|t|>=2): ${sigCount}`)
  }

  // ── Compute cross-horizon summary per metric ──
  console.log('\n[2] Computing cross-horizon metric summaries...')

  for (const [name, mr] of Object.entries(metricResults)) {
    const hrs = Object.values(mr.horizonResults)
    mr.avgAbsR = hrs.reduce((s, h) => s + Math.abs(h.pearson || 0), 0) / hrs.length
    mr.avgAbsSpearman = hrs.reduce((s, h) => s + Math.abs(h.spearman || 0), 0) / hrs.length
    mr.maxAbsR = Math.max(...hrs.map(h => Math.abs(h.pearson || 0)))
    mr.sigCount = hrs.filter(h => h.significant).length
    mr.horizonCount = hrs.length
    mr.coverage = hrs.length > 0 ? hrs[0].n : 0
    // Direction: sign of the strongest correlation
    const strongest = hrs.reduce((best, h) => Math.abs(h.pearson || 0) > Math.abs(best.pearson || 0) ? h : best, hrs[0])
    mr.direction = (strongest?.pearson || 0) >= 0 ? 'positive' : 'negative'
  }

  // ── Rank metrics by cross-sectional predictive power ──
  const rankedMetrics = Object.entries(metricResults)
    .map(([name, mr]) => ({ name, ...mr }))
    .sort((a, b) => b.avgAbsR - a.avgAbsR)

  console.log('\n  ── Top 30 Cross-Sectional Metrics ──')
  console.log('  #    Metric                       Segment              Avg|r|  Max|r|  Sig/Hrz  N    Dir')
  console.log('  ' + '─'.repeat(95))
  for (let i = 0; i < Math.min(30, rankedMetrics.length); i++) {
    const m = rankedMetrics[i]
    console.log(`  ${String(i + 1).padStart(2)}.  ${m.name.padEnd(28)} ${m.segment.padEnd(20)} ${m.avgAbsR.toFixed(3).padStart(7)} ${m.maxAbsR.toFixed(3).padStart(7)}  ${m.sigCount}/${m.horizonCount}      ${String(m.coverage).padStart(3)}  ${m.direction}`)
  }

  // ── Aggregate by segment ──
  console.log('\n[3] Computing segment-level importance...')

  const segments = {}
  for (const m of rankedMetrics) {
    if (!segments[m.segment]) {
      segments[m.segment] = { metrics: [], totalAbsR: 0, sigMetrics: 0, totalMetrics: 0 }
    }
    segments[m.segment].metrics.push(m)
    segments[m.segment].totalAbsR += m.avgAbsR
    segments[m.segment].totalMetrics++
    if (m.sigCount > 0) segments[m.segment].sigMetrics++
  }

  // Compute segment scores (avg correlation * fraction significant)
  const segmentScores = []
  for (const [name, seg] of Object.entries(segments)) {
    const avgR = seg.totalAbsR / seg.totalMetrics
    const sigFrac = seg.sigMetrics / seg.totalMetrics
    // Composite: 70% correlation strength + 30% statistical significance fraction
    const composite = 0.7 * avgR + 0.3 * sigFrac
    segmentScores.push({
      segment: name,
      avgAbsR: avgR,
      sigFrac,
      composite,
      metricCount: seg.totalMetrics,
      sigMetricCount: seg.sigMetrics,
      topMetric: seg.metrics[0],
    })
  }

  segmentScores.sort((a, b) => b.composite - a.composite)

  console.log('\n  ── Segment Importance (Cross-Sectional) ──')
  console.log('  #  Segment              Avg|r|  Sig%   Composite  Metrics  Top Metric')
  console.log('  ' + '─'.repeat(90))
  for (let i = 0; i < segmentScores.length; i++) {
    const s = segmentScores[i]
    console.log(`  ${String(i + 1).padStart(2)}. ${s.segment.padEnd(20)} ${s.avgAbsR.toFixed(3).padStart(7)} ${(s.sigFrac * 100).toFixed(0).padStart(4)}%  ${s.composite.toFixed(4).padStart(8)}  ${String(s.metricCount).padStart(4)}     ${s.topMetric?.name || 'N/A'}`)
  }

  // ── Derive segment weights from composite scores ──
  console.log('\n[4] Deriving segment weights...')

  const totalComposite = segmentScores.reduce((s, seg) => s + seg.composite, 0)
  const segmentWeights = {}
  for (const seg of segmentScores) {
    segmentWeights[seg.segment] = {
      rawWeight: seg.composite / totalComposite,
      avgAbsR: seg.avgAbsR,
      sigFrac: seg.sigFrac,
      metricCount: seg.metricCount,
    }
  }

  console.log('\n  ── Raw Segment Weights (from cross-sectional evidence) ──')
  for (const [name, w] of Object.entries(segmentWeights)) {
    const bar = '█'.repeat(Math.round(w.rawWeight * 100))
    console.log(`  ${name.padEnd(20)} ${(w.rawWeight * 100).toFixed(1).padStart(5)}%  ${bar}`)
  }

  // ── Compute normalization parameters (percentile-based) ──
  console.log('\n[5] Computing normalization parameters (percentile distributions)...')

  const normParams = {}
  for (const metricName of allMetricNames) {
    const values = []
    for (const s of stocks) {
      const v = s.metrics[metricName]
      if (v != null && isFinite(v) && !isNaN(v)) values.push(v)
    }
    if (values.length < 10) continue

    values.sort((a, b) => a - b)
    const p5 = values[Math.floor(values.length * 0.05)]
    const p25 = values[Math.floor(values.length * 0.25)]
    const p50 = values[Math.floor(values.length * 0.50)]
    const p75 = values[Math.floor(values.length * 0.75)]
    const p95 = values[Math.floor(values.length * 0.95)]
    const mean = values.reduce((a, b) => a + b) / values.length
    const std = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length)

    const segment = SEGMENT_MAP[metricName] || 'Unmapped'
    const mr = metricResults[metricName]

    normParams[metricName] = {
      segment,
      n: values.length,
      p5, p25, p50, p75, p95,
      mean, std,
      min: values[0],
      max: values[values.length - 1],
      // Direction: does higher value → higher return?
      direction: mr?.direction || 'unknown',
      avgAbsR: mr?.avgAbsR || 0,
      sigCount: mr?.sigCount || 0,
    }
  }

  console.log(`  Normalization params computed for ${Object.keys(normParams).length} metrics`)

  // ── Select top metrics per segment for the scorecard ──
  console.log('\n[6] Selecting scorecard metrics...')

  const scorecardMetrics = {}
  for (const seg of segmentScores) {
    const segMetrics = seg.segment === 'Unmapped' ? [] : segments[seg.segment].metrics
      .filter(m => normParams[m.name])  // must have normalization data
      .sort((a, b) => b.avgAbsR - a.avgAbsR)
      .slice(0, 8)  // Top 8 per segment

    scorecardMetrics[seg.segment] = segMetrics.map(m => ({
      name: m.name,
      avgAbsR: m.avgAbsR,
      direction: m.direction,
      sigCount: m.sigCount,
      coverage: m.coverage,
    }))
  }

  // ── Save results ──
  const outputDir = resolve(PROJECT_ROOT, 'data/results/cross-sectional')
  mkdirSync(outputDir, { recursive: true })

  const output = {
    date: new Date().toISOString().slice(0, 10),
    universe: {
      name: 'Nifty 50',
      stockCount: stocks.length,
      horizons,
    },
    segmentWeights,
    segmentScores: segmentScores.map(s => ({
      segment: s.segment,
      avgAbsR: s.avgAbsR,
      sigFrac: s.sigFrac,
      composite: s.composite,
      metricCount: s.metricCount,
      sigMetricCount: s.sigMetricCount,
      weight: segmentWeights[s.segment]?.rawWeight,
      topMetric: s.topMetric?.name,
    })),
    metricRankings: rankedMetrics.slice(0, 50).map(m => ({
      name: m.name,
      segment: m.segment,
      avgAbsR: m.avgAbsR,
      maxAbsR: m.maxAbsR,
      direction: m.direction,
      sigCount: m.sigCount,
      horizonCount: m.horizonCount,
      coverage: m.coverage,
    })),
    scorecardMetrics,
    normalizationParams: normParams,
    allMetricCorrelations: Object.fromEntries(
      Object.entries(metricResults).map(([name, mr]) => [name, {
        segment: mr.segment,
        avgAbsR: mr.avgAbsR,
        direction: mr.direction,
        sigCount: mr.sigCount,
        horizonResults: mr.horizonResults,
      }])
    ),
  }

  writeFileSync(resolve(outputDir, 'scorecard-weights.json'), JSON.stringify(output, null, 2))
  console.log(`\n  Results saved: data/results/cross-sectional/scorecard-weights.json`)

  // ── Summary ──
  console.log('\n══════════════════════════════════════════════════════════════')
  console.log('  CROSS-SECTIONAL ANALYSIS COMPLETE')
  console.log('══════════════════════════════════════════════════════════════')
  console.log(`  Universe: ${stocks.length} stocks`)
  console.log(`  Metrics analyzed: ${rankedMetrics.length}`)
  console.log(`  Statistically significant: ${rankedMetrics.filter(m => m.sigCount > 0).length}`)
  console.log(`  Segments: ${segmentScores.length}`)
  console.log('══════════════════════════════════════════════════════════════')
}

main()
