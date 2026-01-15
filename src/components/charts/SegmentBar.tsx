import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

interface Segment {
  id: string
  name: string
  score: number
  status: 'positive' | 'neutral' | 'negative'
}

interface SegmentBarProps {
  segments: Segment[]
  onSegmentClick?: (segmentId: string) => void
  className?: string
}

function getScoreColor(score: number): string {
  if (score >= 8) return '#00C489'
  if (score >= 6) return '#69E2B0'
  if (score >= 4) return '#FC6200'
  return '#F63A63'
}

function getScoreColorClass(score: number): string {
  if (score >= 8) return 'text-success-400'
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
    <div className={cn('space-y-2', className)}>
      {segments.map((segment, index) => (
        <motion.div
          key={segment.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          onClick={() => onSegmentClick?.(segment.id)}
          className={cn(
            'group flex items-center gap-3 p-3 -mx-3 rounded-lg',
            'cursor-pointer transition-all duration-200',
            'hover:bg-white/5'
          )}
        >
          {/* Status indicator */}
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05 + 0.2, type: 'spring' }}
            className={cn(
              'w-2 h-2 rounded-full flex-shrink-0',
              segment.status === 'positive' && 'bg-success-500 shadow-[0_0_6px_rgba(0,196,137,0.6)]',
              segment.status === 'neutral' && 'bg-gray-500',
              segment.status === 'negative' && 'bg-destructive-500 shadow-[0_0_6px_rgba(246,58,99,0.6)]'
            )}
          />

          {/* Segment name */}
          <span className="flex-1 font-medium text-white">{segment.name}</span>

          {/* Score bar */}
          <div className="w-24 h-2 bg-dark-600 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(segment.score / 10) * 100}%` }}
              transition={{ delay: index * 0.05 + 0.1, duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: getScoreColor(segment.score) }}
            />
          </div>

          {/* Score value */}
          <span className={cn('w-12 text-right font-medium', getScoreColorClass(segment.score))}>
            {segment.score.toFixed(1)}
          </span>

          {/* Arrow */}
          <ChevronRight
            className="w-5 h-5 text-gray-600 group-hover:text-primary-400 group-hover:translate-x-1 transition-all"
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
