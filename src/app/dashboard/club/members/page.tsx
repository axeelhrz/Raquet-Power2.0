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
  TrophyIcon
} from '@heroicons/react/24/outline';
import { Member, Club } from '@/types';
import MemberModal from '@/components/members/MemberModal';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import axios from '@/lib/axios';

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
        
        const allClubs = clubsResponse.data.data; // Aquí está el fix - acceder a data.data
        console.log('All clubs:', allClubs);
        
        // Find the club that belongs to this user
        const userClub = allClubs.data.find((club: Club) => club.user_id === user.id); // Y aquí también - allClubs.data
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

  // Use Partial<Member> to allow creating with a subset of fields while avoiding 'any'
  const handleCreateMember = async (memberData: Partial<Member>) => {
    try {
      console.log('Creating member with data:', memberData);
      const response = await axios.post('/api/members', memberData);
      console.log('Member created successfully:', response.data);
      await fetchData();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating member:', error);
      throw error;
    }
  };
  // Use Partial<Member> for updates (not all fields must be present)
  const handleUpdateMember = async (memberData: Partial<Member>) => {
    try {
      console.log('Updating member with data:', memberData);
      if (!selectedMember) return;
      
      const response = await axios.put(`/api/members/${selectedMember.id}`, memberData);
      console.log('Member updated successfully:', response.data);
      await fetchData();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  };

  const handleDeleteMember = async () => {
    try {
      if (!selectedMember) return;
      
      await axios.delete(`/api/members/${selectedMember.id}`);
      await fetchData();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting member:', error);
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
            <button
              onClick={openCreateModal}
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Nuevo Miembro</span>
            </button>
          </div>
        </div>

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
                  : 'Comienza agregando el primer miembro del club.'}
              </p>
              {(!searchTerm && statusFilter === 'all' && genderFilter === 'all') && (
                <div className="mt-6">
                  <button
                    onClick={openCreateModal}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Agregar Miembro
                  </button>
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
                            <button
                              onClick={() => openDeleteModal(member)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition-colors duration-150"
                              title="Eliminar miembro"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
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
      <MemberModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateMember}
        clubs={clubs}
        member={null}
      />
      <MemberModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateMember}
        clubs={clubs}
        member={selectedMember}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteMember}
        title="Eliminar Miembro"
        message={`¿Estás seguro de que deseas eliminar a ${getMemberDisplayName(selectedMember as NormalizedMember)}? Esta acción no se puede deshacer.`}
      />
    </ClubLayout>
  );
}