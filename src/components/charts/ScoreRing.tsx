import { cn } from '@/lib/utils'

interface ScoreRingProps {
  score: number
  maxScore?: number
  size?: 'sm' | 'md' | 'lg' | 'xl' | number
  showLabel?: boolean
  label?: string
  className?: string
}

const sizeConfig = {
  sm: { width: 64, stroke: 4, fontSize: 'text-lg' },
  md: { width: 96, stroke: 6, fontSize: 'text-2xl' },
  lg: { width: 128, stroke: 8, fontSize: 'text-4xl' },
  xl: { width: 160, stroke: 10, fontSize: 'text-5xl' },
}

function getSizeConfig(size: 'sm' | 'md' | 'lg' | 'xl' | number) {
  if (typeof size === 'number') {
    // Calculate stroke and fontSize based on numeric size
    const stroke = Math.max(4, Math.round(size * 0.05))
    const fontSize = size >= 160 ? 'text-5xl' : size >= 128 ? 'text-4xl' : size >= 96 ? 'text-2xl' : 'text-lg'
    return { width: size, stroke, fontSize }
  }
  return sizeConfig[size]
}

function getScoreColor(score: number): string {
  if (score >= 7.5) return '#10B981' // Emerald
  if (score >= 6) return '#F59E0B' // Amber
  if (score >= 4) return '#F97316' // Orange
  return '#EF4444' // Red
}

function getScoreGradient(score: number): [string, string] {
  if (score >= 7.5) return ['#10B981', '#34D399'] // Emerald gradient
  if (score >= 6) return ['#F59E0B', '#FBBF24'] // Amber gradient
  if (score >= 4) return ['#F97316', '#FB923C'] // Orange gradient
  return ['#EF4444', '#F87171'] // Red gradient
}

export function ScoreRing({
  score,
  maxScore = 10,
  size = 'lg',
  showLabel = true,
  label,
  className,
}: ScoreRingProps) {
  const config = getSizeConfig(size)
  const radius = (config.width - config.stroke) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / maxScore) * circumference
  const gradientId = `score-gradient-${Math.random().toString(36).substr(2, 9)}`
  const [colorStart, colorEnd] = getScoreGradient(score)

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative" style={{ width: config.width, height: config.width }}>
        <svg
          width={config.width}
          height={config.width}
          viewBox={`0 0 ${config.width} ${config.width}`}
          className="transform -rotate-90"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colorStart} />
              <stop offset="100%" stopColor={colorEnd} />
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.stroke}
            className="text-neutral-100"
          />
          {/* Progress circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-semibold tabular-nums', config.fontSize)} style={{ color: getScoreColor(score) }}>
            {score.toFixed(1)}
          </span>
          <span className="text-xs text-neutral-400 -mt-1">/ {maxScore}</span>
        </div>
      </div>
      {showLabel && label && (
        <span className="mt-2 text-sm font-medium text-neutral-600">{label}</span>
      )}
    </div>
  )
}
