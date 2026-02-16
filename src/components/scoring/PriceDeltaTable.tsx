/**
 * PriceDeltaTable — Stage 5 Tab 2: Interval-column price delta grid
 *
 * Shows stock performance deltas (cumulative return %) at each interval.
 * Sticky first 3 columns (Stock, Score, Verdict), horizontal scroll for intervals.
 * Green/red color coding for positive/negative returns. Sortable by any column.
 */

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useCombinedResult } from '@/store/useScoringStore'
import type { PriceDeltaRow } from '@/types/scoring'
import { ArrowUpDown } from 'lucide-react'

export function PriceDeltaTable() {
  const combinedResult = useCombinedResult()
  const [sortCol, setSortCol] = useState<string>('score')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const rows = combinedResult?.priceDeltaTable
  if (!rows || rows.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500 text-sm">
        No price delta data available. Run the scoring engine first.
      </div>
    )
  }

  // Get all interval column labels in order
  const intervalColumns = useMemo(() => {
    const cols = new Set<string>()
    for (const row of rows) {
      for (const key of Object.keys(row.deltas)) {
        cols.add(key)
      }
    }
    // Sort by extracting the number from labels like "Month 1", "Month 2"
    return [...cols].sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0
      const numB = parseInt(b.replace(/\D/g, '')) || 0
      return numA - numB
    })
  }, [rows])

  // Sort rows
  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      let valA: number, valB: number
      if (sortCol === 'score') {
        valA = a.score
        valB = b.score
      } else if (sortCol === 'name') {
        return sortDir === 'asc'
          ? a.stockName.localeCompare(b.stockName)
          : b.stockName.localeCompare(a.stockName)
      } else {
        valA = a.deltas[sortCol] ?? -Infinity
        valB = b.deltas[sortCol] ?? -Infinity
      }
      return sortDir === 'desc' ? valB - valA : valA - valB
    })
  }, [rows, sortCol, sortDir])

  const toggleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(col)
      setSortDir(col === 'name' ? 'asc' : 'desc')
    }
  }

  return (
    <div className="rounded-xl bg-dark-800/40 border border-white/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          {/* Header */}
          <thead>
            <tr className="border-b border-white/5">
              {/* Sticky columns */}
              <th className="sticky left-0 z-10 bg-dark-800 px-3 py-2.5 text-left text-[10px] text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-neutral-300">
                  Stock
                  {sortCol === 'name' && <ArrowUpDown className="w-2.5 h-2.5" />}
                </button>
              </th>
              <th className="sticky left-[120px] z-10 bg-dark-800 px-2 py-2.5 text-right text-[10px] text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                <button onClick={() => toggleSort('score')} className="flex items-center gap-1 hover:text-neutral-300 ml-auto">
                  Score
                  {sortCol === 'score' && <ArrowUpDown className="w-2.5 h-2.5" />}
                </button>
              </th>
              <th className="sticky left-[180px] z-10 bg-dark-800 px-2 py-2.5 text-right text-[10px] text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                Verdict
              </th>

              {/* Interval columns */}
              {intervalColumns.map(col => (
                <th key={col} className="px-2 py-2.5 text-right text-[10px] text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                  <button onClick={() => toggleSort(col)} className="flex items-center gap-1 hover:text-neutral-300 ml-auto">
                    {col}
                    {sortCol === col && <ArrowUpDown className="w-2.5 h-2.5" />}
                  </button>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-white/5">
            {sortedRows.map(row => (
              <DeltaRow key={row.stockId} row={row} intervalColumns={intervalColumns} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-white/5 text-[10px] text-neutral-500">
        {sortedRows.length} stocks • {intervalColumns.length} intervals • Values show cumulative return %
      </div>
    </div>
  )
}

function DeltaRow({ row, intervalColumns }: { row: PriceDeltaRow; intervalColumns: string[] }) {
  return (
    <tr className="hover:bg-dark-700/20 transition-colors">
      {/* Sticky: Stock name */}
      <td className="sticky left-0 z-10 bg-dark-800/95 px-3 py-2 whitespace-nowrap">
        <div className="text-xs font-medium text-white">{row.stockName}</div>
        <div className="text-[10px] text-neutral-500">{row.stockSymbol}</div>
      </td>

      {/* Sticky: Score */}
      <td className="sticky left-[120px] z-10 bg-dark-800/95 px-2 py-2 text-right whitespace-nowrap">
        <span className="text-xs font-semibold text-white">{row.score.toFixed(1)}</span>
      </td>

      {/* Sticky: Verdict */}
      <td className="sticky left-[180px] z-10 bg-dark-800/95 px-2 py-2 text-right whitespace-nowrap">
        <span className={cn(
          'inline-block px-1.5 py-0.5 rounded text-[9px] font-medium',
          getVerdictBg(row.verdict),
        )}>
          {row.verdict}
        </span>
      </td>

      {/* Interval delta cells */}
      {intervalColumns.map(col => {
        const delta = row.deltas[col]
        return (
          <td key={col} className="px-2 py-2 text-right whitespace-nowrap font-mono text-[11px]">
            {delta != null ? (
              <span className={cn(
                delta > 0 ? 'text-success-400' : delta < 0 ? 'text-red-400' : 'text-neutral-500',
              )}>
                {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
              </span>
            ) : (
              <span className="text-neutral-600">—</span>
            )}
          </td>
        )
      })}
    </tr>
  )
}

function getVerdictBg(verdict: string): string {
  const v = verdict.toUpperCase()
  if (v.includes('STRONG BUY')) return 'bg-success-500/20 text-success-400'
  if (v.includes('BUY')) return 'bg-lime-500/20 text-lime-400'
  if (v.includes('HOLD')) return 'bg-warning-500/20 text-warning-400'
  if (v.includes('REVIEW')) return 'bg-orange-500/20 text-orange-400'
  return 'bg-red-500/20 text-red-400'
}
