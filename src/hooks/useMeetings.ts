import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { meetingService, type MeetingRequest, type CreateMeetingRequest } from '@/services/meetings'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Hook to fetch all meeting requests with polling
 */
export function useMeetingRequests(status?: string, requestType?: string) {
  const { user } = useAuthStore()
  
  return useQuery({
    queryKey: ['meetings', status, requestType],
    queryFn: () => meetingService.getMeetingRequests(status, requestType),
    staleTime: 25 * 1000, // 25 seconds
    refetchInterval: 30 * 1000, // Poll every 30 seconds
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    enabled: !!user, // Only fetch if user is authenticated
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
        return false
      }
      // Retry up to 3 times for other errors
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  })
}

/**
 * Hook to fetch a specific meeting request
 */
export function useMeetingRequest(meetingId: string) {
  const { user } = useAuthStore()
  
  return useQuery({
    queryKey: ['meetings', meetingId],
    queryFn: () => meetingService.getMeetingRequest(meetingId),
    enabled: !!meetingId && !!user,
  })
}

/**
 * Hook to create a meeting request
 */
export function useCreateMeetingRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateMeetingRequest) => 
      meetingService.createMeetingRequest(data),
    onSuccess: () => {
      // Invalidate meeting queries to refetch
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
      toast.success('Meeting request sent successfully!')
    },
    onError: (error: Error) => {
      console.error('Failed to create meeting request:', error)
      toast.error(error.message || 'Failed to send meeting request')
    },
  })
}

/**
 * Hook to accept a meeting request
 */
export function useAcceptMeetingRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ meetingId, responseMessage }: { 
      meetingId: string
      responseMessage?: string 
    }) => meetingService.acceptMeetingRequest(meetingId, responseMessage),
    onSuccess: () => {
      // Invalidate meeting queries to refetch
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
      toast.success('Meeting request accepted!')
    },
    onError: (error: Error) => {
      console.error('Failed to accept meeting request:', error)
      toast.error(error.message || 'Failed to accept meeting request')
    },
  })
}

/**
 * Hook to decline a meeting request
 */
export function useDeclineMeetingRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ meetingId, responseMessage }: { 
      meetingId: string
      responseMessage?: string 
    }) => meetingService.declineMeetingRequest(meetingId, responseMessage),
    onSuccess: () => {
      // Invalidate meeting queries to refetch
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
      toast.success('Meeting request declined')
    },
    onError: (error: Error) => {
      console.error('Failed to decline meeting request:', error)
      toast.error(error.message || 'Failed to decline meeting request')
    },
  })
}

/**
 * Hook to cancel a meeting request
 */
export function useCancelMeetingRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (meetingId: string) => 
      meetingService.cancelMeetingRequest(meetingId),
    onSuccess: () => {
      // Invalidate meeting queries to refetch
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
      toast.success('Meeting request cancelled')
    },
    onError: (error: Error) => {
      console.error('Failed to cancel meeting request:', error)
      toast.error(error.message || 'Failed to cancel meeting request')
    },
  })
}

/**
 * Hook to get pending meeting requests count with real-time updates
 */
export function usePendingMeetingsCount() {
  const { user } = useAuthStore()
  
  const { data } = useQuery({
    queryKey: ['meetings', 'pending', 'received', 'count'],
    queryFn: () => meetingService.getMeetingRequests('pending', 'received'),
    staleTime: 20 * 1000, // 20 seconds
    refetchInterval: 30 * 1000, // Poll every 30 seconds
    refetchIntervalInBackground: false,
    enabled: !!user,
    retry: (failureCount, error) => {
      if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
        return false
      }
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 20000),
  })
  
  return data?.pending_count || 0
}
