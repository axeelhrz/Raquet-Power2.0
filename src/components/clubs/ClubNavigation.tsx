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

export default function ClubNavigation() {
  const { user, logout } = useAuth();
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

  const roleInfo = user?.role_info as { name?: string } | undefined;
  const clubName: string =
    (typeof user?.club_name === 'string' && user.club_name) ||
    (typeof roleInfo?.name === 'string' && roleInfo.name) ||
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

      {/* Side Navigation */}
      <div className="flex">
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
                  {user?.parent_league_id && ` • Liga ID: ${user.parent_league_id}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          {/* This will be filled by the page content */}
        </div>
      </div>
    </div>
  );
}