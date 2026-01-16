import { cn } from '@/lib/utils'
import type { SegmentScore } from '@/types'

interface SegmentRadarProps {
  segments: SegmentScore[]
  size?: number
  className?: string
}

export function SegmentRadar({
  segments,
  size = 280,
  className,
}: SegmentRadarProps) {
  const center = size / 2
  const maxRadius = (size / 2) - 40 // Leave room for labels

  const levels = [2, 4, 6, 8, 10]
  const angleStep = (2 * Math.PI) / segments.length

  // Calculate points for each segment
  const getPoint = (index: number, value: number) => {
    const angle = (index * angleStep) - Math.PI / 2 // Start from top
    const radius = (value / 10) * maxRadius
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    }
  }

  // Generate polygon path
  const polygonPoints = segments.map((seg, i) => {
    const point = getPoint(i, seg.score)
    return `${point.x},${point.y}`
  }).join(' ')

  // Generate grid circles
  const gridCircles = levels.map(level => {
    const radius = (level / 10) * maxRadius
    return (
      <circle
        key={level}
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#E5E7EB"
        strokeWidth="1"
        strokeDasharray={level === 10 ? 'none' : '4 4'}
      />
    )
  })

  // Generate axis lines and labels
  const axisElements = segments.map((seg, i) => {
    const angle = (i * angleStep) - Math.PI / 2
    const endX = center + maxRadius * Math.cos(angle)
    const endY = center + maxRadius * Math.sin(angle)
    const labelX = center + (maxRadius + 25) * Math.cos(angle)
    const labelY = center + (maxRadius + 25) * Math.sin(angle)

    // Short segment name
    const shortName = seg.name.length > 12 ? seg.name.slice(0, 10) + '..' : seg.name

    return (
      <g key={seg.id}>
        <line
          x1={center}
          y1={center}
          x2={endX}
          y2={endY}
          stroke="#E5E7EB"
          strokeWidth="1"
        />
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-[9px] fill-neutral-500"
        >
          {shortName}
        </text>
      </g>
    )
  })

  // Generate score dots
  const scoreDots = segments.map((seg, i) => {
    const point = getPoint(i, seg.score)
    const color = seg.status === 'positive' ? '#10B981'
      : seg.status === 'negative' ? '#EF4444'
      : '#F59E0B'

    return (
      <circle
        key={`dot-${seg.id}`}
        cx={point.x}
        cy={point.y}
        r="4"
        fill={color}
        stroke="white"
        strokeWidth="2"
      />
    )
  })

  return (
    <div className={cn('relative', className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid circles */}
        {gridCircles}

        {/* Axis lines and labels */}
        {axisElements}

        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(126, 95, 247, 0.15)"
          stroke="#7E5FF7"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Score dots */}
        {scoreDots}

        {/* Center labels */}
        {levels.filter(l => l % 2 === 0).map(level => (
          <text
            key={`label-${level}`}
            x={center + 8}
            y={center - (level / 10) * maxRadius}
            className="text-[8px] fill-neutral-400"
          >
            {level}
          </text>
        ))}
      </svg>
    </div>
  )
}

// Compact segment bars for quick overview
interface SegmentBarsProps {
  segments: SegmentScore[]
  showLabels?: boolean
  className?: string
}

export function SegmentBars({
  segments,
  showLabels = true,
  className,
}: SegmentBarsProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {segments.map(seg => {
        const color = seg.status === 'positive' ? 'bg-emerald-500'
          : seg.status === 'negative' ? 'bg-red-500'
          : 'bg-amber-500'

        return (
          <div key={seg.id} className="flex items-center gap-2">
            {showLabels && (
              <span className="text-xs text-neutral-500 w-20 truncate">{seg.name}</span>
            )}
            <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-500', color)}
                style={{ width: `${(seg.score / 10) * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium text-neutral-700 w-8 text-right">
              {seg.score.toFixed(1)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
