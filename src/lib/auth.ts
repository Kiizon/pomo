import { apiClient } from './api-client';

export type User = {
  id: string;
  email: string;
  name?: string;
  picture?: string;
};

export async function signInWithGoogle(redirectPath: string = '/') {
  // Redirect to FastAPI Google OAuth endpoint
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  window.location.href = `${apiUrl}/auth/google`;
}

export async function signOut() {
  apiClient.clearToken();
  // Force reload to clear auth state
  window.location.href = '/';
}

export async function getUser(): Promise<User | null> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (!token) return null;
  
  try {
    // Decode JWT to get user info (basic client-side check)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      return JSON.parse(userInfo);
    }
    return null;
  } catch {
    return null;
  }
}

// For compatibility with auth-provider
export function onAuthChange(cb: (event: string, session: { user: User } | null) => void) {
  // Check for token in URL (OAuth callback)
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      apiClient.setToken(token);
      // Decode and store user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user: User = {
          id: payload.sub,
          email: payload.email || '',
          name: payload.name,
          picture: payload.picture
        };
        localStorage.setItem('user_info', JSON.stringify(user));
        
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
        
        // Trigger callback
        cb('SIGNED_IN', { user });
      } catch (e) {
        console.error('Failed to decode token:', e);
      }
    }
  }
  
  // Return mock subscription for compatibility
  return {
    data: {
      subscription: {
        unsubscribe: () => {}
      }
    }
  };
}
