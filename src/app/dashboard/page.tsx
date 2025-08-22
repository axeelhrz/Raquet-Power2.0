'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { 
  BuildingOfficeIcon, 
  UsersIcon, 
  TrophyIcon, 
  ChartBarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && user.role !== 'super_admin') {
      // Redirigir automáticamente a la página específica del rol (excepto super admin)
      switch (user.role) {
        case 'liga':
          router.replace('/dashboard/liga');
          break;
        case 'club':
          router.replace('/dashboard/club');
          break;
        case 'miembro':
          router.replace('/dashboard/miembro');
          break;
        default:
          // Si no tiene rol definido, mantener en dashboard general
          break;
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h1 className="text-xl font-semibold text-yellow-800">Acceso Requerido</h1>
          <p className="text-yellow-600 mt-2">Por favor inicia sesión para acceder al panel de control.</p>
        </div>
      </Layout>
    );
  }

  // Dashboard específico para Super Admin
  if (user.role === 'super_admin') {
    return (
      <Layout>
        <div className="space-y-6">
          {/* Super Admin Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-red-500 flex items-center justify-center">
                  <ShieldCheckIcon className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Panel de Super Administrador</h1>
                  <p className="text-red-100 mt-1">Acceso completo al sistema</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-red-100 text-sm">Super Admin</p>
                <p className="text-white font-semibold">{user.name}</p>
                <p className="text-red-200 text-sm">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Quick Access to All Dashboards */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Acceso Rápido a Dashboards</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/dashboard/liga" className="block">
                <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
                  <TrophyIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Panel de Liga</p>
                    <p className="text-sm text-gray-500">Gestión de ligas deportivas</p>
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/club" className="block">
                <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors">
                  <BuildingOfficeIcon className="h-8 w-8 text-green-600 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Panel de Club</p>
                    <p className="text-sm text-gray-500">Gestión de clubes deportivos</p>
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/miembro" className="block">
                <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors">
                  <UsersIcon className="h-8 w-8 text-purple-600 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Panel de Miembro</p>
                    <p className="text-sm text-gray-500">Vista de miembro del sistema</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* System Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Gestión del Sistema</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/leagues" className="block">
                <div className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors">
                  <TrophyIcon className="h-8 w-8 text-blue-600 mb-2" />
                  <h3 className="font-semibold text-blue-900">Ligas</h3>
                  <p className="text-blue-700 text-sm">Gestionar todas las ligas</p>
                </div>
              </Link>

              <Link href="/clubs" className="block">
                <div className="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition-colors">
                  <BuildingOfficeIcon className="h-8 w-8 text-green-600 mb-2" />
                  <h3 className="font-semibold text-green-900">Clubes</h3>
                  <p className="text-green-700 text-sm">Gestionar todos los clubes</p>
                </div>
              </Link>

              <Link href="/members" className="block">
                <div className="bg-purple-50 p-4 rounded-lg hover:bg-purple-100 transition-colors">
                  <UsersIcon className="h-8 w-8 text-purple-600 mb-2" />
                  <h3 className="font-semibold text-purple-900">Miembros</h3>
                  <p className="text-purple-700 text-sm">Gestionar todos los miembros</p>
                </div>
              </Link>

              <Link href="/sports" className="block">
                <div className="bg-orange-50 p-4 rounded-lg hover:bg-orange-100 transition-colors">
                  <ChartBarIcon className="h-8 w-8 text-orange-600 mb-2" />
                  <h3 className="font-semibold text-orange-900">Deportes</h3>
                  <p className="text-orange-700 text-sm">Gestionar deportes y parámetros</p>
                </div>
              </Link>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">4</div>
                <div className="text-sm text-gray-500">Ligas Registradas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">5</div>
                <div className="text-sm text-gray-500">Clubes Activos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">0</div>
                <div className="text-sm text-gray-500">Miembros Registrados</div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Dashboard general para usuarios sin rol específico o como fallback
  return (
    <Layout>
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Bienvenido al Panel de Control de Raquet Power
        </h1>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            ¡Hola, <span className="font-semibold text-gray-900">{user.name}</span>!
          </p>
          <p className="text-gray-600">
            Correo: <span className="font-semibold text-gray-900">{user.email}</span>
          </p>
          
          {user.role && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">
                <span className="font-semibold">Rol:</span> {user.role}
              </p>
              <p className="text-blue-600 text-sm mt-1">
                Redirigiendo a tu panel específico...
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">Ligas</h3>
              <p className="text-blue-700">Gestionar ligas deportivas</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">Clubes</h3>
              <p className="text-green-700">Gestionar clubes deportivos</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900">Miembros</h3>
              <p className="text-purple-700">Gestionar miembros del club</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-900">Deportes</h3>
              <p className="text-orange-700">Gestionar tipos de deportes</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}