


import { API_ENDPOINTS } from '@/lib/api-endpoints'

export interface SessionData {
  description?: string
  location?: string
  speaker?: {
    name?: string
    bio?: string
    photo?: string
  }
  type?: string
  tags?: string[]
  max_attendees?: number
}

export interface UserAttendance {
  id: string
  user_id: string
  session_id: string
  is_attending: boolean
  marked_at: string
}

export interface SessionWithAttendance {
  id: string
  title: string
  start_time: string
  end_time: string
  day: number
  session_data: SessionData
  user_attendance: UserAttendance | null
  attendee_count: number
}

export interface Attendee {
  id: string
  user_id: string
  email: string
  profile: {
    name?: string
    company?: string
    job_title?: string
    bio?: string
    photo_url?: string
    interests?: string[]
    skills?: string[]
  }
}

export interface SessionAttendeesResponse {
  sessionId: string
  sessionTitle: string
  attendees: Attendee[]
  totalAttendees: number
}

export interface Session {
  id: string
  title: string
  start_time: string
  end_time: string
  day: number
  session_data: SessionData
}

export interface SessionFilters {
  day?: number
  search?: string
}

class SessionsService {
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
      const error = await response.json().catch(() => ({ detail: 'Network error' }))
      throw new Error(error.detail || `HTTP ${response.status}`)
    }

    return response.json()
  }

  



  async getSchedule(day?: number): Promise<SessionWithAttendance[]> {
    const endpoint = day 
      ? `${API_ENDPOINTS.EVENTS.SCHEDULE}?day=${day}`
      : API_ENDPOINTS.EVENTS.SCHEDULE
    
    return await this.request<SessionWithAttendance[]>(endpoint)
  }

  



  async getMySchedule(): Promise<SessionWithAttendance[]> {
    return await this.request<SessionWithAttendance[]>(API_ENDPOINTS.SESSIONS.MY_SCHEDULE)
  }

  



  async getSession(sessionId: string): Promise<SessionWithAttendance> {
    return await this.request<SessionWithAttendance>(
      API_ENDPOINTS.EVENTS.SESSION(sessionId)
    )
  }

  



  async getSessionsByDay(day: 1 | 2): Promise<SessionWithAttendance[]> {
    return this.getSchedule(day)
  }

  



  hasSessionEnded(session: Session | SessionWithAttendance): boolean {
    const endTime = new Date(session.end_time)
    return endTime < new Date()
  }

  



  async getSessionFeedbackList(sessionId: string): Promise<any[]> {
    return await this.request<any[]>(API_ENDPOINTS.SESSIONS.FEEDBACK_LIST(sessionId))
  }

  



  async searchSessions(query: string): Promise<SessionWithAttendance[]> {
    const allSessions = await this.getSchedule()
    
    if (!query) return allSessions
    
    const lowerQuery = query.toLowerCase()
    return allSessions.filter(session => {
      
      if (session.title.toLowerCase().includes(lowerQuery)) return true
      
      
      if (session.session_data?.description?.toLowerCase().includes(lowerQuery)) return true
      
      
      if (session.session_data?.speaker?.name?.toLowerCase().includes(lowerQuery)) return true
      
      
      if (session.session_data?.location?.toLowerCase().includes(lowerQuery)) return true
      
      
      if (session.session_data?.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) return true
      
      return false
    })
  }

  


  getPastSessions(sessions: SessionWithAttendance[]): SessionWithAttendance[] {
    const now = new Date()
    return sessions.filter(session => {
      const sessionEnd = new Date(session.end_time)
      return sessionEnd < now
    })
  }

  


  getUpcomingSessions(sessions: SessionWithAttendance[]): SessionWithAttendance[] {
    const now = new Date()
    return sessions.filter(session => {
      const sessionEnd = new Date(session.end_time)
      return sessionEnd >= now
    })
  }

  /**
   * Get list of attendees for a session
   */
  async getSessionAttendees(sessionId: string): Promise<SessionAttendeesResponse> {
    return await this.request<SessionAttendeesResponse>(
      `/sessions/${sessionId}/attendees`
    )
  }
}

export default new SessionsService()
