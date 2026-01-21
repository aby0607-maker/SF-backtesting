/**
 * Simple in-memory cache with TTL support
 */

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
}

const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

class Cache {
  private store = new Map<string, CacheEntry<unknown>>()

  /**
   * Get a value from the cache
   */
  get<T>(key: string): T | undefined {
    const entry = this.store.get(key)
    if (!entry) return undefined

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return undefined
    }

    return entry.value as T
  }

  /**
   * Set a value in the cache
   */
  set<T>(key: string, value: T, options: CacheOptions = {}): void {
    const ttl = options.ttl ?? DEFAULT_TTL
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    })
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== undefined
  }

  /**
   * Delete a key from the cache
   */
  delete(key: string): void {
    this.store.delete(key)
  }

  /**
   * Clear all entries from the cache
   */
  clear(): void {
    this.store.clear()
  }

  /**
   * Get or set a value using a factory function
   */
  getOrSet<T>(key: string, factory: () => T, options: CacheOptions = {}): T {
    const cached = this.get<T>(key)
    if (cached !== undefined) {
      return cached
    }

    const value = factory()
    this.set(key, value, options)
    return value
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    // Clean up expired entries first
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key)
      }
    }

    return {
      size: this.store.size,
      keys: Array.from(this.store.keys()),
    }
  }
}

// Singleton cache instance
export const cache = new Cache()

// Export for creating multiple cache instances if needed
export { Cache }
