import { LoadingSpinner, LoadingOverlay } from '@/components/ui/loading-spinner'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface AdminLoadingStateProps {
  isLoading: boolean
  children: React.ReactNode
  message?: string
  variant?: 'overlay' | 'replace' | 'skeleton'
  className?: string
}

export function AdminLoadingState({ 
  isLoading, 
  children, 
  message = 'Loading...', 
  variant = 'replace',
  className = ''
}: AdminLoadingStateProps) {
  if (!isLoading) {
    return <>{children}</>
  }

  if (variant === 'overlay') {
    return (
      <div className={`relative ${className}`}>
        {children}
        <LoadingOverlay message={message} />
      </div>
    )
  }

  if (variant === 'skeleton') {
    return (
      <div className={`space-y-4 ${className}`}>
        <AdminSkeleton />
      </div>
    )
  }

  // replace variant
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <LoadingSpinner size="lg" message={message} />
    </div>
  )
}

// Skeleton components for different admin sections
export function AdminSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Table skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Table header */}
      <div className="flex items-center space-x-4 pb-2 border-b">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 py-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
}

export function AdminCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
        <Skeleton className="h-8 w-20" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-32" />
      </CardContent>
    </Card>
  )
}