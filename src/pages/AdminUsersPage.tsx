import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  UserPlus, 
  Mail, 
  Filter, 
  MoreHorizontal,
  Check,
  X,
  Calendar,
  Users,
  UserCheck,
  Activity,
  Shield,
  ShieldOff,
  Key,
  Eye,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Loader2
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import adminService, { 
  type PreRegisteredUser, 
  type PreRegisteredUserCreate, 
  type RegisteredUser,
  type UserActivity
} from '@/services/admin'

const AdminUsersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('registered')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showAddUser, setShowAddUser] = useState(false)
  const [showUserDetails, setShowUserDetails] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(100)

  const queryClient = useQueryClient()

  // Pre-registered users query - get users with total count and pagination
  const { data: preRegisteredUsersData, isLoading: isLoadingPreRegistered } = useQuery({
    queryKey: ['admin', 'pre-registered-users-with-count', currentPage, pageSize, searchQuery, statusFilter],
    queryFn: () => adminService.getPreRegisteredUsersWithCount(
      currentPage * pageSize, 
      pageSize, 
      searchQuery || undefined, 
      statusFilter !== 'all' ? statusFilter : undefined
    ),
  })

  const preRegisteredUsers = preRegisteredUsersData?.users || []
  const totalPreRegisteredUsers = preRegisteredUsersData?.total || 0

  // Registered users query - get users with total count and pagination
  const { data: registeredUsersData, isLoading: isLoadingRegistered } = useQuery({
    queryKey: ['admin', 'registered-users-with-count', currentPage, pageSize, searchQuery, statusFilter],
    queryFn: () => {
      // Convert statusFilter to API parameters
      let isActive: boolean | undefined
      let isVerified: boolean | undefined
      
      switch (statusFilter) {
        case 'active':
          isActive = true
          break
        case 'inactive':
          isActive = false
          break
        case 'verified':
          isVerified = true
          break
        case 'unverified':
          isVerified = false
          break
      }
      
      return adminService.getUsersWithCount(
        currentPage * pageSize, 
        pageSize, 
        searchQuery || undefined, 
        isActive, 
        isVerified
      )
    },
  })

  const registeredUsers = registeredUsersData?.users || []
  const totalRegisteredUsers = registeredUsersData?.total || 0

  const sendInvitationMutation = useMutation({
    mutationFn: (userId: string) => adminService.sendInvitation(userId),
    onSuccess: () => {
      toast.success('Invitation sent successfully')
      queryClient.invalidateQueries({ queryKey: ['admin', 'pre-registered-users-with-count'] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send invitation')
    },
  })



  const bulkInvitationMutation = useMutation({
    mutationFn: (userIds: string[]) => adminService.sendBulkInvitations(userIds),
    onSuccess: (result) => {
      toast.success(`Sent ${result.sent} invitations, ${result.failed} failed`)
      setSelectedUsers([])
      queryClient.invalidateQueries({ queryKey: ['admin', 'pre-registered-users-with-count'] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send bulk invitations')
    },
  })

  // User account control mutations
  const activateUserMutation = useMutation({
    mutationFn: (userId: string) => adminService.activateUser(userId),
    onSuccess: () => {
      toast.success('User activated successfully')
      queryClient.invalidateQueries({ queryKey: ['admin', 'registered-users-with-count'] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to activate user')
    },
  })

  const deactivateUserMutation = useMutation({
    mutationFn: (userId: string) => adminService.deactivateUser(userId),
    onSuccess: () => {
      toast.success('User deactivated successfully')
      queryClient.invalidateQueries({ queryKey: ['admin', 'registered-users-with-count'] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to deactivate user')
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => adminService.deleteUser(userId),
    onSuccess: () => {
      toast.success('User deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['admin', 'registered-users-with-count'] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete user')
    },
  })

  const resetPasswordMutation = useMutation({
    mutationFn: (userId: string) => adminService.resetUserPassword(userId),
    onSuccess: () => {
      toast.success('Password reset successfully. New credentials sent to user.')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reset password')
    },
  })

  // Since filtering is now handled by the API, we use the users directly
  const currentUsers = activeTab === 'pre-registered' ? preRegisteredUsers : registeredUsers
  const isLoading = activeTab === 'pre-registered' ? isLoadingPreRegistered : isLoadingRegistered
  const totalUsers = activeTab === 'pre-registered' ? totalPreRegisteredUsers : totalRegisteredUsers
  
  // Calculate pagination info
  const totalPages = Math.ceil(totalUsers / pageSize)
  const hasNextPage = currentPage < totalPages - 1
  const hasPrevPage = currentPage > 0

  // Reset pagination when filters change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(0)
  }

  const handleStatusFilterChange = (filter: string) => {
    setStatusFilter(filter)
    setCurrentPage(0)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setCurrentPage(0)
    setSelectedUsers([])
  }

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId])
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(currentUsers.map(user => user.id))
    } else {
      setSelectedUsers([])
    }
  }

  const getPreRegisteredStatusBadge = (user: PreRegisteredUser) => {
    if (user.account_activated) {
      return <Badge className="bg-green-100 text-green-800">Activated</Badge>
    }
    if (user.app_downloaded) {
      return <Badge className="bg-blue-100 text-blue-800">Downloaded</Badge>
    }
    if (user.invitation_sent_at) {
      return <Badge className="bg-yellow-100 text-yellow-800">Invited</Badge>
    }
    return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
  }

  const getRegisteredStatusBadge = (user: RegisteredUser) => {
    const badges = []
    
    if (user.is_admin) {
      badges.push(<Badge key="admin" className="bg-purple-100 text-purple-800">Admin</Badge>)
    }
    
    if (user.is_active) {
      badges.push(<Badge key="active" className="bg-green-100 text-green-800">Active</Badge>)
    } else {
      badges.push(<Badge key="inactive" className="bg-red-100 text-red-800">Inactive</Badge>)
    }
    
    if (user.is_verified) {
      badges.push(<Badge key="verified" className="bg-blue-100 text-blue-800">Verified</Badge>)
    } else {
      badges.push(<Badge key="unverified" className="bg-yellow-100 text-yellow-800">Unverified</Badge>)
    }
    
    return <div className="flex gap-1 flex-wrap">{badges}</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage registered users and pre-registered invitations</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {activeTab === 'pre-registered' && (
            <>
              <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-#60166b hover:bg-#4d1157 w-full sm:w-auto">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Pre-registered User</DialogTitle>
                  </DialogHeader>
                  <AddUserForm onClose={() => setShowAddUser(false)} />
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="registered" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Registered Users ({totalRegisteredUsers})
          </TabsTrigger>
          <TabsTrigger value="pre-registered" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Pre-registered ({totalPreRegisteredUsers})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="registered" className="space-y-4">
          <RegisteredUsersTab 
            users={currentUsers as RegisteredUser[]}
            isLoading={isLoading}
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            statusFilter={statusFilter}
            setStatusFilter={handleStatusFilterChange}
            selectedUsers={selectedUsers}
            setSelectedUsers={setSelectedUsers}
            handleSelectUser={handleSelectUser}
            handleSelectAll={handleSelectAll}
            activateUserMutation={activateUserMutation}
            deactivateUserMutation={deactivateUserMutation}
            deleteUserMutation={deleteUserMutation}
            resetPasswordMutation={resetPasswordMutation}
            setShowUserDetails={setShowUserDetails}
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Card className="p-3 sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                  Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalUsers)} of {totalUsers} users
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!hasPrevPage}
                    className="flex-shrink-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Previous</span>
                  </Button>
                  <span className="text-xs sm:text-sm text-gray-600 px-2">
                    {currentPage + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!hasNextPage}
                    className="flex-shrink-0"
                  >
                    <span className="hidden sm:inline mr-1">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pre-registered" className="space-y-4">
          <PreRegisteredUsersTab 
            users={currentUsers as PreRegisteredUser[]}
            isLoading={isLoading}
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            statusFilter={statusFilter}
            setStatusFilter={handleStatusFilterChange}
            selectedUsers={selectedUsers}
            setSelectedUsers={setSelectedUsers}
            handleSelectUser={handleSelectUser}
            handleSelectAll={handleSelectAll}
            sendInvitationMutation={sendInvitationMutation}
            bulkInvitationMutation={bulkInvitationMutation}
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Card className="p-3 sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                  Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalUsers)} of {totalUsers} users
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!hasPrevPage}
                    className="flex-shrink-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Previous</span>
                  </Button>
                  <span className="text-xs sm:text-sm text-gray-600 px-2">
                    {currentPage + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!hasNextPage}
                    className="flex-shrink-0"
                  >
                    <span className="hidden sm:inline mr-1">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* User Details Dialog */}
      {showUserDetails && (
        <UserDetailsDialog 
          userId={showUserDetails} 
          onClose={() => setShowUserDetails(null)} 
        />
      )}
    </div>
  )
}

// Registered Users Tab Component
const RegisteredUsersTab: React.FC<{
  users: RegisteredUser[]
  isLoading: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
  statusFilter: string
  setStatusFilter: (filter: string) => void
  selectedUsers: string[]
  setSelectedUsers: (users: string[]) => void
  handleSelectUser: (userId: string, checked: boolean) => void
  handleSelectAll: (checked: boolean) => void
  activateUserMutation: any
  deactivateUserMutation: any
  deleteUserMutation: any
  resetPasswordMutation: any
  setShowUserDetails: (userId: string) => void
}> = ({ 
  users, 
  isLoading, 
  searchQuery, 
  setSearchQuery, 
  statusFilter, 
  setStatusFilter,
  selectedUsers,
  setSelectedUsers,
  handleSelectUser,
  handleSelectAll,
  activateUserMutation,
  deactivateUserMutation,
  deleteUserMutation,
  resetPasswordMutation,
  setShowUserDetails
}) => {
  const getRegisteredStatusBadge = (user: RegisteredUser) => {
    const badges = []
    
    if (user.is_admin) {
      badges.push(<Badge key="admin" className="bg-purple-100 text-purple-800">Admin</Badge>)
    }
    
    if (user.is_active) {
      badges.push(<Badge key="active" className="bg-green-100 text-green-800">Active</Badge>)
    } else {
      badges.push(<Badge key="inactive" className="bg-red-100 text-red-800">Inactive</Badge>)
    }
    
    if (user.is_verified) {
      badges.push(<Badge key="verified" className="bg-blue-100 text-blue-800">Verified</Badge>)
    } else {
      badges.push(<Badge key="unverified" className="bg-yellow-100 text-yellow-800">Unverified</Badge>)
    }
    
    return <div className="flex gap-1 flex-wrap">{badges}</div>
  }

  return (
    <>
      {/* Search and Filters */}
      <Card className="p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedUsers([])}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="border-b">
              <tr>
                <th className="text-left p-2 sm:p-4">
                  <Checkbox
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">User</th>
                <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">Status</th>
                <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm hidden md:table-cell">Profile</th>
                <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm hidden lg:table-cell">Created</th>
                <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-4">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 sm:p-4">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked: boolean) => handleSelectUser(user.id, checked)}
                      />
                    </td>
                    <td className="p-2 sm:p-4">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {user.profile?.name || 'No name'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate max-w-[150px] sm:max-w-none">{user.email}</p>
                        {user.profile?.company && (
                          <p className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">{user.profile.company}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-2 sm:p-4">
                      <div className="flex flex-wrap gap-1">
                        {getRegisteredStatusBadge(user)}
                      </div>
                    </td>
                    <td className="p-2 sm:p-4 hidden md:table-cell">
                      <div className="flex items-center text-sm text-gray-600">
                        {user.profile_completed ? (
                          <div className="flex items-center text-green-600">
                            <Check className="w-4 h-4 mr-1" />
                            <span className="hidden lg:inline">Complete</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-yellow-600">
                            <X className="w-4 h-4 mr-1" />
                            <span className="hidden lg:inline">Incomplete</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-2 sm:p-4 hidden lg:table-cell">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span className="text-xs">{new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-2 sm:p-4">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowUserDetails(user.id)}
                          title="View Details"
                          className="p-1 sm:p-2"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        
                        {user.is_active ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deactivateUserMutation.mutate(user.id)}
                            disabled={deactivateUserMutation.isPending}
                            title="Deactivate User"
                            className="text-red-600 hover:text-red-700 p-1 sm:p-2"
                          >
                            <ShieldOff className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => activateUserMutation.mutate(user.id)}
                            disabled={activateUserMutation.isPending}
                            title="Activate User"
                            className="text-green-600 hover:text-green-700 p-1 sm:p-2"
                          >
                            <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => resetPasswordMutation.mutate(user.id)}
                          disabled={resetPasswordMutation.isPending}
                          title="Reset Password"
                          className="text-blue-600 hover:text-blue-700 p-1 sm:p-2 hidden sm:flex"
                        >
                          {resetPasswordMutation.isPending ? (
                            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                          ) : (
                            <Key className="w-3 h-3 sm:w-4 sm:h-4" />
                          )}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                              deleteUserMutation.mutate(user.id)
                            }
                          }}
                          disabled={deleteUserMutation.isPending}
                          title="Delete User"
                          className="text-red-600 hover:text-red-700 p-1 sm:p-2"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

// Pre-registered Users Tab Component
const PreRegisteredUsersTab: React.FC<{
  users: PreRegisteredUser[]
  isLoading: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
  statusFilter: string
  setStatusFilter: (filter: string) => void
  selectedUsers: string[]
  setSelectedUsers: (users: string[]) => void
  handleSelectUser: (userId: string, checked: boolean) => void
  handleSelectAll: (checked: boolean) => void
  sendInvitationMutation: any
  bulkInvitationMutation: any
}> = ({ 
  users, 
  isLoading, 
  searchQuery, 
  setSearchQuery, 
  statusFilter, 
  setStatusFilter,
  selectedUsers,
  setSelectedUsers,
  handleSelectUser,
  handleSelectAll,
  sendInvitationMutation,
  bulkInvitationMutation
}) => {
  const getPreRegisteredStatusBadge = (user: PreRegisteredUser) => {
    if (user.account_activated) {
      return <Badge className="bg-green-100 text-green-800">Activated</Badge>
    }
    if (user.app_downloaded) {
      return <Badge className="bg-blue-100 text-blue-800">Downloaded</Badge>
    }
    if (user.invitation_sent_at) {
      return <Badge className="bg-yellow-100 text-yellow-800">Invited</Badge>
    }
    return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
  }

  return (
    <>
      {/* Search and Filters */}
      <Card className="p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="invited">Invited</SelectItem>
                <SelectItem value="downloaded">Downloaded</SelectItem>
                <SelectItem value="activated">Activated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => bulkInvitationMutation.mutate(selectedUsers)}
                disabled={bulkInvitationMutation.isPending}
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Invitations
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedUsers([])}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="border-b">
              <tr>
                <th className="text-left p-2 sm:p-4">
                  <Checkbox
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">User</th>
                <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">Status</th>
                <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm hidden md:table-cell">Invitation</th>
                <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm hidden lg:table-cell">Created</th>
                <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-4">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked: boolean) => handleSelectUser(user.id, checked)}
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        {user.profile_data?.company && (
                          <p className="text-xs text-gray-500">{user.profile_data.company}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {getPreRegisteredStatusBadge(user)}
                    </td>
                    <td className="p-4">
                      {user.invitation_sent_at ? (
                        <div className="flex items-center text-sm text-green-600">
                          <Check className="w-4 h-4 mr-1" />
                          Sent
                        </div>
                      ) : (
                        <div className="flex items-center text-sm text-gray-500">
                          <X className="w-4 h-4 mr-1" />
                          Not sent
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {!user.invitation_sent_at && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendInvitationMutation.mutate(user.id)}
                            disabled={sendInvitationMutation.isPending}
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}


const AddUserForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState<PreRegisteredUserCreate>({
    email: '',
    name: '',
    profile_data: {},
  })

  const queryClient = useQueryClient()

  const addUserMutation = useMutation({
    mutationFn: (userData: PreRegisteredUserCreate) => adminService.preRegisterUser(userData),
    onSuccess: () => {
      toast.success('User added successfully')
      queryClient.invalidateQueries({ queryKey: ['admin', 'pre-registered-users-with-count'] })
      onClose()
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add user')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addUserMutation.mutate(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <Input
          required
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter full name"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <Input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="Enter email address"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Company
        </label>
        <Input
          value={formData.profile_data?.company || ''}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            profile_data: { ...prev.profile_data, company: e.target.value }
          }))}
          placeholder="Enter company name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Job Title
        </label>
        <Input
          value={formData.profile_data?.job_title || ''}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            profile_data: { ...prev.profile_data, job_title: e.target.value }
          }))}
          placeholder="Enter job title"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={addUserMutation.isPending}
          className="bg-#60166b hover:bg-#4d1157"
        >
          {addUserMutation.isPending ? 'Adding...' : 'Add User'}
        </Button>
      </div>
    </form>
  )
}

