import axios from '@/lib/axios';

// ACTUALIZADO: Incluir club y league
export type FieldType = 
  | 'brand' 
  | 'racket_model' 
  | 'rubber_drive_model' 
  | 'rubber_back_model' 
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
    const response = await axios.post('/api/validate-custom-field', {
      field_type: fieldType,
      value: value.trim()
    });
    
    return response.data;
  } catch (error) {
    console.error('Error validating custom field:', error);
    throw new Error('Error al validar el campo personalizado');
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
    const response = await axios.post('/api/add-custom-field', {
      field_type: fieldType,
      value: value.trim()
    });
    
    return response.data;
  } catch (error) {
    console.error('Error adding custom field:', error);
    throw new Error('Error al agregar el campo personalizado');
  }
};

/**
 * Obtener opciones dinámicas para un tipo de campo
 */
export const getFieldOptions = async (fieldType: FieldType): Promise<string[]> => {
  try {
    const response = await axios.get<FieldOptionsResult>(`/api/field-options/${fieldType}`);
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