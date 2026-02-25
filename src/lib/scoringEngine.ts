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
// VPT Two-Input Conditional Scoring (V2.2 CSV spec)
// ─────────────────────────────────────────────────

/**
 * Score VPT using two inputs: volume change ratio and price change %.
 * volume_change = avg(5D vol) / avg(50D vol) — ratio, >1 means above-avg volume
 * price_change = 5D price change %
 *
 * Returns score on 10x scale (0-80) for compatibility with weighted average math.
 * TODO-SME: Rule for true neutral (price≈0, vol<1) simplified to score 30. Verify with Vishal.
 */
export function scoreVPT(vol: number, price: number): number {
  if (price <= -3 && vol < 1)  return 0   // Bearish, below-avg volume
  if (price <= -3 && vol >= 1) return 10  // Distribution (vol-confirmed decline)
  if (price < 0 && vol >= 1)   return 10  // Mild distribution
  if (price < 0 && vol < 1)    return 30  // Light selling, low conviction
  if (price > 5 && vol < 1)    return 20  // Hollow rally (price up, vol not confirming)
  if (price > 0 && price < 2 && vol >= 1) return 80 // Strong accumulation
  if (price >= 2 && vol >= 1)  return 30  // Rally, volume/price mismatch
  if (price > 0 && vol < 1)    return 30  // Light buying
  return 30 // Fallback: near-zero/flat
}

/**
 * Score VPT using V4 rules — cleaner structure, 0-100 scale.
 * vol = avg(5D vol) / avg(50D vol) — ratio, >1 means above-avg volume
 * price = 5D price change %
 *
 * Rules (from CSV, converted to 0-100):
 *   Vol > 1.5 & Price < -2%  → 0   (heavy selling)
 *   Vol > 1.5 & Price > +2%  → 100 (strong accumulation)
 *   Vol > 1.0 & Price < -1%  → 10  (distribution)
 *   Vol 1.2-1.5 & Price 0-2% → 80  (quiet accumulation)
 *   Vol 0.5-0.8 & Price > 0  → 20  (light buying)
 *   Vol 0.8-1.2              → 30  (neutral)
 *   Fallback                 → 30
 */
export function scoreVPTV4(vol: number, price: number): number {
  if (vol > 1.5 && price < -2)                                return 0
  if (vol > 1.5 && price > 2)                                 return 100
  if (vol > 1.0 && price < -1)                                return 10
  if (vol >= 1.2 && vol <= 1.5 && price >= 0 && price <= 2)   return 80
  if (vol >= 0.5 && vol < 0.8 && price > 0)                   return 20
  if (vol >= 0.8 && vol <= 1.2)                                return 30
  return 30
}

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
 *
 * naHandling controls how excluded/NA metrics affect the denominator:
 *   'exclude' (default): weights of excluded metrics are redistributed to active metrics.
 *   'zero': excluded metrics contribute 0 but denominator stays at total weight (penalizes missing data).
 */
