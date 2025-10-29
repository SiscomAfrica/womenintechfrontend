


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface APIEndpoint {
  name: string
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  requiresAuth: boolean
  description: string
}

const API_ENDPOINTS: APIEndpoint[] = [
  
  { name: 'Health Check', path: '/health', method: 'GET', requiresAuth: false, description: 'Basic health check' },
  { name: 'Root', path: '/', method: 'GET', requiresAuth: false, description: 'API root endpoint' },

  
  { name: 'Send Login Code', path: '/auth/send-code', method: 'POST', requiresAuth: false, description: 'Send magic link for login' },
  { name: 'Verify Login Code', path: '/auth/verify-code', method: 'POST', requiresAuth: false, description: 'Verify login code' },
  { name: 'Send Signup Code', path: '/auth/send-signup-code', method: 'POST', requiresAuth: false, description: 'Send signup code' },
  { name: 'Verify Signup Code', path: '/auth/verify-signup-code', method: 'POST', requiresAuth: false, description: 'Verify signup code' },
  { name: 'Current User', path: '/auth/me', method: 'GET', requiresAuth: true, description: 'Get current user' },
  { name: 'Setup Profile', path: '/auth/setup-profile', method: 'POST', requiresAuth: true, description: 'Setup user profile' },
  { name: 'Refresh Token', path: '/auth/refresh', method: 'POST', requiresAuth: true, description: 'Refresh auth token' },

  
  { name: 'Get Sessions', path: '/sessions', method: 'GET', requiresAuth: true, description: 'Get all sessions' },
  { name: 'Session Attendance', path: '/sessions/1/attendance', method: 'POST', requiresAuth: true, description: 'Toggle session attendance' },

  
  { name: 'Get Attendees', path: '/networking/attendees', method: 'GET', requiresAuth: true, description: 'Get all attendees' },
  { name: 'Search Attendees', path: '/networking/search', method: 'GET', requiresAuth: true, description: 'Search attendees' },
  { name: 'My Profile', path: '/networking/profile', method: 'GET', requiresAuth: true, description: 'Get my networking profile' },
  { name: 'Get Connections', path: '/networking/connections', method: 'GET', requiresAuth: true, description: 'Get my connections' },

  
  { name: 'Get Active Polls', path: '/polls/active', method: 'GET', requiresAuth: true, description: 'Get active polls' },
  { name: 'Get All Polls', path: '/polls', method: 'GET', requiresAuth: true, description: 'Get all polls' },

  
  { name: 'Get Feedback History', path: '/feedback/user', method: 'GET', requiresAuth: true, description: 'Get user feedback history' },

  
  { name: 'Get Notifications', path: '/notifications', method: 'GET', requiresAuth: true, description: 'Get user notifications' },

  
  { name: 'User Stats', path: '/admin/users/stats', method: 'GET', requiresAuth: true, description: 'Get user statistics' },
  { name: 'Analytics', path: '/admin/analytics', method: 'GET', requiresAuth: true, description: 'Get analytics data' },
  { name: 'Announcements', path: '/admin/announcements', method: 'GET', requiresAuth: true, description: 'Get announcements' },
]

interface TestResult {
  endpoint: APIEndpoint
  success: boolean
  status?: number
  error?: string
  responseTime?: number
}

export class APIConnectionTester {
  private token: string | null = null

  constructor() {
    this.token = localStorage.getItem('token')
  }

  async testEndpoint(endpoint: APIEndpoint): Promise<TestResult> {
    const startTime = performance.now()
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (endpoint.requiresAuth && this.token) {
        headers.Authorization = `Bearer ${this.token}`
      }

      const response = await fetch(`${API_BASE_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers,
        
        ...(endpoint.method === 'POST' && endpoint.path.includes('send-code') && {
          body: JSON.stringify({ email: 'test@example.com' })
        }),
        ...(endpoint.method === 'POST' && endpoint.path.includes('verify-code') && {
          body: JSON.stringify({ email: 'test@example.com', code: '123456' })
        }),
      })

      const responseTime = performance.now() - startTime

      return {
        endpoint,
        success: response.ok || response.status < 500, 
        status: response.status,
        responseTime,
      }
    } catch (error: any) {
      const responseTime = performance.now() - startTime
      
      return {
        endpoint,
        success: false,
        error: error.message,
        responseTime,
      }
    }
  }

  async testAllEndpoints(): Promise<TestResult[]> {
    console.log('🔍 Testing API connections...')
    console.log(`API Base URL: ${API_BASE_URL}`)
    console.log(`Auth Token: ${this.token ? 'Present' : 'Not found'}`)
    
    const results: TestResult[] = []
    
    for (const endpoint of API_ENDPOINTS) {
      const result = await this.testEndpoint(endpoint)
      results.push(result)
      
      const status = result.success ? '✅' : '❌'
      const statusCode = result.status ? ` (${result.status})` : ''
      const responseTime = result.responseTime ? ` - ${Math.round(result.responseTime)}ms` : ''
      const error = result.error ? ` - ${result.error}` : ''
      
      console.log(`${status} ${endpoint.name}${statusCode}${responseTime}${error}`)
    }

    return results
  }

  generateReport(results: TestResult[]): {
    summary: {
      total: number
      successful: number
      failed: number
      successRate: number
    }
    byCategory: Record<string, { successful: number; total: number }>
    recommendations: string[]
  } {
    const successful = results.filter(r => r.success).length
    const failed = results.length - successful
    
    
    const byCategory: Record<string, { successful: number; total: number }> = {}
    
    results.forEach(result => {
      const category = result.endpoint.path.split('/')[1] || 'root'
      if (!byCategory[category]) {
        byCategory[category] = { successful: 0, total: 0 }
      }
      byCategory[category].total++
      if (result.success) {
        byCategory[category].successful++
      }
    })

    
    const recommendations: string[] = []
    
    if (failed > 0) {
      recommendations.push(`${failed} endpoints are not responding correctly`)
    }
    
    if (!this.token) {
      recommendations.push('No authentication token found - login to test authenticated endpoints')
    }
    
    const slowEndpoints = results.filter(r => r.responseTime && r.responseTime > 2000)
    if (slowEndpoints.length > 0) {
      recommendations.push(`${slowEndpoints.length} endpoints are responding slowly (>2s)`)
    }

    const networkErrors = results.filter(r => r.error?.includes('fetch'))
    if (networkErrors.length > 0) {
      recommendations.push('Network connectivity issues detected - check API URL and network connection')
    }

    return {
      summary: {
        total: results.length,
        successful,
        failed,
        successRate: Math.round((successful / results.length) * 100)
      },
      byCategory,
      recommendations
    }
  }
}


export async function testAPIConnections(): Promise<void> {
  const tester = new APIConnectionTester()
  const results = await tester.testAllEndpoints()
  const report = tester.generateReport(results)
  
  console.log('\n📊 API Connection Report:')
  console.log(`Success Rate: ${report.summary.successRate}% (${report.summary.successful}/${report.summary.total})`)
  
  console.log('\n📋 By Category:')
  Object.entries(report.byCategory).forEach(([category, stats]) => {
    const rate = Math.round((stats.successful / stats.total) * 100)
    console.log(`  ${category}: ${rate}% (${stats.successful}/${stats.total})`)
  })
  
  if (report.recommendations.length > 0) {
    console.log('\n💡 Recommendations:')
    report.recommendations.forEach(rec => console.log(`  • ${rec}`))
  }
}


if (typeof window !== 'undefined') {
  (window as any).testAPIConnections = testAPIConnections
}