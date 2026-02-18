/**
 * Core Scoring Engine — Pure calculation functions (no side effects)
 *
 * Scores raw metric values through the full pipeline:
 * Raw Value → Negative Handling → Score Band Lookup → Segment Aggregation
 * → Composite Formula → Normalization → Verdict
 */

import type {
  CompositeMetric,
  NegativeHandling,
  ScoreBand,
  MetricScore,
  ScorecardSegment,
  SegmentResult,
  CompositeFormula,
  NormalizationConfig,
  CustomFactor,
  VerdictThreshold,
  ScorecardVersion,
  StockScoreResult,
  ModelRunResult,
} from '@/types/scoring'
import { computeValuationScore } from './conditionalValuation'

// ─────────────────────────────────────────────────
// Metric Scoring
// ─────────────────────────────────────────────────

// Negative handling score constants (from SME scoring specification):
// These represent fixed score assignments when growth metrics have negative values.
const SCORE_FLOOR = 0         // Worst possible — metric is negative with no improvement
const SCORE_PARTIAL_CREDIT = 25  // Both periods negative but magnitude is improving (25th percentile)
const SCORE_CEILING = 100     // Best possible — turnaround from negative to positive

/**
 * Check if a negative handling rule applies and return the overridden score.
 * Returns null if no rule applies (proceed with normal scoring).
 */
function applyNegativeHandling(
  rawValue: number | null,
  metricId: string,
  negativeRules: NegativeHandling[],
  context?: { startValue?: number; endValue?: number }
): { score: number; excluded: boolean; reason?: string } | null {
  if (!negativeRules.length) return null

  const rulesForMetric = negativeRules.filter(r => r.metricId === metricId)
  if (!rulesForMetric.length) return null

  for (const rule of rulesForMetric) {
    const startNeg = context?.startValue != null && context.startValue < 0
    const endNeg = context?.endValue != null && context.endValue < 0

    let matches = false
    switch (rule.condition) {
      case 'start_negative':
        matches = startNeg && !endNeg
        break
      case 'end_negative':
        matches = endNeg && !startNeg
        break
      case 'both_negative':
        matches = startNeg && endNeg
        break
      case 'any_negative':
        matches = startNeg || endNeg || (rawValue != null && rawValue < 0)
        break
    }

    if (!matches) continue

    switch (rule.action) {
      case 'zero':
        return { score: SCORE_FLOOR, excluded: false, reason: rule.description || `${rule.condition}: score set to 0` }
      case 'max_score':
        return { score: SCORE_CEILING, excluded: false, reason: rule.description || `${rule.condition}: max score applied` }
      case 'exclude':
        return { score: SCORE_FLOOR, excluded: true, reason: rule.description || `${rule.condition}: excluded from scoring` }
      case 'improvement_check':
        // Both negative but improving = partial credit
        if (context?.startValue != null && context?.endValue != null) {
          const improved = Math.abs(context.endValue) < Math.abs(context.startValue)
          return {
            score: improved ? SCORE_PARTIAL_CREDIT : SCORE_FLOOR,
            excluded: false,
            reason: improved
              ? 'Both negative but improving — partial credit'
              : 'Both negative, no improvement'
          }
        }
        return { score: SCORE_FLOOR, excluded: false, reason: 'Improvement check: insufficient data' }
      case 'special_calc':
        // Special calculations are metric-specific; default to floor if no custom formula
        return { score: SCORE_FLOOR, excluded: false, reason: rule.description || 'Special calculation applied' }
      case 'cap':
        // Cap handled at the band lookup level; signal to proceed but cap result
        return null
      case 'custom':
        // Custom formula handling — would need formula engine; default to floor
        return { score: SCORE_FLOOR, excluded: false, reason: rule.description || 'Custom formula applied' }
    }
  }

  return null
}

/**
 * Look up the score for a raw value in the score bands.
 * Bands should be ordered from highest score to lowest (best to worst).
 */
// Cache for pre-sorted score bands to avoid re-sorting on every lookup
const sortedBandsCache = new WeakMap<ScoreBand[], ScoreBand[]>()

