'use client';

import { useAuth } from '@/contexts/AuthContext';
import ClubLayout from '@/components/clubs/ClubLayout';
import { useEffect, useState } from 'react';
import {
  TrophyIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  CalendarIcon,
  GlobeAltIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { League, Club } from '@/types';
import axios from '@/lib/axios';

type LeagueWithStatus = League & { status?: 'active' | 'inactive' | string; clubs_count?: number };

export default function ClubLeaguesPage() {
  const { user } = useAuth();
  const [leagues, setLeagues] = useState<LeagueWithStatus[]>([]);
  const [currentClub, setCurrentClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [provinceFilter, setProvinceFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Leagues - User:', user);
        console.log('Leagues - User role:', user?.role);
        console.log('Leagues - User ID:', user?.id);

        if (!user) {
          setLoading(false);
          return;
        }

        if (user.role === 'club') {
          // First, get the club information
          const clubsResponse = await axios.get('/api/clubs');
            console.log('Leagues - Clubs response:', clubsResponse.data);
            
            const allClubs = clubsResponse.data.data;
            const userClub = allClubs.data.find((club: Club) => club.user_id === user.id);
            console.log('Leagues - User club found:', userClub);
            
            if (userClub) {
              setCurrentClub(userClub);
            }
        }

        // Fetch all leagues
        const leaguesResponse = await axios.get('/api/leagues');
        console.log('Leagues - Leagues response:', leaguesResponse.data);
        
        const allLeagues = leaguesResponse.data.data;
        const leaguesData = Array.isArray(allLeagues.data) ? allLeagues.data : allLeagues;
        console.log('Leagues - Processed leagues:', leaguesData);
        
        setLeagues(leaguesData);
      } catch (error) {
        console.error('Error fetching leagues data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const filteredLeagues = leagues.filter(league => {
    const matchesSearch = 
      league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      league.province?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || league.status === statusFilter;
    
    const matchesProvince = provinceFilter === 'all' || league.province === provinceFilter;
    
    return matchesSearch && matchesStatus && matchesProvince;
  });

  const stats = {
    total: leagues.length,
    active: leagues.filter(l => l.status === 'active').length,
    inactive: leagues.filter(l => l.status === 'inactive').length,
    provinces: [...new Set(leagues.map(l => l.province).filter(Boolean))].length,
  };

  const provinces = [...new Set(leagues.map(l => l.province).filter(Boolean))].sort();

  const handleJoinLeague = async (leagueId: number) => {
    try {
      if (!currentClub) {
        alert('No se pudo identificar tu club');
        return;
      }

      // Here you would implement the logic to join a league
      // This might involve creating a relationship between club and league
      console.log('Joining league:', leagueId, 'with club:', currentClub.id);
      
      // For now, just show a message
      alert('Funcionalidad de unirse a liga en desarrollo');
      
    } catch (error) {
      console.error('Error joining league:', error);
      alert('Error al intentar unirse a la liga');
    }
  };

  if (loading) {
    return (
      <ClubLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
        </div>
      </ClubLayout>
    );
  }

  if (!user || (user.role !== 'club' && user.role !== 'super_admin')) {
    return (
      <ClubLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Acceso Denegado</h2>
          <p className="text-gray-600 mt-2">No tienes permisos para acceder a esta página.</p>
        </div>
      </ClubLayout>
    );
  }

  return (
    <ClubLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {currentClub ? `Ligas para ${currentClub.name}` : 'Gestión de Ligas'}
              </h1>
              <p className="text-yellow-100 mt-2">
                {currentClub ? `Explora y únete a ligas disponibles en ${currentClub.city}` : 'Administra las ligas del sistema'}
              </p>
            </div>
            <div className="text-right">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <TrophyIcon className="h-12 w-12 text-white mx-auto mb-2" />
                <p className="font-semibold">Ligas Deportivas</p>
                <p className="text-yellow-200 text-sm">Competencias Oficiales</p>
              </div>
            </div>
          </div>
        </div>

        {/* Club Info Banner */}
        {currentClub && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <BuildingOfficeIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{currentClub.name}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center space-x-1">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{currentClub.city}</span>
                  </div>
                  {currentClub.league && (
                    <div className="flex items-center space-x-1">
                      <TrophyIcon className="h-4 w-4" />
                      <span>Liga actual: {currentClub.league.name}</span>
                    </div>
                  )}
                </div>
              </div>
              {currentClub.league ? (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Afiliado
                </div>
              ) : (
                <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  Sin Liga
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <TrophyIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Ligas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Activas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full">
                <XCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactivas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <GlobeAltIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Provincias</p>
                <p className="text-2xl font-bold text-gray-900">{stats.provinces}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o provincia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activas</option>
                  <option value="inactive">Inactivas</option>
                </select>
              </div>
              
              <select
                value={provinceFilter}
                onChange={(e) => setProvinceFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="all">Todas las provincias</option>
                {provinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Leagues Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredLeagues.length === 0 ? (
            <div className="text-center py-12">
              <TrophyIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm || statusFilter !== 'all' || provinceFilter !== 'all' 
                  ? 'No se encontraron ligas' 
                  : 'No hay ligas disponibles'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || provinceFilter !== 'all'
                  ? 'Intenta ajustar los filtros de búsqueda.'
                  : 'Contacta con el administrador para crear nuevas ligas.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredLeagues.map((league) => (
                <div key={league.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-6">
                    {/* League Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-yellow-100 p-2 rounded-lg">
                          <TrophyIcon className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{league.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              league.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {league.status === 'active' ? (
                                <>
                                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                                  Activa
                                </>
                              ) : (
                                <>
                                  <XCircleIcon className="h-3 w-3 mr-1" />
                                  Inactiva
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* League Info */}
                    <div className="space-y-3 mb-6">
                      {league.province && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{league.province}</span>
                        </div>
                      )}
                      
                      {league.clubs_count !== undefined && (
                        <div className="flex items-center text-sm text-gray-600">
                          <UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{league.clubs_count} clubes afiliados</span>
                        </div>
                      )}

                      {league.created_at && (
                        <div className="flex items-center text-sm text-gray-600">
                          <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span>Creada: {new Date(league.created_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleJoinLeague(league.id)}
                        disabled={league.status !== 'active'}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                          league.status === 'active'
                            ? 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {currentClub?.league?.id === league.id ? 'Ya Afiliado' : 'Solicitar Afiliación'}
                      </button>
                      
                      <button
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors duration-200"
                        title="Ver detalles"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">Información sobre Afiliaciones</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Las solicitudes de afiliación deben ser aprobadas por la liga correspondiente</li>
                  <li>Un club puede estar afiliado a múltiples ligas según las regulaciones</li>
                  <li>Solo las ligas activas aceptan nuevas afiliaciones</li>
                  <li>Contacta con el administrador de la liga para más información sobre requisitos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClubLayout>
  );
}