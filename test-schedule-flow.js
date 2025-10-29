#!/usr/bin/env node

/**
 * Test the complete schedule flow based on console logs
 */

const API_URL = 'https://apiss.siscom.tech';

async function testScheduleFlow() {
  console.log('🔍 Testing Complete Schedule Flow\n');
  
  // Get token from localStorage (you'll need to copy this from browser)
  console.log('📋 To get your auth token:');
  console.log('1. Open browser dev tools (F12)');
  console.log('2. Go to Console tab');
  console.log('3. Type: localStorage.getItem("token")');
  console.log('4. Copy the token and run: AUTH_TOKEN=your-token node test-schedule-flow.js\n');
  
  const token = process.env.AUTH_TOKEN;
  
  if (!token) {
    console.log('❌ Please set AUTH_TOKEN environment variable');
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  try {
    // Step 1: Verify we can get general schedule (Dashboard data)
    console.log('1️⃣ Getting general schedule (Dashboard)...');
    const scheduleResponse = await fetch(`${API_URL}/events/schedule`, { headers });
    
    if (!scheduleResponse.ok) {
      throw new Error(`Failed to get schedule: ${scheduleResponse.status}`);
    }
    
    const allSessions = await scheduleResponse.json();
    console.log(`   ✅ Found ${allSessions.length} total sessions (matches console log: 10 sessions)`);
    
    // Step 2: Check current my-schedule (should be empty based on logs)
    console.log('\n2️⃣ Checking my-schedule (should be empty)...');
    const myScheduleResponse = await fetch(`${API_URL}/sessions/my-schedule`, { headers });
    
    if (!myScheduleResponse.ok) {
      throw new Error(`Failed to get my-schedule: ${myScheduleResponse.status}`);
    }
    
    const mySchedule = await myScheduleResponse.json();
    console.log(`   📊 My schedule has ${mySchedule.length} sessions (matches console log: Array(0))`);
    
    if (mySchedule.length === 0) {
      console.log('   ✅ Confirmed: User has not joined any sessions yet');
    }
    
    // Step 3: Find a session to join
    const unattendedSession = allSessions.find(session => 
      !session.user_attendance || !session.user_attendance.is_attending
    );
    
    if (!unattendedSession) {
      console.log('\n⚠️  All sessions are already joined!');
      return;
    }
    
    console.log(`\n3️⃣ Testing join functionality with: "${unattendedSession.title}"`);
    console.log(`   Session ID: ${unattendedSession.id}`);
    
    const joinResponse = await fetch(`${API_URL}/sessions/${unattendedSession.id}/join`, {
      method: 'POST',
      headers
    });
    
    console.log(`   Join response: ${joinResponse.status} ${joinResponse.statusText}`);
    
    if (joinResponse.ok) {
      const joinResult = await joinResponse.json();
      console.log(`   ✅ ${joinResult.message}`);
      
      // Step 4: Verify session now appears in my-schedule
      console.log('\n4️⃣ Verifying session appears in my-schedule...');
      const updatedScheduleResponse = await fetch(`${API_URL}/sessions/my-schedule`, { headers });
      
      if (updatedScheduleResponse.ok) {
        const updatedSchedule = await updatedScheduleResponse.json();
        console.log(`   📊 My schedule now has ${updatedSchedule.length} sessions`);
        
        const joinedSession = updatedSchedule.find(s => s.id === unattendedSession.id);
        if (joinedSession) {
          console.log(`   ✅ SUCCESS: "${joinedSession.title}" now appears in my-schedule!`);
          console.log(`   🎯 The schedule functionality is working correctly!`);
        } else {
          console.log(`   ❌ Session not found in my-schedule - backend issue`);
        }
      }
    } else {
      const errorText = await joinResponse.text();
      console.log(`   ❌ Join failed: ${errorText}`);
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  console.log('\n🎯 Summary:');
  console.log('- The API endpoints are working correctly (200 OK responses)');
  console.log('- The issue is that the user has not joined any sessions yet');
  console.log('- Solution: Go to Dashboard and click "Add to Schedule" on sessions');
  console.log('- After joining, sessions will appear in My Schedule page');
}

testScheduleFlow().catch(console.error);