import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ChevronRight, Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Segment {
  id: string
  name: string
  score: number
  status: 'positive' | 'neutral' | 'negative'
  sectorRank?: number
  sectorTotal?: number
  sectorAvg?: number
  quickInsight?: string
  weight?: number
}

interface SegmentBarProps {
  segments: Segment[]
  onSegmentClick?: (segmentId: string) => void
  className?: string
  showRanks?: boolean
  showInsights?: boolean
}

// Apple-inspired softer colors
function getScoreColor(score: number): string {
  if (score >= 8) return '#22c55e'  // success-500
  if (score >= 6) return '#2dd4bf'  // teal-400
  if (score >= 4) return '#fbbf24'  // warning-400
  return '#f87171'  // destructive-400
}

function getScoreColorClass(score: number): string {
  if (score >= 8) return 'text-success-500'
  if (score >= 6) return 'text-teal-400'
  if (score >= 4) return 'text-warning-400'
  return 'text-destructive-400'
}

// Simplified rank badge - more minimal
function getRankBadgeStyle(rank: number, total: number) {
  const percentile = ((total - rank + 1) / total) * 100
  if (percentile >= 80) return 'bg-dark-600 text-success-400 border-transparent'
  if (percentile >= 50) return 'bg-dark-600 text-neutral-300 border-transparent'
  if (percentile >= 30) return 'bg-dark-600 text-warning-400 border-transparent'
  return 'bg-dark-600 text-destructive-400 border-transparent'
}

// Get comparison indicator
function getComparisonIndicator(score: number, sectorAvg?: number) {
  if (!sectorAvg) return null
  const diff = score - sectorAvg
  if (diff > 0.5) return { icon: TrendingUp, text: `+${diff.toFixed(1)} vs sector`, color: 'text-success-400' }
  if (diff < -0.5) return { icon: TrendingDown, text: `${diff.toFixed(1)} vs sector`, color: 'text-destructive-400' }
  return { icon: Minus, text: 'At sector avg', color: 'text-neutral-400' }
}

export function SegmentBar({
  segments,
  onSegmentClick,
  className,
  showRanks = true,
  showInsights = true,
}: SegmentBarProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {segments.map((segment, index) => {
        const comparison = getComparisonIndicator(segment.score, segment.sectorAvg)

        return (
          <motion.div
            key={segment.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            onClick={() => onSegmentClick?.(segment.id)}
            className={cn(
              'group p-3 -mx-3 rounded-lg',
              'cursor-pointer transition-all duration-200',
              'hover:bg-white/5'
            )}
          >
            {/* Main Row */}
            <div className="flex items-center gap-3">
              {/* Status indicator - cleaner, no glow */}
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.05 + 0.2, type: 'spring' }}
                className={cn(
                  'w-2 h-2 rounded-full flex-shrink-0',
                  segment.status === 'positive' && 'bg-success-500',
                  segment.status === 'neutral' && 'bg-neutral-500',
                  segment.status === 'negative' && 'bg-destructive-400'
                )}
              />

              {/* Segment name */}
              <span className="flex-1 font-medium text-white">{segment.name}</span>

              {/* Sector Rank Badge */}
              {showRanks && segment.sectorRank && segment.sectorTotal && (
                <span className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium border flex items-center gap-1',
                  getRankBadgeStyle(segment.sectorRank, segment.sectorTotal)
                )}>
                  {segment.sectorRank === 1 && <Trophy className="w-3 h-3" />}
                  #{segment.sectorRank}/{segment.sectorTotal}
                </span>
              )}

              {/* Score bar */}
              <div className="w-20 h-2 bg-dark-600 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(segment.score / 10) * 100}%` }}
                  transition={{ delay: index * 0.05 + 0.1, duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: getScoreColor(segment.score) }}
                />
              </div>

              {/* Score value */}
              <span className={cn('w-10 text-right font-bold', getScoreColorClass(segment.score))}>
                {segment.score.toFixed(1)}
              </span>

              {/* Arrow */}
              <ChevronRight
                className="w-5 h-5 text-gray-600 group-hover:text-primary-400 group-hover:translate-x-1 transition-all"
              />
            </div>

            {/* Quick Insight Row (one-line summary) */}
            {showInsights && (segment.quickInsight || comparison) && (
              <div className="ml-5 mt-1.5 flex items-center gap-3 text-xs">
                {segment.quickInsight && (
                  <span className="text-neutral-400 truncate flex-1">{segment.quickInsight}</span>
                )}
                {comparison && (
                  <span className={cn('flex items-center gap-1 flex-shrink-0', comparison.color)}>
                    <comparison.icon className="w-3 h-3" />
                    {comparison.text}
                  </span>
                )}
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

// Mini version for compact displays
interface MiniSegmentBarProps {
  score: number
  width?: number
  className?: string
}

export function MiniSegmentBar({ score, width = 60, className }: MiniSegmentBarProps) {
  return (
    <div
      className={cn('h-1.5 bg-dark-600 rounded-full overflow-hidden', className)}
      style={{ width }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(score / 10) * 100}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ backgroundColor: getScoreColor(score) }}
      />
    </div>
  )
}
