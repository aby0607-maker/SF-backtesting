import { useState, useRef, useEffect } from 'react'
import { Send, Newspaper, TrendingUp, Link as LinkIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getNewsForStock, type NewsItem } from '@/data/news'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  newsItems?: NewsItem[]
  linkedSegments?: { stock: string; segmentId: string; name: string }[]
}

const suggestedQuestions = [
  "Why is Zomato's profitability score low?",
  "Explain ROE in simple terms",
  "Compare Axis Bank vs HDFC Bank",
  "What are the red flags for TCS?",
]

const newsQuestions = [
  "What's the latest news on Zomato?",
  "Any news affecting Axis Bank's score?",
  "Show me TCS news and impacts",
]

// Pre-scripted responses for news queries
const getNewsResponse = (query: string): { content: string; newsItems?: NewsItem[]; linkedSegments?: { stock: string; segmentId: string; name: string }[] } => {
  const lowerQuery = query.toLowerCase()

  if (lowerQuery.includes('zomato') && (lowerQuery.includes('news') || lowerQuery.includes('latest'))) {
    const news = getNewsForStock('zomato')
    return {
      content: `Here's the latest news for **Zomato (Eternal)**:\n\n${news.slice(0, 3).map((n, i) =>
        `${i + 1}. **${n.headline}** (${n.source})\n   ${n.summary}\n   Impact: ${n.impactSegments.join(', ')} segments`
      ).join('\n\n')}\n\nThese news items affect the segments listed above. Click to see how they impact the analysis.`,
      newsItems: news.slice(0, 3),
      linkedSegments: [
        { stock: 'zomato', segmentId: 'profitability', name: 'Profitability' },
        { stock: 'zomato', segmentId: 'growth', name: 'Growth' },
      ],
    }
  }

  if (lowerQuery.includes('axis') && (lowerQuery.includes('news') || lowerQuery.includes('affecting'))) {
    const news = getNewsForStock('axisbank')
    return {
      content: `Here's how recent news is affecting **Axis Bank's** score:\n\n${news.slice(0, 3).map((n, i) =>
        `${i + 1}. **${n.headline}** (${n.sentiment === 'positive' ? 'Positive' : n.sentiment === 'negative' ? 'Negative' : 'Neutral'})\n   ${n.summary}\n   Affects: ${n.impactSegments.join(', ')}`
      ).join('\n\n')}\n\n**Score Impact:** The positive earnings news has contributed +0.3 to the overall score this week.`,
      newsItems: news.slice(0, 3),
      linkedSegments: [
        { stock: 'axisbank', segmentId: 'profitability', name: 'Profitability' },
        { stock: 'axisbank', segmentId: 'financials', name: 'Financial Health' },
      ],
    }
  }

  if (lowerQuery.includes('tcs') && (lowerQuery.includes('news') || lowerQuery.includes('impact'))) {
    const news = getNewsForStock('tcs')
    return {
      content: `Latest **TCS** news and their impact on analysis:\n\n${news.slice(0, 3).map((n, i) =>
        `${i + 1}. **${n.headline}**\n   Sentiment: ${n.sentiment === 'positive' ? 'Positive' : n.sentiment === 'negative' ? 'Negative' : 'Neutral'}\n   ${n.summary}`
      ).join('\n\n')}\n\n**Analysis Impact:**\n- IT spending news affects **Growth** segment\n- Dividend announcement impacts **Valuation** for dividend investors\n\n*Source: Company filings, Financial news aggregators*`,
      newsItems: news.slice(0, 3),
      linkedSegments: [
        { stock: 'tcs', segmentId: 'growth', name: 'Growth' },
        { stock: 'tcs', segmentId: 'valuation', name: 'Valuation' },
      ],
    }
  }

  // Generic responses for common questions
  if (lowerQuery.includes('zomato') && lowerQuery.includes('profitability')) {
    return {
      content: `**Zomato's Profitability Score Analysis**\n\nZomato scores **4.2/10** on profitability, which is below sector average (5.8). Here's why:\n\n**Key Issues:**\n1. **Operating Margin: -2.3%** - Still burning cash on customer acquisition\n2. **ROCE: 1.8%** - Low return on invested capital\n3. **Net Profit Margin: -1.5%** - Just turned profitable in Q4\n\n**Context:** This is typical for growth-stage tech companies prioritizing market share over profits. For growth investors, this may be acceptable if revenue growth (45% YoY) continues.\n\n**What to watch:** Operating leverage improving as Blinkit scales.\n\n*Source: Q3 FY24 Investor Presentation, Page 12*`,
      linkedSegments: [
        { stock: 'zomato', segmentId: 'profitability', name: 'Profitability Deep Dive' },
      ],
    }
  }

  if (lowerQuery.includes('roe') && lowerQuery.includes('simple')) {
    return {
      content: `**ROE Explained Simply**\n\nROE (Return on Equity) tells you how efficiently a company uses shareholder money to generate profits.\n\n**Think of it like this:**\nIf you invested Rs.100 in a company and they made Rs.20 profit using that money, the ROE is 20%.\n\n**Formula:** Net Profit / Shareholder Equity × 100\n\n**What's good?**\n- Above 15%: Excellent\n- 10-15%: Good\n- Below 10%: May need investigation\n\n**Example from your watchlist:**\n- TCS: 47% ROE (excellent)\n- HDFC Bank: 16% ROE (good)\n- Zomato: 2% ROE (low, but improving)\n\n**Why it matters for YOU:** As a growth investor, look for improving ROE trend, not just current value.`,
    }
  }

  if (lowerQuery.includes('compare') && lowerQuery.includes('axis') && lowerQuery.includes('hdfc')) {
    return {
      content: `**Axis Bank vs HDFC Bank Comparison**\n\n| Metric | Axis Bank | HDFC Bank |\n|--------|-----------|------------|\n| Overall Score | 7.2 | 8.1 |\n| P/E Ratio | 12.5x | 18.2x |\n| ROE | 16.2% | 17.8% |\n| NPA Ratio | 1.8% | 1.2% |\n| Growth (YoY) | 22% | 18% |\n\n**Verdict by Profile:**\n- **Growth Investor:** Axis Bank edges out (faster growth, cheaper valuation)\n- **Value Investor:** Axis Bank (lower P/E, acceptable quality)\n- **Safety-First:** HDFC Bank (better asset quality, track record)\n\n**Key Insight:** Axis Bank offers better value but slightly higher risk. HDFC Bank is premium-priced for premium quality.\n\n*Source: Q3 FY24 Results, Bloomberg*`,
      linkedSegments: [
        { stock: 'axisbank', segmentId: 'valuation', name: 'Axis Valuation' },
        { stock: 'hdfcbank', segmentId: 'valuation', name: 'HDFC Valuation' },
      ],
    }
  }

  if (lowerQuery.includes('red flag') && lowerQuery.includes('tcs')) {
    return {
      content: `**TCS Red Flag Analysis**\n\nGood news! TCS has **0 critical red flags** out of 16 parameters scanned.\n\n**All Clear:**\n- Debt/Equity: 0.02 (Excellent)\n- Promoter Pledge: 0% (Safe)\n- Auditor Opinion: Clean\n- Related Party Transactions: Normal\n- Cash Flow Quality: Strong\n\n**Minor Watch Items (not red flags):**\n1. **Attrition Rate: 13.2%** - Industry average, but worth monitoring\n2. **Revenue Concentration:** Top 10 clients = 35% revenue\n\n**Verdict:** TCS is one of the cleanest large-caps on governance and financial health metrics.\n\n*Source: Annual Report FY24, Corporate Governance Section*`,
      linkedSegments: [
        { stock: 'tcs', segmentId: 'governance', name: 'Governance' },
        { stock: 'tcs', segmentId: 'balancesheet', name: 'Balance Sheet' },
      ],
    }
  }

  return { content: '' }
}

