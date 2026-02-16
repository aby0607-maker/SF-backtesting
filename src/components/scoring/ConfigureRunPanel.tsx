/**
 * ConfigureRunPanel — Stage 3: Select stocks + date range + benchmark
 *
 * Composes existing selectors (UniverseSelector, DateRangeSelector, BenchmarkSelector)
 * into a single configuration panel for the combined scoring+backtest run.
 */

import { UniverseSelector } from './UniverseSelector'
import { DateRangeSelector } from './DateRangeSelector'
import { BenchmarkSelector } from './BenchmarkSelector'

export function ConfigureRunPanel() {
  return (
    <div className="space-y-4">
      {/* Stock Selection */}
      <div>
        <div className="text-xs font-medium text-neutral-400 mb-2">Select Stocks</div>
        <UniverseSelector />
      </div>

      {/* Date Range & Interval */}
      <div>
        <div className="text-xs font-medium text-neutral-400 mb-2">Backtest Period</div>
        <DateRangeSelector />
      </div>

      {/* Benchmark */}
      <div>
        <div className="text-xs font-medium text-neutral-400 mb-2">Benchmark (Optional)</div>
        <BenchmarkSelector />
      </div>
    </div>
  )
}
