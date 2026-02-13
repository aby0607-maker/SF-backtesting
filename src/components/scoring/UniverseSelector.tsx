/**
 * UniverseSelector — Stage 3: Pick which stocks to score before running
 *
 * Filters the 6,442-company CMOTS universe down to a practical subset.
 * Without this, scoring would attempt 5 API calls × 6,442 stocks = 32,210 requests.
 * With Large Cap filter: ~100 stocks. With a sector: ~20-50 stocks.
 */

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useScoringStore } from '@/store/useScoringStore'
import { getCompanyMaster } from '@/services/cmots/companyMaster'
import { isMockMode } from '@/services/cmots/client'
import { Globe, Filter, Hash } from 'lucide-react'

const MCAP_OPTIONS = [
  { id: 'Large Cap', label: 'Large Cap', count: '~100 stocks' },
  { id: 'Mid Cap', label: 'Mid Cap', count: '~150 stocks' },
  { id: 'Small Cap', label: 'Small Cap', count: '~5,600 stocks' },
]

export function UniverseSelector() {
  const universeFilter = useScoringStore(s => s.universeFilter)
  const setUniverseFilter = useScoringStore(s => s.setUniverseFilter)

  const [sectors, setSectors] = useState<string[]>([])
  const [estimatedCount, setEstimatedCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  // Load sector list from company master
  useEffect(() => {
    if (isMockMode()) return
    let cancelled = false
    setLoading(true)
    getCompanyMaster().then(companies => {
      if (cancelled) return
      const uniqueSectors = [...new Set(
        companies
          .map(c => c.sectorname)
          .filter(s => s && s !== 'None' && s !== 'ETF')
      )].sort()
      setSectors(uniqueSectors)

      // Estimate count based on current filter
      const filtered = filterCompanies(companies, universeFilter)
      setEstimatedCount(filtered.length)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  // Update estimated count when filter changes
  useEffect(() => {
    if (isMockMode()) {
      setEstimatedCount(20) // Mock universe
      return
    }
    getCompanyMaster().then(companies => {
      const filtered = filterCompanies(companies, universeFilter)
      setEstimatedCount(filtered.length)
    })
  }, [universeFilter])

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

  if (isMockMode()) {
    return (
      <div className="rounded-xl bg-dark-800/60 border border-white/5 p-4">
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-primary-400" />
          <span className="text-sm font-medium text-white">Stock Universe</span>
          <span className="text-[10px] bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full">
            Mock: 20 stocks
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-dark-800/60 border border-white/5 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-primary-400" />
          <span className="text-sm font-medium text-white">Stock Universe</span>
        </div>
        {estimatedCount !== null && (
          <div className="flex items-center gap-1.5">
            <Hash className="w-3 h-3 text-neutral-500" />
            <span className={cn(
              'text-xs font-semibold',
              estimatedCount > 500 ? 'text-amber-400' : 'text-emerald-400',
            )}>
              {estimatedCount.toLocaleString()} stocks
            </span>
            {estimatedCount > 500 && (
              <span className="text-[9px] text-amber-400/70">(may be slow)</span>
            )}
          </div>
        )}
      </div>

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

      {loading && (
        <div className="text-[10px] text-neutral-500">Loading company master...</div>
      )}
    </div>
  )
}

// ── Helper: apply filters to company list ──

function filterCompanies(
  companies: { mcaptype: string; sectorname: string; nsesymbol: string }[],
  filter: { mcapTypes: string[]; sectors: string[]; customSymbols: string[] }
) {
  return companies.filter(c => {
    if (!c.nsesymbol) return false
    if (filter.mcapTypes.length > 0 && !filter.mcapTypes.includes(c.mcaptype)) return false
    if (filter.sectors.length > 0 && !filter.sectors.includes(c.sectorname)) return false
    return true
  })
}
