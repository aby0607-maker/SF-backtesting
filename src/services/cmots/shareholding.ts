/**
 * CMOTS Shareholding — Promoter, FII, DII holding patterns
 *
 * Mock mode: returns synthetic shareholding data
 * API mode: fetches from CMOTS shareholding endpoint
 */

import type { CMOTSShareholding } from '@/types/scoring'
import { cmotsFetch, isMockMode } from './client'

const CACHE_TTL = 60 * 60 * 1000  // 1 hour

/** Get latest shareholding pattern for a stock */
export async function getShareholdingPattern(symbol: string): Promise<CMOTSShareholding | null> {
  if (isMockMode()) {
    // Generate realistic mock shareholding based on symbol hash
    const hash = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    const promoter = 30 + (hash % 40)            // 30-69%
    const fii = 5 + (hash % 25)                  // 5-29%
    const dii = 5 + ((hash * 3) % 20)            // 5-24%
    const pub = Math.max(0, 100 - promoter - fii - dii)

    return {
      CO_CODE: hash,
      Quarter: 'Q3 2025',
      PromoterHolding: promoter,
      FIIHolding: fii,
      DIIHolding: dii,
      PublicHolding: pub,
    }
  }

  return await cmotsFetch<CMOTSShareholding>({
    endpoint: '/shareholding',
    params: { symbol },
    cacheTTL: CACHE_TTL,
  })
}
