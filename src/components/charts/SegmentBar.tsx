import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ChevronRight, Info } from 'lucide-react'
import type { Metric } from '@/types'

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
  metrics?: Metric[]
}

interface SegmentBarProps {
  segments: Segment[]
  onSegmentClick?: (segmentId: string) => void
  onEvidenceClick?: (segment: Segment) => void
  className?: string
}

// Get human-readable verdict label
function getVerdictLabel(score: number): { label: string; colorClass: string; bgClass: string } {
  if (score >= 8) return { label: 'GREAT', colorClass: 'text-success-400', bgClass: 'bg-success-500/10' }
  if (score >= 6) return { label: 'GOOD', colorClass: 'text-teal-400', bgClass: 'bg-teal-500/10' }
  if (score >= 4) return { label: 'FAIR', colorClass: 'text-warning-400', bgClass: 'bg-warning-500/10' }
  return { label: 'WEAK', colorClass: 'text-destructive-400', bgClass: 'bg-destructive-500/10' }
}

// Get contextual explainer
function getContextualInsight(segment: Segment): string {
  if (segment.quickInsight) {
    return segment.quickInsight
  }

  if (segment.sectorAvg) {
    const diff = segment.score - segment.sectorAvg
    if (diff > 1) return `+${diff.toFixed(1)} above sector average`
    if (diff < -1) return `${diff.toFixed(1)} below sector average`
    return `At sector average`
  }

  return ''
}

// Get score color
function getScoreColorClass(score: number): string {
  if (score >= 8) return 'text-success-400'
  if (score >= 6) return 'text-teal-400'
  if (score >= 4) return 'text-warning-400'
  return 'text-destructive-400'
}

export function SegmentBar({
  segments,
  onSegmentClick,
  onEvidenceClick,
  className,
}: SegmentBarProps) {
  return (
    <div className={cn('', className)}>
      {segments.map((segment, index) => {
        const { label, colorClass } = getVerdictLabel(segment.score)
        const insight = getContextualInsight(segment)
        const hasRank = segment.sectorRank && segment.sectorTotal

        return (
          <motion.div
            key={segment.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03, duration: 0.2 }}
          >
            {/* Divider line */}
            <div className="border-t border-white/5" />

            <div
              className={cn(
                'group py-3 transition-all duration-150',
                'hover:bg-white/[0.02]'
              )}
            >
              {/* Main row */}
              <div className="flex items-center gap-3">
                {/* Rank */}
                <div className="w-12 flex-shrink-0 text-center">
                  {hasRank ? (
                    <span className="text-xs font-medium text-neutral-500">
                      #{segment.sectorRank}/{segment.sectorTotal}
                    </span>
                  ) : (
                    <span className="text-xs text-neutral-600">—</span>
                  )}
                </div>

                {/* Vertical separator */}
                <div className="w-px h-8 bg-white/10 flex-shrink-0" />

                {/* Segment name - clickable */}
                <span
                  onClick={() => onSegmentClick?.(segment.id)}
                  className="flex-1 text-sm font-medium text-white group-hover:text-white/90 transition-colors cursor-pointer"
                >
                  {segment.name}
                </span>

                {/* Evidence info icon */}
                {onEvidenceClick && (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEvidenceClick(segment)
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-1.5 rounded-full bg-white/5 hover:bg-primary-500/20 text-neutral-500 hover:text-primary-400 transition-all"
                    title="View evidence sources"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </motion.button>
                )}

                {/* Verdict badge */}
                <span className={cn(
                  'text-[11px] font-bold tracking-wider',
                  colorClass
                )}>
                  {label}
                </span>

                {/* Score */}
                <span className={cn(
                  'w-8 text-right text-sm font-semibold tabular-nums',
                  getScoreColorClass(segment.score)
                )}>
                  {segment.score.toFixed(1)}
                </span>

                {/* Arrow - clickable for segment deep dive */}
                <ChevronRight
                  onClick={() => onSegmentClick?.(segment.id)}
                  className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 cursor-pointer"
                />
              </div>

              {/* Explainer row */}
              {insight && (
                <div className="mt-1 ml-[60px] pl-3">
                  <span className="text-xs text-neutral-500">{insight}</span>
                </div>
              )}
            </div>
          </motion.div>
        )
      })}
      {/* Bottom divider */}
      <div className="border-t border-white/5" />
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
  const color = score >= 8 ? '#22c55e' : score >= 6 ? '#2dd4bf' : score >= 4 ? '#fbbf24' : '#f87171'

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
        style={{ backgroundColor: color }}
      />
    </div>
  )
}
