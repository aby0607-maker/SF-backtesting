/**
 * Metric Resolver — Maps scorecard metric IDs to actual data values
 *
 * This is the bridge between abstract metric definitions in scorecards
 * and concrete data from CMOTS (or mock sources). When we change a
 * CMOTS field name, only this file needs updating — scorecards stay stable.
 */

import { getStockDataForScoring } from '@/data/mockScoringData'
import { isMockMode } from '@/services/cmots/client'

/**
 * Resolve all metric values for a stock given its ID.
 * Returns a flat Record<metricId, value> suitable for the scoring engine.
 *
 * In mock mode: pulls from MOCK_STOCK_METRICS directly.
 * In API mode: would fetch from CMOTS services and map fields.
 */
export async function resolveMetricValues(
  stockId: string
): Promise<Record<string, number | null> | null> {
  if (isMockMode()) {
    const stockData = getStockDataForScoring(stockId)
    if (!stockData) return null
    return stockData.data
  }

  // Future: Fetch from CMOTS APIs and map field names
  // const ttm = await getTTMData(stockId)
  // const quarterly = await getQuarterlyResults(stockId)
  // const financials = await getFinancialData(stockId)
  // return mapToMetricIds(ttm, quarterly, financials)
  return null
}

/**
 * Resolve metric values for multiple stocks (batch).
 * Returns a map of stockId → metric values.
 */
export async function resolveMetricValuesBatch(
  stockIds: string[]
): Promise<Record<string, Record<string, number | null>>> {
  const result: Record<string, Record<string, number | null>> = {}

  // In mock mode, resolve synchronously from local data
  if (isMockMode()) {
    for (const id of stockIds) {
      const data = await resolveMetricValues(id)
      if (data) result[id] = data
    }
    return result
  }

  // Future: batch API calls for efficiency
  const fetches = stockIds.map(async id => {
    const data = await resolveMetricValues(id)
    if (data) result[id] = data
  })
  await Promise.all(fetches)
  return result
}

/**
 * Get stock info (name, sector, market cap) for scoring result assembly.
 */
export function getStockInfo(stockId: string): {
  id: string
  name: string
  symbol: string
  sector: string
  marketCap: number
} | null {
  const stockData = getStockDataForScoring(stockId)
  if (!stockData) return null
  return stockData.info
}
