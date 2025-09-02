import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateCustomField, addCustomField, debounce, type FieldType, type ValidationResult, type AddFieldResult } from '@/utils/customFieldValidation';

interface CustomFieldValidatorProps {
  fieldType: FieldType;
  value: string;
  onValidationResult: (result: ValidationResult | null) => void;
  onSuggestionAccepted: (suggestedValue: string) => void;
  onFieldAdded?: (fieldType: FieldType, value: string) => void;
  isVisible: boolean;
}

const CustomFieldValidator: React.FC<CustomFieldValidatorProps> = ({
  fieldType,
  value,
  onValidationResult,
  onSuggestionAccepted,
  onFieldAdded,
  isVisible
}) => {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Función debounced para validar
  const debouncedValidate = debounce(async (...args: unknown[]) => {
    const [fieldType, value] = args as [FieldType, string];
    if (!value || typeof value !== 'string' || value.trim().length < 2) {
      setValidationResult(null);
      onValidationResult(null);
      return;
    }

    setIsValidating(true);
    try {
      const result = await validateCustomField(fieldType, value);
      setValidationResult(result);
      onValidationResult(result);
    } catch (error) {
      console.error('Error validating field:', error);
      setValidationResult(null);
      onValidationResult(null);
    } finally {
      setIsValidating(false);
    }
  }, 500);

  // Validar cuando cambie el valor
  useEffect(() => {
    if (isVisible && value) {
      debouncedValidate(fieldType, value);
    } else {
      setValidationResult(null);
      onValidationResult(null);
    }
  }, [fieldType, value, isVisible]);

  // NUEVO: Función para agregar campo personalizado
  const handleAddField = async () => {
    if (!value || value.trim().length < 2) return;

    setIsAdding(true);
    try {
      const result = await addCustomField(fieldType, value);
      
      if (result?.success) {
        // Campo agregado exitosamente
        setValidationResult(null);
        onValidationResult(null);
        
        // Notificar al componente padre
        if (onFieldAdded) {
          onFieldAdded(fieldType, value);
        }
        
        // Mostrar mensaje de éxito
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
  };

  if (!isVisible || (!validationResult && !isValidating)) {
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
        {isValidating && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-sm text-blue-700 font-medium">Validando...</span>
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

                {/* Botones de acción */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {validationResult.is_duplicate && (
                    <>
                      <button
                        onClick={() => handleAcceptSuggestion(validationResult.suggested_value)}
                        className="px-3 py-1 bg-yellow-600 text-white text-xs rounded-md hover:bg-yellow-700 transition-colors"
                      >
                        Usar &quot;{validationResult.suggested_value}&quot;
                      </button>
                      <button
                        onClick={handleAddField}
                        disabled={isAdding}
                        className="px-3 py-1 bg-gray-600 text-white text-xs rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        {isAdding ? 'Agregando...' : 'Agregar de todas formas'}
                      </button>
                    </>
                  )}

                  {validationResult.match_type === 'partial' && (
                    <>
                      <button
                        onClick={() => handleAcceptSuggestion(validationResult.suggested_value)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Usar &quot;{validationResult.suggested_value}&quot;
                      </button>
                      <button
                        onClick={handleAddField}
                        disabled={isAdding}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {isAdding ? 'Agregando...' : 'Agregar nuevo'}
                      </button>
                    </>
                  )}

                  {!validationResult.is_duplicate && validationResult.match_type !== 'partial' && (
                    <button
                      onClick={handleAddField}
                      disabled={isAdding}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {isAdding ? 'Agregando...' : 'Agregar a la base de datos'}
                    </button>
                  )}
                </div>

                {/* Sugerencias adicionales */}
                {validationResult.all_suggestions && validationResult.all_suggestions.length > 1 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 font-medium mb-1">Otras opciones similares:</p>
                    <div className="flex flex-wrap gap-1">
                      {validationResult.all_suggestions.slice(1, 4).map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleAcceptSuggestion(suggestion)}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
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