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

export function SegmentBar({
  segments,
  onSegmentClick,
  className,
}: SegmentBarProps) {
  return (
    <div className={cn('space-y-0.5', className)}>
      {segments.map((segment, index) => (
        <motion.div
          key={segment.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03, duration: 0.2 }}
          onClick={() => onSegmentClick?.(segment.id)}
          className={cn(
            'group flex items-center gap-3 py-2.5 px-3 -mx-3 rounded-lg',
            'cursor-pointer transition-all duration-150',
            'hover:bg-white/[0.03]'
          )}
        >
          {/* Status indicator */}
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

          {/* Score bar - minimal */}
          <div className="w-16 h-1.5 bg-dark-600/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(segment.score / 10) * 100}%` }}
              transition={{ delay: index * 0.03 + 0.1, duration: 0.4, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: getScoreColor(segment.score) }}
            />
          </div>

          {/* Score value */}
          <span className={cn('w-8 text-right text-sm font-semibold tabular-nums', getScoreColorClass(segment.score))}>
            {segment.score.toFixed(1)}
          </span>

          {/* Arrow - subtle */}
          <ChevronRight
            className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400 group-hover:translate-x-0.5 transition-all"
          />
        </motion.div>
      ))}
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
