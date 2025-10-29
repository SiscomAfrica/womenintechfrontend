#!/usr/bin/env node

/**
 * Test joining a session to see if it appears in my-schedule
 */

const API_URL = 'https://apiss.siscom.tech';

async function testJoinSession() {
  console.log('🔍 Testing Session Join Functionality\n');
  
  // Get token from environment or prompt user
  const token = process.env.AUTH_TOKEN;
  
  if (!token) {
    console.log('❌ Please set AUTH_TOKEN environment variable');
    console.log('   Get your token from browser: localStorage.getItem("token")');
    console.log('   Then run: AUTH_TOKEN=your-token node test-join-session.js');
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  try {
    // Step 1: Get all sessions
    console.log('1️⃣ Getting all sessions...');
    const allSessionsResponse = await fetch(`${API_URL}/events/schedule`, { headers });
    
    if (!allSessionsResponse.ok) {
      throw new Error(`Failed to get sessions: ${allSessionsResponse.status}`);
    }
    
    const allSessions = await allSessionsResponse.json();
    console.log(`   Found ${allSessions.length} total sessions`);
    
    // Step 2: Check current my-schedule
    console.log('\n2️⃣ Checking current my-schedule...');
    const myScheduleResponse = await fetch(`${API_URL}/sessions/my-schedule`, { headers });
    
    if (!myScheduleResponse.ok) {
      throw new Error(`Failed to get my-schedule: ${myScheduleResponse.status}`);
    }
    
    const mySchedule = await myScheduleResponse.json();
    console.log(`   Currently attending ${mySchedule.length} sessions`);
    
    // Step 3: Find a session to join (not already attending)
    const unattendedSession = allSessions.find(session => 
      !session.user_attendance || !session.user_attendance.is_attending
    );
    
    if (!unattendedSession) {
      console.log('\n⚠️  All sessions are already joined!');
      return;
    }
    
    console.log(`\n3️⃣ Joining session: "${unattendedSession.title}"`);
    const joinResponse = await fetch(`${API_URL}/sessions/${unattendedSession.id}/join`, {
      method: 'POST',
      headers
    });
    
    console.log(`   Join response: ${joinResponse.status} ${joinResponse.statusText}`);
    
    if (joinResponse.ok) {
      const joinResult = await joinResponse.json();
      console.log(`   ✅ ${joinResult.message}`);
      
      // Step 4: Check my-schedule again
      console.log('\n4️⃣ Checking my-schedule after join...');
      const updatedScheduleResponse = await fetch(`${API_URL}/sessions/my-schedule`, { headers });
      
      if (updatedScheduleResponse.ok) {
        const updatedSchedule = await updatedScheduleResponse.json();
        console.log(`   Now attending ${updatedSchedule.length} sessions`);
        
        const joinedSession = updatedSchedule.find(s => s.id === unattendedSession.id);
        if (joinedSession) {
          console.log(`   ✅ Session "${joinedSession.title}" now appears in my-schedule!`);
        } else {
          console.log(`   ❌ Session not found in my-schedule - there might be an issue`);
        }
      } else {
        console.log(`   ❌ Failed to get updated schedule: ${updatedScheduleResponse.status}`);
      }
    } else {
      const errorText = await joinResponse.text();
      console.log(`   ❌ Join failed: ${errorText}`);
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  console.log('\n🎯 Summary:');
  console.log('- If join was successful but session doesn\'t appear in my-schedule,');
  console.log('  there might be an issue with the backend my-schedule endpoint');
  console.log('- Check the browser Network tab to see the actual API calls');
  console.log('- Make sure to refresh the frontend page after joining');
}

testJoinSession().catch(console.error);