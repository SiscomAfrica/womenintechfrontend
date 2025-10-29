import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'

interface AdminRouteProps {
  children: React.ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, isInitialized, user } = useAuthStore()
  const location = useLocation()

  // Show loading while initializing
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

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check if user has completed profile setup
  if (user && !user.profile_completed && location.pathname !== '/profile-setup') {
    return <Navigate to="/profile-setup" state={{ from: location }} replace />
  }

  // Check if user has admin privileges
  if (user && !user.is_admin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this area.</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#E55A2B] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}