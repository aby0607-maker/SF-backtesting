// Re-export all data modules
export { profiles } from './profiles'
export { stocks, getStockBySymbol, getStockById } from './stocks'
export { verdicts, getVerdict, getVerdictsByProfile, getVerdictsByStock } from './verdicts'
export { journalEntries, getJournalForProfile, getJournalStats } from './journal'
export { alerts, getAlertsForProfile, getUnreadAlertCount, getCriticalAlerts } from './alerts'
export {
  trendingStocks,
  profileMatchedStocks,
  sectorTopPicks,
  recentlyAnalyzed,
  advisors,
  getMatchedStocks,
  getAdvisorsByTier,
} from './discovery'

// Helper function to get verdict for a stock symbol and profile
import { getVerdict as _getVerdict } from './verdicts'
import { profiles as _profiles } from './profiles'

export function getVerdictForStock(symbol: string, profileId: string) {
  // Convert symbol to stockId (lowercase)
  const stockId = symbol.toLowerCase()
  return _getVerdict(stockId, profileId)
}

// Helper to get profile by ID
export function getProfileById(profileId: string) {
  return _profiles.find(p => p.id === profileId)
}
