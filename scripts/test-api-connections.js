#!/usr/bin/env node

/**
 * Script to test API connections
 * Usage: node scripts/test-api-connections.js
 */

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8000'

const endpoints = [
  { name: 'Health Check', path: '/health', method: 'GET' },
  { name: 'API Root', path: '/', method: 'GET' },
  { name: 'Sessions', path: '/sessions', method: 'GET' },
  { name: 'Active Polls', path: '/polls/active', method: 'GET' },
  { name: 'Attendees', path: '/networking/attendees', method: 'GET' },
]

async function testEndpoint(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint.path}`, {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const status = response.status
    const success = status < 500 // Consider 4xx as "connected" but unauthorized
    
    return {
      ...endpoint,
      status,
      success,
      message: success ? 'Connected' : `HTTP ${status}`
    }
  } catch (error) {
    return {
      ...endpoint,
      success: false,
      message: error.message
    }
  }
}

async function testAllConnections() {
  console.log('🔍 Testing API Connections...')
  console.log(`API Base URL: ${API_BASE_URL}`)
  console.log('')

  const results = []
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint)
    results.push(result)
    
    const icon = result.success ? '✅' : '❌'
    const status = result.status ? ` (${result.status})` : ''
    console.log(`${icon} ${result.name}${status} - ${result.message}`)
  }

  console.log('')
  const successful = results.filter(r => r.success).length
  const total = results.length
  const rate = Math.round((successful / total) * 100)
  
  console.log(`📊 Summary: ${successful}/${total} endpoints connected (${rate}%)`)
  
  if (successful === total) {
    console.log('🎉 All API connections are working!')
  } else {
    console.log('⚠️  Some endpoints are not responding. Check your backend server.')
  }
}

testAllConnections().catch(console.error)