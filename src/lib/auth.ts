import { apiClient } from './api-client';

export type User = {
  id: string;
  email: string;
  name?: string;
  picture?: string;
};

export async function signInWithGoogle() {
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
      console.log('Found token in URL, processing...');
      apiClient.setToken(token);
      // Decode and store user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Decoded JWT payload:', payload);
        
        const user: User = {
          id: payload.sub,
          email: payload.email || '',
          name: payload.name,
          picture: payload.picture
        };
        localStorage.setItem('user_info', JSON.stringify(user));
        console.log('Stored user info:', user);
        
        // Trigger callback BEFORE cleaning URL
        cb('SIGNED_IN', { user });
        
        // Clean URL after a small delay to ensure state updates
        setTimeout(() => {
          window.history.replaceState({}, '', window.location.pathname);
        }, 100);
      } catch (e) {
        console.error('Failed to decode token:', e);
        cb('SIGNED_OUT', null);
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
