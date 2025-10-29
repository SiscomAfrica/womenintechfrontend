import React from 'react'
import { Card } from '@/components/ui/card'
import { Users, Calendar, BarChart3, MessageSquare, TrendingUp, Activity, Zap } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import RealTimeIndicator from './RealTimeIndicator'
import { useDashboardRealTime } from '@/hooks/useRealtimeUpdates'

interface DashboardOverview {
  users: {
    total: number
    verified: number
    active: number
  }
  sessions: {
    total: number
  }
  polls: {
    total: number
    active: number
    total_responses: number
  }
}

interface DashboardMetricsProps {
  data: DashboardOverview | undefined
  isLoading: boolean
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b']

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ data, isLoading }) => {
  // Real-time updates
  const realTime = useDashboardRealTime(true)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load dashboard metrics</p>
      </div>
    )
  }

  const metricCards = [
    {
      title: 'Total Users',
      value: data.users.total,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: `${data.users.verified} verified`
    },
    {
      title: 'Active Users',
      value: data.users.active,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: `${Math.round((data.users.active / data.users.total) * 100)}% of total`
    },
    {
      title: 'Total Sessions',
      value: data.sessions.total,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Event sessions'
    },
    {
      title: 'Active Polls',
      value: data.polls.active,
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: `${data.polls.total} total polls`
    }
  ]

  // Prepare chart data
  const userStatusData = [
    { name: 'Active', value: data.users.active, color: COLORS[1] },
    { name: 'Verified', value: data.users.verified - data.users.active, color: COLORS[2] },
    { name: 'Unverified', value: data.users.total - data.users.verified, color: COLORS[3] }
  ]

  const pollEngagementData = [
    { name: 'Active Polls', value: data.polls.active },
    { name: 'Inactive Polls', value: data.polls.total - data.polls.active },
    { name: 'Total Responses', value: data.polls.total_responses }
  ]

  const engagementMetrics = [
    { name: 'Users', value: data.users.total },
    { name: 'Sessions', value: data.sessions.total },
    { name: 'Polls', value: data.polls.total },
    { name: 'Responses', value: data.polls.total_responses }
  ]

  return (
    <div className="space-y-6">
      {/* Real-time Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Live Dashboard</h2>
        </div>
        <RealTimeIndicator 
          status={realTime.status}
          onForceUpdate={realTime.forceUpdate}
        />
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon
          return (
            <Card key={index} className="p-4 sm:p-6 hover:shadow-md transition-shadow relative">
              {/* Live indicator for active metrics */}
              {(metric.title === 'Active Users' || metric.title === 'Active Polls') && realTime.status.isConnected && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 sm:gap-2 mb-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{metric.title}</p>
                    {(metric.title === 'Active Users' || metric.title === 'Active Polls') && (
                      <span className="text-xs text-green-600 font-medium flex-shrink-0">LIVE</span>
                    )}
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                    {metric.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{metric.description}</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-lg ${metric.bgColor} flex-shrink-0 ml-2`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${metric.color}`} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* User Status Distribution */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center mb-4">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">User Status Distribution</h3>
          </div>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {userStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value.toLocaleString(), 'Users']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-4">
            {userStatusData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-1 sm:mr-2" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-xs sm:text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Poll Engagement */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mr-2" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Poll Engagement</h3>
          </div>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pollEngagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                />
                <YAxis fontSize={12} />
                <Tooltip formatter={(value) => [value.toLocaleString(), 'Count']} />
                <Bar dataKey="value" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Overall Engagement Metrics */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center mb-4">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Overall Engagement</h3>
        </div>
        <div className="h-48 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={engagementMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                fontSize={12}
                tick={{ fontSize: 12 }}
              />
              <YAxis fontSize={12} />
              <Tooltip formatter={(value) => [value.toLocaleString(), 'Count']} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={COLORS[1]} 
                strokeWidth={2}
                dot={{ fill: COLORS[1], strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Session Attendance Summary */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mr-2" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Session Overview</h3>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xl sm:text-2xl font-bold text-purple-600">{data.sessions.total}</p>
            <p className="text-xs sm:text-sm text-gray-600">Total Sessions</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
            <p className="text-xs sm:text-sm font-medium text-purple-600">Average Attendance</p>
            <p className="text-lg sm:text-xl font-bold text-purple-900">
              {data.sessions.total > 0 ? Math.round(data.users.active / data.sessions.total) : 0}
            </p>
            <p className="text-xs text-purple-600">users per session</p>
          </div>
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
            <p className="text-xs sm:text-sm font-medium text-blue-600">Poll Participation</p>
            <p className="text-lg sm:text-xl font-bold text-blue-900">
              {data.polls.total > 0 ? Math.round((data.polls.total_responses / data.polls.total) * 100) : 0}%
            </p>
            <p className="text-xs text-blue-600">average response rate</p>
          </div>
          <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
            <p className="text-xs sm:text-sm font-medium text-green-600">User Engagement</p>
            <p className="text-lg sm:text-xl font-bold text-green-900">
              {data.users.total > 0 ? Math.round((data.users.active / data.users.total) * 100) : 0}%
            </p>
            <p className="text-xs text-green-600">active user rate</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default DashboardMetrics