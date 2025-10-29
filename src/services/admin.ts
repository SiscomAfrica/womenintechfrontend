


interface PreRegisteredUser {
  id: string
  email: string
  name: string
  invitation_code: string
  invitation_sent_at: string | null
  app_downloaded: boolean
  account_activated: boolean
  profile_data: Record<string, any>
  created_at: string
  activated_at: string | null
}

interface UserStats {
  total_pre_registered: number
  invitations_sent: number
  app_downloaded: number
  accounts_activated: number
  total_registered: number
  verified_users: number
  conversion_rate: number
}

interface SystemAnnouncement {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'urgent'
  target_audience: string
  session_id?: string
  is_active: boolean
  expires_at?: string
  created_at: string
}

interface NotificationTemplate {
  id: string
  name: string
  title: string
  message: string
  type: 'info' | 'warning' | 'urgent'
  variables: string[]
}

interface NotificationHistory {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'urgent'
  target_audience: string
  sent_count: number
  delivered_count: number
  read_count: number
  created_at: string
  sent_at?: string
}

interface AnnouncementCreate {
  title: string
  message: string
  type: 'info' | 'warning' | 'urgent'
  target_audience: string
  session_id?: string
  expires_hours?: number
}

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

interface AnalyticsData {
  user_engagement: {
    total_users: number
    active_users: number
    daily_active_users: number
    session_duration_avg: number
    page_views: number
  }
  session_analytics: {
    total_sessions: number
    attended_sessions: number
    attendance_rate: number
    popular_sessions: Array<{
      id: string
      title: string
      attendance_count: number
      capacity: number
      attendance_rate: number
    }>
  }
  poll_analytics: {
    total_polls: number
    active_polls: number
    response_rate: number
    popular_polls: Array<{
      id: string
      title: string
      response_count: number
      response_rate: number
    }>
  }
  networking_analytics: {
    total_connections: number
    connection_requests: number
    acceptance_rate: number
    top_networkers: Array<{
      id: string
      name: string
      connection_count: number
    }>
  }
}

interface PollCreate {
  session_id: string
  title: string
  question_schema: { [key: string]: any }
  is_active?: boolean
}

interface PollUpdate {
  title?: string
  question_schema?: { [key: string]: any }
  is_active?: boolean
}

interface AdminPoll {
  id: string
  session_id: string
  title: string
  question_schema: { [key: string]: any }
  is_active: boolean
  created_at: string
  updated_at: string
  session_title?: string
  response_count?: number
}

interface AdminPollResults {
  poll_id: string
  poll_title: string
  total_participants: number
  question_results: Array<{
    question_id: string
    question: string
    question_type: string
    total_responses: number
    results: { [key: string]: any }
  }>
  created_at: string
}

interface PreRegisteredUserCreate {
  email: string
  name: string
  profile_data?: Record<string, any>
}

interface RegisteredUser {
  id: string
  email: string
  is_verified: boolean
  is_active: boolean
  is_admin: boolean
  profile_completed: boolean
  profile: Record<string, any>
  created_at: string
  updated_at: string
}

interface UserActivity {
  user_id: string
  email: string
  name: string
  is_active: boolean
  is_verified: boolean
  profile_completed: boolean
  created_at: string
  last_updated: string
  activity: {
    sessions_attended: number
    poll_responses: number
    feedback_submitted: number
    notifications_received: number
    notifications_read: number
    engagement_score: number
  }
}

interface UsersWithCount {
  users: RegisteredUser[]
  total: number
  skip: number
  limit: number
}

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

class AdminService {
  private baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  private handle401() {
    // Clear auth and redirect to login
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // Show notification
    const event = new CustomEvent('auth:unauthorized', {
      detail: { message: 'Your session has expired. Please login again.' }
    })
    window.dispatchEvent(event)
    
    // Redirect to login after a short delay
    setTimeout(() => {
      window.location.href = '/login'
    }, 1500)
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const token = localStorage.getItem('token')
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)
    
