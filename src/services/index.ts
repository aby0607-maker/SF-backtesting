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

// CMOTS services
export {
  isMockMode,
  getCompanyMaster,
  searchCompanies,
  getCompanyBySymbol,
  getHistoricalPrices,
  getLatestPrice,
  getBatchPrices,
  getTTMData,
  getQuarterlyResults,
  getFinancialData,
  getAllFundamentals,
  getShareholdingPattern,
} from './cmots'

// Scoring service
export {
  scoreWithScorecard,
  scoreFullUniverse,
  buildCohort,
  backtestScorecard,
  getAvailableSectors,
  getVerdictDistribution,
} from './scoringService'

// Metric resolver
export {
  resolveMetricValues,
  resolveMetricValuesBatch,
  getStockInfo,
} from './metricResolver'
export type { ResolvedMetrics } from './metricResolver'
