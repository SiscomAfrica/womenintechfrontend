import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Notification {
  id: string
  type: 'poll' | 'connection_request' | 'schedule_change' | 'announcement' | 'system'
  title: string
  message: string
  timestamp: number
  read: boolean
  actionable?: boolean
  actionData?: any
  expiresAt?: number
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isNotificationCenterOpen: boolean
  
  
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearExpiredNotifications: () => void
  toggleNotificationCenter: () => void
  setNotificationCenterOpen: (open: boolean) => void
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, _get) => ({
      notifications: [],
      unreadCount: 0,
      isNotificationCenterOpen: false,

      addNotification: (notificationData) => {
        const notification: Notification = {
          ...notificationData,
          id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          read: false,
        }

        set((state) => {
          const newNotifications = [notification, ...state.notifications]
          const unreadCount = newNotifications.filter(n => !n.read).length
          
          return {
            notifications: newNotifications,
            unreadCount,
          }
        })
      },

      markAsRead: (id) => {
        set((state) => {
          const notifications = state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          )
          const unreadCount = notifications.filter(n => !n.read).length
          
          return {
            notifications,
            unreadCount,
          }
        })
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0,
        }))
      },

      removeNotification: (id) => {
        set((state) => {
          const notifications = state.notifications.filter(n => n.id !== id)
          const unreadCount = notifications.filter(n => !n.read).length
          
          return {
            notifications,
            unreadCount,
          }
        })
      },

      clearExpiredNotifications: () => {
        const now = Date.now()
        set((state) => {
          const notifications = state.notifications.filter(n => 
            !n.expiresAt || n.expiresAt > now
          )
          const unreadCount = notifications.filter(n => !n.read).length
          
          return {
            notifications,
            unreadCount,
          }
        })
      },

      toggleNotificationCenter: () => {
        set((state) => ({
          isNotificationCenterOpen: !state.isNotificationCenterOpen,
        }))
      },

      setNotificationCenterOpen: (open) => {
        set({ isNotificationCenterOpen: open })
      },
    }),
    {
      name: 'notification-store',
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
)