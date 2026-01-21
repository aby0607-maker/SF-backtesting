/**
 * Journal Service - Handles analysis journal data with caching
 */

import { cache } from './cache'
import {
  journalEntries,
  getJournalForProfile as _getJournalForProfile,
  getJournalStats as _getJournalStats,
} from '@/data/journal'
import type { JournalEntry } from '@/types'

const CACHE_PREFIX = 'journal:'
const CACHE_TTL = 2 * 60 * 1000 // 2 minutes (shorter for journal as it changes more often)

/**
 * Get all journal entries for a profile with caching
 */
export function getJournalForProfile(profileId: string): JournalEntry[] {
  const cacheKey = `${CACHE_PREFIX}profile:${profileId}`

  return cache.getOrSet(
    cacheKey,
    () => _getJournalForProfile(profileId),
    { ttl: CACHE_TTL }
  )
}

/**
 * Get journal statistics for a profile with caching
 */
export function getJournalStats(profileId: string) {
  const cacheKey = `${CACHE_PREFIX}stats:${profileId}`

  return cache.getOrSet(
    cacheKey,
    () => _getJournalStats(profileId),
    { ttl: CACHE_TTL }
  )
}

/**
 * Get recent journal entries for a profile
 */
export function getRecentJournalEntries(profileId: string, limit: number = 5): JournalEntry[] {
  const entries = getJournalForProfile(profileId)
  return entries
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

/**
 * Get journal entries by stock
 */
export function getJournalEntriesByStock(profileId: string, stockSymbol: string): JournalEntry[] {
  const cacheKey = `${CACHE_PREFIX}stock:${profileId}:${stockSymbol.toLowerCase()}`

  return cache.getOrSet(
    cacheKey,
    () => {
      const entries = getJournalForProfile(profileId)
      return entries.filter(entry => entry.stock.symbol.toLowerCase() === stockSymbol.toLowerCase())
    },
    { ttl: CACHE_TTL }
  )
}

/**
 * Get all journal entries across all profiles (raw data access)
 */
export function getAllJournalEntries(): JournalEntry[] {
  return Object.values(journalEntries).flat()
}

/**
 * Invalidate journal cache
 */
export function invalidateJournalCache(profileId?: string): void {
  if (profileId) {
    // Clear profile-specific caches
    const stats = cache.getStats()
    stats.keys
      .filter(key => key.includes(`:${profileId}`) || key.endsWith(profileId))
      .forEach(key => cache.delete(key))
  } else {
    // Clear all journal caches
    const stats = cache.getStats()
    stats.keys
      .filter(key => key.startsWith(CACHE_PREFIX))
      .forEach(key => cache.delete(key))
  }
}
