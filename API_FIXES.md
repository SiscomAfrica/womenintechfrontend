# API Connection Fixes

## Issues Fixed

### 1. **Incorrect API Paths**
**Problem**: Frontend was calling `/api/auth/send-code` but backend expects `/auth/send-code`

**Solution**: Removed `/api` prefix from all service calls to match backend routes:
- `/api/auth/*` → `/auth/*`
- `/api/sessions/*` → `/sessions/*`
- `/api/admin/*` → `/admin/*`
- etc.

### 2. **Response Format Mismatch**
**Problem**: Backend returns `access_token` but frontend expected `accessToken`

**Solution**: Updated frontend interfaces to match backend response format:
```typescript
// Before
interface TokenResponse {
  accessToken: string
  user: User
}

// After  
interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}
```

### 3. **User Data Structure Mismatch**
**Problem**: Frontend expected flat user object but backend returns nested profile structure

**Solution**: Updated User interface to match backend UserResponse:
```typescript
// Before
interface User {
  id: string
  name: string
  email: string
  // ...
}

// After
interface User {
  id: string
  email: string
  is_verified: boolean
  is_active: boolean
  profile: {
    name?: string
    job_title?: string
    company?: string
    // ...
  }
  profile_completed: boolean
  // ...
}
```

### 4. **Component Updates**
Updated all components to use the new user data structure:
- Header component: `user.name` → `user.profile?.name`
- Dashboard: Updated user display logic
- Auth store: Updated mock user creation

## Files Modified

### Services
- `web-app/src/services/auth.ts` - Fixed API paths and response format
- `web-app/src/services/sessions.ts` - Removed `/api` prefix
- `web-app/src/services/admin.ts` - Removed `/api` prefix

### Components  
- `web-app/src/components/layout/Header.tsx` - Updated user display
- `web-app/src/pages/DashboardPage.tsx` - Updated user display
- `web-app/src/stores/auth-store.ts` - Updated user interface

### Configuration
- `web-app/.env` - Set to use `https://apiss.siscom.tech`
- `web-app/.env.production` - Set to use `https://apiss.siscom.tech`
- `backend/.env` - Updated CORS to allow web app domain

## Backend API Endpoints

The correct API endpoints are:
- `POST /auth/send-code` - Send login code
- `POST /auth/verify-code` - Verify login code  
- `POST /auth/send-signup-code` - Send signup code
- `POST /auth/verify-signup-code` - Verify signup code
- `POST /auth/setup-profile` - Setup user profile
- `GET /auth/me` - Get current user
- `POST /auth/refresh` - Refresh token
- `GET /health` - Health check

## Testing

To test the API connection:
1. Start the web app: `npm run dev`
2. Check browser console for API connection test results
3. Try logging in with an email address
4. Check network tab for successful API calls

## Next Steps

1. Test login flow end-to-end
2. Verify all API endpoints are working
3. Test user profile setup
4. Ensure proper error handling