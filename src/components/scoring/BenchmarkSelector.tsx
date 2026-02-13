/**
 * BenchmarkSelector — Stage 5: Optional benchmark index for backtest comparison
 */

import { cn } from '@/lib/utils'
import { useScoringStore } from '@/store/useScoringStore'
import { BarChart3 } from 'lucide-react'

const BENCHMARKS = [
  { id: 'NIFTY50', name: 'Nifty 50', description: 'Top 50 large-cap stocks' },
  { id: 'SENSEX', name: 'Sensex', description: 'BSE 30 blue-chip companies' },
  { id: 'NIFTYBANK', name: 'Nifty Bank', description: 'Banking sector index' },
  { id: 'NIFTYMIDCAP100', name: 'Nifty Midcap 100', description: 'Top 100 mid-cap stocks' },
  { id: 'NIFTYSMALLCAP250', name: 'Nifty Smallcap 250', description: 'Top 250 small-cap stocks' },
]

export function BenchmarkSelector() {
  const backtestConfig = useScoringStore(s => s.backtestConfig)
  const setBacktestConfig = useScoringStore(s => s.setBacktestConfig)

  const selected = backtestConfig?.benchmarkIndex ?? null

  const handleSelect = (id: string | null) => {
    setBacktestConfig({ benchmarkIndex: id ?? undefined })
  }

  return (
    <div className="rounded-xl bg-dark-800/60 border border-white/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-3.5 h-3.5 text-primary-400" />
        <span className="text-sm font-medium text-white">Benchmark Index</span>
        <span className="text-[10px] text-neutral-500">(optional)</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {/* None option */}
        <button
          onClick={() => handleSelect(null)}
          className={cn(
            'flex flex-col items-start px-3 py-2 rounded-lg text-left transition-colors',
            !selected
              ? 'bg-primary-500/20 border border-primary-500/30'
              : 'bg-dark-700/40 border border-white/5 hover:border-white/10',
          )}
        >
          <span className={cn('text-xs font-medium', !selected ? 'text-primary-400' : 'text-neutral-300')}>
            None
          </span>
          <span className="text-[9px] text-neutral-500 mt-0.5">No benchmark comparison</span>
        </button>

        {BENCHMARKS.map(bm => (
          <button
            key={bm.id}
            onClick={() => handleSelect(bm.id)}
            className={cn(
              'flex flex-col items-start px-3 py-2 rounded-lg text-left transition-colors',
              selected === bm.id
                ? 'bg-primary-500/20 border border-primary-500/30'
                : 'bg-dark-700/40 border border-white/5 hover:border-white/10',
            )}
          >
            <span className={cn('text-xs font-medium', selected === bm.id ? 'text-primary-400' : 'text-neutral-300')}>
              {bm.name}
            </span>
            <span className="text-[9px] text-neutral-500 mt-0.5">{bm.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
