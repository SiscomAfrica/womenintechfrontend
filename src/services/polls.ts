import type {
  Poll,
  PollListResponse,
  ActivePollsResponse,
  PollResponseCreate,
  PollResponseUpdate,
  PollResponse,
  PollResults
} from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// CACHE BUSTER: Force browser to reload this file - v5.0
console.log('🔄 Polls service loaded - FIXED VERSION v5 (Clean console - no more 404 noise)')

interface ServiceResponse<T> {
  success: boolean
  data?: T
  message?: string
}

class PollService {
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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('token')

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-App': 'womenintech',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    if (response.status === 401) {
      this.handle401()
      throw new Error('Unauthorized - Session expired')
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Special request method for my-response that handles expected 404s gracefully
  private async requestMyResponse<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T | null> {
    const token = localStorage.getItem('token')

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-App': 'womenintech',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    if (response.status === 401) {
      this.handle401()
      throw new Error('Unauthorized - Session expired')
    }

    // Handle expected 404 for my-response (user hasn't voted yet)
    if (response.status === 404) {
      const errorData = await response.json().catch(() => ({}))
      if (errorData.detail?.includes('No response found')) {
        // This is expected - user hasn't responded to this poll yet
        return null
      }
      // Other 404s should still throw
      throw new Error(errorData.detail || 'Not found')
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getActivePolls(sessionId?: string): Promise<ServiceResponse<ActivePollsResponse>> {
    try {
      const params = sessionId ? `?session_id=${sessionId}` : ''
      const data = await this.request<ActivePollsResponse>(`/polls/active/${params}`)
      return { success: true, data }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to fetch active polls'
      }
    }
  }

  async getPolls(
    sessionId?: string,
    isActive?: boolean,
    skip: number = 0,
    limit: number = 100
  ): Promise<ServiceResponse<PollListResponse>> {
    try {
      const params = new URLSearchParams()
      if (sessionId) params.append('session_id', sessionId)
      if (isActive !== undefined) params.append('is_active', String(isActive))
      params.append('skip', String(skip))
      params.append('limit', String(limit))

      const data = await this.request<PollListResponse>(`/polls/?${params.toString()}`)
      return { success: true, data }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to fetch polls'
      }
    }
  }

  async getPoll(pollId: string): Promise<ServiceResponse<Poll>> {
    try {
      const data = await this.request<Poll>(`/polls/${pollId}`)
      return { success: true, data }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to fetch poll'
      }
    }
  }

  async submitPollResponse(
    pollId: string,
    responses: { [key: string]: string | number | string[] }
  ): Promise<ServiceResponse<PollResponse>> {
    try {
      const data: PollResponseCreate = { responses }
      const result = await this.request<PollResponse>(`/polls/${pollId}/respond`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return { success: true, data: result }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to submit poll response'
      }
    }
  }

  async updateResponse(
    pollId: string,
    responses: { [key: string]: string | number | string[] }
  ): Promise<ServiceResponse<PollResponse>> {
    try {
      const data: PollResponseUpdate = { responses }
      const result = await this.request<PollResponse>(`/polls/${pollId}/respond`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      return { success: true, data: result }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to update poll response'
      }
    }
  }

  async getPollResults(pollId: string): Promise<ServiceResponse<PollResults>> {
    try {
      const data = await this.request<PollResults>(`/polls/${pollId}/results`)
      return { success: true, data }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to fetch poll results'
      }
    }
  }

  async getMyPollResponse(pollId: string): Promise<ServiceResponse<PollResponse>> {
    try {
      const data = await this.requestMyResponse<PollResponse>(`/polls/${pollId}/my-response`)
      
      // If data is null, it means user hasn't responded yet (expected 404)
      if (data === null) {
        return {
          success: false,
          message: 'No response found for this poll'
        }
      }
      
      return { success: true, data }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to fetch poll response'
      }
    }
  }
}

export default new PollService()