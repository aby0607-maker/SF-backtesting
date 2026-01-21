/**
 * Services Layer - Centralized data access with caching
 */

// Cache utilities
export { cache, Cache } from './cache'

// Stock service
export {
  getStockBySymbol,
  getStockById,
  getAllStocks,
  searchStocks,
  getStocksBySector,
  invalidateStockCache,
} from './stockService'

// Verdict service
export {
  getVerdict,
  getVerdictForStock,
  getVerdictsByProfile,
  getVerdictsByStock,
  getVerdictsBatch,
  invalidateVerdictCache,
} from './verdictService'

// Journal service
export {
  getJournalForProfile,
  getJournalStats,
  getRecentJournalEntries,
  getJournalEntriesByStock,
  getAllJournalEntries,
  invalidateJournalCache,
} from './journalService'
