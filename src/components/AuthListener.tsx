import { useEffect } from 'react'
import { toast } from 'sonner'

/**
 * Global listener for authentication events
 * Displays toast notifications when user session expires
 */
export function AuthListener() {
  useEffect(() => {
    const handleUnauthorized = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string }>
      
      toast.error('Session Expired', {
        description: customEvent.detail.message || 'Please login again to continue.',
        duration: 5000,
      })
    }

    // Listen for unauthorized events
    window.addEventListener('auth:unauthorized', handleUnauthorized)

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [])

  return null // This component doesn't render anything
}