function getSortedBands(scoreBands: ScoreBand[]): ScoreBand[] {
  let sorted = sortedBandsCache.get(scoreBands)
  if (!sorted) {
    sorted = [...scoreBands].sort((a, b) => b.score - a.score)
    sortedBandsCache.set(scoreBands, sorted)
  }
  return sorted
}

function lookupScoreBand(rawValue: number, scoreBands: ScoreBand[]): number {
  // Guard: no bands defined → return 0
  if (!scoreBands || scoreBands.length === 0) return 0

  // Sort bands by score descending for priority (cached)
  const sorted = getSortedBands(scoreBands)

  for (const band of sorted) {
    if (rawValue >= band.min && rawValue <= band.max) {
      return band.score
    }
  }

  // If no band matches, find the nearest band
  if (rawValue > sorted[0].max) return sorted[0].score              // Above highest band
  if (rawValue < sorted[sorted.length - 1].min) return sorted[sorted.length - 1].score  // Below lowest band

  console.warn(`[ScoringEngine] No score band matched for value ${rawValue} across ${scoreBands.length} bands — possible gap in band configuration`)
  return 0
}

/**
 * Score a single metric: apply negative rules first, then band lookup.
 *
 * Key ordering: When context is available, check negative handling rules BEFORE
 * the null-exclusion check. Growth metrics return null when the base year is
 * negative (CAGR is mathematically undefined), but context carries start/end
 * values so the negative handling rules can still fire and assign a score
 * (e.g., start_negative → 0, both_negative → improvement_check → 25).
 */
export function scoreMetric(
  rawValue: number | null,
  metric: CompositeMetric,
  negativeRules: NegativeHandling[] = [],
  context?: { startValue?: number; endValue?: number }
): MetricScore {
  const allNegativeRules = [
    ...negativeRules,
    ...(metric.negativeHandling || []),
  ]

  // Check negative handling rules FIRST when context is available.
  // This is critical for growth metrics where rawValue is null due to
  // negative base years — the context tells us WHY it's null.
  if (context && allNegativeRules.length > 0) {
    const negativeResult = applyNegativeHandling(rawValue, metric.id, allNegativeRules, context)
    if (negativeResult) {
      return {
        metricId: metric.id,
        metricName: metric.name,
        rawValue,
        normalizedScore: negativeResult.score,
        isExcluded: negativeResult.excluded,
        excludeReason: negativeResult.reason,
        evidence: context,
      }
    }
  }

  // Null raw value with no applicable negative rule → excluded
  if (rawValue == null) {
    return {
      metricId: metric.id,
      metricName: metric.name,
      rawValue: null,
      normalizedScore: 0,
      isExcluded: true,
      excludeReason: 'No data available',
      evidence: context,
    }
  }

  // Standard negative handling for non-null values
  // Also applies when context was provided but no context-based rule matched
  if (allNegativeRules.length > 0) {
    const negativeResult = applyNegativeHandling(rawValue, metric.id, allNegativeRules, context)
    if (negativeResult) {
      return {
        metricId: metric.id,
        metricName: metric.name,
        rawValue,
        normalizedScore: negativeResult.score,
        isExcluded: negativeResult.excluded,
        excludeReason: negativeResult.reason,
        evidence: context,
      }
    }
  }

  // Standard score band lookup
  const score = lookupScoreBand(rawValue, metric.scoreBands)

  return {
    metricId: metric.id,
    metricName: metric.name,
    rawValue,
    normalizedScore: score,
    isExcluded: false,
    evidence: context,
  }
}

// ─────────────────────────────────────────────────
// Segment Scoring
// ─────────────────────────────────────────────────

/**
 * Score a segment by aggregating its metric scores (weighted average).
 */
