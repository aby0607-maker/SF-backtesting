import { ArrowLeftRight, Plus } from 'lucide-react'
import { cn, getScoreColor, getVerdictBadgeClass } from '@/lib/utils'

// Placeholder data
const stocks = [
  {
    symbol: 'AXISBANK',
    name: 'Axis Bank',
    score: 7.8,
    verdict: 'BUY',
    metrics: {
      'P/E Ratio': '12.5x',
      'ROE': '16.2%',
      'Net Margin': '18.4%',
      'Debt/Equity': '0.8',
      '5Y CAGR': '14.2%',
    },
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank',
    score: 8.4,
    verdict: 'STRONG BUY',
    metrics: {
      'P/E Ratio': '18.2x',
      'ROE': '17.8%',
      'Net Margin': '22.1%',
      'Debt/Equity': '0.6',
      '5Y CAGR': '16.8%',
    },
  },
]

export function Compare() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-h2 flex items-center gap-2">
          <ArrowLeftRight className="w-7 h-7 text-primary-600" />
          Compare Stocks
        </h1>
        <p className="text-body text-content-secondary mt-1">
          Side-by-side comparison of key metrics
        </p>
      </div>

      {/* Stock Selectors */}
      <div className="grid grid-cols-2 gap-4">
        {stocks.map((stock, i) => (
          <div key={stock.symbol} className="card text-center">
            <div className="font-medium text-content-secondary mb-1">Stock {i + 1}</div>
            <div className="text-h4">{stock.name}</div>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className={cn('text-h3', getScoreColor(stock.score))}>{stock.score}</span>
              <span className={cn('badge', getVerdictBadgeClass(stock.verdict))}>{stock.verdict}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 text-body-sm font-medium text-content-secondary">Metric</th>
                {stocks.map(stock => (
                  <th key={stock.symbol} className="text-center p-4 text-body-sm font-medium">
                    {stock.symbol}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(stocks[0].metrics).map(metric => (
                <tr key={metric} className="border-b border-gray-100 last:border-0">
                  <td className="p-4 text-body-sm text-content-secondary">{metric}</td>
                  {stocks.map(stock => (
                    <td key={stock.symbol} className="p-4 text-center font-medium">
                      {stock.metrics[metric as keyof typeof stock.metrics]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Button */}
      <button className="btn-secondary w-full flex items-center justify-center gap-2">
        <Plus className="w-5 h-5" />
        Add Another Stock to Compare
      </button>
    </div>
  )
}
