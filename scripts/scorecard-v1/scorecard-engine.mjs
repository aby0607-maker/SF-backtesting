#!/usr/bin/env node
/**
 * Scorecard V1 Engine
 *
 * Produces a composite score (0-100) for any stock with computed metrics.
 *
 * How it works:
 * 1. Each metric is normalized to 0-100 using cross-sectional percentile rank
 *    across the Nifty 50 universe (no arbitrary benchmarks).
 * 2. Direction-aware: if higher metric → higher returns (from correlation),
 *    higher percentile = higher score. If inverse, flip.
 * 3. Within each segment, metrics are weighted by their cross-sectional |correlation|.
 * 4. Segments are weighted by their composite importance score.
 * 5. Final score = weighted sum of segment scores, scaled to 0-100.
 *
 * Usage:
 *   node scripts/scorecard-v1/scorecard-engine.mjs --co_code 5400
 *   node scripts/scorecard-v1/scorecard-engine.mjs --all
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '../..')

// ── Load cross-sectional weights ──
const weightsFile = resolve(PROJECT_ROOT, 'data/results/cross-sectional/scorecard-weights.json')
if (!existsSync(weightsFile)) {
  console.error('ERROR: Run cross-sectional-analysis.mjs first.')
  process.exit(1)
}
const weights = JSON.parse(readFileSync(weightsFile, 'utf8'))
const NORM = weights.normalizationParams
const SEG_WEIGHTS = weights.segmentWeights
const SCORECARD_METRICS = weights.scorecardMetrics
const ALL_CORRELATIONS = weights.allMetricCorrelations

// ── CLI ──
function parseArgs() {
  const args = process.argv.slice(2)
  const opts = { co_code: null, all: false }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--co_code' && args[i + 1]) opts.co_code = args[++i]
    else if (args[i] === '--all') opts.all = true
  }
  return opts
}

/**
 * Normalize a metric value to 0-100 using percentile position
 * within the Nifty 50 cross-sectional distribution.
 *
 * @param {string} metricName - metric identifier
 * @param {number} value - raw metric value
 * @returns {number|null} - score 0-100 (null if no norm data)
 */
function normalizeMetric(metricName, value) {
  const params = NORM[metricName]
  if (!params || value == null || !isFinite(value)) return null

  // Percentile position using linear interpolation between known percentiles
  const { p5, p25, p50, p75, p95, min, max } = params

  // Clamp to [min, max] observed range
  const clamped = Math.max(min, Math.min(max, value))

  // Piecewise linear interpolation across percentile breakpoints
  let percentile
  if (clamped <= p5) {
    percentile = 5 * (clamped - min) / ((p5 - min) || 1)
  } else if (clamped <= p25) {
    percentile = 5 + 20 * (clamped - p5) / ((p25 - p5) || 1)
  } else if (clamped <= p50) {
    percentile = 25 + 25 * (clamped - p25) / ((p50 - p25) || 1)
  } else if (clamped <= p75) {
    percentile = 50 + 25 * (clamped - p50) / ((p75 - p50) || 1)
  } else if (clamped <= p95) {
    percentile = 75 + 20 * (clamped - p75) / ((p95 - p75) || 1)
  } else {
    percentile = 95 + 5 * (clamped - p95) / ((max - p95) || 1)
  }

  percentile = Math.max(0, Math.min(100, percentile))

  // Direction-aware: if metric's correlation with returns is negative,
  // LOWER values are better → flip the score
  const direction = params.direction || 'unknown'
  if (direction === 'negative') {
    return 100 - percentile
  }
  return percentile
}

/**
 * Score a single stock.
 *
 * @param {object} metrics - { metricName: value } from all-metrics.json
 * @returns {object} - { overall, segments: { name: { score, weight, metrics } } }
 */
