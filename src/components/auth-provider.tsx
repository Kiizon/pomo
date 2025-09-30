"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { User, getUser, onAuthChange } from '@/lib/auth';

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // First check if there's a token in the URL (OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const hasTokenInUrl = urlParams.has('token');

    if (hasTokenInUrl) {
      // Let onAuthChange handle it
      const { data: { subscription } } = onAuthChange((_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    }

    // Check current session from localStorage
    getUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    return undefined;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