export function scoreSegment(
  metricScores: MetricScore[],
  segment: ScorecardSegment
): SegmentResult {
  // Filter out excluded metrics
  const activeScores = metricScores.filter(ms => !ms.isExcluded)

  if (activeScores.length === 0) {
    return {
      segmentId: segment.id,
      segmentName: segment.name,
      metricScores,
      segmentScore: 0,
      verdict: 'N/A',
    }
  }

  // Build weight map from segment metrics
  const weightMap = new Map<string, number>()
  let totalWeight = 0
  for (const metric of segment.metrics) {
    const weight = metric.weight ?? (1 / segment.metrics.length)
    weightMap.set(metric.id, weight)
    // Only count weight for active (non-excluded) metrics
    if (activeScores.some(s => s.metricId === metric.id)) {
      totalWeight += weight
    }
  }

  // Weighted average (re-normalize weights for active metrics only)
  let weightedSum = 0
  for (const score of activeScores) {
    const weight = weightMap.get(score.metricId) ?? 0
    const normalizedWeight = totalWeight > 0 ? weight / totalWeight : 0
    weightedSum += score.normalizedScore * normalizedWeight
  }

  const segmentScore = Math.round(weightedSum * 100) / 100

  // Apply per-segment verdict if thresholds exist
  let verdict: string | undefined
  let verdictColor: string | undefined
  if (segment.verdictThresholds?.length) {
    const v = getVerdict(segmentScore, segment.verdictThresholds)
    verdict = v.verdict
    verdictColor = v.color
  }

  return {
    segmentId: segment.id,
    segmentName: segment.name,
    metricScores,
    segmentScore,
    verdict,
    verdictColor,
  }
}

/**
 * Score the valuation segment using PB-anchored conditional weights (V2.2 CSV spec).
 *
 * Instead of the standard proportional weight redistribution, applies exact
 * conditional weights based on raw PE/PB/EV thresholds:
 *   PB > 30       → Entire valuation NA (unreliable)
 *   PE > 75 & EV > 35 → PB only (100%)
 *   PE > 75       → PB=60% + EV=40%
 *   EV > 35       → PB=60% + PE=40%
 *   Default       → PE=30%, PB=50%, EV=20%
 */
function scoreValuationSegmentConditional(
  metricScores: MetricScore[],
  segment: ScorecardSegment,
  stockData: Record<string, number | null>
): SegmentResult {
  // Extract scored metrics — pass null for excluded ones so computeValuationScore
  // treats them as "not available" rather than "score 0"
  const pe = metricScores.find(m => m.metricId === 'v2_pe_vs_5y')
  const pb = metricScores.find(m => m.metricId === 'v2_pb_vs_5y')
  const ev = metricScores.find(m => m.metricId === 'v2_ev_vs_5y')

  const result = computeValuationScore({
    peScore: pe && !pe.isExcluded ? pe.normalizedScore : null,
    pbScore: pb && !pb.isExcluded ? pb.normalizedScore : null,
    evScore: ev && !ev.isExcluded ? ev.normalizedScore : null,
    rawPE: stockData['raw_pe'] ?? null,
    rawPB: stockData['raw_pb'] ?? null,
    rawEV: stockData['raw_ev'] ?? null,
  })

  const segmentScore = result.isNA ? 0 : Math.round(result.score * 100) / 100

  // Apply per-segment verdict thresholds
  let verdict: string | undefined = result.isNA ? 'N/A' : undefined
  let verdictColor: string | undefined
  if (!result.isNA && segment.verdictThresholds?.length) {
    const v = getVerdict(segmentScore, segment.verdictThresholds)
    verdict = v.verdict
    verdictColor = v.color
  }

  return {
    segmentId: segment.id,
    segmentName: segment.name,
    metricScores,
    segmentScore,
    verdict,
    verdictColor,
    naReason: result.isNA ? result.condition : undefined,
  }
}

// ─────────────────────────────────────────────────
// Composite Score
// ─────────────────────────────────────────────────

/**
 * Compute the composite score from segment results using the formula.
 *
 * Formula structure:
 *   (base_segment_1 × w1 + base_segment_2 × w2) × baseWeight
 *   + overlay_segment_1 × ow1 + overlay_segment_2 × ow2
 */
