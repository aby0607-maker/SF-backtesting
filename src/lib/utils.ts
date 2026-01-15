import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format number as Indian currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Format number with Indian number system (lakhs, crores)
 */
export function formatIndianNumber(value: number): string {
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(2)} Cr`
  } else if (value >= 100000) {
    return `${(value / 100000).toFixed(2)} L`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} K`
  }
  return value.toString()
}

/**
 * Format percentage with + or - sign
 */
export function formatPercent(value: number, decimals: number = 2): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

/**
 * Get score color based on value
 */
export function getScoreColor(score: number): string {
  if (score >= 8) return 'text-score-excellent'
  if (score >= 6) return 'text-score-high'
  if (score >= 4) return 'text-score-medium'
  return 'text-score-low'
}

/**
 * Get score background color based on value
 */
export function getScoreBgColor(score: number): string {
  if (score >= 8) return 'bg-score-excellent'
  if (score >= 6) return 'bg-score-high'
  if (score >= 4) return 'bg-score-medium'
  return 'bg-score-low'
}

/**
 * Get verdict color
 */
export function getVerdictColor(verdict: string): string {
  const v = verdict.toUpperCase()
  if (v.includes('BUY')) return 'text-verdict-buy'
  if (v === 'HOLD') return 'text-verdict-hold'
  return 'text-verdict-avoid'
}

/**
 * Get verdict badge class
 */
export function getVerdictBadgeClass(verdict: string): string {
  const v = verdict.toUpperCase()
  if (v.includes('BUY')) return 'badge-buy'
  if (v === 'HOLD') return 'badge-hold'
  return 'badge-avoid'
}

/**
 * Format date to relative time
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return then.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })
}

/**
 * Format date to display format
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}
