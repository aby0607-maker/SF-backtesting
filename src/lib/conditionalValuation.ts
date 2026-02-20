/**
 * Conditional Valuation Logic — V2.2 Expert Model (PB-Anchored)
 *
 * The V2.2 valuation score uses PB as the anchor metric:
 * - 3 metrics: PE vs 5Y Avg, PB vs 5Y Avg, EV/EBITDA vs 5Y Avg
 * - Default weights: PE=30%, PB=50%, EV=20%  (PB-anchored)
 * - Conditions override these weights based on Historical 5Y Average values
 *
 * IMPORTANT: All threshold checks use Historical 5Y Averages (not TTM):
 *   rawPE = Historical 5Y Average PE
 *   rawPB = Historical 5Y Average PB
 *   rawEV = Historical 5Y Average EV/EBITDA
 *
 * Conditions (from SME CSV V2.2):
 * 1. Hist Avg PB > 30 → Entire valuation = NA (unreliable at extreme PB)
 * 2. Hist Avg PE > 75 AND Hist Avg EV > 35 → Use PB only (100%)
 * 3. Hist Avg PE > 75 → Use PB=60% + EV=40% (exclude PE)
 * 4. Hist Avg EV > 35 → Use PB=60% + PE=40% (exclude EV)
 * 5. Only PE available → PE=100%
 * 6. Only PB available → PB=100%
 * 7. Only EV available → EV=100%
 */

interface ValuationInput {
  peScore: number | null     // Normalized PE score (0-100)
  pbScore: number | null     // Normalized PB score (0-100)
  evScore: number | null     // Normalized EV/EBITDA score (0-100)
  rawPE: number | null       // Historical 5Y Average PE (for threshold checks)
  rawPB: number | null       // Historical 5Y Average PB (for threshold checks)
  rawEV: number | null       // Historical 5Y Average EV/EBITDA (for threshold checks)
}

interface ValuationResult {
  score: number
  weights: { pe: number; pb: number; ev: number }
  condition: string          // Which condition was applied
  isNA?: boolean             // True when valuation is unreliable (PB > 30)
}

/** Optional config to override hardcoded thresholds and weights */
interface ValuationConfig {
  peThreshold?: number       // default: 75
  evThreshold?: number       // default: 35
  pbNAThreshold?: number     // default: 30
  defaultWeights?: { pe: number; pb: number; ev: number }
  peExcludedWeights?: { pb: number; ev: number }
  evExcludedWeights?: { pe: number; pb: number }
}

/**
 * Compute the V2.2 valuation score with PB-anchored conditional weighting.
 * When config is provided, uses those thresholds/weights. Otherwise uses V2.2 defaults.
 */
