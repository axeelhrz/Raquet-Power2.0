// Utility for handling API requests with retry logic and rate limiting
export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: unknown) => boolean;
}

interface ErrorWithResponse {
  response?: {
    status?: number;
    [key: string]: unknown;
  };
  code?: string;
  name?: string;
  [key: string]: unknown;
}

const defaultOptions: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
  retryCondition: (error: unknown) => {
    // Retry on network errors, 429 (rate limit), and 5xx server errors
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as ErrorWithResponse).response === 'object' &&
      (error as ErrorWithResponse).response !== null &&
      (error as ErrorWithResponse).response !== undefined &&
      (error as ErrorWithResponse).response !== null &&
      typeof (error as ErrorWithResponse).response?.status !== 'undefined'
    ) {
      const status = (error as ErrorWithResponse).response?.status;
      return status === 429 || (status !== undefined && status >= 500 && status < 600);
    }
    // Retry on network errors
    return (error as ErrorWithResponse)?.code === 'NETWORK_ERROR' || (error as ErrorWithResponse)?.name === 'NetworkError';
  },
};

export const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

export const calculateDelay = (
  attempt: number, 
  baseDelay: number, 
  maxDelay: number, 
  backoffFactor: number
): number => {
  const delay = baseDelay * Math.pow(backoffFactor, attempt - 1);
  return Math.min(delay, maxDelay);
};

export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const opts = { ...defaultOptions, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if this is the last attempt
      if (attempt > opts.maxRetries) {
        break;
      }
      
      // Don't retry if the error doesn't meet retry conditions
      if (!opts.retryCondition(error)) {
        break;
      }
      
      // Calculate delay for exponential backoff
      const delay = calculateDelay(attempt, opts.baseDelay, opts.maxDelay, opts.backoffFactor);
      
      console.warn(`Request failed (attempt ${attempt}/${opts.maxRetries + 1}). Retrying in ${delay}ms...`, error);
      
      await sleep(delay);
    }
  }
  
  throw lastError;
};

// Rate limiter class to prevent too many requests
export class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly timeWindow: number;

  constructor(maxRequests: number = 10, timeWindowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }

  async waitForSlot(): Promise<void> {
    const now = Date.now();
    
    // Remove old requests outside the time window
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    // If we're at the limit, wait until the oldest request expires
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.timeWindow - (now - oldestRequest) + 100; // Add 100ms buffer
      
      if (waitTime > 0) {
        console.log(`Rate limit reached. Waiting ${waitTime}ms...`);
        await sleep(waitTime);
        return this.waitForSlot(); // Recursive call to check again
      }
    }
    
    // Add current request to the list
    this.requests.push(now);
  }
}

// Global rate limiter instance
export const globalRateLimiter = new RateLimiter(10, 60000); // 10 requests per minute

// Enhanced fetch with retry and rate limiting
export const fetchWithRetry = async (
  url: string, 
  init?: RequestInit, 
  retryOptions?: RetryOptions
): Promise<Response> => {
  // Wait for rate limiter
  await globalRateLimiter.waitForSlot();
  
  return withRetry(async () => {
    const response = await fetch(url, init);
    
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      (error as unknown as ErrorWithResponse).response = {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: response.headers,
      };
      throw error;
    }
    
    return response;
  }, retryOptions);
};