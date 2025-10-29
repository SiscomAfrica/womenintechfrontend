import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRefreshToken } from './useAuth'
import authService from '@/services/auth'


export function useTokenRefresh() {
  const queryClient = useQueryClient()
  const refreshTokenMutation = useRefreshToken()

  useEffect(() => {
    let refreshInterval: number

    const setupTokenRefresh = () => {
      
      if (!authService.isAuthenticated()) {
        return
      }

      
      refreshInterval = setInterval(async () => {
        try {
          console.log('[TokenRefresh] Attempting automatic token refresh...')
          await refreshTokenMutation.mutateAsync()
          console.log('[TokenRefresh] Token refreshed successfully')
        } catch (error) {
          console.error('[TokenRefresh] Failed to refresh token:', error)
          
          queryClient.clear()
        }
      }, 50 * 60 * 1000) 
    }

    
    setupTokenRefresh()

    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        if (e.newValue) {
          
          clearInterval(refreshInterval)
          setupTokenRefresh()
        } else {
          
          clearInterval(refreshInterval)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      clearInterval(refreshInterval)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [refreshTokenMutation, queryClient])

  return {
    isRefreshing: refreshTokenMutation.isPending,
    refreshError: refreshTokenMutation.error,
  }
}