import { motion, Variants } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StaggerContainerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
  initialDelay?: number
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
  initialDelay = 0.1,
}: StaggerContainerProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: initialDelay,
          },
        },
      }}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Item variants for use with StaggerContainer
export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
}

// Convenience component for stagger items
interface StaggerItemProps {
  children: ReactNode
  className?: string
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  )
}

// Horizontal stagger (for grids)
export const staggerItemHorizontalVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
}

// Scale up stagger (for cards)
export const staggerItemScaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
}

// Preset for list items with hover effect
interface AnimatedListItemProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function AnimatedListItem({
  children,
  className,
  onClick,
}: AnimatedListItemProps) {
  return (
    <motion.div
      variants={staggerItemVariants}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn('cursor-pointer', className)}
    >
      {children}
    </motion.div>
  )
}
