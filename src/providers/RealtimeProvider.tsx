import React, { createContext, useContext, useEffect } from 'react'
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates'
import { useOfflineQueue } from '@/hooks/useOfflineQueue'
import { useNotificationHandler } from '@/hooks/useNotificationHandler'
import { useAuthStore } from '@/stores/auth-store'

interface RealtimeContextType {
  isPolling: boolean
  lastUpdate: Date | null
  error: Error | null
  isOnline: boolean
  isTabVisible: boolean
  queuedUpdatesCount: number
  offlineQueueLength: number
  isProcessingQueue: boolean
}

const RealtimeContext = createContext<RealtimeContextType | null>(null)

export const useRealtime = () => {
  const context = useContext(RealtimeContext)
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider')
  }
  return context
}

interface RealtimeProviderProps {
  children: React.ReactNode
}

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  
  const {
    isPolling,
    lastUpdate,
    error,
    isOnline,
    isTabVisible,
    queuedUpdatesCount,
  } = useRealtimeUpdates({
    activeInterval: 30000, 
    inactiveInterval: 120000, 
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
  })

  const {
    queueLength: offlineQueueLength,
    isProcessing: isProcessingQueue,
  } = useOfflineQueue()

  
  useNotificationHandler()

  
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('User not authenticated - real-time updates disabled')
    }
  }, [isAuthenticated])

  const contextValue: RealtimeContextType = {
    isPolling,
    lastUpdate,
    error,
    isOnline,
    isTabVisible,
    queuedUpdatesCount,
    offlineQueueLength,
    isProcessingQueue,
  }

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  )
}