export function scoreSegment(
  metricScores: MetricScore[],
  segment: ScorecardSegment,
  naHandling?: 'exclude' | 'zero'
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
  let activeWeight = 0
  let fullWeight = 0
  for (const metric of segment.metrics) {
    const weight = metric.weight ?? (1 / segment.metrics.length)
    weightMap.set(metric.id, weight)
    fullWeight += weight
    if (activeScores.some(s => s.metricId === metric.id)) {
      activeWeight += weight
    }
  }

  let weightedSum = 0
  if (naHandling === 'zero') {
    // Zero-NA mode: sum(score × weight) / fullWeight. Missing metrics contribute 0.
    for (const score of activeScores) {
      weightedSum += score.normalizedScore * (weightMap.get(score.metricId) ?? 0)
    }
    weightedSum = fullWeight > 0 ? weightedSum / fullWeight : 0
  } else {
    // Exclude mode (default): re-normalize weights for active metrics only
    for (const score of activeScores) {
      const weight = weightMap.get(score.metricId) ?? 0
      const normalizedWeight = activeWeight > 0 ? weight / activeWeight : 0
      weightedSum += score.normalizedScore * normalizedWeight
    }
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
 * conditional weights based on Historical 5Y Average PE/PB/EV thresholds:
 *   Hist Avg PB > 30       → Entire valuation NA (unreliable)
 *   Hist Avg PE > 75 & EV > 35 → PB only (100%)
 *   Hist Avg PE > 75       → PB=60% + EV=40%
 *   Hist Avg EV > 35       → PB=60% + PE=40%
 *   Default                → PE=30%, PB=50%, EV=20%
 */
function scoreValuationSegmentConditional(
  metricScores: MetricScore[],
  segment: ScorecardSegment,
  stockData: Record<string, number | null>
): SegmentResult {
  // Extract scored metrics by suffix (works for v2_pe_vs_5y, v4_pe_vs_5y, etc.)
  // Pass null for excluded ones so computeValuationScore treats them as "not available"
  const pe = metricScores.find(m => m.metricId.endsWith('_pe_vs_5y'))
  const pb = metricScores.find(m => m.metricId.endsWith('_pb_vs_5y'))
  const ev = metricScores.find(m => m.metricId.endsWith('_ev_vs_5y'))

  // Pass configurable thresholds/weights from segment if available
  const valConfig = segment.valuationConditionals?.enabled ? {
    peThreshold: segment.valuationConditionals.peThreshold,
    evThreshold: segment.valuationConditionals.evThreshold,
    pbNAThreshold: segment.valuationConditionals.pbNAThreshold,
    defaultWeights: segment.valuationConditionals.defaultWeights,
    peExcludedWeights: segment.valuationConditionals.peExcludedWeights,
    evExcludedWeights: segment.valuationConditionals.evExcludedWeights,
  } : undefined

  const result = computeValuationScore({
    peScore: pe && !pe.isExcluded ? pe.normalizedScore : null,
    pbScore: pb && !pb.isExcluded ? pb.normalizedScore : null,
    evScore: ev && !ev.isExcluded ? ev.normalizedScore : null,
    rawPE: stockData['hist_avg_pe'] ?? null,  // Historical 5Y avg PE (not TTM) for conditional thresholds
    rawPB: stockData['hist_avg_pb'] ?? null,  // Historical 5Y avg PB
    rawEV: stockData['hist_avg_ev'] ?? null,  // Historical 5Y avg EV/EBITDA
  }, valConfig)

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
 *
 * When adaptiveReNorm is true (V4 zero-NA mode):
 *   - If a valuation segment is N/A → returns NaN (composite not applicable)
 *   - If any other segment is N/A → re-normalizes remaining weights to sum to 100%
 */
export function computeComposite(
  segmentResults: SegmentResult[],
  formula: CompositeFormula,
  options?: { adaptiveReNorm?: boolean }
): number {
  const scoreMap = new Map<string, number>()
  const naSegmentIds = new Set<string>()
  for (const sr of segmentResults) {
    scoreMap.set(sr.segmentId, sr.segmentScore)
    if (sr.verdict === 'N/A' || sr.naReason) naSegmentIds.add(sr.segmentId)
  }

  // Adaptive re-normalization (V4): handle N/A segments
  if (options?.adaptiveReNorm && naSegmentIds.size > 0) {
    const allEntries = [...formula.baseSegments, ...(formula.overlaySegments ?? [])]

    // If valuation segment is N/A → entire composite is N/A
    for (const { segmentId } of allEntries) {
      if (naSegmentIds.has(segmentId) && segmentId.includes('valuation')) return NaN
    }

    // Re-normalize: compute effective weights and scale active weights to original total
    let activeWeightedSum = 0
    let activeTotalEffWeight = 0
    for (const { segmentId, weight } of formula.baseSegments) {
      const effWeight = weight * formula.baseWeight
      if (naSegmentIds.has(segmentId)) continue
      activeWeightedSum += (scoreMap.get(segmentId) ?? 0) * effWeight
      activeTotalEffWeight += effWeight
    }
    if (formula.overlaySegments) {
      for (const { segmentId, weight } of formula.overlaySegments) {
        if (naSegmentIds.has(segmentId)) continue
        activeWeightedSum += (scoreMap.get(segmentId) ?? 0) * weight
        activeTotalEffWeight += weight
      }
    }
    if (activeTotalEffWeight === 0) return NaN
    return Math.round((activeWeightedSum / activeTotalEffWeight) * 100) / 100
  }

  // Default behavior: straight weighted calculation (N/A segments contribute 0)
  let baseSum = 0
  for (const { segmentId, weight } of formula.baseSegments) {
    baseSum += (scoreMap.get(segmentId) ?? 0) * weight
  }
  let composite = baseSum * formula.baseWeight

  if (formula.overlaySegments) {
    for (const { segmentId, weight } of formula.overlaySegments) {
      composite += (scoreMap.get(segmentId) ?? 0) * weight
    }
  }

  return Math.round(composite * 100) / 100
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

  // Filter out NaN/Infinity values for computation, but preserve original positions
  const validIndices = scores.map((s, i) => isFinite(s) ? i : -1).filter(i => i >= 0)
  const validScores = validIndices.map(i => scores[i])

  switch (config.method) {
    case 'none':
      return scores

    case 'min-max': {
      if (validScores.length === 0) return scores.map(() => 50)
      const min = Math.min(...validScores)
      const max = Math.max(...validScores)
      if (max === min) return scores.map(() => 50)
      return scores.map(s =>
        isFinite(s)
          ? Math.round(((s - min) / (max - min)) * 100 * 100) / 100
          : 50  // Neutral score for NaN/Infinity
      )
    }

    case 'z-score': {
      if (validScores.length === 0) return scores.map(() => 50)
      const mean = validScores.reduce((a, b) => a + b, 0) / validScores.length
      const stdDev = Math.sqrt(
        validScores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / validScores.length
      )
      if (stdDev === 0) return scores.map(() => 50)
      // Convert z-scores to 0-100 range (assume ±3 std devs)
      return scores.map(s => {
        if (!isFinite(s)) return 50
        const z = (s - mean) / stdDev
        const normalized = ((z + 3) / 6) * 100
        return Math.min(100, Math.max(0, Math.round(normalized * 100) / 100))
      })
    }

    case 'percentile': {
      // Cumulative proportion method: percentile = count(v <= x) / n * 100
      // Max value always gets 100%. Tied values share the same percentile.
      // For n=1, returns 100%. For the minimum of n, returns (1/n)*100.
      if (validScores.length === 0) return scores.map(() => 50)
      const sorted = [...validScores].sort((a, b) => a - b)
      return scores.map(s => {
        if (!isFinite(s)) return 50
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
    // Use >= only (first match wins, sorted descending). This avoids gaps
    // between integer maxScore boundaries when scores are fractional (e.g. 64.17).
    if (score >= t.minScore) {
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
      // V2 VPT two-input conditional scoring
      if (metric.scoringMethod === 'conditional_vpt') {
        const volChange = stockData['v2_volume_change'] ?? null
        const priceChangeVal = stockData['v2_price_change'] ?? null
        if (volChange != null && priceChangeVal != null) {
          return {
            metricId: metric.id, metricName: metric.name,
            rawValue: stockData[metric.id] ?? null,
            normalizedScore: scoreVPT(volChange, priceChangeVal),
            isExcluded: false,
            evidence: { startValue: volChange, endValue: priceChangeVal },
          }
        }
        return {
          metricId: metric.id, metricName: metric.name, rawValue: null,
          normalizedScore: 0, isExcluded: true,
          excludeReason: 'No volume/price change data for VPT conditional scoring',
        }
      }

      // V4 VPT conditional scoring — reads data keys from calculationParams
      if (metric.scoringMethod === 'conditional_vpt_v4') {
        const volKey = (metric.calculationParams?.volumeKey as string) ?? 'v4_volume_change'
        const priceKey = (metric.calculationParams?.priceKey as string) ?? 'v4_price_change'
        const volChange = stockData[volKey] ?? null
        const priceChangeVal = stockData[priceKey] ?? null
        if (volChange != null && priceChangeVal != null) {
          return {
            metricId: metric.id, metricName: metric.name,
            rawValue: stockData[metric.id] ?? null,
            normalizedScore: scoreVPTV4(volChange, priceChangeVal),
            isExcluded: false,
            evidence: { startValue: volChange, endValue: priceChangeVal },
          }
        }
        return {
          metricId: metric.id, metricName: metric.name, rawValue: null,
          normalizedScore: 0, isExcluded: true,
          excludeReason: 'No volume/price data for V4 VPT scoring',
        }
      }

      // EBITDA floor: if metric has ebitdaFloor param and EBITDA ≤ 0, return floor score
      // Convention: metricContext[metricId].endValue = EBITDA (denominator) for Debt/EBITDA
      if (metric.calculationParams?.ebitdaFloor != null) {
        const ctx = metricContext?.[metric.id]
        if (ctx?.endValue != null && ctx.endValue <= 0) {
          const floor = Number(metric.calculationParams.ebitdaFloor)
          return {
            metricId: metric.id, metricName: metric.name,
            rawValue: stockData[metric.id] ?? null,
            normalizedScore: floor, isExcluded: false,
            evidence: ctx,
          }
        }
      }

      const rawValue = stockData[metric.id] ?? null
      const context = metricContext?.[metric.id]
      return scoreMetric(rawValue, metric, scorecard.negativeHandlingRules, context)
    })

    // PB-anchored conditional weights for valuation segments (any version)
    if (segment.valuationConditionals?.enabled) {
      return scoreValuationSegmentConditional(metricScores, segment, stockData)
    }

    return scoreSegment(metricScores, segment, segment.naHandling ?? scorecard.naHandling)
  })

  // Compute composite (with adaptive re-normalization for V4 zero-NA mode)
  const adaptiveReNorm = scorecard.naHandling === 'zero'
  const rawComposite = computeComposite(segmentResults, scorecard.compositeFormula, { adaptiveReNorm })

  // Handle N/A composite (e.g., valuation not meaningful in V4)
  if (isNaN(rawComposite)) {
    return {
      stockId: stockInfo.id,
      stockName: stockInfo.name,
      stockSymbol: stockInfo.symbol,
      sector: stockInfo.sector,
      marketCap: stockInfo.marketCap,
      segmentResults,
      rawComposite: 0,
      normalizedScore: 0,
      verdict: 'N/A',
      verdictColor: 'text-neutral-500',
    }
  }

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
// Live Preview Scoring (no network, instant)
// ─────────────────────────────────────────────────

/**
 * Preview the score impact of scorecard changes for a single stock.
 * Uses the same pipeline as scoreStock() but returns a flatter shape
 * optimized for live UI updates (e.g., when editing bands/weights).
 *
 * No network calls — all data must be pre-provided in stockData.
 */
export function previewScore(
  stockData: Record<string, number | null>,
  scorecard: ScorecardVersion,
  stockInfo: { id: string; name: string; symbol: string; sector: string; marketCap: number },
  metricContext?: Record<string, { startValue?: number; endValue?: number }>
): {
  composite: number
  verdict: string
  verdictColor: string
  segments: { id: string; name: string; score: number; verdict?: string }[]
  metricScores: { id: string; name: string; rawValue: number | null; score: number; excluded: boolean }[]
} {
  const result = scoreStock(stockData, scorecard, stockInfo, metricContext)

  return {
    composite: result.normalizedScore,
    verdict: result.verdict,
    verdictColor: result.verdictColor,
    segments: result.segmentResults.map(seg => ({
      id: seg.segmentId,
      name: seg.segmentName,
      score: seg.segmentScore,
      verdict: seg.verdict,
    })),
    metricScores: result.segmentResults.flatMap(seg =>
      seg.metricScores.map(ms => ({
        id: ms.metricId,
        name: ms.metricName,
        rawValue: ms.rawValue,
        score: ms.normalizedScore,
        excluded: ms.isExcluded,
      }))
    ),
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