export function computeComposite(
  segmentResults: SegmentResult[],
  formula: CompositeFormula
): number {
  const scoreMap = new Map<string, number>()
  for (const sr of segmentResults) {
    scoreMap.set(sr.segmentId, sr.segmentScore)
  }

  // Base segments: weighted sum
  let baseSum = 0
  for (const { segmentId, weight } of formula.baseSegments) {
    const segScore = scoreMap.get(segmentId) ?? 0
    baseSum += segScore * weight
  }

  // Apply base weight
  let composite = baseSum * formula.baseWeight

  // Overlay segments: added directly
  if (formula.overlaySegments) {
    for (const { segmentId, weight } of formula.overlaySegments) {
      const segScore = scoreMap.get(segmentId) ?? 0
      composite += segScore * weight
    }
  }

  // Clamp to 0-100
  return Math.min(100, Math.max(0, Math.round(composite * 100) / 100))
}

// ─────────────────────────────────────────────────
// Normalization
// ─────────────────────────────────────────────────

/**
 * Apply normalization to an array of composite scores.
 * Pluggable: supports multiple methods (defer z-score/percentile for later).
 */
export function applyNormalization(
  scores: number[],
  config: NormalizationConfig
): number[] {
  if (scores.length === 0) return []

  switch (config.method) {
    case 'none':
      return scores

    case 'min-max': {
      const min = Math.min(...scores)
      const max = Math.max(...scores)
      if (max === min) return scores.map(() => 50)
      return scores.map(s =>
        Math.round(((s - min) / (max - min)) * 100 * 100) / 100
      )
    }

    case 'z-score': {
      const mean = scores.reduce((a, b) => a + b, 0) / scores.length
      const stdDev = Math.sqrt(
        scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / scores.length
      )
      if (stdDev === 0) return scores.map(() => 50)
      // Convert z-scores to 0-100 range (assume ±3 std devs)
      return scores.map(s => {
        const z = (s - mean) / stdDev
        const normalized = ((z + 3) / 6) * 100
        return Math.min(100, Math.max(0, Math.round(normalized * 100) / 100))
      })
    }

    case 'percentile': {
      // Cumulative proportion method: percentile = count(v <= x) / n * 100
      // Max value always gets 100%. Tied values share the same percentile.
      // For n=1, returns 100%. For the minimum of n, returns (1/n)*100.
      const sorted = [...scores].sort((a, b) => a - b)
      return scores.map(s => {
        const rank = sorted.filter(v => v <= s).length
        return Math.round((rank / sorted.length) * 100 * 100) / 100
      })
    }

    case 'custom':
      // Custom normalization — pass through for now
      return scores

    default:
      return scores
  }
}

// ─────────────────────────────────────────────────
// Custom Factors
// ─────────────────────────────────────────────────

/**
 * Apply custom factors (multipliers, additive, conditional) to a composite score.
 * Clamps to [0, 100] after each factor to prevent intermediate spikes
 * from distorting subsequent factor calculations.
 */
export function applyCustomFactors(
  score: number,
  factors: CustomFactor[]
): number {
  let result = score

  for (const factor of factors) {
    // Skip factors that target a specific segment/metric (applied elsewhere)
    if (factor.appliesTo) continue

    switch (factor.type) {
      case 'multiplier':
        result *= factor.value
        break
      case 'additive':
        result += factor.value
        break
      case 'conditional':
        // Conditional factors could be complex — basic implementation
        // e.g., if score < 30, apply penalty
        if (result < 30) result += factor.value
        break
    }

    // Clamp after each factor to prevent intermediate values outside [0, 100]
    // from compounding through subsequent factors
    result = Math.min(100, Math.max(0, result))
  }

  return Math.round(result * 100) / 100
}

// ─────────────────────────────────────────────────
// Verdict
// ─────────────────────────────────────────────────

/**
 * Get the verdict for a score based on thresholds.
 */
export function getVerdict(
  score: number,
  thresholds: VerdictThreshold[]
): { verdict: string; altVerdict?: string; color: string; description?: string } {
  // Sort by minScore descending — match highest first
  const sorted = [...thresholds].sort((a, b) => b.minScore - a.minScore)

  for (const t of sorted) {
    if (score >= t.minScore && score <= t.maxScore) {
      return {
        verdict: t.verdict,
        altVerdict: t.altVerdict,
        color: t.color,
        description: t.description,
      }
    }
  }

  // Fallback: lowest threshold
  const fallback = sorted[sorted.length - 1]
  return {
    verdict: fallback?.verdict ?? 'N/A',
    altVerdict: fallback?.altVerdict,
    color: fallback?.color ?? 'text-neutral-400',
  }
}