// User Details Dialog Component
const UserDetailsDialog: React.FC<{ userId: string; onClose: () => void }> = ({ userId, onClose }) => {
  const { data: userActivity, isLoading } = useQuery<UserActivity>({
    queryKey: ['admin', 'user-activity', userId],
    queryFn: () => adminService.getUserActivity(userId),
    enabled: !!userId,
  })

  if (isLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!userActivity) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          <p className="text-gray-500">User not found</p>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* User Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Basic Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <span className="ml-2 font-medium">{userActivity.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <span className="ml-2">{userActivity.email}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className="ml-2">
                    {userActivity.is_active ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Verified:</span>
                  <span className="ml-2">
                    {userActivity.is_verified ? (
                      <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">Unverified</Badge>
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Account Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Profile Complete:</span>
                  <span className="ml-2">
                    {userActivity.profile_completed ? (
                      <Check className="w-4 h-4 inline text-green-600" />
                    ) : (
                      <X className="w-4 h-4 inline text-red-600" />
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <span className="ml-2">{new Date(userActivity.created_at).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>
                  <span className="ml-2">{new Date(userActivity.last_updated).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Metrics */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Activity Metrics</h3>
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {userActivity.activity.sessions_attended}
                </div>
                <div className="text-sm text-gray-600">Sessions Attended</div>
              </Card>
              
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {userActivity.activity.poll_responses}
                </div>
                <div className="text-sm text-gray-600">Poll Responses</div>
              </Card>
              
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {userActivity.activity.feedback_submitted}
                </div>
                <div className="text-sm text-gray-600">Feedback Submitted</div>
              </Card>
            </div>
          </div>

          {/* Engagement Score */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Engagement</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>Engagement Score</span>
                  <span>{userActivity.activity.engagement_score}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-#60166b h-2 rounded-full" 
                    style={{ width: `${(userActivity.activity.engagement_score / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Stats */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Notifications</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Received:</span>
                <span className="ml-2 font-medium">{userActivity.activity.notifications_received}</span>
              </div>
              <div>
                <span className="text-gray-500">Read:</span>
                <span className="ml-2 font-medium">{userActivity.activity.notifications_read}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AdminUsersPage