export function computeValuationScore(input: ValuationInput, config?: ValuationConfig): ValuationResult {
  const { peScore, pbScore, evScore, rawPE, rawPB, rawEV } = input

  // Configurable thresholds with V2.2 defaults
  const PE_THRESHOLD = config?.peThreshold ?? 75
  const EV_THRESHOLD = config?.evThreshold ?? 35
  const PB_NA_THRESHOLD = config?.pbNAThreshold ?? 30
  const defW = config?.defaultWeights ?? { pe: 0.3, pb: 0.5, ev: 0.2 }
  const peExW = config?.peExcludedWeights ?? { pb: 0.6, ev: 0.4 }
  const evExW = config?.evExcludedWeights ?? { pe: 0.4, pb: 0.6 }

  // Determine which metrics are available (have both raw value and score)
  const hasPE = peScore != null && rawPE != null
  const hasPB = pbScore != null && rawPB != null
  const hasEV = evScore != null && rawEV != null

  // Count available metrics
  const availableCount = [hasPE, hasPB, hasEV].filter(Boolean).length

  // No metrics available
  if (availableCount === 0) {
    return { score: 0, weights: { pe: 0, pb: 0, ev: 0 }, condition: 'No valuation metrics available', isNA: true }
  }

  // Condition 1: PB > threshold → Entire valuation NA
  if (hasPB && rawPB! > PB_NA_THRESHOLD) {
    return { score: 0, weights: { pe: 0, pb: 0, ev: 0 }, condition: `PB > ${PB_NA_THRESHOLD} → valuation NA (unreliable)`, isNA: true }
  }

  // Single metric available
  if (availableCount === 1) {
    if (hasPE) return { score: peScore!, weights: { pe: 1, pb: 0, ev: 0 }, condition: 'Only PE available → PE=100%' }
    if (hasPB) return { score: pbScore!, weights: { pe: 0, pb: 1, ev: 0 }, condition: 'Only PB available → PB=100%' }
    if (hasEV) return { score: evScore!, weights: { pe: 0, pb: 0, ev: 1 }, condition: 'Only EV available → EV=100%' }
  }

  // Condition 2: PE > threshold AND EV > threshold → Use PB only
  if (hasPE && hasEV && rawPE! > PE_THRESHOLD && rawEV! > EV_THRESHOLD) {
    if (hasPB) {
      return { score: pbScore!, weights: { pe: 0, pb: 1, ev: 0 }, condition: `PE > ${PE_THRESHOLD} & EV > ${EV_THRESHOLD} → PB only (100%)` }
    }
    return { score: 0, weights: { pe: 0, pb: 0, ev: 0 }, condition: `PE > ${PE_THRESHOLD} & EV > ${EV_THRESHOLD}, no PB → valuation NA`, isNA: true }
  }

  // Condition 3: PE > threshold → Exclude PE, use configured weights
  if (hasPE && rawPE! > PE_THRESHOLD) {
    if (hasPB && hasEV) {
      const score = pbScore! * peExW.pb + evScore! * peExW.ev
      return { score, weights: { pe: 0, pb: peExW.pb, ev: peExW.ev }, condition: `PE > ${PE_THRESHOLD} → excluded, PB=${(peExW.pb*100).toFixed(0)}% + EV=${(peExW.ev*100).toFixed(0)}%` }
    }
    if (hasPB) {
      return { score: pbScore!, weights: { pe: 0, pb: 1, ev: 0 }, condition: `PE > ${PE_THRESHOLD} → excluded, only PB available` }
    }
    if (hasEV) {
      return { score: evScore!, weights: { pe: 0, pb: 0, ev: 1 }, condition: `PE > ${PE_THRESHOLD} → excluded, only EV available` }
    }
  }

  // Condition 4: EV > threshold → Exclude EV, use configured weights
  if (hasEV && rawEV! > EV_THRESHOLD) {
    if (hasPE && hasPB) {
      const score = pbScore! * evExW.pb + peScore! * evExW.pe
      return { score, weights: { pe: evExW.pe, pb: evExW.pb, ev: 0 }, condition: `EV > ${EV_THRESHOLD} → excluded, PB=${(evExW.pb*100).toFixed(0)}% + PE=${(evExW.pe*100).toFixed(0)}%` }
    }
    if (hasPB) {
      return { score: pbScore!, weights: { pe: 0, pb: 1, ev: 0 }, condition: `EV > ${EV_THRESHOLD} → excluded, only PB available` }
    }
    if (hasPE) {
      return { score: peScore!, weights: { pe: 1, pb: 0, ev: 0 }, condition: `EV > ${EV_THRESHOLD} → excluded, only PE available` }
    }
  }

  // Default: configurable PB-anchored weights
  // Only use available metrics, re-normalize weights
  let totalWeight = 0
  let weightedSum = 0
  const weights = { pe: 0, pb: 0, ev: 0 }

  if (hasPE) { weights.pe = defW.pe; totalWeight += defW.pe; weightedSum += peScore! * defW.pe }
  if (hasPB) { weights.pb = defW.pb; totalWeight += defW.pb; weightedSum += pbScore! * defW.pb }
  if (hasEV) { weights.ev = defW.ev; totalWeight += defW.ev; weightedSum += evScore! * defW.ev }

  // Re-normalize if not all metrics available
  if (totalWeight > 0 && totalWeight < 1) {
    weightedSum = weightedSum / totalWeight
    weights.pe = weights.pe / totalWeight
    weights.pb = weights.pb / totalWeight
    weights.ev = weights.ev / totalWeight
  }

  return {
    score: Math.round(weightedSum * 100) / 100,
    weights,
    condition: `Default PB-anchored: PE=${(defW.pe*100).toFixed(0)}%, PB=${(defW.pb*100).toFixed(0)}%, EV=${(defW.ev*100).toFixed(0)}%`,
  }
}
