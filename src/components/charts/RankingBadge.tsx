import { cn } from '@/lib/utils'
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface RankingBadgeProps {
  rank: number
  total: number
  label?: string
  category?: string
  trend?: 'up' | 'down' | 'stable'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function RankingBadge({
  rank,
  total,
  label,
  category,
  trend,
  size = 'md',
  className,
}: RankingBadgeProps) {
  const displayLabel = label || category
  const percentile = ((total - rank) / total) * 100
  const isTop3 = rank <= 3
  const isTopQuartile = percentile >= 75
  const isBottomQuartile = percentile < 25

  const getBgColor = () => {
    if (isTop3) return 'bg-gradient-to-br from-amber-400 to-amber-500'
    if (isTopQuartile) return 'bg-gradient-to-br from-emerald-400 to-emerald-500'
    if (isBottomQuartile) return 'bg-gradient-to-br from-red-400 to-red-500'
    return 'bg-gradient-to-br from-neutral-400 to-neutral-500'
  }

  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-xl',
    lg: 'w-20 h-20 text-2xl',
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'rounded-2xl flex items-center justify-center text-white font-bold shadow-lg',
          getBgColor(),
          sizeClasses[size]
        )}
      >
        #{rank}
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-neutral-900">
            Rank {rank} of {total}
          </span>
          {trend && (
            <span className={cn(
              'ml-1',
              trend === 'up' && 'text-emerald-500',
              trend === 'down' && 'text-red-500',
              trend === 'stable' && 'text-neutral-400'
            )}>
              {trend === 'up' && <TrendingUp className="w-4 h-4" />}
              {trend === 'down' && <TrendingDown className="w-4 h-4" />}
              {trend === 'stable' && <Minus className="w-4 h-4" />}
            </span>
          )}
        </div>
        {displayLabel && (
          <span className="text-xs text-neutral-500">in {displayLabel}</span>
        )}
        <span className="text-xs text-neutral-400 mt-0.5">
          Top {Math.round(100 - percentile)}% of sector
        </span>
      </div>
    </div>
  )
}

// Compact inline rank indicator
interface InlineRankProps {
  rank: number
  total: number
  className?: string
}

export function InlineRank({ rank, total, className }: InlineRankProps) {
  const percentile = ((total - rank) / total) * 100
  const isTop = percentile >= 75

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
      isTop ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-600',
      className
    )}>
      <Trophy className="w-3 h-3" />
      #{rank}/{total}
    </span>
  )
}

// Sector comparison card
interface SectorComparisonProps {
  score: number
  sectorAvg: number
  sectorRank: number
  sectorTotal: number
  sectorName?: string
  className?: string
}

export function SectorComparison({
  score,
  sectorAvg,
  sectorRank,
  sectorTotal,
  sectorName = 'Sector',
  className,
}: SectorComparisonProps) {
  const diff = score - sectorAvg
  const isAbove = diff > 0

  return (
    <div className={cn(
      'p-4 rounded-2xl bg-gradient-to-br',
      isAbove ? 'from-emerald-50 to-emerald-100' : 'from-amber-50 to-amber-100',
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-neutral-600">{sectorName} Comparison</span>
        <InlineRank rank={sectorRank} total={sectorTotal} />
      </div>
      <div className="flex items-end gap-4">
        <div>
          <span className="text-3xl font-bold text-neutral-900">{score.toFixed(1)}</span>
          <span className="text-neutral-400 ml-1">/ 10</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-neutral-500">vs</span>
          <span className="text-lg text-neutral-600">{sectorAvg.toFixed(1)}</span>
          <span className={cn(
            'text-sm font-medium px-2 py-0.5 rounded-full',
            isAbove ? 'bg-emerald-200 text-emerald-700' : 'bg-amber-200 text-amber-700'
          )}>
            {isAbove ? '+' : ''}{diff.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  )
}
