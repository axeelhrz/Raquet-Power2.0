import { useState, useEffect, useCallback, useRef } from 'react';
import { getFieldOptions, type FieldType } from '@/utils/customFieldValidation';

export interface DynamicOptionsHook {
  options: string[];
  isLoading: boolean;
  error: string | null;
  addOptionToList: (option: string) => void;
  refreshOptions: () => void;
}

// Cache for storing options to prevent duplicate API calls
const optionsCache = new Map<string, { data: string[]; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // Aumentado a 10 minutos para mejor persistencia
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

// Función para persistir opciones en localStorage como backup
const persistOptionsToStorage = (fieldType: string, options: string[]) => {
  try {
    if (typeof window !== 'undefined') {
      const key = `dynamic_options_${fieldType}`;
      const data = {
        options,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (error) {
    console.warn('Failed to persist options to localStorage:', error);
  }
};

// Función para recuperar opciones de localStorage
const getPersistedOptions = (fieldType: string): string[] | null => {
  try {
    if (typeof window !== 'undefined') {
      const key = `dynamic_options_${fieldType}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const data = JSON.parse(stored);
        // Verificar que los datos no sean muy antiguos (1 hora)
        if (Date.now() - data.timestamp < 60 * 60 * 1000) {
          return data.options;
        }
      }
    }
  } catch (error) {
    console.warn('Failed to get persisted options from localStorage:', error);
  }
  return null;
};

export const useDynamicOptions = (
  fieldType: FieldType,
  fallbackOptions: string[] = []
): DynamicOptionsHook => {
  // Inicializar con opciones persistidas si están disponibles
  const persistedOptions = getPersistedOptions(fieldType);
  const [options, setOptions] = useState<string[]>(persistedOptions || fallbackOptions);
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
    // También persistir en localStorage
    persistOptionsToStorage(key, data);
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
        console.log('Fetching options for field type:', fieldType);
        
        const newOptions = await getFieldOptions(fieldType);
        
        console.log('Received options:', newOptions);

        if (mountedRef.current) {
          const finalOptions = Array.isArray(newOptions) && newOptions.length > 0 
            ? newOptions 
            : fallbackOptions;
          
          setOptions(finalOptions);
          setCachedOptions(fieldType, finalOptions);
          setError(null);
        }
      } catch (err) {
        if (mountedRef.current && err instanceof Error) {
          if (err.name === 'AbortError') {
            return; // Request was cancelled, don't update state
          }
          
          console.warn(`Failed to fetch options for ${fieldType}:`, err.message);
          setError(err.message);
          
          // Intentar usar opciones persistidas como fallback
          const persistedFallback = getPersistedOptions(fieldType);
          if (persistedFallback && persistedFallback.length > 0) {
            console.log('Using persisted options as fallback');
            setOptions(persistedFallback);
          } else if (options.length === 0) {
            // Solo usar fallback si no tenemos opciones
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
      
      // Update cache and persist
      setCachedOptions(fieldType, updatedOptions);
      
      console.log(`Added new option "${trimmedOption}" to ${fieldType} list`);
      
      return updatedOptions;
    });
  }, [fieldType, setCachedOptions]);

  const refreshOptions = useCallback(() => {
    // Clear cache for this field type
    optionsCache.delete(fieldType);
    // También limpiar localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`dynamic_options_${fieldType}`);
    }
    fetchOptions();
  }, [fieldType, fetchOptions]);

  useEffect(() => {
    mountedRef.current = true;
    
    // Solo fetch si no tenemos opciones y no hay datos en cache o persistidos
    const hasPersistedData = getPersistedOptions(fieldType);
    const hasCachedData = getCachedOptions(fieldType);
    
    if (options.length === 0 && !hasCachedData && !hasPersistedData) {
      fetchOptions();
    } else if (hasPersistedData && options.length === 0) {
      // Si tenemos datos persistidos pero no opciones, usarlos
      setOptions(hasPersistedData);
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