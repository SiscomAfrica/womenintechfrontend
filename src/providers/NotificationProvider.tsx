import React, { createContext, useContext, useEffect } from 'react'
import { useBrowserNotifications } from '@/hooks/useBrowserNotifications'
import { useNotificationStore } from '@/stores/notification-store'
import { notificationService } from '@/services/notifications'
import { useAuthStore } from '@/stores/auth-store'

interface NotificationContextType {
  requestPermission: () => Promise<boolean>
  permission: 'default' | 'granted' | 'denied'
  isSupported: boolean
  unreadCount: number
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  const { unreadCount, clearExpiredNotifications } = useNotificationStore()
  
  const browserNotifications = useBrowserNotifications()
  const { permission, isSupported, requestPermission } = browserNotifications

  
  useEffect(() => {
    notificationService.setBrowserNotifications(browserNotifications)
  }, [browserNotifications])

  
  useEffect(() => {
    if (isAuthenticated && permission === 'default') {
      
      const timer = setTimeout(() => {
        if (window.confirm('Enable notifications to stay updated on polls, connections, and schedule changes?')) {
          requestPermission()
        }
      }, 3000) 

      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, permission, requestPermission])

  
  useEffect(() => {
    const interval = setInterval(() => {
      clearExpiredNotifications()
    }, 5 * 60 * 1000) 

    return () => clearInterval(interval)
  }, [clearExpiredNotifications])

  
  

  const wrappedRequestPermission = async (): Promise<boolean> => {
    const result = await requestPermission()
    return result === 'granted'
  }

  const contextValue: NotificationContextType = {
    requestPermission: wrappedRequestPermission,
    permission,
    isSupported,
    unreadCount,
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  )
}