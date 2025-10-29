import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import feedbackService from '@/services/feedback'



export const feedbackKeys = {
  all: ['feedback'] as const,
  schemas: () => [...feedbackKeys.all, 'schema'] as const,
  schema: (sessionId: string) => [...feedbackKeys.schemas(), sessionId] as const,
  userFeedback: () => [...feedbackKeys.all, 'user'] as const,
  userFeedbackForSession: (sessionId: string) => [...feedbackKeys.userFeedback(), sessionId] as const,
  summaries: () => [...feedbackKeys.all, 'summary'] as const,
  summary: (sessionId: string) => [...feedbackKeys.summaries(), sessionId] as const,
  history: () => [...feedbackKeys.all, 'history'] as const,
}


export function useFeedbackSchema(sessionId: string) {
  return useQuery({
    queryKey: feedbackKeys.schema(sessionId),
    queryFn: async () => {
      const response = await feedbackService.getFeedbackSchema(sessionId)
      if (!response.success) {
        throw new Error(response.message)
      }
      return response.data!
    },
    enabled: !!sessionId,
    staleTime: 10 * 60 * 1000, 
  })
}


export function useUserFeedback(sessionId: string) {
  return useQuery({
    queryKey: feedbackKeys.userFeedbackForSession(sessionId),
    queryFn: async () => {
      const response = await feedbackService.getUserFeedback(sessionId)
      if (!response.success) {
        
        if (response.message?.includes('No feedback found')) {
          return null
        }
        throw new Error(response.message)
      }
      return response.data!
    },
    enabled: !!sessionId,
    retry: (failureCount, error) => {
      
      if (error.message?.includes('No feedback found')) {
        return false
      }
      return failureCount < 3
    },
  })
}


export function useSessionFeedbackSummary(sessionId: string) {
  return useQuery({
    queryKey: feedbackKeys.summary(sessionId),
    queryFn: async () => {
      const response = await feedbackService.getSessionFeedbackSummary(sessionId)
      if (!response.success) {
        throw new Error(response.message)
      }
      return response.data!
    },
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000, 
  })
}


export function useFeedbackHistory(skip: number = 0, limit: number = 100) {
  return useQuery({
    queryKey: [...feedbackKeys.history(), { skip, limit }],
    queryFn: async () => {
      const response = await feedbackService.getUserFeedbackHistory(skip, limit)
      if (!response.success) {
        throw new Error(response.message)
      }
      return response.data!
    },
    staleTime: 2 * 60 * 1000, 
  })
}


export function useFeedbackSubmit() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      sessionId, 
      responses 
    }: { 
      sessionId: string
      responses: { [key: string]: any }
    }) => {
      const response = await feedbackService.submitFeedback(sessionId, responses)
      if (!response.success) {
        throw new Error(response.message)
      }
      return response.data!
    },
    onMutate: async ({ sessionId, responses }) => {
      
      await queryClient.cancelQueries({ queryKey: feedbackKeys.userFeedbackForSession(sessionId) })
      
      
      const previousFeedback = queryClient.getQueryData(feedbackKeys.userFeedbackForSession(sessionId))
      
      
      queryClient.setQueryData(feedbackKeys.userFeedbackForSession(sessionId), {
        id: 'temp-id',
        user_id: 'current-user',
        session_id: sessionId,
        feedback_schema: {},
        responses,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      
      return { previousFeedback, sessionId }
    },
    onError: (_err, _variables, context) => {
      
      if (context) {
        queryClient.setQueryData(
          feedbackKeys.userFeedbackForSession(context.sessionId), 
          context.previousFeedback
        )
      }
      toast.error('Failed to submit feedback. Please try again.')
    },
    onSuccess: (_data, variables) => {
      
      queryClient.invalidateQueries({ queryKey: feedbackKeys.summary(variables.sessionId) })
      queryClient.invalidateQueries({ queryKey: feedbackKeys.history() })
      toast.success('Feedback submitted successfully!')
    },
  })
}


export function useFeedbackUpdate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      sessionId, 
      responses 
    }: { 
      sessionId: string
      responses: { [key: string]: any }
    }) => {
      const response = await feedbackService.updateFeedback(sessionId, responses)
      if (!response.success) {
        throw new Error(response.message)
      }
      return response.data!
    },
    onSuccess: (data, variables) => {
      
      queryClient.setQueryData(feedbackKeys.userFeedbackForSession(variables.sessionId), data)
      
      queryClient.invalidateQueries({ queryKey: feedbackKeys.summary(variables.sessionId) })
      queryClient.invalidateQueries({ queryKey: feedbackKeys.history() })
      toast.success('Feedback updated successfully!')
    },
    onError: () => {
      toast.error('Failed to update feedback. Please try again.')
    },
  })
}


export function useFeedbackDelete() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await feedbackService.deleteFeedback(sessionId)
      if (!response.success) {
        throw new Error(response.message)
      }
      return response.data!
    },
    onSuccess: (_data, sessionId) => {
      
      queryClient.setQueryData(feedbackKeys.userFeedbackForSession(sessionId), null)
      
      queryClient.invalidateQueries({ queryKey: feedbackKeys.summary(sessionId) })
      queryClient.invalidateQueries({ queryKey: feedbackKeys.history() })
      toast.success('Feedback deleted successfully!')
    },
    onError: () => {
      toast.error('Failed to delete feedback. Please try again.')
    },
  })
}


export function useFeedbackValidation() {
  return useMutation({
    mutationFn: async ({ 
      sessionId, 
      responses 
    }: { 
      sessionId: string
      responses: { [key: string]: any }
    }) => {
      const response = await feedbackService.validateFeedback(sessionId, responses)
      if (!response.success) {
        throw new Error(response.message)
      }
      return response.data!
    },
    onError: () => {
      toast.error('Failed to validate feedback.')
    },
  })
}