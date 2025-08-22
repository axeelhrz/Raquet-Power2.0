'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon,
  UsersIcon,
  TrophyIcon,
  CogIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

interface ClubLayoutProps {
  children: React.ReactNode;
}

export default function ClubLayout({ children }: ClubLayoutProps) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard/club', 
      icon: HomeIcon,
      current: pathname === '/dashboard/club' 
    },
    { 
      name: 'Miembros', 
      href: '/dashboard/club/members', 
      icon: UsersIcon,
      current: pathname.startsWith('/dashboard/club/members') 
    },
    { 
      name: 'Ligas', 
      href: '/dashboard/club/leagues', 
      icon: TrophyIcon,
      current: pathname.startsWith('/dashboard/club/leagues') 
    },
    { 
      name: 'Estadísticas', 
      href: '/dashboard/club/stats', 
      icon: ChartBarIcon,
      current: pathname.startsWith('/dashboard/club/stats') 
    },
    { 
      name: 'Configuración', 
      href: '/dashboard/club/settings', 
      icon: CogIcon,
      current: pathname.startsWith('/dashboard/club/settings') 
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'club' && user.role !== 'super_admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h1 className="text-xl font-semibold text-red-800">Acceso Denegado</h1>
          <p className="text-red-600 mt-2">No tienes permisos para acceder a esta página.</p>
          <Link 
            href="/auth/sign-in" 
            className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  const roleInfo = user?.role_info;
  // Normalize clubName to always be a string (handles object shapes with a 'name' field) without using 'any'
  type ClubNameValue = string | { name?: string };
  const resolveClubName = (value: ClubNameValue | null | undefined): string => {
    if (!value) return '';
    return typeof value === 'string' ? value : value.name || '';
  };
  const clubName: string =
    resolveClubName(user?.club_name as ClubNameValue | undefined) ||
    (typeof roleInfo?.name === 'string' ? roleInfo.name : '') ||
    'Mi Club';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <BuildingOfficeIcon className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{clubName}</h1>
                  <p className="text-xs text-gray-500">Panel de Administración</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex">
        {/* Side Navigation */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-8 px-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`${
                        item.current
                          ? 'bg-green-100 text-green-700 border-r-2 border-green-500'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-3 py-2 text-sm font-medium rounded-l-md transition-colors duration-200`}
                    >
                      <Icon
                        className={`${
                          item.current ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'
                        } flex-shrink-0 -ml-1 mr-3 h-5 w-5`}
                      />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Club Info Card */}
          <div className="mt-8 mx-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{clubName}</p>
                <p className="text-xs text-green-600">
                  {user?.city && `${user.city}`}
                  {user?.parent_league_id && ` • Liga: ${user.parent_league_id}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}