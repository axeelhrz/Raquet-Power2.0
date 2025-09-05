import { useState, useEffect, useCallback } from 'react';
import { getFieldOptions, type FieldType } from '@/utils/customFieldValidation';

interface UseDynamicOptionsReturn {
  options: string[];
  isLoading: boolean;
  error: string | null;
  refreshOptions: () => Promise<void>;
  addOptionToList: (newOption: string) => void;
}

export const useDynamicOptions = (
  fieldType: FieldType,
  staticOptions: string[] = []
): UseDynamicOptionsReturn => {
  const [options, setOptions] = useState<string[]>(staticOptions);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshOptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const dynamicOptions = await getFieldOptions(fieldType);
      
      // Combinar opciones estáticas con dinámicas y eliminar duplicados
      const combinedOptions = Array.from(new Set([...staticOptions, ...dynamicOptions]));
      combinedOptions.sort();
      
      setOptions(combinedOptions);
    } catch (err) {
      console.error('Error loading dynamic options:', err);
      setError('Error al cargar opciones dinámicas');
      // En caso de error, usar solo las opciones estáticas
      setOptions(staticOptions);
    } finally {
      setIsLoading(false);
    }
  }, [fieldType, staticOptions]);

  const addOptionToList = useCallback((newOption: string) => {
    setOptions(prevOptions => {
      // Verificar si la opción ya existe (case-insensitive)
      const exists = prevOptions.some(
        option => option.toLowerCase() === newOption.toLowerCase()
      );
      
      if (exists) {
        return prevOptions;
      }
      
      // Agregar nueva opción y ordenar
      const updatedOptions = [...prevOptions, newOption];
      updatedOptions.sort();
      return updatedOptions;
    });
  }, []);

  // Cargar opciones dinámicas al montar el componente
  useEffect(() => {
    refreshOptions();
  }, [refreshOptions]);

  return {
    options,
    isLoading,
    error,
    refreshOptions,
    addOptionToList
  };
};