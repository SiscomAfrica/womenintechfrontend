import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />
      }

      return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-bg-tertiary">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-heading-lg text-text-primary">Something went wrong</CardTitle>
              <CardDescription className="text-body-md text-text-tertiary">
                An unexpected error occurred. Please try refreshing the page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-app-md p-3">
                  <p className="text-sm text-red-800 font-medium mb-2">Error Details:</p>
                  <p className="text-xs text-red-700 font-mono break-all">
                    {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <details className="mt-2">
                      <summary className="text-xs text-red-700 cursor-pointer">Stack Trace</summary>
                      <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={this.handleRetry}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Refresh Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}


export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}