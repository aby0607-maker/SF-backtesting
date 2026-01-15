import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

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
}

// Get human-readable status label
function getStatusLabel(score: number): { label: string; colorClass: string } {
  if (score >= 8) return { label: 'Great', colorClass: 'text-success-400' }
  if (score >= 6) return { label: 'Good', colorClass: 'text-teal-400' }
  if (score >= 4) return { label: 'Fair', colorClass: 'text-warning-400' }
  return { label: 'Weak', colorClass: 'text-destructive-400' }
}

// Get contextual "so-what" explanation
function getContextualInsight(segment: Segment): string {
  // Prioritize quickInsight if available
  if (segment.quickInsight) {
    return segment.quickInsight
  }

  // Fall back to sector rank context
  if (segment.sectorRank && segment.sectorTotal) {
    const percentile = Math.round(((segment.sectorTotal - segment.sectorRank + 1) / segment.sectorTotal) * 100)

    if (segment.sectorRank === 1) {
      return `#1 in sector - Industry leader`
    } else if (percentile >= 80) {
      return `Top ${100 - percentile + 1}% in sector`
    } else if (percentile >= 50) {
      return `#${segment.sectorRank} of ${segment.sectorTotal} peers`
    } else if (percentile >= 30) {
      return `Below average vs ${segment.sectorTotal} peers`
    } else {
      return `Bottom quartile in sector`
    }
  }

  // Fall back to sector avg comparison
  if (segment.sectorAvg) {
    const diff = segment.score - segment.sectorAvg
    if (diff > 1) return `+${diff.toFixed(1)} above sector avg`
    if (diff < -1) return `${diff.toFixed(1)} below sector avg`
    return `At sector average`
  }

  return ''
}

// Score bar color
function getScoreColor(score: number): string {
  if (score >= 8) return '#22c55e'
  if (score >= 6) return '#2dd4bf'
  if (score >= 4) return '#fbbf24'
  return '#f87171'
}

export function SegmentBar({
  segments,
  onSegmentClick,
  className,
}: SegmentBarProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {segments.map((segment, index) => {
        const { label, colorClass } = getStatusLabel(segment.score)
        const insight = getContextualInsight(segment)

        return (
          <motion.div
            key={segment.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03, duration: 0.2 }}
            onClick={() => onSegmentClick?.(segment.id)}
            className={cn(
              'group py-2.5 px-3 -mx-3 rounded-lg',
              'cursor-pointer transition-all duration-150',
              'hover:bg-white/[0.03]'
            )}
          >
            {/* Main row */}
            <div className="flex items-center gap-3">
              {/* Status indicator dot */}
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full flex-shrink-0',
                  segment.status === 'positive' && 'bg-success-500',
                  segment.status === 'neutral' && 'bg-neutral-500',
                  segment.status === 'negative' && 'bg-destructive-400'
                )}
              />

              {/* Segment name */}
              <span className="flex-1 text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                {segment.name}
              </span>

              {/* Status label (Great/Good/Fair/Weak) */}
              <span className={cn('text-xs font-semibold uppercase tracking-wide', colorClass)}>
                {label}
              </span>

              {/* Score bar - compact */}
              <div className="w-12 h-1 bg-dark-600/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(segment.score / 10) * 100}%` }}
                  transition={{ delay: index * 0.03 + 0.1, duration: 0.4, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: getScoreColor(segment.score) }}
                />
              </div>

              {/* Arrow */}
              <ChevronRight
                className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400 group-hover:translate-x-0.5 transition-all"
              />
            </div>

            {/* Contextual insight row */}
            {insight && (
              <div className="ml-[18px] mt-1">
                <span className="text-xs text-neutral-500">{insight}</span>
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
