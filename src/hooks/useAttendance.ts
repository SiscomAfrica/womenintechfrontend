
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import attendanceService from '../services/attendance'
import { sessionKeys } from './useSessions'





export function useJoinSession() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (sessionId: string) => {
      return await attendanceService.joinSession(sessionId)
    },
    onSuccess: (_, sessionId) => {
      
      queryClient.invalidateQueries({ queryKey: sessionKeys.schedule() })
      queryClient.invalidateQueries({ queryKey: sessionKeys.mySchedule() })
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(sessionId) })
      
      toast.success('Session added to your schedule')
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to join session'
      toast.error('Error', {
        description: message,
      })
    },
  })
}





export function useLeaveSession() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (sessionId: string) => {
      return await attendanceService.leaveSession(sessionId)
    },
    onSuccess: (_, sessionId) => {
      
      queryClient.invalidateQueries({ queryKey: sessionKeys.schedule() })
      queryClient.invalidateQueries({ queryKey: sessionKeys.mySchedule() })
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(sessionId) })
      
      toast.success('Session removed from your schedule')
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to leave session'
      toast.error('Error', {
        description: message,
      })
    },
  })
}





export function useToggleAttendance() {
  const joinSession = useJoinSession()
  const leaveSession = useLeaveSession()
  
  return {
    toggle: async (sessionId: string, isCurrentlyAttending: boolean) => {
      if (isCurrentlyAttending) {
        await leaveSession.mutateAsync(sessionId)
      } else {
        await joinSession.mutateAsync(sessionId)
      }
    },
    isLoading: joinSession.isPending || leaveSession.isPending,
  }
}
