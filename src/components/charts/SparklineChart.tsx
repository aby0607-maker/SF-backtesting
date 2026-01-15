import { cn } from '@/lib/utils'

interface SparklineChartProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  showArea?: boolean
  showDots?: boolean
  className?: string
}

export function SparklineChart({
  data,
  width = 80,
  height = 32,
  color,
  showArea = true,
  showDots = false,
  className,
}: SparklineChartProps) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  // Determine trend color
  const isPositive = data[data.length - 1] >= data[0]
  const strokeColor = color || (isPositive ? '#10B981' : '#EF4444')

  // Calculate points
  const padding = 4
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth
    const y = padding + chartHeight - ((value - min) / range) * chartHeight
    return `${x},${y}`
  })

  const linePath = `M ${points.join(' L ')}`

  // Create area path
  const areaPath = `${linePath} L ${padding + chartWidth},${padding + chartHeight} L ${padding},${padding + chartHeight} Z`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('overflow-visible', className)}
    >
      {/* Gradient definition */}
      <defs>
        <linearGradient id={`sparkline-gradient-${data.join('')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      {showArea && (
        <path
          d={areaPath}
          fill={`url(#sparkline-gradient-${data.join('')})`}
        />
      )}

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* End dot */}
      {showDots && (
        <circle
          cx={padding + chartWidth}
          cy={padding + chartHeight - ((data[data.length - 1] - min) / range) * chartHeight}
          r="2.5"
          fill={strokeColor}
        />
      )}
    </svg>
  )
}

// Mini trend indicator with value
interface TrendIndicatorProps {
  data: number[]
  currentValue: number | string
  unit?: string
  label?: string
  className?: string
}

export function TrendIndicator({
  data,
  currentValue,
  unit,
  label,
  className,
}: TrendIndicatorProps) {
  const isPositive = data.length >= 2 && data[data.length - 1] >= data[0]
  const changePercent = data.length >= 2
    ? (((data[data.length - 1] - data[0]) / data[0]) * 100).toFixed(1)
    : '0'

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex flex-col">
        <span className="text-2xl font-semibold text-neutral-900">
          {currentValue}{unit && <span className="text-lg text-neutral-500">{unit}</span>}
        </span>
        {label && <span className="text-xs text-neutral-500">{label}</span>}
      </div>
      <div className="flex flex-col items-end gap-1">
        <SparklineChart data={data} width={64} height={24} showArea />
        <span className={cn(
          'text-xs font-medium',
          isPositive ? 'text-emerald-600' : 'text-red-500'
        )}>
          {isPositive ? '+' : ''}{changePercent}% 5Y
        </span>
      </div>
    </div>
  )
}
