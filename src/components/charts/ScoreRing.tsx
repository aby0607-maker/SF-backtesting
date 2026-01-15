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
  sm: { width: 56, stroke: 4, fontSize: 'text-base', subFontSize: 'text-[10px]' },
  md: { width: 80, stroke: 5, fontSize: 'text-xl', subFontSize: 'text-xs' },
  lg: { width: 120, stroke: 6, fontSize: 'text-3xl', subFontSize: 'text-xs' },
  xl: { width: 160, stroke: 8, fontSize: 'text-4xl', subFontSize: 'text-sm' },
}

function getSizeConfig(size: 'sm' | 'md' | 'lg' | 'xl' | number) {
  if (typeof size === 'number') {
    const stroke = Math.max(4, Math.round(size * 0.05))
    const fontSize = size >= 160 ? 'text-4xl' : size >= 120 ? 'text-3xl' : size >= 80 ? 'text-xl' : 'text-base'
    const subFontSize = size >= 120 ? 'text-xs' : 'text-[10px]'
    return { width: size, stroke, fontSize, subFontSize }
  }
  return sizeConfig[size]
}

// Figma design system colors
function getScoreColor(score: number): string {
  if (score >= 7.5) return '#00C489' // Success green
  if (score >= 6) return '#FC6200' // Warning orange
  if (score >= 4) return '#FC721A' // Warning orange lighter
  return '#F63A63' // Destructive red
}

function getScoreGradient(score: number): [string, string] {
  if (score >= 7.5) return ['#00C489', '#34D399'] // Success gradient
  if (score >= 6) return ['#FC6200', '#FC721A'] // Warning gradient
  if (score >= 4) return ['#FC721A', '#FDA167'] // Warning-light gradient
  return ['#F63A63', '#FB4E73'] // Destructive gradient
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
            stroke="#E5E7EB"
            strokeWidth={config.stroke}
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
          <span
            className={cn('font-bold tabular-nums', config.fontSize)}
            style={{ color: getScoreColor(score) }}
          >
            {score.toFixed(1)}
          </span>
          <span className={cn('text-neutral-400 -mt-0.5', config.subFontSize)}>/ {maxScore}</span>
        </div>
      </div>
      {showLabel && label && (
        <span className="mt-2 text-sm font-medium text-neutral-600">{label}</span>
      )}
    </div>
  )
}
