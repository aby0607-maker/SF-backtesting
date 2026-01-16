import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

interface Segment {
  id: string
  name: string
  score?: number
  status?: 'positive' | 'neutral' | 'negative'
}

interface DIYSegmentListProps {
  segments: Segment[]
  onSegmentClick?: (segmentId: string) => void
  className?: string
}

/**
 * DIY Mode Segment List
 * Shows only segment names - no scores, no ranks, no interpretations
 * User must click into each segment to see raw data
 */
export function DIYSegmentList({
  segments,
  onSegmentClick,
  className,
}: DIYSegmentListProps) {
  return (
    <div className={cn('', className)}>
      {segments.map((segment, index) => (
        <motion.div
          key={segment.id}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03, duration: 0.2 }}
        >
          {/* Divider line */}
          <div className="border-t border-white/5" />

          <button
            onClick={() => onSegmentClick?.(segment.id)}
            className={cn(
              'w-full group py-4 px-2 transition-all duration-150',
              'hover:bg-white/[0.02] flex items-center justify-between'
            )}
          >
            {/* Segment name */}
            <span className="text-sm font-medium text-white group-hover:text-white/90 transition-colors">
              {segment.name}
            </span>

            {/* Arrow indicator */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 group-hover:text-neutral-400 transition-colors">
                View metrics
              </span>
              <ChevronRight
                className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400 group-hover:translate-x-0.5 transition-all flex-shrink-0"
              />
            </div>
          </button>
        </motion.div>
      ))}
      {/* Bottom divider */}
      <div className="border-t border-white/5" />
    </div>
  )
}
