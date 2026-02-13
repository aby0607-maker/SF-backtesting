/**
 * Quarterly Momentum Score — V2 Expert Model Overlay
 *
 * Measures quarterly acceleration via two multipliers:
 * 1. Revenue Multiplier = Current Quarter Revenue / Same Quarter Last Year Revenue
 * 2. EBITDA Multiplier = Current Quarter EBITDA / Same Quarter Last Year EBITDA
 *
 * A multiplier > 1 means growth, < 1 means contraction.
 * These are scored individually then combined into a 0-100 composite.
 */

import type { ScoreBand } from '@/types/scoring'

// ─────────────────────────────────────────────────
// Multiplier Calculations
// ─────────────────────────────────────────────────

/**
 * Compute Revenue Multiplier: QoQ year-over-year acceleration.
 * Returns null if prior year data is missing or zero.
 */
export function computeRevenueMultiplier(
  currentQRevenue: number | null,
  priorYearSameQRevenue: number | null
): number | null {
  if (currentQRevenue == null || priorYearSameQRevenue == null) return null
  if (priorYearSameQRevenue === 0) return null
  // Negative prior year revenue → special handling
  if (priorYearSameQRevenue < 0) {
    // If both negative, check improvement
    if (currentQRevenue < 0) {
      return Math.abs(priorYearSameQRevenue) > 0
        ? Math.abs(currentQRevenue) / Math.abs(priorYearSameQRevenue)
        : null
    }
    // Turned profitable → very positive signal, cap at 3.0
    return 3.0
  }
  return Math.round((currentQRevenue / priorYearSameQRevenue) * 1000) / 1000
}

/**
 * Compute EBITDA Multiplier: same logic as Revenue Multiplier.
 */
export function computeEBITDAMultiplier(
  currentQEBITDA: number | null,
  priorYearSameQEBITDA: number | null
): number | null {
  if (currentQEBITDA == null || priorYearSameQEBITDA == null) return null
  if (priorYearSameQEBITDA === 0) return null
  if (priorYearSameQEBITDA < 0) {
    if (currentQEBITDA < 0) {
      return Math.abs(priorYearSameQEBITDA) > 0
        ? Math.abs(currentQEBITDA) / Math.abs(priorYearSameQEBITDA)
        : null
    }
    return 3.0
  }
  return Math.round((currentQEBITDA / priorYearSameQEBITDA) * 1000) / 1000
}

// ─────────────────────────────────────────────────
// Default Score Bands for Multipliers
// ─────────────────────────────────────────────────

/** Default score bands for Revenue/EBITDA multipliers */
export const DEFAULT_MULTIPLIER_BANDS: ScoreBand[] = [
  { min: 1.5, max: Infinity, score: 100, label: 'Exceptional Growth', color: 'text-success-400' },
  { min: 1.3, max: 1.499, score: 85, label: 'Strong Growth', color: 'text-success-400' },
  { min: 1.15, max: 1.299, score: 70, label: 'Healthy Growth', color: 'text-teal-400' },
  { min: 1.05, max: 1.149, score: 55, label: 'Moderate Growth', color: 'text-teal-400' },
  { min: 0.95, max: 1.049, score: 40, label: 'Flat', color: 'text-warning-400' },
  { min: 0.85, max: 0.949, score: 25, label: 'Mild Contraction', color: 'text-warning-400' },
  { min: 0.7, max: 0.849, score: 10, label: 'Contraction', color: 'text-destructive-400' },
  { min: -Infinity, max: 0.699, score: 0, label: 'Severe Contraction', color: 'text-destructive-400' },
]

// ─────────────────────────────────────────────────
// Scoring
// ─────────────────────────────────────────────────

/**
 * Score a multiplier value against score bands.
 * Returns 0-100.
 */
export function scoreMultiplier(
  multiplierValue: number | null,
  scoreBands: ScoreBand[] = DEFAULT_MULTIPLIER_BANDS
): number {
  if (multiplierValue == null) return 0

  // Sort bands by score descending
  const sorted = [...scoreBands].sort((a, b) => b.score - a.score)

  for (const band of sorted) {
    if (multiplierValue >= band.min && multiplierValue <= band.max) {
      return band.score
    }
  }

  // Below all bands
  return 0
}

/**
 * Compute the Quarterly Momentum Score from both multiplier scores.
 * Default: 50% Revenue Multiplier + 50% EBITDA Multiplier
 */
export function computeQuarterlyMomentumScore(
  revenueMultiplierScore: number,
  ebitdaMultiplierScore: number,
  revenueWeight: number = 0.5,
  ebitdaWeight: number = 0.5
): number {
  const totalWeight = revenueWeight + ebitdaWeight
  if (totalWeight === 0) return 0

  const score = (revenueMultiplierScore * revenueWeight + ebitdaMultiplierScore * ebitdaWeight) / totalWeight
  return Math.min(100, Math.max(0, Math.round(score * 100) / 100))
}

/**
 * Full quarterly momentum analysis from raw data.
 * Convenience function that computes multipliers, scores, and composite.
 */
export function analyzeQuarterlyMomentum(input: {
  currentQRevenue: number | null
  priorYearSameQRevenue: number | null
  currentQEBITDA: number | null
  priorYearSameQEBITDA: number | null
  scoreBands?: ScoreBand[]
}): {
  revenueMultiplier: number | null
  ebitdaMultiplier: number | null
  revenueScore: number
  ebitdaScore: number
  compositeScore: number
} {
  const bands = input.scoreBands ?? DEFAULT_MULTIPLIER_BANDS

  const revenueMultiplier = computeRevenueMultiplier(
    input.currentQRevenue,
    input.priorYearSameQRevenue
  )
  const ebitdaMultiplier = computeEBITDAMultiplier(
    input.currentQEBITDA,
    input.priorYearSameQEBITDA
  )

  const revenueScore = scoreMultiplier(revenueMultiplier, bands)
  const ebitdaScore = scoreMultiplier(ebitdaMultiplier, bands)

  return {
    revenueMultiplier,
    ebitdaMultiplier,
    revenueScore,
    ebitdaScore,
    compositeScore: computeQuarterlyMomentumScore(revenueScore, ebitdaScore),
  }
}
