import { useState } from 'react'
import { Send, Bot, User, Sparkles, Newspaper, TrendingUp, Link as LinkIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
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
      ).join('\n\n')}\n\n📰 *These news items affect the segments listed above. Click to see how they impact the analysis.*`,
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
        `${i + 1}. **${n.headline}** (${n.sentiment === 'positive' ? '🟢 Positive' : n.sentiment === 'negative' ? '🔴 Negative' : '⚪ Neutral'})\n   ${n.summary}\n   Affects: ${n.impactSegments.join(', ')}`
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
        `${i + 1}. **${n.headline}**\n   Sentiment: ${n.sentiment === 'positive' ? '🟢 Positive' : n.sentiment === 'negative' ? '🔴 Negative' : '⚪ Neutral'}\n   ${n.summary}`
      ).join('\n\n')}\n\n**Analysis Impact:**\n- IT spending news affects **Growth** segment\n- Dividend announcement impacts **Valuation** for dividend investors\n\n📊 *Source: Company filings, Financial news aggregators*`,
      newsItems: news.slice(0, 3),
      linkedSegments: [
        { stock: 'tcs', segmentId: 'growth', name: 'Growth' },
        { stock: 'tcs', segmentId: 'valuation', name: 'Valuation' },
      ],
    }
  }

  return { content: '' }
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your StockFox AI assistant. I can help you understand stock analysis, explain metrics, and answer questions about any stock in our database. What would you like to know?",
    },
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    }

    // Check for news-related queries first
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
      // Default response for non-news queries
      assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Great question! Let me analyze that for you...\n\nBased on the data I have, here's what I found:\n\n**Key Insight:** This is a placeholder response. In the full demo, I'll provide detailed, stock-specific answers with citations to source documents.\n\n📊 *Source: Annual Report FY24, Page 45*`,
      }
    }

    setMessages([...messages, userMessage, assistantMessage])
    setInput('')
  }

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] animate-fade-in">
      {/* Chat Header */}
      <div className="card mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-h4">StockFox AI</h1>
            <p className="text-body-sm text-content-secondary">Ask anything about stocks & analysis</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-thin">
        {messages.map(message => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3',
              message.role === 'user' && 'flex-row-reverse'
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                message.role === 'assistant' ? 'bg-primary-100' : 'bg-gray-100'
              )}
            >
              {message.role === 'assistant' ? (
                <Bot className="w-4 h-4 text-primary-600" />
              ) : (
                <User className="w-4 h-4 text-gray-600" />
              )}
            </div>
            <div
              className={cn(
                'max-w-[80%] p-4 rounded-card',
                message.role === 'assistant' ? 'bg-white shadow-card' : 'bg-primary-600 text-white'
              )}
            >
              <p className="text-body whitespace-pre-wrap">{message.content}</p>

              {/* Linked Segments - Show for news responses */}
              {message.linkedSegments && message.linkedSegments.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-caption text-gray-500 mb-2 flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" />
                    Related Segments:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {message.linkedSegments.map((seg, i) => (
                      <Link
                        key={i}
                        to={`/stock/${seg.stock}/segment/${seg.segmentId}`}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 rounded text-caption hover:bg-primary-100 transition-colors"
                      >
                        <TrendingUp className="w-3 h-3" />
                        {seg.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Suggested Questions */}
      {messages.length <= 2 && (
        <div className="mb-4 space-y-3">
          <div>
            <p className="text-caption text-content-tertiary mb-2">Analysis questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="px-3 py-1.5 bg-surface-tertiary rounded-full text-body-sm hover:bg-gray-200 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-caption text-content-tertiary mb-2 flex items-center gap-1">
              <Newspaper className="w-3 h-3" />
              News & signals:
            </p>
            <div className="flex flex-wrap gap-2">
              {newsQuestions.map((question, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-body-sm hover:bg-primary-100 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="card p-3">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask about any stock..."
            className="input flex-1"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={cn(
              'p-3 rounded-full transition-colors',
              input.trim()
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-100 text-gray-400'
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
