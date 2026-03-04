#!/usr/bin/env node
/**
 * Multi-Period Cross-Sectional Analysis
 *
 * Tests the scorecard across different holding periods:
 * - 5Y: March 2021 metrics → price change to Feb/March 2026
 * - 3Y: March 2023 metrics → price change to Feb/March 2026
 * - 1Y: March 2025 metrics → price change to ~March 2026 (existing)
 *
 * For each period, computes cross-sectional correlations, derives segment
 * weights, and validates via quintile backtesting.
 *
 * Usage: node scripts/scorecard-v1/multi-period-analysis.mjs
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '../..')
const RESULTS_DIR = resolve(PROJECT_ROOT, 'data/results')
const CACHE_DIR = resolve(PROJECT_ROOT, 'data/api-cache')

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

// ── OHLCV helpers ──
function loadOHLCV(co_code) {
  const file = resolve(CACHE_DIR, String(co_code), 'ohlcv.json')
  if (!existsSync(file)) return []
  const raw = JSON.parse(readFileSync(file, 'utf8'))
  const data = raw.data || raw
  if (!Array.isArray(data)) return []
  return data.map(r => ({
    date: (r.Tradedate || r.tradedate || '').slice(0, 10),
    close: r.Dayclose || r.dayclose || 0,
  })).sort((a, b) => a.date.localeCompare(b.date))
}

function priceAt(ohlcv, targetDate) {
  let best = null, bestDiff = Infinity
  for (const r of ohlcv) {
    const diff = Math.abs(new Date(r.date) - new Date(targetDate))
    if (diff < bestDiff) { bestDiff = diff; best = r }
  }
  // Only accept if within 10 days
  if (best && bestDiff < 10 * 86400000) return best
  return null
}

// ── Load all stock data ──
function loadUniverse() {
  const universe = JSON.parse(readFileSync(resolve(PROJECT_ROOT, 'data/nifty50-universe.json'), 'utf8'))
  const stocks = []

  for (const entry of universe.stocks) {
    const file = resolve(RESULTS_DIR, String(entry.co_code), 'all-metrics.json')
    if (!existsSync(file)) continue

    const data = JSON.parse(readFileSync(file, 'utf8'))
    const ohlcv = loadOHLCV(entry.co_code)

    stocks.push({
      symbol: entry.symbol,
      co_code: entry.co_code,
      sector: entry.sector,
      annualSnapshots: data.annualSnapshots,
      segmentMap: data.segmentMap,
      ohlcv,
    })
  }

  return stocks
}

// ── Cross-sectional analysis for a specific base period ──
function analyzePeriod(stocks, baseYearCol, targetDate, periodLabel) {
  console.log(`\n${'═'.repeat(70)}`)
  console.log(`  PERIOD: ${periodLabel}`)
  console.log(`  Base: ${baseYearCol} → Target: ${targetDate}`)
  console.log('═'.repeat(70))

  // Build cross-sectional dataset: metrics at baseYearCol, forward return to targetDate
  const crossSection = []

  for (const stock of stocks) {
    const snap = stock.annualSnapshots[baseYearCol]
    if (!snap) continue

    // Compute forward return from base snapshot date to target date
    const basePrice = priceAt(stock.ohlcv, snap.date)
    const targetPrice = priceAt(stock.ohlcv, targetDate)

    if (!basePrice || !targetPrice) continue

    const forwardReturn = ((targetPrice.close - basePrice.close) / basePrice.close) * 100

    crossSection.push({
      symbol: stock.symbol,
      sector: stock.sector,
      metrics: snap.metrics,
      baseDate: basePrice.date,
      basePrice: basePrice.close,
      targetDate: targetPrice.date,
      targetPrice: targetPrice.close,
      forwardReturn,
      segmentMap: stock.segmentMap,
    })
  }

  console.log(`  Stocks with both metrics and prices: ${crossSection.length}`)

  if (crossSection.length < 10) {
    console.log('  INSUFFICIENT DATA — skipping')
    return null
  }

  // Show return distribution
  const returns = crossSection.map(s => s.forwardReturn).sort((a, b) => a - b)
  const avgReturn = returns.reduce((a, b) => a + b) / returns.length
  const medReturn = returns[Math.floor(returns.length / 2)]
  console.log(`  Return distribution: avg=${avgReturn.toFixed(1)}%, median=${medReturn.toFixed(1)}%, min=${returns[0].toFixed(1)}%, max=${returns[returns.length-1].toFixed(1)}%`)

  // Get segment map from first stock
  const SEGMENT_MAP = crossSection[0].segmentMap || {}

  // Collect all metric names
  const allMetricNames = new Set()
  for (const s of crossSection) {
    for (const k of Object.keys(s.metrics)) {
      if (!k.startsWith('_')) allMetricNames.add(k)
    }
  }

  // Correlate each metric with forward return
  const fwdReturns = crossSection.map(s => s.forwardReturn)
  const metricResults = {}

  for (const metricName of allMetricNames) {
    const pairs = []
    for (let i = 0; i < crossSection.length; i++) {
      const val = crossSection[i].metrics[metricName]
      if (val != null && isFinite(val) && !isNaN(val)) {
        pairs.push({ metric: val, ret: fwdReturns[i] })
      }
    }

    if (pairs.length < 10) continue

    const x = pairs.map(p => p.metric)
    const y = pairs.map(p => p.ret)
    const p = pearson(x, y)
    const s = spearman(x, y)

    metricResults[metricName] = {
      segment: SEGMENT_MAP[metricName] || 'Unmapped',
      pearson: p.r,
      spearman: s.r,
      tStat: p.t,
      n: p.n,
      significant: Math.abs(p.t) >= 2.0,
      direction: (p.r || 0) >= 0 ? 'positive' : 'negative',
    }
  }

  // Rank metrics
  const rankedMetrics = Object.entries(metricResults)
    .map(([name, mr]) => ({ name, ...mr }))
    .sort((a, b) => Math.abs(b.pearson || 0) - Math.abs(a.pearson || 0))

  const sigCount = rankedMetrics.filter(m => m.significant).length
  console.log(`  Metrics analyzed: ${rankedMetrics.length}, significant: ${sigCount}`)

  // Top 25 metrics
  console.log(`\n  ── Top 25 Metrics (${periodLabel}) ──`)
  console.log('  #    Metric                       Segment              Pearson  Spearman  t-stat   N   Sig')
  console.log('  ' + '─'.repeat(95))
  for (let i = 0; i < Math.min(25, rankedMetrics.length); i++) {
    const m = rankedMetrics[i]
    const sig = m.significant ? '***' : '   '
    console.log(`  ${String(i + 1).padStart(2)}.  ${m.name.padEnd(28)} ${m.segment.padEnd(20)} ${(m.pearson||0).toFixed(3).padStart(7)}  ${(m.spearman||0).toFixed(3).padStart(8)}  ${(m.tStat||0).toFixed(2).padStart(6)}  ${String(m.n).padStart(3)}  ${sig}`)
  }

  // Aggregate by segment
  const segments = {}
  for (const m of rankedMetrics) {
    if (!segments[m.segment]) {
      segments[m.segment] = { metrics: [], totalAbsR: 0, sigMetrics: 0 }
    }
    segments[m.segment].metrics.push(m)
    segments[m.segment].totalAbsR += Math.abs(m.pearson || 0)
    if (m.significant) segments[m.segment].sigMetrics++
  }

  const segmentScores = []
  for (const [name, seg] of Object.entries(segments)) {
    if (name === 'Unmapped') continue
    const avgR = seg.totalAbsR / seg.metrics.length
    const sigFrac = seg.sigMetrics / seg.metrics.length
    const composite = 0.7 * avgR + 0.3 * sigFrac
    segmentScores.push({
      segment: name,
      avgAbsR: avgR,
      sigFrac,
      composite,
      metricCount: seg.metrics.length,
      sigMetricCount: seg.sigMetrics,
      topMetric: seg.metrics[0]?.name,
      topMetricR: seg.metrics[0]?.pearson,
    })
  }
  segmentScores.sort((a, b) => b.composite - a.composite)

  const totalComposite = segmentScores.reduce((s, seg) => s + seg.composite, 0)

  console.log(`\n  ── Segment Weights (${periodLabel}) ──`)
  console.log('  #  Segment              Weight   Avg|r|  Sig%   Top Metric (r)')
  console.log('  ' + '─'.repeat(85))
  for (let i = 0; i < segmentScores.length; i++) {
    const s = segmentScores[i]
    const weight = ((s.composite / totalComposite) * 100).toFixed(1)
    const bar = '█'.repeat(Math.round(weight))
    console.log(`  ${String(i + 1).padStart(2)}. ${s.segment.padEnd(20)} ${weight.padStart(5)}%  ${s.avgAbsR.toFixed(3).padStart(7)}  ${(s.sigFrac * 100).toFixed(0).padStart(4)}%   ${(s.topMetric || 'N/A').padEnd(25)} (${(s.topMetricR||0).toFixed(3)})  ${bar}`)
  }

  // ── Quintile backtest ──
  console.log(`\n  ── Quintile Backtest (${periodLabel}) ──`)

  // Score each stock using this period's correlations
  const stockScores = []
  for (const cs of crossSection) {
    let weightedSum = 0, totalWeight = 0

    for (const seg of segmentScores) {
      const segWeight = seg.composite / totalComposite
      const segMetrics = segments[seg.segment].metrics.slice(0, 8)

      let segWeightedSum = 0, segTotalWeight = 0
      for (const m of segMetrics) {
        const val = cs.metrics[m.name]
        if (val == null || !isFinite(val)) continue

        // Percentile rank within this cross-section
        const allVals = crossSection.map(s => s.metrics[m.name]).filter(v => v != null && isFinite(v)).sort((a, b) => a - b)
        const rank = allVals.indexOf(allVals.find(v => v >= val))
        let pctile = (rank / (allVals.length - 1)) * 100

        // Direction-aware
        if (m.direction === 'negative') pctile = 100 - pctile

        const metricWeight = Math.abs(m.pearson || 0.01)
        segWeightedSum += pctile * metricWeight
        segTotalWeight += metricWeight
      }

      if (segTotalWeight > 0) {
        const segScore = segWeightedSum / segTotalWeight
        weightedSum += segScore * segWeight
        totalWeight += segWeight
      }
    }

    const score = totalWeight > 0 ? weightedSum / totalWeight : 50
    stockScores.push({
      symbol: cs.symbol,
      sector: cs.sector,
      score,
      forwardReturn: cs.forwardReturn,
      basePrice: cs.basePrice,
      targetPrice: cs.targetPrice,
    })
  }

  stockScores.sort((a, b) => b.score - a.score)

  // Quintile analysis
  const qSize = Math.floor(stockScores.length / 5)
  const quintiles = []
  for (let i = 0; i < 5; i++) {
    const slice = stockScores.slice(i * qSize, (i + 1) * qSize)
    const avgRet = slice.reduce((s, r) => s + r.forwardReturn, 0) / slice.length
    const avgScore = slice.reduce((s, r) => s + r.score, 0) / slice.length
    const medRet = [...slice].sort((a, b) => a.forwardReturn - b.forwardReturn)[Math.floor(slice.length / 2)].forwardReturn
    quintiles.push({
      quintile: `Q${i + 1}`,
      avgScore: avgScore.toFixed(1),
      avgReturn: avgRet.toFixed(1),
      medReturn: medRet.toFixed(1),
      n: slice.length,
      stocks: slice.map(s => s.symbol),
    })
  }

  console.log('  Quintile  Avg Score  Avg Return  Med Return  N  Stocks')
  console.log('  ' + '─'.repeat(80))
  for (const q of quintiles) {
    const retSign = parseFloat(q.avgReturn) >= 0 ? '+' : ''
    const bar = '█'.repeat(Math.max(0, Math.round(parseFloat(q.avgReturn) / 5)))
    console.log(`  ${q.quintile}       ${q.avgScore.padStart(6)}    ${retSign}${q.avgReturn.padStart(7)}%  ${q.medReturn.padStart(10)}%  ${String(q.n).padStart(2)}  ${q.stocks.join(', ')}`)
  }

  // Q1-Q5 spread
  const q1Ret = parseFloat(quintiles[0].avgReturn)
  const q5Ret = parseFloat(quintiles[4].avgReturn)
  const spread = q1Ret - q5Ret
  console.log(`\n  Q1-Q5 Spread: ${spread > 0 ? '+' : ''}${spread.toFixed(1)}pp`)
  console.log(`  Signal strength: ${Math.abs(spread) > 20 ? 'STRONG' : Math.abs(spread) > 10 ? 'MODERATE' : 'WEAK'}`)

  // Top/bottom 5 stocks
  console.log(`\n  Top 5 picks:`)
  for (const s of stockScores.slice(0, 5)) {
    console.log(`    ${s.symbol.padEnd(15)} Score: ${s.score.toFixed(1)}  Return: ${s.forwardReturn >= 0 ? '+' : ''}${s.forwardReturn.toFixed(1)}%`)
  }
  console.log(`  Bottom 5:`)
  for (const s of stockScores.slice(-5)) {
    console.log(`    ${s.symbol.padEnd(15)} Score: ${s.score.toFixed(1)}  Return: ${s.forwardReturn >= 0 ? '+' : ''}${s.forwardReturn.toFixed(1)}%`)
  }

  return {
    period: periodLabel,
    baseYearCol,
    targetDate,
    stockCount: crossSection.length,
    avgReturn: avgReturn,
    sigMetrics: sigCount,
    totalMetrics: rankedMetrics.length,
    segmentWeights: Object.fromEntries(
      segmentScores.map(s => [s.segment, {
        weight: s.composite / totalComposite,
        avgAbsR: s.avgAbsR,
        sigFrac: s.sigFrac,
        metricCount: s.metricCount,
        topMetric: s.topMetric,
        topMetricR: s.topMetricR,
      }])
    ),
    topMetrics: rankedMetrics.slice(0, 30).map(m => ({
      name: m.name,
      segment: m.segment,
      pearson: m.pearson,
      spearman: m.spearman,
      tStat: m.tStat,
      n: m.n,
      significant: m.significant,
      direction: m.direction,
    })),
    quintileBacktest: quintiles,
    q1q5Spread: spread,
    stockScores: stockScores.map(s => ({
      symbol: s.symbol,
      score: +s.score.toFixed(1),
      forwardReturn: +s.forwardReturn.toFixed(1),
    })),
  }
}

// ── Main ──
function main() {
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('  MULTI-PERIOD CROSS-SECTIONAL ANALYSIS')
  console.log('  Testing scorecard over 1Y, 3Y, and 5Y holding periods')
  console.log('═══════════════════════════════════════════════════════════════')

  const stocks = loadUniverse()
  console.log(`\n  Universe: ${stocks.length} stocks loaded`)

  // Define periods
  // All target ~Feb/March 2026 (latest available OHLCV date)
  const TARGET_DATE = '2026-02-28'

  const periods = [
    { baseYC: 'Y202103', target: TARGET_DATE, label: '5Y (Mar 2021 → Feb 2026)' },
    { baseYC: 'Y202303', target: TARGET_DATE, label: '3Y (Mar 2023 → Feb 2026)' },
    { baseYC: 'Y202503', target: TARGET_DATE, label: '1Y (Mar 2025 → Feb 2026)' },
  ]

  const allPeriodResults = []

  for (const period of periods) {
    const result = analyzePeriod(stocks, period.baseYC, period.target, period.label)
    if (result) allPeriodResults.push(result)
  }

  // ── Cross-period comparison ──
  console.log('\n' + '═'.repeat(70))
  console.log('  CROSS-PERIOD COMPARISON')
  console.log('═'.repeat(70))

  // Compare segment weights across periods
  const allSegments = new Set()
  for (const r of allPeriodResults) {
    for (const seg of Object.keys(r.segmentWeights)) allSegments.add(seg)
  }

  console.log('\n  ── Segment Weight Stability ──')
  console.log(`  ${'Segment'.padEnd(22)} ${allPeriodResults.map(r => r.period.slice(0, 2).padStart(8)).join(' ')}   Delta`)
  console.log('  ' + '─'.repeat(60))
  for (const seg of [...allSegments].sort()) {
    const weights = allPeriodResults.map(r => (r.segmentWeights[seg]?.weight || 0) * 100)
    const delta = weights.length >= 2 ? Math.max(...weights) - Math.min(...weights) : 0
    const stable = delta < 5 ? '  STABLE' : delta < 10 ? '  MODERATE' : '  VOLATILE'
    console.log(`  ${seg.padEnd(22)} ${weights.map(w => w.toFixed(1).padStart(7) + '%').join(' ')}   ${delta.toFixed(1).padStart(5)}pp${stable}`)
  }

  // Compare quintile backtests
  console.log('\n  ── Q1-Q5 Spread Across Periods ──')
  for (const r of allPeriodResults) {
    const spread = r.q1q5Spread
    const bar = '█'.repeat(Math.max(0, Math.round(Math.abs(spread) / 3)))
    const sign = spread >= 0 ? '+' : ''
    console.log(`  ${r.period.padEnd(30)} ${sign}${spread.toFixed(1).padStart(7)}pp  ${bar}  ${Math.abs(spread) > 20 ? 'STRONG' : Math.abs(spread) > 10 ? 'MODERATE' : 'WEAK'}`)
  }

  // Identify metrics that are significant across ALL periods
  console.log('\n  ── Metrics Significant Across ALL Periods ──')
  const metricSigCounts = {}
  for (const r of allPeriodResults) {
    for (const m of r.topMetrics) {
      if (m.significant) {
        metricSigCounts[m.name] = (metricSigCounts[m.name] || { count: 0, directions: [], rs: [] })
        metricSigCounts[m.name].count++
        metricSigCounts[m.name].directions.push(m.direction)
        metricSigCounts[m.name].rs.push(m.pearson)
        metricSigCounts[m.name].segment = m.segment
      }
    }
  }

  const consistentMetrics = Object.entries(metricSigCounts)
    .filter(([, v]) => v.count >= 2)
    .sort((a, b) => b[1].count - a[1].count)

  console.log(`  ${'Metric'.padEnd(28)} ${'Segment'.padEnd(20)} Periods  Direction      Correlations`)
  console.log('  ' + '─'.repeat(95))
  for (const [name, info] of consistentMetrics) {
    const dirConsistent = new Set(info.directions).size === 1 ? info.directions[0] : 'MIXED'
    const rs = info.rs.map(r => r.toFixed(3)).join(', ')
    console.log(`  ${name.padEnd(28)} ${info.segment.padEnd(20)} ${info.count}/${allPeriodResults.length}      ${dirConsistent.padEnd(12)}   ${rs}`)
  }

  // ── Derive BLENDED weights (average across periods, favoring consistent signals) ──
  console.log('\n  ── Blended Segment Weights (period-averaged) ──')
  const blendedWeights = {}
  for (const seg of allSegments) {
    const weights = allPeriodResults.map(r => r.segmentWeights[seg]?.weight || 0)
    blendedWeights[seg] = weights.reduce((a, b) => a + b) / weights.length
  }
  // Re-normalize
  const blendTotal = Object.values(blendedWeights).reduce((a, b) => a + b, 0)
  for (const seg of Object.keys(blendedWeights)) {
    blendedWeights[seg] /= blendTotal
  }

  const sortedBlended = Object.entries(blendedWeights).sort((a, b) => b[1] - a[1])
  for (const [seg, w] of sortedBlended) {
    const bar = '█'.repeat(Math.round(w * 100))
    console.log(`  ${seg.padEnd(22)} ${(w * 100).toFixed(1).padStart(5)}%  ${bar}`)
  }

  // Save all results
  const outputDir = resolve(PROJECT_ROOT, 'data/results/cross-sectional')
  mkdirSync(outputDir, { recursive: true })

  const output = {
    date: new Date().toISOString().slice(0, 10),
    targetDate: TARGET_DATE,
    periods: allPeriodResults,
    blendedWeights,
    consistentMetrics: Object.fromEntries(consistentMetrics),
  }

  writeFileSync(resolve(outputDir, 'multi-period-analysis.json'), JSON.stringify(output, null, 2))
  console.log(`\n  Results saved: data/results/cross-sectional/multi-period-analysis.json`)

  console.log('\n' + '═'.repeat(70))
  console.log('  MULTI-PERIOD ANALYSIS COMPLETE')
  console.log('═'.repeat(70))
}

main()
