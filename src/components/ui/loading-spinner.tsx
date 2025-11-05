import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  message?: string
  variant?: 'spinner' | 'dots' | 'pulse'
}

export function LoadingSpinner({ 
  size = 'md', 
  className = '', 
  message,
  variant = 'spinner'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-[#60166b] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-[#60166b] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-[#60166b] rounded-full animate-bounce"></div>
        </div>
        {message && <span className="text-sm text-gray-600 ml-2">{message}</span>}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className={cn('bg-[#60166b] rounded-full animate-pulse', sizeClasses[size])}></div>
        {message && <span className="text-sm text-gray-600">{message}</span>}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-[#60166b]', sizeClasses[size])} />
      {message && <span className="text-sm text-gray-600">{message}</span>}
    </div>
  )
}

interface LoadingOverlayProps {
  message?: string
  className?: string
}

export function LoadingOverlay({ message = 'Loading...', className = '' }: LoadingOverlayProps) {
  return (
    <div className={cn(
      'absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50',
      className
    )}>
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  )
}

interface LoadingStateProps {
  isLoading: boolean
  children: React.ReactNode
  message?: string
  className?: string
}

export function LoadingState({ isLoading, children, message, className }: LoadingStateProps) {
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <LoadingSpinner message={message} />
      </div>
    )
  }

  return <>{children}</>
}