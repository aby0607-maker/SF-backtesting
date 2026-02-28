/**
 * DhanHQ Instrument Map — ISIN-based ID bridge between CMOTS and DhanHQ
 *
 * Downloads the DhanHQ scrip master CSV and builds a lookup map:
 *   ISIN → { securityId, exchangeSegment }
 *
 * This bridges CMOTS co_code (via CMOTSCompany.isin) to DhanHQ's securityId
 * which is needed for the /v2/charts/historical endpoint.
 *
 * Prefers NSE_EQ instruments; falls back to BSE if NSE not available.
 * Cached for 24 hours — the instrument list is stable.
 */

import type { DhanSecurity } from '@/types/scoring'
import { cache } from '@/services/cache'

const SCRIP_MASTER_URL = 'https://images.dhan.co/api-data/api-scrip-master.csv'
const CACHE_KEY = 'dhan\0instrumentMap'
const CACHE_TTL = 24 * 60 * 60 * 1000  // 24 hours

// ─── CSV Parsing ────────────────────────────────────

/**
 * Parse the DhanHQ scrip master CSV into DhanSecurity records.
 * CSV columns (compact format): SEM_EXM_EXCH_ID, SEM_SEGMENT, SEM_SMST_SECURITY_ID,
 * SEM_INSTRUMENT_NAME, SEM_TRADING_SYMBOL, SEM_LOT_UNITS, SEM_TICK_SIZE,
 * SEM_ISIN, SM_SYMBOL_NAME, SEM_EXPIRY_CODE, SEM_CUSTOM_SYMBOL, ...
 *
 * We only need: exchange (col 0), securityId (col 2), tradingSymbol (col 4), isin (col 7)
 */
function parseCsv(csvText: string): DhanSecurity[] {
  const lines = csvText.split('\n')
  if (lines.length < 2) return []

  // Parse header to find column indices (defensive — don't assume fixed positions)
  const header = lines[0].split(',').map(h => h.trim())
  const idxExchange = header.indexOf('SEM_EXM_EXCH_ID')
  const idxSecurityId = header.indexOf('SEM_SMST_SECURITY_ID')
  const idxTradingSymbol = header.indexOf('SEM_TRADING_SYMBOL')
  const idxIsin = header.indexOf('SEM_ISIN')
  const idxInstrument = header.indexOf('SEM_INSTRUMENT_NAME')

  if (idxExchange === -1 || idxSecurityId === -1 || idxIsin === -1) {
    console.error('[DhanInstruments] CSV header missing expected columns:', header.slice(0, 10))
    return []
  }

  const results: DhanSecurity[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const cols = line.split(',')
    const exchange = cols[idxExchange]?.trim()
    const instrument = idxInstrument !== -1 ? cols[idxInstrument]?.trim() : ''
    const isin = cols[idxIsin]?.trim()

    // Only equity instruments on NSE or BSE
    if (!isin || isin.length < 10) continue
    if (exchange !== 'NSE' && exchange !== 'BSE') continue
    // Filter to equity segment — skip derivatives, currency, commodity
    if (instrument && instrument !== 'EQUITY') continue

    const exchangeSegment = exchange === 'NSE' ? 'NSE_EQ' : 'BSE'

    results.push({
      securityId: cols[idxSecurityId]?.trim(),
      exchangeSegment,
      tradingSymbol: idxTradingSymbol !== -1 ? cols[idxTradingSymbol]?.trim() : '',
      isin,
    })
  }

  return results
}

// ─── Map Building ───────────────────────────────────

/**
 * Build the ISIN → DhanSecurity lookup map.
 * Prefers NSE_EQ over BSE when both exist for the same ISIN.
 */
function buildMap(securities: DhanSecurity[]): Map<string, DhanSecurity> {
  const map = new Map<string, DhanSecurity>()

  // First pass: add all BSE instruments
  for (const sec of securities) {
    if (sec.exchangeSegment === 'BSE') {
      map.set(sec.isin, sec)
    }
  }

  // Second pass: overwrite with NSE_EQ instruments (preferred)
  for (const sec of securities) {
    if (sec.exchangeSegment === 'NSE_EQ') {
      map.set(sec.isin, sec)
    }
  }

  return map
}

// ─── Singleton loader ───────────────────────────────

let loadPromise: Promise<Map<string, DhanSecurity>> | null = null

async function ensureMap(): Promise<Map<string, DhanSecurity>> {
  const cached = cache.get<Map<string, DhanSecurity>>(CACHE_KEY)
  if (cached) return cached

  // Deduplicate concurrent calls
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30_000)
      const response = await fetch(SCRIP_MASTER_URL, { signal: controller.signal })
      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error(`[DhanInstruments] HTTP ${response.status} fetching scrip master`)
        return new Map<string, DhanSecurity>()
      }

      const csvText = await response.text()
      const securities = parseCsv(csvText)
      const map = buildMap(securities)

      console.log(`[DhanInstruments] Loaded ${map.size} equity instruments (from ${securities.length} parsed)`)
      cache.set(CACHE_KEY, map, { ttl: CACHE_TTL })
      return map
    } catch (error) {
      console.error('[DhanInstruments] Failed to load scrip master:', error instanceof Error ? error.message : error)
      return new Map<string, DhanSecurity>()
    } finally {
      loadPromise = null
    }
  })()

  return loadPromise
}

// ─── Public API ─────────────────────────────────────

/**
 * Resolve an ISIN to DhanHQ security details (securityId + exchangeSegment).
 * Returns null if the ISIN is not found in the DhanHQ instrument list.
 */
export async function resolveToSecurity(isin: string): Promise<DhanSecurity | null> {
  if (!isin) return null
  const map = await ensureMap()
  return map.get(isin.toUpperCase()) ?? null
}

/** Clear the in-memory instrument map (useful for testing) */
export function clearInstrumentCache(): void {
  cache.delete(CACHE_KEY)
  loadPromise = null
}
