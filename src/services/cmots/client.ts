/**
 * CMOTS API Client — HTTP layer with caching + retry
 *
 * All CMOTS data access goes through this client.
 *
 * Handles both response formats from the CMOTS API:
 *   - Raw array: [{...}, {...}]
 *   - Envelope:  { success: boolean, data: T[], message: string }
 * This client normalizes automatically so callers get clean typed arrays.
 *
 * Retry policy: up to 3 retries with exponential backoff (1s → 2s → 4s)
 * on network errors, HTTP 429, and HTTP 5xx. Client errors (4xx) are not retried.
 *
 * On error, returns empty arrays with console warnings explaining the reason.
 */

import { cache } from '@/services/cache'

const API_BASE = '/api/cmots'
const DEFAULT_MAX_RETRIES = 3

interface CMOTSRequestOptions {
  /** Path segment after /api/cmots, e.g. '/TTMData/476/s' */
  endpoint: string
  /** Cache TTL in ms (default 1 hour) */
  cacheTTL?: number
  /** Max retry attempts on transient failure (default 3) */
  retries?: number
}

// ─── Retry infrastructure ───────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** Exponential backoff: 1s, 2s, 4s with ±20% jitter */
function getBackoffDelay(attempt: number): number {
  const base = 1000 * Math.pow(2, attempt)
  const jitter = base * 0.2 * (Math.random() * 2 - 1)
  return Math.round(base + jitter)
}

/** Is this HTTP status retryable? */
function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500
}

/**
 * Fetch with automatic retry on transient failures.
 * Retries on: network errors (TypeError / Failed to fetch), HTTP 429, HTTP 5xx.
 * Does NOT retry: HTTP 4xx client errors (400, 401, 403, 404).
 */
async function fetchWithRetry(
  url: string,
  init: RequestInit,
  maxRetries: number,
  endpoint: string,
): Promise<Response> {
  let lastError: unknown
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, init)
      if (isRetryableStatus(response.status) && attempt < maxRetries) {
        const delay = getBackoffDelay(attempt)
        console.warn(
          `[CMOTS] HTTP ${response.status} for ${endpoint} — retry ${attempt + 1}/${maxRetries} in ${delay}ms`,
        )
        await sleep(delay)
        continue
      }
      return response
    } catch (error) {
      lastError = error
      if (attempt < maxRetries) {
        const delay = getBackoffDelay(attempt)
        console.warn(
          `[CMOTS] Network error for ${endpoint} — retry ${attempt + 1}/${maxRetries} in ${delay}ms`,
        )
        await sleep(delay)
        continue
      }
    }
  }
  throw lastError
}

// ─── Public API ─────────────────────────────────────

/**
 * Fetch an array of items from CMOTS API.
 * Handles both raw array and { success, data, message } envelope formats.
 * Returns empty array on error (never throws) and logs the reason.
 *
 * NOTE: Cache keys are endpoint-based. For backtesting, TTM/FinData endpoints
 * always return current data (CMOTS doesn't support historical TTM snapshots).
 * Historical scoring uses windowed fundamental data, not date-keyed API calls.
 */
export async function cmotsFetch<T>(options: CMOTSRequestOptions): Promise<T[]> {
  const { endpoint, cacheTTL = 60 * 60 * 1000, retries = DEFAULT_MAX_RETRIES } = options

  // Use null byte separator to prevent key collisions from string concatenation
  // (e.g., endpoint "A:B" vs prefix "cmots:A" + "B" would collide without this)
  const cacheKey = `cmots\0${endpoint}`
  const cached = cache.get<T[]>(cacheKey)
  if (cached !== undefined) return cached

  try {
    const url = `${API_BASE}${endpoint}`
    const response = await fetchWithRetry(
      url,
      { headers: { 'Content-Type': 'application/json' } },
      retries,
      endpoint,
    )

    if (!response.ok) {
      const body = await response.text().catch(() => '(unreadable)')
      console.error(`[CMOTS] HTTP ${response.status} for ${endpoint}`, body.slice(0, 200))
      return []
    }

    // Detect SPA fallback: if serverless function isn't deployed, Vercel returns
    // index.html (text/html) with status 200 — parsing it as JSON would throw
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('text/html')) {
      console.error(`[CMOTS] API returned HTML for ${endpoint} — serverless function may not be deployed. Check /api/health`)
      return []
    }

    const json = await response.json()

    // Normalize response: CMOTS may return a raw array or an envelope
    let data: T[]
    if (Array.isArray(json)) {
      // Raw array response: [{...}, {...}]
      data = json
    } else if (json && typeof json === 'object' && Array.isArray(json.data)) {
      // Envelope response: { success, data: [...], message }
      data = json.data
    } else {
      console.error(`[CMOTS] Unexpected response shape for ${endpoint}:`, JSON.stringify(json).slice(0, 300))
      return []
    }

    if (data.length === 0) {
      console.warn(`[CMOTS] ${endpoint} returned 0 records`)
    } else {
      console.log(`[CMOTS] ${endpoint} → ${data.length} records`)
    }

    cache.set(cacheKey, data, { ttl: cacheTTL })
    return data
  } catch (error) {
    console.error(`[CMOTS] Network error fetching ${endpoint}:`, error instanceof Error ? error.message : error)
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
