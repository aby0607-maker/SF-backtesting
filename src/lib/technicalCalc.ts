/**
 * Technical Indicator Calculations — V2 Expert Model
 *
 * 5 metrics, each scored 0-10 individually:
 * 1. Price vs 20-Day EMA
 * 2. Price vs 50-Day EMA
 * 3. Price vs 200-Day EMA
 * 4. RSI (14-period)
 * 5. Volume-Price Trend
 *
 * Composite: weighted sum of individual 0-10 scores → scaled to 0-100
 */

// ─────────────────────────────────────────────────
// Core Technical Calculations
// ─────────────────────────────────────────────────

/**
 * Exponential Moving Average
 * EMA = (Price × k) + (Previous EMA × (1 - k))
 * where k = 2 / (period + 1)
 */
export function ema(prices: number[], period: number): number[] {
  if (prices.length === 0) return []
  if (prices.length < period) return []

  const k = 2 / (period + 1)
  const result: number[] = []

  // Start with SMA for the first value
  let sma = 0
  for (let i = 0; i < period; i++) {
    sma += prices[i]
  }
  sma /= period
  result.push(sma)

  // Calculate EMA for remaining values
  let prevEma = sma
  for (let i = period; i < prices.length; i++) {
    const currentEma = prices[i] * k + prevEma * (1 - k)
    result.push(currentEma)
    prevEma = currentEma
  }

  return result
}

/**
 * Relative Strength Index (14-period by default)
 * RSI = 100 - (100 / (1 + RS))
 * where RS = Average Gain / Average Loss
 */
export function rsi(prices: number[], period: number = 14): number | null {
  if (prices.length < period + 1) return null

  let avgGain = 0
  let avgLoss = 0

  // Initial average gain/loss
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1]
    if (change > 0) avgGain += change
    else avgLoss += Math.abs(change)
  }
  avgGain /= period
  avgLoss /= period

  // Smoothed RSI for remaining periods
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1]
    const gain = change > 0 ? change : 0
    const loss = change < 0 ? Math.abs(change) : 0
    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period
  }

  if (avgGain === 0 && avgLoss === 0) return 50  // Flat prices — neutral RSI
  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return Math.round((100 - 100 / (1 + rs)) * 100) / 100
}

/**
 * Volume-Price Trend (VPT)
 * VPT = Previous VPT + Volume × ((Close - Previous Close) / Previous Close)
 * Returns the final VPT value normalized as % change from baseline
 */
export function volumePriceTrend(
  prices: number[],
  volumes: number[]
): number | null {
  if (prices.length < 2 || volumes.length < 2) return null
  if (prices.length !== volumes.length) return null

  let vpt = 0
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] === 0) continue
    vpt += volumes[i] * ((prices[i] - prices[i - 1]) / prices[i - 1])
  }

  // Normalize to a reasonable range
  const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length
  if (avgVolume === 0) return 0

  // Return as percentage of average volume
  return Math.round((vpt / avgVolume) * 100 * 100) / 100
}

/**
 * Price vs EMA deviation (percentage)
 * Positive = price above EMA (bullish), Negative = below (bearish)
 */
export function priceVsEMA(currentPrice: number, emaValue: number): number {
  if (emaValue === 0) return 0
  return Math.round(((currentPrice - emaValue) / emaValue) * 100 * 100) / 100
}

// ─────────────────────────────────────────────────
// Per-Metric Scoring (0-10)
// ─────────────────────────────────────────────────

/** Technical metric names as used in the V2 model */
export type TechnicalMetricName =
  | 'price_vs_ema20'
  | 'price_vs_ema50'
  | 'price_vs_ema200'
  | 'rsi'
  | 'volume_price_trend'

/**
 * Score a single technical metric on a 0-10 scale.
 *
 * Scoring logic (from V2 Expert Model):
 * - EMA metrics: distance above/below EMA → 0-10
 * - RSI: 30-70 neutral zone, extremes penalized
 * - VPT: positive trend = higher score
 */
export function scoreTechnicalMetric(
  metricName: TechnicalMetricName,
  rawValue: number
): number {
  switch (metricName) {
    case 'price_vs_ema20':
      return scoreEMADeviation(rawValue, 'short')
    case 'price_vs_ema50':
      return scoreEMADeviation(rawValue, 'medium')
    case 'price_vs_ema200':
      return scoreEMADeviation(rawValue, 'long')
    case 'rsi':
      return scoreRSI(rawValue)
    case 'volume_price_trend':
      return scoreVPT(rawValue)
    default:
      return 5  // Neutral default
  }
}

/**
 * Score EMA deviation on 0-10 scale.
 * Different thresholds for short/medium/long term EMAs.
 */
function scoreEMADeviation(
  deviationPct: number,
  term: 'short' | 'medium' | 'long'
): number {
  // Thresholds vary by EMA period (shorter EMAs have tighter ranges)
  const thresholds = {
    short:  { strong: 5, moderate: 2, slight: 0 },   // 20-day
    medium: { strong: 10, moderate: 5, slight: 0 },   // 50-day
    long:   { strong: 20, moderate: 10, slight: 0 },   // 200-day
  }

  const t = thresholds[term]

  if (deviationPct >= t.strong) return 10
  if (deviationPct >= t.moderate) return 8
  if (deviationPct >= t.slight) return 6
  if (deviationPct >= -t.slight) return 5      // Near EMA (neutral)
  if (deviationPct >= -t.moderate) return 3
  if (deviationPct >= -t.strong) return 1
  return 0
}

