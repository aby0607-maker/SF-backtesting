/**
 * UniverseSelector — Stage 3: Choose which stocks to score
 *
 * Three selection modes — all resolve into customSymbols (co_code IDs) immediately:
 * - Individual: Search and pick specific stocks by name/symbol
 * - Cohort: Filter by market cap and/or sector → resolves to co_codes
 * - All: Select the entire BSE-listed universe
 *
 * Stock IDs are String(co_code) throughout. Display uses nsesymbol/bsecode for readability.
 * Switching between modes preserves the selected stock list.
 * The selected stocks chips are always visible at the bottom for editing.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useScoringStore } from '@/store/useScoringStore'
import { getCompanyMaster, searchCompanies } from '@/services/cmots/companyMaster'
import type { CMOTSCompany } from '@/types/scoring'
import { Globe, Search, Filter, Users, X, Hash, AlertTriangle } from 'lucide-react'

type SelectionMode = 'individual' | 'cohort' | 'all'

/** Canonical stock ID: co_code (used by all CMOTS endpoints) */
const getStockId = (c: CMOTSCompany) => String(c.co_code)

/** Human-readable display label for UI chips/search results */
const getDisplayLabel = (c: CMOTSCompany) => c.nsesymbol || c.bsecode || c.companyshortname || String(c.co_code)

const MODE_TABS: { id: SelectionMode; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'individual', label: 'Individual', icon: <Search className="w-3 h-3" />, description: 'Search & pick specific stocks' },
  { id: 'cohort', label: 'Cohort', icon: <Filter className="w-3 h-3" />, description: 'Filter by cap & sector' },
  { id: 'all', label: 'All Stocks', icon: <Users className="w-3 h-3" />, description: 'Entire listed universe' },
]

const MCAP_OPTIONS = [
  { id: 'Large Cap', label: 'Large Cap' },
  { id: 'Mid Cap', label: 'Mid Cap' },
  { id: 'Small Cap', label: 'Small Cap' },
]

