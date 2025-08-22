'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sport, SportForm } from '@/types';
import Modal from '@/components/ui/Modal';

const sportSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  code: z.string()
    .min(2, 'El código debe tener al menos 2 caracteres')
    .max(10, 'El código debe tener máximo 10 caracteres')
    .regex(/^[A-Z0-9_]+$/, 'El código solo puede contener letras mayúsculas, números y guiones bajos'),
});

interface SportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SportForm) => Promise<void>;
  sport?: Sport | null;
  isSubmitting?: boolean;
}

export default function SportModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  sport, 
  isSubmitting = false 
}: SportModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SportForm>({
    resolver: zodResolver(sportSchema),
    defaultValues: {
      name: sport?.name || '',
      code: sport?.code || '',
    },
  });

  const handleFormSubmit = async (data: SportForm) => {
    // Convert code to uppercase
    const formattedData = {
      ...data,
      code: data.code.toUpperCase(),
    };
    
    await onSubmit(formattedData);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={sport ? 'Editar Deporte' : 'Nuevo Deporte'}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nombre del Deporte
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            placeholder="ej. Fútbol, Baloncesto, Tenis"
            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-900 placeholder-gray-500 ${
              errors.name 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            style={{ color: '#111827' }}
          />
          {errors.name && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Code Field */}
        <div className="space-y-2">
          <label htmlFor="code" className="block text-sm font-medium text-gray-700">
            Código del Deporte
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            {...register('code')}
            type="text"
            id="code"
            placeholder="ej. FUT, BASK, TEN"
            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-900 placeholder-gray-500 uppercase ${
              errors.code 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            style={{ 
              color: '#111827',
              textTransform: 'uppercase'
            }}
            maxLength={10}
          />
          {errors.code && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.code.message}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Identificador único para el deporte (se convertirá automáticamente a mayúsculas)
          </p>
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
                Sobre los Parámetros del Deporte
              </h4>
              <p className="text-sm text-blue-700">
                Después de crear el deporte, podrás configurar parámetros específicos como puntos por victoria, 
                duración del partido, número de jugadores, etc.
              </p>
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
              sport ? 'Actualizar Deporte' : 'Crear Deporte'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}