'use client';

import { useAuth } from '@/contexts/AuthContext';
import LeagueLayout from '@/components/leagues/LeagueLayout';
import { useEffect, useState, useCallback } from 'react';
import { 
  BellIcon, 
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import axios from '@/lib/axios';
import type { Invitation, InvitationFilters, PaginatedResponse, ApiResponse } from '@/types';

export default function InvitationsPage() {
  const { user, loading } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filters, setFilters] = useState<InvitationFilters>({
    type: 'all',
    status: 'all',
    search: ''
  });
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [processingInvitation, setProcessingInvitation] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });

  const fetchInvitations = useCallback(async (page = 1) => {
    try {
      setLoadingData(true);
      const params = new URLSearchParams({
        page: page.toString(),
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      });

      const response = await axios.get<ApiResponse<PaginatedResponse<Invitation>>>(`/api/invitations?${params}`);
      
      if (response.data.status === 'success') {
        const paginatedData = response.data.data;
        setInvitations(paginatedData.data);
        setPagination({
          current_page: paginatedData.current_page,
          last_page: paginatedData.last_page,
          total: paginatedData.total
        });
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoadingData(false);
    }
  }, [filters]);

  useEffect(() => {
    if (user && (user.role === 'liga' || user.role === 'super_admin')) {
      fetchInvitations();
    }
  }, [user, fetchInvitations]);

  const handleAcceptInvitation = async (invitation: Invitation) => {
    try {
      setProcessingInvitation(invitation.id);
      const response = await axios.post(`/api/invitations/${invitation.id}/accept`);
      
      if (response.data.status === 'success') {
        // Update the invitation in the list
        setInvitations(prev => prev.map(inv => 
          inv.id === invitation.id 
            ? { ...inv, status: 'accepted', responded_at: new Date().toISOString() }
            : inv
        ));
        alert('Invitación aceptada exitosamente');
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      alert('Error al aceptar la invitación');
    } finally {
      setProcessingInvitation(null);
    }
  };

  const handleRejectInvitation = async (invitation: Invitation) => {
    try {
      setProcessingInvitation(invitation.id);
      const response = await axios.post(`/api/invitations/${invitation.id}/reject`);
      
      if (response.data.status === 'success') {
        // Update the invitation in the list
        setInvitations(prev => prev.map(inv => 
          inv.id === invitation.id 
            ? { ...inv, status: 'rejected', responded_at: new Date().toISOString() }
            : inv
        ));
        alert('Invitación rechazada');
      }
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      alert('Error al rechazar la invitación');
    } finally {
      setProcessingInvitation(null);
    }
  };

  const handleCancelInvitation = async (invitation: Invitation) => {
    try {
      setProcessingInvitation(invitation.id);
      const response = await axios.post(`/api/invitations/${invitation.id}/cancel`);
      
      if (response.data.status === 'success') {
        // Update the invitation in the list
        setInvitations(prev => prev.map(inv => 
          inv.id === invitation.id 
            ? { ...inv, status: 'cancelled', responded_at: new Date().toISOString() }
            : inv
        ));
        alert('Invitación cancelada');
      }
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      alert('Error al cancelar la invitación');
    } finally {
      setProcessingInvitation(null);
    }
  };

  const openDetailModal = (invitation: Invitation) => {
    setSelectedInvitation(invitation);
    setIsDetailModalOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'cancelled':
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'accepted':
        return 'Aceptada';
      case 'rejected':
        return 'Rechazada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || loadingData) {
    return (
      <LeagueLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-600"></div>
        </div>
      </LeagueLayout>
    );
  }

  if (!user || (user.role !== 'liga' && user.role !== 'super_admin')) {
    return (
      <LeagueLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-xl font-semibold text-red-800">Acceso Denegado</h1>
          <p className="text-red-600 mt-2">No tienes permisos para acceder a esta página.</p>
        </div>
      </LeagueLayout>
    );
  }

  return (
    <LeagueLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Invitaciones</h1>
              <p className="text-gray-600 mt-1">
                Administra las invitaciones enviadas y recibidas para tu liga
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <BellIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre de club o liga..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="sm:w-48">
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as InvitationFilters['type'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="all">Todas las invitaciones</option>
                <option value="sent">Enviadas</option>
                <option value="received">Recibidas</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as InvitationFilters['status'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="accepted">Aceptadas</option>
                <option value="rejected">Rechazadas</option>
                <option value="cancelled">Canceladas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Invitations List */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Invitaciones ({pagination.total})
            </h2>
          </div>

          {invitations.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        invitation.is_sender ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {invitation.is_sender ? (
                          <PaperAirplaneIcon className="h-6 w-6 text-green-600" />
                        ) : (
                          <BellIcon className="h-6 w-6 text-blue-600" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {invitation.is_sender 
                              ? `Invitación a ${invitation.receiver_name}`
                              : `Invitación de ${invitation.sender_name}`
                            }
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(invitation.status)}`}>
                            {getStatusIcon(invitation.status)}
                            <span className="ml-1">{getStatusText(invitation.status)}</span>
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                          <div className="flex items-center">
                            <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                            <span>
                              {invitation.is_sender 
                                ? invitation.receiver_details?.type 
                                : invitation.sender_details?.type
                              }
                            </span>
                          </div>
                          {(invitation.sender_details?.city || invitation.receiver_details?.city) && (
                            <div className="flex items-center">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              <span>
                                {invitation.is_sender 
                                  ? invitation.receiver_details?.city || invitation.receiver_details?.province
                                  : invitation.sender_details?.city || invitation.sender_details?.province
                                }
                              </span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            <span>{new Date(invitation.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {invitation.message && (
                          <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                            {invitation.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openDetailModal(invitation)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        title="Ver detalles"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>

                      {/* Action buttons based on status and role */}
                      {invitation.status === 'pending' && (
                        <>
                          {!invitation.is_sender ? (
                            // Received invitation - can accept/reject
                            <>
                              <button
                                onClick={() => handleAcceptInvitation(invitation)}
                                disabled={processingInvitation === invitation.id}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                              >
                                Aceptar
                              </button>
                              <button
                                onClick={() => handleRejectInvitation(invitation)}
                                disabled={processingInvitation === invitation.id}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
                              >
                                Rechazar
                              </button>
                            </>
                          ) : (
                            // Sent invitation - can cancel
                            <button
                              onClick={() => handleCancelInvitation(invitation)}
                              disabled={processingInvitation === invitation.id}
                              className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50"
                            >
                              Cancelar
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay invitaciones</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.type === 'sent' 
                  ? 'No has enviado ninguna invitación aún.'
                  : filters.type === 'received'
                  ? 'No has recibido ninguna invitación aún.'
                  : 'No tienes invitaciones en este momento.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => fetchInvitations(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => fetchInvitations(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando página <span className="font-medium">{pagination.current_page}</span> de{' '}
                  <span className="font-medium">{pagination.last_page}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => fetchInvitations(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => fetchInvitations(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedInvitation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalles de la Invitación
                </h3>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Status */}
                <div className="flex items-center space-x-3">
                  {getStatusIcon(selectedInvitation.status)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(selectedInvitation.status)}`}>
                    {getStatusText(selectedInvitation.status)}
                  </span>
                </div>

                {/* Sender/Receiver Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      {selectedInvitation.is_sender ? 'Enviado a:' : 'Recibido de:'}
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-semibold text-gray-900">
                        {selectedInvitation.is_sender 
                          ? selectedInvitation.receiver_name 
                          : selectedInvitation.sender_name
                        }
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedInvitation.is_sender 
                          ? selectedInvitation.receiver_details?.type
                          : selectedInvitation.sender_details?.type
                        }
                      </p>
                      {(selectedInvitation.sender_details?.city || selectedInvitation.receiver_details?.city) && (
                        <p className="text-sm text-gray-600">
                          {selectedInvitation.is_sender 
                            ? selectedInvitation.receiver_details?.city || selectedInvitation.receiver_details?.province
                            : selectedInvitation.sender_details?.city || selectedInvitation.sender_details?.province
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Fechas:</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Enviada:</span>
                        <span className="text-sm font-medium">
                          {new Date(selectedInvitation.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {selectedInvitation.responded_at && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Respondida:</span>
                          <span className="text-sm font-medium">
                            {new Date(selectedInvitation.responded_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {selectedInvitation.expires_at && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Expira:</span>
                          <span className="text-sm font-medium">
                            {new Date(selectedInvitation.expires_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Message */}
                {selectedInvitation.message && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Mensaje:</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">{selectedInvitation.message}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedInvitation.status === 'pending' && (
                  <div className="flex space-x-3 pt-4 border-t">
                    {!selectedInvitation.is_sender ? (
                      <>
                        <button
                          onClick={() => {
                            handleAcceptInvitation(selectedInvitation);
                            setIsDetailModalOpen(false);
                          }}
                          disabled={processingInvitation === selectedInvitation.id}
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          Aceptar Invitación
                        </button>
                        <button
                          onClick={() => {
                            handleRejectInvitation(selectedInvitation);
                            setIsDetailModalOpen(false);
                          }}
                          disabled={processingInvitation === selectedInvitation.id}
                          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          Rechazar Invitación
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          handleCancelInvitation(selectedInvitation);
                          setIsDetailModalOpen(false);
                        }}
                        disabled={processingInvitation === selectedInvitation.id}
                        className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50"
                      >
                        Cancelar Invitación
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </LeagueLayout>
  );
}