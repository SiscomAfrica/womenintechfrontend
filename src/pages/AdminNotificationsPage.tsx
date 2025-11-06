import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bell, Send, History, AlertCircle, Info, AlertTriangle, Users, Eye } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import adminService, { type SystemAnnouncement, type AnnouncementCreate, type NotificationTemplate, type NotificationHistory } from '@/services/admin'
import NotificationTemplates from '@/components/admin/NotificationTemplates'
import { UserMultiSelect } from '@/components/admin/UserMultiSelect'

const AdminNotificationsPage: React.FC = () => {
  const [formData, setFormData] = useState<AnnouncementCreate>({
    title: '',
    message: '',
    type: 'info',
    target_audience: 'all',
  })
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  const queryClient = useQueryClient()

  // Fetch users for multi-select
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users-simple-list'],
    queryFn: () => adminService.getUsersSimpleList(),
  })

  // Fetch notification history
  const { data: notificationHistory = [], isLoading: historyLoading } = useQuery<NotificationHistory[]>({
    queryKey: ['admin', 'notification-history'],
    queryFn: () => adminService.getNotificationHistory(),
  })

  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: (data: AnnouncementCreate) => adminService.sendBulkNotification(data),
    onSuccess: (result) => {
      toast.success(`Notification sent to ${result.sent_count} users successfully!`)
      setFormData({
        title: '',
        message: '',
        type: 'info',
        target_audience: 'all',
      })
      setSelectedUserIds([])
      queryClient.invalidateQueries({ queryKey: ['admin', 'notification-history'] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send notification')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Please fill in both title and message')
      return
    }
    
    // Include selected user IDs if specific users are selected
    const submissionData = {
      ...formData,
      user_ids: formData.target_audience === 'specific' ? selectedUserIds : undefined
    }
    
    sendNotificationMutation.mutate(submissionData)
  }

  const handleTemplateSelect = (template: NotificationTemplate) => {
    // Apply template to form data
    let title = template.title
    let message = template.message
    
    // Replace variables with placeholders for user to fill
    template.variables.forEach(variable => {
      const placeholder = `[${variable.toUpperCase()}]`
      title = title.replace(`{${variable}}`, placeholder)
      message = message.replace(`{${variable}}`, placeholder)
    })

    setFormData(prev => ({
      ...prev,
      title,
      message,
      type: template.type
    }))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      default:
        return <Info className="w-4 h-4 text-blue-600" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800">Urgent</Badge>
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      default:
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Notification Management</h1>
          <p className="text-sm sm:text-base text-gray-600">Send notifications and view history</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-#60166b" />
          <span className="text-xs sm:text-sm text-gray-600">
            {notificationHistory.length} total sent
          </span>
        </div>
      </div>

      <Tabs defaultValue="send" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="send">Send Notification</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Send Notification Tab */}
        <TabsContent value="send" className="space-y-4">
          {/* Notification Templates */}
          <NotificationTemplates onSelectTemplate={handleTemplateSelect} />

          {/* Send Notification Form */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center mb-4">
              <Send className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2" />
              <h3 className="text-base sm:text-lg font-semibold">Send New Notification</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter notification title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'info' | 'warning' | 'urgent') => 
                      setFormData(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">
                        <div className="flex items-center">
                          <Info className="w-4 h-4 mr-2" />
                          Information
                        </div>
                      </SelectItem>
                      <SelectItem value="warning">
                        <div className="flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Warning
                        </div>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <div className="flex items-center">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Urgent
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Audience
                </label>
                <Select
                  value={formData.target_audience}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, target_audience: value }))
                    // Clear selected users when switching away from specific
                    if (value !== 'specific') {
                      setSelectedUserIds([])
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        All Users
                      </div>
                    </SelectItem>
                    <SelectItem value="specific">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Specific Users
                      </div>
                    </SelectItem>
                    <SelectItem value="session_attendees">Session Attendees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* User Multi-Select - Show only when "specific" is selected */}
              {formData.target_audience === 'specific' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Users *
                  </label>
                  {usersLoading ? (
                    <div className="text-sm text-gray-500">Loading users...</div>
                  ) : (
                    <UserMultiSelect
                      selectedUserIds={selectedUserIds}
                      onSelectionChange={setSelectedUserIds}
                      users={users}
                      placeholder="Select users to notify..."
                    />
                  )}
                  {selectedUserIds.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedUserIds.length} user(s) selected
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter your notification message..."
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={sendNotificationMutation.isPending}
                  className="bg-[#60166b] hover:bg-[#4d1157] text-white shadow-md"
                >
                  {sendNotificationMutation.isPending ? 'Sending...' : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Notification
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <History className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-base sm:text-lg font-semibold">Notification History</h3>
              </div>
              <span className="text-sm text-gray-500">
                {notificationHistory.length} total
              </span>
            </div>

            {historyLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : notificationHistory.length > 0 ? (
              <div className="space-y-3">
                {notificationHistory.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex flex-col sm:flex-row sm:items-start justify-between p-4 bg-gray-50 rounded-lg gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {getTypeIcon(notification.type)}
                        <h4 className="font-medium text-gray-900 truncate">{notification.title}</h4>
                        {getTypeBadge(notification.type)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2 break-words">{notification.message}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{notification.target_audience}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Send className="w-3 h-3" />
                          <span>Sent: {notification.sent_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>Read: {notification.read_count}</span>
                        </div>
                        <span>•</span>
                        <span>{new Date(notification.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No notifications sent yet</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminNotificationsPage