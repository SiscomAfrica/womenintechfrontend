import { useQuery } from '@tanstack/react-query'
import { notificationService } from '@/services/notifications'
import { useAuthStore } from '@/stores/auth-store'

export const useUserNotifications = (page: number = 1, size: number = 20) => {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['user-notifications', page, size],
    queryFn: () => notificationService.fetchNotifications(page, size),
    enabled: isAuthenticated,
    refetchInterval: 30000, // Poll every 30 seconds
    refetchOnWindowFocus: true,
    staleTime: 20000, // Consider data stale after 20 seconds
  })
}

export const useUnreadNotificationsCount = () => {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['unread-notifications-count'],
    queryFn: () => notificationService.getUnreadCount(),
    enabled: isAuthenticated,
    refetchInterval: 30000, // Poll every 30 seconds
    refetchOnWindowFocus: true,
    staleTime: 20000,
  })
}
