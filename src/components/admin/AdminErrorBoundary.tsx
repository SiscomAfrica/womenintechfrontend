import React from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'

interface AdminErrorFallbackProps {
  error: Error
  retry: () => void
}

function AdminErrorFallback({ error, retry }: AdminErrorFallbackProps) {
  const navigate = useNavigate()

  const isAuthError = error.message.includes('401') || error.message.includes('403') || error.message.includes('Unauthorized')
  const isNetworkError = error.message.includes('fetch') || error.message.includes('Network')

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">
            {isAuthError ? 'Access Denied' : isNetworkError ? 'Connection Error' : 'Something went wrong'}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {isAuthError 
              ? 'You don\'t have permission to access this admin feature.'
              : isNetworkError 
              ? 'Unable to connect to the server. Please check your connection.'
              : 'An unexpected error occurred in the admin panel.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800 font-medium mb-2">Error Details:</p>
              <p className="text-xs text-red-700 font-mono break-all">
                {error.message}
              </p>
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-red-700 cursor-pointer">Stack Trace</summary>
                  <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            {!isAuthError && (
              <Button onClick={retry} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin')}
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Admin Dashboard
            </Button>
            
            {isAuthError && (
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="w-full"
              >
                Return to Main App
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface AdminErrorBoundaryProps {
  children: React.ReactNode
}

export function AdminErrorBoundary({ children }: AdminErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={AdminErrorFallback}>
      {children}
    </ErrorBoundary>
  )
}