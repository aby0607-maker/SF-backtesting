import { useState } from 'react'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const suggestedQuestions = [
  "Why is Zomato's profitability score low?",
  "Explain ROE in simple terms",
  "Compare Axis Bank vs HDFC Bank",
  "What are the red flags for TCS?",
]

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

    // Mock response - will be replaced with pre-scripted responses
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `Great question! Let me analyze that for you...\n\nBased on the data I have, here's what I found:\n\n**Key Insight:** This is a placeholder response. In the full demo, I'll provide detailed, stock-specific answers with citations to source documents.\n\n📊 *Source: Annual Report FY24, Page 45*`,
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
            </div>
          </div>
        ))}
      </div>

      {/* Suggested Questions */}
      {messages.length <= 2 && (
        <div className="mb-4">
          <p className="text-caption text-content-tertiary mb-2">Suggested questions:</p>
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