function scoreStock(metrics) {
  const segmentScores = {}

  for (const [segName, segWeight] of Object.entries(SEG_WEIGHTS)) {
    if (segName === 'Unmapped' || segName === 'Income Statement') continue

    const segMetrics = SCORECARD_METRICS[segName] || []
    if (segMetrics.length === 0) continue

    let weightedSum = 0
    let totalWeight = 0
    const metricDetails = []

    for (const sm of segMetrics) {
      const rawValue = metrics[sm.name]
      const normalizedScore = normalizeMetric(sm.name, rawValue)

      if (normalizedScore == null) continue

      // Weight by |correlation| — stronger predictors matter more
      const metricWeight = sm.avgAbsR || 0.01
      weightedSum += normalizedScore * metricWeight
      totalWeight += metricWeight

      metricDetails.push({
        name: sm.name,
        rawValue: rawValue != null ? +rawValue.toFixed(4) : null,
        normalizedScore: +normalizedScore.toFixed(1),
        weight: +metricWeight.toFixed(4),
        direction: sm.direction,
        significant: sm.sigCount > 0,
      })
    }

    const segScore = totalWeight > 0 ? weightedSum / totalWeight : null

    segmentScores[segName] = {
      score: segScore != null ? +segScore.toFixed(1) : null,
      weight: +(segWeight.rawWeight * 100).toFixed(1),
      metricsUsed: metricDetails.length,
      metricsTotal: segMetrics.length,
      metrics: metricDetails,
    }
  }

  // Composite score: weighted average of segment scores
  let compositeWeightedSum = 0
  let compositeWeightTotal = 0

  for (const [segName, seg] of Object.entries(segmentScores)) {
    if (seg.score == null) continue
    const w = SEG_WEIGHTS[segName]?.rawWeight || 0
    compositeWeightedSum += seg.score * w
    compositeWeightTotal += w
  }

  const overall = compositeWeightTotal > 0
    ? +(compositeWeightedSum / compositeWeightTotal).toFixed(1)
    : null

  return { overall, segments: segmentScores }
}

/**
 * Determine verdict from overall score
 */
function verdict(score) {
  if (score == null) return 'N/A'
  if (score >= 80) return 'STRONG BUY'
  if (score >= 65) return 'BUY'
  if (score >= 50) return 'HOLD'
  if (score >= 35) return 'UNDERPERFORM'
  return 'AVOID'
}

