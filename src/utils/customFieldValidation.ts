import axios from '@/lib/axios';

export interface ValidationResult {
  is_duplicate: boolean;
  suggested_value: string;
  message: string;
  match_type?: 'exact' | 'partial';
  all_suggestions?: string[];
}

export interface FieldSuggestions {
  suggestions: string[];
  total_count: number;
}

export interface AddFieldResult {
  success: boolean;
  message: string;
  field?: Record<string, unknown>;
  was_new?: boolean;
}

// ACTUALIZADO: Marcas comparten listado, modelos son independientes
export type FieldType = 
  | 'brand'  // Marcas compartidas entre palo, drive y back
  | 'racket_model'  // Modelos específicos de raqueta/palo
  | 'drive_rubber_model'  // Modelos específicos de caucho drive
  | 'backhand_rubber_model'  // Modelos específicos de caucho back
  | 'drive_rubber_hardness'  // Hardness específico de drive
  | 'backhand_rubber_hardness';  // Hardness específico de back

export const getFieldDisplayName = (fieldType: FieldType): string => {
  const displayNames: Record<FieldType, string> = {
    'brand': 'Marca',
    'racket_model': 'Modelo de Raqueta',
    'drive_rubber_model': 'Modelo de Caucho Drive',
    'backhand_rubber_model': 'Modelo de Caucho Back',
    'drive_rubber_hardness': 'Hardness Drive',
    'backhand_rubber_hardness': 'Hardness Back'
  };
  return displayNames[fieldType];
};

// NUEVO: Función para agregar campo personalizado inmediatamente
export const addCustomField = async (
  fieldType: FieldType,
  value: string
): Promise<AddFieldResult | null> => {
  if (!value || value.trim().length < 2) {
    return null;
  }

  try {
    const response = await axios.post('/api/add-custom-field', {
      field_type: fieldType,
      value: value.trim()
    });

    return response.data;
  } catch (error) {
    console.error('Error adding custom field:', error);
    return {
      success: false,
      message: 'Error al agregar campo personalizado'
    };
  }
};

// NUEVO: Función para obtener opciones dinámicas
export const getFieldOptions = async (
  fieldType: FieldType
): Promise<string[] | null> => {
  try {
    const response = await axios.get(`/api/field-options/${fieldType}`);
    return response.data.options || [];
  } catch (error) {
    console.error('Error getting field options:', error);
    return null;
  }
};

// Función para validar campos personalizados contra la base de datos
export const validateCustomField = async (
  fieldType: FieldType,
  value: string
): Promise<ValidationResult | null> => {
  if (!value || value.trim().length < 2) {
    return null;
  }

  try {
    const response = await axios.post('/api/validate-custom-field', {
      field_type: fieldType,
      value: value.trim()
    });

    return response.data;
  } catch (error) {
    console.error('Error validating custom field:', error);
    return null;
  }
};

// Función para obtener sugerencias de un campo
export const getFieldSuggestions = async (
  fieldType: FieldType,
  query: string = ''
): Promise<FieldSuggestions | null> => {
  try {
    const response = await axios.get(`/api/field-suggestions/${fieldType}`, {
      params: { query: query.trim() }
    });

    return response.data;
  } catch (error) {
    console.error('Error getting field suggestions:', error);
    return null;
  }
};

// Función debounce para evitar demasiadas consultas
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