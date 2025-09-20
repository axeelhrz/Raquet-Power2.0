import axios from '@/lib/axios';
import { isAxiosError } from 'axios';

// ACTUALIZADO: Incluir club y league - CORREGIDO: nombres de campos para coincidir con backend
export type FieldType = 
  | 'brand' 
  | 'racket_model' 
  | 'drive_rubber_model'  // Corregido: era 'rubber_drive_model'
  | 'backhand_rubber_model'  // Corregido: era 'rubber_back_model'
  | 'drive_rubber_hardness' 
  | 'backhand_rubber_hardness'
  | 'club'
  | 'league';

export interface ValidationResult {
  is_duplicate: boolean;
  suggested_value: string;
  message: string;
  match_type: 'exact' | 'partial' | null;
  source: 'custom_fields' | 'registrations' | null;
  all_suggestions?: string[];
}

export interface AddFieldResult {
  success: boolean;
  message: string;
  field: {
    id: number;
    field_type: string;
    value: string;
    normalized_value: string;
    usage_count: number;
    first_used_at: string;
    last_used_at: string;
    created_at: string;
    updated_at: string;
  };
  was_new: boolean;
}

export interface FieldOptionsResult {
  success: boolean;
  options: string[];
  predefined_count: number;
  custom_count: number;
  total_count: number;
}

/**
 * Validar un campo personalizado contra la base de datos
 */
export const validateCustomField = async (
  fieldType: FieldType, 
  value: string
): Promise<ValidationResult> => {
  try {
    console.log('Validando campo:', { fieldType, value });
    
    const response = await axios.post('/api/validate-custom-field', {
      field_type: fieldType,
      value: value.trim()
    });
    
    console.log('Respuesta de validación:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error validating custom field:', error);
    
    // Si hay un error de red o del servidor, devolver un resultado que permita agregar el campo
    return {
      is_duplicate: false,
      suggested_value: value,
      message: 'Error al validar, pero puedes agregar el campo',
      match_type: null,
      source: null
    };
  }
};

/**
 * Agregar un campo personalizado a la base de datos
 */
export const addCustomField = async (
  fieldType: FieldType, 
  value: string
): Promise<AddFieldResult> => {
  try {
    console.log('Agregando campo:', { fieldType, value });
    
    const response = await axios.post('/api/add-custom-field', {
      field_type: fieldType,
      value: value.trim()
    });
    
    console.log('Respuesta de agregar campo:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding custom field:', error);
    
    if (isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 'Error al agregar el campo personalizado';
      throw new Error(errorMessage);
    }
    
    throw new Error('Error al agregar el campo personalizado');
  }
};

/**
 * Obtener opciones dinámicas para un tipo de campo
 */
export const getFieldOptions = async (fieldType: FieldType): Promise<string[]> => {
  try {
    console.log('Obteniendo opciones para:', fieldType);
    
    const response = await axios.get<FieldOptionsResult>(`/api/field-options/${fieldType}`);
    
    console.log('Opciones obtenidas:', response.data);
    return response.data.options;
  } catch (error) {
    console.error('Error getting field options:', error);
    return [];
  }
};

/**
 * Función de debounce para evitar demasiadas llamadas a la API
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};