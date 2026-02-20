/**
 * Services Layer - Centralized data access with caching
 */

// Cache utilities
export { cache, Cache } from './cache'

// CMOTS services
export {
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
