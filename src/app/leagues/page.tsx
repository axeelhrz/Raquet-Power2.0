'use client';

import { useEffect, useState, useCallback } from 'react';
import Layout from '@/components/Layout';
import LeagueModal from '@/components/leagues/LeagueModal';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import { useAuthenticatedRequest } from '@/hooks/useAuthenticatedRequest';
import api from '@/lib/axios';
import { League, LeagueForm, PaginatedResponse } from '@/types';
import { AxiosError } from 'axios';

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLeague, setEditingLeague] = useState<League | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leagueToDelete, setLeagueToDelete] = useState<League | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { makeRequest } = useAuthenticatedRequest();

  const fetchLeagues = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await makeRequest(() => 
        api.get<PaginatedResponse<League>>(`/api/leagues?${params}`)
      );
      setLeagues(response.data.data);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, makeRequest]);

  useEffect(() => {
    fetchLeagues();
  }, [fetchLeagues]);

  const handleSubmit = async (data: { name: string; region?: string; status?: 'active' | 'inactive'; province?: string }) => {
    try {
      setIsSubmitting(true);
      // Adapt incoming (optional province) to required LeagueForm structure
      const payload: LeagueForm = {
        name: data.name,
        province: data.province ?? ''
      };
      
      await makeRequest(async () => {
        if (editingLeague) {
          return api.put(`/api/leagues/${editingLeague.id}`, { ...payload, status: data.status });
        } else {
          return api.post('/api/leagues', { ...payload, status: data.status });
        }
      });
      
      setShowForm(false);
      setEditingLeague(null);
      fetchLeagues();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error saving league:', error.message);
        alert('Error al guardar la liga: ' + error.message);
      } else {
        console.error('Error saving league:', error);
        alert('Error al guardar la liga');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (league: League) => {
    setEditingLeague(league);
    setShowForm(true);
  };

  const handleDeleteClick = (league: League) => {
    setLeagueToDelete(league);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!leagueToDelete) return;
    
    try {
      setIsDeleting(true);
      
      await makeRequest(() => 
        api.delete(`/api/leagues/${leagueToDelete.id}`)
      );
      
      setShowDeleteModal(false);
      setLeagueToDelete(null);
      fetchLeagues();
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        (error as AxiosError).response &&
        (error as AxiosError).response?.data
      ) {
        const errorData = (error as AxiosError<{ message?: string }>).response?.data;
        alert(errorData?.message || 'Error al eliminar la liga');
      } else {
        alert('Error al eliminar la liga');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setShowForm(false);
    setEditingLeague(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setLeagueToDelete(null);
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900">Ligas</h1>
            <p className="text-gray-600">
              Gestiona las ligas y competiciones deportivas
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Liga
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
                  placeholder="Buscar por nombre o región..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-gray-300 text-gray-900 placeholder-gray-500"
                  style={{ color: '#111827' }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Estado
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-gray-300 text-gray-900"
                style={{ color: '#111827' }}
              >
                <option value="" style={{ color: '#111827' }}>Todos los estados</option>
                <option value="active" style={{ color: '#111827' }}>Activas</option>
                <option value="inactive" style={{ color: '#111827' }}>Inactivas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leagues List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-4">
                <svg className="animate-spin h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Cargando ligas...</p>
            </div>
          ) : leagues.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay ligas</h3>
              <p className="text-gray-500 mb-6">Crea tu primera liga para comenzar.</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva Liga
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {leagues.map((league) => (
                <div key={league.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{league.name}</h3>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            league.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {league.status === 'active' ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        {league.region && (
                          <div className="flex items-center gap-1">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {league.region}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {league.clubs_count || 0} clubes
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(league)}
                        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClick(league)}
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

        {/* League Modal */}
        <LeagueModal
          isOpen={showForm}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          league={editingLeague}
          isSubmitting={isSubmitting}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={handleCloseDeleteModal}
          onConfirm={handleDeleteConfirm}
          title="Eliminar Liga"
          message="¿Estás seguro de que deseas eliminar esta liga?"
          itemName={leagueToDelete?.name}
          isDeleting={isDeleting}
        />
      </div>
    </Layout>
  );
}