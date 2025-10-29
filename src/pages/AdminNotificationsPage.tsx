import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Bell, Send, History, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import adminService, { type SystemAnnouncement, type AnnouncementCreate, type NotificationTemplate } from '@/services/admin'
import NotificationTemplates from '@/components/admin/NotificationTemplates'
import { AdminLoadingState } from '@/components/admin/AdminLoadingState'
import { ErrorMessage } from '@/components/ui/error-message'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useToast } from '@/components/ui/toast'
import { useFormSubmission } from '@/hooks/useAsyncOperation'
import { useAdminOperationError } from '@/hooks/useAdminError'

const AdminNotificationsPage: React.FC = () => {
  const [formData, setFormData] = useState<AnnouncementCreate>({
    title: '',
    message: '',
    type: 'info',
    target_audience: 'all',
  })

  const queryClient = useQueryClient()
  const toast = useToast()
  const { handleNotificationError } = useAdminOperationError()

  // Fetch notification history
  const { 
    data: notifications, 
    isLoading: notificationsLoading, 
    error: notificationsError,
    refetch: refetchNotifications 
  } = useQuery<SystemAnnouncement[]>({
    queryKey: ['admin', 'notifications'],
    queryFn: () => adminService.getAnnouncements(false), // Get all notifications, not just active
  })

  // Form submission handler with loading and error states
  const {
    isLoading: isSubmitting,
    error: submitError,
    handleSubmit: handleFormSubmit,
    clearError
  } = useFormSubmission({
    onSuccess: () => {
      toast.success('Notification sent successfully!')
      setFormData({
        title: '',
        message: '',
        type: 'info',
        target_audience: 'all',
      })
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] })
    },
    onError: (error) => {
      handleNotificationError(error)
    }
  })

  // Deactivate notification mutation
  const deactivateNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => adminService.deactivateAnnouncement(notificationId),
    onSuccess: () => {
      toast.success('Notification deactivated')
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] })
    },
    onError: (error: any) => {
      handleNotificationError(error)
    },
  })

  const handleSubmit = handleFormSubmit(async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      throw new Error('Please fill in both title and message')
    }

    return adminService.createAnnouncement(formData)
  })

  const handleInputChange = (field: keyof AnnouncementCreate, value: string) => {
    // Clear any previous errors when user starts typing
    if (submitError) {
      clearError()
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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
        return <AlertCircle className="w-4 h-4" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'destructive'
      case 'warning':
        return 'secondary'
      default:
        return 'default'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Notification Management</h1>
          <p className="text-sm sm:text-base text-gray-600">Send notifications and manage announcement history</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
          <span className="text-xs sm:text-sm text-gray-600">
            {notifications?.filter(n => n.is_active).length || 0} active notifications
          </span>
        </div>
      </div>

      {/* Notification Templates */}
      <NotificationTemplates onSelectTemplate={handleTemplateSelect} />

      {/* Send Notification Form */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center mb-4">
          <Send className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2" />
          <h3 className="text-base sm:text-lg font-semibold">Send New Notification</h3>
        </div>
        
        {submitError && (
          <ErrorMessage
            variant="banner"
            title="Failed to send notification"
            message={submitError}
            onDismiss={clearError}
          />
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
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
                onValueChange={(value) => handleInputChange('type', value)}
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
              onValueChange={(value) => handleInputChange('target_audience', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="session_attendees">Session Attendees</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <Textarea
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Enter your notification message..."
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Notification
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Notification History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <History className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold">Notification History</h3>
          </div>
          <span className="text-sm text-gray-500">
            {notifications?.length || 0} total notifications
          </span>
        </div>

        {notificationsError ? (
          <ErrorMessage
            variant="banner"
            title="Failed to load notifications"
            message={notificationsError.message || 'Unable to fetch notification history'}
            onRetry={() => refetchNotifications()}
          />
        ) : (
          <AdminLoadingState isLoading={notificationsLoading}>
            {notifications && notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeIcon(notification.type)}
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        <Badge variant={getTypeBadgeVariant(notification.type)} className="text-xs">
                          {notification.type}
                        </Badge>
                        {notification.is_active && (
                          <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Target: {notification.target_audience}</span>
                        <span>Created: {new Date(notification.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {notification.is_active && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deactivateNotificationMutation.mutate(notification.id)}
                        disabled={deactivateNotificationMutation.isPending}
                      >
                        {deactivateNotificationMutation.isPending ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          'Deactivate'
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No notifications sent yet</p>
            )}
          </AdminLoadingState>
        )}
      </Card>
    </div>
  )
}

export default AdminNotificationsPage