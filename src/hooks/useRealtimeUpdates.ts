import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTabVisibility } from '@/hooks/useTabVisibility'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'

interface UseRealtimeUpdatesOptions {
  activeInterval?: number
  inactiveInterval?: number
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
}

interface RealtimeStatus {
  isPolling: boolean
  lastUpdate: Date | null
  error: Error | null
  isOnline: boolean
  isTabVisible: boolean
  queuedUpdatesCount: number
}

/**
 * Custom hook for real-time data updates using polling
 * Automatically refreshes data at regular intervals with smart polling
 */
export const useRealtimeUpdates = ({
  activeInterval = 30000, // 30 seconds when tab is active
  inactiveInterval = 120000, // 2 minutes when tab is inactive
  maxRetries = 3,
  baseDelay = 1000,
  maxDelay = 30000
}: UseRealtimeUpdatesOptions = {}) => {
  const queryClient = useQueryClient()
  const intervalRef = useRef<number | null>(null)
  const { isTabVisible } = useTabVisibility()
  const { isOnline } = useNetworkStatus()
  const [status, setStatus] = useState<RealtimeStatus>({
    isPolling: false,
    lastUpdate: null,
    error: null,
    isOnline: true,
    isTabVisible: true,
    queuedUpdatesCount: 0
  })
  const [retryCount, setRetryCount] = useState(0)

  const updateData = async () => {
    try {
      // Invalidate common query keys to trigger refetch
      await queryClient.invalidateQueries({ queryKey: ['sessions'] })
      await queryClient.invalidateQueries({ queryKey: ['polls'] })
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })

      setStatus(prev => ({
        ...prev,
        lastUpdate: new Date(),
        error: null,
        queuedUpdatesCount: prev.queuedUpdatesCount + 1
      }))
      setRetryCount(0)
    } catch (error) {
      console.error('Real-time update failed:', error)
      setStatus(prev => ({
        ...prev,
        error: error as Error
      }))
      
      // Exponential backoff retry
      if (retryCount < maxRetries) {
        const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay)
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          updateData()
        }, delay)
      }
    }
  }

  const startPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    const interval = isTabVisible ? activeInterval : inactiveInterval
    intervalRef.current = window.setInterval(updateData, interval)
    setStatus(prev => ({ ...prev, isPolling: true }))
  }

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setStatus(prev => ({ ...prev, isPolling: false }))
  }

  useEffect(() => {
    setStatus(prev => ({ ...prev, isOnline, isTabVisible }))
  }, [isOnline, isTabVisible])

  useEffect(() => {
    if (isOnline && isTabVisible) {
      startPolling()
      // Initial update
      updateData()
    } else {
      stopPolling()
    }

    return () => {
      stopPolling()
    }
  }, [isOnline, isTabVisible, activeInterval, inactiveInterval])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [])

  return status
}

/**
 * Hook specifically for dashboard real-time updates
 */
export const useDashboardRealTime = (enabled = true) => {
  const queryClient = useQueryClient()
  const intervalRef = useRef<number | null>(null)
  const [status, setStatus] = useState({
    isConnected: enabled,
    lastUpdate: null as Date | null,
    updateCount: 0
  })

  const forceUpdate = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-overview'] })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'user-stats'] })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
      setStatus(prev => ({
        isConnected: true,
        lastUpdate: new Date(),
        updateCount: prev.updateCount + 1
      }))
    } catch (error) {
      console.error('Dashboard update failed:', error)
      setStatus(prev => ({ ...prev, isConnected: false }))
    }
  }

  useEffect(() => {
    if (!enabled) {
      setStatus(prev => ({ ...prev, isConnected: false }))
      return
    }

    intervalRef.current = window.setInterval(forceUpdate, 30000)
    forceUpdate() // Initial update

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, queryClient])

  return { status, forceUpdate }
}

/**
 * Hook for poll results real-time updates
 */
export const usePollRealTime = (pollId?: string, enabled = true) => {
  const queryClient = useQueryClient()
  const intervalRef = useRef<number | null>(null)
  const [status, setStatus] = useState({
    isConnected: enabled,
    lastUpdate: null as Date | null,
    updateCount: 0
  })

  const forceUpdate = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'polls'] })
      if (pollId) {
        await queryClient.invalidateQueries({ queryKey: ['admin', 'poll-results', pollId] })
      }
      setStatus(prev => ({
        isConnected: true,
        lastUpdate: new Date(),
        updateCount: prev.updateCount + 1
      }))
    } catch (error) {
      console.error('Poll update failed:', error)
      setStatus(prev => ({ ...prev, isConnected: false }))
    }
  }

  useEffect(() => {
    if (!enabled) {
      setStatus(prev => ({ ...prev, isConnected: false }))
      return
    }

    intervalRef.current = window.setInterval(forceUpdate, 15000)
    forceUpdate() // Initial update

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, pollId, queryClient])

  return { status, forceUpdate }
}

/**
 * Hook for user activity real-time updates
 */
export const useUserActivityRealTime = (enabled = true) => {
  const queryClient = useQueryClient()
  const intervalRef = useRef<number | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    if (!enabled) return

    const updateUsers = async () => {
      try {
        await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
        await queryClient.invalidateQueries({ queryKey: ['admin', 'user-stats'] })
        setLastUpdate(new Date())
      } catch (error) {
        console.error('User activity update failed:', error)
      }
    }

    intervalRef.current = window.setInterval(updateUsers, 60000)
    updateUsers() // Initial update

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, queryClient])

  return { lastUpdate }
}