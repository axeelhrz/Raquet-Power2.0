import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useAuthenticatedRequest() {
  const { refreshUser } = useAuth();

  type RequestFnWithConfig<T> = (() => Promise<T>) & {
    config?: {
      url?: string;
      method?: string;
    };
  };

  const makeRequest = useCallback(async <T>(
    requestFn: RequestFnWithConfig<T>
  ): Promise<T> => {
    try {
      const result = await requestFn();
      
      // After successful requests that might change user data (like creating a club),
      // refresh the user data to ensure we have the latest information
      const url = requestFn.config?.url || '';
      const method = requestFn.config?.method || '';

      // Refresh user data after POST/PUT/PATCH requests to user-related endpoints
      if (['post', 'put', 'patch'].includes(method.toLowerCase()) && 
          (url.includes('/clubs') || url.includes('/leagues') || url.includes('/members'))) {
        console.log('🔄 Refreshing user data after successful operation');
        await refreshUser();
      }

      return result;
    } catch (error: unknown) {
      // Let the axios interceptor handle authentication errors
      // Just re-throw the error to be handled by the calling component
      throw error;
    }
  }, [refreshUser]);

  return { makeRequest };
}