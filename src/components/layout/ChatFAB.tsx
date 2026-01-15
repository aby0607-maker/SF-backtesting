import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// StockFox icon component
function FoxIcon({ className }: { className?: string }) {
  return (
    <span className={cn('text-2xl', className)}>🦊</span>
  )
}

export function ChatFAB() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isHovered, setIsHovered] = useState(false)

  // Don't show FAB on chat page itself
  const isOnChatPage = location.pathname === '/chat'

  if (isOnChatPage) return null

  const handleClick = () => {
    navigate('/chat')
  }

  return (
    <motion.div
      className="fixed bottom-24 right-4 z-50"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Tooltip/hint on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
          >
            <div className="px-3 py-1.5 bg-dark-700 rounded-lg border border-white/10 shadow-lg">
              <span className="text-sm text-white font-medium">Ask StockFox</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB button */}
      <motion.button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'relative w-14 h-14 rounded-full',
          'bg-gradient-to-br from-primary-500 to-primary-600',
          'shadow-lg shadow-primary-500/30',
          'flex items-center justify-center',
          'transition-all duration-200',
          'hover:shadow-xl hover:shadow-primary-500/40',
          'active:scale-95'
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-20" />

        {/* Icon */}
        <motion.div
          animate={{
            y: isHovered ? [0, -3, 0] : 0,
          }}
          transition={{
            duration: 0.5,
            repeat: isHovered ? Infinity : 0,
            repeatDelay: 1
          }}
        >
          <FoxIcon className="relative z-10 drop-shadow-md" />
        </motion.div>

        {/* Notification dot - optional indicator */}
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-success-400 rounded-full border-2 border-dark-900 flex items-center justify-center">
          <MessageSquare className="w-2 h-2 text-dark-900" />
        </span>
      </motion.button>
    </motion.div>
  )
}

// Alternative: Expandable FAB with quick actions
export function ChatFABExpanded() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isExpanded, setIsExpanded] = useState(false)

  const isOnChatPage = location.pathname === '/chat'

  if (isOnChatPage) return null

  const quickActions = [
    { label: 'Ask about this stock', action: () => navigate('/chat?context=stock') },
    { label: 'Compare stocks', action: () => navigate('/chat?context=compare') },
    { label: 'Explain a segment', action: () => navigate('/chat?context=explain') },
  ]

  return (
    <motion.div
      className="fixed bottom-24 right-4 z-50"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Quick actions menu */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full mb-3 right-0 w-48"
          >
            <div className="bg-dark-800 rounded-xl border border-white/10 shadow-xl overflow-hidden">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => {
                    action.action()
                    setIsExpanded(false)
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB button */}
      <motion.button
        onClick={() => isExpanded ? setIsExpanded(false) : navigate('/chat')}
        onContextMenu={(e) => {
          e.preventDefault()
          setIsExpanded(!isExpanded)
        }}
        className={cn(
          'relative w-14 h-14 rounded-full',
          'bg-gradient-to-br from-primary-500 to-primary-600',
          'shadow-lg shadow-primary-500/30',
          'flex items-center justify-center',
          'transition-all duration-200',
          'hover:shadow-xl hover:shadow-primary-500/40',
          'active:scale-95'
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Pulse ring */}
        {!isExpanded && (
          <span className="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-20" />
        )}

        {/* Icon */}
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="fox"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FoxIcon className="relative z-10 drop-shadow-md" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification dot */}
        {!isExpanded && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-success-400 rounded-full border-2 border-dark-900 flex items-center justify-center">
            <MessageSquare className="w-2 h-2 text-dark-900" />
          </span>
        )}
      </motion.button>
    </motion.div>
  )
}
