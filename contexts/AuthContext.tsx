import React, { createContext, useContext, useMemo, PropsWithChildren, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface User {
  id: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useLocalStorage<User | null>('authUser', null);

  const login = useCallback(async () => {
    try {
        const response = await fetch('/api/users', { method: 'POST' });
        if (!response.ok) {
            throw new Error('Failed to create a user session');
        }
        const { userId } = await response.json();
        if (userId) {
            setUser({ id: userId });
        }
    } catch (error) {
        console.error("Login failed:", error);
    }
  }, [setUser]);

  const logout = useCallback(() => {
    setUser(null);
  }, [setUser]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    logout,
  }), [user, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};