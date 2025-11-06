import { toast } from 'sonner'
import { useNotificationStore } from '@/stores/notification-store'
import { useBrowserNotifications } from '@/hooks/useBrowserNotifications'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export interface BackendNotification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'warning' | 'urgent'
  isRead: boolean
  createdAt: string
  data?: any
}

export interface NotificationData {
  type: 'poll' | 'connection_request' | 'schedule_change' | 'announcement' | 'system'
  title: string
  message: string
  actionable?: boolean
  actionData?: any
  expiresAt?: number
  showBrowserNotification?: boolean
  showToast?: boolean
}

class NotificationService {
  private static instance: NotificationService
  private browserNotifications: ReturnType<typeof useBrowserNotifications> | null = null

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  setBrowserNotifications(browserNotifications: ReturnType<typeof useBrowserNotifications>) {
    this.browserNotifications = browserNotifications
  }

  async show(data: NotificationData) {
    const { addNotification } = useNotificationStore.getState()

    
    addNotification({
      type: data.type,
      title: data.title,
      message: data.message,
      actionable: data.actionable,
      actionData: data.actionData,
      expiresAt: data.expiresAt,
    })

    
    if (data.showToast !== false) {
      this.showToast(data)
    }

    
    if (data.showBrowserNotification !== false && this.browserNotifications) {
      await this.showBrowserNotification(data)
    }
  }

  private showToast(data: NotificationData) {
    const toastOptions = {
      description: data.message,
      duration: data.type === 'system' ? 10000 : 5000,
    }

    switch (data.type) {
      case 'poll':
        toast.info(data.title, {
          ...toastOptions,
          action: data.actionable ? {
            label: 'View Poll',
            onClick: () => {
              
              if (data.actionData?.pollId) {
                window.location.href = `/polls?poll=${data.actionData.pollId}`
              }
            },
          } : undefined,
        })
        break

      case 'connection_request':
        toast.info(data.title, {
          ...toastOptions,
          action: data.actionable ? {
            label: 'View Request',
            onClick: () => {
              
              if (data.actionData?.userId) {
                window.location.href = `/networking?user=${data.actionData.userId}`
              }
            },
          } : undefined,
        })
        break

      case 'schedule_change':
        toast.warning(data.title, toastOptions)
        break

      case 'announcement':
        toast.success(data.title, {
          ...toastOptions,
          duration: 8000,
        })
        break

      case 'system':
        toast.error(data.title, {
          ...toastOptions,
          duration: 10000,
        })
        break

      default:
        toast(data.title, toastOptions)
    }
  }

  private async showBrowserNotification(data: NotificationData) {
    if (!this.browserNotifications) return

    const { permission } = this.browserNotifications

    if (permission !== 'granted') {
      return
    }

    
    if (!document.hidden) {
      return
    }

    switch (data.type) {
      case 'poll':
        await this.browserNotifications.showPollNotification(
          data.title,
          data.actionData?.sessionTitle
        )
        break

      case 'connection_request':
        await this.browserNotifications.showConnectionRequestNotification(
          data.actionData?.userName || 'Someone'
        )
        break

      case 'schedule_change':
        await this.browserNotifications.showScheduleChangeNotification(data.message)
        break

      default:
        await this.browserNotifications.showNotification({
          title: data.title,
          body: data.message,
          tag: data.type,
          requireInteraction: data.actionable,
        })
    }
  }

  
  async showPollNotification(pollTitle: string, sessionTitle?: string, pollId?: string) {
    await this.show({
      type: 'poll',
      title: 'New Poll Available',
      message: sessionTitle ? `"${pollTitle}" in ${sessionTitle}` : pollTitle,
      actionable: true,
      actionData: { pollId, sessionTitle },
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), 
    })
  }

  async showConnectionRequest(userName: string, userId: string) {
    await this.show({
      type: 'connection_request',
      title: 'New Connection Request',
      message: `${userName} wants to connect with you`,
      actionable: true,
      actionData: { userId, userName },
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), 
    })
  }

  async showScheduleChange(message: string) {
    await this.show({
      type: 'schedule_change',
      title: 'Schedule Update',
      message,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), 
    })
  }

  async showAnnouncement(title: string, message: string) {
    await this.show({
      type: 'announcement',
      title,
      message,
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), 
    })
  }

  async showSystemNotification(title: string, message: string) {
    await this.show({
      type: 'system',
      title,
      message,
      showBrowserNotification: true, 
    })
  }

  
  async requestPermission(): Promise<boolean> {
    if (!this.browserNotifications) return false

    const permission = await this.browserNotifications.requestPermission()
    return permission === 'granted'
  }

  
  clearExpired() {
    const { clearExpiredNotifications } = useNotificationStore.getState()
    clearExpiredNotifications()
  }

  // Fetch notifications from backend
  async fetchNotifications(page: number = 1, size: number = 20): Promise<{
    items: BackendNotification[]
    total: number
    page: number
    size: number
    pages: number
  }> {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/notifications?page=${page}&size=${size}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch notifications')
    }

    return response.json()
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to mark notification as read')
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read')
    }
  }

  // Get unread count
  async getUnreadCount(): Promise<number> {
    const token = localStorage.getItem('token')
    if (!token) {
      return 0
    }

    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return 0
    }

    const data = await response.json()
    return data.count || 0
  }
}

export const notificationService = NotificationService.getInstance()