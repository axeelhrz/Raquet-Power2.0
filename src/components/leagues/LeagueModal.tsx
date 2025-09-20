'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { League } from '@/types';
import Modal from '@/components/ui/Modal';

type LeagueWithProvince = League & { province?: string };

const leagueSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  region: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  province: z.string().optional(),
});

type LeagueFormSchema = z.infer<typeof leagueSchema>;

interface LeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LeagueFormSchema) => Promise<void>;
  league?: LeagueWithProvince | null;
  isSubmitting?: boolean;
}

export default function LeagueModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  league, 
  isSubmitting = false 
}: LeagueModalProps) {
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors } 
  } = useForm<LeagueFormSchema>({
    resolver: zodResolver(leagueSchema),
    defaultValues: {
      name: league?.name || '',
      region: league?.region || '',
      status: league?.status || 'active',
      province: league?.province || '',
    },
  });

  const handleFormSubmit = async (data: LeagueFormSchema) => {
    await onSubmit(data);
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
      title={league ? 'Editar Liga' : 'Nueva Liga'}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nombre de la Liga
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            placeholder="Ingresa el nombre de la liga"
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

        {/* Region Field */}
        <div className="space-y-2">
          <label htmlFor="region" className="block text-sm font-medium text-gray-700">
            Región
          </label>
          <input
            {...register('region')}
            type="text"
            id="region"
            placeholder="Región o ubicación (opcional)"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-gray-300 text-gray-900 placeholder-gray-500"
            style={{ color: '#111827' }}
          />
        </div>

        {/* Status Field */}
        <div className="space-y-2">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Estado
          </label>
          <select
            {...register('status')}
            id="status"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-gray-300 text-gray-900"
            style={{ color: '#111827' }}
          >
            <option value="active" style={{ color: '#111827' }}>Activa</option>
            <option value="inactive" style={{ color: '#111827' }}>Inactiva</option>
          </select>
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
              league ? 'Actualizar Liga' : 'Crear Liga'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}