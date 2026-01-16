import { cn } from '@/lib/utils'

interface MetricBarProps {
  value: number
  sectorAvg?: number
  label?: string
  unit?: string
  min?: number
  max?: number
  higherIsBetter?: boolean
  showLabels?: boolean
  className?: string
}

export function MetricBar({
  value,
  sectorAvg,
  label,
  unit = '%',
  min = 0,
  max = 100,
  higherIsBetter = true,
  showLabels = true,
  className,
}: MetricBarProps) {
  const range = max - min
  const valuePercent = Math.min(100, Math.max(0, ((value - min) / range) * 100))
  const sectorPercent = sectorAvg !== undefined
    ? Math.min(100, Math.max(0, ((sectorAvg - min) / range) * 100))
    : undefined

  // Determine if value is good relative to sector
  const isAboveSector = sectorAvg !== undefined && value > sectorAvg
  const isGood = higherIsBetter ? isAboveSector : !isAboveSector

  return (
    <div className={cn('space-y-1', className)}>
      <div className="relative h-2 bg-neutral-100 rounded-full overflow-hidden">
        {/* Value bar */}
        <div
          className={cn(
            'absolute h-full rounded-full transition-all duration-500 ease-out',
            isGood ? 'bg-emerald-500' : sectorAvg !== undefined ? 'bg-amber-500' : 'bg-primary-500'
          )}
          style={{ width: `${valuePercent}%` }}
        />
        {/* Sector average marker */}
        {sectorPercent !== undefined && (
          <div
            className="absolute top-0 h-full w-0.5 bg-neutral-400"
            style={{ left: `${sectorPercent}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-neutral-400" />
          </div>
        )}
      </div>
      {showLabels && (
        <div className="flex justify-between text-xs text-neutral-500">
          <span>{label ? `${label}: ` : ''}{value.toFixed(1)}{unit}</span>
          {sectorAvg !== undefined && (
            <span>Sector Avg: {sectorAvg.toFixed(1)}{unit}</span>
          )}
        </div>
      )}
    </div>
  )
}

// Percentile indicator showing position relative to sector
interface PercentileBarProps {
  percentile: number
  label?: string
  className?: string
}

export function PercentileBar({
  percentile,
  label,
  className,
}: PercentileBarProps) {
  const isTop = percentile >= 75
  const isAboveAverage = percentile >= 50

  return (
    <div className={cn('space-y-2', className)}>
      {label && <span className="text-xs text-neutral-500">{label}</span>}
      <div className="relative">
        <div className="h-1.5 bg-gradient-to-r from-red-200 via-amber-200 to-emerald-200 rounded-full" />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white shadow-md transition-all duration-500"
          style={{
            left: `${percentile}%`,
            backgroundColor: isTop ? '#10B981' : isAboveAverage ? '#F59E0B' : '#EF4444',
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-neutral-400">
        <span>0%</span>
        <span className="font-medium text-neutral-600">Top {100 - percentile}%</span>
        <span>100%</span>
      </div>
    </div>
  )
}

// Compact comparison showing value vs benchmark
interface ComparisonBadgeProps {
  value: number | string
  benchmark?: number | string
  label: string
  comparison?: 'above' | 'below' | 'inline'
  className?: string
}

export function ComparisonBadge({
  value,
  benchmark,
  label,
  comparison,
  className,
}: ComparisonBadgeProps) {
  const getComparisonColor = () => {
    if (!comparison) return 'text-neutral-600'
    switch (comparison) {
      case 'above':
        return 'text-emerald-600'
      case 'below':
        return 'text-red-500'
      default:
        return 'text-amber-600'
    }
  }

  return (
    <div className={cn('flex items-center justify-between p-3 bg-neutral-50 rounded-xl', className)}>
      <div>
        <span className="text-xs text-neutral-500 block">{label}</span>
        <span className={cn('text-lg font-semibold', getComparisonColor())}>{value}</span>
      </div>
      {benchmark !== undefined && (
        <div className="text-right">
          <span className="text-xs text-neutral-400 block">Sector Avg</span>
          <span className="text-sm text-neutral-600">{benchmark}</span>
        </div>
      )}
    </div>
  )
}
