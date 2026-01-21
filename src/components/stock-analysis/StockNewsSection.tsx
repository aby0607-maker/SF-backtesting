import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Newspaper, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NewsItem {
  id: string
  headline: string
  sentiment: 'positive' | 'negative' | 'neutral'
  source: string
}

interface StockNewsSectionProps {
  news: NewsItem[]
}

export function StockNewsSection({ news }: StockNewsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Show first 2 items in grid, rest in dropdown
  const visibleNews = news.slice(0, 2)
  const hiddenNews = news.slice(2)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="rounded-2xl bg-dark-800 border border-white/5 p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-primary-400" />
          <h3 className="font-semibold text-white">Recent News</h3>
        </div>
        <span className="text-xs text-neutral-500">{news.length} articles</span>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-2 gap-3">
        {visibleNews.map((item) => (
          <div
            key={item.id}
            className={cn(
              'p-3 rounded-xl bg-dark-700/50 border-l-2',
              item.sentiment === 'positive' && 'border-l-success-500',
              item.sentiment === 'negative' && 'border-l-destructive-500',
              item.sentiment === 'neutral' && 'border-l-neutral-500'
            )}
          >
            <div className="flex items-start gap-2">
              {item.sentiment === 'positive' && <TrendingUp className="w-3.5 h-3.5 text-success-400 mt-0.5 flex-shrink-0" />}
              {item.sentiment === 'negative' && <TrendingDown className="w-3.5 h-3.5 text-destructive-400 mt-0.5 flex-shrink-0" />}
              {item.sentiment === 'neutral' && <Newspaper className="w-3.5 h-3.5 text-neutral-400 mt-0.5 flex-shrink-0" />}
              <div className="min-w-0">
                <p className="text-sm font-medium text-white line-clamp-2">{item.headline}</p>
                <p className="text-[10px] text-neutral-500 mt-1.5">{item.source}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dropdown for More News */}
      {hiddenNews.length > 0 && (
        <>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {hiddenNews.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        'p-3 rounded-xl bg-dark-700/50 border-l-2',
                        item.sentiment === 'positive' && 'border-l-success-500',
                        item.sentiment === 'negative' && 'border-l-destructive-500',
                        item.sentiment === 'neutral' && 'border-l-neutral-500'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {item.sentiment === 'positive' && <TrendingUp className="w-3.5 h-3.5 text-success-400 mt-0.5 flex-shrink-0" />}
                        {item.sentiment === 'negative' && <TrendingDown className="w-3.5 h-3.5 text-destructive-400 mt-0.5 flex-shrink-0" />}
                        {item.sentiment === 'neutral' && <Newspaper className="w-3.5 h-3.5 text-neutral-400 mt-0.5 flex-shrink-0" />}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white line-clamp-2">{item.headline}</p>
                          <p className="text-[10px] text-neutral-500 mt-1.5">{item.source}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mt-3 py-2 rounded-xl bg-dark-700/30 hover:bg-dark-700/50 border border-white/5 text-xs text-neutral-400 hover:text-white transition-all flex items-center justify-center gap-1.5"
          >
            <span>{isExpanded ? 'Show Less' : `View ${hiddenNews.length} More`}</span>
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', isExpanded && 'rotate-180')} />
          </button>
        </>
      )}
    </motion.div>
  )
}
