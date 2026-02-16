/**
 * CMOTS Shareholding — Promoter, FII, DII holding patterns
 *
 * Endpoint: /Aggregate-Share-Holding/{co_code}
 *
 * Mock mode: returns synthetic shareholding data
 * API mode: resolves symbol→co_code, fetches shareholding
 */

import type { CMOTSShareholding } from '@/types/scoring'
import { cmotsFetch, isMockMode } from './client'
import { getCoCode } from './companyMaster'

const CACHE_TTL = 60 * 60 * 1000  // 1 hour

/** Get shareholding pattern for a stock (latest quarter) */
export async function getShareholdingPattern(symbol: string): Promise<CMOTSShareholding | null> {
  if (isMockMode()) {
    const hash = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    const promoter = 30 + (hash % 40)
    const fii = 5 + (hash % 25)
    const dii = 5 + ((hash * 3) % 20)
    const pub = Math.max(0, 100 - promoter - fii - dii)

    return {
      co_code: hash,
      YRC: 202512,
      Promoters: promoter,
      ForeignInstitution: fii,
      MutualFund: dii,
      Retail: pub,
      OtherDomesticInstitution: 0,
      Others: 0,
    }
  }

  const coCode = await getCoCode(symbol)
  if (!coCode) return null

  // Returns multiple quarters — take the latest one
  const data = await cmotsFetch<CMOTSShareholding>({
    endpoint: `/Aggregate-Share-Holding/${coCode}`,
    cacheTTL: CACHE_TTL,
  })

  if (data.length === 0) return null

  // Sort by YRC descending to get latest quarter
  data.sort((a, b) => b.YRC - a.YRC)
  return data[0]
}

/** Get shareholding history (multiple quarters, sorted YRC descending) for trend calculation */
export async function getShareholdingHistory(symbol: string): Promise<CMOTSShareholding[]> {
  if (isMockMode()) {
    const hash = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    const promoter = 30 + (hash % 40)
    const fii = 5 + (hash % 25)
    const dii = 5 + ((hash * 3) % 20)
    const pub = Math.max(0, 100 - promoter - fii - dii)

    // Generate current + previous quarter for 3M change calculation
    return [
      {
        co_code: hash,
        YRC: 202512,
        Promoters: promoter,
        ForeignInstitution: fii,
        MutualFund: dii,
        Retail: pub,
        OtherDomesticInstitution: 0,
        Others: 0,
      },
      {
        co_code: hash,
        YRC: 202509,
        Promoters: promoter + (hash % 3) - 1,   // Slight variation for previous quarter
        ForeignInstitution: fii + (hash % 2) - 1,
        MutualFund: dii,
        Retail: pub,
        OtherDomesticInstitution: 0,
        Others: 0,
      },
    ]
  }

  const coCode = await getCoCode(symbol)
  if (!coCode) return []

  const data = await cmotsFetch<CMOTSShareholding>({
    endpoint: `/Aggregate-Share-Holding/${coCode}`,
    cacheTTL: CACHE_TTL,
  })

  // Sort by YRC descending (latest first)
  data.sort((a, b) => b.YRC - a.YRC)
  return data
}
