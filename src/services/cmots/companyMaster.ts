/**
 * CMOTS Company Master — Company lookup with symbol→co_code resolution
 *
 * The CMOTS API uses `co_code` (integer) as its primary identifier,
 * but the scoring system uses symbols (strings). This module bridges
 * the two by maintaining a cached symbol→company lookup map.
 *
 * Lookup key: NSE symbol (preferred) or BSE code (fallback for BSE-only stocks).
 * This ensures the full universe (NSE + BSE) is available for scoring.
 *
 * Mock mode: returns from MOCK_COMPANIES
 * API mode: fetches from /companymaster, builds lookup cache
 */

import type { CMOTSCompany } from '@/types/scoring'
import { MOCK_COMPANIES } from '@/data/mockScoringData'
import { cmotsFetch, isMockMode } from './client'

const CACHE_TTL = 24 * 60 * 60 * 1000  // 24 hours

// ── Symbol → Company lookup cache ──
let companyMap: Map<string, CMOTSCompany> | null = null
let companyMapPromise: Promise<Map<string, CMOTSCompany>> | null = null

/** Build the lookup map (keyed by uppercase NSE symbol or BSE code) */
async function ensureCompanyMap(): Promise<Map<string, CMOTSCompany>> {
  if (companyMap) return companyMap

  // Deduplicate concurrent calls during initial load
  if (companyMapPromise) return companyMapPromise

  companyMapPromise = (async () => {
    const companies = await getCompanyMaster()
    const map = new Map<string, CMOTSCompany>()
    for (const c of companies) {
      // Prefer NSE symbol as key; fall back to BSE code for BSE-only stocks
      const key = c.nsesymbol?.toUpperCase() || c.bsecode?.toUpperCase()
      if (key) map.set(key, c)
    }
    companyMap = map
    companyMapPromise = null
    console.log(`[CompanyMaster] Loaded ${map.size} companies (NSE + BSE)`)
    return map
  })()

  return companyMapPromise
}

// ── Public API ──

/** Get all companies (the full universe) */
export async function getCompanyMaster(): Promise<CMOTSCompany[]> {
  if (isMockMode()) {
    return MOCK_COMPANIES.map(mockToCMOTS)
  }

  const data = await cmotsFetch<CMOTSCompany>({
    endpoint: '/companymaster',
    cacheTTL: CACHE_TTL,
  })
  return data
}

/** Resolve a symbol (NSE or BSE) to its co_code. Returns null if not found. */
export async function getCoCode(symbol: string): Promise<number | null> {
  if (isMockMode()) return null

  const map = await ensureCompanyMap()
  const company = map.get(symbol.toUpperCase())
  return company?.co_code ?? null
}

/** Get company details by symbol (NSE or BSE code) */
export async function getCompanyBySymbol(symbol: string): Promise<CMOTSCompany | null> {
  if (isMockMode()) {
    const mock = MOCK_COMPANIES.find(c => c.symbol === symbol.toUpperCase())
    return mock ? mockToCMOTS(mock) : null
  }

  const map = await ensureCompanyMap()
  return map.get(symbol.toUpperCase()) ?? null
}

/** Search companies by name or symbol (client-side filter) */
export async function searchCompanies(query: string): Promise<CMOTSCompany[]> {
  const q = query.toLowerCase()

  if (isMockMode()) {
    return MOCK_COMPANIES
      .filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
      )
      .map(mockToCMOTS)
  }

  const map = await ensureCompanyMap()
  const results: CMOTSCompany[] = []
  for (const company of map.values()) {
    if (
      company.companyname.toLowerCase().includes(q) ||
      company.nsesymbol?.toLowerCase().includes(q) ||
      company.bsecode?.toLowerCase().includes(q) ||
      company.companyshortname?.toLowerCase().includes(q)
    ) {
      results.push(company)
    }
    if (results.length >= 50) break  // Cap results
  }
  return results
}

/** Clear the in-memory company map (useful for testing) */
export function clearCompanyCache(): void {
  companyMap = null
  companyMapPromise = null
}

// ── Mock helpers ──

function mockToCMOTS(mock: typeof MOCK_COMPANIES[number]): CMOTSCompany {
  return {
    co_code: mock.id.charCodeAt(0) * 100 + mock.id.charCodeAt(1),
    bsecode: '',
    nsesymbol: mock.symbol,
    companyname: mock.name,
    companyshortname: mock.symbol,
    categoryname: '',
    isin: '',
    bsegroup: '',
    mcaptype: mock.marketCap > 50000 ? 'Large Cap' : mock.marketCap > 10000 ? 'Mid Cap' : 'Small Cap',
    sectorcode: '',
    sectorname: mock.sector,
    industrycode: '',
    industryname: mock.sector,
    bselistedflag: 'Y',
    nselistedflag: 'Y',
    BSEStatus: 'Active',
    NSEStatus: 'Active',
  }
}
