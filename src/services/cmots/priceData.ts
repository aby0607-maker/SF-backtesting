/**
 * CMOTS Price Data — Historical OHLCV via /AdjustedPriceChart
 *
 * Endpoint: /AdjustedPriceChart/{exchange}/{co_code}/{from}/{to}
 * Exchange: 'bse' or 'nse'
 *
 * Mock mode: converts simplified mock OHLCV to CMOTSOHLCVRecord format
 * API mode: resolves symbol→co_code, then fetches price history
 */

import type { CMOTSOHLCVRecord } from '@/types/scoring'
import { MOCK_OHLCV } from '@/data/mockScoringData'
import { cmotsFetch, isMockMode } from './client'
import { getCoCode } from './companyMaster'

const CACHE_TTL = 60 * 60 * 1000  // 1 hour

/** Get historical prices for a stock by NSE symbol */
export async function getHistoricalPrices(
  symbol: string,
  from: string,
  to: string,
  exchange: 'bse' | 'nse' = 'bse'
): Promise<CMOTSOHLCVRecord[]> {
  if (isMockMode()) {
    const raw = MOCK_OHLCV[symbol] ?? []
    return raw
      .filter(d => d.date >= from && d.date <= to)
      .map(d => mockToOHLCV(d, symbol))
  }

  const coCode = await getCoCode(symbol)
  if (!coCode) {
    console.warn(`[PriceData] No co_code found for ${symbol}`)
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
  if (isMockMode()) {
    const raw = MOCK_OHLCV[symbol]
    if (!raw || raw.length === 0) return null
    return mockToOHLCV(raw[raw.length - 1], symbol)
  }

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

  if (isMockMode()) {
    for (const symbol of symbols) {
      const raw = MOCK_OHLCV[symbol] ?? []
      result[symbol] = raw
        .filter(d => d.date >= from && d.date <= to)
        .map(d => mockToOHLCV(d, symbol))
    }
    return result
  }

  // Fetch all in parallel
  const fetches = symbols.map(async symbol => {
    const data = await getHistoricalPrices(symbol, from, to)
    result[symbol] = data
  })
  await Promise.all(fetches)
  return result
}

// ── Mock helpers ──

function mockToOHLCV(entry: { date: string; price: number }, symbol: string): CMOTSOHLCVRecord {
  const price = entry.price
  const variation = price * 0.015
  return {
    CO_CODE: symbol.charCodeAt(0) * 100 + symbol.charCodeAt(1),
    companyname: symbol,
    Tradedate: entry.date,
    DayOpen: price - variation * 0.3,
    DayHigh: price + variation,
    Daylow: price - variation,
    Dayclose: price,
    TotalVolume: Math.floor(1000000 + Math.random() * 5000000),
    TotalValue: 0,
    DMCAP: 0,
  }
}
