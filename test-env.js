#!/usr/bin/env node

/**
 * Test environment variable loading
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

console.log('🔍 Environment Variable Test\n')

// Read .env file
try {
  const envContent = readFileSync(resolve('.env'), 'utf8')
  console.log('📄 .env file contents:')
  console.log(envContent)
} catch (error) {
  console.log('❌ Could not read .env file:', error.message)
}

// Test what would be loaded in browser
console.log('\n🌐 What the browser would see:')
console.log('import.meta.env.VITE_API_URL would be:', process.env.VITE_API_URL || 'undefined')

// Test actual fetch
console.log('\n🧪 Testing actual API call...')

const API_URL = 'https://apiss.siscom.tech'

try {
  const response = await fetch(`${API_URL}/health`)
  if (response.ok) {
    const data = await response.json()
    console.log('✅ Direct API call successful:', data)
  } else {
    console.log('❌ API call failed:', response.status, response.statusText)
  }
} catch (error) {
  console.log('❌ API call error:', error.message)
}

console.log('\n💡 Recommendations:')
console.log('1. Restart your dev server to pick up environment changes')
console.log('2. Make sure .env file is in the web-app directory')
console.log('3. Environment variables must start with VITE_ to be available in browser')
console.log('4. Clear browser cache if issues persist')