    if (response.status === 401) {
      this.handle401()
      throw new Error('Unauthorized - Session expired')
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  
  async getUserStats(): Promise<UserStats> {
    return this.request<UserStats>('/admin/users/stats')
  }

  async getPreRegisteredUsers(skip = 0, limit = 100): Promise<PreRegisteredUser[]> {
    return this.request<PreRegisteredUser[]>(`/admin/users/pre-registered?skip=${skip}&limit=${limit}`)
  }

  async getPreRegisteredUsersWithCount(
    skip = 0, 
    limit = 100, 
    search?: string, 
    statusFilter?: string
  ): Promise<{ users: PreRegisteredUser[]; total: number; skip: number; limit: number }> {
    const params = new URLSearchParams()
    params.append('skip', String(skip))
    params.append('limit', String(limit))
    if (search) params.append('search', search)
    if (statusFilter && statusFilter !== 'all') params.append('status_filter', statusFilter)
    
    return this.request<{ users: PreRegisteredUser[]; total: number; skip: number; limit: number }>(`/admin/users/pre-registered/with-count?${params.toString()}`)
  }

  async preRegisterUser(userData: PreRegisteredUserCreate): Promise<PreRegisteredUser> {
    return this.request<PreRegisteredUser>('/admin/users/pre-register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async bulkPreRegisterUsers(file: File): Promise<PreRegisteredUser[]> {
    const formData = new FormData()
    formData.append('file', file)

    return this.request<PreRegisteredUser[]>('/admin/users/bulk-pre-register', {
      method: 'POST',
      body: formData,
      headers: {}, 
    })
  }

  async sendInvitation(userId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/users/${userId}/send-invitation`, {
      method: 'POST',
    })
  }

  async updateUserStatus(userId: string, appDownloaded?: boolean): Promise<PreRegisteredUser> {
    const body: any = {}
    if (appDownloaded !== undefined) {
      body.app_downloaded = appDownloaded
    }

    return this.request<PreRegisteredUser>(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  
  async getAnnouncements(activeOnly = true): Promise<SystemAnnouncement[]> {
    return this.request<SystemAnnouncement[]>(`/admin/announcements?active_only=${activeOnly}`)
  }

  async createAnnouncement(announcement: AnnouncementCreate): Promise<SystemAnnouncement> {
    return this.request<SystemAnnouncement>('/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(announcement),
    })
  }

  async deactivateAnnouncement(announcementId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/announcements/${announcementId}/deactivate`, {
      method: 'PUT',
    })
  }

  // Dashboard
  async getDashboardOverview(): Promise<DashboardOverview> {
    return this.request<DashboardOverview>('/admin/dashboard/overview')
  }

  
  async getAnalytics(timeRange = '7d'): Promise<AnalyticsData> {
    return this.request<AnalyticsData>(`/admin/analytics?time_range=${timeRange}`)
  }

  async getRecentActivity(limit = 10): Promise<Array<{
    time: string
    action: string
    user: string
    user_name: string
    type: string
    timestamp: string
  }>> {
    return this.request<Array<{
      time: string
      action: string
      user: string
      user_name: string
      type: string
      timestamp: string
    }>>(`/admin/analytics/activity?limit=${limit}`)
  }

  async exportAnalyticsReport(timeRange = '7d', format = 'csv'): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/admin/analytics/export?time_range=${timeRange}&format=${format}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to export report')
    }
    
