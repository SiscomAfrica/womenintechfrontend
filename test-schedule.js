#!/usr/bin/env node

/**
 * Test schedule functionality
 */

const API_URL = 'https://apiss.siscom.tech';

async function testScheduleEndpoints() {
  console.log('🔍 Testing Schedule Endpoints\n');
  
  // You'll need to get a real token by logging in first
  const token = 'your-auth-token-here'; // Replace with actual token
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Test 1: Get general schedule
  console.log('1️⃣ Testing /events/schedule...');
  try {
    const response = await fetch(`${API_URL}/events/schedule`, { headers });
    if (response.ok) {
      const data = await response.json();
      console.log('✅ General schedule:', data.length, 'sessions found');
      if (data.length > 0) {
        console.log('   First session:', data[0].title);
      }
    } else {
      console.log('❌ General schedule failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ General schedule error:', error.message);
  }

  // Test 2: Get my schedule
  console.log('\n2️⃣ Testing /sessions/my-schedule...');
  try {
    const response = await fetch(`${API_URL}/sessions/my-schedule`, { headers });
    if (response.ok) {
      const data = await response.json();
      console.log('✅ My schedule:', data.length, 'sessions found');
      if (data.length > 0) {
        console.log('   First session:', data[0].title);
      }
    } else {
      console.log('❌ My schedule failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ My schedule error:', error.message);
  }

  // Test 3: Try to join a session (if we have sessions)
  console.log('\n3️⃣ Testing session join...');
  try {
    // First get a session to join
    const scheduleResponse = await fetch(`${API_URL}/events/schedule`, { headers });
    if (scheduleResponse.ok) {
      const sessions = await scheduleResponse.json();
      if (sessions.length > 0) {
        const sessionId = sessions[0].id;
        console.log(`   Trying to join session: ${sessions[0].title}`);
        
        const joinResponse = await fetch(`${API_URL}/sessions/${sessionId}/join`, {
          method: 'POST',
          headers
        });
        
        if (joinResponse.ok) {
          const result = await joinResponse.json();
          console.log('✅ Successfully joined session:', result.message);
        } else {
          console.log('❌ Failed to join session:', joinResponse.status, joinResponse.statusText);
        }
      } else {
        console.log('⚠️  No sessions available to join');
      }
    }
  } catch (error) {
    console.log('❌ Session join error:', error.message);
  }

  console.log('\n💡 Instructions:');
  console.log('1. Replace "your-auth-token-here" with a real token');
  console.log('2. Get a token by logging into the web app and checking localStorage');
  console.log('3. Or use browser dev tools: localStorage.getItem("token")');
  console.log('4. Make sure the backend has test data (run backend/create_test_data.py)');
}

testScheduleEndpoints().catch(console.error);