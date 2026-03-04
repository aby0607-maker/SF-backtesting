/**
 * DhanHQ Price Data — Historical OHLCV via /v2/charts/historical
 *
 * Fetches daily price data from DhanHQ and converts to CMOTSOHLCVRecord[]
 * so it can be used transparently by the scoring pipeline.
 *
 * DhanHQ returns parallel arrays { open[], high[], low[], close[], volume[], timestamp[] }
 * which are zipped into individual CMOTSOHLCVRecord objects.
 */

import type { CMOTSOHLCVRecord, DhanHistoricalResponse } from '@/types/scoring'
import { dhanFetch } from './client'

const CACHE_TTL = 60 * 60 * 1000  // 1 hour

/**
 * Fetch historical daily prices from DhanHQ and convert to CMOTS-compatible format.
 *
 * @param securityId - DhanHQ security ID (from instrument map)
 * @param exchangeSegment - Exchange segment ('NSE_EQ' or 'BSE')
 * @param from - Start date (YYYY-MM-DD)
 * @param to - End date (YYYY-MM-DD)
 * @param companyName - Optional company name to include in records
 */
export async function getDhanHistoricalPrices(
  securityId: string,
  exchangeSegment: string,
  from: string,
  to: string,
  companyName?: string,
): Promise<CMOTSOHLCVRecord[]> {
  const response = await dhanFetch<DhanHistoricalResponse>({
    endpoint: '/charts/historical',
    body: {
      securityId,
      exchangeSegment,
      instrument: 'EQUITY',
      fromDate: from,
      toDate: to,
      expiryCode: 0,
    },
    cacheTTL: CACHE_TTL,
  })

  if (!response) return []

  // Validate response has the expected parallel arrays
  const { open, high, low, close, volume, timestamp } = response
  if (!Array.isArray(timestamp) || timestamp.length === 0) {
    console.warn(`[DhanHQ] Empty response for securityId ${securityId} (${from} → ${to})`)
    return []
  }

  // Verify all arrays have the same length
  const len = timestamp.length
  if (
    open?.length !== len ||
    high?.length !== len ||
    low?.length !== len ||
    close?.length !== len ||
    volume?.length !== len
  ) {
    console.error(`[DhanHQ] Mismatched array lengths for securityId ${securityId}`)
    return []
  }

  // Convert parallel arrays to CMOTSOHLCVRecord[]
  const records: CMOTSOHLCVRecord[] = []
  for (let i = 0; i < len; i++) {
    records.push({
      CO_CODE: 0,  // Not applicable for DhanHQ data
      companyname: companyName || '',
      Tradedate: epochToISODate(timestamp[i]),
      DayOpen: open[i],
      DayHigh: high[i],
      Daylow: low[i],
      Dayclose: close[i],
      TotalVolume: volume[i],
      TotalValue: 0,  // Not provided by DhanHQ
      DMCAP: 0,       // Not provided by DhanHQ
    })
  }

  // Sort ascending by date (DhanHQ may return in any order)
  records.sort((a, b) => a.Tradedate.localeCompare(b.Tradedate))

  return records
}

/**
 * Convert Unix epoch seconds to ISO date string "YYYY-MM-DDT00:00:00"
 * matching the CMOTS Tradedate format.
 */
function epochToISODate(epoch: number): string {
  const d = new Date(epoch * 1000)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}T00:00:00`
}
