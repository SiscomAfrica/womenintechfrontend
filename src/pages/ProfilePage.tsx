import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Mail,
  Briefcase,
  Building2,
  Link as LinkIcon,
  Edit2,
  Save,
  X,
  Loader2,
  LogOut,
  Camera,
  Trash2
} from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { networkingService } from "@/services/networking"
import type { User as UserType } from "@/services/networking"
import { toast } from "sonner"

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user: authUser, logout } = useAuthStore()
  const [profile, setProfile] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  const [editForm, setEditForm] = useState({
    fullName: '',
    bio: '',
    jobTitle: '',
    company: '',
    phone: '',
  })

  
  const [originalForm, setOriginalForm] = useState({
    fullName: '',
    bio: '',
    jobTitle: '',
    company: '',
    phone: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  
  useEffect(() => {
    if (editing) {
      const changed = 
        editForm.fullName !== originalForm.fullName ||
        editForm.bio !== originalForm.bio ||
        editForm.jobTitle !== originalForm.jobTitle ||
        editForm.company !== originalForm.company ||
        editForm.phone !== originalForm.phone
      
      setHasChanges(changed)
    }
  }, [editForm, originalForm, editing])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await networkingService.getMyProfile()
      
      if (response) {
        setProfile(response)
        
        const fullName = `${response.firstName || ''} ${response.lastName || ''}`.trim()
        const formData = {
          fullName: fullName || '',
          company: response.company || '',
          jobTitle: response.jobTitle || '',
          bio: response.bio || '',
          phone: '', 
        }
        setEditForm(formData)
        setOriginalForm(formData)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      
      
      const updateData: Record<string, any> = {
        profile: {
          name: editForm.fullName.trim(),
          job_title: editForm.jobTitle.trim(),
          company: editForm.company.trim(),
          location: editForm.phone.trim(),
          bio: editForm.bio.trim(),
        }
      }
      
      const response = await networkingService.updateMyProfile(updateData)
      
      if (response) {
        
        await loadProfile()
        setEditing(false)
        setHasChanges(false)
        toast.success('Profile updated successfully!')
        
        
        await useAuthStore.getState().initialize()
      }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile', {
        description: error.message || 'Please try again'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    
    setEditForm(originalForm)
    setEditing(false)
    setHasChanges(false)
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout()
      navigate('/login')
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        toast.error('Not authenticated')
        return
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/users/profile`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Failed to delete account')
      }

      toast.success('Account deleted successfully')
      
      // Clear auth and redirect
      await logout()
      navigate('/login')
      
    } catch (error: any) {
      console.error('Delete account error:', error)
      toast.error('Failed to delete account', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-tertiary flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#60166b]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-tertiary pb-8">
      {}
      <div className="bg-white border-b border-border-primary">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Profile</h1>
            {!editing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit2 className="h-4 w-4" />
                <span className="hidden sm:inline">Edit Profile</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#60166b] flex items-center justify-center text-white text-3xl sm:text-4xl font-bold">
                  {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                </div>
                {editing && (
                  <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-border-primary hover:bg-bg-secondary transition-colors">
                    <Camera className="h-4 w-4 text-text-secondary" />
                  </button>
                )}
              </div>

              {}
              <div className="flex-1 text-center sm:text-left">
                {!editing ? (
                  <>
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
                      {profile?.firstName} {profile?.lastName}
                    </h2>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-text-secondary">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm sm:text-base">{authUser?.email}</span>
                      </div>
                      {profile?.company && (
                        <div className="flex items-center justify-center sm:justify-start gap-2 text-text-secondary">
                          <Building2 className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm sm:text-base font-medium text-[#60166b]">{profile.company}</span>
                        </div>
                      )}
                      {profile?.jobTitle && (
                        <div className="flex items-center justify-center sm:justify-start gap-2 text-text-secondary">
                          <Briefcase className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm sm:text-base">{profile.jobTitle}</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-4 w-full">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="John Doe"
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {editing ? (
          
          <>
            {}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={editForm.company}
                    onChange={(e) => setEditForm(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Company name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    value={editForm.jobTitle}
                    onChange={(e) => setEditForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                    placeholder="Your job title"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+254 712 345 678"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={editForm.bio}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value.length <= 500) {
                        setEditForm(prev => ({ ...prev, bio: value }))
                      }
                    }}
                    placeholder="Tell others about yourself..."
                    rows={4}
                    maxLength={500}
                    className="mt-1 resize-none"
                  />
                  <p className={`text-xs mt-1 ${editForm.bio.length >= 500 ? 'text-red-500' : 'text-text-tertiary'}`}>
                    {editForm.bio.length}/500 characters
                  </p>
                </div>
              </CardContent>
            </Card>

            {}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleSaveProfile}
                disabled={saving || !editForm.fullName.trim() || !editForm.jobTitle.trim() || !hasChanges}
                className="flex-1 bg-[#60166b] hover:bg-[#4d1157] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {hasChanges ? 'Save Changes' : 'No Changes'}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={saving}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
            
            {}
            {!hasChanges && !saving && (
              <div className="text-sm text-text-tertiary text-center">
                Make changes to any field to enable saving
              </div>
            )}
          </>
        ) : (
          
          <>
            {}
            {profile?.bio && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-text-secondary leading-relaxed">{profile.bio}</p>
                </CardContent>
              </Card>
            )}

            {}
            {((profile?.interests && profile.interests.length > 0) || 
              (profile?.skills && profile.skills.length > 0)) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Interests & Skills</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.interests && profile.interests.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-text-secondary mb-2">Interests</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-[#60166b]/10 text-[#60166b] rounded-full text-sm"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {profile.skills && profile.skills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-text-secondary mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm border border-blue-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {}
            {(profile?.linkedinUrl || profile?.twitterUrl) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Social Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-border-primary hover:bg-bg-secondary transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#0077B5] flex items-center justify-center text-white flex-shrink-0">
                        <LinkIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-primary">LinkedIn</p>
                        <p className="text-sm text-text-tertiary truncate">{profile.linkedinUrl}</p>
                      </div>
                    </a>
                  )}
                  
                  {profile.twitterUrl && (
                    <a
                      href={profile.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-border-primary hover:bg-bg-secondary transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white flex-shrink-0">
                        <LinkIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-primary">Twitter</p>
                        <p className="text-sm text-text-tertiary truncate">{profile.twitterUrl}</p>
                      </div>
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {}
            <Card className="border-red-200">
              <CardContent className="p-4 space-y-3">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
                
                {/* Delete Account Section */}
                {!showDeleteConfirm ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full text-red-700 border-red-300 hover:bg-red-50 hover:text-red-800"
                    disabled={deleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                ) : (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
                    <div>
                      <p className="font-semibold text-red-900 text-sm">Delete Account?</p>
                      <p className="text-xs text-red-700 mt-1">
                        This action cannot be undone. All your data will be permanently deleted.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleDeleteAccount}
                        disabled={deleting}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        size="sm"
                      >
                        {deleting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Yes, Delete
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={deleting}
                        variant="outline"
                        className="flex-1"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
