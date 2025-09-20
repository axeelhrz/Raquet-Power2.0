'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

interface SignUpData {
  email: string;
  password: string;
  password_confirmation: string;
  role: string;
  phone: string;
  country: string;
  // Liga fields
  league_name?: string;
  province?: string;
  logo_path?: string;
  // Club fields
  club_name?: string;
  parent_league_id?: string;
  city?: string;
  address?: string;
  ruc?: string;
  google_maps_url?: string;
  description?: string;
  founded_date?: string;
  representative_name?: string;
  representative_phone?: string;
  representative_email?: string;
  admin1_name?: string;
  admin1_phone?: string;
  admin1_email?: string;
  admin2_name?: string;
  admin2_phone?: string;
  admin2_email?: string;
  admin3_name?: string;
  admin3_phone?: string;
  admin3_email?: string;
  // Member fields
  full_name?: string;
  parent_club_id?: string;
  birth_date?: string;
  gender?: string;
  rubber_type?: string;
  ranking?: string;
  photo_path?: string;
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
  rubber_type?: string;
  ranking?: string;
  logo_path?: string;
  photo_path?: string;
}

type BaseRoleInfo = {
  type: string;
  name?: string;
};

type LeagueRoleInfo = BaseRoleInfo & {
  league_name: string;
  province?: string;
  logo_path?: string;
};

type ClubRoleInfo = BaseRoleInfo & {
  club_name: string;
  parent_league_id: number;
  city?: string;
  address?: string;
  logo_path?: string;
};

type MemberRoleInfo = BaseRoleInfo & {
  full_name: string;
  parent_club_id: number;
  birth_date?: string;
  gender?: string;
  rubber_type?: string;
  ranking?: string;
  photo_path?: string;
};

type RoleInfo = LeagueRoleInfo | ClubRoleInfo | MemberRoleInfo | BaseRoleInfo;

interface SignUpResponse {
  data: {
    user: User;
    token?: string;
    role_info: RoleInfo;
  };
  message: string;
}

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

// Helper functions for token management
const setStoredToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  
  // Store in localStorage for client-side access
  localStorage.setItem('auth_token', token);
  
  // Store in cookies for middleware access
  document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  
  // Set the token in axios headers
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  console.log('🔑 Token stored in localStorage, cookies, and axios headers');
};

export const useSignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setUser } = useAuth();

  const signUp = async (data: SignUpData): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 Starting sign up process...');
      console.log('📝 Sign up data:', { ...data, password: '[HIDDEN]', password_confirmation: '[HIDDEN]' });

      const response = await api.post<SignUpResponse>('/api/auth/register', data);
      console.log('✅ Registration successful:', response.data);

      if (response.data.data.user) {
        // Store the token if provided (for automatic login after registration)
        if (response.data.data.token) {
          setStoredToken(response.data.data.token);
          console.log('✅ Token received and stored - user automatically logged in');
        } else {
          console.warn('⚠️ No token received from registration response');
        }

        // Set user in context
        setUser(response.data.data.user);
        const role = response.data.data.user.role;

        console.log(`🎯 Redirecting ${role} to appropriate dashboard...`);

        // Redirect based on role - clubs go directly to dashboard
        switch (role) {
          case 'super_admin':
            router.push('/dashboard');
            break;
          case 'liga':
            router.push('/dashboard/liga');
            break;
          case 'club':
            console.log('🏢 Club registered successfully - redirecting to club dashboard');
            router.push('/dashboard/club');
            break;
          case 'miembro':
            // Redirect members to waiting room after successful registration
            console.log('👤 Member registered successfully - redirecting to waiting room');
            router.push('/waiting-room');
            break;
          default:
            router.push('/dashboard');
        }
      }
    } catch (err: unknown) {
      console.error('❌ Sign up error:', err);

      if (axios.isAxiosError(err)) {
        const data = err.response?.data as ApiErrorResponse | undefined;
        if (data?.message) {
          setError(data.message);
        } else if (data?.errors) {
          const errorMessages = Object.values(data.errors).flat();
          setError(errorMessages.join(', '));
        } else {
          setError(err.message || 'Registration failed. Please try again.');
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    signUp,
    isLoading,
    error,
    clearError,
  };
};