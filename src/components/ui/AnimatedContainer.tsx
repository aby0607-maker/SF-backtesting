import { ReactNode } from 'react'

interface AnimatedContainerProps {
  children: ReactNode
  animation?: 'fade-in' | 'slide-up' | 'slide-down' | 'scale-in'
  delay?: number
  className?: string
}

export function AnimatedContainer({
  children,
  animation = 'fade-in',
  delay = 0,
  className = '',
}: AnimatedContainerProps) {
  const animationClass = {
    'fade-in': 'animate-fade-in',
    'slide-up': 'animate-slide-up',
    'slide-down': 'animate-slide-down',
    'scale-in': 'animate-scale-in',
  }[animation]

  return (
    <div
      className={`${animationClass} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// Staggered list animation helper
interface StaggeredListProps {
  children: ReactNode[]
  animation?: 'fade-in' | 'slide-up' | 'slide-down' | 'scale-in'
  staggerDelay?: number
  className?: string
}

export function StaggeredList({
  children,
  animation = 'slide-up',
  staggerDelay = 50,
  className = '',
}: StaggeredListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <AnimatedContainer
          key={index}
          animation={animation}
          delay={index * staggerDelay}
        >
          {child}
        </AnimatedContainer>
      ))}
    </div>
  )
}
