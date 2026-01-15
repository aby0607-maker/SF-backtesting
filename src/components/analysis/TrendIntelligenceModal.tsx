import { X, TrendingUp, TrendingDown, ArrowRight, CheckCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TrendIntelligence, TrendDirection, VerificationStatus } from '@/types'

interface TrendIntelligenceModalProps {
  isOpen: boolean
  onClose: () => void
  metricName: string
  stockName: string
  trendData: TrendIntelligence
}

export function TrendIntelligenceModal({
  isOpen,
  onClose,
  metricName,
  stockName,
  trendData,
}: TrendIntelligenceModalProps) {
  if (!isOpen) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-success-500 text-white'
      case 'good':
        return 'bg-success-400 text-white'
      case 'fair':
        return 'bg-warning-500 text-dark-900'
      case 'poor':
        return 'bg-destructive-500 text-white'
      default:
        return 'bg-neutral-500 text-white'
    }
  }

  const getTrajectoryIcon = (trajectory: TrendDirection) => {
    switch (trajectory) {
      case 'up':
        return <TrendingUp className="w-5 h-5" />
      case 'down':
        return <TrendingDown className="w-5 h-5" />
      default:
        return <ArrowRight className="w-5 h-5" />
    }
  }

  const getTrajectoryColor = (trajectory: TrendDirection) => {
    switch (trajectory) {
      case 'up':
        return 'text-success-400'
      case 'down':
        return 'text-destructive-400'
      default:
        return 'text-warning-400'
    }
  }

  const getVerificationIcon = (status: VerificationStatus) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-success-400" />
      case 'pending':
        return <Clock className="w-4 h-4 text-warning-400" />
      default:
        return <Clock className="w-4 h-4 text-neutral-400" />
    }
  }

  // Find max value for chart scaling
  const maxValue = Math.max(...trendData.historicalData.map(d => d.value))
  const minValue = Math.min(...trendData.historicalData.map(d => d.value))
  const range = maxValue - minValue || 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-dark-800 rounded-2xl border border-white/10 shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <span className="text-primary-400 font-bold text-lg">P</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                {metricName}
                <span className="text-primary-400">Trend Intelligence</span>
              </h2>
              <p className="text-sm text-neutral-400">
                {stockName.toUpperCase()} • Deep Historical Snapshot
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 p-6">
          {/* Current Point */}
          <div className="bg-dark-700/50 rounded-xl p-4 border border-white/5">
            <span className="text-xs text-neutral-400 uppercase tracking-wider">Current Point</span>
            <div className="mt-2">
              <span className="text-3xl font-bold text-white">{trendData.displayValue}</span>
              <div className="mt-2">
                <span className={cn(
                  'px-2 py-1 rounded text-xs font-medium uppercase',
                  getStatusColor(trendData.status)
                )}>
                  {trendData.status}
                </span>
              </div>
            </div>
          </div>

          {/* Peer Benchmark */}
          <div className="bg-dark-700/50 rounded-xl p-4 border border-white/5">
            <span className="text-xs text-neutral-400 uppercase tracking-wider">Peer Benchmark</span>
            <div className="mt-2">
              <span className="text-3xl font-bold text-white">{trendData.peerBenchmarkDisplay}</span>
              <div className="mt-2">
                <span className="text-primary-400 text-sm font-medium">
                  {trendData.sectorPercentile}TH SECTOR<br />PERCENTILE
                </span>
              </div>
            </div>
          </div>

          {/* Trajectory */}
          <div className="bg-dark-700/50 rounded-xl p-4 border border-white/5">
            <span className="text-xs text-neutral-400 uppercase tracking-wider">Trajectory</span>
            <div className="mt-2">
              <span className={cn(
                'text-2xl font-bold flex items-center gap-2',
                getTrajectoryColor(trendData.trajectory)
              )}>
                {trendData.trajectory.charAt(0).toUpperCase() + trendData.trajectory.slice(1)}
                {getTrajectoryIcon(trendData.trajectory)}
              </span>
              <p className="text-xs text-neutral-500 mt-2">
                {trendData.trajectoryPeriods}-PERIOD DIRECTION
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="bg-dark-700/50 rounded-xl p-4 border border-white/5">
            <span className="text-xs text-neutral-400 uppercase tracking-wider">Status</span>
            <div className="mt-2">
              <span className="text-2xl font-bold text-white flex items-center gap-2">
                Active
                {getVerificationIcon(trendData.verificationStatus)}
              </span>
              <p className="text-xs text-neutral-500 mt-2 uppercase">
                Real-Time Verified
              </p>
            </div>
          </div>
        </div>

        {/* Performance Trajectory Chart */}
        <div className="px-6 pb-6">
          <div className="bg-dark-700/30 rounded-xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-primary-500 rounded-full" />
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Performance Trajectory
                </h3>
              </div>
              <span className="text-xs text-neutral-500 uppercase">
                Values in Standard Units
              </span>
            </div>

            {/* Bar Chart */}
            <div className="flex items-end gap-3 h-48">
              {trendData.historicalData.map((point) => {
                const heightPercent = ((point.value - minValue) / range) * 80 + 20 // Min 20% height
                const isHighest = point.value === maxValue

                return (
                  <div key={point.period} className="flex-1 flex flex-col items-center gap-2">
                    {/* Value label for highest */}
                    {isHighest && (
                      <div className="px-2 py-1 bg-primary-500 rounded text-xs font-medium text-white">
                        {point.displayValue || point.value}
                      </div>
                    )}

                    {/* Bar */}
                    <div
                      className={cn(
                        'w-full rounded-t-lg transition-all duration-500',
                        'bg-gradient-to-t from-primary-600 to-primary-400'
                      )}
                      style={{ height: `${heightPercent}%` }}
                    />

                    {/* Period label */}
                    <span className={cn(
                      'text-xs mt-2',
                      isHighest ? 'text-primary-400 font-medium' : 'text-neutral-500'
                    )}>
                      {point.period}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Compact button to launch trend intelligence
interface TrendIntelligenceButtonProps {
  onClick: () => void
  hasData: boolean
}

export function TrendIntelligenceButton({ onClick, hasData }: TrendIntelligenceButtonProps) {
  if (!hasData) return null

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 bg-dark-700/50 hover:bg-dark-600 rounded-lg border border-white/10 transition-colors group"
    >
      <div className="flex items-center gap-2">
        <span className="text-primary-400 text-xs font-semibold uppercase tracking-wider">
          Trend<br />Intelligence
        </span>
        <span className="text-neutral-500 text-xs">Launch History</span>
      </div>
      {/* Mini bar chart indicator */}
      <div className="flex items-end gap-0.5 h-4">
        {[40, 60, 80, 70, 90].map((h, i) => (
          <div
            key={i}
            className="w-1 bg-gradient-to-t from-primary-600 to-primary-400 rounded-t"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <span className="text-primary-400 text-xs group-hover:translate-x-0.5 transition-transform">
        View →
      </span>
    </button>
  )
}
