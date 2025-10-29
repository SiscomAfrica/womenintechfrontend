import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import pollService from '@/services/polls'



export const pollKeys = {
  all: ['polls'] as const,
  lists: () => [...pollKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...pollKeys.lists(), filters] as const,
  details: () => [...pollKeys.all, 'detail'] as const,
  detail: (id: string) => [...pollKeys.details(), id] as const,
  active: () => [...pollKeys.all, 'active'] as const,
  results: (id: string) => [...pollKeys.all, 'results', id] as const,
  myResponse: (id: string) => [...pollKeys.all, 'my-response', id] as const,
}


export function useActivePolls(sessionId?: string) {
  return useQuery({
    queryKey: pollKeys.active(),
    queryFn: async () => {
      const response = await pollService.getActivePolls(sessionId)
      if (!response.success) {
        throw new Error(response.message || 'Failed to load active polls')
      }
      return response.data!
    },
    refetchInterval: 30 * 1000, 
    refetchIntervalInBackground: false,
    staleTime: 25 * 1000,
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


export function usePolls(
  sessionId?: string,
  isActive?: boolean,
  skip: number = 0,
  limit: number = 100
) {
  const filters = { sessionId, isActive, skip, limit }
  
  return useQuery({
    queryKey: pollKeys.list(filters),
    queryFn: async () => {
      const response = await pollService.getPolls(sessionId, isActive, skip, limit)
      if (!response.success) {
        throw new Error(response.message || 'Failed to load polls')
      }
      return response.data!
    },
    refetchInterval: 30 * 1000, // Poll every 30 seconds
    refetchIntervalInBackground: false, // Don't poll when tab is hidden
    staleTime: 25 * 1000, // 25 seconds - consistent with other poll queries
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


export function usePoll(pollId: string) {
  return useQuery({
    queryKey: pollKeys.detail(pollId),
    queryFn: async () => {
      const response = await pollService.getPoll(pollId)
      if (!response.success) {
        throw new Error(response.message || 'Failed to load poll')
      }
      return response.data!
    },
    enabled: !!pollId,
    refetchInterval: 30 * 1000, 
    staleTime: 25 * 1000,
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
        return false
      }
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}


export function usePollResults(pollId: string) {
  return useQuery({
    queryKey: pollKeys.results(pollId),
    queryFn: async () => {
      const response = await pollService.getPollResults(pollId)
      if (!response.success) {
        throw new Error(response.message)
      }
      return response.data!
    },
    enabled: !!pollId,
    refetchInterval: 30 * 1000, 
    staleTime: 25 * 1000,
  })
}


export function useMyPollResponse(pollId: string) {
  return useQuery({
    queryKey: pollKeys.myResponse(pollId),
    queryFn: async () => {
      const response = await pollService.getMyPollResponse(pollId)
      if (!response.success) {
        // Handle 404 - user hasn't responded to this poll yet
        if (response.message?.includes('No response found') || 
            response.message?.includes('404')) {
          return null
        }
        throw new Error(response.message)
      }
      return response.data!
    },
    enabled: !!pollId,
    retry: (failureCount, error) => {
      // Don't retry on 404 - user simply hasn't responded yet
      if (error.message?.includes('No response found') || 
          error.message?.includes('404')) {
        return false
      }
      // Don't retry on auth errors
      if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
        return false
      }
      return failureCount < 3
    },
  })
}


export function usePollVote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      pollId, 
      responses 
    }: { 
      pollId: string
      responses: { [key: string]: string | number | string[] }
    }) => {
      const response = await pollService.submitPollResponse(pollId, responses)
      if (!response.success) {
        throw new Error(response.message)
      }
      return response.data!
    },
    onMutate: async ({ pollId, responses }) => {
      
      await queryClient.cancelQueries({ queryKey: pollKeys.myResponse(pollId) })
      await queryClient.cancelQueries({ queryKey: pollKeys.results(pollId) })
      
      
      const previousResponse = queryClient.getQueryData(pollKeys.myResponse(pollId))
      const previousResults = queryClient.getQueryData(pollKeys.results(pollId))
      
      
      queryClient.setQueryData(pollKeys.myResponse(pollId), {
        id: 'temp-id',
        poll_id: pollId,
        user_id: 'current-user',
        responses,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      
      return { previousResponse, previousResults, pollId }
    },
    onError: (_err, _variables, context) => {
      
      if (context) {
        queryClient.setQueryData(
          pollKeys.myResponse(context.pollId), 
          context.previousResponse
        )
        queryClient.setQueryData(
          pollKeys.results(context.pollId), 
          context.previousResults
        )
      }
      toast.error('Failed to submit vote. Please try again.')
    },
    onSuccess: (_data, variables) => {
      
      queryClient.invalidateQueries({ queryKey: pollKeys.results(variables.pollId) })
      queryClient.invalidateQueries({ queryKey: pollKeys.active() })
      toast.success('Vote submitted successfully!')
    },
  })
}


export function usePollResponseUpdate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      pollId, 
      responses 
    }: { 
      pollId: string
      responses: { [key: string]: string | number | string[] }
    }) => {
      const response = await pollService.updateResponse(pollId, responses)
      if (!response.success) {
        throw new Error(response.message)
      }
      return response.data!
    },
    onSuccess: (data, variables) => {
      
      queryClient.setQueryData(pollKeys.myResponse(variables.pollId), data)
      
      queryClient.invalidateQueries({ queryKey: pollKeys.results(variables.pollId) })
      toast.success('Response updated successfully!')
    },
    onError: () => {
      toast.error('Failed to update response. Please try again.')
    },
  })
}