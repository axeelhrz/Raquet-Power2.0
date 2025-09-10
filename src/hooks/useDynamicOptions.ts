import { useState, useEffect, useCallback, useRef } from 'react';

export interface DynamicOptionsHook {
  options: string[];
  isLoading: boolean;
  error: string | null;
  addOptionToList: (option: string) => void;
  refreshOptions: () => void;
}

// Cache for storing options to prevent duplicate API calls
const optionsCache = new Map<string, { data: string[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const REQUEST_DELAY = 100; // 100ms delay between requests

// Request queue to prevent rate limiting
const requestQueue: Array<() => void> = [];
let isProcessingQueue = false;

const processQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (requestQueue.length > 0) {
    const request = requestQueue.shift();
    if (request) {
      request();
      // Add delay between requests to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
    }
  }
  
  isProcessingQueue = false;
};

export const useDynamicOptions = (
  fieldType: string,
  fallbackOptions: string[] = []
): DynamicOptionsHook => {
  const [options, setOptions] = useState<string[]>(fallbackOptions);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  // Check cache first
  const getCachedOptions = useCallback((key: string) => {
    const cached = optionsCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, []);

  // Set cache
  const setCachedOptions = useCallback((key: string, data: string[]) => {
    optionsCache.set(key, { data, timestamp: Date.now() });
  }, []);

  const fetchOptions = useCallback(async () => {
    // Check cache first
    const cachedData = getCachedOptions(fieldType);
    if (cachedData) {
      setOptions(cachedData);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    const executeRequest = async () => {
      if (!mountedRef.current) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/dynamic-options/${fieldType}`, {
          signal: abortControllerRef.current?.signal,
          headers: {
            'Cache-Control': 'public, s-maxage=300', // 5 minutes cache
          },
        });

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Demasiadas solicitudes. Usando opciones por defecto.');
          }
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const newOptions = Array.isArray(data) ? data : fallbackOptions;

        if (mountedRef.current) {
          setOptions(newOptions);
          setCachedOptions(fieldType, newOptions);
          setError(null);
        }
      } catch (err) {
        if (mountedRef.current && err instanceof Error) {
          if (err.name === 'AbortError') {
            return; // Request was cancelled, don't update state
          }
          
          console.warn(`Failed to fetch options for ${fieldType}:`, err.message);
          setError(err.message);
          
          // Use fallback options on error
          if (options.length === 0) {
            setOptions(fallbackOptions);
          }
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    // Add to queue to prevent rate limiting
    requestQueue.push(executeRequest);
    processQueue();
  }, [fieldType, fallbackOptions, getCachedOptions, setCachedOptions, options.length]);

  const addOptionToList = useCallback((newOption: string) => {
    if (!newOption.trim()) return;
    
    setOptions(prevOptions => {
      const trimmedOption = newOption.trim();
      if (prevOptions.includes(trimmedOption)) {
        return prevOptions;
      }
      const updatedOptions = [...prevOptions, trimmedOption].sort();
      
      // Update cache
      setCachedOptions(fieldType, updatedOptions);
      
      return updatedOptions;
    });
  }, [fieldType, setCachedOptions]);

  const refreshOptions = useCallback(() => {
    // Clear cache for this field type
    optionsCache.delete(fieldType);
    fetchOptions();
  }, [fieldType, fetchOptions]);

  useEffect(() => {
    mountedRef.current = true;
    
    // Only fetch if we don't have options and no cached data
    if (options.length === 0 && !getCachedOptions(fieldType)) {
      fetchOptions();
    }

    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fieldType, fetchOptions, getCachedOptions, options.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    options,
    isLoading,
    error,
    addOptionToList,
    refreshOptions,
  };
};