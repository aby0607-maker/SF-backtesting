interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
}

export function Skeleton({ className = '', variant = 'text' }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-neutral-200'

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  )
}

// Pre-built skeleton components for common use cases
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-card p-4 shadow-card space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="w-10 h-10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-24" />
          <Skeleton className="w-16" />
        </div>
      </div>
      <Skeleton className="w-full h-20" variant="rectangular" />
      <div className="flex gap-2">
        <Skeleton className="w-16 h-6" variant="rectangular" />
        <Skeleton className="w-16 h-6" variant="rectangular" />
      </div>
    </div>
  )
}

export function SkeletonStockRow() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-neutral-100">
      <Skeleton variant="circular" className="w-10 h-10" />
      <div className="flex-1 space-y-2">
        <Skeleton className="w-20" />
        <Skeleton className="w-32" />
      </div>
      <div className="text-right space-y-2">
        <Skeleton className="w-16 ml-auto" />
        <Skeleton className="w-12 ml-auto" />
      </div>
    </div>
  )
}

export function SkeletonScoreRing() {
  return (
    <div className="flex flex-col items-center gap-2">
      <Skeleton variant="circular" className="w-32 h-32" />
      <Skeleton className="w-24" />
    </div>
  )
}
