'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';

// Related entity interfaces
interface LeagueEntity {
  id: number;
  name: string;
  [key: string]: unknown;
}

interface ClubEntity {
  id: number;
  name: string;
  [key: string]: unknown;
}

interface MemberEntity {
  id: number;
  name: string;
  [key: string]: unknown;
}

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  phone: string;
  country: string;
  created_at: string;
  updated_at: string;
  // Role-specific fields
  league_name?: string;
  province?: string;
  club_name?: string;
  parent_league_id?: number;
  city?: string;
  address?: string;
  full_name?: string;
  parent_club_id?: number;
  birth_date?: string;
  gender?: string;
  // Backend entity (snake_case) references
  club_entity?: ClubEntity | null;
  member_entity?: MemberEntity | null;
  // Camel case versions for frontend compatibility
  leagueEntity?: LeagueEntity | null;
  clubEntity?: ClubEntity | null;
  memberEntity?: MemberEntity | null;
  role_info?: Record<string, unknown>;
  // Member status for waiting room
  member_status?: 'pending' | 'active' | 'inactive';
}

interface AuthResponse {
  data: {
    user: User;
    token?: string;
    role_info?: Record<string, unknown>;
  };
  message: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<User | null>;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to normalize user data from backend
// Define type that also allows optional backend snake_case properties
function normalizeUserData(userData: User & { league_entity?: LeagueEntity | null }): User {
  // Convert snake_case to camelCase for frontend compatibility
  const normalized = {
    ...userData,
    leagueEntity: userData.league_entity,
    clubEntity: userData.club_entity,
    memberEntity: userData.member_entity,
    // Set default member status for new members
    member_status: userData.member_status || (userData.role === 'miembro' ? 'pending' : undefined),
  };
  
  console.log('🔄 Normalized user data:', {
    id: normalized.id,
    name: normalized.name,
    role: normalized.role,
    member_status: normalized.member_status,
    hasLeagueEntity: !!normalized.leagueEntity,
    leagueEntityId: normalized.leagueEntity?.id,
    leagueEntityName: normalized.leagueEntity?.name,
  });
  
  return normalized;
}

// Helper functions for token management
const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

const setStoredToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  
  // Store in localStorage for client-side access
  localStorage.setItem('auth_token', token);
  
  // Store in cookies for middleware access (same-site only)
  document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  
  // Set the token in axios headers
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  console.log('🔑 Token stored in localStorage, cookies, and axios headers');
};

const removeStoredToken = (): void => {
  if (typeof window === 'undefined') return;
  
  // Remove from localStorage
  localStorage.removeItem('auth_token');
  
  // Remove from cookies
  document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  
  // Remove the token from axios headers
  delete api.defaults.headers.common['Authorization'];
  console.log('🗑️ Token removed from localStorage, cookies, and axios headers');
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      console.log('🔐 Logging in user...');
      const response = await api.post<AuthResponse>('/api/auth/login', { email, password });
      const userData = normalizeUserData(response.data.data.user);
      
      // Store the token if provided
      if (response.data.data.token) {
        setStoredToken(response.data.data.token);
        console.log('✅ Token received and stored');
      } else {
        console.warn('⚠️ No token received from login response');
      }
      
      setUser(userData);
      console.log('✅ Login successful:', userData);
      return userData;
    } catch (error) {
      console.error('❌ Login failed:', error);
      // Clear any existing token on login failure
      removeStoredToken();
      setUser(null);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🚪 Logging out user...');
      // Only call logout endpoint if we have a token
      const token = getStoredToken();
      if (token) {
        try {
          await api.post('/api/auth/logout');
        } catch (error) {
          console.error('❌ Logout API call failed:', error);
          // Continue with logout even if server request fails
        }
      }
    } finally {
      // Always clear local state and token
      removeStoredToken();
      setUser(null);
      console.log('✅ Logout successful - local state cleared');
    }
  };

  const checkAuth = async (): Promise<User | null> => {
    try {
      const token = getStoredToken();
      if (!token) {
        console.log('ℹ️ No token found, user not authenticated');
        setUser(null);
        return null;
      }

      console.log('🔍 Checking authentication with stored token...');
      // Ensure token is set in headers before making the request
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await api.get<AuthResponse>('/api/auth/me');
      const userData = normalizeUserData(response.data.data.user);
      setUser(userData);
      console.log('✅ Auth check successful:', userData);
      return userData;
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        // @ts-expect-error: error may have response property
        console.log('ℹ️ Auth check failed:', error.response?.status || error.message);
      } else {
        console.log('ℹ️ Auth check failed:', (error as Error).message);
      }
      // Clear invalid token
      removeStoredToken();
      setUser(null);
      return null;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const token = getStoredToken();
      if (!token) {
        console.log('ℹ️ No token found, cannot refresh user');
        return;
      }

      console.log('🔄 Refreshing user data...');
      // Ensure token is set in headers before making the request
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await api.get<AuthResponse>('/api/auth/me');
      const userData = normalizeUserData(response.data.data.user);
      setUser(userData);
      console.log('✅ User data refreshed:', userData);
    } catch (error: unknown) {
      console.error('❌ Failed to refresh user data:', error);
      // Don't clear token on refresh failure, just log the error
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if we have a stored token
        const token = getStoredToken();
        if (token) {
          console.log('🔑 Found stored token, verifying with server...');
          // Set token in axios headers immediately
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // Try to get user info with the stored token
          await checkAuth();
        } else {
          console.log('ℹ️ No stored token found');
          setUser(null);
        }
      } catch (error) {
        console.log('ℹ️ Initial auth check failed:', error);
        removeStoredToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Add token validation on app focus/visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        // Re-validate token when app becomes visible
        checkAuth().catch(() => {
          console.log('Token validation failed on visibility change');
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  // Set up token in axios headers when user changes
  useEffect(() => {
    const token = getStoredToken();
    if (token && user) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [user]);

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth,
    refreshUser,
    setUser: (userData: User | null) => {
      setUser(userData ? normalizeUserData(userData) : null);
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}