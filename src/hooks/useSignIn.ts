import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import api from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';

interface SignInData {
  email: string;
  password: string;
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

interface RoleInfo {
  type: string;
  name?: string;
  [key: string]: string | number | boolean | null | undefined;
}

interface SignInResponse {
  data: {
    user: User;
    role_info: RoleInfo;
  };
  message: string;
}

interface ErrorResponse {
  message?: string;
  errors?: Record<string, string[] | string>;
  [key: string]: unknown;
}

export const useSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setUser } = useAuth();

  const signIn = async (data: SignInData): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 Starting sign in process...');
      console.log('📝 Sign in data:', { ...data, password: '[HIDDEN]' });

      // Make the login request to the correct endpoint
      const response = await api.post<SignInResponse>('/api/auth/login', data);
      
      console.log('✅ Login successful:', response.data);

      // Set user in context
      if (response.data.data.user) {
        setUser(response.data.data.user);
        
        // Redirect based on role
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
            router.push('/dashboard/miembro');
            break;
          default:
            router.push('/dashboard');
            break;
        }
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data: ErrorResponse | undefined = err.response?.data;
        if (data?.message) {
          setError(data.message);
        } else if (data?.errors) {
          const errors = data.errors;
            const errorMessages = Object.values(errors).flatMap(e => Array.isArray(e) ? e : [e]);
          setError(errorMessages.join(', '));
        } else {
          setError(err.message || 'Login failed. Please try again.');
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    signIn,
    isLoading,
    error,
    clearError,
  };
};