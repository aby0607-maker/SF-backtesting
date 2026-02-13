/**
 * CMOTS Services — Barrel export
 */

export { cmotsFetch, cmotsFetchOne, isMockMode } from './client'
export { getCompanyMaster, getCompanyBySymbol, getCoCode, searchCompanies, clearCompanyCache } from './companyMaster'
export { getHistoricalPrices, getLatestPrice, getBatchPrices } from './priceData'
export {
  getTTMData, getFinancialData, getProfitAndLoss, getCashFlow, getQuarterlyResults,
  getAllFundamentals, getStatementValue, findStatementRow, getYearColumns,
} from './fundamentals'
export type { FundamentalsBundle } from './fundamentals'
export { getShareholdingPattern } from './shareholding'
