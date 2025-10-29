import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isInitialized, user } = useAuthStore()
  const location = useLocation()

  
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check if user has completed profile setup
  // Allow access to profile-setup page itself
  if (user && !user.profile_completed && location.pathname !== '/profile-setup') {
    console.log('[ProtectedRoute] User profile not completed, redirecting to profile-setup')
    return <Navigate to="/profile-setup" state={{ from: location }} replace />
  }

  return <>{children}</>
}