import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import authService, { type User } from '@/services/auth'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  isInitialized: boolean
  
  
  initialize: () => void
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => Promise<void>
  setError: (error: string | null) => void
  clearAuth: () => void
  handleAuthError: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isInitialized: false,

        
        initialize: () => {
          
          if (get().isInitialized) {
            console.log('[AuthStore] Already initialized, skipping...')
            return
          }

          console.log('[AuthStore] Initializing auth store...')
          
          const storedUser = authService.getStoredUser()
          const storedToken = authService.getStoredToken()
          
          if (storedUser && storedToken) {
            console.log('[AuthStore] Found stored user:', storedUser.email)
            set({ 
              user: storedUser, 
              token: storedToken, 
              isAuthenticated: true,
              isInitialized: true,
            })
          } else {
            console.log('[AuthStore] No stored auth data found')
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isInitialized: true,
            })
          }
        },

        setUser: (user) => {
          console.log('[AuthStore] Setting user:', user?.email || 'null')
          set({ 
            user, 
            isAuthenticated: !!user,
            error: null 
          })
        },

        setToken: (token) => {
          console.log('[AuthStore] Setting token:', token ? 'present' : 'null')
          set({ token })
        },

        logout: async () => {
          console.log('[AuthStore] Logging out...')
          set({ isLoading: true })
          try {
            await authService.logout()
          } catch (error) {
            console.error('[AuthStore] Logout error:', error)
          } finally {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            })
          }
        },

        setError: (error) => {
          set({ error })
        },

        clearAuth: () => {
          console.log('[AuthStore] Clearing auth...')
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false,
            error: null 
          })
        },

        
        handleAuthError: () => {
          console.log('[AuthStore] Handling auth error - logging out')
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Session expired. Please login again.',
          })
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
)