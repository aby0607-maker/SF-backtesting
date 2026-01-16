import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FeatureSpotlight, ProductPrinciple } from '@/data/featureSpotlights'
import { principleInfo } from '@/data/featureSpotlights'

interface SpotlightTourProps {
  spotlights: FeatureSpotlight[]
  isActive: boolean
  onEnd: () => void
}

interface ElementRect {
  top: number
  left: number
  width: number
  height: number
  bottom: number
  right: number
}

// Principle badge component
function PrincipleBadge({ principle }: { principle: ProductPrinciple }) {
  const info = principleInfo[principle]
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold', info.bgColor, info.color)}>
      <span className="font-bold">{info.emoji}</span>
      <span>{info.label}</span>
    </span>
  )
}

export function SpotlightTour({ spotlights, isActive, onEnd }: SpotlightTourProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [targetRect, setTargetRect] = useState<ElementRect | null>(null)
  const [panelPosition, setPanelPosition] = useState<'bottom' | 'top' | 'left' | 'right'>('bottom')
  const panelRef = useRef<HTMLDivElement>(null)

  const currentSpotlight = spotlights[currentIndex]

  // Find and measure target element
  const updateTargetRect = useCallback((skipScroll = false) => {
    if (!currentSpotlight?.targetElement) {
      setTargetRect(null)
      return
    }

    // Try to find element by ID first, then by data attribute
    let element = document.getElementById(currentSpotlight.targetElement)
    if (!element) {
      element = document.querySelector(`[data-spotlight="${currentSpotlight.targetElement}"]`)
    }

    if (element) {
      const rect = element.getBoundingClientRect()
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft
      const viewportHeight = window.innerHeight

      // Check if element needs scrolling into view
      const elementTop = rect.top
      const elementBottom = rect.bottom
      const needsScroll = !skipScroll && (elementTop < 100 || elementBottom > viewportHeight - 280)

      if (needsScroll) {
        // Scroll element into view, then recalculate after scroll completes
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Recalculate position after scroll animation (300ms)
        setTimeout(() => updateTargetRect(true), 350)
        return
      }

      // Update rect with current scroll position
      setTargetRect({
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft,
        width: rect.width,
        height: rect.height,
        bottom: rect.bottom + scrollTop,
        right: rect.right + scrollLeft,
      })

      // Determine best panel position based on available space
      const spaceBelow = viewportHeight - rect.bottom
      const spaceAbove = rect.top
      const spaceRight = window.innerWidth - rect.right
      const spaceLeft = rect.left

      // For elements near bottom, prefer top or side positioning
      if (spaceBelow >= 300) {
        setPanelPosition('bottom')
      } else if (spaceAbove >= 300) {
        setPanelPosition('top')
      } else if (spaceRight >= 340) {
        setPanelPosition('right')
      } else if (spaceLeft >= 340) {
        setPanelPosition('left')
      } else {
        // Fallback: position above if more space there, otherwise below
        setPanelPosition(spaceAbove > spaceBelow ? 'top' : 'bottom')
      }
    } else {
      setTargetRect(null)
    }
  }, [currentSpotlight])

  // Update rect on mount and when spotlight changes
  useEffect(() => {
    if (isActive) {
      // Small delay to allow DOM to settle
      const timer = setTimeout(() => updateTargetRect(false), 100)
      return () => clearTimeout(timer)
    }
  }, [isActive, currentIndex, updateTargetRect])

  // Update on scroll/resize (skip auto-scroll to prevent loops)
  useEffect(() => {
    if (!isActive) return

    const handleUpdate = () => updateTargetRect(true)
    window.addEventListener('scroll', handleUpdate, true)
    window.addEventListener('resize', handleUpdate)

    return () => {
      window.removeEventListener('scroll', handleUpdate, true)
      window.removeEventListener('resize', handleUpdate)
    }
  }, [isActive, updateTargetRect])

  // Reset index when tour starts
  useEffect(() => {
    if (isActive) {
      setCurrentIndex(0)
    }
  }, [isActive])

  const handleNext = () => {
    if (currentIndex < spotlights.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      onEnd()
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isActive) return
    if (e.key === 'Escape') onEnd()
    if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext()
    if (e.key === 'ArrowLeft') handlePrev()
  }, [isActive, currentIndex, spotlights.length])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!isActive || !currentSpotlight) return null

  // Calculate panel position
  const getPanelStyle = (): React.CSSProperties => {
    if (!targetRect) {
      // Center in viewport if no target
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    }

    const padding = 16
    const panelWidth = 320
    const scrollTop = window.scrollY || document.documentElement.scrollTop

    switch (panelPosition) {
      case 'bottom':
        return {
          position: 'absolute',
          top: targetRect.bottom + padding,
          left: Math.max(padding, Math.min(targetRect.left, window.innerWidth - panelWidth - padding)),
        }
      case 'top':
        return {
          position: 'absolute',
          bottom: window.innerHeight - targetRect.top + padding + scrollTop,
          left: Math.max(padding, Math.min(targetRect.left, window.innerWidth - panelWidth - padding)),
        }
      case 'right':
        return {
          position: 'absolute',
          top: targetRect.top,
          left: targetRect.right + padding,
        }
      case 'left':
        return {
          position: 'absolute',
          top: targetRect.top,
          right: window.innerWidth - targetRect.left + padding,
        }
    }
  }

  const overlayContent = (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Overlay with spotlight cutout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] pointer-events-none"
            style={{
              background: targetRect
                ? `radial-gradient(ellipse ${targetRect.width + 40}px ${targetRect.height + 40}px at ${targetRect.left + targetRect.width / 2 - window.scrollX}px ${targetRect.top + targetRect.height / 2 - window.scrollY}px, transparent 0%, rgba(0,0,0,0.85) 100%)`
                : 'rgba(0,0,0,0.85)',
            }}
          />

          {/* Highlight ring around target */}
          {targetRect && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed z-[9999] pointer-events-none rounded-xl"
              style={{
                top: targetRect.top - window.scrollY - 8,
                left: targetRect.left - window.scrollX - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
                boxShadow: '0 0 0 4px rgba(139, 92, 246, 0.5), 0 0 30px rgba(139, 92, 246, 0.3)',
                border: '2px solid rgba(139, 92, 246, 0.8)',
              }}
            />
          )}

          {/* Clickable overlay to close */}
          <div
            className="fixed inset-0 z-[9999]"
            onClick={onEnd}
          />

          {/* Spotlight Panel */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="z-[10000] w-[320px] max-w-[calc(100vw-2rem)]"
            style={getPanelStyle()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-dark-800 rounded-2xl border border-primary-500/40 shadow-2xl shadow-primary-500/20 overflow-hidden">
              {/* Header */}
              <div className="p-3 bg-gradient-to-r from-primary-500/20 to-purple-500/20 border-b border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-primary-400" />
                    <span className="text-[10px] text-primary-400 font-semibold uppercase tracking-wider">
                      Feature {currentIndex + 1} of {spotlights.length}
                    </span>
                  </div>
                  <button
                    onClick={onEnd}
                    className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Feature Name */}
                <h4 className="font-semibold text-white text-sm leading-tight mb-2">
                  {currentSpotlight.featureName}
                </h4>

                {/* Principle Badge */}
                <PrincipleBadge principle={currentSpotlight.principle} />
              </div>

              {/* Content */}
              <div className="p-3 space-y-2.5 max-h-[280px] overflow-y-auto">
                {/* JTBD */}
                <div className="p-2.5 rounded-lg bg-info-500/10 border border-info-500/20">
                  <span className="text-[9px] font-semibold text-info-400 uppercase tracking-wider block mb-1">Job To Be Done</span>
                  <p className="text-xs text-neutral-200 leading-relaxed">{currentSpotlight.jtbd}</p>
                </div>

                {/* User Outcome */}
                <div className="p-2.5 rounded-lg bg-success-500/10 border border-success-500/20">
                  <span className="text-[9px] font-semibold text-success-400 uppercase tracking-wider block mb-1">You Get</span>
                  <p className="text-xs text-success-300 font-medium leading-relaxed">{currentSpotlight.userOutcome}</p>
                </div>

                {/* Competitive Advantage */}
                <div className="p-2.5 rounded-lg bg-warning-500/10 border border-warning-500/20">
                  <span className="text-[9px] font-semibold text-warning-400 uppercase tracking-wider block mb-1">vs Competition</span>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">{currentSpotlight.competitiveAdvantage}</p>
                </div>
              </div>

              {/* Navigation Footer */}
              <div className="p-3 bg-dark-700/50 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className={cn(
                    'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    currentIndex === 0
                      ? 'text-neutral-600 cursor-not-allowed'
                      : 'text-neutral-400 hover:text-white hover:bg-white/10'
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </button>

                {/* Progress dots */}
                <div className="flex items-center gap-1">
                  {spotlights.slice(0, Math.min(7, spotlights.length)).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={cn(
                        'w-2 h-2 rounded-full transition-colors',
                        idx === currentIndex ? 'bg-primary-400' : 'bg-dark-600 hover:bg-dark-500'
                      )}
                    />
                  ))}
                  {spotlights.length > 7 && (
                    <span className="text-[10px] text-neutral-500 ml-1">+{spotlights.length - 7}</span>
                  )}
                </div>

                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-500 hover:bg-primary-400 text-white transition-colors"
                >
                  {currentIndex === spotlights.length - 1 ? 'Finish' : 'Next'}
                  {currentIndex < spotlights.length - 1 && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Arrow pointer to target */}
            {targetRect && (
              <div
                className={cn(
                  'absolute w-3 h-3 bg-dark-800 border-primary-500/40 transform rotate-45',
                  panelPosition === 'bottom' && '-top-1.5 left-8 border-l border-t',
                  panelPosition === 'top' && '-bottom-1.5 left-8 border-r border-b',
                  panelPosition === 'right' && 'top-8 -left-1.5 border-l border-b',
                  panelPosition === 'left' && 'top-8 -right-1.5 border-r border-t',
                )}
              />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  // Render via portal to document.body for proper z-index stacking
  return createPortal(overlayContent, document.body)
}
