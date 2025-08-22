'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SportParameter } from '@/types';
import Modal from '@/components/ui/Modal';

const sportParameterSchema = z.object({
  param_key: z.string().min(2, 'La clave debe tener al menos 2 caracteres'),
  param_type: z.enum(['number', 'string', 'boolean'], {
    message: 'Por favor selecciona un tipo válido'
  }),
  param_value: z.union([z.string(), z.number(), z.boolean()]),
});

type SportParameterFormValues = z.infer<typeof sportParameterSchema>;

interface SportParameterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SportParameterFormValues) => Promise<void>;
  parameter?: SportParameter | null;
  isSubmitting?: boolean;
}

export default function SportParameterModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  parameter, 
  isSubmitting = false 
}: SportParameterModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SportParameterFormValues>({
    resolver: zodResolver(sportParameterSchema),
    defaultValues: {
      param_key: parameter?.param_key || '',
      param_type: (parameter?.param_type as 'string' | 'number' | 'boolean') || 'string',
      param_value: (parameter?.param_value ?? parameter?.typed_value ?? '') as string | number | boolean,
    },
  });

  const paramType = watch('param_type');

  const handleFormSubmit = async (data: SportParameterFormValues) => {
    // Convert value based on type
    let processedValue: string | number | boolean = data.param_value;

    if (data.param_type === 'number') {
      processedValue = Number(data.param_value);
    } else if (data.param_type === 'boolean') {
      processedValue = data.param_value === 'true' || data.param_value === true;
    } else {
      processedValue = String(data.param_value);
    }

    const formattedData = {
      ...data,
      param_value: processedValue,
    };

    await onSubmit(formattedData);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleTypeChange = (newType: 'number' | 'string' | 'boolean') => {
    setValue('param_type', newType);
    // Reset value when type changes
    if (newType === 'boolean') {
      setValue('param_value', false);
    } else if (newType === 'number') {
      setValue('param_value', 0);
    } else {
      setValue('param_value', '');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={parameter ? 'Editar Parámetro' : 'Nuevo Parámetro'}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Parameter Key Field */}
        <div className="space-y-2">
          <label htmlFor="param_key" className="block text-sm font-medium text-gray-700">
            Clave del Parámetro
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            {...register('param_key')}
            type="text"
            id="param_key"
            placeholder="ej. puntos_por_victoria, duracion_partido"
            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-900 placeholder-gray-500 ${
              errors.param_key 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            style={{ color: '#111827' }}
          />
          {errors.param_key && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.param_key.message}
            </p>
          )}
        </div>

        {/* Parameter Type Field */}
        <div className="space-y-2">
          <label htmlFor="param_type" className="block text-sm font-medium text-gray-700">
            Tipo de Parámetro
            <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            {...register('param_type')}
            id="param_type"
            onChange={(e) => handleTypeChange(e.target.value as 'number' | 'string' | 'boolean')}
            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-900 ${
              errors.param_type 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            style={{ color: '#111827' }}
          >
            <option value="string" style={{ color: '#111827' }}>Texto</option>
            <option value="number" style={{ color: '#111827' }}>Número</option>
            <option value="boolean" style={{ color: '#111827' }}>Verdadero/Falso</option>
          </select>
          {errors.param_type && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.param_type.message}
            </p>
          )}
        </div>

        {/* Parameter Value Field */}
        <div className="space-y-2">
          <label htmlFor="param_value" className="block text-sm font-medium text-gray-700">
            Valor del Parámetro
            <span className="text-red-500 ml-1">*</span>
          </label>
          
          {paramType === 'boolean' ? (
            <select
              {...register('param_value')}
              id="param_value"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-gray-300 text-gray-900"
              style={{ color: '#111827' }}
            >
              <option value="true" style={{ color: '#111827' }}>Verdadero</option>
              <option value="false" style={{ color: '#111827' }}>Falso</option>
            </select>
          ) : paramType === 'number' ? (
            <input
              {...register('param_value', { valueAsNumber: true })}
              type="number"
              id="param_value"
              step="any"
              placeholder="ej. 3, 90, 2.5"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-gray-300 text-gray-900 placeholder-gray-500"
              style={{ color: '#111827' }}
            />
          ) : (
            <input
              {...register('param_value')}
              type="text"
              id="param_value"
              placeholder="ej. Fútbol 11, Cancha completa"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-gray-300 text-gray-900 placeholder-gray-500"
              style={{ color: '#111827' }}
            />
          )}
          
          {errors.param_value && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.param_value.message}
            </p>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-1">
                Tipos de Parámetros
              </h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Texto:</strong> Para valores como nombres, descripciones</p>
                <p><strong>Número:</strong> Para valores numéricos como puntos, duración</p>
                <p><strong>Verdadero/Falso:</strong> Para configuraciones de sí/no</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              parameter ? 'Actualizar Parámetro' : 'Crear Parámetro'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}