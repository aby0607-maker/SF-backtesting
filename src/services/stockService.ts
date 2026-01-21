/**
 * Stock Service - Handles stock data retrieval with caching
 */

import { cache } from './cache'
import { stocks, getStockBySymbol as _getStockBySymbol, getStockById as _getStockById } from '@/data/stocks'
import type { Stock } from '@/types'

const CACHE_PREFIX = 'stock:'
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

/**
 * Get a stock by its symbol with caching
 */
export function getStockBySymbol(symbol: string): Stock | undefined {
  const cacheKey = `${CACHE_PREFIX}symbol:${symbol.toUpperCase()}`

  return cache.getOrSet(
    cacheKey,
    () => _getStockBySymbol(symbol),
    { ttl: CACHE_TTL }
  )
}

/**
 * Get a stock by its ID with caching
 */
export function getStockById(id: string): Stock | undefined {
  const cacheKey = `${CACHE_PREFIX}id:${id}`

  return cache.getOrSet(
    cacheKey,
    () => _getStockById(id),
    { ttl: CACHE_TTL }
  )
}

/**
 * Get all stocks
 */
export function getAllStocks(): Stock[] {
  return stocks
}

/**
 * Search stocks by name or symbol
 */
export function searchStocks(query: string): Stock[] {
  const cacheKey = `${CACHE_PREFIX}search:${query.toLowerCase()}`

  return cache.getOrSet(
    cacheKey,
    () => {
      const q = query.toLowerCase()
      return stocks.filter(
        stock =>
          stock.symbol.toLowerCase().includes(q) ||
          stock.name.toLowerCase().includes(q) ||
          stock.sector.toLowerCase().includes(q)
      )
    },
    { ttl: CACHE_TTL }
  )
}

/**
 * Get stocks by sector
 */
export function getStocksBySector(sector: string): Stock[] {
  const cacheKey = `${CACHE_PREFIX}sector:${sector.toLowerCase()}`

  return cache.getOrSet(
    cacheKey,
    () => stocks.filter(stock => stock.sector.toLowerCase() === sector.toLowerCase()),
    { ttl: CACHE_TTL }
  )
}

/**
 * Invalidate stock cache
 */
export function invalidateStockCache(symbol?: string): void {
  if (symbol) {
    cache.delete(`${CACHE_PREFIX}symbol:${symbol.toUpperCase()}`)
    cache.delete(`${CACHE_PREFIX}id:${symbol.toLowerCase()}`)
  } else {
    // Clear all stock-related cache entries
    const stats = cache.getStats()
    stats.keys
      .filter(key => key.startsWith(CACHE_PREFIX))
      .forEach(key => cache.delete(key))
  }
}
