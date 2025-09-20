import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
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
    token?: string;
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
  const { login } = useAuth();

  const signIn = async (data: SignInData): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 Starting sign in process...');
      console.log('📝 Sign in data:', { ...data, password: '[HIDDEN]' });

      // Use the login method from AuthContext which handles token storage
      const user = await login(data.email, data.password);
      
      console.log('✅ Login successful, redirecting based on role:', user.role);

      // Add a small delay to ensure token is properly set
      await new Promise(resolve => setTimeout(resolve, 100));

      // Redirect based on role
      const role = user.role;
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
    } catch (err: unknown) {
      console.error('❌ Sign in failed:', err);
      
      if (axios.isAxiosError(err)) {
        const data: ErrorResponse | undefined = err.response?.data;
        if (data?.message) {
          setError(data.message);
        } else if (data?.errors) {
          const errors = data.errors;
          const errorMessages = Object.values(errors).flatMap(e => Array.isArray(e) ? e : [e]);
          setError(errorMessages.join(', '));
        } else {
          setError(err.message || 'Error de conexión. Verifica tu conexión a internet.');
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error inesperado. Por favor, intenta de nuevo.');
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