// ── Main ──
function main() {
  const opts = parseArgs()
  const universe = JSON.parse(readFileSync(resolve(PROJECT_ROOT, 'data/nifty50-universe.json'), 'utf8'))

  let stocksToScore = []
  if (opts.all) {
    stocksToScore = universe.stocks
  } else if (opts.co_code) {
    const entry = universe.stocks.find(s => String(s.co_code) === opts.co_code)
    if (entry) stocksToScore = [entry]
    else stocksToScore = [{ co_code: opts.co_code, symbol: `co_${opts.co_code}` }]
  } else {
    console.error('Usage: --co_code <code> or --all')
    process.exit(1)
  }

  console.log('═══════════════════════════════════════════════════════════')
  console.log('  SCORECARD V1 ENGINE')
  console.log('═══════════════════════════════════════════════════════════')

  const allResults = []

  for (const stock of stocksToScore) {
    const resultsFile = resolve(PROJECT_ROOT, `data/results/${stock.co_code}/all-metrics.json`)
    if (!existsSync(resultsFile)) {
      console.log(`  ${stock.symbol}: NO DATA`)
      continue
    }

    const data = JSON.parse(readFileSync(resultsFile, 'utf8'))
    const yearCols = Object.keys(data.annualSnapshots).sort()
    if (yearCols.length === 0) continue

    const latestYC = yearCols[yearCols.length - 1]
    const snap = data.annualSnapshots[latestYC]

    // Merge monthly technicals from latest month
    const latestMonthly = data.monthlySnapshots?.[data.monthlySnapshots.length - 1]
    const mergedMetrics = { ...snap.metrics }
    if (latestMonthly) {
      for (const [k, v] of Object.entries(latestMonthly.metrics)) {
        if (!k.startsWith('_')) mergedMetrics[k] = v
      }
    }

    const result = scoreStock(mergedMetrics)
    result.symbol = stock.symbol
    result.co_code = stock.co_code
    result.sector = stock.sector
    result.date = snap.date
    result.verdict = verdict(result.overall)

    allResults.push(result)
  }

  // Sort by overall score
  allResults.sort((a, b) => (b.overall || 0) - (a.overall || 0))

  // ── Print results ──
  if (allResults.length === 1) {
    // Detailed single-stock output
    const r = allResults[0]
    console.log(`\n  Stock: ${r.symbol} | Date: ${r.date}`)
    console.log(`  ╔══════════════════════════════════════╗`)
    console.log(`  ║  OVERALL SCORE: ${String(r.overall).padStart(5)}/100  ${r.verdict.padEnd(15)} ║`)
    console.log(`  ╚══════════════════════════════════════╝`)

    console.log('\n  ── Segment Breakdown ──')
    const sortedSegs = Object.entries(r.segments)
      .filter(([, s]) => s.score != null)
      .sort((a, b) => b[1].weight - a[1].weight)

    for (const [segName, seg] of sortedSegs) {
      const bar = '█'.repeat(Math.round(seg.score / 5)) + '░'.repeat(20 - Math.round(seg.score / 5))
      console.log(`\n  ${segName} (${seg.weight}% weight) — Score: ${seg.score}/100`)
      console.log(`  [${bar}]`)
      console.log(`  Metrics (${seg.metricsUsed}/${seg.metricsTotal}):`)
      for (const m of seg.metrics) {
        const sig = m.significant ? '*' : ' '
        const dir = m.direction === 'positive' ? '↑' : m.direction === 'negative' ? '↓' : '?'
        console.log(`    ${sig} ${m.name.padEnd(25)} Raw: ${String(m.rawValue ?? 'N/A').padStart(10)}  Score: ${String(m.normalizedScore).padStart(5)}  ${dir}`)
      }
    }
  } else {
    // Ranking table
    console.log(`\n  ── Nifty 50 Scorecard Rankings ──`)
    console.log(`  ${'#'.padStart(3)}  ${'Symbol'.padEnd(15)} ${'Sector'.padEnd(25)} ${'Score'.padStart(6)}  Verdict`)
    console.log('  ' + '─'.repeat(70))

    for (let i = 0; i < allResults.length; i++) {
      const r = allResults[i]
      console.log(`  ${String(i + 1).padStart(3)}. ${r.symbol.padEnd(15)} ${(r.sector || '').padEnd(25)} ${String(r.overall).padStart(6)}  ${r.verdict}`)
    }

    // Segment heatmap
    console.log('\n  ── Segment Score Heatmap (top 10 / bottom 10) ──')
    const segNames = Object.keys(SEG_WEIGHTS).filter(s => s !== 'Unmapped' && s !== 'Income Statement')

    console.log(`  ${'Symbol'.padEnd(15)} ${segNames.map(s => s.slice(0, 6).padStart(7)).join(' ')}`)
    console.log('  ' + '─'.repeat(15 + segNames.length * 8))

    const display = [...allResults.slice(0, 10), null, ...allResults.slice(-10)]
    for (const r of display) {
      if (!r) { console.log('  ' + '·'.repeat(15 + segNames.length * 8)); continue }
      const cells = segNames.map(s => {
        const sc = r.segments[s]?.score
        return sc != null ? String(sc).padStart(7) : '    N/A'
      }).join(' ')
      console.log(`  ${r.symbol.padEnd(15)} ${cells}`)
    }
  }

  // Save all results
  if (allResults.length > 1) {
    const outputDir = resolve(PROJECT_ROOT, 'data/results/cross-sectional')
    mkdirSync(outputDir, { recursive: true })
    writeFileSync(
      resolve(outputDir, 'scorecard-rankings.json'),
      JSON.stringify({
        date: new Date().toISOString().slice(0, 10),
        universe: 'Nifty 50',
        stockCount: allResults.length,
        rankings: allResults.map(r => ({
          symbol: r.symbol,
          co_code: r.co_code,
          sector: r.sector,
          overall: r.overall,
          verdict: r.verdict,
          segments: Object.fromEntries(
            Object.entries(r.segments)
              .filter(([, s]) => s.score != null)
              .map(([name, s]) => [name, { score: s.score, weight: s.weight }])
          ),
        })),
      }, null, 2)
    )
    console.log('\n  Rankings saved: data/results/cross-sectional/scorecard-rankings.json')
  }

  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('  SCORECARD COMPLETE')
  console.log('═══════════════════════════════════════════════════════════')
}

main()
