# Schedule Debug Guide

## Issue: Schedule not showing sessions

The user reports that when they schedule sessions, they don't show up on the schedule page. Let's debug this step by step.

## Debugging Steps

### 1. **Check Frontend API Calls**

I've added debugging to the frontend. Open the browser console and look for:

```
[SchedulePage] My sessions data: [...]
[SchedulePage] Loading state: true/false
[SchedulePage] Error state: null/error
[SessionsService] Calling getMySchedule, endpoint: /sessions/my-schedule
[SessionsService] Making request to: https://apiss.siscom.tech/sessions/my-schedule
[SessionsService] Response status: 200 OK
[SessionsService] getMySchedule result: [...]
```

### 2. **Check Backend Database**

Run the backend debug script:
```bash
cd backend
python debug_schedule.py
```

This will show:
- Total sessions in database
- Total users
- Attendance records
- Whether the user has joined any sessions

### 3. **Test API Endpoints Directly**

#### Option A: Using the debug script
```bash
cd web-app
# Get your token from browser: localStorage.getItem("token")
AUTH_TOKEN=your-token-here node debug-schedule.js
```

#### Option B: Using curl
```bash
# Replace YOUR_TOKEN with actual token
curl -H "Authorization: Bearer YOUR_TOKEN" https://apiss.siscom.tech/sessions/my-schedule
```

### 4. **Test Join Session Flow**

```bash
cd web-app
AUTH_TOKEN=your-token-here node test-join-session.js
```

This will:
1. Get all available sessions
2. Check current my-schedule
3. Join an unattended session
4. Verify it appears in my-schedule

## Common Issues and Solutions

### **Issue 1: User hasn't joined any sessions**
- **Symptom**: `/sessions/my-schedule` returns empty array
- **Solution**: User needs to join sessions from Dashboard first
- **Test**: Go to Dashboard, click "Add to Schedule" on a session

### **Issue 2: Join session not working**
- **Symptom**: Join button doesn't work, or sessions don't get added
- **Check**: Browser Network tab for failed POST requests to `/sessions/{id}/join`
- **Solution**: Check backend logs for errors

### **Issue 3: API endpoint mismatch**
- **Symptom**: 404 errors in Network tab
- **Check**: Verify endpoints match between frontend and backend
- **Current endpoints**:
  - Frontend calls: `/sessions/my-schedule`
  - Backend provides: `/sessions/my-schedule`

### **Issue 4: Authentication issues**
- **Symptom**: 401 Unauthorized errors
- **Check**: Token exists in localStorage and is valid
- **Solution**: Re-login if token expired

### **Issue 5: CORS issues**
- **Symptom**: CORS errors in console
- **Status**: Should be fixed (using HTTPS)
- **Check**: Verify API URL is `https://apiss.siscom.tech`

## Expected Data Flow

1. **Dashboard Page** (`/dashboard`):
   - Calls `GET /events/schedule` 
   - Shows all sessions with join buttons
   - User clicks "Add to Schedule"
   - Calls `POST /sessions/{id}/join`

2. **My Schedule Page** (`/schedule`):
   - Calls `GET /sessions/my-schedule`
   - Shows only joined sessions
   - User can leave sessions

3. **Backend Logic**:
   - `/sessions/{id}/join` creates/updates EventAttendance record
   - `/sessions/my-schedule` queries sessions with user attendance

## Debugging Components Added

### **ScheduleDebugger Component**
Temporarily added to SchedulePage to show:
- React Query hook results
- Direct API call results
- Environment variables
- Token status

### **Console Logging**
Added to:
- `SchedulePage.tsx` - Shows data received
- `sessions.ts` - Shows API calls being made
- Backend `sessions.py` - Shows database queries

## Next Steps

1. **Open the Schedule page** (`/schedule`) in browser
2. **Check browser console** for debug output
3. **Check browser Network tab** for API calls
4. **Run backend debug script** to check database
5. **Test join functionality** from Dashboard

## Remove Debug Code

After fixing, remove:
- `<ScheduleDebugger />` from SchedulePage
- Console.log statements from services
- Debug print statements from backend

## Files Modified for Debugging

- `web-app/src/pages/SchedulePage.tsx` - Added debugging
- `web-app/src/services/sessions.ts` - Added logging
- `web-app/src/components/ScheduleDebugger.tsx` - New debug component
- `backend/debug_schedule.py` - Database debug script
- `web-app/debug-schedule.js` - API test script
- `web-app/test-join-session.js` - Join flow test script