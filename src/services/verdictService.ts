/**
 * Verdict Service - Handles stock verdict data retrieval with caching
 */

import { cache } from './cache'
import {
  getVerdict as _getVerdict,
  getVerdictsByProfile as _getVerdictsByProfile,
  getVerdictsByStock as _getVerdictsByStock,
} from '@/data/verdicts'
import type { StockVerdict } from '@/types'

const CACHE_PREFIX = 'verdict:'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Get a verdict for a specific stock and profile with caching
 */
export function getVerdict(stockId: string, profileId: string): StockVerdict | undefined {
  const cacheKey = `${CACHE_PREFIX}${stockId}:${profileId}`

  return cache.getOrSet(
    cacheKey,
    () => _getVerdict(stockId, profileId),
    { ttl: CACHE_TTL }
  )
}

/**
 * Get verdict for a stock symbol (convenience wrapper)
 */
export function getVerdictForStock(symbol: string, profileId: string): StockVerdict | undefined {
  const stockId = symbol.toLowerCase()
  return getVerdict(stockId, profileId)
}

/**
 * Get all verdicts for a profile with caching
 */
export function getVerdictsByProfile(profileId: string): StockVerdict[] {
  const cacheKey = `${CACHE_PREFIX}profile:${profileId}`

  return cache.getOrSet(
    cacheKey,
    () => _getVerdictsByProfile(profileId),
    { ttl: CACHE_TTL }
  )
}

/**
 * Get all verdicts for a stock across profiles with caching
 */
export function getVerdictsByStock(stockId: string): StockVerdict[] {
  const cacheKey = `${CACHE_PREFIX}stock:${stockId}`

  return cache.getOrSet(
    cacheKey,
    () => _getVerdictsByStock(stockId),
    { ttl: CACHE_TTL }
  )
}

/**
 * Get multiple verdicts at once (batch fetch with caching)
 */
export function getVerdictsBatch(
  requests: Array<{ stockId: string; profileId: string }>
): Map<string, StockVerdict | undefined> {
  const results = new Map<string, StockVerdict | undefined>()

  for (const { stockId, profileId } of requests) {
    const key = `${stockId}:${profileId}`
    results.set(key, getVerdict(stockId, profileId))
  }

  return results
}

/**
 * Invalidate verdict cache
 */
export function invalidateVerdictCache(stockId?: string, profileId?: string): void {
  if (stockId && profileId) {
    cache.delete(`${CACHE_PREFIX}${stockId}:${profileId}`)
  } else if (stockId) {
    cache.delete(`${CACHE_PREFIX}stock:${stockId}`)
    // Also clear individual stock:profile caches
    const stats = cache.getStats()
    stats.keys
      .filter(key => key.startsWith(`${CACHE_PREFIX}${stockId}:`))
      .forEach(key => cache.delete(key))
  } else if (profileId) {
    cache.delete(`${CACHE_PREFIX}profile:${profileId}`)
  } else {
    // Clear all verdict caches
    const stats = cache.getStats()
    stats.keys
      .filter(key => key.startsWith(CACHE_PREFIX))
      .forEach(key => cache.delete(key))
  }
}
