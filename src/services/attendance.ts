

export interface AttendanceCreate {
  attendance_type: 'scheduled' | 'checked_in'
  is_attending: boolean
}

export interface Attendance {
  id: string
  user_id: string
  session_id: string
  attendance_type: 'scheduled' | 'checked_in'
  is_attending: boolean
  checked_in_at?: string
  created_at: string
  updated_at: string
}

class AttendanceService {
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
      const error = await response.json().catch(() => ({ detail: 'Network error' }))
      throw new Error(error.detail || `HTTP ${response.status}`)
    }

    return response.json()
  }

  



  async markAttendance(sessionId: string, attendanceData: AttendanceCreate): Promise<Attendance> {
    return await this.request<Attendance>(`/api/v1/attendance/sessions/${sessionId}/attend`, {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    })
  }

  



  async updateAttendance(sessionId: string, attendanceData: AttendanceCreate): Promise<Attendance> {
    return await this.request<Attendance>(`/api/v1/attendance/sessions/${sessionId}/attend`, {
      method: 'PUT',
      body: JSON.stringify(attendanceData),
    })
  }

  



  async joinSession(sessionId: string): Promise<Attendance> {
    const data: AttendanceCreate = {
      attendance_type: 'scheduled',
      is_attending: true,
    }
    return this.markAttendance(sessionId, data)
  }

  



  async leaveSession(sessionId: string): Promise<Attendance> {
    const data: AttendanceCreate = {
      attendance_type: 'scheduled',
      is_attending: false,
    }
    return this.updateAttendance(sessionId, data)
  }

  



  async getMySchedule(): Promise<any[]> {
    return await this.request('/sessions/my-schedule')
  }
}

export default new AttendanceService()
