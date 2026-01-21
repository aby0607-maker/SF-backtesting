/**
 * Centralized scoring utilities for consistent score display across the app
 */

// Score band thresholds
export const SCORE_THRESHOLDS = {
  EXCELLENT: 8,
  GOOD: 6,
  FAIR: 4,
} as const

// Score band types
export type ScoreBandType = 'excellent' | 'good' | 'fair' | 'poor'

export interface ScoreBandInfo {
  band: ScoreBandType
  label: string
  shortLabel: string
  colorClass: string
  bgClass: string
  borderClass: string
  hexColor: string
  gradientColors: [string, string]
}

/**
 * Get complete score band information for a given score
 */
export function getScoreBand(score: number): ScoreBandInfo {
  if (score >= SCORE_THRESHOLDS.EXCELLENT) {
    return {
      band: 'excellent',
      label: 'Excellent',
      shortLabel: 'GREAT',
      colorClass: 'text-success-400',
      bgClass: 'bg-success-500/10',
      borderClass: 'border-success-500/30',
      hexColor: '#00C489',
      gradientColors: ['#00C489', '#22c55e'],
    }
  }
  if (score >= SCORE_THRESHOLDS.GOOD) {
    return {
      band: 'good',
      label: 'Good',
      shortLabel: 'GOOD',
      colorClass: 'text-teal-400',
      bgClass: 'bg-teal-500/10',
      borderClass: 'border-teal-500/30',
      hexColor: '#69E2B0',
      gradientColors: ['#69E2B0', '#2dd4bf'],
    }
  }
  if (score >= SCORE_THRESHOLDS.FAIR) {
    return {
      band: 'fair',
      label: 'Fair',
      shortLabel: 'FAIR',
      colorClass: 'text-warning-400',
      bgClass: 'bg-warning-500/10',
      borderClass: 'border-warning-500/30',
      hexColor: '#FC6200',
      gradientColors: ['#FC6200', '#fbbf24'],
    }
  }
  return {
    band: 'poor',
    label: 'Poor',
    shortLabel: 'WEAK',
    colorClass: 'text-destructive-400',
    bgClass: 'bg-destructive-500/10',
    borderClass: 'border-destructive-500/30',
    hexColor: '#f87171',
    gradientColors: ['#f87171', '#ef4444'],
  }
}

/**
 * Get score text color class
 */
export function getScoreColor(score: number): string {
  return getScoreBand(score).colorClass
}

/**
 * Get score background color class
 */
export function getScoreBgColor(score: number): string {
  return getScoreBand(score).bgClass
}

/**
 * Get score hex color for charts
 */
export function getScoreHexColor(score: number): string {
  return getScoreBand(score).hexColor
}

/**
 * Get gradient colors for charts
 */
export function getScoreGradient(score: number): [string, string] {
  return getScoreBand(score).gradientColors
}

/**
 * Get human-readable score label
 */
export function getScoreLabel(score: number): string {
  return getScoreBand(score).shortLabel
}

/**
 * Get verdict label with full styling info
 */
export function getVerdictLabel(score: number): {
  label: string
  colorClass: string
  bgClass: string
} {
  const band = getScoreBand(score)
  return {
    label: band.shortLabel,
    colorClass: band.colorClass,
    bgClass: band.bgClass,
  }
}

/**
 * Get verdict color based on verdict string
 */
export function getVerdictColor(verdict: string): string {
  const v = verdict.toUpperCase()
  if (v.includes('BUY')) return 'text-verdict-buy'
  if (v === 'HOLD' || v === 'STRONG HOLD') return 'text-verdict-hold'
  return 'text-verdict-avoid'
}

/**
 * Get verdict badge class
 */
export function getVerdictBadgeClass(verdict: string): string {
  const v = verdict.toUpperCase()
  if (v.includes('BUY')) return 'badge-buy'
  if (v === 'HOLD' || v === 'STRONG HOLD') return 'badge-hold'
  return 'badge-avoid'
}

/**
 * Get rank styling based on position
 */
export function getRankStyle(rank: number, total: number): {
  colorClass: string
  bgClass: string
  medal: string | null
  label: string
} {
  const position = rank / total

  if (rank === 1) {
    return {
      colorClass: 'text-amber-400',
      bgClass: 'bg-amber-500/15 border border-amber-500/30',
      medal: '🥇',
      label: 'Top',
    }
  }
  if (rank === 2) {
    return {
      colorClass: 'text-slate-300',
      bgClass: 'bg-slate-400/15 border border-slate-400/30',
      medal: '🥈',
      label: 'Top',
    }
  }
  if (rank === 3) {
    return {
      colorClass: 'text-amber-600',
      bgClass: 'bg-amber-700/15 border border-amber-600/30',
      medal: '🥉',
      label: '',
    }
  }
  if (position <= 0.5) {
    return {
      colorClass: 'text-teal-400',
      bgClass: 'bg-teal-500/10 border border-teal-500/20',
      medal: null,
      label: '',
    }
  }
  if (position <= 0.75) {
    return {
      colorClass: 'text-warning-400',
      bgClass: 'bg-warning-500/10 border border-warning-500/20',
      medal: null,
      label: '',
    }
  }
  return {
    colorClass: 'text-destructive-400',
    bgClass: 'bg-destructive-500/10 border border-destructive-500/20',
    medal: null,
    label: 'Bottom',
  }
}

/**
 * Get glow/shadow effect for score
 */
export function getScoreGlow(score: number): string {
  if (score >= SCORE_THRESHOLDS.EXCELLENT) {
    return 'drop-shadow-[0_0_12px_rgba(0,196,137,0.6)]'
  }
  if (score >= SCORE_THRESHOLDS.GOOD) {
    return 'drop-shadow-[0_0_12px_rgba(105,226,176,0.5)]'
  }
  if (score >= SCORE_THRESHOLDS.FAIR) {
    return 'drop-shadow-[0_0_10px_rgba(252,98,0,0.5)]'
  }
  return 'drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]'
}

/**
 * Get metric status color
 */
export function getMetricStatusColor(status: string): string {
  switch (status) {
    case 'excellent':
    case 'positive':
      return 'text-success-400'
    case 'good':
      return 'text-teal-400'
    case 'fair':
    case 'neutral':
      return 'text-warning-400'
    case 'poor':
    case 'negative':
      return 'text-destructive-400'
    default:
      return 'text-neutral-400'
  }
}

/**
 * Get trend color based on direction
 */
export function getTrendColor(trend: 'up' | 'down' | 'flat' | 'improving' | 'declining' | 'stable'): string {
  switch (trend) {
    case 'up':
    case 'improving':
      return 'text-success-400'
    case 'down':
    case 'declining':
      return 'text-destructive-400'
    default:
      return 'text-neutral-400'
  }
}
