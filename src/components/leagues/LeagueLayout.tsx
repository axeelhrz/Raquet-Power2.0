'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  TrophyIcon,
  CogIcon,
  ChartBarIcon,
  BellIcon,
  PaperAirplaneIcon,
  ArrowRightOnRectangleIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

interface LeagueLayoutProps {
  children: React.ReactNode;
}

export default function LeagueLayout({ children }: LeagueLayoutProps) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard/liga', 
      icon: HomeIcon,
      current: pathname === '/dashboard/liga' 
    },
    { 
      name: 'Clubes', 
      href: '/dashboard/liga/clubs', 
      icon: BuildingOfficeIcon,
      current: pathname.startsWith('/dashboard/liga/clubs') 
    },
    { 
      name: 'Miembros', 
      href: '/dashboard/liga/members', 
      icon: UsersIcon,
      current: pathname.startsWith('/dashboard/liga/members') 
    },
    { 
      name: 'Torneos', 
      href: '/dashboard/liga/tournaments', 
      icon: TrophyIcon,
      current: pathname.startsWith('/dashboard/liga/tournaments') 
    },
    { 
      name: 'Deportes', 
      href: '/dashboard/liga/sports', 
      icon: CogIcon,
      current: pathname.startsWith('/dashboard/liga/sports') 
    },
    { 
      name: 'Invitaciones', 
      href: '/dashboard/liga/invitations', 
      icon: BellIcon,
      current: pathname.startsWith('/dashboard/liga/invitations') 
    },
    { 
      name: 'Enviar Invitaciones', 
      href: '/dashboard/liga/send-invitations', 
      icon: PaperAirplaneIcon,
      current: pathname.startsWith('/dashboard/liga/send-invitations') 
    },
    { 
      name: 'Estadísticas', 
      href: '/dashboard/liga/stats', 
      icon: ChartBarIcon,
      current: pathname.startsWith('/dashboard/liga/stats') 
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'liga' && user.role !== 'super_admin')) {
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
  const leagueName: string = String(user?.league_name || roleInfo?.name || 'Mi Liga');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <TrophyIcon className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{leagueName}</h1>
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
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
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
                          ? 'bg-yellow-100 text-yellow-700 border-r-2 border-yellow-500'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-3 py-2 text-sm font-medium rounded-l-md transition-colors duration-200`}
                    >
                      <Icon
                        className={`${
                          item.current ? 'text-yellow-500' : 'text-gray-400 group-hover:text-gray-500'
                        } flex-shrink-0 -ml-1 mr-3 h-5 w-5`}
                      />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* League Info Card */}
          <div className="mt-8 mx-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center">
              <TrophyIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800">{leagueName}</p>
                <p className="text-xs text-yellow-600">
                  {user?.province && (
                    <span className="flex items-center">
                      <MapPinIcon className="h-3 w-3 mr-1" />
                      {user.province}
                    </span>
                  )}
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