// Format message content with basic markdown
function formatContent(content: string) {
  // Simple markdown parsing for bold text
  const parts = content.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="text-neutral-400 text-sm">{part.slice(1, -1)}</em>
    }
    return part
  })
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate typing delay
    setTimeout(() => {
      const newsResponse = getNewsResponse(input)

      let assistantMessage: Message

      if (newsResponse.content) {
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: newsResponse.content,
          newsItems: newsResponse.newsItems,
          linkedSegments: newsResponse.linkedSegments,
        }
      } else {
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `I understand you're asking about "${input}". Let me look into that...\n\n**Analysis:** This is a demo response. In the full product, I'll provide detailed, stock-specific answers with citations to source documents.\n\nTry asking me about:\n- Zomato's profitability\n- ROE explained simply\n- Compare Axis Bank vs HDFC Bank\n- Red flags for TCS\n\n*Source: Demo placeholder*`,
        }
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
    }, 800)
  }

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] animate-fade-in">
      {/* Chat Header */}
      <div className="bg-dark-800/80 backdrop-blur-xl rounded-2xl border border-white/5 p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <span className="text-2xl">🦊</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">StockFox AI</h1>
            <p className="text-sm text-neutral-400">Ask anything about stocks & analysis</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {/* Welcome message when empty */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center px-4"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-4xl">🦊</span>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">How can I help you today?</h2>
            <p className="text-neutral-400 text-sm max-w-md mb-6">
              I can explain stock metrics, analyze companies, compare stocks, and answer your investment questions.
            </p>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'flex gap-3',
                message.role === 'user' && 'flex-row-reverse'
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                  message.role === 'assistant'
                    ? 'bg-primary-500/20'
                    : 'bg-dark-600'
                )}
              >
                {message.role === 'assistant' ? (
                  <span className="text-sm">🦊</span>
                ) : (
                  <span className="text-sm">👤</span>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={cn(
                  'max-w-[85%] p-4 rounded-2xl',
                  message.role === 'assistant'
                    ? 'bg-dark-800 border border-white/5'
                    : 'bg-primary-600'
                )}
              >
                <p className={cn(
                  'text-sm leading-relaxed whitespace-pre-wrap',
                  message.role === 'assistant' ? 'text-neutral-300' : 'text-white'
                )}>
                  {message.role === 'assistant' ? formatContent(message.content) : message.content}
                </p>

                {/* Linked Segments */}
                {message.linkedSegments && message.linkedSegments.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <p className="text-xs text-neutral-500 mb-2 flex items-center gap-1">
                      <LinkIcon className="w-3 h-3" />
                      Related Segments:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {message.linkedSegments.map((seg, i) => (
                        <Link
                          key={i}
                          to={`/stock/${seg.stock}/segment/${seg.segmentId}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-500/10 text-primary-400 rounded-lg text-xs hover:bg-primary-500/20 transition-colors"
                        >
                          <TrendingUp className="w-3 h-3" />
                          {seg.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <span className="text-sm">🦊</span>
            </div>
            <div className="bg-dark-800 border border-white/5 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions - Show when few messages */}
      {messages.length <= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 space-y-3"
        >
          <div>
            <p className="text-xs text-neutral-500 mb-2">Analysis questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 border border-white/5 rounded-full text-xs text-neutral-300 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-2 flex items-center gap-1">
              <Newspaper className="w-3 h-3" />
              News & signals:
            </p>
            <div className="flex flex-wrap gap-2">
              {newsQuestions.map((question, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="px-3 py-1.5 bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/20 text-primary-400 rounded-full text-xs transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Input Area */}
      <div className="bg-dark-800/80 backdrop-blur-xl rounded-2xl border border-white/5 p-3">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about any stock..."
            className="flex-1 bg-dark-700 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500/50 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={cn(
              'p-3 rounded-xl transition-all',
              input.trim() && !isTyping
                ? 'bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-500/20'
                : 'bg-dark-700 text-neutral-500'
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
