import { useState, useCallback } from 'react'

interface AsyncOperationState<T = any> {
  data: T | null
  isLoading: boolean
  error: string | null
}

interface UseAsyncOperationOptions {
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
  resetOnStart?: boolean
}

export function useAsyncOperation<T = any>(options: UseAsyncOperationOptions = {}) {
  const { onSuccess, onError, resetOnStart = true } = options
  
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    isLoading: false,
    error: null
  })

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    if (resetOnStart) {
      setState({ data: null, isLoading: true, error: null })
    } else {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
    }

    try {
      const result = await asyncFn()
      setState({ data: result, isLoading: false, error: null })
      onSuccess?.(result)
      return result
    } catch (error: any) {
      const errorMessage = error?.message || error?.detail || 'An unexpected error occurred'
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }))
      onError?.(errorMessage)
      throw error
    }
  }, [onSuccess, onError, resetOnStart])

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null })
  }, [])

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error, isLoading: false }))
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    execute,
    reset,
    setError,
    clearError
  }
}

// Hook for handling form submissions with loading and error states
export function useFormSubmission<T = any>(options: UseAsyncOperationOptions = {}) {
  const asyncOp = useAsyncOperation<T>(options)
  
  const handleSubmit = useCallback((asyncFn: () => Promise<T>) => {
    return async (e?: React.FormEvent) => {
      e?.preventDefault()
      return asyncOp.execute(asyncFn)
    }
  }, [asyncOp.execute])

  return {
    ...asyncOp,
    handleSubmit
  }
}