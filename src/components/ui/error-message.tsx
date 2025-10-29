import { AlertTriangle, RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
  onDismiss?: () => void
  variant?: 'inline' | 'card' | 'banner'
  className?: string
}

export function ErrorMessage({
  title = 'Error',
  message,
  onRetry,
  onDismiss,
  variant = 'inline',
  className = ''
}: ErrorMessageProps) {
  if (variant === 'banner') {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">{title}</h3>
            <p className="text-sm text-red-700 mt-1">{message}</p>
          </div>
          <div className="flex items-center gap-2 ml-3">
            {onRetry && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                className="h-8 px-3 text-red-700 border-red-300 hover:bg-red-100"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
            {onDismiss && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
                className="h-8 w-8 p-0 text-red-700 hover:bg-red-100"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <Card className={`border-red-200 ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-800">{title}</CardTitle>
          </div>
          <CardDescription className="text-red-700">{message}</CardDescription>
        </CardHeader>
        {(onRetry || onDismiss) && (
          <CardContent className="pt-0">
            <div className="flex gap-2">
              {onRetry && (
                <Button size="sm" onClick={onRetry} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
              {onDismiss && (
                <Button size="sm" onClick={onDismiss} variant="ghost">
                  Dismiss
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  // inline variant
  return (
    <div className={`flex items-center gap-2 text-red-600 ${className}`}>
      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      <span className="text-sm">{message}</span>
      {onRetry && (
        <Button size="sm" variant="ghost" onClick={onRetry} className="h-6 px-2 text-red-600">
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}