export function UniverseSelector() {
  const universeFilter = useScoringStore(s => s.universeFilter)
  const setUniverseFilter = useScoringStore(s => s.setUniverseFilter)

  // Full company list from API (cached)
  const [allCompanies, setAllCompanies] = useState<CMOTSCompany[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  // ── Load company master on mount ──
  useEffect(() => {
    setLoading(true)
    setLoadError(null)
    getCompanyMaster().then(companies => {
      setAllCompanies(companies)  // Already BSE-filtered by getCompanyMaster()
      setLoading(false)
      if (companies.length === 0) {
        setLoadError('The CMOTS company master API returned no data. Check browser console for [CMOTS] logs.')
      }

      // Auto-resolve cohort filters into customSymbols on initial load.
      // Without this, the default state (mcapTypes: ['Large Cap'], customSymbols: [])
      // shows "0 stocks" until the user manually clicks a filter button.
      const uf = useScoringStore.getState().universeFilter
      if (
        companies.length > 0 &&
        uf.mode === 'cohort' &&
        (uf.mcapTypes.length > 0 || uf.sectors.length > 0) &&
        uf.customSymbols.length === 0
      ) {
        const filtered = companies.filter(c => {
          if (uf.mcapTypes.length > 0 && !uf.mcapTypes.includes(c.mcaptype)) return false
          if (uf.sectors.length > 0 && !uf.sectors.includes(c.sectorname)) return false
          return true
        })
        const currentExcluded = new Set(uf.excludedSymbols ?? [])
        useScoringStore.getState().setUniverseFilter({
          customSymbols: filtered.map(getStockId).filter(s => !currentExcluded.has(s)),
        })
      }
    })
  }, [])

  // ── Derived: sector list with counts ──
  const sectorCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const c of allCompanies) {
      if (c.sectorname && c.sectorname !== 'None' && c.sectorname !== 'ETF') {
        counts.set(c.sectorname, (counts.get(c.sectorname) ?? 0) + 1)
      }
    }
    return counts
  }, [allCompanies])

  const sectors = useMemo(() =>
    [...sectorCounts.keys()].sort(),
    [sectorCounts]
  )

  // ── Derived: mcap counts ──
  const mcapCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const c of allCompanies) {
      if (c.mcaptype) {
        counts.set(c.mcaptype, (counts.get(c.mcaptype) ?? 0) + 1)
      }
    }
    return counts
  }, [allCompanies])

  // ── Display map: co_code → human-readable symbol (for chip labels) ──
  const displayMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of allCompanies) {
      map.set(getStockId(c), getDisplayLabel(c))
    }
    return map
  }, [allCompanies])

  // ── Cohort filter → resolve to customSymbols (respecting exclusions) ──
  const excluded = useMemo(
    () => new Set(universeFilter.excludedSymbols ?? []),
    [universeFilter.excludedSymbols]
  )

  const resolveCohort = useCallback((mcapTypes: string[], sectorFilters: string[]) => {
    if (mcapTypes.length === 0 && sectorFilters.length === 0) return

    const filtered = allCompanies.filter(c => {
      if (mcapTypes.length > 0 && !mcapTypes.includes(c.mcaptype)) return false
      if (sectorFilters.length > 0 && !sectorFilters.includes(c.sectorname)) return false
      return true
    })

    // Subtract manually excluded stocks
    const currentExcluded = new Set(universeFilter.excludedSymbols ?? [])
    setUniverseFilter({
      customSymbols: filtered.map(getStockId).filter(s => !currentExcluded.has(s)),
      mcapTypes,
      sectors: sectorFilters,
    })
  }, [allCompanies, setUniverseFilter, universeFilter.excludedSymbols])

  // ── Remove a stock — in cohort/all mode, track as excluded so filter toggles don't re-add it ──
  const removeStock = useCallback((symbol: string) => {
    const isCohortOrAll = universeFilter.mode === 'cohort' || universeFilter.mode === 'all'
    setUniverseFilter({
      customSymbols: universeFilter.customSymbols.filter(s => s !== symbol),
      ...(isCohortOrAll && {
        excludedSymbols: [...(universeFilter.excludedSymbols ?? []), symbol],
      }),
    })
  }, [universeFilter, setUniverseFilter])

  // ── Mode switching — preserve symbols, clear exclusions when going to individual ──
  const setMode = (mode: SelectionMode) => {
    if (mode === 'all') {
      const allSymbols = allCompanies.map(getStockId)
      setUniverseFilter({
        mode,
        customSymbols: allSymbols.filter(s => !excluded.has(s)),
      })
    } else if (mode === 'individual') {
      // Switching to individual: keep stocks, clear exclusions (manual edits are the norm)
      setUniverseFilter({ mode, excludedSymbols: [] })
    } else {
      // Switching to cohort: keep current customSymbols
      setUniverseFilter({ mode })
    }
  }

  const selectedCount = universeFilter.customSymbols.length

  return (
    <div className="rounded-xl bg-dark-800/60 border border-white/5 p-4 space-y-3">
      {/* Header + stock count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-primary-400" />
          <span className="text-sm font-medium text-white">Stock Universe</span>
          {loading && (
            <div className="w-3 h-3 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        <StockCountBadge count={selectedCount} />
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

      {/* API error banner */}
      {loadError && !loading && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 space-y-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs font-medium text-red-400">Failed to load stock data</span>
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            {loadError}
          </p>
        </div>
      )}

      {/* Mode-specific content */}
      {(universeFilter.mode === 'individual' || universeFilter.mode === 'cohort') && (
        <IndividualSearch
          customSymbols={universeFilter.customSymbols}
          onAdd={symbol => setUniverseFilter({ customSymbols: [...universeFilter.customSymbols, symbol] })}
        />
      )}

      {universeFilter.mode === 'cohort' && (
        <CohortFilters
          mcapTypes={universeFilter.mcapTypes}
          sectorFilters={universeFilter.sectors}
          mcapCounts={mcapCounts}
          sectorCounts={sectorCounts}
          sectors={sectors}
          onApply={resolveCohort}
        />
      )}

      {universeFilter.mode === 'all' && (
        <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 p-3 space-y-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-medium text-amber-400">Full Universe Selected</span>
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            All {allCompanies.length.toLocaleString()} BSE-listed stocks selected.
            Each stock requires multiple API calls. This may take several minutes.
          </p>
        </div>
      )}

      {/* ── Selected stocks (always visible across all modes) ── */}
      {selectedCount > 0 && universeFilter.mode !== 'all' && (
        <SelectedStocksList
          symbols={universeFilter.customSymbols}
          displayMap={displayMap}
          excludedCount={excluded.size}
          onRemove={removeStock}
          onClear={() => setUniverseFilter({
            customSymbols: [],
            mcapTypes: [],
            sectors: [],
            excludedSymbols: [],
          })}
          onResetExclusions={() => {
            // Re-resolve cohort without exclusions
            setUniverseFilter({ excludedSymbols: [] })
            if (universeFilter.mode === 'cohort') {
              const filtered = allCompanies.filter(c => {
                if (universeFilter.mcapTypes.length > 0 && !universeFilter.mcapTypes.includes(c.mcaptype)) return false
                if (universeFilter.sectors.length > 0 && !universeFilter.sectors.includes(c.sectorname)) return false
                return true
              })
              setUniverseFilter({ customSymbols: filtered.map(getStockId), excludedSymbols: [] })
            } else if (universeFilter.mode === 'all') {
              setUniverseFilter({ customSymbols: allCompanies.map(getStockId), excludedSymbols: [] })
            }
          }}
        />
      )}
    </div>
  )
}

// ─── Individual: search bar only (chips moved to shared section) ───

