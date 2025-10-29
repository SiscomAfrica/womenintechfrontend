




export const API_ENDPOINTS = {
  
  AUTH: {
    SEND_CODE: '/auth/send-code', 
    VERIFY_CODE: '/auth/verify-code',
    SEND_SIGNUP_CODE: '/auth/send-signup-code',
    VERIFY_SIGNUP_CODE: '/auth/verify-signup-code', 
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE_SETUP: '/auth/setup-profile',
    REFRESH_TOKEN: '/auth/refresh',
    ME: '/auth/me',
  },
  
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    UPLOAD_PHOTO: '/users/upload-photo',
    ATTENDEES: '/users/attendees',
  },
  
  EVENTS: {
    SCHEDULE: '/events/schedule',
    SESSION: (id: string) => `/events/sessions/${id}`,
  },
  
  POLLS: {
    LIST: '/polls/',
    ACTIVE: '/polls/active/',
    DETAIL: (id: string) => `/polls/${id}/`,
    SUBMIT: (id: string) => `/polls/${id}/respond/`,
    RESULTS: (id: string) => `/polls/${id}/results/`,
  },
  
  FEEDBACK: {
    SCHEMA: (sessionId: string) => `/feedback/sessions/${sessionId}/schema`,
    SUBMIT: (sessionId: string) => `/feedback/sessions/${sessionId}`,
    LIST: '/feedback/my-feedback',
  },
  
  ATTENDANCE: {
    MARK: (sessionId: string) => `/api/v1/attendance/sessions/${sessionId}/attend`,
    UPDATE: (sessionId: string) => `/api/v1/attendance/sessions/${sessionId}/attend`,
    MY_SCHEDULE: '/sessions/my-schedule',
  },
  
  NOTIFICATIONS: {
    SUMMARY: '/updates/notifications',
    LIST: '/updates/notifications/list',
    MARK_READ: '/updates/notifications/mark-read',
    MARK_ALL_READ: '/updates/notifications/mark-all-read',
    UNREAD_COUNT: '/notifications/unread-count',
  },

  SESSIONS: {
    LIST: '/sessions',
    DETAIL: (id: string) => `/sessions/${id}`,
    MY_SCHEDULE: '/sessions/my-schedule',
    FEEDBACK_LIST: (sessionId: string) => `/feedback/sessions/${sessionId}/list`,
  },

  UPDATES: {
    REALTIME: '/updates',
  },
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  SERVER_ERROR: 'Something went wrong. Please try again.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
} as const
