import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import authService, { type ProfileSetupData } from '@/services/auth'


export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
}


export function useSendMagicLink() {
  return useMutation({
    mutationFn: (email: string) => authService.sendMagicLink(email),
    onError: (error) => {
      console.error('Send magic link error:', error)
    },
  })
}


export function useVerifyMagicLink() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => 
      authService.verifyMagicLink(email, code),
    onSuccess: (data) => {
      
      queryClient.setQueryData(authKeys.user(), data.user)
      
      queryClient.invalidateQueries({ queryKey: authKeys.all })
    },
    onError: (error) => {
      console.error('Verify magic link error:', error)
    },
  })
}


export function useSendSignupCode() {
  return useMutation({
    mutationFn: (email: string) => authService.sendSignupCode(email),
    onError: (error) => {
      console.error('Send signup code error:', error)
    },
  })
}


export function useVerifySignupCode() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => 
      authService.verifySignupCode(email, code),
    onSuccess: (data) => {
      
      queryClient.setQueryData(authKeys.user(), data.user)
      
      queryClient.invalidateQueries({ queryKey: authKeys.all })
    },
    onError: (error) => {
      console.error('Verify signup code error:', error)
    },
  })
}


export function useSetupProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (profileData: ProfileSetupData) => 
      authService.setupProfile(profileData),
    onSuccess: (user) => {
      
      queryClient.setQueryData(authKeys.user(), user)
      
      queryClient.invalidateQueries({ queryKey: authKeys.all })
    },
    onError: (error) => {
      console.error('Setup profile error:', error)
    },
  })
}


export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const response = await authService.getCurrentUser()
      if (!response.success) {
        throw new Error(response.message || 'Failed to get current user')
      }
      return response.data!
    },
    enabled: authService.isAuthenticated(),
    staleTime: 5 * 60 * 1000, 
    retry: (failureCount, error: any) => {
      
      if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
        return false
      }
      return failureCount < 3
    },
  })
}


export function useRefreshToken() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => authService.refreshToken(),
    onSuccess: (data) => {
      
      queryClient.setQueryData(authKeys.user(), data.user)
      
      queryClient.invalidateQueries({ queryKey: authKeys.all })
    },
    onError: (error) => {
      console.error('Refresh token error:', error)
      
      queryClient.setQueryData(authKeys.user(), null)
      queryClient.invalidateQueries({ queryKey: authKeys.all })
    },
  })
}


export function useLogout() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      
      queryClient.clear()
    },
    onError: (error) => {
      console.error('Logout error:', error)
      
      queryClient.clear()
    },
  })
}


export function useAuthStatus() {
  const { data: user, isLoading, error } = useCurrentUser()
  
  return {
    user,
    isAuthenticated: !!user,
    isAdmin: !!(user && user.is_admin),
    isLoading,
    error,
  }
}