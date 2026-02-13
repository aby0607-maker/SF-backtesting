/**
 * CMOTS Company Master — Company lookup and search
 *
 * Mock mode: returns from MOCK_COMPANIES
 * API mode: fetches from CMOTS company master endpoint
 */

import type { CMOTSCompany } from '@/types/scoring'
import { MOCK_COMPANIES } from '@/data/mockScoringData'
import { cmotsFetch, isMockMode } from './client'

const CACHE_TTL = 24 * 60 * 60 * 1000  // 24 hours — company master changes rarely

/** Convert mock company to CMOTS format */
function mockToCMOTS(mock: typeof MOCK_COMPANIES[number]): CMOTSCompany {
  return {
    CO_CODE: mock.id.charCodeAt(0) * 100 + mock.id.charCodeAt(1),  // Deterministic fake code
    CompanyName: mock.name,
    NSESYMBOL: mock.symbol,
    Sector: mock.sector,
    Industry: mock.sector,
    MarketCap: mock.marketCap,
  }
}

/** Get all companies (the full universe) */
export async function getCompanyMaster(): Promise<CMOTSCompany[]> {
  if (isMockMode()) {
    return MOCK_COMPANIES.map(mockToCMOTS)
  }

  const data = await cmotsFetch<CMOTSCompany[]>({
    endpoint: '/company-master',
    cacheTTL: CACHE_TTL,
  })
  return data ?? []
}

/** Search companies by name or symbol */
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

  const data = await cmotsFetch<CMOTSCompany[]>({
    endpoint: '/company-master/search',
    params: { q: query },
    cacheTTL: CACHE_TTL,
  })
  return data ?? []
}

/** Get company by symbol */
export async function getCompanyBySymbol(symbol: string): Promise<CMOTSCompany | null> {
  if (isMockMode()) {
    const mock = MOCK_COMPANIES.find(c => c.symbol === symbol.toUpperCase())
    return mock ? mockToCMOTS(mock) : null
  }

  const data = await cmotsFetch<CMOTSCompany>({
    endpoint: `/company-master/${symbol}`,
    cacheTTL: CACHE_TTL,
  })
  return data
}
