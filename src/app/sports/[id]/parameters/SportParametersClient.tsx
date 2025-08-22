'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import SportParameterModal from '@/components/sports/SportParameterModal';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import { useAuthenticatedRequest } from '@/hooks/useAuthenticatedRequest';
import api from '@/lib/axios';
import { Sport, SportParameter, ApiResponse } from '@/types';
import { AxiosError } from 'axios';

type SportParameterFormValues = {
  param_key: string;
  param_type: 'string' | 'number' | 'boolean';
  param_value: string | number | boolean;
};

export default function SportParametersClient() {
  const params = useParams();
  const router = useRouter();
  const sportId = params.id as string;
  
  const [sport, setSport] = useState<Sport | null>(null);
  const [parameters, setParameters] = useState<SportParameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingParameter, setEditingParameter] = useState<SportParameter | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [parameterToDelete, setParameterToDelete] = useState<SportParameter | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { makeRequest } = useAuthenticatedRequest();

  const fetchSport = useCallback(async () => {
    try {
      const response = await makeRequest(() => 
        api.get<ApiResponse<Sport>>(`/api/sports/${sportId}`)
      );
      setSport(response.data.data);
    } catch (error) {
      console.error('Error fetching sport:', error);
      router.push('/sports');
    }
  }, [sportId, makeRequest, router]);

  const fetchParameters = useCallback(async () => {
    try {
      setLoading(true);
      const response = await makeRequest(() => 
        api.get<ApiResponse<SportParameter[]>>(`/api/sports/${sportId}/parameters`)
      );
      
      let filteredParameters = response.data.data;
      
      // Apply filters
      if (searchTerm) {
        filteredParameters = filteredParameters.filter(param =>
          param.param_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
          param.param_value.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (typeFilter) {
        filteredParameters = filteredParameters.filter(param => param.param_type === typeFilter);
      }
      
      setParameters(filteredParameters);
    } catch (error) {
      console.error('Error fetching parameters:', error);
    } finally {
      setLoading(false);
    }
  }, [sportId, searchTerm, typeFilter, makeRequest]);

  useEffect(() => {
    fetchSport();
    fetchParameters();
  }, [fetchSport, fetchParameters]);

  const handleSubmit = async (data: SportParameterFormValues) => {
    try {
      setIsSubmitting(true);

      await makeRequest(async () => {
        if (editingParameter) {
          return api.put(`/api/sports/${sportId}/parameters/${editingParameter.id}`, data);
        } else {
          return api.post(`/api/sports/${sportId}/parameters`, data);
        }
      });

      setShowForm(false);
      setEditingParameter(null);
      fetchParameters();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error saving parameter:', error.message);
        alert('Error al guardar el parámetro: ' + error.message);
      } else {
        console.error('Error saving parameter:', error);
        alert('Error al guardar el parámetro');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (parameter: SportParameter) => {
    setEditingParameter(parameter);
    setShowForm(true);
  };

  const handleDeleteClick = (parameter: SportParameter) => {
    setParameterToDelete(parameter);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!parameterToDelete) return;
    
    try {
      setIsDeleting(true);
      
      await makeRequest(() => 
        api.delete(`/api/sports/${sportId}/parameters/${parameterToDelete.id}`)
      );
      
      setShowDeleteModal(false);
      setParameterToDelete(null);
      fetchParameters();
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        (error as AxiosError).response &&
        (error as AxiosError).response?.data
      ) {
        const errorData = (error as AxiosError<{ message?: string }>).response?.data;
        alert(errorData?.message || 'Error al eliminar el parámetro');
      } else {
        alert('Error al eliminar el parámetro');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setShowForm(false);
    setEditingParameter(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setParameterToDelete(null);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'string': return 'Texto';
      case 'number': return 'Número';
      case 'boolean': return 'Verdadero/Falso';
      default: return type;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'string': return 'bg-blue-100 text-blue-800';
      case 'number': return 'bg-green-100 text-green-800';
      case 'boolean': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatValue = (parameter: SportParameter) => {
    if (parameter.param_type === 'boolean') {
      return parameter.typed_value ? 'Verdadero' : 'Falso';
    }
    return String(parameter.typed_value);
  };

  if (!sport) {
    return (
      <Layout>
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Cargando deporte...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header with Breadcrumb */}
        <div className="space-y-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/sports" className="hover:text-indigo-600 transition-colors">
              Deportes
            </Link>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">{sport.name}</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900">Parámetros</span>
          </nav>
          
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">Parámetros de {sport.name}</h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {sport.code}
                </span>
              </div>
              <p className="text-gray-600">
                Configura los parámetros específicos para este deporte
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Parámetro
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Buscar
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por clave o valor..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-gray-300 text-gray-900 placeholder-gray-500"
                  style={{ color: '#111827' }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Tipo
              </label>
              <select
                id="type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-gray-300 text-gray-900"
                style={{ color: '#111827' }}
              >
                <option value="" style={{ color: '#111827' }}>Todos los tipos</option>
                <option value="string" style={{ color: '#111827' }}>Texto</option>
                <option value="number" style={{ color: '#111827' }}>Número</option>
                <option value="boolean" style={{ color: '#111827' }}>Verdadero/Falso</option>
              </select>
            </div>
          </div>
        </div>

        {/* Parameters List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-4">
                <svg className="animate-spin h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Cargando parámetros...</p>
            </div>
          ) : parameters.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay parámetros</h3>
              <p className="text-gray-500 mb-6">Agrega el primer parámetro para este deporte.</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo Parámetro
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {parameters.map((parameter) => (
                <div key={parameter.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{parameter.param_key}</h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(parameter.param_type)}`}>
                          {getTypeLabel(parameter.param_type)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Valor: <span className="font-medium">{formatValue(parameter)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(parameter)}
                        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClick(parameter)}
                        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-green-900 mb-2">
                Ejemplos de Parámetros para {sport.name}
              </h3>
              <div className="text-green-800 leading-relaxed space-y-2">
                <p><strong>Números:</strong> puntos_por_victoria (3), duracion_partido (90), jugadores_por_equipo (11)</p>
                <p><strong>Texto:</strong> tipo_cancha (Césped natural), categoria (Profesional)</p>
                <p><strong>Verdadero/Falso:</strong> permite_empates (true), requiere_arbitro (true)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Parameter Modal */}
        <SportParameterModal
          isOpen={showForm}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          parameter={editingParameter}
          isSubmitting={isSubmitting}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={handleCloseDeleteModal}
          onConfirm={handleDeleteConfirm}
          title="Eliminar Parámetro"
          message="¿Estás seguro de que deseas eliminar este parámetro?"
          itemName={parameterToDelete?.param_key}
          isDeleting={isDeleting}
        />
      </div>
    </Layout>
  );
}
