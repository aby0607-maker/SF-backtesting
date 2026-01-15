import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Flame, Star, Sparkles, BarChart2, ChevronRight } from 'lucide-react'
import { cn, getVerdictBadgeClass } from '@/lib/utils'

const tabs = [
  { id: 'trending', label: 'Trending', icon: Flame },
  { id: 'top-rated', label: 'Top Rated', icon: Star },
  { id: 'for-you', label: 'For You', icon: Sparkles },
  { id: 'sectors', label: 'Sectors', icon: BarChart2 },
]

// Placeholder data
const trendingStocks = [
  { symbol: 'ZOMATO', name: 'Eternal (Zomato)', sector: 'Food Tech', score: 7.5, verdict: 'BUY', analyses: 1247 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', sector: 'Auto', score: 8.1, verdict: 'STRONG BUY', analyses: 892 },
  { symbol: 'IRFC', name: 'IRFC', sector: 'NBFC', score: 6.8, verdict: 'HOLD', analyses: 756 },
]

const topRatedStocks = [
  { symbol: 'TCS', name: 'TCS', sector: 'IT', score: 8.8, verdict: 'STRONG BUY' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Banking', score: 8.5, verdict: 'STRONG BUY' },
  { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Conglomerate', score: 8.2, verdict: 'BUY' },
]

const forYouStocks = [
  { symbol: 'DMART', name: 'Avenue Supermarts', sector: 'Retail', score: 7.8, verdict: 'BUY', reason: 'Matches your growth preference' },
  { symbol: 'PIDILITE', name: 'Pidilite Industries', sector: 'Chemicals', score: 8.0, verdict: 'BUY', reason: 'High ROE like stocks you favor' },
]

const sectors = [
  { name: 'Banking', topStock: 'HDFCBANK', avgScore: 7.8 },
  { name: 'IT Services', topStock: 'TCS', avgScore: 8.2 },
  { name: 'Pharma', topStock: 'SUNPHARMA', avgScore: 7.1 },
  { name: 'FMCG', topStock: 'HINDUNILVR', avgScore: 7.5 },
]

export function Discover() {
  const [activeTab, setActiveTab] = useState('trending')

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-h2 flex items-center gap-2">
          <Search className="w-7 h-7 text-primary-600" />
          Discover
        </h1>
        <p className="text-body text-content-secondary mt-1">
          Find your next investment opportunity
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-content-tertiary" />
        <input
          type="text"
          placeholder="Search stocks by name or symbol..."
          className="input pl-10"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-body-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'bg-surface-tertiary text-content-secondary hover:bg-gray-200'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="card">
        {activeTab === 'trending' && (
          <>
            <h2 className="text-h4 mb-4">🔥 Most Analyzed This Week</h2>
            <div className="space-y-3">
              {trendingStocks.map(stock => (
                <Link
                  key={stock.symbol}
                  to={`/stock/${stock.symbol.toLowerCase()}`}
                  className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-surface-secondary transition-colors group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stock.name}</span>
                      <span className={cn('badge', getVerdictBadgeClass(stock.verdict))}>
                        {stock.score}/10
                      </span>
                    </div>
                    <div className="text-body-sm text-content-secondary">
                      {stock.sector} • {stock.analyses.toLocaleString()} analyses
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-content-tertiary group-hover:text-primary-600" />
                </Link>
              ))}
            </div>
          </>
        )}

        {activeTab === 'top-rated' && (
          <>
            <h2 className="text-h4 mb-4">⭐ Highest Scored Stocks</h2>
            <div className="space-y-3">
              {topRatedStocks.map((stock, i) => (
                <Link
                  key={stock.symbol}
                  to={`/stock/${stock.symbol.toLowerCase()}`}
                  className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-surface-secondary transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-body-sm font-bold">
                      {i + 1}
                    </span>
                    <div>
                      <div className="font-medium">{stock.name}</div>
                      <div className="text-body-sm text-content-secondary">{stock.sector}</div>
                    </div>
                  </div>
                  <span className={cn('badge', getVerdictBadgeClass(stock.verdict))}>
                    {stock.score}/10
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}

        {activeTab === 'for-you' && (
          <>
            <h2 className="text-h4 mb-4">✨ Personalized for You</h2>
            <div className="space-y-3">
              {forYouStocks.map(stock => (
                <Link
                  key={stock.symbol}
                  to={`/stock/${stock.symbol.toLowerCase()}`}
                  className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-surface-secondary transition-colors group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stock.name}</span>
                      <span className={cn('badge', getVerdictBadgeClass(stock.verdict))}>
                        {stock.score}/10
                      </span>
                    </div>
                    <div className="text-body-sm text-primary-600">
                      💡 {stock.reason}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-content-tertiary group-hover:text-primary-600" />
                </Link>
              ))}
            </div>
          </>
        )}

        {activeTab === 'sectors' && (
          <>
            <h2 className="text-h4 mb-4">📊 Browse by Sector</h2>
            <div className="grid grid-cols-2 gap-3">
              {sectors.map(sector => (
                <div
                  key={sector.name}
                  className="p-4 bg-surface-secondary rounded-lg hover:bg-surface-tertiary transition-colors cursor-pointer"
                >
                  <div className="font-medium mb-1">{sector.name}</div>
                  <div className="text-body-sm text-content-secondary">
                    Top: {sector.topStock}
                  </div>
                  <div className="text-body-sm text-content-tertiary">
                    Avg Score: {sector.avgScore}/10
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
