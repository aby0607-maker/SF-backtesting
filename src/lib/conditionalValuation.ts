/**
 * Conditional Valuation Logic — V2 Expert Model
 *
 * The V2 valuation score has complex conditional weighting:
 * - 3 metrics: PE vs 5Y Avg, PB vs 5Y Avg, EV/EBITDA vs 5Y Avg
 * - Default weights: PE=40%, PB=30%, EV=30%
 * - But conditions override these weights based on raw values
 *
 * Conditions (from SME CSV):
 * 1. PB > 30 → Exclude PB, use PE=60% + EV=40%
 * 2. PE > 75 AND EV > 35 → Use PB only (100%)
 * 3. PE > 75 → Use PB=50% + EV=50% (exclude PE)
 * 4. EV > 35 → Use PE=50% + PB=50% (exclude EV)
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
}

/**
 * Compute the V2 valuation score with conditional weighting logic.
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
    return { score: 0, weights: { pe: 0, pb: 0, ev: 0 }, condition: 'No valuation metrics available' }
  }

  // Single metric available
  if (availableCount === 1) {
    if (hasPE) return { score: peScore!, weights: { pe: 1, pb: 0, ev: 0 }, condition: 'Only PE available → PE=100%' }
    if (hasPB) return { score: pbScore!, weights: { pe: 0, pb: 1, ev: 0 }, condition: 'Only PB available → PB=100%' }
    if (hasEV) return { score: evScore!, weights: { pe: 0, pb: 0, ev: 1 }, condition: 'Only EV available → EV=100%' }
  }

  // Condition 1: PB > 30 → Exclude PB
  if (hasPB && rawPB! > 30) {
    if (hasPE && hasEV) {
      const score = peScore! * 0.6 + evScore! * 0.4
      return { score, weights: { pe: 0.6, pb: 0, ev: 0.4 }, condition: 'PB > 30 → excluded, PE=60% + EV=40%' }
    }
    if (hasPE) {
      return { score: peScore!, weights: { pe: 1, pb: 0, ev: 0 }, condition: 'PB > 30 → excluded, only PE available' }
    }
    if (hasEV) {
      return { score: evScore!, weights: { pe: 0, pb: 0, ev: 1 }, condition: 'PB > 30 → excluded, only EV available' }
    }
  }

  // Condition 2: PE > 75 AND EV > 35 → Use PB only
  if (hasPE && hasEV && rawPE! > 75 && rawEV! > 35) {
    if (hasPB) {
      return { score: pbScore!, weights: { pe: 0, pb: 1, ev: 0 }, condition: 'PE > 75 & EV > 35 → PB only (100%)' }
    }
    // If no PB but PE & EV are extreme, score = 0
    return { score: 0, weights: { pe: 0, pb: 0, ev: 0 }, condition: 'PE > 75 & EV > 35, no PB → score = 0' }
  }

  // Condition 3: PE > 75 → Exclude PE
  if (hasPE && rawPE! > 75) {
    if (hasPB && hasEV) {
      const score = pbScore! * 0.5 + evScore! * 0.5
      return { score, weights: { pe: 0, pb: 0.5, ev: 0.5 }, condition: 'PE > 75 → excluded, PB=50% + EV=50%' }
    }
    if (hasPB) {
      return { score: pbScore!, weights: { pe: 0, pb: 1, ev: 0 }, condition: 'PE > 75 → excluded, only PB available' }
    }
    if (hasEV) {
      return { score: evScore!, weights: { pe: 0, pb: 0, ev: 1 }, condition: 'PE > 75 → excluded, only EV available' }
    }
  }

  // Condition 4: EV > 35 → Exclude EV
  if (hasEV && rawEV! > 35) {
    if (hasPE && hasPB) {
      const score = peScore! * 0.5 + pbScore! * 0.5
      return { score, weights: { pe: 0.5, pb: 0.5, ev: 0 }, condition: 'EV > 35 → excluded, PE=50% + PB=50%' }
    }
    if (hasPE) {
      return { score: peScore!, weights: { pe: 1, pb: 0, ev: 0 }, condition: 'EV > 35 → excluded, only PE available' }
    }
    if (hasPB) {
      return { score: pbScore!, weights: { pe: 0, pb: 1, ev: 0 }, condition: 'EV > 35 → excluded, only PB available' }
    }
  }

  // Default: Standard weights (PE=40%, PB=30%, EV=30%)
  // Only use available metrics, re-normalize weights
  let totalWeight = 0
  let weightedSum = 0
  const weights = { pe: 0, pb: 0, ev: 0 }

  if (hasPE) { weights.pe = 0.4; totalWeight += 0.4; weightedSum += peScore! * 0.4 }
  if (hasPB) { weights.pb = 0.3; totalWeight += 0.3; weightedSum += pbScore! * 0.3 }
  if (hasEV) { weights.ev = 0.3; totalWeight += 0.3; weightedSum += evScore! * 0.3 }

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
    condition: 'Default weights: PE=40%, PB=30%, EV=30%',
  }
}
