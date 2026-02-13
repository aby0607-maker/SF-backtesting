/**
 * CMOTS API Client — HTTP layer with caching and mock fallback
 *
 * All CMOTS data access goes through this client. In mock mode
 * (VITE_USE_MOCK_DATA=true, the default), callers handle mock data themselves.
 *
 * Real API: All responses are wrapped in { success, data: T[], message }.
 * This client unwraps automatically so callers get clean typed arrays.
 */

import { cache } from '@/services/cache'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false'
const API_BASE = '/api/cmots'

interface CMOTSRequestOptions {
  /** Path segment after /api/cmots, e.g. '/TTMData/476/s' */
  endpoint: string
  /** Cache TTL in ms (default 1 hour) */
  cacheTTL?: number
}

/**
 * Fetch an array of items from CMOTS API.
 * Unwraps the { success, data, message } envelope automatically.
 * Returns empty array on error (never throws).
 */
export async function cmotsFetch<T>(options: CMOTSRequestOptions): Promise<T[]> {
  const { endpoint, cacheTTL = 60 * 60 * 1000 } = options

  const cacheKey = `cmots:${endpoint}`
  const cached = cache.get<T[]>(cacheKey)
  if (cached !== undefined) return cached

  if (USE_MOCK) return []

  try {
    const url = `${API_BASE}${endpoint}`
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      console.error(`[CMOTS] ${response.status} for ${endpoint}`)
      return []
    }

    const json = await response.json() as { success: boolean; data: T[]; message: string }

    if (!json.success || !Array.isArray(json.data)) {
      console.error(`[CMOTS] Unsuccessful response for ${endpoint}:`, json.message)
      return []
    }

    cache.set(cacheKey, json.data, { ttl: cacheTTL })
    return json.data
  } catch (error) {
    console.error(`[CMOTS] Fetch failed for ${endpoint}:`, error)
    return []
  }
}

/**
 * Convenience: fetch the first item from a CMOTS endpoint.
 * Returns null if no data.
 */
export async function cmotsFetchOne<T>(options: CMOTSRequestOptions): Promise<T | null> {
  const data = await cmotsFetch<T>(options)
  return data.length > 0 ? data[0] : null
}

/** Check if we're in mock data mode */
export function isMockMode(): boolean {
  return USE_MOCK
}
