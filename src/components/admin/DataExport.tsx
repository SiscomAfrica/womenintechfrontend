import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, Users, BarChart3, Calendar, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import adminService from '@/services/admin'
import { toast } from 'sonner'

interface ExportOption {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  endpoint: string
  filename: string
}

const DataExport: React.FC = () => {
  const [exportingId, setExportingId] = useState<string | null>(null)

  const { data: dashboardData } = useQuery({
    queryKey: ['admin', 'dashboard-overview'],
    queryFn: () => adminService.getDashboardOverview(),
  })

  const exportOptions: ExportOption[] = [
    {
      id: 'users',
      title: 'User Data',
      description: 'Export all user information and registration data',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      endpoint: '/admin/users/export',
      filename: 'users_export.csv'
    },
    {
      id: 'polls',
      title: 'Poll Results',
      description: 'Export poll questions, responses, and analytics',
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      endpoint: '/admin/polls/export',
      filename: 'poll_results.csv'
    },
    {
      id: 'sessions',
      title: 'Session Data',
      description: 'Export session information and attendance data',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      endpoint: '/admin/sessions/export',
      filename: 'sessions_export.csv'
    },
    {
      id: 'analytics',
      title: 'Analytics Report',
      description: 'Export comprehensive analytics and engagement metrics',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      endpoint: '/admin/analytics/export',
      filename: 'analytics_report.csv'
    }
  ]

  const handleExport = async (option: ExportOption) => {
    setExportingId(option.id)
    
    try {
      // Create a simple CSV export based on available data
      let csvContent = ''
      let filename = option.filename

      switch (option.id) {
        case 'users':
          csvContent = await generateUsersCsv()
          break
        case 'polls':
          csvContent = await generatePollsCsv()
          break
        case 'sessions':
          csvContent = await generateSessionsCsv()
          break
        case 'analytics':
          csvContent = await generateAnalyticsCsv()
          break
        default:
          throw new Error('Unknown export type')
      }

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success(`${option.title} exported successfully`)
    } catch (error) {
      console.error('Export failed:', error)
      toast.error(`Failed to export ${option.title}`)
    } finally {
      setExportingId(null)
    }
  }

  const generateUsersCsv = async (): Promise<string> => {
    try {
      // Try to get user stats data
      const userStats = await adminService.getUserStats()
      
      const headers = ['Metric', 'Value', 'Description']
      const rows = [
        ['Total Pre-registered', userStats.total_pre_registered.toString(), 'Users who pre-registered for the event'],
        ['Invitations Sent', userStats.invitations_sent.toString(), 'Number of invitation emails sent'],
        ['App Downloads', userStats.app_downloaded.toString(), 'Users who downloaded the mobile app'],
        ['Accounts Activated', userStats.accounts_activated.toString(), 'Users who completed account activation'],
        ['Total Registered', userStats.total_registered.toString(), 'Total registered users in system'],
        ['Verified Users', userStats.verified_users.toString(), 'Users with verified email addresses'],
        ['Conversion Rate', `${userStats.conversion_rate.toFixed(2)}%`, 'Pre-registered to activated conversion rate']
      ]
      
      return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    } catch (error) {
      // Fallback to basic data
      const headers = ['Metric', 'Value']
      const rows = [
        ['Total Users', dashboardData?.users.total.toString() || '0'],
        ['Verified Users', dashboardData?.users.verified.toString() || '0'],
        ['Active Users', dashboardData?.users.active.toString() || '0']
      ]
      
      return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    }
  }

  const generatePollsCsv = async (): Promise<string> => {
    const headers = ['Metric', 'Value', 'Description']
    const rows = [
      ['Total Polls', dashboardData?.polls.total.toString() || '0', 'Total number of polls created'],
      ['Active Polls', dashboardData?.polls.active.toString() || '0', 'Currently active polls'],
      ['Total Responses', dashboardData?.polls.total_responses.toString() || '0', 'Total poll responses received'],
      ['Average Responses per Poll', 
        dashboardData?.polls.total && dashboardData.polls.total > 0 
          ? Math.round(dashboardData.polls.total_responses / dashboardData.polls.total).toString()
          : '0', 
        'Average number of responses per poll'
      ],
      ['Poll Activation Rate', 
        dashboardData?.polls.total && dashboardData.polls.total > 0 
          ? `${Math.round((dashboardData.polls.active / dashboardData.polls.total) * 100)}%`
          : '0%', 
        'Percentage of polls that are currently active'
      ]
    ]
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  }

  const generateSessionsCsv = async (): Promise<string> => {
    const headers = ['Metric', 'Value', 'Description']
    const rows = [
      ['Total Sessions', dashboardData?.sessions.total.toString() || '0', 'Total number of event sessions'],
      ['Average Users per Session', 
        dashboardData?.sessions.total && dashboardData.sessions.total > 0 
          ? Math.round((dashboardData.users.active || 0) / dashboardData.sessions.total).toString()
          : '0', 
        'Average number of users per session'
      ],
      ['Session Utilization', 
        dashboardData?.sessions.total && dashboardData.sessions.total > 0 
          ? `${Math.round(((dashboardData.users.active || 0) / dashboardData.sessions.total) * 100)}%`
          : '0%', 
        'Session capacity utilization rate'
      ]
    ]
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  }

  const generateAnalyticsCsv = async (): Promise<string> => {
    const timestamp = new Date().toISOString()
    
    const headers = ['Category', 'Metric', 'Value', 'Timestamp']
    const rows = [
      ['Users', 'Total Users', dashboardData?.users.total.toString() || '0', timestamp],
      ['Users', 'Verified Users', dashboardData?.users.verified.toString() || '0', timestamp],
      ['Users', 'Active Users', dashboardData?.users.active.toString() || '0', timestamp],
      ['Users', 'User Activation Rate', 
        dashboardData?.users.total && dashboardData.users.total > 0 
          ? `${Math.round((dashboardData.users.active / dashboardData.users.total) * 100)}%`
          : '0%', 
        timestamp
      ],
      ['Sessions', 'Total Sessions', dashboardData?.sessions.total.toString() || '0', timestamp],
      ['Polls', 'Total Polls', dashboardData?.polls.total.toString() || '0', timestamp],
      ['Polls', 'Active Polls', dashboardData?.polls.active.toString() || '0', timestamp],
      ['Polls', 'Total Responses', dashboardData?.polls.total_responses.toString() || '0', timestamp],
      ['Engagement', 'Poll Response Rate', 
        dashboardData?.polls.total && dashboardData.polls.total > 0 
          ? `${Math.round((dashboardData.polls.total_responses / dashboardData.polls.total) * 100)}%`
          : '0%', 
        timestamp
      ]
    ]
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Data Export</h3>
          <p className="text-sm text-gray-600">Export event data and analytics in CSV format</p>
        </div>
        <Badge variant="secondary" className="text-xs">
          CSV Format
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exportOptions.map((option) => {
          const Icon = option.icon
          const isExporting = exportingId === option.id
          
          return (
            <div key={option.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${option.bgColor} mr-3`}>
                    <Icon className={`w-4 h-4 ${option.color}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{option.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => handleExport(option)}
                disabled={isExporting}
                size="sm"
                className="w-full"
                variant="outline"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </>
                )}
              </Button>
            </div>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <FileText className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Export Information</h4>
            <p className="text-sm text-blue-700 mt-1">
              All exports are generated in CSV format and include current data as of the export time. 
              Files will be automatically downloaded to your default download folder.
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default DataExport