import { Briefcase, PieChart, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'

export function Portfolio() {
  const { currentProfile } = useAppStore()

  if (!currentProfile) return null

  const totalValue = currentProfile.portfolio.reduce((sum, h) => sum + h.currentValue, 0)
  const totalPnl = currentProfile.portfolio.reduce((sum, h) => sum + h.pnl, 0)
  const totalPnlPercent = (totalPnl / (totalValue - totalPnl)) * 100

  // Check for concentration
  const maxAllocation = Math.max(...currentProfile.portfolio.map(h => h.allocation))
  const hasConcentrationRisk = maxAllocation > 40

  // Allocation colors
  const allocationColors = [
    'bg-primary-500',
    'bg-teal-500',
    'bg-warning-500',
    'bg-pink-500',
    'bg-orange-500',
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-primary-400" />
          </div>
          Portfolio
        </h1>
        <p className="text-sm text-neutral-400 mt-1 ml-[52px]">
          Your holdings and performance
        </p>
      </motion.div>

      {/* Portfolio Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl bg-dark-800 border border-white/5 p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Total Value</div>
            <div className="text-3xl font-bold text-white">{formatCurrency(totalValue)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Total P&L</div>
            <div className={cn(
              'text-xl font-bold flex items-center gap-1 justify-end',
              totalPnl >= 0 ? 'text-success-400' : 'text-destructive-400'
            )}>
              {totalPnl >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {formatCurrency(totalPnl)} ({formatPercent(totalPnlPercent)})
            </div>
          </div>
        </div>

        {/* Mini allocation chart */}
        <div className="flex h-3 rounded-full overflow-hidden bg-dark-600">
          {currentProfile.portfolio.map((holding, i) => (
            <div
              key={holding.symbol}
              className={cn('h-full', allocationColors[i % allocationColors.length])}
              style={{ width: `${holding.allocation}%` }}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-3">
          {currentProfile.portfolio.map((holding, i) => (
            <div key={holding.symbol} className="flex items-center gap-1.5">
              <div className={cn('w-2 h-2 rounded-full', allocationColors[i % allocationColors.length])} />
              <span className="text-xs text-neutral-400">
                {holding.symbol} ({holding.allocation}%)
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Concentration Alert */}
      {hasConcentrationRisk && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl bg-warning-500/10 border border-warning-500/30 p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-warning-400">Concentration Risk Detected</div>
              <div className="text-sm text-neutral-400 mt-1">
                {maxAllocation}% of your portfolio is in a single stock. Consider diversifying to reduce risk.
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Holdings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl bg-dark-800 border border-white/5 p-5"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Holdings</h2>
        <div className="space-y-3">
          {currentProfile.portfolio.map((holding, i) => (
            <div
              key={holding.symbol}
              className="flex items-center justify-between p-4 bg-dark-700/50 rounded-xl border border-white/5"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className={cn('w-2 h-2 rounded-full', allocationColors[i % allocationColors.length])} />
                  <span className="font-medium text-white">{holding.name}</span>
                  <span className="text-xs text-neutral-500 px-1.5 py-0.5 bg-dark-600 rounded">
                    {holding.allocation}%
                  </span>
                </div>
                <div className="text-xs text-neutral-500 ml-4">
                  {holding.quantity} shares @ {formatCurrency(holding.avgPrice)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-white">{formatCurrency(holding.currentValue)}</div>
                <div className={cn(
                  'flex items-center gap-1 text-sm justify-end',
                  holding.pnl >= 0 ? 'text-success-400' : 'text-destructive-400'
                )}>
                  {holding.pnl >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {formatPercent(holding.pnlPercent)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Portfolio Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-xl bg-dark-800 border border-white/5 p-5"
      >
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <PieChart className="w-5 h-5 text-primary-400" />
          Portfolio Health Score
        </h2>
        <div className="text-center p-6 bg-dark-700/50 rounded-xl">
          <div className="text-5xl font-bold text-primary-400">7.2</div>
          <div className="text-lg text-neutral-500 mt-1">/10</div>
          <div className="mt-3 text-sm text-neutral-400">
            Good diversification, consider reducing IT sector exposure
          </div>
        </div>
      </motion.div>
    </div>
  )
}
