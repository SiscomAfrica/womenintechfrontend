import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { notificationService } from '@/services/notifications'
import { useAuthStore } from '@/stores/auth-store'



export const useNotificationHandler = () => {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) return

    
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'updated' && event.query.state.data) {
        handleQueryUpdate(event.query.queryKey, event.query.state.data)
      }
    })

    return unsubscribe
  }, [queryClient, isAuthenticated])

  const handleQueryUpdate = async (queryKey: unknown[], data: any) => {
    const key = queryKey[0] as string

    switch (key) {
      case 'polls':
        
        if (Array.isArray(data)) {
          const activePolls = data.filter((poll: any) => poll.status === 'active')
          const newPolls = activePolls.filter((poll: any) => {
            
            const pollAge = Date.now() - new Date(poll.created_at).getTime()
            return pollAge < 60000 
          })

          for (const poll of newPolls) {
            await notificationService.showPollNotification(
              poll.title,
              poll.session?.title,
              poll.id
            )
          }
        }
        break

      case 'connection-requests':
        
        if (Array.isArray(data)) {
          const newRequests = data.filter((request: any) => {
            const requestAge = Date.now() - new Date(request.created_at).getTime()
            return requestAge < 60000 
          })

          for (const request of newRequests) {
            await notificationService.showConnectionRequest(
              request.requester.name,
              request.requester.id
            )
          }
        }
        break

      case 'schedule':
      case 'sessions':
        
        if (Array.isArray(data)) {
          const recentlyUpdated = data.filter((session: any) => {
            if (!session.updated_at) return false
            const updateAge = Date.now() - new Date(session.updated_at).getTime()
            return updateAge < 300000 
          })

          if (recentlyUpdated.length > 0) {
            await notificationService.showScheduleChange(
              `${recentlyUpdated.length} session${recentlyUpdated.length !== 1 ? 's' : ''} updated`
            )
          }
        }
        break

      case 'notifications':
        
        if (Array.isArray(data)) {
          const unreadNotifications = data.filter((notification: any) => !notification.read)
          const newNotifications = unreadNotifications.filter((notification: any) => {
            const notificationAge = Date.now() - new Date(notification.created_at).getTime()
            return notificationAge < 60000 
          })

          for (const notification of newNotifications) {
            await notificationService.show({
              type: notification.type || 'system',
              title: notification.title,
              message: notification.message,
              actionable: notification.actionable,
              actionData: notification.action_data,
              showToast: true,
              showBrowserNotification: true,
            })
          }
        }
        break
    }
  }

  
  const triggerPollNotification = async (pollTitle: string, sessionTitle?: string, pollId?: string) => {
    await notificationService.showPollNotification(pollTitle, sessionTitle, pollId)
  }

  const triggerConnectionRequest = async (userName: string, userId: string) => {
    await notificationService.showConnectionRequest(userName, userId)
  }

  const triggerScheduleChange = async (message: string) => {
    await notificationService.showScheduleChange(message)
  }

  const triggerAnnouncement = async (title: string, message: string) => {
    await notificationService.showAnnouncement(title, message)
  }

  return {
    triggerPollNotification,
    triggerConnectionRequest,
    triggerScheduleChange,
    triggerAnnouncement,
  }
}