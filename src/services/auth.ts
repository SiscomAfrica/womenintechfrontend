


interface User {
  id: string
  email: string
  is_verified: boolean
  is_active: boolean
  is_admin: boolean
  profile: {
    name?: string
    job_title?: string
    company?: string
    location?: string
    bio?: string
    photo_url?: string
    interests?: string[]
  }
  profile_completed: boolean
  created_at: string
  updated_at: string
}

interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}

interface MagicLinkRequest {
  email: string
}

interface CodeVerification {
  email: string
  code: string
}

interface ProfileSetupData {
  profile: {
    name: string
    job_title?: string
    company?: string
    bio?: string
    location?: string
    photo_url?: string
    interests?: string[]
  }
  password?: string
}

class AuthService {
  private baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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

    console.log(`[AuthService] ${options.method || 'GET'} ${url}`)

    const response = await fetch(url, config)
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`
      
      try {
        const errorData = await response.json()
        errorMessage = errorData.detail || errorData.message || errorMessage
      } catch (e) {
        
        errorMessage = response.statusText || errorMessage
      }

      console.error(`[AuthService] Error: ${response.status} - ${errorMessage}`)
      
      
      const error = new Error(errorMessage)
      ;(error as any).status = response.status
      throw error
    }

    return response.json()
  }

  
  async sendMagicLink(email: string): Promise<{ message: string }> {
    const payload: MagicLinkRequest = { email }
    return this.request<{ message: string }>('/auth/send-code', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  
  async verifyMagicLink(email: string, code: string): Promise<TokenResponse> {
    const payload: CodeVerification = { email, code }
    const response = await this.request<TokenResponse>('/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    await this.storeAuthData(response)
    return response
  }

  
  async sendSignupCode(email: string): Promise<{ message: string }> {
    const payload: MagicLinkRequest = { email }
    return this.request<{ message: string }>('/auth/send-signup-code', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  
  async verifySignupCode(email: string, code: string): Promise<TokenResponse> {
    const payload: CodeVerification = { email, code }
    const response = await this.request<TokenResponse>('/auth/verify-signup-code', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    await this.storeAuthData(response)
    return response
  }

  
  async setupProfile(profileData: ProfileSetupData): Promise<User> {
    const response = await this.request<User>('/auth/setup-profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    })

    
    this.setStoredUser(response)
    return response
  }

  
  async getCurrentUser(): Promise<{ success: boolean; data?: User; message?: string }> {
    try {
      const user = await this.request<User>('/auth/me')
      this.setStoredUser(user)
      return { success: true, data: user }
    } catch (error: any) {
      console.error('[AuthService] Get current user error:', error)
      return { 
        success: false, 
        message: error.message || 'Failed to get current user' 
      }
    }
  }

  
  async refreshToken(): Promise<TokenResponse> {
    const response = await this.request<TokenResponse>('/auth/refresh', {
      method: 'POST',
    })
    
    await this.storeAuthData(response)
    return response
  }

  
  async logout(): Promise<void> {
    try {
      
      console.log('Logging out user')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.clearStoredAuth()
    }
  }

  
  isAuthenticated(): boolean {
    const token = this.getStoredToken()
    return !!token
  }

  
  isAdmin(): boolean {
    const user = this.getStoredUser()
    return !!(user && user.is_admin)
  }

  
  getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem('user')
      return userData ? JSON.parse(userData) : null
    } catch {
      return null
    }
  }

  
  getStoredToken(): string | null {
    return localStorage.getItem('token')
  }

  
  private async storeAuthData(response: TokenResponse): Promise<void> {
    const token = response.access_token
    const user = response.user
    
    if (!token) {
      throw new Error('Authentication failed: No token received')
    }
    
    if (!user) {
      throw new Error('Authentication failed: No user data received')
    }
    
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  }

  
  private setStoredUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user))
  }

  
  private clearStoredAuth(): void {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}

export default new AuthService()
export type { User, TokenResponse, ProfileSetupData }