    return response.blob()
  }

  
  // Notification Management
  async getNotificationTemplates(): Promise<NotificationTemplate[]> {
    return this.request<NotificationTemplate[]>('/admin/notifications/templates')
  }

  async createNotificationTemplate(template: Omit<NotificationTemplate, 'id'>): Promise<NotificationTemplate> {
    return this.request<NotificationTemplate>('/admin/notifications/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    })
  }

  async sendBulkNotification(notification: AnnouncementCreate): Promise<{ message: string; sent_count: number }> {
    return this.request<{ message: string; sent_count: number }>('/admin/notifications/send-bulk', {
      method: 'POST',
      body: JSON.stringify(notification),
    })
  }

  async getNotificationHistory(): Promise<NotificationHistory[]> {
    return this.request<NotificationHistory[]>('/admin/notifications/history')
  }

  async getNotificationStats(notificationId: string): Promise<{ sent: number; delivered: number; read: number }> {
    return this.request<{ sent: number; delivered: number; read: number }>(`/admin/notifications/${notificationId}/stats`)
  }

  // Poll Management
  async getPolls(sessionId?: string, isActive?: boolean): Promise<AdminPoll[]> {
    const params = new URLSearchParams()
    if (sessionId) params.append('session_id', sessionId)
    if (isActive !== undefined) params.append('is_active', String(isActive))
    
    const response = await this.request<{ polls: AdminPoll[]; total: number }>(`/admin/polls?${params.toString()}`)
    return response.polls
  }

  async createPoll(pollData: PollCreate): Promise<AdminPoll> {
    return this.request<AdminPoll>('/admin/polls', {
      method: 'POST',
      body: JSON.stringify(pollData),
    })
  }

  async updatePoll(pollId: string, pollData: PollUpdate): Promise<AdminPoll> {
    return this.request<AdminPoll>(`/admin/polls/${pollId}`, {
      method: 'PUT',
      body: JSON.stringify(pollData),
    })
  }

  async deletePoll(pollId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/polls/${pollId}`, {
      method: 'DELETE',
    })
  }

  async activatePoll(pollId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/polls/${pollId}/activate`, {
      method: 'POST',
    })
  }

  async deactivatePoll(pollId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/polls/${pollId}/deactivate`, {
      method: 'POST',
    })
  }

  async getPollResults(pollId: string): Promise<AdminPollResults> {
    return this.request<AdminPollResults>(`/admin/polls/${pollId}/results`)
  }

  async duplicatePoll(pollId: string, targetSessionId: string): Promise<AdminPoll> {
    return this.request<AdminPoll>(`/admin/polls/${pollId}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ target_session_id: targetSessionId }),
    })
  }

  // Bulk Operations
  async sendBulkInvitations(userIds: string[]): Promise<{ sent: number; failed: number }> {
    const results = await Promise.allSettled(
      userIds.map(userId => this.sendInvitation(userId))
    )

    const sent = results.filter(result => result.status === 'fulfilled').length
    const failed = results.filter(result => result.status === 'rejected').length

    return { sent, failed }
  }

  async updateBulkUserStatus(userIds: string[], appDownloaded: boolean): Promise<{ updated: number; failed: number }> {
    const results = await Promise.allSettled(
      userIds.map(userId => this.updateUserStatus(userId, appDownloaded))
    )

    const updated = results.filter(result => result.status === 'fulfilled').length
    const failed = results.filter(result => result.status === 'rejected').length

    return { updated, failed }
  }

  // Registered User Management
  async getUsers(
    skip = 0, 
    limit = 100, 
    search?: string, 
    isActive?: boolean, 
    isVerified?: boolean
  ): Promise<RegisteredUser[]> {
    const params = new URLSearchParams()
    params.append('skip', String(skip))
    params.append('limit', String(limit))
    if (search) params.append('search', search)
    if (isActive !== undefined) params.append('is_active', String(isActive))
    if (isVerified !== undefined) params.append('is_verified', String(isVerified))
    
    return this.request<RegisteredUser[]>(`/admin/users?${params.toString()}`)
  }

  async getUsersWithCount(
    skip = 0, 
    limit = 100, 
    search?: string, 
    isActive?: boolean, 
    isVerified?: boolean
  ): Promise<UsersWithCount> {
    const params = new URLSearchParams()
    params.append('skip', String(skip))
    params.append('limit', String(limit))
    if (search) params.append('search', search)
    if (isActive !== undefined) params.append('is_active', String(isActive))
    if (isVerified !== undefined) params.append('is_verified', String(isVerified))
    
    return this.request<UsersWithCount>(`/admin/users/with-count?${params.toString()}`)
  }

  async getUserDetails(userId: string): Promise<RegisteredUser> {
    return this.request<RegisteredUser>(`/admin/users/${userId}`)
  }

  async activateUser(userId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/users/${userId}/activate`, {
      method: 'PUT',
    })
  }

  async deactivateUser(userId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/users/${userId}/deactivate`, {
      method: 'PUT',
    })
  }

  async resetUserPassword(userId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/users/${userId}/reset-password`, {
      method: 'POST',
    })
  }

  async getUserActivity(userId: string): Promise<UserActivity> {
    return this.request<UserActivity>(`/admin/users/${userId}/activity`)
  }

  // System Health Monitoring
  async getSystemHealth(): Promise<SystemHealth> {
    return this.request<SystemHealth>('/admin/system/health')
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    return this.request<SystemMetrics>('/admin/system/metrics')
  }
}

export default new AdminService()
export type { 
  PreRegisteredUser, 
  UserStats, 
  SystemAnnouncement, 
  AnnouncementCreate, 
  PreRegisteredUserCreate,
  DashboardOverview,
  AnalyticsData,
  NotificationTemplate,
  NotificationHistory,
  PollCreate,
  PollUpdate,
  AdminPoll,
  AdminPollResults,
  RegisteredUser,
  UserActivity,
  SystemHealth,
  SystemMetrics,
  UsersWithCount
}