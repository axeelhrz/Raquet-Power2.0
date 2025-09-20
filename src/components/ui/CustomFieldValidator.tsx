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
  const [showAddButton, setShowAddButton] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      setShowAddButton(false);
      setErrorMessage(null);
      return;
    }

    // MODIFICACIÓN: Para el campo 'club', usar validación simplificada
    if (fieldType === 'club') {
      // Para clubes, solo validar contra la lista actual y mostrar botón si no existe
      const localValidation = validateAgainstCurrentOptions(value);
      
      if (localValidation) {
        setValidationResult(localValidation);
        onValidationResult(localValidation);
        setShowAddButton(false);
      } else {
        // No existe en la lista actual, mostrar botón para agregar
        setValidationResult(null);
        onValidationResult(null);
        setShowAddButton(true);
      }
      setIsValidating(false);
      return;
    }

    setIsValidating(true);
    setShowAddButton(false);
    setValidationResult(null);
    setErrorMessage(null);
    
    try {
      // PRIMERO: Validar contra la lista actual (más rápido) - Para otros campos
      const localValidation = validateAgainstCurrentOptions(value);
      
      if (localValidation) {
        setValidationResult(localValidation);
        onValidationResult(localValidation);
        setIsValidating(false);
        return;
      }
      
      // SEGUNDO: Si no está en la lista actual, validar contra la base de datos
      const result = await validateCustomField(fieldType, value);
      
      if (result && result.is_duplicate) {
        // Existe en la base de datos
        setValidationResult(result);
        onValidationResult(result);
      } else if (result && result.match_type === 'partial') {
        // Hay sugerencias parciales
        setValidationResult(result);
        onValidationResult(result);
      } else {
        // TERCERO: No existe en ningún lado, mostrar botón para agregar
        setValidationResult(null);
        onValidationResult(null);
        setShowAddButton(true);
      }
    } catch (error) {
      console.error('Error validating field:', error);
      // En caso de error, asumir que no existe y mostrar botón para agregar
      setValidationResult(null);
      onValidationResult(null);
      setShowAddButton(true);
      setHasValidated(true);
      setErrorMessage('Error al validar el campo. Puedes intentar agregarlo de todas formas.');
    } finally {
      setIsValidating(false);
    }
  }, fieldType === 'club' ? 300 : 800); // Validación más rápida para clubes

  // Resetear validación cuando cambia el valor
  useEffect(() => {
    setHasValidated(false);
    setErrorMessage(null);
  }, [value]);

  // Validar cuando cambie el valor
  useEffect(() => {
    if (isVisible && value && value.trim().length >= 2) {
      if (!hasValidated) {
        debouncedValidate(fieldType, value);
        setHasValidated(true);
      }
    } else {
      setValidationResult(null);
      onValidationResult(null);
      setShowAddButton(false);
      setHasValidated(false);
      setErrorMessage(null);
    }
    // Limpiar mensaje de éxito cuando cambie el valor
    setSuccessMessage(null);
  }, [fieldType, value, isVisible, hasValidated, debouncedValidate, onValidationResult]);

  // Función para agregar campo cuando el usuario confirma
  const handleConfirmAdd = async () => {
    if (!value || value.trim().length < 2) {
      setErrorMessage('El valor debe tener al menos 2 caracteres');
      return;
    }

    setIsAdding(true);
    setErrorMessage(null);
    
    try {
      console.log('Intentando agregar campo:', { fieldType, value });
      
      const result: AddFieldResult = await addCustomField(fieldType, value);
      
      console.log('Resultado de agregar campo:', result);
      
      if (result?.success) {
        // Campo agregado exitosamente
        setValidationResult(null);
        onValidationResult(null);
        setShowAddButton(false);
        
        // Mostrar mensaje de éxito
        const successMsg = fieldType === 'club' 
          ? `¡Perfecto! "${value}" se agregó al listado de clubes`
          : `"${value}" se agregó exitosamente al listado`;
        setSuccessMessage(successMsg);
        
        // Notificar al componente padre para actualizar el desplegable
        if (onFieldAdded) {
          onFieldAdded(fieldType, value);
        }
        
        // Para clubes, limpiar mensaje de éxito más rápido
        const successTimeout = fieldType === 'club' ? 2000 : 4000;
        setTimeout(() => {
          setSuccessMessage(null);
        }, successTimeout);
        
        console.log('Campo agregado exitosamente:', result.message);
      } else {
        console.error('Error al agregar campo:', result?.message);
        setErrorMessage(result?.message || 'Error desconocido al agregar el campo');
      }
    } catch (error) {
      console.error('Error adding field:', error);
      setErrorMessage('Error al agregar el campo. Por favor intenta de nuevo.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleAcceptSuggestion = (suggestion: string) => {
    onSuggestionAccepted(suggestion);
    setValidationResult(null);
    setSuccessMessage(null);
    setShowAddButton(false);
    setErrorMessage(null);
  };

  // Obtener icono según el tipo de campo
  const getFieldIcon = (fieldType: FieldType) => {
    switch (fieldType) {
      case 'club':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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
      case 'racket_model':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'drive_rubber_model':
      case 'backhand_rubber_model':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        );
      case 'drive_rubber_hardness':
      case 'backhand_rubber_hardness':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
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

  if (!isVisible || (!validationResult && !isValidating && !successMessage && !showAddButton && !errorMessage)) {
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
        {/* Mensaje de error */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl mb-3 shadow-sm"
          >
            <div className="flex-shrink-0 bg-red-100 rounded-full p-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-800">{errorMessage}</p>
            </div>
          </motion.div>
        )}

        {/* Mensaje de éxito */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl mb-3 shadow-sm"
          >
            <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-green-800">{successMessage}</p>
              <p className="text-xs text-green-600 mt-1 font-medium">
                {fieldType === 'club' 
                  ? 'El club ya está disponible en el desplegable'
                  : 'Ya está disponible en el desplegable para su selección'
                }
              </p>
            </div>
          </motion.div>
        )}

        {/* Spinner de validación (solo para campos que no sean 'club') */}
        {isValidating && fieldType !== 'club' && (
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-sm">
            <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-sm text-blue-700 font-bold">Validando...</span>
          </div>
        )}

        {validationResult && (
          <div className={`p-4 rounded-xl border-2 shadow-sm ${
            validationResult.is_duplicate 
              ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200' 
              : validationResult.match_type === 'partial'
              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
              : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
          }`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5 bg-white rounded-full p-2">
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
                        ? "Esta opción ya está disponible:"
                        : "¿Quisiste decir alguna de estas opciones?"
                      }
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleAcceptSuggestion(validationResult.suggested_value)}
                        className={`px-3 py-2 text-xs rounded-lg transition-all font-bold shadow-sm hover:shadow-md ${
                          validationResult.is_duplicate
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-300'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-300'
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
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200 transition-colors border border-gray-300 font-medium"
                          >
                            {suggestion}
                          </button>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Botón para agregar cuando no existe */}
        {showAddButton && !isAdding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
                {getFieldIcon(fieldType)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-green-800 mb-2">
                  {fieldType === 'club' 
                    ? `¡Perfecto! "${value}" no está en el listado de clubes`
                    : `¡Perfecto! "${value}" no existe en el listado`
                  }
                </p>
                <p className="text-xs text-green-600 font-medium mb-3">
                  {fieldType === 'club'
                    ? 'Puedes agregarlo para que esté disponible para todos los usuarios'
                    : 'Puedes agregarlo para que esté disponible para todos los usuarios'
                  }
                </p>
                <button
                  onClick={handleConfirmAdd}
                  disabled={isAdding}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  {isAdding ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Agregando...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {fieldType === 'club' 
                        ? `Agregar "${value}" a los clubes`
                        : `Agregar "${value}" al listado`
                      }
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Botón para agregar cuando está cargando */}
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-sm text-blue-700 font-bold">
                {fieldType === 'club' 
                  ? `Agregando "${value}" a los clubes...`
                  : `Agregando "${value}" al listado...`
                }
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default CustomFieldValidator;