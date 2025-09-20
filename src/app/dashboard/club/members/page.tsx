'use client';

import { useAuth } from '@/contexts/AuthContext';
import ClubLayout from '@/components/clubs/ClubLayout';
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Skeleton,
  Fade,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
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
  CreditCardIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
  UserGroupIcon,
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

interface ClubStats {
  total_members: number;
  active_members: number;
  male_members: number;
  female_members: number;
}

interface DashboardData {
  stats: ClubStats;
  members: Member[];
  currentClub: Club | null;
  lastUpdated: number;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export default function ClubMembersPage() {
  const { user, loading } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [currentClub, setCurrentClub] = useState<Club | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const hasInitialized = useRef(false);
  const cacheKey = useRef<string>('');

  // Generate cache key based on user
  useEffect(() => {
    if (user?.id) {
      cacheKey.current = `members_${user.id}_${user.role}`;
    }
  }, [user]);

  // Load data from localStorage
  const loadCachedData = useCallback((): DashboardData | null => {
    if (!cacheKey.current) return null;
    
    try {
      const cached = localStorage.getItem(cacheKey.current);
      if (!cached) return null;
      
      const data: DashboardData = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - data.lastUpdated < CACHE_DURATION) {
        return data;
      }
      
      // Cache expired, remove it
      localStorage.removeItem(cacheKey.current);
      return null;
    } catch (error) {
      console.error('Error loading cached data:', error);
      return null;
    }
  }, []);

