import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, UserPlus, MessageSquare, Upload, Settings, BarChart3, Calendar } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import adminService, { type DashboardOverview, type UserStats } from '@/services/admin'
import DashboardMetrics from '@/components/admin/DashboardMetrics'
import DataExport from '@/components/admin/DataExport'
import SystemHealthMonitor from '@/components/admin/SystemHealthMonitor'
import { AdminLoadingState, AdminSkeleton } from '@/components/admin/AdminLoadingState'
import { ErrorMessage } from '@/components/ui/error-message'
import { useToast } from '@/components/ui/toast'
import { useAdminOperationError } from '@/hooks/useAdminError'

const AdminDashboardPage: React.FC = () => {
  const toast = useToast()
  const { handleAnalyticsError } = useAdminOperationError()

  const { 
    data: dashboardData, 
    isLoading: dashboardLoading, 
    error: dashboardError,
    refetch: refetchDashboard 
  } = useQuery<DashboardOverview>({
    queryKey: ['admin', 'dashboard-overview'],
    queryFn: () => adminService.getDashboardOverview(),
  })

  const { 
    data: userStats, 
    isLoading: statsLoading, 
    error: statsError,
    refetch: refetchStats 
  } = useQuery<UserStats>({
    queryKey: ['admin', 'user-stats'],
    queryFn: () => adminService.getUserStats(),
  })

  const { 
    data: announcements, 
    isLoading: announcementsLoading, 
    error: announcementsError,
    refetch: refetchAnnouncements 
  } = useQuery<any[]>({
    queryKey: ['admin', 'announcements'],
    queryFn: () => adminService.getAnnouncements(),
  })

  // Show loading skeleton for initial load
  if (dashboardLoading && !dashboardData) {
    return <AdminSkeleton />
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Event overview and key metrics</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <BarChart3 className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Stats</span>
          </Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Settings className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Settings</span>
            <span className="sm:hidden">Config</span>
          </Button>
          <Button size="sm" className="bg-[#60166b] hover:bg-[#4d1157] text-white flex-1 sm:flex-none">
            <Upload className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export Data</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      {/* Dashboard Metrics */}
      {dashboardError ? (
        <ErrorMessage
          variant="banner"
          title="Failed to load dashboard metrics"
          message={dashboardError.message || 'Unable to fetch dashboard data'}
          onRetry={() => refetchDashboard()}
        />
      ) : (
        <AdminLoadingState isLoading={dashboardLoading} variant="skeleton">
          <DashboardMetrics data={dashboardData || undefined} isLoading={dashboardLoading} />
        </AdminLoadingState>
      )}

      {/* Legacy User Stats */}
      {statsError ? (
        <ErrorMessage
          variant="banner"
          title="Failed to load user statistics"
          message={statsError.message || 'Unable to fetch user stats'}
          onRetry={() => refetchStats()}
        />
      ) : (
        <AdminLoadingState isLoading={statsLoading}>
          {userStats && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <UserPlus className="w-5 h-5 text-[#60166b] mr-2" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Pre-Registration Stats</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm font-medium text-blue-600">Pre-registered</p>
                  <p className="text-lg sm:text-xl font-bold text-blue-900">{userStats?.total_pre_registered || 0}</p>
                </div>
                <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm font-medium text-green-600">Invitations Sent</p>
                  <p className="text-lg sm:text-xl font-bold text-green-900">{userStats?.invitations_sent || 0}</p>
                </div>
                <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm font-medium text-purple-600">App Downloads</p>
                  <p className="text-lg sm:text-xl font-bold text-purple-900">{userStats?.app_downloaded || 0}</p>
                </div>
                <div className="bg-[#60166b]/10 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm font-medium text-[#60166b]">Conversion Rate</p>
                  <p className="text-lg sm:text-xl font-bold text-[#60166b]">{userStats?.conversion_rate?.toFixed(1) || '0.0'}%</p>
                </div>
              </div>
            </Card>
          )}
        </AdminLoadingState>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center mb-3 sm:mb-4">
            <Users className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-base sm:text-lg font-semibold">User Management</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3 sm:mb-4">
            Manage pre-registered users, send invitations, and track user status
          </p>
          <Button className="w-full text-sm" variant="outline">
            Manage Users
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold">Schedule Management</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Upload event schedule data and manage session information
          </p>
          <Button className="w-full" variant="outline">
            Manage Schedule
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center mb-4">
            <MessageSquare className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold">Announcements</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Create and manage system-wide announcements for users
          </p>
          <Button className="w-full" variant="outline">
            Manage Announcements
          </Button>
        </Card>
      </div>

      {/* System Health Monitor */}
      <SystemHealthMonitor />

      {/* Data Export */}
      <DataExport />

      {/* Recent Announcements */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Announcements</h3>
          <Button size="sm" variant="outline">
            View All
          </Button>
        </div>
        
        {announcementsError ? (
          <ErrorMessage
            variant="inline"
            message="Failed to load announcements"
            onRetry={() => refetchAnnouncements()}
          />
        ) : (
          <AdminLoadingState isLoading={announcementsLoading}>
            {announcements && announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.slice(0, 3).map((announcement: any) => (
                  <div key={announcement.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                        <Badge 
                          variant={announcement.type === 'urgent' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {announcement.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{announcement.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost">
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No announcements yet</p>
            )}
          </AdminLoadingState>
        )}
      </Card>
    </div>
  )
}

export default AdminDashboardPage