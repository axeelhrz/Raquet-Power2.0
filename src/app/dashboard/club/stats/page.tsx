'use client';

import { useAuth } from '@/contexts/AuthContext';
import ClubLayout from '@/components/clubs/ClubLayout';
import { useEffect, useState, useCallback } from 'react';
import {
  ChartBarIcon,
  UsersIcon,
  TrophyIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  ClockIcon,
  StarIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import { Member, Club } from '@/types';
import axios from '@/lib/axios';

interface ClubStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  maleMembers: number;
  femaleMembers: number;
  newMembersThisMonth: number;
  newMembersLastMonth: number;
  averageAge: number;
  membersByMonth: { month: string; count: number }[];
  membersByGender: { gender: string; count: number; percentage: number }[];
  membersByStatus: { status: string; count: number; percentage: number }[];
  recentActivity: {
    date: string;
    action: string;
    member: string;
    type: 'join' | 'leave' | 'update';
  }[];
}

export default function ClubStatsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ClubStats | null>(null);
  const [currentClub, setCurrentClub] = useState<Club | null>(null);
  const [, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months');

  const fetchData = useCallback(async () => {
    try {
      console.log('Stats - User:', user);
      console.log('Stats - User role:', user?.role);
      console.log('Stats - User ID:', user?.id);

      if (!user) return;

      if (user.role === 'club') {
        // First, get the club information
        const clubsResponse = await axios.get('/api/clubs');
        console.log('Stats - Clubs response:', clubsResponse.data);
        
        const allClubs = clubsResponse.data.data;
        const userClub = allClubs.data.find((club: Club) => club.user_id === user.id);
        console.log('Stats - User club found:', userClub);
        
        if (userClub) {
          setCurrentClub(userClub);
          
          // Fetch members for this specific club
            console.log('Stats - Fetching members for club:', userClub.id);
            const membersResponse = await axios.get(`/api/members?club_id=${userClub.id}`);
            console.log('Stats - Members response:', membersResponse.data);
            
            let clubMembers: Member[] = [];
            if (membersResponse.data.data) {
              clubMembers = Array.isArray(membersResponse.data.data.data) 
                ? membersResponse.data.data.data 
                : Array.isArray(membersResponse.data.data)
                ? membersResponse.data.data
                : [];
            }
            
            console.log('Stats - Club members:', clubMembers);
            setMembers(clubMembers);
            
            // Calculate detailed stats
            const calculatedStats = calculateStats(clubMembers);
            setStats(calculatedStats);
        }
      } else if (user.role === 'super_admin') {
        // Super admin can see all data
        const membersResponse = await axios.get('/api/members');
        const allMembers = membersResponse.data.data;
        const membersData = Array.isArray(allMembers.data) ? allMembers.data : allMembers;
        
        setMembers(membersData);
        const calculatedStats = calculateStats(membersData);
        setStats(calculatedStats);
      }

    } catch (error) {
      console.error('Error fetching stats data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const calculateStats = (members: Member[]): ClubStats => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Basic counts
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === 'active').length;
    const inactiveMembers = members.filter(m => m.status === 'inactive').length;
    const maleMembers = members.filter(m => m.gender === 'male').length;
    const femaleMembers = members.filter(m => m.gender === 'female').length;

    // New members this month and last month
    const newMembersThisMonth = members.filter(m => {
      const createdDate = new Date(m.created_at);
      return createdDate >= thisMonth;
    }).length;

    const newMembersLastMonth = members.filter(m => {
      const createdDate = new Date(m.created_at);
      return createdDate >= lastMonth && createdDate <= lastMonthEnd;
    }).length;

    // Average age calculation
    const membersWithAge = members.filter(m => m.birth_date);
    const averageAge = membersWithAge.length > 0 
      ? Math.round(membersWithAge.reduce((sum, m) => {
          const birthDate = new Date(m.birth_date!);
          const age = now.getFullYear() - birthDate.getFullYear();
          return sum + age;
        }, 0) / membersWithAge.length)
      : 0;

    // Members by month (last 6 months)
    const membersByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = members.filter(m => {
        const createdDate = new Date(m.created_at);
        return createdDate >= monthDate && createdDate < nextMonth;
      }).length;
      
      membersByMonth.push({
        month: monthDate.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
        count
      });
    }

    // Members by gender with percentages
    const membersByGender = [
      {
        gender: 'Masculino',
        count: maleMembers,
        percentage: totalMembers > 0 ? Math.round((maleMembers / totalMembers) * 100) : 0
      },
      {
        gender: 'Femenino',
        count: femaleMembers,
        percentage: totalMembers > 0 ? Math.round((femaleMembers / totalMembers) * 100) : 0
      }
    ];

    // Members by status with percentages
    const membersByStatus = [
      {
        status: 'Activos',
        count: activeMembers,
        percentage: totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0
      },
      {
        status: 'Inactivos',
        count: inactiveMembers,
        percentage: totalMembers > 0 ? Math.round((inactiveMembers / totalMembers) * 100) : 0
      }
    ];

    // Recent activity (simulated for now)
    const recentActivity = members.slice(0, 5).map((member, index) => ({
      date: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
      action: index % 3 === 0 ? 'Se unió al club' : index % 3 === 1 ? 'Actualizó perfil' : 'Cambió estado',
      member: `${member.first_name} ${member.last_name}`,
      type: (index % 3 === 0 ? 'join' : index % 3 === 1 ? 'update' : 'update') as 'join' | 'leave' | 'update'
    }));

    return {
      totalMembers,
      activeMembers,
      inactiveMembers,
      maleMembers,
      femaleMembers,
      newMembersThisMonth,
      newMembersLastMonth,
      averageAge,
      membersByMonth,
      membersByGender,
      membersByStatus,
      recentActivity
    };
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getGrowthPercentage = () => {
    if (!stats || stats.newMembersLastMonth === 0) return 0;
    return Math.round(((stats.newMembersThisMonth - stats.newMembersLastMonth) / stats.newMembersLastMonth) * 100);
  };

  const isGrowthPositive = () => {
    return stats ? stats.newMembersThisMonth >= stats.newMembersLastMonth : false;
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

  if (!stats) {
    return (
      <ClubLayout>
        <div className="text-center py-12">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay datos disponibles</h3>
          <p className="mt-1 text-sm text-gray-500">
            No se pudieron cargar las estadísticas del club.
          </p>
        </div>
      </ClubLayout>
    );
  }

  return (
    <ClubLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {currentClub ? `Estadísticas de ${currentClub.name}` : 'Estadísticas del Club'}
              </h1>
              <p className="text-blue-100 mt-2">
                {currentClub ? `Análisis detallado del rendimiento y crecimiento del club` : 'Análisis detallado del sistema'}
              </p>
            </div>
            <div className="text-right">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <ChartBarIcon className="h-12 w-12 text-white mx-auto mb-2" />
                <p className="font-semibold">Analytics</p>
                <p className="text-blue-200 text-sm">Datos en Tiempo Real</p>
              </div>
            </div>
          </div>
        </div>

        {/* Club Info Banner */}
        {currentClub && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
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
                      <span>Liga: {currentClub.league.name}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Desde: {new Date(currentClub.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Miembros</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalMembers}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <UsersIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Miembros Activos</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeMembers}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.totalMembers > 0 ? Math.round((stats.activeMembers / stats.totalMembers) * 100) : 0}% del total
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nuevos Este Mes</p>
                <p className="text-3xl font-bold text-purple-600">{stats.newMembersThisMonth}</p>
                <div className="flex items-center mt-1">
                  {isGrowthPositive() ? (
                    <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <p className={`text-xs ${isGrowthPositive() ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.abs(getGrowthPercentage())}% vs mes anterior
                  </p>
                </div>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <StarIcon className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Edad Promedio</p>
                <p className="text-3xl font-bold text-orange-600">{stats.averageAge}</p>
                <p className="text-xs text-gray-500 mt-1">años</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <ClockIcon className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Members by Month Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Nuevos Miembros por Mes</h3>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="6months">Últimos 6 meses</option>
                <option value="12months">Último año</option>
              </select>
            </div>
            <div className="space-y-4">
              {stats.membersByMonth.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-16 text-sm text-gray-600">{item.month}</div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                        style={{
                          width: `${stats.membersByMonth.length > 0 ? (item.count / Math.max(...stats.membersByMonth.map(m => m.count))) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-8 text-sm font-medium text-gray-900">{item.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Gender Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribución por Género</h3>
            <div className="space-y-6">
              {stats.membersByGender.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.gender}</span>
                    <span className="text-sm text-gray-500">{item.count} ({item.percentage}%)</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        index === 0 ? 'bg-blue-500' : 'bg-pink-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status Distribution and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Estado de Miembros</h3>
            <div className="space-y-6">
              {stats.membersByStatus.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {index === 0 ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-500" />
                      )}
                      <span className="text-sm font-medium text-gray-700">{item.status}</span>
                    </div>
                    <span className="text-sm text-gray-500">{item.count} ({item.percentage}%)</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        index === 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Actividad Reciente</h3>
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'join' ? 'bg-green-500' : 
                    activity.type === 'leave' ? 'bg-red-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.member}</span> {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {stats.recentActivity.length === 0 && (
              <div className="text-center py-8">
                <ClockIcon className="mx-auto h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">No hay actividad reciente</p>
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Tasa de Actividad</p>
                <p className="text-2xl font-bold">
                  {stats.totalMembers > 0 ? Math.round((stats.activeMembers / stats.totalMembers) * 100) : 0}%
                </p>
              </div>
              <FireIcon className="h-8 w-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Crecimiento Mensual</p>
                <p className="text-2xl font-bold">{stats.newMembersThisMonth}</p>
              </div>
              <TrophyIcon className="h-8 w-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Diversidad de Género</p>
                <p className="text-2xl font-bold">
                  {Math.min(
                    stats.membersByGender[0]?.percentage || 0,
                    stats.membersByGender[1]?.percentage || 0
                  )}%
                </p>
                <p className="text-xs text-blue-200">Género minoritario</p>
              </div>
              <UserGroupIcon className="h-8 w-8 text-blue-200" />
            </div>
          </div>
        </div>
      </div>
    </ClubLayout>
  );
}