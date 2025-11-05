// Meeting Request Types
export interface MeetingRequest {
  id: string
  requester_id: string
  receiver_id: string
  proposed_time: string
  location?: string
  message?: string
  status: 'pending' | 'accepted' | 'declined' | 'cancelled'
  response_message?: string
  responded_at?: string
  created_at: string
  updated_at: string
  requester?: UserBrief
  receiver?: UserBrief
}

export interface UserBrief {
  id: string
  email: string
  name?: string
  photo_url?: string
  company?: string
  job_title?: string
}

export interface MeetingRequestList {
  requests: MeetingRequest[]
  total: number
  sent_count: number
  received_count: number
  accepted_count: number
  pending_count: number
}

export interface CreateMeetingRequest {
  receiver_id: string
  proposed_time: string
  location?: string
  message?: string
}

export interface UpdateMeetingRequest {
  status: 'accepted' | 'declined'
  response_message?: string
}

class MeetingService {
  private baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  private getStoredToken(): string | null {
    return localStorage.getItem('token')
  }

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
    const token = this.getStoredToken()
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    console.log(`[MeetingService] ${options.method || 'GET'} ${url}`)

    const response = await fetch(url, config)
    
    if (response.status === 401) {
      this.handle401()
      throw new Error('Unauthorized - Session expired')
    }
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`
      
      try {
        const errorData = await response.json()
        errorMessage = errorData.detail || errorData.message || errorMessage
      } catch (e) {
        errorMessage = response.statusText || errorMessage
      }

      console.error(`[MeetingService] Error: ${response.status} - ${errorMessage}`)
      
      const error = new Error(errorMessage)
      ;(error as any).status = response.status
      throw error
    }

    return response.json()
  }

  /**
   * Create a new meeting request
   */
  async createMeetingRequest(data: CreateMeetingRequest): Promise<MeetingRequest> {
    return this.request<MeetingRequest>('/meetings', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Get all meeting requests for the current user
   * @param status - Filter by status: pending, accepted, declined, cancelled
   * @param requestType - Filter by type: sent, received
   */
  async getMeetingRequests(
    status?: string,
    requestType?: string
  ): Promise<MeetingRequestList> {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (requestType) params.append('request_type', requestType)
    
    const queryString = params.toString()
    const endpoint = queryString ? `/meetings?${queryString}` : '/meetings'
    
    return this.request<MeetingRequestList>(endpoint)
  }

  /**
   * Get a specific meeting request by ID
   */
  async getMeetingRequest(meetingId: string): Promise<MeetingRequest> {
    return this.request<MeetingRequest>(`/meetings/${meetingId}`)
  }

  /**
   * Accept a meeting request
   */
  async acceptMeetingRequest(
    meetingId: string,
    responseMessage?: string
  ): Promise<MeetingRequest> {
    const params = responseMessage 
      ? `?response_message=${encodeURIComponent(responseMessage)}`
      : ''
    
    return this.request<MeetingRequest>(`/meetings/${meetingId}/accept${params}`, {
      method: 'PUT',
    })
  }

  /**
   * Decline a meeting request
   */
  async declineMeetingRequest(
    meetingId: string,
    responseMessage?: string
  ): Promise<MeetingRequest> {
    const params = responseMessage 
      ? `?response_message=${encodeURIComponent(responseMessage)}`
      : ''
    
    return this.request<MeetingRequest>(`/meetings/${meetingId}/decline${params}`, {
      method: 'PUT',
    })
  }

  /**
   * Cancel a meeting request (for requesters)
   */
  async cancelMeetingRequest(meetingId: string): Promise<MeetingRequest> {
    return this.request<MeetingRequest>(`/meetings/${meetingId}`, {
      method: 'DELETE',
    })
  }
}

export const meetingService = new MeetingService()
