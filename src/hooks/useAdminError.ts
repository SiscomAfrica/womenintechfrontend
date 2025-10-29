import { useCallback } from 'react'
import { useToast } from '@/components/ui/toast'
import { useNavigate } from 'react-router-dom'

interface AdminErrorOptions {
  showToast?: boolean
  redirectOnAuth?: boolean
  customMessage?: string
}

export function useAdminError() {
  const toast = useToast()
  const navigate = useNavigate()

  const handleError = useCallback((error: any, options: AdminErrorOptions = {}) => {
    const {
      showToast = true,
      redirectOnAuth = true,
      customMessage
    } = options

    console.error('Admin operation error:', error)

    // Extract error message
    let errorMessage = customMessage || 'An unexpected error occurred'
    
    if (error?.response?.data?.detail) {
      errorMessage = error.response.data.detail
    } else if (error?.message) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    }

    // Handle different error types
    const status = error?.response?.status || error?.status

    if (status === 401 || status === 403) {
      if (showToast) {
        toast.error('Access denied. You may need to log in again.', 'Authentication Error')
      }
      if (redirectOnAuth) {
        navigate('/login', { state: { from: location.pathname } })
      }
      return
    }

    if (status === 404) {
      if (showToast) {
        toast.error('The requested resource was not found.', 'Not Found')
      }
      return
    }

    if (status === 429) {
      if (showToast) {
        toast.error('Too many requests. Please wait a moment and try again.', 'Rate Limited')
      }
      return
    }

    if (status >= 500) {
      if (showToast) {
        toast.error('Server error. Please try again later.', 'Server Error')
      }
      return
    }

    // Network errors
    if (error?.code === 'NETWORK_ERROR' || errorMessage.includes('fetch')) {
      if (showToast) {
        toast.error('Network error. Please check your connection.', 'Connection Error')
      }
      return
    }

    // Generic error
    if (showToast) {
      toast.error(errorMessage, 'Error')
    }
  }, [toast, navigate])

  const handleAsyncError = useCallback(async (
    asyncFn: () => Promise<any>,
    options: AdminErrorOptions = {}
  ) => {
    try {
      return await asyncFn()
    } catch (error) {
      handleError(error, options)
      throw error
    }
  }, [handleError])

  return {
    handleError,
    handleAsyncError
  }
}

// Specific error handlers for common admin operations
export function useAdminOperationError() {
  const { handleError } = useAdminError()

  const handleUserError = useCallback((error: any) => {
    handleError(error, {
      customMessage: 'Failed to perform user operation'
    })
  }, [handleError])

  const handleNotificationError = useCallback((error: any) => {
    handleError(error, {
      customMessage: 'Failed to send notification'
    })
  }, [handleError])

  const handlePollError = useCallback((error: any) => {
    handleError(error, {
      customMessage: 'Failed to manage poll'
    })
  }, [handleError])

  const handleAnalyticsError = useCallback((error: any) => {
    handleError(error, {
      customMessage: 'Failed to load analytics data'
    })
  }, [handleError])

  return {
    handleUserError,
    handleNotificationError,
    handlePollError,
    handleAnalyticsError,
    handleError
  }
}