function IndividualSearch({
  customSymbols,
  onAdd,
}: {
  customSymbols: string[]
  onAdd: (symbol: string) => void
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
      const selected = new Set(customSymbols.map(s => s.toUpperCase()))
      setResults(companies.filter(c => !selected.has(getStockId(c).toUpperCase())).slice(0, 15))
      setSearching(false)
    })
  }, [customSymbols])

  const handleQueryChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 250)
  }

  const addSymbol = (company: CMOTSCompany) => {
    onAdd(getStockId(company))
    setQuery('')
    setResults([])
    inputRef.current?.focus()
  }

  return (
    <div className="space-y-2">
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

      {results.length > 0 && (
        <div className="rounded-lg bg-dark-700/80 border border-white/5 max-h-48 overflow-y-auto">
          {results.map(company => (
            <button
              key={company.co_code}
              onClick={() => addSymbol(company)}
              className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-primary-500/10 transition-colors border-b border-white/[0.02] last:border-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-semibold text-primary-400 shrink-0">
                  {company.nsesymbol || company.bsecode}
                  {!company.nsesymbol && company.bsecode && <span className="text-[9px] text-neutral-600 ml-1">(BSE)</span>}
                </span>
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

      {customSymbols.length === 0 && (
        <p className="text-[11px] text-neutral-600">
          Search and add stocks above, or switch to Cohort mode to select by sector/cap.
        </p>
      )}
    </div>
  )
}

// ─── Cohort: filters that resolve immediately ───

function CohortFilters({
  mcapTypes,
  sectorFilters,
  mcapCounts,
  sectorCounts,
  sectors,
  onApply,
}: {
  mcapTypes: string[]
  sectorFilters: string[]
  mcapCounts: Map<string, number>
  sectorCounts: Map<string, number>
  sectors: string[]
  onApply: (mcapTypes: string[], sectors: string[]) => void
}) {
  const toggleMcap = (mcap: string) => {
    const next = mcapTypes.includes(mcap)
      ? mcapTypes.filter(m => m !== mcap)
      : [...mcapTypes, mcap]
    onApply(next, sectorFilters)
  }

  const toggleSector = (sector: string) => {
    const next = sectorFilters.includes(sector)
      ? sectorFilters.filter(s => s !== sector)
      : [...sectorFilters, sector]
    onApply(mcapTypes, next)
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
            const active = mcapTypes.includes(opt.id)
            const count = mcapCounts.get(opt.id) ?? 0
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
                <span className="text-[9px] opacity-60">{count > 0 ? count : '...'}</span>
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
              Sector {sectorFilters.length > 0 && `(${sectorFilters.length} selected)`}
            </span>
            {sectorFilters.length > 0 && (
              <button
                onClick={() => onApply(mcapTypes, [])}
                className="text-[10px] text-primary-400 hover:underline ml-auto"
              >
                Clear Sectors
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {sectors.map(sector => {
              const active = sectorFilters.includes(sector)
              const count = sectorCounts.get(sector) ?? 0
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
                  <span className="ml-1 opacity-50">{count}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {mcapTypes.length === 0 && sectorFilters.length === 0 && (
        <p className="text-[11px] text-amber-400/70 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Select at least one market cap or sector to add stocks
        </p>
      )}
    </div>
  )
}

// ─── Selected Stocks List (shared across all modes) ───

function SelectedStocksList({
  symbols,
  displayMap,
  excludedCount,
  onRemove,
  onClear,
  onResetExclusions,
}: {
  symbols: string[]
  displayMap?: Map<string, string>
  excludedCount: number
  onRemove: (symbol: string) => void
  onClear: () => void
  onResetExclusions: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const COLLAPSE_THRESHOLD = 20
  const showExpand = symbols.length > COLLAPSE_THRESHOLD

  const visible = expanded ? symbols : symbols.slice(0, COLLAPSE_THRESHOLD)

  return (
    <div className="border-t border-white/5 pt-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-neutral-400 font-medium">
            Selected Stocks ({symbols.length})
          </span>
          {excludedCount > 0 && (
            <button
              onClick={onResetExclusions}
              className="text-[10px] text-amber-400/70 hover:text-amber-400 transition-colors"
            >
              {excludedCount} excluded · restore
            </button>
          )}
        </div>
        <button
          onClick={onClear}
          className="text-[10px] text-red-400/70 hover:text-red-400 transition-colors"
        >
          Clear All
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
        {visible.map(symbol => (
          <span
            key={symbol}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary-500/15 border border-primary-500/20 text-[11px] font-medium text-primary-400"
          >
            {displayMap?.get(symbol) ?? symbol}
            <button
              onClick={() => onRemove(symbol)}
              className="ml-0.5 hover:text-red-400 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {showExpand && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="px-2 py-1 rounded-md bg-dark-700/40 border border-white/5 text-[11px] text-neutral-500 hover:text-neutral-300"
          >
            +{symbols.length - COLLAPSE_THRESHOLD} more
          </button>
        )}
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
