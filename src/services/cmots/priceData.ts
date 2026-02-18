/**
 * CMOTS Price Data — Historical OHLCV via /AdjustedPriceChart
 *
 * Endpoint: /AdjustedPriceChart/{exchange}/{co_code}/{from}/{to}
 * Exchange: 'bse' or 'nse'
 *
 * On error: logs a warning with reasoning and returns empty arrays.
 */

import type { CMOTSOHLCVRecord } from '@/types/scoring'
import { cmotsFetch } from './client'
import { getCoCode } from './companyMaster'

const CACHE_TTL = 60 * 60 * 1000  // 1 hour

/** Get historical prices for a stock by NSE symbol */
export async function getHistoricalPrices(
  symbol: string,
  from: string,
  to: string,
  exchange: 'bse' | 'nse' = 'bse'
): Promise<CMOTSOHLCVRecord[]> {
  const coCode = await getCoCode(symbol)
  if (!coCode) {
    console.warn(`[PriceData] Price history unavailable for ${symbol}: could not resolve co_code`)
    return []
  }

  const records = await cmotsFetch<CMOTSOHLCVRecord>({
    endpoint: `/AdjustedPriceChart/${exchange}/${coCode}/${from}/${to}`,
    cacheTTL: CACHE_TTL,
  })
  // CMOTS API may return records in descending order — ensure ascending (oldest first)
  // for EMA, RSI, findClosestPriceValue, and other consumers that assume chronological order
  records.sort((a, b) => a.Tradedate.localeCompare(b.Tradedate))
  return records
}

/** Get latest price for a stock (fetches last 7 days, returns most recent) */
export async function getLatestPrice(symbol: string): Promise<CMOTSOHLCVRecord | null> {
  const to = new Date().toISOString().split('T')[0]
  const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const prices = await getHistoricalPrices(symbol, from, to)
  return prices.length > 0 ? prices[prices.length - 1] : null
}

/** Get prices for multiple stocks in parallel */
export async function getBatchPrices(
  symbols: string[],
  from: string,
  to: string
): Promise<Record<string, CMOTSOHLCVRecord[]>> {
  const result: Record<string, CMOTSOHLCVRecord[]> = {}

  // Fetch all in parallel
  const fetches = symbols.map(async symbol => {
    const data = await getHistoricalPrices(symbol, from, to)
    result[symbol] = data
  })
  await Promise.all(fetches)
  return result
}
