import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateCustomField, addCustomField, debounce, getFieldTypeDisplayName, type FieldType, type ValidationResult, type AddFieldResult } from '@/utils/customFieldValidation';

interface CustomFieldValidatorProps {
  fieldType: FieldType;
  value: string;
  onValidationResult: (result: ValidationResult | null) => void;
  onSuggestionAccepted: (suggestedValue: string) => void;
  onFieldAdded?: (fieldType: FieldType, value: string) => void;
  isVisible: boolean;
  currentOptions?: string[]; // Lista actual de opciones en el desplegable
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
      // PRIMERO: Validar contra la lista actual (más rápido)
      const localValidation = validateAgainstCurrentOptions(value);
      
      if (localValidation) {
        setValidationResult(localValidation);
        onValidationResult(localValidation);
        setIsValidating(false);
        return;
      }
      
      // SEGUNDO: Si no está en la lista actual, validar contra la base de datos
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
  }, 800);

  // Validar cuando cambie el valor
  useEffect(() => {
    if (isVisible && value) {
      debouncedValidate(fieldType, value);
    } else {
      setValidationResult(null);
      onValidationResult(null);
    }
    // Limpiar mensaje de éxito cuando cambie el valor
    setSuccessMessage(null);
  }, [fieldType, value, isVisible, currentOptions]);

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
        
        // Mostrar mensaje de éxito personalizado según el tipo de campo
        const fieldDisplayName = getFieldTypeDisplayName(fieldType);
        setSuccessMessage(`${fieldDisplayName} "${value}" se agregó exitosamente al listado`);
        
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
  };

  // Obtener el icono apropiado según el tipo de campo
  const getFieldIcon = (fieldType: FieldType) => {
    switch (fieldType) {
      case 'club':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'league':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'brand':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
    }
  };

  if (!isVisible || (!validationResult && !isValidating && !successMessage)) {
    return null;
  }

  const fieldDisplayName = getFieldTypeDisplayName(fieldType);

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
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl mb-2"
          >
            <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-green-800">{successMessage}</p>
              <p className="text-xs text-green-600 mt-1 font-medium">
                Ya está disponible en el desplegable para su selección
              </p>
            </div>
            <div className="flex-shrink-0 text-green-600">
              {getFieldIcon(fieldType)}
            </div>
          </motion.div>
        )}

        {isValidating && (
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
            <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-sm text-blue-700 font-bold">Validando {fieldDisplayName.toLowerCase()}...</span>
          </div>
        )}

        {isAdding && (
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
            <div className="animate-spin w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full"></div>
            <span className="text-sm text-green-700 font-bold">Agregando {fieldDisplayName.toLowerCase()} al listado...</span>
          </div>
        )}

        {validationResult && (
          <div className={`p-4 rounded-xl border-2 ${
            validationResult.is_duplicate 
              ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200' 
              : validationResult.match_type === 'partial'
              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
              : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
          }`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {validationResult.is_duplicate ? (
                  <div className="bg-yellow-100 rounded-full p-2">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                ) : validationResult.match_type === 'partial' ? (
                  <div className="bg-blue-100 rounded-full p-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                ) : (
                  <div className="bg-green-100 rounded-full p-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <p className={`text-sm font-bold ${
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
                    <p className="text-xs text-gray-600 font-bold mb-2">
                      {validationResult.is_duplicate 
                        ? `Este ${fieldDisplayName.toLowerCase()} ya está disponible:`
                        : `¿Quisiste decir alguno de estos ${fieldDisplayName.toLowerCase()}s?`
                      }
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleAcceptSuggestion(validationResult.suggested_value)}
                        className={`px-3 py-2 text-xs rounded-lg transition-all duration-200 font-bold flex items-center gap-2 ${
                          validationResult.is_duplicate
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-300'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-300'
                        }`}
                      >
                        {getFieldIcon(fieldType)}
                        {validationResult.suggested_value}
                      </button>
                      
                      {/* Sugerencias adicionales */}
                      {validationResult.all_suggestions && validationResult.all_suggestions.length > 1 && 
                        validationResult.all_suggestions.slice(1, 3).map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleAcceptSuggestion(suggestion)}
                            className="px-3 py-2 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium border border-gray-300"
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
                  <div className="mt-4">
                    <button
                      onClick={handleConfirmAdd}
                      disabled={isAdding}
                      className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      {isAdding ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Agregando...
                        </>
                      ) : (
                        <>
                          {getFieldIcon(fieldType)}
                          Agregar "{value}" al listado
                        </>
                      )}
                    </button>
                    <p className="text-xs text-green-600 mt-2 font-bold flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Haz clic para confirmar y agregar este {fieldDisplayName.toLowerCase()}
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