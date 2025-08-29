'use client';

import { useAuth } from '@/contexts/AuthContext';
import ClubLayout from '@/components/clubs/ClubLayout';
import { useEffect, useState, useCallback } from 'react';
import {
  UsersIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  IdentificationIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  MapPinIcon,
  TrophyIcon,
  InformationCircleIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { Member, Club } from '@/types';
import MemberModal from '@/components/members/MemberModal';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import axios from '@/lib/axios';

// Define the expected member data structure for API calls
interface MemberFormData {
  club_id: number;
  first_name: string;
  last_name: string;
  doc_id?: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  status: 'active' | 'inactive';
  country?: string;
  province?: string;
  city?: string;
  dominant_hand?: 'right' | 'left';
  playing_side?: 'derecho' | 'zurdo';
  playing_style?: 'clasico' | 'lapicero';
  racket_brand?: string;
  racket_model?: string;
  racket_custom_brand?: string;
  racket_custom_model?: string;
  drive_rubber_brand?: string;
  drive_rubber_model?: string;
  drive_rubber_type?: 'liso' | 'pupo_largo' | 'pupo_corto' | 'antitopsping';
  drive_rubber_color?: 'negro' | 'rojo' | 'verde' | 'azul' | 'amarillo' | 'morado' | 'fucsia';
  drive_rubber_sponge?: string;
  drive_rubber_hardness?: string;
  drive_rubber_custom_brand?: string;
  drive_rubber_custom_model?: string;
  backhand_rubber_brand?: string;
  backhand_rubber_model?: string;
  backhand_rubber_type?: 'liso' | 'pupo_largo' | 'pupo_corto' | 'antitopsping';
  backhand_rubber_color?: 'negro' | 'rojo' | 'verde' | 'azul' | 'amarillo' | 'morado' | 'fucsia';
  backhand_rubber_sponge?: string;
  backhand_rubber_hardness?: string;
  backhand_rubber_custom_brand?: string;
  backhand_rubber_custom_model?: string;
  notes?: string;
  ranking_position?: number;
  ranking_last_updated?: string;
}

export default function ClubMembersPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [currentClub, setCurrentClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      console.log('fetchData - User:', user);
      console.log('fetchData - User role:', user?.role);
      console.log('fetchData - User ID:', user?.id);

      if (!user) return;

      if (user.role === 'club') {
        console.log('User is a club, fetching clubs...');
        
        // Fetch clubs
        const clubsResponse = await axios.get('/api/clubs');
        console.log('Clubs response:', clubsResponse.data);
        
        const allClubs = clubsResponse.data.data;
        console.log('All clubs:', allClubs);
        
        // Find the club that belongs to this user
        const userClub = allClubs.data.find((club: Club) => club.user_id === user.id);
        console.log('User club found:', userClub);
        
        if (userClub) {
          setCurrentClub(userClub);
          setClubs([userClub]);
          
          // Fetch members for this club
          console.log('Fetching members for club:', userClub.id);
          const membersResponse = await axios.get(`/api/members?club_id=${userClub.id}`);
          console.log('Members response:', membersResponse.data);
          
          if (membersResponse.data.data) {
            const clubMembers = Array.isArray(membersResponse.data.data.data) 
              ? membersResponse.data.data.data 
              : membersResponse.data.data;
            setMembers(clubMembers);
          }
        } else {
          console.log('No club found for user');
        }
      } else if (user.role === 'super_admin') {
        // Super admin can see all clubs and members
        const [clubsResponse, membersResponse] = await Promise.all([
          axios.get('/api/clubs'),
          axios.get('/api/members')
        ]);
        
        const allClubs = clubsResponse.data.data;
        setClubs(Array.isArray(allClubs.data) ? allClubs.data : []);
        
        const allMembers = membersResponse.data.data;
        setMembers(Array.isArray(allMembers.data) ? allMembers.data : allMembers);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  interface NormalizedMember extends Member {
    first_name?: string;
    firstName?: string;
    last_name?: string;
    lastName?: string;
    doc_id?: string;
    docId?: string;
    birth_date?: string;
    birthDate?: string;
  }

  const getNormalized = (m: NormalizedMember) => ({
    firstName: m.first_name ?? m.firstName ?? '',
    lastName: m.last_name ?? m.lastName ?? '',
    docId: m.doc_id ?? m.docId ?? '',
    birthDate: m.birth_date ?? m.birthDate ?? ''
  });

  const getMemberDisplayName = (m?: NormalizedMember) => {
    if (!m) return '';
    const { firstName, lastName } = getNormalized(m);
    return `${firstName} ${lastName}`.trim();
  };

  const filteredMembers = members.filter(member => {
    const { firstName, lastName, docId } = getNormalized(member as NormalizedMember);
    const email = (member.email || '').toLowerCase();

    const search = searchTerm.toLowerCase();
    const matchesSearch =
      firstName.toLowerCase().includes(search) ||
      lastName.toLowerCase().includes(search) ||
      email.includes(search) ||
      docId.toLowerCase().includes(search);

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && member.status === 'active') ||
      (statusFilter === 'inactive' && member.status === 'inactive');

    const matchesGender = genderFilter === 'all' || member.gender === genderFilter;

    return matchesSearch && matchesStatus && matchesGender;
  });

  const stats = {
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    inactive: members.filter(m => m.status === 'inactive').length,
    male: members.filter(m => m.gender === 'male').length,
    female: members.filter(m => m.gender === 'female').length,
  };

  const openCreateModal = () => {
    console.log('Opening create modal...');
    console.log('Current club:', currentClub);
    console.log('Clubs available:', clubs);
    setSelectedMember(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (member: Member) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (member: Member) => {
    setSelectedMember(member);
    setIsDeleteModalOpen(true);
  };

  const handleCreateMember = async (memberData: MemberFormData, photo?: File) => {
    try {
      console.log('🏃‍♂️ Creating member with data:', memberData);
      console.log('📸 Photo provided:', !!photo);
      console.log('🏢 Current club:', currentClub);
      
      // Ensure we have a club_id
      if (!memberData.club_id && currentClub) {
        memberData.club_id = currentClub.id;
        console.log('🔧 Set club_id from current club:', currentClub.id);
      }
      
      // Validate required fields
      if (!memberData.club_id) {
        throw new Error('Club ID is required');
      }
      
      if (!memberData.first_name || !memberData.last_name) {
        throw new Error('First name and last name are required');
      }
      
      // Clean up the data - remove undefined values and empty strings
      const cleanedData: Partial<MemberFormData> = {};
      Object.entries(memberData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanedData[key as keyof MemberFormData] = value;
        }
      });
      
      console.log('🧹 Cleaned data to send:', cleanedData);
      
      // If we have a photo, use FormData
      if (photo) {
        const formData = new FormData();
        
        // Add all member data to FormData
        Object.entries(cleanedData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });
        
        // Add photo
        formData.append('photo', photo);
        
        console.log('📤 Sending FormData with photo');
        const response = await axios.post('/api/members', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('✅ Member created successfully with photo:', response.data);
      } else {
        console.log('📤 Sending JSON data without photo');
        const response = await axios.post('/api/members', cleanedData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('✅ Member created successfully:', response.data);
      }
      
      await fetchData();
      setIsCreateModalOpen(false);
    } catch (error: unknown) {
      console.error('❌ Error creating member:', error);

      // Better error handling
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: unknown }).response === 'object'
      ) {
        const response = (typeof error === 'object' && error !== null && 'response' in error)
          ? (error as { response: unknown }).response
          : undefined;
        if (
          typeof response === 'object' &&
          response !== null &&
          'status' in response &&
          (response as { status?: number }).status === 422
        ) {
          type ValidationResponse = { data: { errors?: Record<string, string[]> } };
          const validationResponse = response as unknown as ValidationResponse;
          console.error('🚨 Validation errors:', validationResponse.data);
          const validationErrors = validationResponse.data.errors || {};
          const errorMessages = Object.entries(validationErrors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');

          alert(`Error de validación:\n${errorMessages}`);
        } else if (
          typeof response === 'object' &&
          response !== null &&
          'data' in response &&
          (response as { data?: { message?: string } }).data?.message
        ) {
          alert(`Error: ${(response as { data: { message: string } }).data.message}`);
        } else {
          alert(`Error al crear miembro: ${(error as unknown as Error).message}`);
        }
      } else if (error instanceof Error) {
        alert(`Error al crear miembro: ${error.message}`);
      } else {
        alert('Error al crear miembro');
      }

      throw error;
    }
  };

  const handleUpdateMember = async (memberData: MemberFormData, photo?: File) => {
    try {
      console.log('🔄 Updating member with data:', memberData);
      console.log('📸 Photo provided:', !!photo);
      
      if (!selectedMember) return;
      
      // Clean up the data - remove undefined values and empty strings
      const cleanedData: Partial<MemberFormData> = {};
      Object.entries(memberData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanedData[key as keyof MemberFormData] = value;
        }
      });
      
      console.log('🧹 Cleaned data to send:', cleanedData);
      
      // If we have a photo, use FormData
      if (photo) {
        const formData = new FormData();
        
        // Add all member data to FormData
        Object.entries(cleanedData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });
        
        // Add photo
        formData.append('photo', photo);
        
        console.log('📤 Sending FormData with photo for update');
        const response = await axios.post(`/api/members/${selectedMember.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-HTTP-Method-Override': 'PUT'
          },
        });
        console.log('✅ Member updated successfully with photo:', response.data);
      } else {
        console.log('📤 Sending JSON data without photo for update');
        const response = await axios.put(`/api/members/${selectedMember.id}`, cleanedData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('✅ Member updated successfully:', response.data);
      }
      
      await fetchData();
      setIsEditModalOpen(false);
    } catch (error: unknown) {
      console.error('❌ Error updating member:', error);

      // Better error handling
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: unknown }).response === 'object'
      ) {
        const response = (error as { response: unknown }).response;
        if (
          typeof response === 'object' &&
          response !== null &&
          'status' in response &&
          (response as { status?: number }).status === 422
        ) {
          const validationErrors = (response as { data?: { errors?: Record<string, string[]> } }).data?.errors || {};
          const errorMessages = Object.entries(validationErrors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          alert(`Error de validación:\n${errorMessages}`);
        } else if (
          typeof response === 'object' &&
          response !== null &&
          'data' in response &&
          (response as { data?: { message?: string } }).data?.message
        ) {
          alert(`Error: ${(response as { data: { message: string } }).data.message}`);
        } else {
          alert(`Error al actualizar miembro: ${(error as unknown as Error).message}`);
        }
      } else if (error instanceof Error) {
        alert(`Error al actualizar miembro: ${error.message}`);
      } else {
        alert('Error al actualizar miembro');
      }

      throw error;
    }
  };

  const handleDeleteMember = async () => {
    try {
      if (!selectedMember) return;
      
      console.log('🗑️ Deleting member:', selectedMember.id);
      await axios.delete(`/api/members/${selectedMember.id}`);
      console.log('✅ Member deleted successfully');
      
      await fetchData();
      setIsDeleteModalOpen(false);
    } catch (error: unknown) {
      console.error('❌ Error deleting member:', error);

      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: unknown }).response === 'object' &&
        (error as { response?: { data?: { message?: string } } }).response?.data?.message
      ) {
        alert(`Error: ${(error as { response: { data: { message: string } } }).response.data.message}`);
      } else if (error instanceof Error) {
        alert(`Error al eliminar miembro: ${error.message}`);
      } else {
        alert('Error al eliminar miembro');
      }
    }
  };

  // Check if current user can add members (only super_admin can)
  const canAddMembers = user?.role === 'super_admin';

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
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {currentClub ? `Miembros de ${currentClub.name}` : 'Gestión de Miembros'}
              </h1>
              <p className="text-green-100 mt-2">
                {currentClub ? `${currentClub.city} • ${currentClub.league?.name || 'Liga no asignada'}` : 'Administra los miembros del sistema'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {canAddMembers ? (
                <button
                  onClick={openCreateModal}
                  className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Nuevo Miembro</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowPaymentInfo(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <CreditCardIcon className="h-5 w-5" />
                  <span>¿Cómo agregar miembros?</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Payment Information Banner for Club Users */}
        {!canAddMembers && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Proceso de Registro de Nuevos Miembros
                </h3>
                <p className="text-blue-800 mb-3">
                  Los nuevos miembros deben registrarse y realizar el pago correspondiente antes de ser agregados al club. 
                  Como administrador del club, puedes visualizar y gestionar los miembros existentes, pero no agregar nuevos directamente.
                </p>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowPaymentInfo(true)}
                    className="text-blue-700 hover:text-blue-900 font-medium underline"
                  >
                    Ver proceso completo
                  </button>
                  <span className="text-blue-600">•</span>
                  <a
                    href="/registro-rapido"
                    className="text-blue-700 hover:text-blue-900 font-medium underline"
                  >
                    Ir al registro rápido
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Club Info Banner */}
        {currentClub && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-full">
                <TrophyIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{currentClub.name}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center space-x-1">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{currentClub.city}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrophyIcon className="h-4 w-4" />
                    <span>{currentClub.league?.name || 'Liga no asignada'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <UsersIcon className="h-4 w-4" />
                    <span>{stats.total} miembros</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Miembros</p>
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
                <p className="text-sm font-medium text-gray-600">Activos</p>
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
                <p className="text-sm font-medium text-gray-600">Inactivos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <UserIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hombres / Mujeres</p>
                <p className="text-2xl font-bold text-gray-900">{stats.male} / {stats.female}</p>
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
                  placeholder="Buscar por nombre, email o documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>
              
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Todos los géneros</option>
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
              </select>
            </div>
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm || statusFilter !== 'all' || genderFilter !== 'all'
                  ? 'No se encontraron miembros'
                  : 'No hay miembros registrados'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || genderFilter !== 'all'
                  ? 'Intenta ajustar los filtros de búsqueda.'
                  : canAddMembers 
                    ? 'Comienza agregando el primer miembro del club.'
                    : 'Los nuevos miembros deben registrarse y pagar antes de aparecer aquí.'}
              </p>
              {(!searchTerm && statusFilter === 'all' && genderFilter === 'all') && (
                <div className="mt-6">
                  {canAddMembers ? (
                    <button
                      onClick={openCreateModal}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                      Agregar Miembro
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowPaymentInfo(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <InformationCircleIcon className="-ml-1 mr-2 h-5 w-5" />
                      Ver proceso de registro
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Miembro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Información
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.map((member) => {
                    const { firstName, lastName, docId, birthDate } = getNormalized(member);
                    return (
                      <tr key={member.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-xs text-gray-700 font-semibold">
                                {firstName.charAt(0)}{lastName.charAt(0)}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {`${firstName} ${lastName}`.trim()}
                              </div>
                              {docId && (
                                <div className="text-sm text-gray-500 flex items-center">
                                  <IdentificationIcon className="h-4 w-4 mr-1" />
                                  {docId}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {member.email && (
                              <div className="text-sm text-gray-900 flex items-center">
                                <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                                {member.email}
                              </div>
                            )}
                            {member.phone && (
                              <div className="text-sm text-gray-500 flex items-center">
                                <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                                {member.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900">
                              {birthDate ? new Date(birthDate).toLocaleDateString() : ''}
                            </div>
                            {birthDate && (
                              <div className="text-sm text-gray-500 flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {new Date(birthDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              member.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {member.status === 'active' ? (
                              <>
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                Activo
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="h-3 w-3 mr-1" />
                                Inactivo
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openEditModal(member)}
                              className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-100 transition-colors duration-150"
                              title="Editar miembro"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            {canAddMembers && (
                              <button
                                onClick={() => openDeleteModal(member)}
                                className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition-colors duration-150"
                                title="Eliminar miembro"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {canAddMembers && (
        <MemberModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateMember}
          clubs={clubs}
          member={null}
        />
      )}
      
      <MemberModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateMember}
        clubs={clubs}
        member={selectedMember}
      />
      
      {canAddMembers && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteMember}
          title="Eliminar Miembro"
          message={`¿Estás seguro de que deseas eliminar a ${getMemberDisplayName(selectedMember as NormalizedMember)}? Esta acción no se puede deshacer.`}
        />
      )}

      {/* Payment Information Modal */}
      {showPaymentInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Proceso de Registro de Miembros</h2>
                  <p className="text-blue-100 mt-1">Información para administradores de club</p>
                </div>
                <button
                  onClick={() => setShowPaymentInfo(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <InformationCircleIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 mb-2">Importante</h3>
                      <p className="text-yellow-800">
                        Como administrador de club, no puedes agregar miembros directamente. 
                        Los nuevos miembros deben completar el proceso de registro y pago antes de aparecer en tu lista.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Pasos para que un nuevo miembro se una:</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Registro Rápido</h4>
                        <p className="text-gray-600">
                          El interesado debe completar el formulario de registro rápido con sus datos personales y deportivos.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Proceso de Pago</h4>
                        <p className="text-gray-600">
                          Una vez registrado, debe realizar el pago correspondiente según las tarifas establecidas por la liga.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Verificación y Aprobación</h4>
                        <p className="text-gray-600">
                          Los administradores de la liga verifican el pago y aprueban el registro del nuevo miembro.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        4
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Miembro Activo</h4>
                        <p className="text-gray-600">
                          Una vez aprobado, el miembro aparecerá automáticamente en tu lista de miembros del club.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">¿Qué puedes hacer como administrador de club?</h4>
                  <ul className="text-green-800 space-y-1">
                    <li>• Visualizar todos los miembros de tu club</li>
                    <li>• Editar la información de miembros existentes</li>
                    <li>• Ver estadísticas y reportes de membresía</li>
                    <li>• Gestionar el estado de los miembros (activo/inactivo)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
              <a
                href="/registro-rapido"
                className="text-blue-600 hover:text-blue-800 font-medium underline"
              >
                Ir al formulario de registro rápido
              </a>
              <button
                onClick={() => setShowPaymentInfo(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </ClubLayout>
  );
}