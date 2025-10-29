#!/usr/bin/env node

/**
 * Debug script to test schedule API calls
 */

const API_URL = 'https://apiss.siscom.tech';

async function debugScheduleAPIs() {
  console.log('🔍 Debugging Schedule API Calls\n');
  
  // Get token from localStorage (you'll need to copy this from browser)
  console.log('📋 To get your auth token:');
  console.log('1. Open browser dev tools (F12)');
  console.log('2. Go to Console tab');
  console.log('3. Type: localStorage.getItem("token")');
  console.log('4. Copy the token and paste it below\n');
  
  const token = process.env.AUTH_TOKEN || 'your-token-here';
  
  if (token === 'your-token-here') {
    console.log('❌ Please set AUTH_TOKEN environment variable or update the script');
    console.log('   Example: AUTH_TOKEN=your-token-here node debug-schedule.js');
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  console.log('🔗 Testing API endpoints...\n');

  // Test 1: General schedule (what Dashboard uses)
  console.log('1️⃣ Testing /events/schedule (Dashboard)...');
  try {
    const response = await fetch(`${API_URL}/events/schedule`, { headers });
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Found ${data.length} total sessions`);
      
      if (data.length > 0) {
        console.log(`   📋 Sample session:`, {
          id: data[0].id,
          title: data[0].title,
          day: data[0].day,
          user_attendance: data[0].user_attendance ? 'Has attendance' : 'No attendance'
        });
        
        // Count sessions by day
        const day1 = data.filter(s => s.day === 1).length;
        const day2 = data.filter(s => s.day === 2).length;
        console.log(`   📊 Day 1: ${day1} sessions, Day 2: ${day2} sessions`);
        
        // Count attended sessions
        const attended = data.filter(s => s.user_attendance?.is_attending).length;
        console.log(`   👤 User is attending: ${attended} sessions`);
      }
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Error: ${errorText}`);
    }
  } catch (error) {
    console.log(`   ❌ Network error: ${error.message}`);
  }

  console.log('\n2️⃣ Testing /sessions/my-schedule (My Schedule page)...');
  try {
    const response = await fetch(`${API_URL}/sessions/my-schedule`, { headers });
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Found ${data.length} sessions in my schedule`);
      
      if (data.length > 0) {
        console.log(`   📋 Sample session:`, {
          id: data[0].id,
          title: data[0].title,
          day: data[0].day,
          attendee_count: data[0].attendee_count
        });
      } else {
        console.log('   ⚠️  My schedule is empty - user hasn\'t joined any sessions');
      }
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Error: ${errorText}`);
    }
  } catch (error) {
    console.log(`   ❌ Network error: ${error.message}`);
  }

  // Test 3: Try to join a session
  console.log('\n3️⃣ Testing session join functionality...');
  try {
    // First get available sessions
    const scheduleResponse = await fetch(`${API_URL}/events/schedule`, { headers });
    if (scheduleResponse.ok) {
      const sessions = await scheduleResponse.json();
      const unattendedSession = sessions.find(s => !s.user_attendance?.is_attending);
      
      if (unattendedSession) {
        console.log(`   🎯 Trying to join: "${unattendedSession.title}"`);
        
        const joinResponse = await fetch(`${API_URL}/sessions/${unattendedSession.id}/join`, {
          method: 'POST',
          headers
        });
        
        console.log(`   Join Status: ${joinResponse.status} ${joinResponse.statusText}`);
        
        if (joinResponse.ok) {
          const result = await joinResponse.json();
          console.log(`   ✅ Join successful: ${result.message}`);
          
          // Now test my-schedule again
          console.log('   🔄 Checking my-schedule after join...');
          const myScheduleResponse = await fetch(`${API_URL}/sessions/my-schedule`, { headers });
          if (myScheduleResponse.ok) {
            const mySchedule = await myScheduleResponse.json();
            console.log(`   📊 My schedule now has: ${mySchedule.length} sessions`);
          }
        } else {
          const errorText = await joinResponse.text();
          console.log(`   ❌ Join failed: ${errorText}`);
        }
      } else {
        console.log('   ⚠️  All sessions are already joined');
      }
    }
  } catch (error) {
    console.log(`   ❌ Join test error: ${error.message}`);
  }

  console.log('\n🎯 Summary:');
  console.log('- /events/schedule should show all sessions with attendance status');
  console.log('- /sessions/my-schedule should show only joined sessions');
  console.log('- POST /sessions/{id}/join should add session to my-schedule');
  console.log('- Check browser Network tab for actual API calls');
}

debugScheduleAPIs().catch(console.error);