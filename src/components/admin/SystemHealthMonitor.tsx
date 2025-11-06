import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Server, 
  Database, 
  Cpu, 
  HardDrive, 
  Activity, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import adminService from '@/services/admin'

interface SystemHealth {
  timestamp: string
  api_status: 'healthy' | 'degraded' | 'down'
  database_status: 'healthy' | 'slow' | 'down'
  cache_status: 'healthy' | 'degraded' | 'down'
  response_time_avg: number
  active_connections: number
  error_rate: number
  uptime_seconds: number
}

interface SystemMetrics {
  timestamp: string
  system: {
    cpu_percent: number
    memory_percent: number
    memory_used_gb: number
    memory_total_gb: number
    disk_percent: number
    disk_used_gb: number
    disk_total_gb: number
  }
  database: {
    query_time_ms: number
    total_users: number
    total_sessions: number
    total_polls: number
    users_24h: number
    polls_24h: number
  }
  performance: {
    avg_response_time_ms: number
    requests_per_minute: number
    error_rate_percent: number
    uptime_hours: number
  }
}

const SystemHealthMonitor: React.FC = () => {
  const { data: health, isLoading: healthLoading } = useQuery<SystemHealth>({
    queryKey: ['admin', 'system-health'],
    queryFn: () => adminService.getSystemHealth(),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const { data: metrics, isLoading: metricsLoading } = useQuery<SystemMetrics>({
    queryKey: ['admin', 'system-metrics'],
    queryFn: () => adminService.getSystemMetrics(),
    refetchInterval: 60000, // Refresh every minute
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'degraded':
      case 'slow':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'down':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Healthy</Badge>
      case 'degraded':
      case 'slow':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Degraded</Badge>
      case 'down':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Down</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  if (healthLoading && metricsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#60166b]" />
          <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#60166b]" />
          <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
        </div>
        {health && (
          <div className="text-xs text-gray-500">
            Last updated: {new Date(health.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* System Status Overview */}
      {health && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-600" />
                  <CardTitle className="text-sm">API Status</CardTitle>
                </div>
                {getStatusIcon(health.api_status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getStatusBadge(health.api_status)}
                <div className="text-xs text-gray-500">
                  Response Time: {health.response_time_avg.toFixed(1)}ms
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-green-600" />
                  <CardTitle className="text-sm">Database</CardTitle>
                </div>
                {getStatusIcon(health.database_status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getStatusBadge(health.database_status)}
                <div className="text-xs text-gray-500">
                  Connections: {health.active_connections}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-600" />
                  <CardTitle className="text-sm">Performance</CardTitle>
                </div>
                {getStatusIcon(health.error_rate > 5 ? 'degraded' : 'healthy')}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getStatusBadge(health.error_rate > 5 ? 'degraded' : 'healthy')}
                <div className="text-xs text-gray-500">
                  Error Rate: {health.error_rate.toFixed(1)}%
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-600" />
                System Resources
              </CardTitle>
              <CardDescription>
                Server resource utilization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CPU Usage</span>
                  <span>{metrics.system.cpu_percent.toFixed(1)}%</span>
                </div>
                <Progress value={metrics.system.cpu_percent} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Memory Usage</span>
                  <span>
                    {metrics.system.memory_used_gb.toFixed(1)}GB / {metrics.system.memory_total_gb.toFixed(1)}GB
                  </span>
                </div>
                <Progress value={metrics.system.memory_percent} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Disk Usage</span>
                  <span>
                    {metrics.system.disk_used_gb.toFixed(1)}GB / {metrics.system.disk_total_gb.toFixed(1)}GB
                  </span>
                </div>
                <Progress value={metrics.system.disk_percent} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Database Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-green-600" />
                Database Metrics
              </CardTitle>
              <CardDescription>
                Database performance and activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.database.query_time_ms.toFixed(1)}ms
                  </div>
                  <div className="text-xs text-gray-500">Avg Query Time</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-blue-600">
                    {metrics.database.total_users.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Total Users</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-purple-600">
                    {metrics.database.total_sessions.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Total Sessions</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-[#60166b]">
                    {metrics.database.total_polls.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Total Polls</div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600 mb-2">Recent Activity (24h)</div>
                <div className="flex justify-between text-sm">
                  <span>New Users: {metrics.database.users_24h}</span>
                  <span>New Polls: {metrics.database.polls_24h}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Performance Overview
              </CardTitle>
              <CardDescription>
                Application performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {metrics.performance.avg_response_time_ms.toFixed(1)}ms
                  </div>
                  <div className="text-xs text-gray-500">Avg Response Time</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {metrics.performance.requests_per_minute.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Requests/Min</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {metrics.performance.error_rate_percent.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">Error Rate</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.performance.uptime_hours.toFixed(0)}h
                  </div>
                  <div className="text-xs text-gray-500">Uptime</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default SystemHealthMonitor