/**
 * Score RSI on 0-10 scale.
 * Optimal zone: 40-60 (trending momentum without overextension)
 */
function scoreRSI(rsiValue: number): number {
  if (rsiValue >= 80) return 1    // Extremely overbought
  if (rsiValue >= 70) return 3    // Overbought
  if (rsiValue >= 60) return 7    // Bullish momentum
  if (rsiValue >= 50) return 10   // Strong bullish
  if (rsiValue >= 40) return 8    // Healthy pullback
  if (rsiValue >= 30) return 5    // Neutral-weak
  if (rsiValue >= 20) return 3    // Oversold
  return 1                         // Extremely oversold
}

/**
 * Score Volume-Price Trend on 0-10 scale.
 * Positive VPT = accumulation (bullish), Negative = distribution (bearish)
 */
function scoreVPT(vptValue: number): number {
  if (vptValue >= 50) return 10
  if (vptValue >= 30) return 9
  if (vptValue >= 15) return 8
  if (vptValue >= 5) return 7
  if (vptValue >= 0) return 5
  if (vptValue >= -5) return 4
  if (vptValue >= -15) return 3
  if (vptValue >= -30) return 2
  return 1
}

// ─────────────────────────────────────────────────
// Technical Composite Score
// ─────────────────────────────────────────────────

/** Default weights for technical metrics in V2 model */
const DEFAULT_TECHNICAL_WEIGHTS: Record<TechnicalMetricName, number> = {
  price_vs_ema20: 0.15,
  price_vs_ema50: 0.20,
  price_vs_ema200: 0.25,
  rsi: 0.20,
  volume_price_trend: 0.20,
}

/**
 * Compute composite technical score from individual metric scores.
 * Individual scores are 0-10, composite is 0-100.
 */
export function computeTechnicalComposite(
  metricScores: Partial<Record<TechnicalMetricName, number>>,
  weights: Partial<Record<TechnicalMetricName, number>> = DEFAULT_TECHNICAL_WEIGHTS
): number {
  let totalWeight = 0
  let weightedSum = 0

  for (const [metric, score] of Object.entries(metricScores)) {
    const weight = weights[metric as TechnicalMetricName] ?? 0.2
    weightedSum += score * weight
    totalWeight += weight
  }

  if (totalWeight === 0) return 0

  // Normalize for available metrics, then scale 0-10 → 0-100
  const averageScore = weightedSum / totalWeight
  return Math.min(100, Math.max(0, Math.round(averageScore * 10 * 100) / 100))
}

/**
 * Full technical analysis from raw price/volume data.
 * Convenience function that runs all calculations and returns the composite.
 */
export function analyzeTechnical(
  prices: number[],
  volumes: number[],
  currentPrice: number
): {
  metricScores: Record<TechnicalMetricName, number>
  rawValues: Record<TechnicalMetricName, number | null>
  compositeScore: number
} {
  // Calculate EMAs
  const ema20 = ema(prices, 20)
  const ema50 = ema(prices, 50)
  const ema200 = ema(prices, 200)

  // Get latest EMA values
  const latestEma20 = ema20.length > 0 ? ema20[ema20.length - 1] : null
  const latestEma50 = ema50.length > 0 ? ema50[ema50.length - 1] : null
  const latestEma200 = ema200.length > 0 ? ema200[ema200.length - 1] : null

  // Calculate deviations
  const dev20 = latestEma20 != null ? priceVsEMA(currentPrice, latestEma20) : null
  const dev50 = latestEma50 != null ? priceVsEMA(currentPrice, latestEma50) : null
  const dev200 = latestEma200 != null ? priceVsEMA(currentPrice, latestEma200) : null

  // RSI
  const rsiValue = rsi(prices)

  // VPT
  const vptValue = volumePriceTrend(prices, volumes)

  // Score each metric
  const metricScores: Record<TechnicalMetricName, number> = {
    price_vs_ema20: dev20 != null ? scoreTechnicalMetric('price_vs_ema20', dev20) : 5,
    price_vs_ema50: dev50 != null ? scoreTechnicalMetric('price_vs_ema50', dev50) : 5,
    price_vs_ema200: dev200 != null ? scoreTechnicalMetric('price_vs_ema200', dev200) : 5,
    rsi: rsiValue != null ? scoreTechnicalMetric('rsi', rsiValue) : 5,
    volume_price_trend: vptValue != null ? scoreTechnicalMetric('volume_price_trend', vptValue) : 5,
  }

  const rawValues: Record<TechnicalMetricName, number | null> = {
    price_vs_ema20: dev20,
    price_vs_ema50: dev50,
    price_vs_ema200: dev200,
    rsi: rsiValue,
    volume_price_trend: vptValue,
  }

  return {
    metricScores,
    rawValues,
    compositeScore: computeTechnicalComposite(metricScores),
  }
}
