import React, { useState, useEffect } from 'react'
import { X, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useNotificationStore } from '@/stores/notification-store'

interface SystemNotification {
  id: string
  type: 'info' | 'warning' | 'success' | 'error'
  title: string
  message: string
  dismissible?: boolean
  persistent?: boolean
  actionLabel?: string
  actionUrl?: string
}

const getIcon = (type: SystemNotification['type']) => {
  switch (type) {
    case 'info':
      return <Info className="h-4 w-4" />
    case 'warning':
      return <AlertTriangle className="h-4 w-4" />
    case 'success':
      return <CheckCircle className="h-4 w-4" />
    case 'error':
      return <AlertCircle className="h-4 w-4" />
    default:
      return <Info className="h-4 w-4" />
  }
}

const getVariant = (type: SystemNotification['type']) => {
  switch (type) {
    case 'info':
      return 'info'
    case 'warning':
      return 'warning'
    case 'success':
      return 'success'
    case 'error':
      return 'destructive'
    default:
      return 'default'
  }
}

export const SystemNotificationBanner: React.FC = () => {
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set())
  const { notifications } = useNotificationStore()

  
  const systemNotifications = notifications
    .filter(n => n.type === 'system' || n.type === 'announcement')
    .filter(n => !dismissedNotifications.has(n.id))
    .slice(0, 3) 

  const dismissNotification = (id: string) => {
    setDismissedNotifications(prev => new Set([...prev, id]))
    
    
    const dismissed = Array.from(dismissedNotifications)
    dismissed.push(id)
    localStorage.setItem('dismissed-system-notifications', JSON.stringify(dismissed))
  }

  
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dismissed-system-notifications')
      if (stored) {
        const dismissed = JSON.parse(stored)
        setDismissedNotifications(new Set(dismissed))
      }
    } catch (error) {
      console.error('Failed to load dismissed notifications:', error)
    }
  }, [])

  if (systemNotifications.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {systemNotifications.map((notification) => {
        const systemNotif: SystemNotification = {
          id: notification.id,
          type: notification.type === 'announcement' ? 'info' : 'warning',
          title: notification.title,
          message: notification.message,
          dismissible: true,
          actionLabel: notification.actionData?.label,
          actionUrl: notification.actionData?.url,
        }

        return (
          <Alert
            key={systemNotif.id}
            variant={getVariant(systemNotif.type)}
            className="relative"
          >
            {getIcon(systemNotif.type)}
            
            <div className="flex-1">
              <AlertTitle>{systemNotif.title}</AlertTitle>
              <AlertDescription className="mt-1">
                {systemNotif.message}
              </AlertDescription>
              
              {systemNotif.actionLabel && systemNotif.actionUrl && (
                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 text-sm"
                    onClick={() => {
                      if (systemNotif.actionUrl?.startsWith('http')) {
                        window.open(systemNotif.actionUrl, '_blank')
                      } else {
                        window.location.href = systemNotif.actionUrl || '#'
                      }
                    }}
                  >
                    {systemNotif.actionLabel}
                  </Button>
                </div>
              )}
            </div>
            
            {systemNotif.dismissible && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-black/5"
                onClick={() => dismissNotification(systemNotif.id)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Dismiss</span>
              </Button>
            )}
          </Alert>
        )
      })}
    </div>
  )
}