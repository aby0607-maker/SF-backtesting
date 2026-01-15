import { Briefcase, PieChart, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-h2 flex items-center gap-2">
          <Briefcase className="w-7 h-7 text-primary-600" />
          Portfolio
        </h1>
        <p className="text-body text-content-secondary mt-1">
          Your holdings and performance
        </p>
      </div>

      {/* Portfolio Summary */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-body-sm text-content-secondary">Total Value</div>
            <div className="text-h1">{formatCurrency(totalValue)}</div>
          </div>
          <div className="text-right">
            <div className="text-body-sm text-content-secondary">Total P&L</div>
            <div className={cn('text-h3', totalPnl >= 0 ? 'text-verdict-buy' : 'text-verdict-avoid')}>
              {formatCurrency(totalPnl)} ({formatPercent(totalPnlPercent)})
            </div>
          </div>
        </div>

        {/* Mini allocation chart placeholder */}
        <div className="flex h-3 rounded-full overflow-hidden">
          {currentProfile.portfolio.map((holding, i) => (
            <div
              key={holding.symbol}
              className={cn(
                'h-full',
                i === 0 && 'bg-primary-500',
                i === 1 && 'bg-primary-400',
                i === 2 && 'bg-primary-300'
              )}
              style={{ width: `${holding.allocation}%` }}
            />
          ))}
          {100 - currentProfile.portfolio.reduce((sum, h) => sum + h.allocation, 0) > 0 && (
            <div
              className="h-full bg-gray-200"
              style={{ width: `${100 - currentProfile.portfolio.reduce((sum, h) => sum + h.allocation, 0)}%` }}
            />
          )}
        </div>
      </div>

      {/* Concentration Alert */}
      {hasConcentrationRisk && (
        <div className="card border-2 border-alert-medium bg-amber-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-alert-high flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-alert-high">Concentration Risk Detected</div>
              <div className="text-body-sm text-content-secondary">
                {maxAllocation}% of your portfolio is in a single stock. Consider diversifying to reduce risk.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Holdings */}
      <div className="card">
        <h2 className="text-h4 mb-4">Holdings</h2>
        <div className="space-y-3">
          {currentProfile.portfolio.map(holding => (
            <div
              key={holding.symbol}
              className="flex items-center justify-between p-4 bg-surface-secondary rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{holding.name}</span>
                  <span className="text-body-sm text-content-tertiary">{holding.allocation}%</span>
                </div>
                <div className="text-body-sm text-content-secondary">
                  {holding.quantity} shares @ {formatCurrency(holding.avgPrice)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatCurrency(holding.currentValue)}</div>
                <div className={cn(
                  'flex items-center gap-1 text-body-sm',
                  holding.pnl >= 0 ? 'text-verdict-buy' : 'text-verdict-avoid'
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
      </div>

      {/* Portfolio Health */}
      <div className="card">
        <h2 className="text-h4 flex items-center gap-2 mb-4">
          <PieChart className="w-5 h-5 text-primary-600" />
          Portfolio Health Score
        </h2>
        <div className="text-center p-6 bg-surface-secondary rounded-lg">
          <div className="text-display text-primary-600">7.2</div>
          <div className="text-body text-content-secondary">/10</div>
          <div className="mt-2 text-body-sm text-content-secondary">
            Good diversification, consider reducing IT sector exposure
          </div>
        </div>
      </div>
    </div>
  )
}
