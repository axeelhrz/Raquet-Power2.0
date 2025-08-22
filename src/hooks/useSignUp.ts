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
    role_info: RoleInfo;
  };
  message: string;
}

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

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
        setUser(response.data.data.user);
        const role = response.data.data.user.role;

        switch (role) {
          case 'super_admin':
            router.push('/dashboard');
            break;
          case 'liga':
            router.push('/dashboard/liga');
            break;
          case 'club':
            router.push('/dashboard/club');
            break;
          case 'miembro':
            // Redirect members to waiting room after successful registration
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