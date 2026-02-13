/**
 * CMOTS API Client — HTTP layer with auth and mock fallback
 *
 * All CMOTS data access goes through this client. In mock mode
 * (VITE_USE_MOCK_DATA=true, the default), returns mock data.
 * When APIs are wired later, proxies through /api/cmots.
 */

import { cache } from '@/services/cache'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false'
const API_BASE = '/api/cmots'

interface CMOTSRequestOptions {
  endpoint: string
  params?: Record<string, string | number>
  cacheTTL?: number  // ms, default 1 hour
}

/**
 * Typed fetch wrapper for CMOTS API.
 * Returns null if request fails (rather than throwing).
 */
export async function cmotsFetch<T>(options: CMOTSRequestOptions): Promise<T | null> {
  const { endpoint, params = {}, cacheTTL = 60 * 60 * 1000 } = options

  // Build cache key from endpoint + params
  const cacheKey = `cmots:${endpoint}:${JSON.stringify(params)}`
  const cached = cache.get<T>(cacheKey)
  if (cached !== undefined) return cached

  if (USE_MOCK) {
    // In mock mode, return null — callers should check mock data directly
    return null
  }

  try {
    const queryString = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString()

    const url = queryString ? `${API_BASE}${endpoint}?${queryString}` : `${API_BASE}${endpoint}`

    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      console.error(`CMOTS API error: ${response.status} for ${endpoint}`)
      return null
    }

    const data = await response.json() as T
    cache.set(cacheKey, data, { ttl: cacheTTL })
    return data
  } catch (error) {
    console.error(`CMOTS fetch failed for ${endpoint}:`, error)
    return null
  }
}

/** Check if we're in mock data mode */
export function isMockMode(): boolean {
  return USE_MOCK
}
