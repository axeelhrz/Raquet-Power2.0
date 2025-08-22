import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Function to get CSRF token from cookie
const getCsrfTokenFromCookie = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  const name = 'XSRF-TOKEN';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const token = parts.pop()?.split(';').shift();
    return token ? decodeURIComponent(token) : null;
  }
  return null;
};

// Function to get CSRF token
const getCsrfToken = async (): Promise<void> => {
  try {
    await axios.get(`${baseURL}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
    throw error;
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
    // For non-GET requests, ensure we have a CSRF token (except for exempt endpoints)
    if (config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase())) {
      // Skip CSRF token for exempt endpoints
      if (!isCSRFExempt(config.url || '')) {
        try {
          // First, try to get CSRF token from cookie
          let csrfToken = getCsrfTokenFromCookie();
          
          // If no token in cookie, fetch it
          if (!csrfToken) {
            await getCsrfToken();
            csrfToken = getCsrfTokenFromCookie();
          }
          
          // Add CSRF token to headers
          if (csrfToken) {
            config.headers['X-XSRF-TOKEN'] = csrfToken;
          }
        } catch (error) {
          console.error('Failed to get CSRF token:', error);
        }
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 419 CSRF token mismatch (only for non-exempt endpoints)
    if (error.response?.status === 419 && !originalRequest._retry && !isCSRFExempt(originalRequest.url || '')) {
      originalRequest._retry = true;
      
      try {
        // Get fresh CSRF token
        await getCsrfToken();
        
        // Get the new token from cookie and add to headers
        const csrfToken = getCsrfTokenFromCookie();
        if (csrfToken) {
          originalRequest.headers['X-XSRF-TOKEN'] = csrfToken;
        }
        
        // Retry the original request
        return api(originalRequest);
      } catch (csrfError) {
        console.error('Failed to refresh CSRF token:', csrfError);
        return Promise.reject(error);
      }
    }
    
    // Handle 401 Unauthorized - only redirect for non-auth endpoints
    if (error.response?.status === 401) {
      // Only redirect if it's not an auth endpoint and we're in the browser
      if (!originalRequest.url?.includes('/api/auth/') && typeof window !== 'undefined') {
        // Avoid infinite redirects by checking current location
        if (!window.location.pathname.startsWith('/auth/')) {
          console.log('401 error detected, redirecting to login');
          window.location.href = '/auth/sign-in';
        }
      }
    }
    
    // Only log non-auth related errors to reduce noise
    if (error.response?.status !== 401 || originalRequest.url?.includes('/api/auth/me')) {
      console.error('API Error:', error.response?.status, error.response?.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;