const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Handle 401 unauthorized responses globally
const handle401 = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  
  // Show notification
  const event = new CustomEvent('auth:unauthorized', {
    detail: { message: 'Your session has expired. Please login again.' }
  })
  window.dispatchEvent(event)
  
  setTimeout(() => {
    window.location.href = '/login'
  }, 1500)
}

const apiClient = {
  async get(endpoint: string) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Client-App': 'womenintech',
      },
    })
    if (response.status === 401) {
      handle401()
      throw new Error('Unauthorized - Session expired')
    }
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return { data: await response.json() }
  },
  
  async post(endpoint: string, data: any) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Client-App': 'womenintech',
      },
      body: JSON.stringify(data),
    })
    if (response.status === 401) {
      handle401()
      throw new Error('Unauthorized - Session expired')
    }
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return { data: await response.json() }
  },
  
  async put(endpoint: string, data: any) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Client-App': 'womenintech',
      },
      body: JSON.stringify(data),
    })
    if (response.status === 401) {
      handle401()
      throw new Error('Unauthorized - Session expired')
    }
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return { data: await response.json() }
  },
}

export interface UserProfile {
  name?: string;
  company?: string;
  job_title?: string;
  bio?: string;
  photo_url?: string;
  linkedin_url?: string;
  twitter_handle?: string;
  interests?: string[];
  skills?: string[];
}

export interface Attendee {
  id: string;
  user_id: string;
  email?: string;
  profile: UserProfile;
  match_indicator?: {
    score: number;
    shared_interests: string[];
    match_level: string;
  };
  has_common_interests?: boolean;
  
  // Flat properties for compatibility (may be added by hooks)
  displayName?: string;
  initials?: string;
  matchPercentage?: number;
  connectionStatus?: string;
  isConnected?: boolean;
  
  // These might come from profile or be flattened
  interests?: string[];
  skills?: string[];
  jobTitle?: string;
  company?: string;
  bio?: string;
  profilePhoto?: string;
}

export interface AttendeesResponse {
  attendees: Attendee[];
  total: number;
  limit: number;
  offset: number;
}

export interface User {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  company?: string;
  jobTitle?: string;
  bio?: string;
  profilePhoto?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  interests: string[];
  skills: string[];
  lookingFor: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface AttendeeFilters {
  search?: string;
  company?: string;
  jobTitle?: string;
  skills?: string[];
  interests?: string[];
}

export interface ConnectionRequest {
  userId: string;
  message?: string;
}

export interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  user?: User;
  connectedUser?: User;
}

class NetworkingService {
  async getAttendees(
    limit: number = 20,
    offset: number = 0,
    search?: string
  ): Promise<AttendeesResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (search) {
      params.append('search', search);
    }

    const response = await apiClient.get(`/networking/attendees?${params}`);
    return response.data;
  }

  async searchAttendees(
    query: string,
    _filters?: AttendeeFilters
  ): Promise<AttendeesResponse> {
    return this.getAttendees(20, 0, query);
  }

  async getUserProfile(userId: string): Promise<User> {
    const response = await apiClient.get(`/networking/users/${userId}`);
    return response.data;
  }

  async getMyProfile(): Promise<User> {
    const response = await apiClient.get('/networking/profile');
    return response.data;
  }

  async updateMyProfile(profileData: Partial<User>): Promise<User> {
    const response = await apiClient.put('/networking/profile', profileData);
    return response.data;
  }

  async sendConnectionRequest(userId: string, message?: string): Promise<{ message: string }> {
    const response = await apiClient.post(`/networking/connect/${userId}`, { message });
    return response.data;
  }

  async getConnections(
    page: number = 1,
    size: number = 20
  ): Promise<PaginatedResponse<Connection>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    const response = await apiClient.get(`/networking/connections?${params}`);
    return response.data;
  }

  
  calculateMatchPercentage(user: User, currentUser: User): number {
    if (!currentUser.interests.length && !currentUser.skills.length) {
      return Math.floor(Math.random() * 40) + 30; 
    }

    const userInterests = new Set(user.interests);
    const userSkills = new Set(user.skills);
    const currentUserInterests = new Set(currentUser.interests);
    const currentUserSkills = new Set(currentUser.skills);

    const commonInterests = [...userInterests].filter(x => currentUserInterests.has(x)).length;
    const commonSkills = [...userSkills].filter(x => currentUserSkills.has(x)).length;

    const totalUserTags = userInterests.size + userSkills.size;
    const totalCurrentUserTags = currentUserInterests.size + currentUserSkills.size;
    const commonTags = commonInterests + commonSkills;

    if (totalUserTags === 0 || totalCurrentUserTags === 0) {
      return Math.floor(Math.random() * 40) + 30;
    }

    const matchScore = (commonTags * 2) / (totalUserTags + totalCurrentUserTags);
    return Math.min(Math.max(Math.floor(matchScore * 100), 25), 95);
  }

  
  getUserDisplayName(user: User): string {
    return `${user.firstName} ${user.lastName}`.trim();
  }

  
  getUserInitials(user: User): string {
    const firstName = user.firstName?.charAt(0)?.toUpperCase() || '';
    const lastName = user.lastName?.charAt(0)?.toUpperCase() || '';
    return `${firstName}${lastName}` || '?';
  }
}

export const networkingService = new NetworkingService();