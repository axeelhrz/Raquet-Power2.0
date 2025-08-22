'use client';

import { useAuth } from '@/contexts/AuthContext';
import LeagueLayout from '@/components/leagues/LeagueLayout';
import { useEffect, useState } from 'react';
import {
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XMarkIcon,
  TrophyIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import axios from '@/lib/axios';
import type { AxiosError } from 'axios';

// Local form state interface (replaces mismatched imported SendInvitationForm)
interface InvitationFormState {
  receiver_id: number;
  receiver_type: string;
  message: string;
  expires_at: string;
}

interface AvailableEntity {
  id: number;
  name: string;
  city?: string;
  province?: string;
  address?: string;
  phone?: string;
  email?: string;
  status?: string;
  league_id?: number;
  league_name?: string;
  type: 'club' | 'league';
}

  export default function SendInvitationsPage() {
    const { user } = useAuth();
    const [entities, setEntities] = useState<AvailableEntity[]>([]);
    const [filteredEntities, setFilteredEntities] = useState<AvailableEntity[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedEntity, setSelectedEntity] = useState<AvailableEntity | null>(null);
    const [invitationForm, setInvitationForm] = useState<InvitationFormState>({
      receiver_id: 0,
      receiver_type: '',
      message: '',
      expires_at: ''
    });
    const [sending, setSending] = useState(false);
  
    const isLeague = user?.role === 'liga';
    const entityTypePlural = isLeague ? 'clubes' : 'ligas';

  useEffect(() => {
    fetchAvailableEntities();
  }, []);

  useEffect(() => {
    const filtered = entities.filter(entity =>
      entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entity.city && entity.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entity.province && entity.province.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredEntities(filtered);
  }, [entities, searchTerm]);

  const fetchAvailableEntities = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/invitations/available-entities');
      setEntities(response.data.data || []);
    } catch (error) {
      console.error('Error fetching available entities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = (entity: AvailableEntity) => {
    setSelectedEntity(entity);
    setInvitationForm({
      receiver_id: entity.id,
      receiver_type: entity.type === 'club' ? 'App\\Models\\Club' : 'App\\Models\\League',
      message: isLeague 
        ? `¡Hola ${entity.name}! Te invitamos a unirte a nuestra liga. Creemos que sería una excelente oportunidad para tu club formar parte de nuestra comunidad deportiva.`
        : `¡Hola ${entity.name}! Nos gustaría solicitar la afiliación de nuestro club a su liga. Creemos que podemos contribuir positivamente a su organización.`,
      expires_at: ''
    });
    setShowModal(true);
  };

  const submitInvitation = async () => {
    if (!invitationForm.message.trim()) {
      alert('Por favor, escribe un mensaje para la invitación.');
      return;
    }

    try {
      setSending(true);
      const payload = {
        receiver_id: invitationForm.receiver_id,
        receiver_type: invitationForm.receiver_type,
        message: invitationForm.message,
        expires_at: invitationForm.expires_at || undefined
      };
      await axios.post('/api/invitations', payload);
      setInvitationForm({
        receiver_id: 0,
        receiver_type: '',
        message: '',
        expires_at: ''
      });
      setShowModal(false);
      
      // Refresh the list
    } catch (error: unknown) {
      console.error('Error sending invitation:', error);
      let errorMessage = 'Error al enviar la invitación';
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      alert(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const getEntityIcon = (entity: AvailableEntity) => {
    return entity.type === 'club' ? BuildingOfficeIcon : TrophyIcon;
  };

  const getEntityColor = (entity: AvailableEntity) => {
    return entity.type === 'club' ? 'text-blue-600' : 'text-yellow-600';
  };

  const getEntityBgColor = (entity: AvailableEntity) => {
    return entity.type === 'club' ? 'bg-blue-50' : 'bg-yellow-50';
  };

  const getEntityBorderColor = (entity: AvailableEntity) => {
    return entity.type === 'club' ? 'border-blue-200' : 'border-yellow-200';
  };

  const getStatusBadge = (entity: AvailableEntity) => {
    if (entity.type === 'club' && entity.league_id) {
      return (
        <div className="flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
          <ExclamationTriangleIcon className="h-3 w-3" />
          <span>Ya en liga: {entity.league_name}</span>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <LeagueLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
        </div>
      </LeagueLayout>
    );
  }

  return (
    <LeagueLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <PaperAirplaneIcon className="h-8 w-8 text-yellow-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isLeague ? 'Invitar Clubes' : 'Solicitar Unirse a Liga'}
                </h1>
                <p className="text-gray-600">
                  {isLeague 
                    ? 'Invita clubes para que se unan a tu liga'
                    : 'Solicita la afiliación de tu club a una liga'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Buscar ${entityTypePlural}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Entities List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              {entityTypePlural.charAt(0).toUpperCase() + entityTypePlural.slice(1)} Disponibles ({filteredEntities.length})
            </h2>
          </div>
          
          {filteredEntities.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No hay {entityTypePlural} disponibles
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm 
                  ? `No se encontraron ${entityTypePlural} que coincidan con "${searchTerm}"`
                  : `No hay ${entityTypePlural} disponibles en este momento.`
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredEntities.map((entity) => {
                const IconComponent = getEntityIcon(entity);
                return (
                  <div key={entity.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${getEntityBgColor(entity)} ${getEntityBorderColor(entity)} border`}>
                          <IconComponent className={`h-6 w-6 ${getEntityColor(entity)}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{entity.name}</h3>
                          <div className="flex items-center space-x-4 mt-1">
                            {entity.city && (
                              <div className="flex items-center text-sm text-gray-500">
                                <MapPinIcon className="h-4 w-4 mr-1" />
                                {entity.city}
                                {entity.province && entity.province !== entity.city && `, ${entity.province}`}
                              </div>
                            )}
                            {entity.phone && (
                              <span className="text-sm text-gray-500">{entity.phone}</span>
                            )}
                          </div>
                          {entity.address && (
                            <p className="text-sm text-gray-500 mt-1">{entity.address}</p>
                          )}
                          <div className="flex items-center space-x-2 mt-2">
                            {getStatusBadge(entity)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendInvitation(entity)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                        {isLeague ? 'Enviar Invitación' : 'Solicitar Unirse'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && selectedEntity && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {isLeague ? 'Enviar Invitación' : 'Solicitar Unirse'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getEntityBgColor(selectedEntity)} ${getEntityBorderColor(selectedEntity)} border`}>
                    {selectedEntity.type === 'club' ? (
                      <BuildingOfficeIcon className={`h-5 w-5 ${getEntityColor(selectedEntity)}`} />
                    ) : (
                      <TrophyIcon className={`h-5 w-5 ${getEntityColor(selectedEntity)}`} />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedEntity.name}</h4>
                    {selectedEntity.city && (
                      <p className="text-sm text-gray-500">{selectedEntity.city}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensaje *
                    </label>
                    <textarea
                      value={invitationForm.message}
                      onChange={(e) => setInvitationForm({ ...invitationForm, message: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder={isLeague 
                        ? "Escribe un mensaje personalizado para la invitación..."
                        : "Explica por qué tu club quiere unirse a esta liga..."
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de expiración (opcional)
                    </label>
                    <input
                      type="date"
                      value={invitationForm.expires_at}
                      onChange={(e) => setInvitationForm({ ...invitationForm, expires_at: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={submitInvitation}
                    disabled={sending || !invitationForm.message.trim()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        {isLeague ? 'Enviar Invitación' : 'Enviar Solicitud'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </LeagueLayout>
  );
}