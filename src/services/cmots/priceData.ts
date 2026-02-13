/**
 * CMOTS Price Data — Historical OHLCV data
 *
 * Mock mode: converts simplified mock OHLCV to CMOTSOHLCVRecord format
 * API mode: fetches from CMOTS historical price endpoint
 */

import type { CMOTSOHLCVRecord } from '@/types/scoring'
import { MOCK_OHLCV } from '@/data/mockScoringData'
import { cmotsFetch, isMockMode } from './client'

const CACHE_TTL = 60 * 60 * 1000  // 1 hour

/** Convert simplified mock data to full OHLCV record */
function mockToOHLCV(entry: { date: string; price: number }, symbol: string): CMOTSOHLCVRecord {
  const price = entry.price
  const variation = price * 0.015  // ~1.5% intraday range
  return {
    CO_CODE: symbol.charCodeAt(0) * 100 + symbol.charCodeAt(1),
    Tradedate: entry.date,
    DayOpen: price - variation * 0.3,
    DayHigh: price + variation,
    Daylow: price - variation,
    Dayclose: price,
    TotalVolume: Math.floor(1000000 + Math.random() * 5000000),
  }
}

/** Get historical prices for a stock */
export async function getHistoricalPrices(
  symbol: string,
  from: string,
  to: string
): Promise<CMOTSOHLCVRecord[]> {
  if (isMockMode()) {
    const raw = MOCK_OHLCV[symbol] ?? []
    return raw
      .filter(d => d.date >= from && d.date <= to)
      .map(d => mockToOHLCV(d, symbol))
  }

  const result = await cmotsFetch<CMOTSOHLCVRecord[]>({
    endpoint: '/ohlcv',
    params: { symbol, from, to },
    cacheTTL: CACHE_TTL,
  })
  return result ?? []
}

/** Get latest price for a stock */
export async function getLatestPrice(symbol: string): Promise<CMOTSOHLCVRecord | null> {
  if (isMockMode()) {
    const raw = MOCK_OHLCV[symbol]
    if (!raw || raw.length === 0) return null
    return mockToOHLCV(raw[raw.length - 1], symbol)
  }

  const result = await cmotsFetch<CMOTSOHLCVRecord>({
    endpoint: '/ohlcv/latest',
    params: { symbol },
    cacheTTL: CACHE_TTL,
  })
  return result
}

/** Get prices for multiple stocks */
export async function getBatchPrices(
  symbols: string[],
  from: string,
  to: string
): Promise<Record<string, CMOTSOHLCVRecord[]>> {
  const result: Record<string, CMOTSOHLCVRecord[]> = {}

  if (isMockMode()) {
    for (const symbol of symbols) {
      const raw = MOCK_OHLCV[symbol] ?? []
      result[symbol] = raw
        .filter(d => d.date >= from && d.date <= to)
        .map(d => mockToOHLCV(d, symbol))
    }
    return result
  }

  const fetches = symbols.map(async symbol => {
    const data = await getHistoricalPrices(symbol, from, to)
    result[symbol] = data
  })
  await Promise.all(fetches)
  return result
}
