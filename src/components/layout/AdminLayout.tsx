import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Bell,
  Calendar, 
  BarChart3,
  ArrowLeft,
  Settings,
  Vote
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { AdminErrorBoundary } from '@/components/admin/AdminErrorBoundary'
import { ToastProvider } from '@/components/ui/toast'

const AdminLayout: React.FC = () => {
  const location = useLocation()
  const { user } = useAuthStore()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      current: location.pathname === '/admin'
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      current: location.pathname === '/admin/users'
    },
    {
      name: 'Announcements',
      href: '/admin/announcements',
      icon: MessageSquare,
      current: location.pathname === '/admin/announcements'
    },
    {
      name: 'Notifications',
      href: '/admin/notifications',
      icon: Bell,
      current: location.pathname === '/admin/notifications'
    },
    {
      name: 'Schedule',
      href: '/admin/schedule',
      icon: Calendar,
      current: location.pathname === '/admin/schedule'
    },
    {
      name: 'Polls',
      href: '/admin/polls',
      icon: Vote,
      current: location.pathname === '/admin/polls'
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      current: location.pathname === '/admin/analytics'
    }
  ]

  return (
    <ToastProvider>
      <AdminErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-14 sm:h-16">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  <Link
                    to="/dashboard"
                    className="flex items-center text-xs sm:text-sm text-gray-600 hover:text-gray-900 flex-shrink-0"
                  >
                    <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Back to App</span>
                    <span className="sm:hidden">Back</span>
                  </Link>
                  <div className="h-4 sm:h-6 w-px bg-gray-300" />
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                    <span className="hidden sm:inline">Admin Panel</span>
                    <span className="sm:hidden">Admin</span>
                  </h1>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  <span className="text-xs sm:text-sm text-gray-600 truncate max-w-32 sm:max-w-none">
                    <span className="hidden sm:inline">Welcome, </span>
                    {(user as any)?.profile?.name || user?.email?.split('@')[0]}
                  </span>
                  <Button variant="ghost" size="sm" className="flex-shrink-0">
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
              {/* Mobile Navigation */}
              <div className="lg:hidden">
                <nav className="flex overflow-x-auto space-x-1 pb-2">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                          item.current
                            ? 'bg-orange-100 text-orange-900 border-b-2 border-orange-600'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>
              </div>

              {/* Desktop Sidebar */}
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <nav className="space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          item.current
                            ? 'bg-orange-100 text-orange-900 border-r-2 border-orange-600'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>
              </aside>

              {/* Main content */}
              <main className="flex-1 min-w-0">
                <Outlet />
              </main>
            </div>
          </div>
        </div>
      </AdminErrorBoundary>
    </ToastProvider>
  )
}

export default AdminLayout