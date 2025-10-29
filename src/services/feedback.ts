import type { 
  FeedbackCreate,
  FeedbackUpdate,
  FeedbackResponse,
  FeedbackListResponse,
  FeedbackSchemaResponse,
  SessionFeedbackSummary,
  FeedbackValidationRequest,
  FeedbackValidationResponse
} from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface ServiceResponse<T> {
  success: boolean
  data?: T
  message?: string
}

class FeedbackService {
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

  async getFeedbackSchema(sessionId: string): Promise<ServiceResponse<FeedbackSchemaResponse>> {
    try {
      const data = await this.request<FeedbackSchemaResponse>(`/feedback/sessions/${sessionId}/schema`)
      return { success: true, data }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Failed to fetch feedback schema' 
      }
    }
  }

  async validateFeedback(
    sessionId: string,
    responses: { [key: string]: any }
  ): Promise<ServiceResponse<FeedbackValidationResponse>> {
    try {
      const requestData: FeedbackValidationRequest = {
        session_id: sessionId,
        responses
      }
      const data = await this.request<FeedbackValidationResponse>(
        `/feedback/sessions/${sessionId}/validate`,
        {
          method: 'POST',
          body: JSON.stringify(requestData),
        }
      )
      return { success: true, data }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Failed to validate feedback' 
      }
    }
  }

  async submitFeedback(
    sessionId: string,
    responses: { [key: string]: any }
  ): Promise<ServiceResponse<FeedbackResponse>> {
    try {
      const data: FeedbackCreate = { responses }
      const result = await this.request<FeedbackResponse>(
        `/feedback/sessions/${sessionId}`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      )
      return { success: true, data: result }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Failed to submit feedback' 
      }
    }
  }

  async updateFeedback(
    sessionId: string,
    responses: { [key: string]: any }
  ): Promise<ServiceResponse<FeedbackResponse>> {
    try {
      const data: FeedbackUpdate = { responses }
      const result = await this.request<FeedbackResponse>(
        `/feedback/sessions/${sessionId}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        }
      )
      return { success: true, data: result }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Failed to update feedback' 
      }
    }
  }

  async getUserFeedback(sessionId: string): Promise<ServiceResponse<FeedbackResponse>> {
    try {
      const data = await this.request<FeedbackResponse>(`/feedback/sessions/${sessionId}`)
      return { success: true, data }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Failed to fetch user feedback' 
      }
    }
  }

  async getSessionFeedbackSummary(sessionId: string): Promise<ServiceResponse<SessionFeedbackSummary>> {
    try {
      const data = await this.request<SessionFeedbackSummary>(`/feedback/sessions/${sessionId}/summary`)
      return { success: true, data }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Failed to fetch feedback summary' 
      }
    }
  }

  async getUserFeedbackHistory(
    skip: number = 0,
    limit: number = 100
  ): Promise<ServiceResponse<FeedbackListResponse>> {
    try {
      const params = new URLSearchParams()
      params.append('skip', String(skip))
      params.append('limit', String(limit))

      const data = await this.request<FeedbackListResponse>(`/feedback/user?${params.toString()}`)
      return { success: true, data }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Failed to fetch feedback history' 
      }
    }
  }

  async deleteFeedback(sessionId: string): Promise<ServiceResponse<{ message: string }>> {
    try {
      const data = await this.request<{ message: string }>(
        `/feedback/sessions/${sessionId}`,
        { method: 'DELETE' }
      )
      return { success: true, data }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Failed to delete feedback' 
      }
    }
  }
}

export default new FeedbackService()