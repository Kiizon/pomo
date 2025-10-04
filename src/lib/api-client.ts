// FastAPI Backend Client
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  }

  // Auth
  async verifyGoogleToken(googleToken: string) {
    const data = await this.request('/auth/token/verify', {
      method: 'POST',
      body: JSON.stringify({ google_token: googleToken }),
    });
    this.setToken(data.access_token);
    return data.user;
  }

  getGoogleAuthUrl() {
    return `${API_URL}/auth/google`;
  }

  // Sessions
  async createSession(data: {
    started_at: string;
    duration_min: number;
    kind: 'work' | 'break';
  }) {
    return this.request('/sessions/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRecentSessions(limit = 10) {
    return this.request(`/sessions/recent?limit=${limit}`);
  }

  async getTodayTotal() {
    const data = await this.request('/sessions/today/total');
    return data.total_minutes;
  }

  async getHeatmapData(days = 90) {
    return this.request(`/sessions/stats/heatmap?days=${days}`);
  }

  // Friends
  async getFriends() {
    return this.request('/friends/');
  }

  async sendFriendRequest(receiverEmail: string) {
    return this.request('/friends/request', {
      method: 'POST',
      body: JSON.stringify({ receiver_email: receiverEmail }),
    });
  }

  async getIncomingRequests() {
    return this.request('/friends/requests/incoming');
  }

  async acceptFriendRequest(requestId: string) {
    return this.request(`/friends/request/${requestId}/accept`, {
      method: 'POST',
    });
  }

  async rejectFriendRequest(requestId: string) {
    return this.request(`/friends/request/${requestId}/reject`, {
      method: 'POST',
    });
  }

  async searchUsers(email: string) {
    return this.request(`/friends/search?email=${encodeURIComponent(email)}`);
  }

  async unfriend(friendId: string) {
    return this.request(`/friends/${friendId}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
