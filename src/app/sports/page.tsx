'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import SportModal from '@/components/sports/SportModal';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import { useAuthenticatedRequest } from '@/hooks/useAuthenticatedRequest';
import api from '@/lib/axios';
import { Sport, SportForm, PaginatedResponse } from '@/types';
import { AxiosError } from 'axios';

export default function SportsPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSport, setEditingSport] = useState<Sport | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sportToDelete, setSportToDelete] = useState<Sport | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { makeRequest } = useAuthenticatedRequest();

  const fetchSports = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await makeRequest(() => 
        api.get<PaginatedResponse<Sport>>(`/api/sports?${params}`)
      );
      setSports(response.data.data);
    } catch (error) {
      console.error('Error fetching sports:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, makeRequest]);

  useEffect(() => {
    fetchSports();
  }, [fetchSports]);

  const handleSubmit = async (data: SportForm) => {
    try {
      setIsSubmitting(true);
      
      await makeRequest(async () => {
        if (editingSport) {
          return api.put(`/api/sports/${editingSport.id}`, data);
        } else {
          return api.post('/api/sports', data);
        }
      });
      
      setShowForm(false);
      setEditingSport(null);
      fetchSports();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error saving sport:', error.message);
        alert('Error al guardar el deporte: ' + error.message);
      } else {
        console.error('Error saving sport:', error);
        alert('Error al guardar el deporte');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (sport: Sport) => {
    setEditingSport(sport);
    setShowForm(true);
  };

  const handleDeleteClick = (sport: Sport) => {
    setSportToDelete(sport);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sportToDelete) return;
    
    try {
      setIsDeleting(true);
      
      await makeRequest(() => 
        api.delete(`/api/sports/${sportToDelete.id}`)
      );
      
      setShowDeleteModal(false);
      setSportToDelete(null);
      fetchSports();
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        (error as AxiosError).response &&
        (error as AxiosError).response?.data
      ) {
        const errorData = (error as AxiosError<{ message?: string }>).response?.data;
        alert(errorData?.message || 'Error al eliminar el deporte');
      } else {
        alert('Error al eliminar el deporte');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setShowForm(false);
    setEditingSport(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSportToDelete(null);
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900">Deportes</h1>
            <p className="text-gray-600">
              Gestiona los deportes y sus parámetros de configuración
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Deporte
          </button>
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
                  placeholder="Buscar por nombre o código..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-gray-300 text-gray-900 placeholder-gray-500"
                  style={{ color: '#111827' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sports List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-4">
                <svg className="animate-spin h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Cargando deportes...</p>
            </div>
          ) : sports.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay deportes</h3>
              <p className="text-gray-500 mb-6">Crea tu primer deporte para comenzar.</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo Deporte
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {sports.map((sport) => (
                <div key={sport.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{sport.name}</h3>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {sport.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {sport.parameters_count || 0} parámetros configurados
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/sports/${sport.id}/parameters`}
                        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors duration-200"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Parámetros
                      </Link>
                      <button
                        onClick={() => handleEdit(sport)}
                        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClick(sport)}
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
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Sobre los Parámetros de Deportes
              </h3>
              <p className="text-blue-800 leading-relaxed">
                Cada deporte puede tener parámetros personalizados que definen sus reglas y configuración. 
                Haz clic en <span className="font-medium">&quot;Parámetros&quot;</span> junto a cualquier deporte para gestionar 
                sus configuraciones específicas como puntos por victoria, duración del partido, número de jugadores, etc.
              </p>
            </div>
          </div>
        </div>

        {/* Sport Modal */}
        <SportModal
          isOpen={showForm}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          sport={editingSport}
          isSubmitting={isSubmitting}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={handleCloseDeleteModal}
          onConfirm={handleDeleteConfirm}
          title="Eliminar Deporte"
          message="¿Estás seguro de que deseas eliminar este deporte?"
          itemName={sportToDelete?.name}
          isDeleting={isDeleting}
        />
      </div>
    </Layout>
  );
}