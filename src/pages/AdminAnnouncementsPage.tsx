import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  MessageSquare, 
  Plus, 
  Edit, 
  Eye, 
  EyeOff,
  AlertTriangle,
  Info,
  Clock,
  Users,
  Bell,
  Trash2
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import adminService, { type SystemAnnouncement, type AnnouncementCreate } from '@/services/admin'
import { UserMultiSelect } from '@/components/admin/UserMultiSelect'

const AdminAnnouncementsPage: React.FC = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showAllAnnouncements, setShowAllAnnouncements] = useState(false)

  const queryClient = useQueryClient()

  const { data: announcements = [], isLoading } = useQuery<SystemAnnouncement[]>({
    queryKey: ['admin', 'announcements', showAllAnnouncements],
    queryFn: () => adminService.getAnnouncements(!showAllAnnouncements),
  })

  const deactivateMutation = useMutation({
    mutationFn: (announcementId: string) => adminService.deactivateAnnouncement(announcementId),
    onSuccess: () => {
      toast.success('Announcement deactivated')
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to deactivate announcement')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (announcementId: string) => adminService.deleteAnnouncement(announcementId),
    onSuccess: () => {
      toast.success('Announcement deleted')
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete announcement')
    },
  })

  const handleDelete = (announcementId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this announcement? This action cannot be undone.')) {
      deleteMutation.mutate(announcementId)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
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

  const isExpired = (announcement: SystemAnnouncement) => {
    return announcement.expires_at && new Date(announcement.expires_at) < new Date()
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage system-wide announcements and notifications</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllAnnouncements(!showAllAnnouncements)}
            className="flex-1 sm:flex-none"
          >
            {showAllAnnouncements ? (
              <>
                <Eye className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Active Only</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Show All</span>
              </>
            )}
          </Button>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#60166b] hover:bg-[#4d1157] text-white flex-1 sm:flex-none shadow-md">
                <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Create</span>
                <span className="hidden sm:inline ml-1">Announcement</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Announcement</DialogTitle>
              </DialogHeader>
              <CreateAnnouncementForm onClose={() => setShowCreateDialog(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Active Announcements</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {announcements.filter(a => a.is_active && !isExpired(a)).length}
              </p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg bg-green-50">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Urgent Announcements</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {announcements.filter(a => a.type === 'urgent' && a.is_active).length}
              </p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg bg-red-50">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Expired</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {announcements.filter(a => isExpired(a)).length}
              </p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg bg-gray-50">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Announcements List */}
      <Card>
        <div className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            {showAllAnnouncements ? 'All Announcements' : 'Active Announcements'}
          </h3>
          
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements</h3>
              <p className="text-gray-600 mb-4">
                Create your first announcement to communicate with users
              </p>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-br from-purple-900/85 via-indigo-900/80 to-pink-900/85 hover:from-purple-800/90 hover:via-indigo-800/85 hover:to-pink-800/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Announcement
              </Button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {announcements.map((announcement) => (
                <div 
                  key={announcement.id} 
                  className={`p-3 sm:p-4 rounded-lg border ${
                    !announcement.is_active || isExpired(announcement)
                      ? 'bg-gray-50 border-gray-200 opacity-60'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                        {getTypeIcon(announcement.type)}
                        <h4 className="font-semibold text-sm sm:text-base text-gray-900 break-words">{announcement.title}</h4>
                        <div className="flex gap-1 sm:gap-2 flex-wrap">
                          {getTypeBadge(announcement.type)}
                          {!announcement.is_active && (
                            <Badge className="bg-gray-100 text-gray-800 text-xs">Inactive</Badge>
                          )}
                          {isExpired(announcement) && (
                            <Badge className="bg-gray-100 text-gray-800 text-xs">Expired</Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm sm:text-base text-gray-700 mb-2 sm:mb-3 break-words">{announcement.message}</p>
                      
                      <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4 text-xs sm:text-sm text-gray-500 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="capitalize">{announcement.target_audience}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                        </div>
                        {announcement.expires_at && (
                          <div className="flex items-center gap-1">
                            <span>Expires: {new Date(announcement.expires_at).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 sm:ml-4 justify-end sm:justify-start">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Edit className="w-4 h-4" />
                      </Button>
                      {announcement.is_active && !isExpired(announcement) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600"
                          onClick={() => deactivateMutation.mutate(announcement.id)}
                          disabled={deactivateMutation.isPending}
                        >
                          <EyeOff className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleDelete(announcement.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}


const CreateAnnouncementForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState<AnnouncementCreate>({
    title: '',
    message: '',
    type: 'info',
    target_audience: 'all',
  })
  const [sendAsNotification, setSendAsNotification] = useState(true)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  const queryClient = useQueryClient()

  // Fetch users for multi-select
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users-simple-list'],
    queryFn: () => adminService.getUsersSimpleList(),
  })

  const createMutation = useMutation({
    mutationFn: async (data: AnnouncementCreate) => {
      // If sendAsNotification is true, use the notification endpoint
      if (sendAsNotification) {
        return await adminService.sendBulkNotification(data)
      }
      const announcement = await adminService.createAnnouncement(data)
      return { message: 'Announcement created', sent_count: 0, announcement }
    },
    onSuccess: (result) => {
      if (sendAsNotification && result.sent_count) {
        toast.success(`Notification sent to ${result.sent_count} users successfully`)
      } else {
        toast.success('Announcement created successfully')
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
      onClose()
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create announcement')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Include selected user IDs if specific users are selected
    const submissionData = {
      ...formData,
      user_ids: formData.target_audience === 'specific' ? selectedUserIds : undefined
    }
    
    createMutation.mutate(submissionData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Send as Notification Toggle */}
      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-blue-600" />
          <div>
            <Label htmlFor="send-notification" className="text-sm font-medium text-gray-900 cursor-pointer">
              Send as Notification
            </Label>
            <p className="text-xs text-gray-600">
              {sendAsNotification 
                ? 'Will send push notification to users' 
                : 'Will only create announcement without notification'}
            </p>
          </div>
        </div>
        <Switch
          id="send-notification"
          checked={sendAsNotification}
          onCheckedChange={setSendAsNotification}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type *
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
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  Info
                </div>
              </SelectItem>
              <SelectItem value="warning">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  Warning
                </div>
              </SelectItem>
              <SelectItem value="urgent">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Urgent
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Audience *
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
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="specific">Specific Users</SelectItem>
              <SelectItem value="session_attendees">Session Attendees</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
          Title *
        </label>
        <Input
          required
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter announcement title"
          maxLength={100}
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.title.length}/100 characters
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Message *
        </label>
        <Textarea
          required
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          placeholder="Enter announcement message"
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.message.length}/500 characters
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Expires After (hours)
        </label>
        <Input
          type="number"
          min="1"
          max="168"
          value={formData.expires_hours || ''}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            expires_hours: e.target.value ? parseInt(e.target.value) : undefined 
          }))}
          placeholder="Leave empty for no expiration"
        />
        <p className="text-xs text-gray-500 mt-1">
          Maximum 168 hours (7 days). Leave empty for permanent announcement.
        </p>
      </div>

      {}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            {formData.type === 'urgent' && <AlertTriangle className="w-4 h-4 text-red-600" />}
            {formData.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
            {formData.type === 'info' && <Info className="w-4 h-4 text-blue-600" />}
            <span className="font-medium">{formData.title || 'Announcement Title'}</span>
            {formData.type === 'urgent' && <Badge className="bg-red-100 text-red-800">Urgent</Badge>}
            {formData.type === 'warning' && <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>}
            {formData.type === 'info' && <Badge className="bg-blue-100 text-blue-800">Info</Badge>}
          </div>
          <p className="text-gray-700">
            {formData.message || 'Your announcement message will appear here...'}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={createMutation.isPending || !formData.title || !formData.message}
          className="bg-[#60166b] hover:bg-[#4d1157] text-white shadow-md"
        >
          {createMutation.isPending ? 'Creating...' : 'Create Announcement'}
        </Button>
      </div>
    </form>
  )
}

export default AdminAnnouncementsPage