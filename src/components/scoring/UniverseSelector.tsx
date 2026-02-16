/**
 * UniverseSelector — Stage 3: Choose which stocks to score
 *
 * Three selection modes:
 * - Individual: Search and pick specific stocks by name/symbol
 * - Cohort: Filter by market cap and/or sector
 * - All: Score the entire NSE-listed universe (slow but comprehensive)
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useScoringStore } from '@/store/useScoringStore'
import { getCompanyMaster, searchCompanies } from '@/services/cmots/companyMaster'
import { isMockMode } from '@/services/cmots/client'
import { MOCK_COMPANIES } from '@/data/mockScoringData'
import type { CMOTSCompany } from '@/types/scoring'
import { Globe, Search, Filter, Users, X, Hash, AlertTriangle, Check } from 'lucide-react'

type SelectionMode = 'individual' | 'cohort' | 'all'

const MODE_TABS: { id: SelectionMode; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'individual', label: 'Individual', icon: <Search className="w-3 h-3" />, description: 'Search & pick specific stocks' },
  { id: 'cohort', label: 'Cohort', icon: <Filter className="w-3 h-3" />, description: 'Filter by cap & sector' },
  { id: 'all', label: 'All NSE', icon: <Users className="w-3 h-3" />, description: 'Entire NSE universe' },
]

const MCAP_OPTIONS = [
  { id: 'Large Cap', label: 'Large Cap', count: '~100' },
  { id: 'Mid Cap', label: 'Mid Cap', count: '~150' },
  { id: 'Small Cap', label: 'Small Cap', count: '~5,600' },
]

export function UniverseSelector() {
  const universeFilter = useScoringStore(s => s.universeFilter)
  const setUniverseFilter = useScoringStore(s => s.setUniverseFilter)

  const [sectors, setSectors] = useState<string[]>([])
  const [estimatedCount, setEstimatedCount] = useState<number | null>(null)
  const [totalUniverse, setTotalUniverse] = useState<number | null>(null)

  // ── Load sectors + universe size on mount ──
  useEffect(() => {
    if (isMockMode()) {
      setEstimatedCount(20)
      setTotalUniverse(20)
      return
    }
    getCompanyMaster().then(companies => {
      const nseListed = companies.filter(c => c.nsesymbol)
      setTotalUniverse(nseListed.length)

      const uniqueSectors = [...new Set(
        companies
          .map(c => c.sectorname)
          .filter(s => s && s !== 'None' && s !== 'ETF')
      )].sort()
      setSectors(uniqueSectors)
    })
  }, [])

  // ── Update estimated count when filter changes ──
  useEffect(() => {
    if (isMockMode()) {
      setEstimatedCount(20)
      return
    }

    if (universeFilter.mode === 'individual') {
      setEstimatedCount(universeFilter.customSymbols.length)
      return
    }

    if (universeFilter.mode === 'all') {
      setEstimatedCount(totalUniverse)
      return
    }

    // Cohort mode
    getCompanyMaster().then(companies => {
      const filtered = filterCompanies(companies, universeFilter)
      const extra = universeFilter.customSymbols.filter(
        sym => !filtered.some(c => c.nsesymbol === sym)
      ).length
      setEstimatedCount(filtered.length + extra)
    })
  }, [universeFilter, totalUniverse])

  const setMode = (mode: SelectionMode) => {
    setUniverseFilter({ mode })
  }

  // Mock mode: show selectable stock list
  if (isMockMode()) {
    return <MockStockPicker />
  }

  return (
    <div className="rounded-xl bg-dark-800/60 border border-white/5 p-4 space-y-3">
      {/* Header + stock count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-primary-400" />
          <span className="text-sm font-medium text-white">Stock Universe</span>
        </div>
        {estimatedCount !== null && (
          <StockCountBadge count={estimatedCount} />
        )}
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 p-0.5 rounded-lg bg-dark-900/60">
        {MODE_TABS.map(tab => {
          const active = universeFilter.mode === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                active
                  ? 'bg-primary-500/20 text-primary-400 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-300',
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Mode-specific content */}
      {universeFilter.mode === 'individual' && (
        <IndividualMode
          customSymbols={universeFilter.customSymbols}
          onUpdate={customSymbols => setUniverseFilter({ customSymbols })}
        />
      )}

      {universeFilter.mode === 'cohort' && (
        <CohortMode
          universeFilter={universeFilter}
          setUniverseFilter={setUniverseFilter}
          sectors={sectors}
        />
      )}

      {universeFilter.mode === 'all' && (
        <AllMode totalUniverse={totalUniverse} />
      )}
    </div>
  )
}

// ─── Individual Stock Search Mode ───

