import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeftRight, Plus, X, ChevronDown, Trophy, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { stocks } from '@/data/stocks'
import { getVerdict } from '@/data/verdicts'
import { useAppStore } from '@/store/useAppStore'
import { ScoreGauge } from '@/components/ui/ScoreGauge'
import { VerdictBadge } from '@/components/ui/VerdictBadge'
import { StaggerContainer, StaggerItem } from '@/components/motion'
import type { StockVerdict, SegmentScore } from '@/types'

// Stock selector dropdown component
function StockSelector({
  selectedId,
  onSelect,
  excludeIds,
  onRemove,
  canRemove,
  verdict,
  isWinner,
}: {
  selectedId: string | null
  onSelect: (id: string) => void
  excludeIds: string[]
  onRemove?: () => void
  canRemove?: boolean
  verdict?: StockVerdict
  isWinner?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const availableStocks = stocks.filter(s => !excludeIds.includes(s.id) || s.id === selectedId)
  const selectedStock = selectedId ? stocks.find(s => s.id === selectedId) : null

  return (
    <div className="relative">
      <motion.div
        className={cn(
          'p-4 rounded-xl bg-dark-800/80 backdrop-blur-xl border transition-all duration-200',
          isWinner ? 'border-success-500/50 shadow-glow-green' : 'border-white/10',
          'hover:border-primary-500/30'
        )}
        whileHover={{ scale: 1.01 }}
      >
        {/* Winner badge */}
        {isWinner && (
          <div className="absolute -top-2 -right-2">
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              className="w-6 h-6 rounded-full bg-success-500 flex items-center justify-center shadow-glow-green"
            >
              <Trophy className="w-3 h-3 text-white" />
            </motion.div>
          </div>
        )}

        {/* Dropdown trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-2 text-left"
        >
          <span className="text-xs text-neutral-500 uppercase tracking-wide">
            {selectedStock ? selectedStock.sector : 'Select Stock'}
          </span>
          <ChevronDown className={cn(
            'w-4 h-4 text-neutral-500 transition-transform',
            isOpen && 'rotate-180'
          )} />
        </button>

        {/* Stock info */}
        {selectedStock && verdict ? (
          <div className="mt-3 text-center">
            <h3 className="text-lg font-semibold text-white">{selectedStock.symbol}</h3>
            <p className="text-xs text-neutral-400 truncate">{selectedStock.name}</p>

            <div className="mt-3 flex flex-col items-center gap-2">
              <ScoreGauge score={verdict.overallScore} size="sm" />
              <VerdictBadge verdict={verdict.verdict} size="sm" />
            </div>

            {verdict.sectorRank && (
              <p className="mt-2 text-xs text-neutral-500">
                #{verdict.sectorRank} in {selectedStock.sector}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-3 py-8 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-dark-700 flex items-center justify-center mb-2">
              <Plus className="w-6 h-6 text-neutral-500" />
            </div>
            <p className="text-sm text-neutral-500">Select a stock</p>
          </div>
        )}

        {/* Remove button */}
        {canRemove && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="absolute top-2 right-2 p-1 rounded-full bg-dark-700 hover:bg-destructive-500/20 text-neutral-500 hover:text-destructive-400 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </motion.div>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 mt-2 w-full rounded-lg bg-dark-700 border border-white/10 shadow-xl overflow-hidden"
          >
            {availableStocks.map(stock => (
              <button
                key={stock.id}
                onClick={() => {
                  onSelect(stock.id)
                  setIsOpen(false)
                }}
                className={cn(
                  'w-full px-4 py-3 text-left hover:bg-dark-600 transition-colors',
                  selectedId === stock.id && 'bg-primary-500/10'
                )}
              >
                <div className="font-medium text-white">{stock.symbol}</div>
                <div className="text-xs text-neutral-500">{stock.name}</div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Segment comparison row
function SegmentRow({
  segment,
  scores,
  stockIds,
  isExpanded,
  onToggle,
}: {
  segment: SegmentScore
  scores: (number | undefined)[]
  stockIds: string[]
  isExpanded: boolean
  onToggle: () => void
}) {
  const maxScore = Math.max(...scores.filter((s): s is number => s !== undefined))
  const winnerIndex = scores.findIndex(s => s === maxScore)

  return (
    <motion.div
      layout
      className="border-b border-white/5 last:border-0"
    >
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-4 hover:bg-dark-700/50 transition-colors"
      >
        {/* Segment name */}
        <div className="flex-1 text-left">
          <span className="text-sm font-medium text-white">{segment.name}</span>
          {segment.weight && (
            <span className="ml-2 text-xs text-neutral-600">
              {(segment.weight * 100).toFixed(0)}% weight
            </span>
          )}
        </div>

        {/* Score cells */}
        {scores.map((score, i) => (
          <div
            key={stockIds[i] || i}
            className={cn(
              'w-16 text-center',
              i === winnerIndex && score !== undefined && 'relative'
            )}
          >
            {score !== undefined ? (
              <span className={cn(
                'text-sm font-semibold tabular-nums',
                i === winnerIndex ? 'text-success-400' : 'text-neutral-300'
              )}>
                {score.toFixed(1)}
                {i === winnerIndex && (
                  <Star className="inline w-3 h-3 ml-0.5 text-success-400 fill-success-400" />
                )}
              </span>
            ) : (
              <span className="text-neutral-600">—</span>
            )}
          </div>
        ))}

        <ChevronDown className={cn(
          'w-4 h-4 text-neutral-500 transition-transform',
          isExpanded && 'rotate-180'
        )} />
      </button>

      {/* Expanded metrics */}
      <AnimatePresence>
        {isExpanded && segment.metrics && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-dark-800/50"
          >
            <div className="px-4 py-3 space-y-2">
              {segment.metrics.slice(0, 4).map(metric => (
                <div key={metric.name} className="flex items-center gap-4 text-xs">
                  <span className="flex-1 text-neutral-400">{metric.name}</span>
                  <span className="text-neutral-300">{metric.displayValue}</span>
                  {metric.sectorAvgDisplay && (
                    <span className="text-neutral-600">
                      vs {metric.sectorAvgDisplay} sector
                    </span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Key metrics comparison
function KeyMetricsComparison({
  verdicts,
  stockSymbols,
}: {
  verdicts: (StockVerdict | undefined)[]
  stockSymbols: string[]
}) {
  // Extract key metrics from first stock's segments
  const keyMetrics = [
    { id: 'roe', name: 'ROE', segmentId: 'profitability', metricName: 'ROE' },
    { id: 'netMargin', name: 'Net Margin', segmentId: 'profitability', metricName: 'Net Margin' },
    { id: 'debtEquity', name: 'Debt/Equity', segmentId: 'financials', metricName: 'Debt to Equity' },
    { id: 'revenueGrowth', name: 'Revenue Growth', segmentId: 'growth', metricName: 'Revenue Growth' },
    { id: 'pe', name: 'P/E Ratio', segmentId: 'valuation', metricName: 'P/E Ratio' },
  ]

  const getMetricValue = (verdict: StockVerdict | undefined, segmentId: string, metricName: string) => {
    if (!verdict) return undefined
    const segment = verdict.segments?.find(s => s.id === segmentId)
    const metric = segment?.metrics?.find(m =>
      m.name.toLowerCase().includes(metricName.toLowerCase()) ||
      metricName.toLowerCase().includes(m.name.toLowerCase())
    )
    return metric?.displayValue
  }

  return (
    <div className="rounded-xl bg-dark-800/80 backdrop-blur-xl border border-white/10 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5">
        <h3 className="text-sm font-semibold text-white">Key Metrics</h3>
      </div>

      <div className="divide-y divide-white/5">
        {/* Header row */}
        <div className="px-4 py-2 flex items-center gap-4 bg-dark-700/30">
          <div className="flex-1 text-xs text-neutral-500 uppercase tracking-wide">Metric</div>
          {stockSymbols.map((symbol, i) => (
            <div key={i} className="w-20 text-center text-xs text-neutral-500 font-medium">
              {symbol || '—'}
            </div>
          ))}
        </div>

        {/* Metric rows */}
        {keyMetrics.map(metric => {
          const values = verdicts.map(v => getMetricValue(v, metric.segmentId, metric.metricName))

          return (
            <div key={metric.id} className="px-4 py-2.5 flex items-center gap-4">
              <div className="flex-1 text-sm text-neutral-300">{metric.name}</div>
              {values.map((value, i) => (
                <div key={i} className="w-20 text-center text-sm font-medium text-white">
                  {value || '—'}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Main Compare page component
export function Compare() {
  const { currentProfileId } = useAppStore()
  const [selectedStockIds, setSelectedStockIds] = useState<(string | null)[]>(['zomato', 'axisbank'])
  const [expandedSegment, setExpandedSegment] = useState<string | null>(null)

  // Get verdicts for selected stocks
  const verdicts = useMemo(() => {
    return selectedStockIds.map(id =>
      id ? getVerdict(id, currentProfileId) : undefined
    )
  }, [selectedStockIds, currentProfileId])

  // Find winner (highest overall score)
  const winnerIndex = useMemo(() => {
    const scores = verdicts.map(v => v?.overallScore ?? 0)
    const maxScore = Math.max(...scores)
    return scores.indexOf(maxScore)
  }, [verdicts])

  // Get all segments from first verdict with data
  const segments = useMemo(() => {
    const firstWithSegments = verdicts.find(v => v?.segments?.length)
    return firstWithSegments?.segments || []
  }, [verdicts])

  // Stock symbols for display
  const stockSymbols = selectedStockIds.map(id =>
    id ? stocks.find(s => s.id === id)?.symbol || '' : ''
  )

  // Handlers
  const handleSelectStock = (index: number, stockId: string) => {
    const newIds = [...selectedStockIds]
    newIds[index] = stockId
    setSelectedStockIds(newIds)
  }

  const handleAddStock = () => {
    if (selectedStockIds.length < 3) {
      setSelectedStockIds([...selectedStockIds, null])
    }
  }

  const handleRemoveStock = (index: number) => {
    if (selectedStockIds.length > 2) {
      const newIds = selectedStockIds.filter((_, i) => i !== index)
      setSelectedStockIds(newIds)
    }
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-primary-500/20">
            <ArrowLeftRight className="w-5 h-5 text-primary-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Compare Stocks</h1>
        </div>
        <p className="text-sm text-neutral-500">
          Side-by-side analysis across all 11 segments
        </p>
      </motion.div>

      {/* Stock Selectors */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {selectedStockIds.map((stockId, index) => (
          <StaggerItem key={index}>
            <StockSelector
              selectedId={stockId}
              onSelect={(id) => handleSelectStock(index, id)}
              excludeIds={selectedStockIds.filter((id): id is string => id !== null && id !== stockId)}
              onRemove={() => handleRemoveStock(index)}
              canRemove={selectedStockIds.length > 2}
              verdict={verdicts[index]}
              isWinner={index === winnerIndex && verdicts[index] !== undefined}
            />
          </StaggerItem>
        ))}

        {/* Add stock button */}
        {selectedStockIds.length < 3 && (
          <motion.button
            onClick={handleAddStock}
            className={cn(
              'p-4 rounded-xl border-2 border-dashed border-white/10',
              'flex flex-col items-center justify-center gap-2',
              'hover:border-primary-500/30 hover:bg-dark-800/50 transition-all',
              'min-h-[180px]'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-8 h-8 text-neutral-600" />
            <span className="text-sm text-neutral-500">Add Stock</span>
          </motion.button>
        )}
      </div>

      {/* 11-Segment Comparison Table */}
      {segments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl bg-dark-800/80 backdrop-blur-xl border border-white/10 overflow-hidden"
        >
          {/* Table header */}
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white">11-Segment Analysis</h3>
              <p className="text-xs text-neutral-500">Click any row to see detailed metrics</p>
            </div>
            {stockSymbols.map((symbol, i) => (
              <div
                key={i}
                className={cn(
                  'w-16 text-center text-xs font-semibold',
                  i === winnerIndex ? 'text-success-400' : 'text-neutral-300'
                )}
              >
                {symbol || '—'}
              </div>
            ))}
            <div className="w-4" /> {/* Spacer for chevron */}
          </div>

          {/* Segment rows */}
          <StaggerContainer staggerDelay={0.03} initialDelay={0.1}>
            {segments.map(segment => {
              const scores = verdicts.map(v =>
                v?.segments?.find(s => s.id === segment.id)?.score
              )

              return (
                <StaggerItem key={segment.id}>
                  <SegmentRow
                    segment={segment}
                    scores={scores}
                    stockIds={selectedStockIds.filter((id): id is string => id !== null)}
                    isExpanded={expandedSegment === segment.id}
                    onToggle={() => setExpandedSegment(
                      expandedSegment === segment.id ? null : segment.id
                    )}
                  />
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        </motion.div>
      )}

      {/* Key Metrics Comparison */}
      {verdicts.some(v => v) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <KeyMetricsComparison verdicts={verdicts} stockSymbols={stockSymbols} />
        </motion.div>
      )}

      {/* Verdict Summary */}
      {verdicts.filter(v => v).length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl bg-dark-800/80 backdrop-blur-xl border border-white/10 p-4"
        >
          <h3 className="text-sm font-semibold text-white mb-3">Verdict Summary</h3>
          <div className="space-y-3">
            {verdicts.map((verdict, i) => {
              if (!verdict) return null
              const stock = stocks.find(s => s.id === selectedStockIds[i])

              return (
                <div key={i} className="flex items-start gap-3">
                  <div className={cn(
                    'w-2 h-2 mt-1.5 rounded-full flex-shrink-0',
                    i === winnerIndex ? 'bg-success-400' : 'bg-neutral-600'
                  )} />
                  <div>
                    <span className="font-medium text-white">{stock?.symbol}: </span>
                    <span className="text-sm text-neutral-400">{verdict.verdictRationale}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
