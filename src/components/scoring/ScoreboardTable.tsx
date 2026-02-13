/**
 * ScoreboardTable — Stage 3: Sortable results table with verdict colors
 */

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useCurrentScores } from '@/store/useScoringStore'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'

type SortField = 'rank' | 'stockName' | 'sector' | 'normalizedScore' | 'verdict'
type SortDir = 'asc' | 'desc'

export function ScoreboardTable() {
  const currentRun = useCurrentScores()
  const [sortField, setSortField] = useState<SortField>('rank')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const stocks = useMemo(() => {
    if (!currentRun) return []
    let list = [...currentRun.stocks]

    // Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(s =>
        s.stockName.toLowerCase().includes(q) ||
        s.stockSymbol.toLowerCase().includes(q) ||
        s.sector.toLowerCase().includes(q)
      )
    }

    // Sort
    list.sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      const cmp = typeof aVal === 'string'
        ? aVal.localeCompare(bVal as string)
        : (aVal as number) - (bVal as number)
      return sortDir === 'asc' ? cmp : -cmp
    })

    return list
  }, [currentRun, sortField, sortDir, searchQuery])

  if (!currentRun) return null

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Filter stocks..."
          className="w-full pl-9 pr-3 py-2 bg-dark-800/40 border border-white/5 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary-500/30"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 bg-dark-700/40 text-[10px] uppercase tracking-wider text-neutral-500">
          <button onClick={() => toggleSort('rank')} className="w-8 flex items-center gap-0.5">#<SortIcon field="rank" /></button>
          <button onClick={() => toggleSort('stockName')} className="flex-1 flex items-center gap-0.5 text-left">Stock<SortIcon field="stockName" /></button>
          <button onClick={() => toggleSort('sector')} className="w-24 flex items-center gap-0.5">Sector<SortIcon field="sector" /></button>
          <button onClick={() => toggleSort('normalizedScore')} className="w-14 flex items-center gap-0.5 justify-end">Score<SortIcon field="normalizedScore" /></button>
          <button onClick={() => toggleSort('verdict')} className="w-24 flex items-center gap-0.5 justify-end">Verdict<SortIcon field="verdict" /></button>
        </div>

        {/* Rows */}
        {stocks.map(stock => (
          <div key={stock.stockId}>
            <div
              onClick={() => setExpandedId(expandedId === stock.stockId ? null : stock.stockId)}
              className="flex items-center gap-2 px-3 py-2 border-t border-white/5 hover:bg-dark-700/30 cursor-pointer transition-colors"
            >
              <span className="w-8 text-xs font-mono text-neutral-500">{stock.rank}</span>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-white">{stock.stockName}</span>
                <span className="text-xs text-neutral-500 ml-1.5">{stock.stockSymbol}</span>
              </div>
              <span className="w-24 text-xs text-neutral-400 truncate">{stock.sector}</span>
              <span className={cn('w-14 text-right text-sm font-semibold font-mono', getScoreColor(stock.normalizedScore))}>
                {stock.normalizedScore.toFixed(1)}
              </span>
              <span className={cn('w-24 text-right text-xs font-medium', stock.verdictColor)}>
                {stock.verdict}
              </span>
            </div>

            {/* Expanded row: segment breakdown */}
            {expandedId === stock.stockId && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="px-6 py-2 bg-dark-800/40 border-t border-white/5"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {stock.segmentResults.map(seg => (
                    <div key={seg.segmentId} className="px-2 py-1.5 rounded-lg bg-dark-800/60">
                      <div className="text-[10px] text-neutral-500">{seg.segmentName}</div>
                      <div className={cn('text-sm font-semibold font-mono', getScoreColor(seg.segmentScore))}>
                        {seg.segmentScore.toFixed(1)}
                      </div>
                      {seg.verdict && (
                        <div className={cn('text-[10px]', seg.verdictColor)}>{seg.verdict}</div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>

      <div className="text-xs text-neutral-500 text-right">
        {stocks.length} of {currentRun.universeSize} stocks
      </div>
    </div>
  )
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-success-400'
  if (score >= 65) return 'text-teal-400'
  if (score >= 50) return 'text-warning-400'
  if (score >= 35) return 'text-warning-400'
  return 'text-destructive-400'
}
