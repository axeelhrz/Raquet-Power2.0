import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Get the backend URL from environment variables
const getBackendUrl = (): string => {
  // In production (Vercel), use the environment variable
  if (process.env.NODE_ENV === 'production') {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-40b3.up.railway.app';
    // Ensure the URL has the protocol
    return backendUrl.startsWith('http') ? backendUrl : `https://${backendUrl}`;
  }
  
  // In development, use local backend or environment variable
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';
};

const api = axios.create({
  baseURL: `${getBackendUrl()}/api`,
  withCredentials: false, // Disable cookies for cross-origin requests
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Request queue to prevent too many simultaneous requests
const requestQueue = new Map<string, Promise<AxiosResponse>>();

// Function to create a request key for deduplication
const createRequestKey = (config: AxiosRequestConfig | InternalAxiosRequestConfig): string => {
  return `${config.method?.toUpperCase()}-${config.url}-${JSON.stringify(config.params || {})}`;
};

// Function to get stored auth token
const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
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
  async (config: InternalAxiosRequestConfig) => {
    // Validate URL parameters to prevent undefined values
    if (config.url?.includes('undefined')) {
      console.error('🚨 Request URL contains undefined parameter:', config.url);
      throw new Error('Invalid request: URL contains undefined parameter');
    }
    
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
    
    // Request deduplication for GET requests - we can't return a promise here
    // This will be handled in the makeRequest function instead
    if (config.method?.toLowerCase() === 'get') {
      const requestKey = createRequestKey(config);
      
      if (requestQueue.has(requestKey)) {
        console.log('🔄 Request already in progress:', requestKey);
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
  (response) => {
    // Log successful responses for debugging
    console.log('✅ Request successful:', response.status, response.config.url);
    
    // Remove from request queue if it was a GET request
    if (response.config.method?.toLowerCase() === 'get') {
      const requestKey = createRequestKey(response.config);
      requestQueue.delete(requestKey);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Remove from request queue if it was a GET request
    if (originalRequest?.method?.toLowerCase() === 'get') {
      const requestKey = createRequestKey(originalRequest);
      requestQueue.delete(requestKey);
    }
    
    // Log the error for debugging
    console.error('🚨 API Error:', {
      status: error.response?.status,
      url: originalRequest ? `${originalRequest.baseURL}${originalRequest.url}` : 'unknown',
      message: error.message,
      data: error.response?.data
    });
    
    // Handle network errors
    if (error.code === 'ERR_NETWORK' || error.code === 'ERR_INSUFFICIENT_RESOURCES') {
      console.error('🌐 Network error detected:', error.code);
      // Check if it's a CORS error
      if (error.message.includes('CORS') || error.message.includes('Access-Control-Allow-Origin')) {
        return Promise.reject(new Error('Error de CORS. Verifica la configuración del servidor.'));
      }
      return Promise.reject(new Error('Error de conexión. Por favor, intenta de nuevo.'));
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('⏰ Request timeout');
      return Promise.reject(new Error('La solicitud tardó demasiado. Por favor, intenta de nuevo.'));
    }
    
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
    
    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.log('🚨 404 Not Found - resource not found');
      // Don't redirect, let the component handle this
    }
    
    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      console.log('🚨 500 Internal Server Error - server error');
      // Don't redirect, let the component handle this
    }
    
    return Promise.reject(error);
  }
);

// Enhanced request function with retry logic for critical requests
export const makeRequest = async (config: AxiosRequestConfig, retries = 0): Promise<AxiosResponse> => {
  try {
    // Validate config before making request
    if (config.url?.includes('undefined')) {
      throw new Error('Invalid request: URL contains undefined parameter');
    }
    
    // For GET requests, check if we already have this request in progress
    if (config.method?.toLowerCase() === 'get') {
      const requestKey = createRequestKey(config);
      
      if (requestQueue.has(requestKey)) {
        return await requestQueue.get(requestKey)!;
      }
      
      // Add to queue
      const requestPromise = api(config);
      requestQueue.set(requestKey, requestPromise);
      
      try {
        const result = await requestPromise;
        requestQueue.delete(requestKey);
        return result;
      } catch (error) {
        requestQueue.delete(requestKey);
        throw error;
      }
    }
    
    return await api(config);
  } catch (error: unknown) {
    // Don't retry if the error is due to invalid parameters
    if (error instanceof Error && error.message?.includes('undefined parameter')) {
      throw error;
    }
    
    // Retry logic for network errors
    if (
      retries < 2 && 
      error instanceof Error &&
      ('code' in error && (error.code === 'ERR_NETWORK' || error.code === 'ERR_INSUFFICIENT_RESOURCES'))
    ) {
      console.log(`🔄 Retrying request (attempt ${retries + 1}/2)`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1))); // Exponential backoff
      return makeRequest(config, retries + 1);
    }
    
    throw error;
  }
};

export default api;