function IndividualMode({
  customSymbols,
  onUpdate,
}: {
  customSymbols: string[]
  onUpdate: (symbols: string[]) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CMOTSCompany[]>([])
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const doSearch = useCallback((q: string) => {
    if (q.length < 2) {
      setResults([])
      return
    }
    setSearching(true)
    searchCompanies(q).then(companies => {
      // Exclude already-selected symbols
      const selected = new Set(customSymbols.map(s => s.toUpperCase()))
      setResults(companies.filter(c => !selected.has(c.nsesymbol.toUpperCase())).slice(0, 15))
      setSearching(false)
    })
  }, [customSymbols])

  const handleQueryChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 250)
  }

  const addSymbol = (company: CMOTSCompany) => {
    onUpdate([...customSymbols, company.nsesymbol])
    setQuery('')
    setResults([])
    inputRef.current?.focus()
  }

  const removeSymbol = (symbol: string) => {
    onUpdate(customSymbols.filter(s => s !== symbol))
  }

  return (
    <div className="space-y-2">
      {/* Search box */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
          placeholder="Search by name or symbol (e.g. RELIANCE, TCS)"
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-dark-700/60 border border-white/5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary-500/30"
        />
        {searching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Search results dropdown */}
      {results.length > 0 && (
        <div className="rounded-lg bg-dark-700/80 border border-white/5 max-h-48 overflow-y-auto">
          {results.map(company => (
            <button
              key={company.co_code}
              onClick={() => addSymbol(company)}
              className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-primary-500/10 transition-colors border-b border-white/[0.02] last:border-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-semibold text-primary-400 shrink-0">{company.nsesymbol}</span>
                <span className="text-[11px] text-neutral-400 truncate">{company.companyname}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="text-[9px] text-neutral-600">{company.sectorname}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-dark-600 text-neutral-500">{company.mcaptype}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Selected stocks chips */}
      {customSymbols.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {customSymbols.map(symbol => (
            <span
              key={symbol}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary-500/15 border border-primary-500/20 text-[11px] font-medium text-primary-400"
            >
              {symbol}
              <button
                onClick={() => removeSymbol(symbol)}
                className="ml-0.5 hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-neutral-600">
          Search and add stocks above. Type at least 2 characters to search.
        </p>
      )}
    </div>
  )
}

// ─── Cohort Filter Mode ───

function CohortMode({
  universeFilter,
  setUniverseFilter,
  sectors,
}: {
  universeFilter: { mcapTypes: string[]; sectors: string[]; customSymbols: string[] }
  setUniverseFilter: (filter: { mcapTypes?: string[]; sectors?: string[] }) => void
  sectors: string[]
}) {
  const toggleMcap = (mcap: string) => {
    const current = universeFilter.mcapTypes
    const next = current.includes(mcap)
      ? current.filter(m => m !== mcap)
      : [...current, mcap]
    setUniverseFilter({ mcapTypes: next })
  }

  const toggleSector = (sector: string) => {
    const current = universeFilter.sectors
    const next = current.includes(sector)
      ? current.filter(s => s !== sector)
      : [...current, sector]
    setUniverseFilter({ sectors: next })
  }

  return (
    <div className="space-y-3">
      {/* Market Cap filter */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Filter className="w-3 h-3 text-neutral-500" />
          <span className="text-[11px] text-neutral-400 font-medium">Market Cap</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {MCAP_OPTIONS.map(opt => {
            const active = universeFilter.mcapTypes.includes(opt.id)
            return (
              <button
                key={opt.id}
                onClick={() => toggleMcap(opt.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors',
                  active
                    ? 'bg-primary-500/20 border border-primary-500/30 text-primary-400'
                    : 'bg-dark-700/40 border border-white/5 text-neutral-400 hover:border-white/10',
                )}
              >
                <span className="font-medium">{opt.label}</span>
                <span className="text-[9px] opacity-60">{opt.count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Sector filter */}
      {sectors.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Filter className="w-3 h-3 text-neutral-500" />
            <span className="text-[11px] text-neutral-400 font-medium">
              Sector {universeFilter.sectors.length > 0 && `(${universeFilter.sectors.length} selected)`}
            </span>
            {universeFilter.sectors.length > 0 && (
              <button
                onClick={() => setUniverseFilter({ sectors: [] })}
                className="text-[10px] text-primary-400 hover:underline ml-auto"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {sectors.map(sector => {
              const active = universeFilter.sectors.includes(sector)
              return (
                <button
                  key={sector}
                  onClick={() => toggleSector(sector)}
                  className={cn(
                    'px-2 py-1 rounded text-[10px] transition-colors',
                    active
                      ? 'bg-primary-500/20 border border-primary-500/30 text-primary-400'
                      : 'bg-dark-700/30 border border-white/5 text-neutral-500 hover:text-neutral-300',
                  )}
                >
                  {sector}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {universeFilter.mcapTypes.length === 0 && universeFilter.sectors.length === 0 && (
        <p className="text-[11px] text-amber-400/70 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Select at least one market cap or sector to narrow results
        </p>
      )}
    </div>
  )
}

// ─── All NSE Mode ───

function AllMode({ totalUniverse }: { totalUniverse: number | null }) {
  return (
    <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 p-3 space-y-1">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-xs font-medium text-amber-400">Full Universe Scoring</span>
      </div>
      <p className="text-[11px] text-neutral-400 leading-relaxed">
        This will score all {totalUniverse?.toLocaleString() ?? '...'} NSE-listed stocks.
        Each stock requires multiple API calls for fundamental data.
        This may take several minutes to complete.
      </p>
    </div>
  )
}

// ─── Mock Mode Stock Picker ───

function MockStockPicker() {
  const universeFilter = useScoringStore(s => s.universeFilter)
  const setUniverseFilter = useScoringStore(s => s.setUniverseFilter)

  const selected = new Set(universeFilter.customSymbols)
  const allSelected = selected.size === MOCK_COMPANIES.length

  const toggle = (symbol: string) => {
    const next = new Set(selected)
    if (next.has(symbol)) {
      next.delete(symbol)
    } else {
      next.add(symbol)
    }
    setUniverseFilter({ customSymbols: [...next], mode: 'individual' })
  }

  const selectAll = () => {
    setUniverseFilter({
      customSymbols: MOCK_COMPANIES.map(c => c.symbol),
      mode: 'individual',
    })
  }

  const deselectAll = () => {
    setUniverseFilter({ customSymbols: [], mode: 'individual' })
  }

  // Group by sector
  const bySector = MOCK_COMPANIES.reduce<Record<string, typeof MOCK_COMPANIES>>((acc, c) => {
    ;(acc[c.sector] ??= []).push(c)
    return acc
  }, {})

  return (
    <div className="rounded-xl bg-dark-800/60 border border-white/5 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-primary-400" />
          <span className="text-sm font-medium text-white">Stock Universe</span>
          <span className="text-[10px] bg-dark-700/60 text-neutral-400 px-2 py-0.5 rounded-full">
            Mock Data
          </span>
        </div>
        <StockCountBadge count={selected.size} />
      </div>

      {/* Select all / deselect */}
      <div className="flex items-center gap-2">
        <button
          onClick={allSelected ? deselectAll : selectAll}
          className="text-[11px] text-primary-400 hover:text-primary-300 transition-colors"
        >
          {allSelected ? 'Deselect All' : 'Select All 20 Stocks'}
        </button>
        {selected.size > 0 && !allSelected && (
          <>
            <span className="text-neutral-600">•</span>
            <button
              onClick={deselectAll}
              className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              Clear
            </button>
          </>
        )}
      </div>

      {/* Stock grid by sector */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {Object.entries(bySector).map(([sector, companies]) => (
          <div key={sector}>
            <div className="text-[10px] text-neutral-500 font-medium mb-1">{sector}</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
              {companies.map(company => {
                const isSelected = selected.has(company.symbol)
                return (
                  <button
                    key={company.id}
                    onClick={() => toggle(company.symbol)}
                    className={cn(
                      'flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left text-[11px] transition-all border',
                      isSelected
                        ? 'bg-primary-500/15 border-primary-500/30 text-primary-400'
                        : 'bg-dark-700/30 border-white/5 text-neutral-400 hover:border-white/10 hover:text-neutral-300',
                    )}
                  >
                    <div className={cn(
                      'w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 transition-colors',
                      isSelected ? 'bg-primary-500 text-white' : 'bg-dark-600 border border-white/10',
                    )}>
                      {isSelected && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span className="truncate font-medium">{company.symbol}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Stock Count Badge ───

function StockCountBadge({ count }: { count: number }) {
  const color = count === 0
    ? 'text-red-400'
    : count > 500
      ? 'text-amber-400'
      : 'text-emerald-400'

  return (
    <div className="flex items-center gap-1.5">
      <Hash className="w-3 h-3 text-neutral-500" />
      <span className={cn('text-xs font-semibold', color)}>
        {count.toLocaleString()} stocks
      </span>
      {count > 500 && (
        <span className="text-[9px] text-amber-400/70">(may be slow)</span>
      )}
      {count === 0 && (
        <span className="text-[9px] text-red-400/70">(add stocks to run)</span>
      )}
    </div>
  )
}

// ── Helper: apply cohort filters to company list ──

function filterCompanies(
  companies: { mcaptype: string; sectorname: string; nsesymbol: string }[],
  filter: { mcapTypes: string[]; sectors: string[] }
) {
  return companies.filter(c => {
    if (!c.nsesymbol) return false
    if (filter.mcapTypes.length > 0 && !filter.mcapTypes.includes(c.mcaptype)) return false
    if (filter.sectors.length > 0 && !filter.sectors.includes(c.sectorname)) return false
    return true
  })
}
