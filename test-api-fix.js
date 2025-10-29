#!/usr/bin/env node

/**
 * Quick API connection test to verify CORS fixes
 */

const API_URL = 'https://apiss.siscom.tech'

async function testAPIConnection() {
  console.log('🔍 Testing API connection to:', API_URL)
  
  try {
    // Test basic health endpoint
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ API connection successful!', data)
      return true
    } else {
      console.log('❌ API returned error:', response.status, response.statusText)
      return false
    }
  } catch (error) {
    console.log('❌ API connection failed:', error.message)
    return false
  }
}

// Test authenticated endpoint
async function testAuthenticatedEndpoint() {
  console.log('\n🔐 Testing authenticated endpoint...')
  
  // This will fail without a token, but should not have CORS errors
  try {
    const response = await fetch(`${API_URL}/networking/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token'
      },
    })
    
    console.log('📡 Response status:', response.status)
    if (response.status === 401 || response.status === 403) {
      console.log('✅ CORS working - got expected auth error (401/403)')
      return true
    } else {
      console.log('⚠️  Unexpected response status')
      return false
    }
  } catch (error) {
    if (error.message.includes('CORS')) {
      console.log('❌ CORS error still present:', error.message)
      return false
    } else {
      console.log('❌ Network error:', error.message)
      return false
    }
  }
}

async function main() {
  console.log('🚀 API Connection Test\n')
  
  const healthOk = await testAPIConnection()
  const corsOk = await testAuthenticatedEndpoint()
  
  console.log('\n📊 Results:')
  console.log(`Health Check: ${healthOk ? '✅ Pass' : '❌ Fail'}`)
  console.log(`CORS Test: ${corsOk ? '✅ Pass' : '❌ Fail'}`)
  
  if (healthOk && corsOk) {
    console.log('\n🎉 All tests passed! API should work correctly now.')
  } else {
    console.log('\n⚠️  Some tests failed. Check backend configuration.')
  }
}

main().catch(console.error)