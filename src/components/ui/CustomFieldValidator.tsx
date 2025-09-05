import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateCustomField, addCustomField, debounce, type FieldType, type ValidationResult, type AddFieldResult } from '@/utils/customFieldValidation';

interface CustomFieldValidatorProps {
  fieldType: FieldType;
  value: string;
  onValidationResult: (result: ValidationResult | null) => void;
  onSuggestionAccepted: (suggestedValue: string) => void;
  onFieldAdded?: (fieldType: FieldType, value: string) => void;
  isVisible: boolean;
  currentOptions?: string[]; // NUEVO: Lista actual de opciones en el desplegable
}

const CustomFieldValidator: React.FC<CustomFieldValidatorProps> = ({
  fieldType,
  value,
  onValidationResult,
  onSuggestionAccepted,
  onFieldAdded,
  isVisible,
  currentOptions = []
}) => {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // NUEVO: Referencias para evitar validaciones redundantes
  const lastValidatedValue = useRef<string>('');
  const lastValidatedFieldType = useRef<FieldType | null>(null);
  const currentOptionsRef = useRef<string[]>([]);

  // Función para validar contra la lista actual
  const validateAgainstCurrentOptions = (inputValue: string): ValidationResult | null => {
    if (!inputValue || inputValue.trim().length < 2) return null;
    
    const normalizedInput = inputValue.toLowerCase().trim();
    
    // Buscar coincidencia exacta en la lista actual
    const exactMatch = currentOptions.find(option => 
      option.toLowerCase().trim() === normalizedInput
    );
    
    if (exactMatch) {
      return {
        is_duplicate: true,
        suggested_value: exactMatch,
        message: `"${exactMatch}" ya está disponible en la lista`,
        match_type: 'exact',
        source: 'custom_fields',
        all_suggestions: [exactMatch]
      };
    }
    
    // Buscar coincidencias parciales en la lista actual
    const partialMatches = currentOptions.filter(option =>
      option.toLowerCase().includes(normalizedInput) && 
      option.toLowerCase() !== normalizedInput
    );
    
    if (partialMatches.length > 0) {
      return {
        is_duplicate: false,
        suggested_value: partialMatches[0],
        message: `¿Quisiste decir "${partialMatches[0]}"?`,
        match_type: 'partial',
        source: 'custom_fields',
        all_suggestions: partialMatches.slice(0, 5)
      };
    }
    
    return null;
  };

  // OPTIMIZADO: Función debounced para validar con verificación de cambios
  const debouncedValidate = debounce(async (...args: unknown[]) => {
    const [fieldType, value, currentOptions] = args as [FieldType, string, string[]];
    
    // NUEVO: Verificar si realmente necesitamos validar
    const normalizedValue = value?.trim() || '';
    const optionsChanged = JSON.stringify(currentOptions) !== JSON.stringify(currentOptionsRef.current);
    
    // Si el valor y el tipo de campo no han cambiado, y las opciones tampoco, no validar
    if (
      normalizedValue === lastValidatedValue.current && 
      fieldType === lastValidatedFieldType.current &&
      !optionsChanged
    ) {
      return;
    }
    
    // Si el valor está vacío o es muy corto, limpiar validación
    if (!normalizedValue || normalizedValue.length < 2) {
      setValidationResult(null);
      onValidationResult(null);
      lastValidatedValue.current = normalizedValue;
      lastValidatedFieldType.current = fieldType;
      currentOptionsRef.current = [...currentOptions];
      return;
    }

    // Actualizar referencias antes de validar
    lastValidatedValue.current = normalizedValue;
    lastValidatedFieldType.current = fieldType;
    currentOptionsRef.current = [...currentOptions];

    setIsValidating(true);
    
    try {
      // PRIMERO: Validar contra la lista actual (más rápido)
      const localValidation = validateAgainstCurrentOptions(normalizedValue);
      
      if (localValidation) {
        setValidationResult(localValidation);
        onValidationResult(localValidation);
        setIsValidating(false);
        return;
      }
      
      // SEGUNDO: Si no está en la lista actual, validar contra la base de datos
      const result = await validateCustomField(fieldType, normalizedValue);
      setValidationResult(result);
      onValidationResult(result);
    } catch (error) {
      console.error('Error validating field:', error);
      setValidationResult(null);
      onValidationResult(null);
    } finally {
      setIsValidating(false);
    }
  }, 800);

  // OPTIMIZADO: Validar cuando cambie el valor, pero con verificaciones inteligentes
  useEffect(() => {
    if (isVisible && value) {
      debouncedValidate(fieldType, value, currentOptions);
    } else {
      // Solo limpiar si realmente hay algo que limpiar
      if (validationResult !== null) {
        setValidationResult(null);
        onValidationResult(null);
      }
      // Actualizar referencias incluso cuando no es visible
      lastValidatedValue.current = '';
      lastValidatedFieldType.current = fieldType;
      currentOptionsRef.current = [...currentOptions];
    }
    // Limpiar mensaje de éxito cuando cambie el valor
    if (successMessage) {
      setSuccessMessage(null);
    }
  }, [fieldType, value, isVisible]); // REMOVIDO: currentOptions de las dependencias

  // NUEVO: Efecto separado para manejar cambios en currentOptions
  useEffect(() => {
    const optionsChanged = JSON.stringify(currentOptions) !== JSON.stringify(currentOptionsRef.current);
    
    // Solo revalidar si las opciones cambiaron Y tenemos un valor para validar
    if (optionsChanged && isVisible && value && value.trim().length >= 2) {
      // Pequeño delay para evitar validaciones excesivas
      const timeoutId = setTimeout(() => {
        debouncedValidate(fieldType, value, currentOptions);
      }, 200);
      
      return () => clearTimeout(timeoutId);
    } else if (optionsChanged) {
      // Solo actualizar la referencia si no hay valor que validar
      currentOptionsRef.current = [...currentOptions];
    }
  }, [currentOptions, fieldType, value, isVisible]);

  // Función para agregar campo cuando el usuario confirma
  const handleConfirmAdd = async () => {
    if (!value || value.trim().length < 2) return;

    setIsAdding(true);
    try {
      const result = await addCustomField(fieldType, value);
      
      if (result?.success) {
        // Campo agregado exitosamente
        setValidationResult(null);
        onValidationResult(null);
        
        // Mostrar mensaje de éxito
        setSuccessMessage(`"${value}" se agregó exitosamente al listado`);
        
        // Notificar al componente padre para actualizar el desplegable
        if (onFieldAdded) {
          onFieldAdded(fieldType, value);
        }
        
        // Limpiar mensaje de éxito después de 4 segundos
        setTimeout(() => {
          setSuccessMessage(null);
        }, 4000);
        
        console.log('Campo agregado:', result.message);
      } else {
        console.error('Error al agregar campo:', result?.message);
      }
    } catch (error) {
      console.error('Error adding field:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleAcceptSuggestion = (suggestion: string) => {
    onSuggestionAccepted(suggestion);
    setValidationResult(null);
    setSuccessMessage(null);
    // Actualizar referencias para evitar revalidación innecesaria
    lastValidatedValue.current = suggestion;
  };

  if (!isVisible || (!validationResult && !isValidating && !successMessage)) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="mt-2"
      >
        {/* Mensaje de éxito */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-2"
          >
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
              <p className="text-xs text-green-600 mt-1">
                Ya está disponible en el desplegable para su selección
              </p>
            </div>
          </motion.div>
        )}

        {isValidating && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-sm text-blue-700 font-medium">Validando...</span>
          </div>
        )}

        {isAdding && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="animate-spin w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
            <span className="text-sm text-green-700 font-medium">Agregando al listado...</span>
          </div>
        )}

        {validationResult && (
          <div className={`p-3 rounded-lg border ${
            validationResult.is_duplicate 
              ? 'bg-yellow-50 border-yellow-200' 
              : validationResult.match_type === 'partial'
              ? 'bg-blue-50 border-blue-200'
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">
                {validationResult.is_duplicate ? (
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                ) : validationResult.match_type === 'partial' ? (
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  validationResult.is_duplicate 
                    ? 'text-yellow-800' 
                    : validationResult.match_type === 'partial'
                    ? 'text-blue-800'
                    : 'text-green-800'
                }`}>
                  {validationResult.message}
                </p>

                {/* Mostrar sugerencias para duplicados y coincidencias parciales */}
                {(validationResult.is_duplicate || validationResult.match_type === 'partial') && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-600 font-medium mb-2">
                      {validationResult.is_duplicate 
                        ? "Esta opción ya está disponible:"
                        : "¿Quisiste decir alguna de estas opciones?"
                      }
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => handleAcceptSuggestion(validationResult.suggested_value)}
                        className={`px-3 py-1 text-xs rounded-md transition-colors font-medium ${
                          validationResult.is_duplicate
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
                        {validationResult.suggested_value}
                      </button>
                      
                      {/* Sugerencias adicionales */}
                      {validationResult.all_suggestions && validationResult.all_suggestions.length > 1 && 
                        validationResult.all_suggestions.slice(1, 3).map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleAcceptSuggestion(suggestion)}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))
                      }
                    </div>
                  </div>
                )}

                {/* Botón de confirmación para valores únicos */}
                {!validationResult.is_duplicate && validationResult.match_type !== 'partial' && (
                  <div className="mt-3">
                    <button
                      onClick={handleConfirmAdd}
                      disabled={isAdding}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                    >
                      {isAdding ? (
                        <>
                          <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"></div>
                          Agregando...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Agregar &quot;{value}&quot; al listado
                        </>
                      )}
                    </button>
                    <p className="text-xs text-green-600 mt-1 font-medium">
                      Haz clic para confirmar y agregar esta opción
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default CustomFieldValidator;