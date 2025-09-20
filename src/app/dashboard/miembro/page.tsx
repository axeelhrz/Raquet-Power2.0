'use client';

import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { useEffect, useState, useCallback } from 'react';
import { 
  UserIcon, 
  TrophyIcon, 
  CalendarIcon, 
  CogIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  CakeIcon,
  StarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface MemberProfile {
  tournaments_participated: number;
  tournaments_won: number;
  current_ranking: string;
  last_activity: string;
}

interface ParentClub {
  name: string;
  league?: { name: string; province?: string };
  city?: string;
  address?: string;
}

interface ExtendedUser {
  parentClub?: ParentClub;
  rubber_type?: string;
  birth_date?: string;
  gender?: string;
  phone?: string;
  full_name: string;
  email: string;
  role: string;
}

export default function MiembroDashboardPage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const fetchProfileData = useCallback(async () => {
    if (!user || (user.role !== 'miembro' && user.role !== 'super_admin')) return;
    try {
      setLoadingData(true);
      
      // Simular datos del perfil del miembro
      // En una implementación real, esto vendría de la API
      const memberProfile: MemberProfile = {
        tournaments_participated: 12,
        tournaments_won: 3,
        current_ranking: 'Sin ranking',
        last_activity: '2024-01-15',
      };

      setProfile(memberProfile);

    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);



  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Guard: if user is null show access denied
  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center flex-col">
          <h1 className="text-xl font-semibold text-red-800">Acceso Denegado</h1>
          <p className="text-red-600 mt-2">No tienes permisos para acceder a esta página.</p>
        </div>
      </Layout>
    );
  }

  const isSuperAdmin = user.role === 'super_admin';
  const extendedUser = user as ExtendedUser;
  const parentClub = extendedUser.parentClub;
  const rubberType = extendedUser.rubber_type;
  const age = extendedUser.birth_date ? calculateAge(extendedUser.birth_date) : null;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className={`bg-gradient-to-r ${isSuperAdmin ? 'from-red-600 to-red-800' : 'from-purple-600 to-purple-800'} rounded-lg shadow-lg p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`h-20 w-20 rounded-full ${isSuperAdmin ? 'bg-red-500' : 'bg-purple-500'} flex items-center justify-center`}>
                {isSuperAdmin ? (
                  <ShieldCheckIcon className="h-12 w-12 text-white" />
                ) : (
                  <UserIcon className="h-12 w-12 text-white" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-3xl font-bold">
                    {isSuperAdmin ? 'Panel de Miembro' : 'Mi Perfil'}
                  </h1>
                  {isSuperAdmin && (
                    <ShieldCheckIcon className="h-8 w-8 text-white" />
                  )}
                </div>
                <p className={`${isSuperAdmin ? 'text-red-100' : 'text-purple-100'} mt-1 text-xl`}>
                  {isSuperAdmin ? 'Vista de Super Administrador' : user.full_name}
                </p>
                <div className="flex items-center mt-2 text-purple-200 text-sm">
                  <EnvelopeIcon className="h-4 w-4 mr-1" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center mt-1 text-purple-200 text-sm">
                    <PhoneIcon className="h-4 w-4 mr-1" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <p className={`${isSuperAdmin ? 'text-red-100' : 'text-purple-100'} text-sm`}>
                  {isSuperAdmin ? 'Super Administrador' : 'Miembro'}
                </p>
                {parentClub && (
                  <p className="text-white font-semibold">{parentClub.name}</p>
                )}
                {parentClub?.league && (
                  <p className={`${isSuperAdmin ? 'text-red-200' : 'text-purple-200'} text-sm`}>
                    {parentClub.league.name}
                  </p>
                )}
              </div> {/* Close user info container */}
            </div>
          </div>
        </div>

        {/* Personal Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CakeIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Edad</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {age ? `${age} años` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Género</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {user.gender === 'masculino' ? 'Masculino' : user.gender === 'femenino' ? 'Femenino' : 'N/A'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrophyIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tipo de Caucho</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {rubberType ? rubberType.charAt(0).toUpperCase() + rubberType.slice(1) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <StarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ranking</p>
              <p className="text-2xl font-semibold text-gray-900">
                {profile?.current_ranking || 'Sin ranking'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {parentClub && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <BuildingOfficeIcon className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">Mi Club</h3>
                </div>
                <p className="text-lg font-medium text-gray-900">{parentClub.name}</p>
                {parentClub.city && (
                  <div className="flex items-center mt-2 text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span>{parentClub.city}</span>
                  </div>
                )}
                {parentClub.address && (
                  <p className="text-sm text-gray-500 mt-1">{parentClub.address}</p>
                )}
              </div>
            )}

            {parentClub?.league && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <TrophyIcon className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">Liga</h3>
                </div>
                <p className="text-lg font-medium text-gray-900">{parentClub.league.name}</p>
                {parentClub.league.province && (
                  <div className="flex items-center mt-2 text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span>{parentClub.league.province}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <TrophyIcon className="h-6 w-6 text-yellow-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Ver Torneos</p>
                <p className="text-sm text-gray-500">Competencias disponibles</p>
              </div>
            </button>

            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <CalendarIcon className="h-6 w-6 text-blue-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Mi Calendario</p>
                <p className="text-sm text-gray-500">Próximos eventos</p>
              </div>
            </button>

            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <CogIcon className="h-6 w-6 text-purple-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Configuración</p>
                <p className="text-sm text-gray-500">Actualizar perfil</p>
              </div>
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {isSuperAdmin ? 'Estadísticas de Ejemplo' : 'Mis Estadísticas'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{profile?.tournaments_participated || 0}</div>
              <div className="text-sm text-gray-500">Torneos Participados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{profile?.tournaments_won || 0}</div>
              <div className="text-sm text-gray-500">Torneos Ganados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {profile?.tournaments_participated && profile?.tournaments_won 
                  ? Math.round((profile.tournaments_won / profile.tournaments_participated) * 100) 
                  : 0}%
              </div>
              <div className="text-sm text-gray-500">Tasa de Victoria</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}