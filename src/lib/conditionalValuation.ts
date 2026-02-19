/**
 * Conditional Valuation Logic — V2.2 Expert Model (PB-Anchored)
 *
 * The V2.2 valuation score uses PB as the anchor metric:
 * - 3 metrics: PE vs 5Y Avg, PB vs 5Y Avg, EV/EBITDA vs 5Y Avg
 * - Default weights: PE=30%, PB=50%, EV=20%  (PB-anchored)
 * - Conditions override these weights based on raw values
 *
 * Conditions (from SME CSV V2.2):
 * All thresholds below check **Historical 5Y Average** values (not TTM):
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
  rawPE: number | null       // Historical 5Y Average PE (for conditional thresholds)
  rawPB: number | null       // Historical 5Y Average PB (for conditional thresholds)
  rawEV: number | null       // Historical 5Y Average EV/EBITDA (for conditional thresholds)
}

interface ValuationResult {
  score: number
  weights: { pe: number; pb: number; ev: number }
  condition: string          // Which condition was applied
  isNA?: boolean             // True when valuation is unreliable (PB > 30)
}

/** Optional config for customizable thresholds/weights (UI-editable) */
export interface ValuationConfig {
  peThreshold: number       // default: 75
  evThreshold: number       // default: 35
  pbNAThreshold: number     // default: 30
  defaultWeights: { pe: number; pb: number; ev: number }
  peExcludedWeights: { pb: number; ev: number }
  evExcludedWeights: { pe: number; pb: number }
}

export const DEFAULT_CONFIG: ValuationConfig = {
  peThreshold: 75,
  evThreshold: 35,
  pbNAThreshold: 30,
  defaultWeights: { pe: 0.3, pb: 0.5, ev: 0.2 },
  peExcludedWeights: { pb: 0.6, ev: 0.4 },
  evExcludedWeights: { pe: 0.4, pb: 0.6 },
}

/**
 * Compute the V2.2 valuation score with PB-anchored conditional weighting.
 * If config is provided, uses custom thresholds/weights; otherwise uses V2.2 defaults.
 */
export function computeValuationScore(input: ValuationInput, config?: ValuationConfig): ValuationResult {
  const { peScore, pbScore, evScore, rawPE, rawPB, rawEV } = input
  const cfg = config ?? DEFAULT_CONFIG

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

  // Condition 1: PB > pbNAThreshold → Entire valuation NA
  if (hasPB && rawPB! > cfg.pbNAThreshold) {
    return { score: 0, weights: { pe: 0, pb: 0, ev: 0 }, condition: `PB > ${cfg.pbNAThreshold} → valuation NA (unreliable)`, isNA: true }
  }

  // Single metric available
  if (availableCount === 1) {
    if (hasPE) return { score: peScore!, weights: { pe: 1, pb: 0, ev: 0 }, condition: 'Only PE available → PE=100%' }
    if (hasPB) return { score: pbScore!, weights: { pe: 0, pb: 1, ev: 0 }, condition: 'Only PB available → PB=100%' }
    if (hasEV) return { score: evScore!, weights: { pe: 0, pb: 0, ev: 1 }, condition: 'Only EV available → EV=100%' }
  }

  // Condition 2: PE > peThreshold AND EV > evThreshold → Use PB only
  if (hasPE && hasEV && rawPE! > cfg.peThreshold && rawEV! > cfg.evThreshold) {
    if (hasPB) {
      return { score: pbScore!, weights: { pe: 0, pb: 1, ev: 0 }, condition: `PE > ${cfg.peThreshold} & EV > ${cfg.evThreshold} → PB only (100%)` }
    }
    // If no PB but PE & EV are extreme, valuation = NA
    return { score: 0, weights: { pe: 0, pb: 0, ev: 0 }, condition: `PE > ${cfg.peThreshold} & EV > ${cfg.evThreshold}, no PB → valuation NA`, isNA: true }
  }

  // Condition 3: PE > peThreshold → Exclude PE, use configured peExcludedWeights
  if (hasPE && rawPE! > cfg.peThreshold) {
    const { pb: pbW, ev: evW } = cfg.peExcludedWeights
    if (hasPB && hasEV) {
      const score = pbScore! * pbW + evScore! * evW
      return { score, weights: { pe: 0, pb: pbW, ev: evW }, condition: `PE > ${cfg.peThreshold} → excluded, PB=${(pbW * 100).toFixed(0)}% + EV=${(evW * 100).toFixed(0)}%` }
    }
    if (hasPB) {
      return { score: pbScore!, weights: { pe: 0, pb: 1, ev: 0 }, condition: `PE > ${cfg.peThreshold} → excluded, only PB available` }
    }
    if (hasEV) {
      return { score: evScore!, weights: { pe: 0, pb: 0, ev: 1 }, condition: `PE > ${cfg.peThreshold} → excluded, only EV available` }
    }
  }

  // Condition 4: EV > evThreshold → Exclude EV, use configured evExcludedWeights
  if (hasEV && rawEV! > cfg.evThreshold) {
    const { pe: peW, pb: pbW } = cfg.evExcludedWeights
    if (hasPE && hasPB) {
      const score = pbScore! * pbW + peScore! * peW
      return { score, weights: { pe: peW, pb: pbW, ev: 0 }, condition: `EV > ${cfg.evThreshold} → excluded, PB=${(pbW * 100).toFixed(0)}% + PE=${(peW * 100).toFixed(0)}%` }
    }
    if (hasPB) {
      return { score: pbScore!, weights: { pe: 0, pb: 1, ev: 0 }, condition: `EV > ${cfg.evThreshold} → excluded, only PB available` }
    }
    if (hasPE) {
      return { score: peScore!, weights: { pe: 1, pb: 0, ev: 0 }, condition: `EV > ${cfg.evThreshold} → excluded, only PE available` }
    }
  }

  // Default: PB-anchored weights from config
  // Only use available metrics, re-normalize weights
  const { pe: dPE, pb: dPB, ev: dEV } = cfg.defaultWeights
  let totalWeight = 0
  let weightedSum = 0
  const weights = { pe: 0, pb: 0, ev: 0 }

  if (hasPE) { weights.pe = dPE; totalWeight += dPE; weightedSum += peScore! * dPE }
  if (hasPB) { weights.pb = dPB; totalWeight += dPB; weightedSum += pbScore! * dPB }
  if (hasEV) { weights.ev = dEV; totalWeight += dEV; weightedSum += evScore! * dEV }

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