  // Save data to localStorage
  const saveCachedData = useCallback((data: Omit<DashboardData, 'lastUpdated'>) => {
    if (!cacheKey.current) return;
    
    try {
      const cacheData: DashboardData = {
        ...data,
        lastUpdated: Date.now(),
      };
      localStorage.setItem(cacheKey.current, JSON.stringify(cacheData));
      setLastUpdated(cacheData.lastUpdated);
    } catch (error) {
      console.error('Error saving cached data:', error);
    }
  }, []);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!user || (user.role !== 'club' && user.role !== 'super_admin')) return;

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = loadCachedData();
      if (cachedData) {
        setMembers(cachedData.members);
        setCurrentClub(cachedData.currentClub);
        setLastUpdated(cachedData.lastUpdated);
        if (cachedData.currentClub) {
          setClubs([cachedData.currentClub]);
        }
        return;
      }
    }

    try {
      setLoadingData(true);
      console.log('Members - Fetching fresh data for user:', user.id);

      let clubMembers: Member[] = [];
      let userClub: Club | null = null;

      if (user.role === 'club') {
        // Fetch clubs to find the current user's club
        const clubsResponse = await axios.get('/api/clubs');
        const allClubs = clubsResponse.data.data;
        
        // Find the club that belongs to this user
        userClub = allClubs.data.find((club: Club) => club.user_id === user.id) || null;
        
        if (userClub) {
          setClubs([userClub]);
          
          // Fetch members for this specific club
          const membersResponse = await axios.get(`/api/members?club_id=${userClub.id}`);
          if (membersResponse.data.data) {
            // Handle both paginated and non-paginated responses
            clubMembers = Array.isArray(membersResponse.data.data.data)
              ? membersResponse.data.data.data
              : Array.isArray(membersResponse.data.data)
              ? membersResponse.data.data
              : [];
          }
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
        clubMembers = Array.isArray(allMembers.data) ? allMembers.data : allMembers;
      }

      // Update state
      setMembers(clubMembers);
      setCurrentClub(userClub);

      // Calculate stats
      const stats: ClubStats = {
        total_members: clubMembers.length,
        active_members: clubMembers.filter(member => member.status === 'active').length,
        male_members: clubMembers.filter(member => member.gender === 'male').length,
        female_members: clubMembers.filter(member => member.gender === 'female').length,
      };

      // Save to cache
      saveCachedData({
        stats,
        members: clubMembers,
        currentClub: userClub,
      });

    } catch (error) {
      console.error('Members - Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  }, [user, loadCachedData, saveCachedData]);

  // Initialize data only once
  useEffect(() => {
    if (user && (user.role === 'club' || user.role === 'super_admin') && !hasInitialized.current) {
      hasInitialized.current = true;
      fetchData(false);
    }
  }, [user, fetchData]);

  // Manual refresh function
  const handleRefresh = () => {
    fetchData(true);
  };

  // Format last updated time
  const formatLastUpdated = (timestamp: number | null) => {
    if (!timestamp) return '';
    
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Actualizado ahora';
    if (minutes === 1) return 'Actualizado hace 1 minuto';
    if (minutes < 60) return `Actualizado hace ${minutes} minutos`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return 'Actualizado hace 1 hora';
    return `Actualizado hace ${hours} horas`;
  };

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

      await fetchData(true);
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

      await fetchData(true);
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

      await fetchData(true);
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
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Stack spacing={4}>
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            <Stack direction="row" spacing={2}>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: 2, flex: 1 }} />
              ))}
            </Stack>
            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          </Stack>
        </Container>
      </ClubLayout>
    );
  }

  if (!user || (user.role !== 'club' && user.role !== 'super_admin')) {
    return (
      <ClubLayout>
        <Container maxWidth="sm" sx={{ py: 8 }}>
          <Card
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'error.light',
              backgroundColor: 'error.50',
            }}
          >
            <Typography variant="h6" sx={{ color: 'error.dark', fontWeight: 600, mb: 2 }}>
              Acceso Denegado
            </Typography>
            <Typography sx={{ color: 'error.main', mb: 3 }}>
              No tienes permisos para acceder a esta página.
            </Typography>
          </Card>
        </Container>
      </ClubLayout>
    );
  }

  const clubName = currentClub?.name || user?.name || 'Mi Club';
  const clubCity = currentClub?.city || user?.city;

  return (
    <ClubLayout>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Stack spacing={4} sx={{ py: 4 }}>
            {/* Welcome Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card
                sx={{
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #2F6DFB 0%, #6AA6FF 100%)',
                  color: 'white',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(47, 109, 251, 0.15)',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={3}>
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <UsersIcon style={{ width: 32, height: 32, color: 'white' }} />
                    </Avatar>
                    
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          mb: 1,
                          fontSize: { xs: '1.5rem', md: '2rem' },
                        }}
                      >
                        Miembros de {clubName}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          opacity: 0.9,
                          mb: 2,
                          fontSize: '1rem',
                        }}
                      >
                        Gestión y administración de miembros
                      </Typography>
                      
                      <Stack direction="row" spacing={1}>
                        {clubCity && (
                          <Chip
                            icon={<MapPinIcon style={{ width: 14, height: 14 }} />}
                            label={clubCity}
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                              color: 'white',
                              '& .MuiChip-icon': { color: 'white' },
                            }}
                          />
                        )}
                        {currentClub?.league && (
                          <Chip
                            icon={<TrophyIcon style={{ width: 14, height: 14 }} />}
                            label={currentClub.league.name}
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                              color: 'white',
                              '& .MuiChip-icon': { color: 'white' },
                            }}
                          />
                        )}
                        <Chip
                          icon={<UsersIcon style={{ width: 14, height: 14 }} />}
                          label={`${stats.total} miembros`}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            '& .MuiChip-icon': { color: 'white' },
                          }}
                        />
                      </Stack>
                    </Box>

                    {/* Action Button and Refresh */}
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton
                          onClick={handleRefresh}
                          disabled={loadingData}
                          sx={{
                            color: 'white',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            },
                            '&:disabled': {
                              color: 'rgba(255, 255, 255, 0.5)',
                            },
                          }}
                        >
                          <ArrowPathIcon
                            style={{
                              width: 20,
                              height: 20,
                              animation: loadingData ? 'spin 1s linear infinite' : 'none',
                            }}
                          />
                        </IconButton>
                        
                        {canAddMembers ? (
                          <Button
                            onClick={openCreateModal}
                            variant="contained"
                            startIcon={<PlusIcon style={{ width: 20, height: 20 }} />}
                            sx={{
                              backgroundColor: 'white',
                              color: 'primary.main',
                              '&:hover': {
                                backgroundColor: 'grey.100',
                              },
                              fontWeight: 600,
                              px: 3,
                              py: 1.5,
                            }}
                          >
                            Nuevo Miembro
                          </Button>
                        ) : (
                          <Button
                            onClick={() => setShowPaymentInfo(true)}
                            variant="contained"
                            startIcon={<CreditCardIcon style={{ width: 20, height: 20 }} />}
                            sx={{
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                              },
                              fontWeight: 600,
                              px: 3,
                              py: 1.5,
                            }}
                          >
                            ¿Cómo agregar?
                          </Button>
                        )}
                      </Stack>
                      
                      {lastUpdated && (
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            textAlign: 'center',
                            opacity: 0.7,
                            fontSize: '0.6875rem',
                            mt: 0.5,
                          }}
                        >
                          {formatLastUpdated(lastUpdated)}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Information Banner for Club Users */}
            {!canAddMembers && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Alert
                  severity="info"
                  sx={{
                    borderRadius: 2,
                    '& .MuiAlert-message': {
                      width: '100%',
                    },
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Proceso de Registro de Nuevos Miembros
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Los nuevos miembros deben registrarse y realizar el pago correspondiente antes de ser agregados al club.
                    Como administrador del club, puedes visualizar y gestionar los miembros existentes, pero no agregar nuevos directamente.
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Button
                      onClick={() => setShowPaymentInfo(true)}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    >
                      Ver proceso completo
                    </Button>
                    <Button
                      href="/registro-rapido"
                      size="small"
                      sx={{ fontWeight: 500 }}
                    >
                      Ir al registro rápido
                    </Button>
                  </Stack>
                </Alert>
              </motion.div>
            )}

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Stack direction="row" spacing={2}>
                {[
                  { label: 'Total', value: stats.total, icon: UsersIcon, color: '#2F6DFB' },
                  { label: 'Activos', value: stats.active, icon: UserGroupIcon, color: '#10B981' },
                  { label: 'Inactivos', value: stats.inactive, icon: XCircleIcon, color: '#EF4444' },
                  { label: 'H / M', value: `${stats.male} / ${stats.female}`, icon: UserIcon, color: '#8B5CF6' },
                ].map((stat, index) => (
                  <Card
                    key={stat.label}
                    sx={{
                      flex: 1,
                      borderRadius: 2,
                      border: '1px solid rgba(0, 0, 0, 0.06)',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: `${stat.color}15`,
                          mx: 'auto',
                          mb: 1,
                        }}
                      >
                        <stat.icon style={{ width: 16, height: 16, color: stat.color }} />
                      </Avatar>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: 'text.primary',
                          mb: 0.5,
                        }}
                      >
                        {loadingData ? '-' : stat.value}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </motion.div>

            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card
                sx={{
                  borderRadius: 2,
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
                    <TextField
                      placeholder="Buscar por nombre, email o documento..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MagnifyingGlassIcon style={{ width: 20, height: 20, color: 'var(--mui-palette-text-secondary)' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ flex: 1, maxWidth: { xs: '100%', md: 400 } }}
                      size="small"
                    />
                    
                    <Stack direction="row" spacing={2} alignItems="center">
                      <FunnelIcon style={{ width: 20, height: 20, color: 'var(--mui-palette-text-secondary)' }} />
                      <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Estado</InputLabel>
                        <Select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          label="Estado"
                        >
                          <MenuItem value="all">Todos</MenuItem>
                          <MenuItem value="active">Activos</MenuItem>
                          <MenuItem value="inactive">Inactivos</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Género</InputLabel>
                        <Select
                          value={genderFilter}
                          onChange={(e) => setGenderFilter(e.target.value)}
                          label="Género"
                        >
                          <MenuItem value="all">Todos</MenuItem>
                          <MenuItem value="male">Masculino</MenuItem>
                          <MenuItem value="female">Femenino</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>

            {/* Members Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card
                sx={{
                  borderRadius: 2,
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                {filteredMembers.length === 0 ? (
                  <CardContent sx={{ p: 6, textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        backgroundColor: 'grey.100',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <UserCircleIcon style={{ width: 32, height: 32, color: 'var(--mui-palette-grey-400)' }} />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {searchTerm || statusFilter !== 'all' || genderFilter !== 'all'
                        ? 'No se encontraron miembros'
                        : 'No hay miembros registrados'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                      {searchTerm || statusFilter !== 'all' || genderFilter !== 'all'
                        ? 'Intenta ajustar los filtros de búsqueda.'
                        : canAddMembers
                        ? 'Comienza agregando el primer miembro del club.'
                        : 'Los nuevos miembros deben registrarse y pagar antes de aparecer aquí.'}
                    </Typography>
                    {(!searchTerm && statusFilter === 'all' && genderFilter === 'all') && (
                      <Box>
                        {canAddMembers ? (
                          <Button
                            onClick={openCreateModal}
                            variant="contained"
                            startIcon={<PlusIcon style={{ width: 20, height: 20 }} />}
                          >
                            Agregar Miembro
                          </Button>
                        ) : (
                          <Button
                            onClick={() => setShowPaymentInfo(true)}
                            variant="contained"
                            startIcon={<InformationCircleIcon style={{ width: 20, height: 20 }} />}
                          >
                            Ver proceso de registro
                          </Button>
                        )}
                      </Box>
                    )}
                  </CardContent>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.50' }}>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Miembro</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Contacto</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Información</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Estado</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <AnimatePresence>
                          {filteredMembers.map((member, index) => {
                            const { firstName, lastName, docId, birthDate } = getNormalized(member);
                            return (
                              <motion.tr
                                key={member.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                style={{
                                  // Inline style for hover effect and transition
                                  transition: 'background-color 0.15s ease',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                              >
                                <TableCell>
                                  <Stack direction="row" alignItems="center" spacing={2}>
                                    <Avatar
                                      sx={{
                                        width: 40,
                                        height: 40,
                                        backgroundColor: 'primary.50',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                      }}
                                    >
                                      {firstName.charAt(0)}{lastName.charAt(0)}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                        {`${firstName} ${lastName}`.trim()}
                                      </Typography>
                                      {docId && (
                                        <Stack direction="row" alignItems="center" spacing={0.5}>
                                          <IdentificationIcon style={{ width: 14, height: 14, color: 'var(--mui-palette-text-secondary)' }} />
                                          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                                            {docId}
                                          </Typography>
                                        </Stack>
                                      )}
                                    </Box>
                                  </Stack>
                                </TableCell>
                                <TableCell>
                                  <Stack spacing={0.5}>
                                    {member.email && (
                                      <Stack direction="row" alignItems="center" spacing={1}>
                                        <EnvelopeIcon style={{ width: 14, height: 14, color: 'var(--mui-palette-text-secondary)' }} />
                                        <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                                          {member.email}
                                        </Typography>
                                      </Stack>
                                    )}
                                    {member.phone && (
                                      <Stack direction="row" alignItems="center" spacing={1}>
                                        <PhoneIcon style={{ width: 14, height: 14, color: 'var(--mui-palette-text-secondary)' }} />
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                                          {member.phone}
                                        </Typography>
                                      </Stack>
                                    )}
                                  </Stack>
                                </TableCell>
                                <TableCell>
                                  <Stack spacing={0.5}>
                                    {birthDate && (
                                      <Stack direction="row" alignItems="center" spacing={1}>
                                        <CalendarIcon style={{ width: 14, height: 14, color: 'var(--mui-palette-text-secondary)' }} />
                                        <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                                          {new Date(birthDate).toLocaleDateString()}
                                        </Typography>
                                      </Stack>
                                    )}
                                    {member.gender && (
                                      <Stack direction="row" alignItems="center" spacing={1}>
                                        <UserIcon style={{ width: 14, height: 14, color: 'var(--mui-palette-text-secondary)' }} />
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                                                          {member.gender === 'male' ? 'Masculino' : member.gender === 'female' ? 'Femenino' : 'Otro'}
                                        </Typography>
                                      </Stack>
                                    )}
                                  </Stack>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={member.status === 'active' ? 'Activo' : 'Inactivo'}
                                    size="small"
                                    color={member.status === 'active' ? 'success' : 'error'}
                                    variant="outlined"
                                    icon={member.status === 'active' ?
                                      <CheckCircleIcon style={{ width: 14, height: 14 }} /> :
                                      <XCircleIcon style={{ width: 14, height: 14 }} />
                                    }
                                    sx={{ fontSize: '0.75rem' }}
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                                    <IconButton
                                      onClick={() => openEditModal(member)}
                                      size="small"
                                      sx={{
                                        color: 'primary.main',
                                        '&:hover': {
                                          backgroundColor: 'primary.50',
                                        },
                                      }}
                                    >
                                      <PencilIcon style={{ width: 16, height: 16 }} />
                                    </IconButton>
                                    {canAddMembers && (
                                      <IconButton
                                        onClick={() => openDeleteModal(member)}
                                        size="small"
                                        sx={{
                                          color: 'error.main',
                                          '&:hover': {
                                            backgroundColor: 'error.50',
                                          },
                                        }}
                                      >
                                        <TrashIcon style={{ width: 16, height: 16 }} />
                                      </IconButton>
                                    )}
                                  </Stack>
                                </TableCell>
                              </motion.tr>
                            );
                          })}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Card>
            </motion.div>
          </Stack>
        </motion.div>
      </Container>

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
      <Dialog
        open={showPaymentInfo}
        onClose={() => setShowPaymentInfo(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #2F6DFB 0%, #6AA6FF 100%)',
            color: 'white',
            p: 3,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Proceso de Registro de Miembros
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            Información para administradores de club
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Importante
              </Typography>
              <Typography variant="body2">
                Como administrador de club, no puedes agregar miembros directamente.
                Los nuevos miembros deben completar el proceso de registro y pago antes de aparecer en tu lista.
              </Typography>
            </Alert>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Pasos para que un nuevo miembro se una:
              </Typography>
              <Stack spacing={2}>
                {[
                  {
                    step: 1,
                    title: 'Registro Rápido',
                    description: 'El interesado debe completar el formulario de registro rápido con sus datos personales y deportivos.',
                  },
                  {
                    step: 2,
                    title: 'Proceso de Pago',
                    description: 'Una vez registrado, debe realizar el pago correspondiente según las tarifas establecidas por la liga.',
                  },
                  {
                    step: 3,
                    title: 'Verificación y Aprobación',
                    description: 'Los administradores de la liga verifican el pago y aprueban el registro del nuevo miembro.',
                  },
                  {
                    step: 4,
                    title: 'Miembro Activo',
                    description: 'Una vez aprobado, el miembro aparecerá automáticamente en tu lista de miembros del club.',
                  },
                ].map((item) => (
                  <Stack key={item.step} direction="row" spacing={2}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        backgroundColor: item.step === 4 ? 'success.main' : 'primary.main',
                        fontSize: '0.875rem',
                        fontWeight: 700
                      }}
                    >
                      {item.step}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {item.description}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Box>

            <Alert severity="success" sx={{ borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                ¿Qué puedes hacer como administrador de club?
              </Typography>
              <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2 }}>
                <Typography component="li" variant="body2">
                  Visualizar todos los miembros de tu club
                </Typography>
                <Typography component="li" variant="body2">
                  Editar la información de miembros existentes
                </Typography>
                <Typography component="li" variant="body2">
                  Ver estadísticas y reportes de membresía
                </Typography>
                <Typography component="li" variant="body2">
                  Gestionar el estado de los miembros (activo/inactivo)
                </Typography>
              </Stack>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            href="/registro-rapido"
            sx={{ fontWeight: 500 }}
          >
            Ir al formulario de registro rápido
          </Button>
          <Button
            onClick={() => setShowPaymentInfo(false)}
            variant="contained"
            sx={{ fontWeight: 600 }}
          >
            Entendido
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add CSS for spin animation */}
      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </ClubLayout>
  );
}

