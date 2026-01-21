import { useState, useEffect } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { getStockBySymbol, getVerdictForStock } from '@/data'
import { getNewsForStock, getUpcomingEvents, type NewsItem, type UpcomingEvent } from '@/data/news'
import type { Stock, StockVerdict, SegmentScore, UserProfile } from '@/types'

interface UseStockAnalysisParams {
  ticker: string | undefined
  currentProfile: UserProfile | null
}

interface UseStockAnalysisReturn {
  // Data
  stock: Stock | null
  verdict: StockVerdict | null
  news: NewsItem[]
  upcomingEvents: UpcomingEvent[]

  // Loading state
  isLoading: boolean

  // View state
  isFullView: boolean
  setIsFullView: (value: boolean) => void

  // Evidence modal state
  evidenceModalOpen: boolean
  setEvidenceModalOpen: (value: boolean) => void
  selectedSegmentForEvidence: SegmentScore | null
  setSelectedSegmentForEvidence: (segment: SegmentScore | null) => void
  overallEvidenceModalOpen: boolean
  setOverallEvidenceModalOpen: (value: boolean) => void

  // Guided analysis modal state
  guidedModalOpen: boolean
  setGuidedModalOpen: (value: boolean) => void

  // Reflection modal state
  reflectionModalOpen: boolean
  setReflectionModalOpen: (value: boolean) => void
}

export function useStockAnalysis({ ticker, currentProfile }: UseStockAnalysisParams): UseStockAnalysisReturn {
  const location = useLocation()
  const [searchParams] = useSearchParams()

  // Data state
  const [isLoading, setIsLoading] = useState(true)
  const [stock, setStock] = useState<Stock | null>(null)
  const [verdict, setVerdict] = useState<StockVerdict | null>(null)
  const [news, setNews] = useState<NewsItem[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])

  // Progressive disclosure state - check URL for initial state
  const [isFullView, setIsFullView] = useState(() => searchParams.get('view') === 'full')

  // Evidence modal state
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false)
  const [selectedSegmentForEvidence, setSelectedSegmentForEvidence] = useState<SegmentScore | null>(null)
  const [overallEvidenceModalOpen, setOverallEvidenceModalOpen] = useState(false)

  // Guided analysis modal state
  const [guidedModalOpen, setGuidedModalOpen] = useState(false)

  // Reflection modal state
  const [reflectionModalOpen, setReflectionModalOpen] = useState(false)

  // Fetch data on mount or when ticker/profile changes
  useEffect(() => {
    if (!ticker || !currentProfile) return

    setIsLoading(true)
    const timer = setTimeout(() => {
      const stockData = getStockBySymbol(ticker)
      const verdictData = getVerdictForStock(ticker, currentProfile.id)
      const newsData = getNewsForStock(ticker)

      setStock(stockData || null)
      setVerdict(verdictData || null)
      setNews(newsData.slice(0, 5))
      setUpcomingEvents(getUpcomingEvents(ticker))
      setIsLoading(false)
    }, 400)

    return () => clearTimeout(timer)
  }, [ticker, currentProfile])

  // Handle URL params for navigation from segment deep-dive
  useEffect(() => {
    if (searchParams.get('view') === 'full') {
      setIsFullView(true)
    }
  }, [searchParams, location.hash, isLoading])

  return {
    // Data
    stock,
    verdict,
    news,
    upcomingEvents,

    // Loading state
    isLoading,

    // View state
    isFullView,
    setIsFullView,

    // Evidence modal state
    evidenceModalOpen,
    setEvidenceModalOpen,
    selectedSegmentForEvidence,
    setSelectedSegmentForEvidence,
    overallEvidenceModalOpen,
    setOverallEvidenceModalOpen,

    // Guided analysis modal state
    guidedModalOpen,
    setGuidedModalOpen,

    // Reflection modal state
    reflectionModalOpen,
    setReflectionModalOpen,
  }
}
