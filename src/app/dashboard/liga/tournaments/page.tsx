'use client';

import { useAuth } from '@/contexts/AuthContext';
import LeagueLayout from '@/components/leagues/LeagueLayout';
import { useEffect, useState } from 'react';
import {
  TrophyIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ClockIcon,
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Tournament, Sport, TournamentForm } from '@/types';
import axios from '@/lib/axios';
import { isAxiosError } from 'axios';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';

type TournamentFormat = TournamentForm['tournament_format'];
type TournamentStatus = TournamentForm['status'];

export default function LigaTournamentsPage() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sportFilter, setSportFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get league ID from user data
  const getLeagueId = () => {
    if (user?.leagueEntity?.id) return user.leagueEntity.id;
    const roleEntity = user?.role_info?.entity as { id?: number } | undefined;
    if (roleEntity?.id) return roleEntity.id;
    return null;
  };

  const leagueId = getLeagueId();
  const leagueName: string = (user?.leagueEntity?.name as string) || (user?.role_info?.name as string) || 'Liga';
  const leagueProvince: string = (user?.leagueEntity?.province as string) || (user?.role_info?.province as string) || 'Provincia';

  const [newTournament, setNewTournament] = useState<TournamentForm>({
    name: '',
    description: '',
    league_id: leagueId || 0,
    sport_id: 0,
    start_date: '',
    end_date: '',
    registration_deadline: '',
    max_participants: 16,
    entry_fee: 0,
    prize_pool: 0,
    tournament_format: 'single_elimination',
    location: '',
    rules: '',
    status: 'upcoming'
  });

  // Update league_id when user data loads
  useEffect(() => {
    if (leagueId && newTournament.league_id === 0) {
      setNewTournament(prev => ({ ...prev, league_id: leagueId }));
    }
  }, [leagueId, newTournament.league_id]);

  // Fetch tournaments and sports
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!user) {
          setError('Usuario no autenticado');
          return;
        }
        
        if (user.role !== 'liga') {
          setError('Usuario no es administrador de liga');
          return;
        }
        
        if (!leagueId) {
          setError('No se encontró información de la liga para este usuario');
          return;
        }

        // Fetch tournaments for the current league
        const tournamentsResponse = await axios.get(`/api/tournaments?league_id=${leagueId}`);
        setTournaments(Array.isArray(tournamentsResponse.data) ? tournamentsResponse.data : []);

        // Fetch sports
        const sportsResponse = await axios.get('/api/sports');
        setSports(Array.isArray(sportsResponse.data) ? sportsResponse.data : []);
      } catch (error: unknown) {
        console.error('Error fetching data:', error);
        let message = 'Error al cargar los datos';
        if (isAxiosError(error)) {
          const data = error.response?.data as { message?: string } | undefined;
          if (data?.message) message = data.message;
        } else if (error instanceof Error) {
          message = error.message;
        }
        setError(message);
        setTournaments([]);
        setSports([]);
      } finally {
        setLoading(false);
      }
    };

    if (user && leagueId) {
      fetchData();
    }
  }, [user, leagueId]);

  // Filter tournaments
  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter;
    
    const matchesSport = sportFilter === 'all' || tournament.sport_id.toString() === sportFilter;
    
    return matchesSearch && matchesStatus && matchesSport;
  });

  // Calculate statistics
  const stats = {
    total: tournaments.length,
    upcoming: tournaments.filter(t => t.status === 'upcoming').length,
    active: tournaments.filter(t => t.status === 'active').length,
    completed: tournaments.filter(t => t.status === 'completed').length,
    participants: tournaments.reduce((sum, t) => sum + t.current_participants, 0)
  };
  // Handle create tournament
    const handleCreateTournament = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsProcessing(true);
      try {
        const response = await axios.post('/api/tournaments', newTournament);
        setTournaments(prev => [...prev, response.data]);
        setIsCreateModalOpen(false);
        resetForm();
      } catch (error: unknown) {
        console.error('Error creating tournament:', error);
        let message = 'Error al crear el torneo';
        if (isAxiosError(error)) {
          const data = error.response?.data as { message?: string } | undefined;
          if (data?.message) message = data.message;
        } else if (error instanceof Error) {
          message = error.message;
        }
        alert(message);
      } finally {
        setIsProcessing(false);
      }
    };
  
  // Handle edit tournament
      const handleEditTournament = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTournament) return;
        setIsProcessing(true);
        try {
          const response = await axios.put(`/api/tournaments/${selectedTournament.id}`, newTournament);
          setTournaments(prev => prev.map(t => t.id === selectedTournament.id ? response.data : t));
          setIsEditModalOpen(false);
          setSelectedTournament(null);
          resetForm();
        } catch (error: unknown) {
          console.error('Error updating tournament:', error);
          let message = 'Error al actualizar el torneo';
          if (isAxiosError(error)) {
            const data = error.response?.data as { message?: string } | undefined;
            if (data?.message) message = data.message;
          } else if (error instanceof Error) {
            message = error.message;
          }
          alert(message);
        } finally {
          setIsProcessing(false);
        }
      };
  // Handle delete tournament
  const handleDeleteTournament = async () => {
    if (!selectedTournament) return;

    setIsProcessing(true);

    try {
      await axios.delete(`/api/tournaments/${selectedTournament.id}`);
      console.log('Tournament deleted:', selectedTournament.id);
      
      setTournaments(prev => prev.filter(t => t.id !== selectedTournament.id));
      setIsDeleteModalOpen(false);
      setSelectedTournament(null);
    } catch (error: unknown) {
      console.error('Error deleting tournament:', error);
      let message = 'Error al eliminar el torneo';
      if (isAxiosError(error)) {
        const data = error.response?.data as { message?: string } | undefined;
        if (data?.message) message = data.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      alert(message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setNewTournament({
      name: '',
      description: '',
      league_id: leagueId || 0,
      sport_id: 0,
      start_date: '',
      end_date: '',
      registration_deadline: '',
      max_participants: 16,
      entry_fee: 0,
      prize_pool: 0,
      tournament_format: 'single_elimination',
      location: '',
      rules: '',
      status: 'upcoming'
    });
  };

  // Open edit modal
  const openEditModal = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setNewTournament({
      name: tournament.name,
      description: tournament.description || '',
      league_id: tournament.league_id,
      sport_id: tournament.sport_id,
      start_date: tournament.start_date,
      end_date: tournament.end_date,
      registration_deadline: tournament.registration_deadline,
      max_participants: tournament.max_participants,
      entry_fee: tournament.entry_fee,
      prize_pool: tournament.prize_pool,
      tournament_format: tournament.tournament_format,
      location: tournament.location || '',
      rules: tournament.rules || '',
      status: tournament.status
    });
    setIsEditModalOpen(true);
  };

  // Open view modal
  const openViewModal = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setIsViewModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setIsDeleteModalOpen(true);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const badges = {
      upcoming: { color: 'bg-blue-100 text-blue-800', icon: ClockIcon, text: 'Próximo' },
      active: { color: 'bg-green-100 text-green-800', icon: PlayIcon, text: 'Activo' },
      completed: { color: 'bg-gray-100 text-gray-800', icon: CheckCircleIcon, text: 'Completado' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, text: 'Cancelado' }
    };
    
    const badge = badges[status as keyof typeof badges] || badges.upcoming;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    );
  };

  // Get sport name
  const getSportName = (sportId: number) => {
    const sport = sports.find(s => s.id === sportId);
    return sport?.name || 'Deporte desconocido';
  };

  if (loading) {
    return (
      <LeagueLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
          <span className="ml-3 text-gray-600">Cargando torneos...</span>
        </div>
      </LeagueLayout>
    );
  }

  if (error) {
    return (
      <LeagueLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <TrophyIcon className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
            <p className="mt-1 text-sm text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
            >
              Reintentar
            </button>
          </div>
        </div>
      </LeagueLayout>
    );
  }

  return (
    <LeagueLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Torneos</h1>
            <p className="text-gray-600">{leagueName} - {leagueProvince}</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Nuevo Torneo
          </button>
        </div>

        {/* League Info Banner */}
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <TrophyIcon className="w-12 h-12 text-yellow-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{leagueName}</h2>
                <p className="text-gray-600">Provincia: {leagueProvince}</p>
                <p className="text-sm text-gray-500">
                  {stats.total} torneos organizados • {stats.participants} participantes totales
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <TrophyIcon className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Torneos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <ClockIcon className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Próximos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <PlayIcon className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Activos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <CheckCircleIcon className="w-8 h-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <UsersIcon className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Participantes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.participants}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar torneos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="upcoming">Próximos</option>
                <option value="active">Activos</option>
                <option value="completed">Completados</option>
                <option value="cancelled">Cancelados</option>
              </select>

              <select
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="all">Todos los deportes</option>
                {sports.map(sport => (
                  <option key={sport.id} value={sport.id.toString()}>{sport.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <TrophyIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay torneos</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || sportFilter !== 'all' 
                  ? 'No se encontraron torneos con los filtros aplicados.'
                  : 'Comienza creando tu primer torneo.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && sportFilter === 'all' && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
                >
                  Crear Primer Torneo
                </button>
              )}
            </div>
          ) : (
            filteredTournaments.map((tournament) => (
              <div key={tournament.id} className="bg-white rounded-lg shadow border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{tournament.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{getSportName(tournament.sport_id)}</p>
                      {getStatusBadge(tournament.status)}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
                    </div>
                    
                    {tournament.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPinIcon className="w-4 h-4 mr-2" />
                        {tournament.location}
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <UsersIcon className="w-4 h-4 mr-2" />
                      {tournament.current_participants}/{tournament.max_participants} participantes
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                      Inscripción: ${tournament.entry_fee} • Premio: ${tournament.prize_pool}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => openViewModal(tournament)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver detalles"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(tournament)}
                      className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(tournament)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Tournament Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Crear Nuevo Torneo</h3>
                  <button
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      resetForm();
                    }}
                    disabled={isProcessing}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleCreateTournament} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Torneo *
                      </label>
                      <input
                        type="text"
                        required
                        value={newTournament.name}
                        onChange={(e) => setNewTournament(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="Ej: Torneo Nacional de Tenis 2025"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deporte *
                      </label>
                      <select
                        required
                        value={newTournament.sport_id}
                        onChange={(e) => setNewTournament(prev => ({ ...prev, sport_id: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar deporte</option>
                        {sports.map(sport => (
                          <option key={sport.id} value={sport.id}>{sport.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Inicio *
                      </label>
                      <input
                        type="date"
                        required
                        value={newTournament.start_date}
                        onChange={(e) => setNewTournament(prev => ({ ...prev, start_date: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Fin *
                      </label>
                      <input
                        type="date"
                        required
                        value={newTournament.end_date}
                        onChange={(e) => setNewTournament(prev => ({ ...prev, end_date: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Límite de Inscripción *
                      </label>
                      <input
                        type="date"
                        required
                        value={newTournament.registration_deadline}
                        onChange={(e) => setNewTournament(prev => ({ ...prev, registration_deadline: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Máximo Participantes *
                      </label>
                      <input
                        type="number"
                        required
                        min="2"
                        value={newTournament.max_participants}
                        onChange={(e) => setNewTournament(prev => ({ ...prev, max_participants: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cuota de Inscripción ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newTournament.entry_fee}
                        onChange={(e) => setNewTournament(prev => ({ ...prev, entry_fee: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bolsa de Premios ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newTournament.prize_pool}
                        onChange={(e) => setNewTournament(prev => ({ ...prev, prize_pool: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Formato *
                      </label>
                      <select
                        required
                        value={newTournament.tournament_format}
                        onChange={(e) => setNewTournament(prev => ({ ...prev, tournament_format: e.target.value as TournamentFormat }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      >
                        <option value="single_elimination">Eliminación Simple</option>
                        <option value="double_elimination">Doble Eliminación</option>
                        <option value="round_robin">Round Robin</option>
                        <option value="swiss_system">Sistema Suizo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ubicación
                      </label>
                      <input
                        type="text"
                        value={newTournament.location}
                        onChange={(e) => setNewTournament(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="Ej: Centro Deportivo Nacional, Quito"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      rows={3}
                      value={newTournament.description}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Descripción del torneo..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reglas
                    </label>
                    <textarea
                      rows={3}
                      value={newTournament.rules}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, rules: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Reglas específicas del torneo..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateModalOpen(false);
                        resetForm();
                      }}
                      disabled={isProcessing}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? 'Creando...' : 'Crear Torneo'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Tournament Modal */}
        {isEditModalOpen && selectedTournament && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Editar Torneo</h3>
                  <button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setSelectedTournament(null);
                      resetForm();
                    }}
                    disabled={isProcessing}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleEditTournament} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Torneo *
                      </label>
                      <input
                        type="text"
                        required
                        value={newTournament.name}
                        onChange={(e) => setNewTournament(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                      </label>
                      <select
                        value={newTournament.status}
                        onChange={(e) => setNewTournament(prev => ({ ...prev, status: e.target.value as TournamentStatus }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      >
                        <option value="upcoming">Próximo</option>
                        <option value="active">Activo</option>
                        <option value="completed">Completado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deporte *
                      </label>
                      <select
                        required
                        value={newTournament.sport_id}
                        onChange={(e) => setNewTournament(prev => ({ ...prev, sport_id: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar deporte</option>
                        {sports.map(sport => (
                          <option key={sport.id} value={sport.id}>{sport.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Máximo Participantes *
                      </label>
                      <input
                        type="number"
                        required
                        min="2"
                        value={newTournament.max_participants}
                        onChange={(e) => setNewTournament(prev => ({ ...prev, max_participants: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditModalOpen(false);
                        setSelectedTournament(null);
                        resetForm();
                      }}
                      disabled={isProcessing}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Tournament Modal */}
        {isViewModalOpen && selectedTournament && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Detalles del Torneo</h3>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{selectedTournament.name}</h4>
                    <p className="text-gray-600">{getSportName(selectedTournament.sport_id)}</p>
                    <div className="mt-2">{getStatusBadge(selectedTournament.status)}</div>
                  </div>

                  {selectedTournament.description && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Descripción</h5>
                      <p className="text-gray-600">{selectedTournament.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Fechas</h5>
                      <p className="text-sm text-gray-600">
                        Inicio: {new Date(selectedTournament.start_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Fin: {new Date(selectedTournament.end_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Límite inscripción: {new Date(selectedTournament.registration_deadline).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Participantes</h5>
                      <p className="text-sm text-gray-600">
                        Actual: {selectedTournament.current_participants}
                      </p>
                      <p className="text-sm text-gray-600">
                        Máximo: {selectedTournament.max_participants}
                      </p>
                      <p className="text-sm text-gray-600">
                        Formato: {selectedTournament.tournament_format}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Costos</h5>
                      <p className="text-sm text-gray-600">
                        Inscripción: ${selectedTournament.entry_fee}
                      </p>
                      <p className="text-sm text-gray-600">
                        Premio: ${selectedTournament.prize_pool}
                      </p>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Progreso</h5>
                      <p className="text-sm text-gray-600">
                        Partidos jugados: {selectedTournament.matches_played}
                      </p>
                      <p className="text-sm text-gray-600">
                        Total partidos: {selectedTournament.matches_total}
                      </p>
                    </div>
                  </div>

                  {selectedTournament.location && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Ubicación</h5>
                      <p className="text-gray-600">{selectedTournament.location}</p>
                    </div>
                  )}

                  {selectedTournament.rules && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Reglas</h5>
                      <p className="text-gray-600">{selectedTournament.rules}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteTournament}
          title="Eliminar Torneo"
          message={`¿Estás seguro de que deseas eliminar el torneo "${selectedTournament?.name}"? Esta acción no se puede deshacer.`}
        />
      </div>
    </LeagueLayout>
  );
}