// ─────────────────────────────────────────────────
// Stock-Level Scoring
// ─────────────────────────────────────────────────

/**
 * Score a single stock against a full scorecard.
 *
 * @param stockData - Map of metricId → rawValue for this stock
 * @param scorecard - Full scorecard version with all config
 * @param stockInfo - Basic stock information
 * @param metricContext - Optional per-metric context (start/end values for negative handling)
 */
export function scoreStock(
  stockData: Record<string, number | null>,
  scorecard: ScorecardVersion,
  stockInfo: { id: string; name: string; symbol: string; sector: string; marketCap: number },
  metricContext?: Record<string, { startValue?: number; endValue?: number }>
): Omit<StockScoreResult, 'rank'> {
  // Score each segment
  const segmentResults: SegmentResult[] = scorecard.segments.map(segment => {
    const metricScores: MetricScore[] = segment.metrics.map(metric => {
      const rawValue = stockData[metric.id] ?? null
      const context = metricContext?.[metric.id]
      return scoreMetric(rawValue, metric, scorecard.negativeHandlingRules, context)
    })
    // Use PB-anchored conditional weights for valuation segment (V2.2 CSV spec)
    if (segment.id === 'v2_valuation') {
      return scoreValuationSegmentConditional(metricScores, segment, stockData)
    }

    return scoreSegment(metricScores, segment)
  })

  // Compute composite
  const rawComposite = computeComposite(segmentResults, scorecard.compositeFormula)

  // Apply custom factors
  const adjustedScore = applyCustomFactors(rawComposite, scorecard.customFactors)

  // Get verdict
  const { verdict, color } = getVerdict(adjustedScore, scorecard.verdictThresholds)

  return {
    stockId: stockInfo.id,
    stockName: stockInfo.name,
    stockSymbol: stockInfo.symbol,
    sector: stockInfo.sector,
    marketCap: stockInfo.marketCap,
    segmentResults,
    rawComposite,
    normalizedScore: adjustedScore,  // Pre-normalization; will be updated by scoreUniverse
    verdict,
    verdictColor: color,
  }
}

// ─────────────────────────────────────────────────
// Universe-Level Scoring
// ─────────────────────────────────────────────────

/**
 * Score and rank an entire universe of stocks.
 */
export function scoreUniverse(
  stocksData: Array<{
    data: Record<string, number | null>
    info: { id: string; name: string; symbol: string; sector: string; marketCap: number }
    context?: Record<string, { startValue?: number; endValue?: number }>
  }>,
  scorecard: ScorecardVersion
): ModelRunResult {
  // Score each stock
  const unsortedResults = stocksData.map(stock =>
    scoreStock(stock.data, scorecard, stock.info, stock.context)
  )

  // Apply normalization across all composite scores
  const rawScores = unsortedResults.map(r => r.rawComposite)
  const normalizedScores = applyNormalization(rawScores, scorecard.normalization)

  // Update normalized scores and re-compute verdicts
  const resultsWithNorm = unsortedResults.map((r, i) => {
    const normalizedScore = normalizedScores[i]
    const { verdict, color } = getVerdict(normalizedScore, scorecard.verdictThresholds)
    return {
      ...r,
      normalizedScore,
      verdict,
      verdictColor: color,
    }
  })

  // Sort by normalized score descending and assign ranks
  const sorted = [...resultsWithNorm].sort((a, b) => b.normalizedScore - a.normalizedScore)
  const rankedResults: StockScoreResult[] = sorted.map((r, i) => ({
    ...r,
    rank: i + 1,
  }))

  return {
    scorecardId: scorecard.id,
    scorecardVersion: scorecard.versionInfo.displayVersion,
    stocks: rankedResults,
    rankedList: rankedResults.map(r => r.stockId),
    runTimestamp: Date.now(),
    universeSize: rankedResults.length,
  }
}
