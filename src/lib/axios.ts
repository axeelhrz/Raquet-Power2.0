import axios from 'axios';

// Get the backend URL from environment variables
const getBackendUrl = (): string => {
  // In production (Vercel), use the environment variable
  if (process.env.NODE_ENV === 'production') {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-40b3.up.railway.app';
    // Ensure the URL has the protocol
    return backendUrl.startsWith('http') ? backendUrl : `https://${backendUrl}`;
  }
  
  // In development, use local backend or environment variable
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
};

const api = axios.create({
  baseURL: getBackendUrl(),
  withCredentials: false, // Disable cookies for cross-origin requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Function to get CSRF token from cookie
const getCsrfTokenFromCookie = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const name = 'XSRF-TOKEN';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const token = parts.pop()?.split(';').shift();
    return token ? decodeURIComponent(token) : null;
  }
  return null;
};

// Function to get stored auth token
const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

// Function to get CSRF token using the backend URL
const getCsrfToken = async (): Promise<void> => {
  try {
    const backendUrl = getBackendUrl();
    await axios.get(`${backendUrl}/sanctum/csrf-cookie`, {
      withCredentials: false, // Don't use cookies for CSRF in cross-origin
      headers: {
        'Accept': 'application/json',
      },
    });
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
    // Don't throw error for CSRF token failures in cross-origin setup
  }
};

// List of endpoints that don't require CSRF tokens
const csrfExemptEndpoints = [
  '/api/registro-rapido',
  '/api/auth/register',
  '/api/auth/login',
  '/sanctum/csrf-cookie'
];

// Check if URL is exempt from CSRF
const isCSRFExempt = (url: string): boolean => {
  return csrfExemptEndpoints.some(endpoint => url.includes(endpoint));
};

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Log the request URL for debugging
    console.log('🌐 Making request to:', `${config.baseURL}${config.url}`);
    console.log('🔧 Backend URL:', getBackendUrl());
    console.log('🌍 Environment:', process.env.NODE_ENV);
    
    // Always add the auth token if available
    const token = getStoredToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Added auth token to request');
    }
    
    // For cross-origin requests, skip CSRF tokens as they don't work reliably
    // The backend should be configured to not require CSRF for API endpoints
    // when using token-based authentication
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log('✅ Request successful:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log the error for debugging
    console.error('🚨 API Error:', {
      status: error.response?.status,
      url: `${originalRequest.baseURL}${originalRequest.url}`,
      message: error.message,
      data: error.response?.data
    });
    
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      console.log('🚨 401 Unauthorized - clearing token and redirecting');
      
      // Clear the invalid token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        delete api.defaults.headers.common['Authorization'];
      }
      
      // Only redirect if it's not an auth endpoint and we're in the browser
      if (!originalRequest.url?.includes('/api/auth/') && typeof window !== 'undefined') {
        // Avoid infinite redirects by checking current location
        if (!window.location.pathname.startsWith('/auth/')) {
          console.log('🔄 Redirecting to login');
          window.location.href = '/auth/sign-in';
        }
      }
    }
    
    // Handle 403 Forbidden - insufficient permissions
    if (error.response?.status === 403) {
      console.log('🚨 403 Forbidden - insufficient permissions');
      // Don't redirect, let the component handle this
    }
    
    return Promise.reject(error);
  }
);

export default api;