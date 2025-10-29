import { useState, useEffect, useCallback } from 'react'

export type NotificationPermission = 'default' | 'granted' | 'denied'

interface BrowserNotificationOptions {
  title: string
  body?: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  
}

export const useBrowserNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    
    setIsSupported('Notification' in window)
    
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      console.warn('Browser notifications are not supported')
      return 'denied'
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return 'denied'
    }
  }, [isSupported])

  const showNotification = useCallback(async (options: BrowserNotificationOptions) => {
    if (!isSupported) {
      console.warn('Browser notifications are not supported')
      return null
    }

    if (permission !== 'granted') {
      console.warn('Notification permission not granted')
      return null
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge,
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
      })

      
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close()
        }, 5000)
      }

      return notification
    } catch (error) {
      console.error('Failed to show notification:', error)
      return null
    }
  }, [isSupported, permission])

  const showPollNotification = useCallback((pollTitle: string, sessionTitle?: string) => {
    return showNotification({
      title: 'New Poll Available',
      body: sessionTitle 
        ? `"${pollTitle}" in ${sessionTitle}`
        : pollTitle,
      icon: '/favicon.ico',
      tag: 'poll-notification',
      requireInteraction: false,
    })
  }, [showNotification])

  const showConnectionRequestNotification = useCallback((userName: string) => {
    return showNotification({
      title: 'New Connection Request',
      body: `${userName} wants to connect with you`,
      icon: '/favicon.ico',
      tag: 'connection-request',
      requireInteraction: true,
      
      
      
      
      
      
      
      
      
      
    })
  }, [showNotification])

  const showScheduleChangeNotification = useCallback((message: string) => {
    return showNotification({
      title: 'Schedule Update',
      body: message,
      icon: '/favicon.ico',
      tag: 'schedule-change',
      requireInteraction: false,
    })
  }, [showNotification])

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    showPollNotification,
    showConnectionRequestNotification,
    showScheduleChangeNotification,
  }
}