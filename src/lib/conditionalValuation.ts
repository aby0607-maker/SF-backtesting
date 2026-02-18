/**
 * Conditional Valuation Logic — V2.2 Expert Model (PB-Anchored)
 *
 * The V2.2 valuation score uses PB as the anchor metric:
 * - 3 metrics: PE vs 5Y Avg, PB vs 5Y Avg, EV/EBITDA vs 5Y Avg
 * - Default weights: PE=30%, PB=50%, EV=20%  (PB-anchored)
 * - Conditions override these weights based on raw values
 *
 * Conditions (from SME CSV V2.2):
 * 1. PB > 30 → Entire valuation = NA (unreliable at extreme PB)
 * 2. PE > 75 AND EV > 35 → Use PB only (100%)
 * 3. PE > 75 → Use PB=60% + EV=40% (exclude PE)
 * 4. EV > 35 → Use PB=60% + PE=40% (exclude EV)
 * 5. Only PE available → PE=100%
 * 6. Only PB available → PB=100%
 * 7. Only EV available → EV=100%
 */

interface ValuationInput {
  peScore: number | null     // Normalized PE score (0-100)
  pbScore: number | null     // Normalized PB score (0-100)
  evScore: number | null     // Normalized EV/EBITDA score (0-100)
  rawPE: number | null       // Raw PE ratio value
  rawPB: number | null       // Raw PB ratio value
  rawEV: number | null       // Raw EV/EBITDA value
}

interface ValuationResult {
  score: number
  weights: { pe: number; pb: number; ev: number }
  condition: string          // Which condition was applied
  isNA?: boolean             // True when valuation is unreliable (PB > 30)
}

/**
 * Compute the V2.2 valuation score with PB-anchored conditional weighting.
 */
export function computeValuationScore(input: ValuationInput): ValuationResult {
  const { peScore, pbScore, evScore, rawPE, rawPB, rawEV } = input

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

  // Condition 1: PB > 30 → Entire valuation NA (strict inequality: PB=30.0 passes)
  // At extreme PB levels, valuation ratios are unreliable — return NA
  if (hasPB && rawPB! > 30) {
    return { score: 0, weights: { pe: 0, pb: 0, ev: 0 }, condition: 'PB > 30 → valuation NA (unreliable)', isNA: true }
  }

  // Single metric available
  if (availableCount === 1) {
    if (hasPE) return { score: peScore!, weights: { pe: 1, pb: 0, ev: 0 }, condition: 'Only PE available → PE=100%' }
    if (hasPB) return { score: pbScore!, weights: { pe: 0, pb: 1, ev: 0 }, condition: 'Only PB available → PB=100%' }
    if (hasEV) return { score: evScore!, weights: { pe: 0, pb: 0, ev: 1 }, condition: 'Only EV available → EV=100%' }
  }

  // Condition 2: PE > 75 AND EV > 35 → Use PB only
  if (hasPE && hasEV && rawPE! > 75 && rawEV! > 35) {
    if (hasPB) {
      return { score: pbScore!, weights: { pe: 0, pb: 1, ev: 0 }, condition: 'PE > 75 & EV > 35 → PB only (100%)' }
    }
    // If no PB but PE & EV are extreme, valuation = NA
    return { score: 0, weights: { pe: 0, pb: 0, ev: 0 }, condition: 'PE > 75 & EV > 35, no PB → valuation NA', isNA: true }
  }

  // Condition 3: PE > 75 → Exclude PE, use PB=60% + EV=40%
  if (hasPE && rawPE! > 75) {
    if (hasPB && hasEV) {
      const score = pbScore! * 0.6 + evScore! * 0.4
      return { score, weights: { pe: 0, pb: 0.6, ev: 0.4 }, condition: 'PE > 75 → excluded, PB=60% + EV=40%' }
    }
    if (hasPB) {
      return { score: pbScore!, weights: { pe: 0, pb: 1, ev: 0 }, condition: 'PE > 75 → excluded, only PB available' }
    }
    if (hasEV) {
      return { score: evScore!, weights: { pe: 0, pb: 0, ev: 1 }, condition: 'PE > 75 → excluded, only EV available' }
    }
  }

  // Condition 4: EV > 35 → Exclude EV, use PB=60% + PE=40%
  if (hasEV && rawEV! > 35) {
    if (hasPE && hasPB) {
      const score = pbScore! * 0.6 + peScore! * 0.4
      return { score, weights: { pe: 0.4, pb: 0.6, ev: 0 }, condition: 'EV > 35 → excluded, PB=60% + PE=40%' }
    }
    if (hasPB) {
      return { score: pbScore!, weights: { pe: 0, pb: 1, ev: 0 }, condition: 'EV > 35 → excluded, only PB available' }
    }
    if (hasPE) {
      return { score: peScore!, weights: { pe: 1, pb: 0, ev: 0 }, condition: 'EV > 35 → excluded, only PE available' }
    }
  }

  // Default: PB-anchored weights (PE=30%, PB=50%, EV=20%)
  // Only use available metrics, re-normalize weights
  let totalWeight = 0
  let weightedSum = 0
  const weights = { pe: 0, pb: 0, ev: 0 }

  if (hasPE) { weights.pe = 0.3; totalWeight += 0.3; weightedSum += peScore! * 0.3 }
  if (hasPB) { weights.pb = 0.5; totalWeight += 0.5; weightedSum += pbScore! * 0.5 }
  if (hasEV) { weights.ev = 0.2; totalWeight += 0.2; weightedSum += evScore! * 0.2 }

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
    condition: 'Default PB-anchored: PE=30%, PB=50%, EV=20%',
  }
}
