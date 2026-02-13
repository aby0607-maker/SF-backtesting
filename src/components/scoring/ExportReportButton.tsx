/**
 * ExportReportButton — Stage 7: Export backtest results as CSV
 */

import { useBacktestResult, useCurrentScores, useActiveScorecard } from '@/store/useScoringStore'
import { Download, FileSpreadsheet } from 'lucide-react'

export function ExportReportButton() {
  const result = useBacktestResult()
  const currentRun = useCurrentScores()
  const scorecard = useActiveScorecard()

  const canExport = !!result || !!currentRun

  const exportCSV = () => {
    if (!currentRun) return

    // Build CSV rows from scoring results
    const headers = ['Rank', 'Stock', 'Symbol', 'Sector', 'Market Cap', 'Score', 'Verdict']
    const stocks = currentRun.stocks

    // Add segment columns
    if (stocks[0]?.segmentResults.length) {
      for (const seg of stocks[0].segmentResults) {
        headers.push(seg.segmentName)
      }
    }

    const rows = stocks.map(stock => {
      const base = [
        stock.rank,
        stock.stockName,
        stock.stockSymbol,
        stock.sector,
        stock.marketCap,
        stock.normalizedScore.toFixed(2),
        stock.verdict,
      ]
      for (const seg of stock.segmentResults) {
        base.push(seg.segmentScore.toFixed(2))
      }
      return base
    })

    // Add backtest performance if available
    if (result) {
      headers.push('Return %', 'Alpha %')
      const cohortPeriods = result.comparisons[0]?.cohortAvg.periods
      const cohortAvgReturn = cohortPeriods?.[cohortPeriods.length - 1]?.cumulativeReturn ?? 0

      for (let i = 0; i < rows.length; i++) {
        const stock = stocks[i]
        const comp = result.comparisons.find(c => c.targetStockId === stock.stockId)
        const tPeriods = comp?.targetPerformance.periods
        const returnPct = tPeriods?.[tPeriods.length - 1]?.cumulativeReturn ?? 0
        rows[i].push(returnPct.toFixed(2), (returnPct - cohortAvgReturn).toFixed(2))
      }
    }

    // Generate CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    // Add metadata header
    const meta = [
      `# StockFox Scorecard Backtest Report`,
      `# Scorecard: ${scorecard?.versionInfo.name ?? 'N/A'} (${scorecard?.versionInfo.displayVersion ?? ''})`,
      `# Generated: ${new Date().toISOString()}`,
      `# Universe: ${currentRun.universeSize} stocks`,
      result ? `# Backtest: ${result.config.dateRange.from} to ${result.config.dateRange.to} (${result.config.interval})` : '',
      '',
    ].join('\n')

    // Download
    const blob = new Blob([meta + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `stockfox-backtest-${scorecard?.versionInfo.displayVersion ?? 'export'}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!canExport) return null

  return (
    <button
      onClick={exportCSV}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-800/60 border border-white/5 text-xs text-neutral-400 hover:text-white hover:border-white/10 transition-colors"
    >
      <FileSpreadsheet className="w-3.5 h-3.5" />
      <span>Export CSV</span>
      <Download className="w-3 h-3" />
    </button>
  )
}
