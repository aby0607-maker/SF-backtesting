/**
 * ExportReportButton — Stage 7: Export backtest results as CSV or PDF
 */

import { useState } from 'react'
import { useBacktestResult, useCurrentScores, useActiveScorecard } from '@/store/useScoringStore'
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react'

export function ExportReportButton() {
  const result = useBacktestResult()
  const currentRun = useCurrentScores()
  const scorecard = useActiveScorecard()
  const [showMenu, setShowMenu] = useState(false)

  // Require at minimum currentRun (scoring results) to export
  const canExport = !!currentRun && currentRun.stocks.length > 0

  /** Compute cohort avg return safely (reused by CSV and PDF) */
  function getCohortAvgReturn(): number {
    if (!result || result.comparisons.length === 0) return 0
    const cohortPeriods = result.comparisons[0]?.cohortAvg?.periods
    return cohortPeriods && cohortPeriods.length > 0
      ? cohortPeriods[cohortPeriods.length - 1].cumulativeReturn
      : 0
  }

  /** Get stock return and alpha from backtest */
  function getStockPerformance(stockId: string): { returnPct: number; alpha: number } {
    if (!result || result.comparisons.length === 0) return { returnPct: 0, alpha: 0 }
    const comp = result.comparisons.find(c => c.targetStockId === stockId)
    const tPeriods = comp?.targetPerformance?.periods
    const returnPct = tPeriods && tPeriods.length > 0
      ? tPeriods[tPeriods.length - 1].cumulativeReturn
      : 0
    return { returnPct, alpha: returnPct - getCohortAvgReturn() }
  }

  const exportCSV = () => {
    if (!currentRun || currentRun.stocks.length === 0) return
    setShowMenu(false)

    const headers: string[] = ['Rank', 'Stock', 'Symbol', 'Sector', 'Market Cap', 'Score', 'Verdict']
    const stocks = currentRun.stocks

    // Add segment columns
    if (stocks[0]?.segmentResults?.length) {
      for (const seg of stocks[0].segmentResults) {
        headers.push(seg.segmentName)
      }
    }

    const rows: (string | number)[][] = stocks.map(stock => {
      const base: (string | number)[] = [
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
    if (result && result.comparisons.length > 0) {
      headers.push('Return %', 'Alpha %')
      for (let i = 0; i < rows.length; i++) {
        const { returnPct, alpha } = getStockPerformance(stocks[i].stockId)
        rows[i].push(returnPct.toFixed(2), alpha.toFixed(2))
      }
    }

    // Generate CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    const meta = [
      `# StockFox Scorecard Backtest Report`,
      `# Scorecard: ${scorecard?.versionInfo.name ?? 'N/A'} (${scorecard?.versionInfo.displayVersion ?? ''})`,
      `# Generated: ${new Date().toISOString()}`,
      `# Universe: ${currentRun.universeSize} stocks`,
      result ? `# Backtest: ${result.config.dateRange.from} to ${result.config.dateRange.to} (${result.config.interval})` : '',
      '',
    ].join('\n')

    // Sanitize filename to prevent special character issues
    const safeVersion = (scorecard?.versionInfo.displayVersion ?? 'export')
      .replace(/[^a-z0-9._-]/gi, '_').substring(0, 50)

    downloadFile(
      meta + csvContent,
      `stockfox-backtest-${safeVersion}-${today()}.csv`,
      'text/csv;charset=utf-8;'
    )
  }

  const exportPDF = async () => {
    if (!currentRun || currentRun.stocks.length === 0) return
    setShowMenu(false)

    // Dynamic import to keep bundle small for users who don't export
    const { jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    let y = 15

    // ── Header ──
    doc.setFontSize(18)
    doc.setTextColor(40, 40, 40)
    doc.text('StockFox Backtest Report', 14, y)
    y += 8

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Scorecard: ${scorecard?.versionInfo.name ?? 'N/A'} (${scorecard?.versionInfo.displayVersion ?? ''})`, 14, y)
    y += 5
    if (scorecard?.versionInfo.sourceReference) {
      doc.text(`Source: ${scorecard.versionInfo.sourceReference}`, 14, y)
      y += 5
    }
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, y)
    y += 5
    doc.text(`Universe: ${currentRun.universeSize} stocks`, 14, y)
    y += 5
    if (result) {
      doc.text(`Backtest Period: ${result.config.dateRange.from} to ${result.config.dateRange.to} (${result.config.interval})`, 14, y)
      y += 5
    }
    y += 3

    // ── Summary Metrics ──
    if (result) {
      const sm = result.summaryMetrics
      doc.setFontSize(12)
      doc.setTextColor(40, 40, 40)
      doc.text('Summary Metrics', 14, y)
      y += 6

      const metricsData = [
        ['Hit Rate', `${sm.hitRate.toFixed(1)}%`],
        ['Avg Alpha', `${sm.avgAlpha >= 0 ? '+' : ''}${sm.avgAlpha.toFixed(1)}%`],
        ['Score-Return Correlation', sm.correlationScoreVsReturn.toFixed(2)],
        ['Best Performer', `${sm.bestPerformer.name} (+${sm.bestPerformer.returnPct.toFixed(1)}%)`],
        ['Worst Performer', `${sm.worstPerformer.name} (${sm.worstPerformer.returnPct.toFixed(1)}%)`],
      ]

      autoTable(doc, {
        startY: y,
        head: [['Metric', 'Value']],
        body: metricsData,
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 138], fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        margin: { left: 14 },
        tableWidth: 120,
      })

      y = (doc as any).lastAutoTable.finalY + 8
    }

    // ── Quintile Analysis ──
    if (result?.quintileAnalysis && result.quintileAnalysis.length > 0) {
      doc.setFontSize(12)
      doc.setTextColor(40, 40, 40)
      doc.text('Quintile Analysis (Score vs Return)', 14, y)
      y += 6

      const quintileData = result.quintileAnalysis.map(q => [
        q.quintile,
        q.label,
        q.avgScore.toFixed(1),
        `${q.avgReturn >= 0 ? '+' : ''}${q.avgReturn.toFixed(1)}%`,
        `${q.medianReturn >= 0 ? '+' : ''}${q.medianReturn.toFixed(1)}%`,
      ])

      autoTable(doc, {
        startY: y,
        head: [['Quintile', 'Label', 'Avg Score', 'Avg Return', 'Median Return']],
        body: quintileData,
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 138], fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        margin: { left: 14 },
        tableWidth: 180,
      })

      y = (doc as any).lastAutoTable.finalY + 8
    }

    // ── Scoreboard Table ──
    // New page for the full scoreboard
    doc.addPage()
    y = 15

    doc.setFontSize(12)
    doc.setTextColor(40, 40, 40)
    doc.text('Stock Scoreboard', 14, y)
    y += 6

    const stocks = currentRun.stocks
    const hasBacktest = !!result && result.comparisons.length > 0

    const tableHeaders = ['#', 'Stock', 'Symbol', 'Sector', 'Score', 'Verdict']
    if (hasBacktest) tableHeaders.push('Return %', 'Alpha %')

    const tableData = stocks.map(stock => {
      const row = [
        String(stock.rank),
        stock.stockName,
        stock.stockSymbol,
        stock.sector,
        stock.normalizedScore.toFixed(1),
        stock.verdict,
      ]
      if (hasBacktest) {
        const { returnPct, alpha } = getStockPerformance(stock.stockId)
        row.push(
          `${returnPct >= 0 ? '+' : ''}${returnPct.toFixed(1)}%`,
          `${alpha >= 0 ? '+' : ''}${alpha.toFixed(1)}%`
        )
      }
      return row
    })

    autoTable(doc, {
      startY: y,
      head: [tableHeaders],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [30, 58, 138], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 10 },
        4: { halign: 'right' },
        5: { halign: 'center' },
        ...(hasBacktest ? { 6: { halign: 'right' }, 7: { halign: 'right' } } : {}),
      },
    })

    // ── Cohort Comparison ──
    if (hasBacktest) {
      y = (doc as any).lastAutoTable.finalY + 8

      // Check if we need a new page
      if (y > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage()
        y = 15
      }

      doc.setFontSize(12)
      doc.setTextColor(40, 40, 40)
      doc.text('Cohort Performance Comparison', 14, y)
      y += 6

      const cohortAvgReturn = getCohortAvgReturn()
      const compData = result!.comparisons.map(comp => {
        const periods = comp.targetPerformance?.periods
        const ret = periods && periods.length > 0
          ? periods[periods.length - 1].cumulativeReturn
          : 0
        const stock = stocks.find(s => s.stockId === comp.targetStockId)
        return [
          stock?.stockName ?? comp.targetStockId,
          stock?.normalizedScore.toFixed(1) ?? '—',
          `${ret >= 0 ? '+' : ''}${ret.toFixed(1)}%`,
          `${(ret - cohortAvgReturn) >= 0 ? '+' : ''}${(ret - cohortAvgReturn).toFixed(1)}%`,
          ret > cohortAvgReturn ? 'Yes' : 'No',
        ]
      })

      autoTable(doc, {
        startY: y,
        head: [['Stock', 'Score', 'Return', 'Alpha', 'Outperformed']],
        body: compData,
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 138], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
      })
    }

    // ── Footer on each page ──
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(7)
      doc.setTextColor(160, 160, 160)
      doc.text(
        `StockFox | Page ${i} of ${pageCount} | ${today()}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 7,
        { align: 'center' }
      )
    }

    const safePdfVersion = (scorecard?.versionInfo.displayVersion ?? 'report')
      .replace(/[^a-z0-9._-]/gi, '_').substring(0, 50)
    doc.save(`stockfox-backtest-${safePdfVersion}-${today()}.pdf`)
  }

  if (!canExport) return null

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-800/60 border border-white/5 text-xs text-neutral-400 hover:text-white hover:border-white/10 transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Export Report</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {showMenu && (
        <div className="absolute bottom-full mb-1 left-0 w-44 bg-dark-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
          <button
            onClick={exportCSV}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-300 hover:bg-dark-700/80 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
            Export as CSV
          </button>
          <button
            onClick={exportPDF}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-300 hover:bg-dark-700/80 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-primary-400" />
            Export as PDF
          </button>
        </div>
      )}
    </div>
  )
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function today(): string {
  return new Date().toISOString().split('T')[0]
}
