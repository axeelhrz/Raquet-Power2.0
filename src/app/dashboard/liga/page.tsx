'use client';

import { useAuth } from '@/contexts/AuthContext';
import LeagueLayout from '@/components/leagues/LeagueLayout';
import { useEffect, useState, useCallback } from 'react';
import { 
  UsersIcon, 
  BuildingOfficeIcon, 
  TrophyIcon,
  PlusIcon,
  BellIcon,
  PaperAirplaneIcon,
  CogIcon,
  CheckCircleIcon,
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import axios from '@/lib/axios';
import type { Club, Member, League, Sport, Invitation } from '@/types';
import Link from 'next/link';

interface LeagueStats {
  total_clubs: number;
  total_members: number;
  active_clubs: number;
  active_members: number;
  pending_invitations: number;
  sent_invitations: number;
  total_tournaments: number;
  active_tournaments: number;
  total_sports: number;
  growth_this_month: number;
  average_members_per_club: number;
}

interface Tournament {
  id: number;
  name: string;
  sport: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'completed';
  participants: number;
}

export default function LigaDashboardPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<LeagueStats | null>(null);
  const [recentClubs, setRecentClubs] = useState<Club[]>([]);
  const [, setRecentMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [, setTournaments] = useState<Tournament[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [currentLeague, setCurrentLeague] = useState<League | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoadingData(true);
      console.log('Liga Dashboard - User:', user);
      console.log('Liga Dashboard - User role:', user?.role);
      console.log('Liga Dashboard - User ID:', user?.id);

      if (!user) return;

      let clubs: Club[] = [];
      let members: Member[] = [];
      let sportsCount = 0;

      if (user.role === 'liga') {
        // Find the league that belongs to this user
        const leaguesResponse = await axios.get('/api/leagues');
        console.log('Liga Dashboard - Leagues response:', leaguesResponse.data);
        
        const allLeagues = leaguesResponse.data.data;
        const leaguesData = Array.isArray(allLeagues.data) ? allLeagues.data : allLeagues;
        const userLeague = leaguesData.find((league: League) => league.user_id === user.id);
        console.log('Liga Dashboard - User league found:', userLeague);
        
        if (userLeague) {
          setCurrentLeague(userLeague);
          
          // Get clubs affiliated to this league
          console.log('Liga Dashboard - Fetching clubs for league:', userLeague.id);
          const clubsResponse = await axios.get(`/api/clubs?league_id=${userLeague.id}`);
          console.log('Liga Dashboard - Clubs response:', clubsResponse.data);
          
          const allClubs = clubsResponse.data.data;
          clubs = Array.isArray(allClubs.data) ? allClubs.data : Array.isArray(allClubs) ? allClubs : [];
          console.log('Liga Dashboard - League clubs:', clubs);
          
          // Get members from clubs in this league
            if (clubs.length > 0) {
            const clubIds = clubs.map(club => club.id).join(',');
            console.log('Liga Dashboard - Fetching members for clubs:', clubIds);
            const membersResponse = await axios.get(`/api/members?club_ids=${clubIds}`);
            console.log('Liga Dashboard - Members response:', membersResponse.data);
            
            const allMembers = membersResponse.data.data;
            members = Array.isArray(allMembers.data) ? allMembers.data : Array.isArray(allMembers) ? allMembers : [];
            console.log('Liga Dashboard - League members:', members);
          }
        }
      } else if (user.role === 'super_admin') {
        // Super admin can see all data
        const [clubsResponse, membersResponse] = await Promise.all([
          axios.get('/api/clubs'),
          axios.get('/api/members')
        ]);
        
        const allClubs = clubsResponse.data.data;
        clubs = Array.isArray(allClubs.data) ? allClubs.data : allClubs;
        
        const allMembers = membersResponse.data.data;
        members = Array.isArray(allMembers.data) ? allMembers.data : allMembers;
      }

      // Fetch sports
      try {
        const sportsResponse = await axios.get('/api/sports');
        console.log('Liga Dashboard - Sports response:', sportsResponse.data);
        const allSports = sportsResponse.data.data;
        const sportsData = Array.isArray(allSports?.data) ? allSports.data : Array.isArray(allSports) ? allSports : [];
        setSports(sportsData);
        sportsCount = sportsData.length;
      } catch (error) {
        console.error('Liga Dashboard - Error fetching sports:', error);
        setSports([]);
        sportsCount = 0;
      }

      // Fetch real invitations data
      let realInvitations: Invitation[] = [];
      try {
        const invitationsResponse = await axios.get('/api/invitations');
        console.log('Liga Dashboard - Invitations response:', invitationsResponse.data);
        if (invitationsResponse.data.status === 'success') {
          const invitationsData = invitationsResponse.data.data;
          realInvitations = Array.isArray(invitationsData.data) ? invitationsData.data : Array.isArray(invitationsData) ? invitationsData : [];
        }
      } catch (error) {
        console.error('Liga Dashboard - Error fetching invitations:', error);
        realInvitations = [];
      }

      // Calculate statistics
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const newClubsThisMonth = clubs.filter(club => {
        const createdDate = new Date(club.created_at);
        return createdDate >= thisMonth;
      }).length;

      // Mock data for tournaments (replace with real API calls when available)
      const mockTournaments: Tournament[] = [
        {
          id: 1,
          name: 'Torneo Regional de Tenis',
          sport: 'Tenis',
          start_date: '2024-02-15',
          end_date: '2024-02-18',
          status: 'upcoming',
          participants: 32
        },
        {
          id: 2,
          name: 'Copa Padel Liga',
          sport: 'Padel',
          start_date: '2024-01-20',
          end_date: '2024-01-22',
          status: 'active',
          participants: 16
        }
      ];

      const leagueStats: LeagueStats = {
        total_clubs: clubs.length,
        total_members: members.length,
        active_clubs: clubs.filter(club => club.status === 'active').length,
        active_members: members.length, // Update if member status data becomes available
        pending_invitations: realInvitations.filter(inv => inv.status === 'pending').length,
        sent_invitations: realInvitations.filter(inv => inv.is_sender).length,
        total_tournaments: mockTournaments.length,
        active_tournaments: mockTournaments.filter(t => t.status === 'active').length,
        total_sports: sportsCount || 7, // Default to 7 if no sports in DB
        growth_this_month: newClubsThisMonth,
        average_members_per_club: clubs.length > 0 ? Math.round(members.length / clubs.length) : 0,
      };

      setStats(leagueStats);
      setRecentClubs(clubs.slice(0, 6)); // Last 6 clubs
      setRecentMembers(members.slice(0, 6)); // Last 6 members
      setInvitations(realInvitations.slice(0, 6)); // Last 6 invitations
      setTournaments(mockTournaments);

    } catch (error) {
      console.error('Liga Dashboard - Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && (user.role === 'liga' || user.role === 'super_admin')) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

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

  const leagueName = currentLeague?.name || user?.league_name || user?.name || 'Mi Liga';
  const leagueProvince = currentLeague?.province || user?.province;

  return (
    <LeagueLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">¡Bienvenido al Dashboard de Liga!</h1>
              <p className="text-yellow-100 text-lg">
                {currentLeague ? `Gestiona ${currentLeague.name} de manera eficiente` : 'Gestiona tu liga deportiva de manera eficiente'}
              </p>
              <div className="flex items-center mt-4 space-x-6 text-yellow-200">
                {leagueProvince && (
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    <span>{leagueProvince}</span>
                  </div>
                )}
                {currentLeague && (
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    <span>Desde: {new Date(currentLeague.created_at).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  <span>Liga Activa</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <TrophyIcon className="h-12 w-12 text-white mx-auto mb-2" />
                <p className="font-semibold">{leagueName}</p>
                <p className="text-yellow-200 text-sm">Liga Deportiva</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Clubes Afiliados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.total_clubs || 0}
                </p>
                <p className="text-xs text-gray-500">
                  {stats?.active_clubs || 0} activos
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <UsersIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Miembros</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.total_members || 0}
                </p>
                <p className="text-xs text-gray-500">
                  {stats?.active_members || 0} activos
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrophyIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Torneos Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.active_tournaments || 0}
                </p>
                <p className="text-xs text-gray-500">
                  {stats?.total_tournaments || 0} totales
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <BellIcon className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Invitaciones</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.pending_invitations || 0}
                </p>
                <p className="text-xs text-gray-500">
                  {stats?.sent_invitations || 0} enviadas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/dashboard/liga/clubs"
              className="flex items-center p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="font-semibold text-gray-900">Gestionar Clubes</p>
                <p className="text-sm text-gray-500">Ver y administrar clubes</p>
              </div>
            </Link>

            <Link 
              href="/dashboard/liga/tournaments"
              className="flex items-center p-6 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <TrophyIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="font-semibold text-gray-900">Crear Torneo</p>
                <p className="text-sm text-gray-500">Organizar competencias</p>
              </div>
            </Link>

            <Link 
              href="/dashboard/liga/sports"
              className="flex items-center p-6 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <CogIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="font-semibold text-gray-900">Configurar Deportes</p>
                <p className="text-sm text-gray-500">Parámetros y reglas</p>
              </div>
            </Link>

            <Link 
              href="/dashboard/liga/send-invitations"
              className="flex items-center p-6 border-2 border-gray-200 rounded-xl hover:border-yellow-300 hover:bg-yellow-50 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                <PaperAirplaneIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="font-semibold text-gray-900">Invitar Clubes</p>
                <p className="text-sm text-gray-500">Enviar invitaciones</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Clubs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Clubes Recientes</h3>
                <Link 
                  href="/dashboard/liga/clubs"
                  className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                >
                  Ver todos
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentClubs.length > 0 ? (
                <div className="space-y-4">
                  {recentClubs.map((club) => (
                    <div key={club.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{club.name}</p>
                          <p className="text-sm text-gray-500">
                            {club.city} • {club.members?.length || 0} miembros
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          club.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {club.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay clubes afiliados</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Los clubes aparecerán aquí cuando se afilien a tu liga.
                  </p>
                  <div className="mt-6">
                    <Link 
                      href="/dashboard/liga/send-invitations"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                    >
                      <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                      Invitar Clubes
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Invitations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Invitaciones Recientes</h3>
                <Link 
                  href="/dashboard/liga/invitations"
                  className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                >
                  Ver todas
                </Link>
              </div>
            </div>
            <div className="p-6">
              {invitations.length > 0 ? (
                <div className="space-y-4">
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          invitation.is_sender ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          {invitation.is_sender ? (
                            <PaperAirplaneIcon className="h-5 w-5 text-green-600" />
                          ) : (
                            <BellIcon className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {invitation.is_sender 
                              ? invitation.receiver_name 
                              : invitation.sender_name
                            }
                          </p>
                          <p className="text-sm text-gray-500">
                            {invitation.is_sender 
                              ? `Invitado • ${invitation.receiver_details?.city || ''}`
                              : `Solicita unirse • ${invitation.sender_details?.city || ''}`
                            }
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        invitation.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : invitation.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {invitation.status === 'pending' ? 'Pendiente' : 
                         invitation.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay invitaciones</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Las invitaciones aparecerán aquí cuando lleguen.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Deportes Configurados</p>
                <p className="text-2xl font-bold">{stats?.total_sports || 0}</p>
                <p className="text-xs text-blue-200">
                  {sports.length > 0 ? sports.map(s => s.name).join(', ') : 'Tenis, Padel, Pickleball...'}
                </p>
              </div>
              <CogIcon className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Promedio por Club</p>
                <p className="text-2xl font-bold">{stats?.average_members_per_club || 0}</p>
                <p className="text-xs text-green-200">Miembros por club</p>
              </div>
              <UserGroupIcon className="h-8 w-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Crecimiento Mensual</p>
                <p className="text-2xl font-bold">{stats?.growth_this_month || 0}</p>
                <p className="text-xs text-purple-200">Nuevos clubes</p>
              </div>
              <StarIcon className="h-8 w-8 text-purple-200" />
            </div>
          </div>
        </div>
      </div>
    </LeagueLayout>
  );
}