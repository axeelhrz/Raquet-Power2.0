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
  localStorage.setItem('auth_token', token);
  // Set the token in axios headers
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

const removeStoredToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  // Remove the token from axios headers
  delete api.defaults.headers.common['Authorization'];
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      console.log('🔐 Logging in user...');
      const response = await api.post<AuthResponse>('/api/auth/login', { email, password });
      const userData = normalizeUserData(response.data.data.user);
      
      // If we get a token, store it
      if (response.data.data.token) {
        setStoredToken(response.data.data.token);
      }
      
      setUser(userData);
      console.log('✅ Login successful:', userData);
      return userData;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🚪 Logging out user...');
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      // Continue with logout even if server request fails
    } finally {
      // Always clear local state and token
      removeStoredToken();
      setUser(null);
      console.log('✅ Logout successful');
    }
  };

  const checkAuth = async (): Promise<User | null> => {
    try {
      console.log('🔍 Checking authentication...');
      const response = await api.get<AuthResponse>('/api/auth/me');
      const userData = normalizeUserData(response.data.data.user);
      setUser(userData);
      console.log('✅ Auth check successful:', userData);
      return userData;
    } catch {
      console.log('ℹ️ User not authenticated');
      // Clear invalid token
      removeStoredToken();
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if we have a stored token
        const token = getStoredToken();
        if (token) {
          console.log('🔑 Found stored token, setting in axios headers');
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // Try to get user info with the stored token
          await checkAuth();
        } else {
          console.log('ℹ️ No stored token found');
        }
      } catch {
        console.log('ℹ️ Initial auth check failed');
        removeStoredToken();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth,
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