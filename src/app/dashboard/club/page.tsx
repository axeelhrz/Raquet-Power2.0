'use client';

import { useAuth } from '@/contexts/AuthContext';
import ClubLayout from '@/components/clubs/ClubLayout';
import { useEffect, useState, useCallback } from 'react';
import { 
  UsersIcon, 
  TrophyIcon, 
  ChartBarIcon, 
  PlusIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import axios from '@/lib/axios';
import type { Member, League, Club } from '@/types';
import Link from 'next/link';

interface ClubStats {
  total_members: number;
  active_members: number;
  male_members: number;
  female_members: number;
}

export default function ClubDashboardPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<ClubStats | null>(null);
  const [recentMembers, setRecentMembers] = useState<Member[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [currentClub, setCurrentClub] = useState<Club | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoadingData(true);
      console.log('Dashboard - User:', user);
      console.log('Dashboard - User role:', user?.role);
      console.log('Dashboard - User ID:', user?.id);

      if (!user) return;

      if (user.role === 'club') {
        // Fetch clubs to find the current user's club
        const clubsResponse = await axios.get('/api/clubs');
        console.log('Dashboard - Clubs response:', clubsResponse.data);
        
        const allClubs = clubsResponse.data.data; // Estructura paginada
        console.log('Dashboard - All clubs:', allClubs);
        
        // Find the club that belongs to this user
        const userClub = allClubs.data.find((club: Club) => club.user_id === user.id);
        console.log('Dashboard - User club found:', userClub);
        
        if (userClub) {
          setCurrentClub(userClub);
          
          // Fetch members for this specific club
          console.log('Dashboard - Fetching members for club:', userClub.id);
          const membersResponse = await axios.get(`/api/members?club_id=${userClub.id}`);
          console.log('Dashboard - Members response:', membersResponse.data);
          
          let members: Member[] = [];
          if (membersResponse.data.data) {
            // Handle both paginated and non-paginated responses
            members = Array.isArray(membersResponse.data.data.data) 
              ? membersResponse.data.data.data 
              : Array.isArray(membersResponse.data.data)
              ? membersResponse.data.data
              : [];
          }
          
            console.log('Dashboard - Club members:', members);

          // Calculate stats for this specific club
          const clubStats: ClubStats = {
            total_members: members.length,
            active_members: members.filter(member => member.status === 'active').length,
            male_members: members.filter(member => member.gender === 'male').length,
            female_members: members.filter(member => member.gender === 'female').length,
          };

          setStats(clubStats);
          setRecentMembers(members.slice(0, 6)); // Last 6 members
        }
      } else if (user.role === 'super_admin') {
        // Super admin can see all data
        const [membersResponse] = await Promise.all([
          axios.get('/api/members'),
          axios.get('/api/clubs')
        ]);
        
        const allMembers = membersResponse.data.data;
        const members = Array.isArray(allMembers.data) ? allMembers.data : allMembers;
        
        const clubStats: ClubStats = {
          total_members: members.length,
          active_members: members.filter((member: Member) => member.status === 'active').length,
          male_members: members.filter((member: Member) => member.gender === 'male').length,
          female_members: members.filter((member: Member) => member.gender === 'female').length,
        };

        setStats(clubStats);
        setRecentMembers(members.slice(0, 6));
      }

      // Fetch leagues (available for all roles)
      const leaguesResponse = await axios.get('/api/leagues');
      console.log('Dashboard - Leagues response:', leaguesResponse.data);
      
      const allLeagues = leaguesResponse.data.data;
      const leaguesData = Array.isArray(allLeagues.data) ? allLeagues.data : allLeagues;
      setLeagues(leaguesData.slice(0, 3)); // First 3 leagues

    } catch (error) {
      console.error('Dashboard - Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && (user.role === 'club' || user.role === 'super_admin')) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  if (loading || loadingData) {
    return (
      <ClubLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        </div>
      </ClubLayout>
    );
  }

  if (!user || (user.role !== 'club' && user.role !== 'super_admin')) {
    return (
      <ClubLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-xl font-semibold text-red-800">Acceso Denegado</h1>
          <p className="text-red-600 mt-2">No tienes permisos para acceder a esta página.</p>
        </div>
      </ClubLayout>
    );
  }

  const clubName = currentClub?.name || user?.name || 'Mi Club';
  const clubCity = currentClub?.city || user?.city;

  return (
    <ClubLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">¡Bienvenido al Dashboard!</h1>
              <p className="text-green-100 text-lg">
                {currentClub ? `Gestiona ${currentClub.name} de manera eficiente` : 'Gestiona tu club de manera eficiente desde aquí'}
              </p>
              <div className="flex items-center mt-4 space-x-6 text-green-200">
                {clubCity && (
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    <span>{clubCity}</span>
                  </div>
                )}
                {currentClub?.league && (
                  <div className="flex items-center">
                    <TrophyIcon className="h-5 w-5 mr-2" />
                    <span>Liga: {currentClub.league.name}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <BuildingOfficeIcon className="h-12 w-12 text-white mx-auto mb-2" />
                <p className="font-semibold">{clubName}</p>
                <p className="text-green-200 text-sm">Club Deportivo</p>
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
                  <UsersIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Miembros</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.total_members || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <UserGroupIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Miembros Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.active_members || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <UsersIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Hombres</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.male_members || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                  <UsersIcon className="h-6 w-6 text-pink-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Mujeres</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.female_members || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/dashboard/club/members"
              className="flex items-center p-6 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <PlusIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="font-semibold text-gray-900">Gestionar Miembros</p>
                <p className="text-sm text-gray-500">Agregar y administrar miembros</p>
              </div>
            </Link>

            <Link 
              href="/leagues"
              className="flex items-center p-6 border-2 border-gray-200 rounded-xl hover:border-yellow-300 hover:bg-yellow-50 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                <TrophyIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="font-semibold text-gray-900">Ver Ligas</p>
                <p className="text-sm text-gray-500">Ligas disponibles y afiliaciones</p>
              </div>
            </Link>

            <Link 
              href="/sports"
              className="flex items-center p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="font-semibold text-gray-900">Deportes</p>
                <p className="text-sm text-gray-500">Gestionar deportes del club</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Members */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Miembros Recientes</h3>
                <Link 
                  href="/dashboard/club/members"
                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  Ver todos
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentMembers.length > 0 ? (
                <div className="space-y-4">
                  {recentMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <UsersIcon className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {member.first_name} {member.last_name}
                          </p>
                          <p className="text-sm text-gray-500">{member.email || 'Sin email'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          member.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {member.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay miembros</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Comienza registrando el primer miembro de tu club.
                  </p>
                  <div className="mt-6">
                    <Link 
                      href="/dashboard/club/members"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                      Registrar Miembro
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Leagues */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Ligas Disponibles</h3>
                <Link 
                  href="/leagues"
                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  Ver todas
                </Link>
              </div>
            </div>
            <div className="p-6">
              {leagues.length > 0 ? (
                <div className="space-y-4">
                  {leagues.map((league) => (
                    <div key={league.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <TrophyIcon className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{league.name}</p>
                          <p className="text-sm text-gray-500">
                            {league.province && `${league.province}`}
                            {league.clubs_count && ` • ${league.clubs_count} clubes`}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        league.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {league.status === 'active' ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrophyIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay ligas disponibles</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Contacta con el administrador para unirte a una liga.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ClubLayout>
  );
}