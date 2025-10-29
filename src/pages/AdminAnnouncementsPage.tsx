import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  MessageSquare, 
  Plus, 
  Edit, 
  Eye, 
  EyeOff,
  AlertTriangle,
  Info,
  Clock,
  Users
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import adminService, { type SystemAnnouncement, type AnnouncementCreate } from '@/services/admin'

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
    <div className="space-y-6">
      {}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600">Manage system-wide announcements and notifications</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllAnnouncements(!showAllAnnouncements)}
          >
            {showAllAnnouncements ? (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Active Only
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Show All
              </>
            )}
          </Button>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Announcement</DialogTitle>
              </DialogHeader>
              <CreateAnnouncementForm onClose={() => setShowCreateDialog(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Announcements</p>
              <p className="text-2xl font-bold text-gray-900">
                {announcements.filter(a => a.is_active && !isExpired(a)).length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Urgent Announcements</p>
              <p className="text-2xl font-bold text-gray-900">
                {announcements.filter(a => a.type === 'urgent' && a.is_active).length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-50">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-gray-900">
                {announcements.filter(a => isExpired(a)).length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50">
              <Clock className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </Card>
      </div>

      {}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Announcement
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div 
                  key={announcement.id} 
                  className={`p-4 rounded-lg border ${
                    !announcement.is_active || isExpired(announcement)
                      ? 'bg-gray-50 border-gray-200 opacity-60'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getTypeIcon(announcement.type)}
                        <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                        {getTypeBadge(announcement.type)}
                        {!announcement.is_active && (
                          <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                        )}
                        {isExpired(announcement) && (
                          <Badge className="bg-gray-100 text-gray-800">Expired</Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-700 mb-3">{announcement.message}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span className="capitalize">{announcement.target_audience}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                        </div>
                        {announcement.expires_at && (
                          <div className="flex items-center gap-1">
                            <span>Expires: {new Date(announcement.expires_at).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="ghost">
                        <Edit className="w-4 h-4" />
                      </Button>
                      {announcement.is_active && !isExpired(announcement) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deactivateMutation.mutate(announcement.id)}
                          disabled={deactivateMutation.isPending}
                        >
                          <EyeOff className="w-4 h-4" />
                        </Button>
                      )}
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

  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: AnnouncementCreate) => adminService.createAnnouncement(data),
    onSuccess: () => {
      toast.success('Announcement created successfully')
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
      onClose()
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create announcement')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            onValueChange={(value) => setFormData(prev => ({ ...prev, target_audience: value }))}
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
      </div>

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
          className="bg-orange-600 hover:bg-orange-700"
        >
          {createMutation.isPending ? 'Creating...' : 'Create Announcement'}
        </Button>
      </div>
    </form>
  )
}

export default AdminAnnouncementsPage