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
  Stack,
  Divider,
  Alert,
  Skeleton,
  IconButton,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrophyIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { Tournament, Club } from '@/types';
import TournamentModal from '@/components/tournaments/TournamentModal';
import TournamentDetailsModal from '@/components/tournaments/TournamentDetailsModal';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import axios from '@/lib/axios';

interface ClubStats {
  total_tournaments: number;
  active_tournaments: number;
  completed_tournaments: number;
  draft_tournaments: number;
}

interface DashboardData {
  stats: ClubStats;
  tournaments: Tournament[];
  currentClub: Club | null;
  lastUpdated: number;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export default function ClubTournamentsPage() {
  const { user, loading } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [currentClub, setCurrentClub] = useState<Club | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const hasInitialized = useRef(false);
  const cacheKey = useRef<string>('');

  // Generate cache key based on user
  useEffect(() => {
    if (user?.id) {
      cacheKey.current = `tournaments_${user.id}_${user.role}`;
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
        setTournaments(cachedData.tournaments);
        setCurrentClub(cachedData.currentClub);
        setLastUpdated(cachedData.lastUpdated);
        return;
      }
    }

    try {
      setLoadingData(true);
      console.log('Tournaments - Fetching fresh data for user:', user.id);

      let userClub: Club | null = null;
      let clubTournaments: Tournament[] = [];

      if (user.role === 'club') {
        // First, get the club information
        console.log('Tournaments - Fetching clubs...');
        const clubsResponse = await axios.get('/api/clubs');
        console.log('Tournaments - Clubs response:', clubsResponse.data);
        
        // Handle different response structures
        let allClubs = [];
        if (clubsResponse.data.data) {
          // If response has nested data structure
          allClubs = Array.isArray(clubsResponse.data.data.data) 
            ? clubsResponse.data.data.data 
            : Array.isArray(clubsResponse.data.data)
            ? clubsResponse.data.data
            : [];
        } else if (Array.isArray(clubsResponse.data)) {
          // If response is directly an array
          allClubs = clubsResponse.data;
        }
        
        console.log('Tournaments - All clubs:', allClubs);
        userClub = allClubs.find((club: Club) => club.user_id === user.id) || null;
        console.log('Tournaments - User club found:', userClub);

        if (userClub) {
          try {
            // Fetch tournaments for this specific club
            console.log(`Tournaments - Fetching tournaments for club ${userClub.id}...`);
            const tournamentsResponse = await axios.get(`/api/tournaments?club_id=${userClub.id}`);
            console.log('Tournaments - Tournaments response:', tournamentsResponse.data);
            
            // Handle different response structures
            if (tournamentsResponse.data.data) {
              clubTournaments = Array.isArray(tournamentsResponse.data.data.data) 
                ? tournamentsResponse.data.data.data 
                : Array.isArray(tournamentsResponse.data.data)
                ? tournamentsResponse.data.data
                : [];
            } else if (Array.isArray(tournamentsResponse.data)) {
              clubTournaments = tournamentsResponse.data;
            }
            
            console.log('Tournaments - Processed tournaments:', clubTournaments);
          } catch (tournamentError) {
            console.error('Tournaments - Error fetching tournaments:', tournamentError);
            
            // If tournaments fetch fails, still show the club info but with empty tournaments
            clubTournaments = [];
            
            // Show user-friendly error message
            if (tournamentError instanceof Error && 'response' in tournamentError) {
              const axiosError = tournamentError as { response?: { status?: number; data?: unknown } };
              if (axiosError.response?.status === 500) {
                console.error('Tournaments - Server error when fetching tournaments. This might be a backend issue.');
                // Don't throw here, just log and continue with empty tournaments
              }
            }
          }
        } else {
          console.warn('Tournaments - No club found for user:', user.id);
        }
      } else if (user.role === 'super_admin') {
        try {
          // Super admin can see all tournaments
          console.log('Tournaments - Fetching all tournaments for super admin...');
          const tournamentsResponse = await axios.get('/api/tournaments');
          console.log('Tournaments - All tournaments response:', tournamentsResponse.data);
          
          const allTournaments = tournamentsResponse.data.data;
          clubTournaments = Array.isArray(allTournaments.data) ? allTournaments.data : allTournaments;
        } catch (tournamentError) {
          console.error('Tournaments - Error fetching all tournaments:', tournamentError);
          clubTournaments = [];
        }
      }

      // Calculate stats
      const stats: ClubStats = {
        total_tournaments: clubTournaments.length,
        active_tournaments: clubTournaments.filter(t => ['open', 'in_progress', 'active'].includes(t.status)).length,
        completed_tournaments: clubTournaments.filter(t => t.status === 'completed').length,
        draft_tournaments: clubTournaments.filter(t => t.status === 'draft').length,
      };

      console.log('Tournaments - Final stats:', stats);
      console.log('Tournaments - Final tournaments:', clubTournaments);

      // Update state
      setTournaments(clubTournaments);
      setCurrentClub(userClub);

      // Save to cache
      saveCachedData({
        stats,
        tournaments: clubTournaments,
        currentClub: userClub,
      });

    } catch (error) {
      console.error('Tournaments - Error fetching data:', error);
      
      // Provide more detailed error information
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: unknown } };
        console.error('Tournaments - Error details:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data
        });
      }
      
      // Set empty state on error
      setTournaments([]);
      setCurrentClub(null);
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

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = 
      tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tournament.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter;
    
    const matchesType = typeFilter === 'all' || tournament.tournament_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: tournaments.length,
    active: tournaments.filter(t => ['open', 'in_progress', 'active'].includes(t.status)).length,
    completed: tournaments.filter(t => t.status === 'completed').length,
    draft: tournaments.filter(t => t.status === 'draft').length,
  };

  const openCreateModal = () => {
    setSelectedTournament(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setIsDeleteModalOpen(true);
  };

  const openDetailsModal = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setIsDetailsModalOpen(true);
  };

  const handleCreateTournament = async (tournamentData: Partial<Tournament>) => {
    try {
      console.log('🏆 Creating tournament with data:', tournamentData);
      
      // Ensure we have a club_id
      if (!tournamentData.club_id && currentClub) {
        tournamentData.club_id = currentClub.id;
      }
      
      const response = await axios.post('/api/tournaments', tournamentData);
      console.log('✅ Tournament created successfully:', response.data);
      
      // Check if response has success flag and data
      if (response.data.success || response.status === 200 || response.status === 201) {
        // Clear cache immediately
        if (cacheKey.current) {
          localStorage.removeItem(cacheKey.current);
        }
        
        // Force refresh data
        await fetchData(true);
        setIsCreateModalOpen(false);
        
        // Show success message
        alert('Torneo creado exitosamente');
      } else {
        throw new Error(response.data.message || 'Error creating tournament');
      }
    } catch (error: unknown) {
      console.error('❌ Error creating tournament:', error);

      // Handle different types of errors
      interface AxiosErrorWithResponse {
        response?: {
          data?: {
            errors?: Record<string, string[]>;
            message?: string;
          };
        };
      }

      const isAxiosErrorWithResponse = (err: unknown): err is AxiosErrorWithResponse =>
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as AxiosErrorWithResponse).response === 'object' &&
        (err as AxiosErrorWithResponse).response !== null;

      if (isAxiosErrorWithResponse(error)) {
        const response = error.response;
        if (response?.data?.errors) {
          // Validation errors
          const validationErrors = response.data.errors;
          const errorMessages = Object.values(validationErrors).flat().join('\n');
          alert(`Errores de validación:\n${errorMessages}`);
        } else if (response?.data?.message) {
          // Server error message
          alert(`Error: ${response.data.message}`);
        } else {
          // Generic error
          alert('Error al crear torneo. Por favor, intenta nuevamente.');
        }
      } else {
        // Generic error
        alert('Error al crear torneo. Por favor, intenta nuevamente.');
      }
    }
  };

  const handleUpdateTournament = async (tournamentData: Partial<Tournament>) => {
    try {
      if (!selectedTournament) return;
      
      console.log('🔄 Updating tournament with data:', tournamentData);
      
      const response = await axios.put(`/api/tournaments/${selectedTournament.id}`, tournamentData);
      console.log('✅ Tournament updated successfully:', response.data);
      
      await fetchData(true);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('❌ Error updating tournament:', error);
      alert('Error al actualizar torneo');
    }
  };

  const handleDeleteTournament = async () => {
    try {
      if (!selectedTournament) return;
      
      console.log('🗑️ Deleting tournament:', selectedTournament.id);
      await axios.delete(`/api/tournaments/${selectedTournament.id}`);
      console.log('✅ Tournament deleted successfully');
      
      await fetchData(true);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('❌ Error deleting tournament:', error);
      alert('Error al eliminar torneo');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return XCircleIcon;
      case 'open': case 'upcoming': return ClockIcon;
      case 'active': case 'in_progress': return PlayIcon;
      case 'completed': return CheckCircleIcon;
      case 'cancelled': return StopIcon;
      default: return ClockIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'open': case 'upcoming': return 'info';
      case 'active': case 'in_progress': return 'success';
      case 'completed': return 'primary';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'open': return 'Abierto';
      case 'upcoming': return 'Próximo';
      case 'active': case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'single_elimination': return 'Eliminación Simple';
      case 'double_elimination': return 'Eliminación Doble';
      case 'round_robin': return 'Todos contra Todos';
      case 'swiss': return 'Sistema Suizo';
      default: return type;
    }
  };

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
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} variant="rectangular" height={320} sx={{ borderRadius: 2, width: 350 }} />
              ))}
            </Box>
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
                      <TrophyIcon style={{ width: 32, height: 32, color: 'white' }} />
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
                        Torneos de {clubName}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          opacity: 0.9,
                          mb: 2,
                          fontSize: '1rem',
                        }}
                      >
                        Gestión y organización de torneos
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
                          label={`${stats.total} torneos`}
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
                        
                        <Button
                          onClick={openCreateModal}
                          variant="contained"
                          startIcon={<PlusIcon style={{ width: 20, height: 20 }} />}
                          sx={{
                            backgroundColor: '#10B981',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: '#059669',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                            },
                            fontWeight: 700,
                            px: 4,
                            py: 1.5,
                            fontSize: '0.95rem',
                            borderRadius: 2,
                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                            transition: 'all 0.2s ease-in-out',
                            textTransform: 'none',
                            minWidth: 160,
                          }}
                        >
                          Nuevo Torneo
                        </Button>
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

            {/* Club Info Banner */}
            {currentClub && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card
                  sx={{
                    borderRadius: 2,
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={3}>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          backgroundColor: 'success.50',
                        }}
                      >
                        <BuildingOfficeIcon style={{ width: 24, height: 24, color: 'var(--mui-palette-success-main)' }} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {currentClub.name}
                        </Typography>
                        <Stack direction="row" spacing={3}>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <MapPinIcon style={{ width: 16, height: 16, color: 'var(--mui-palette-text-secondary)' }} />
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {currentClub.city}
                            </Typography>
                          </Stack>
                          {currentClub.league && (
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <TrophyIcon style={{ width: 16, height: 16, color: 'var(--mui-palette-text-secondary)' }} />
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {currentClub.league.name}
                              </Typography>
                            </Stack>
                          )}
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <UsersIcon style={{ width: 16, height: 16, color: 'var(--mui-palette-text-secondary)' }} />
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {stats.total} torneos
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
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
                  { label: 'Total', value: stats.total, icon: TrophyIcon, color: '#2F6DFB' },
                  { label: 'Activos', value: stats.active, icon: PlayIcon, color: '#10B981' },
                  { label: 'Completados', value: stats.completed, icon: CheckCircleIcon, color: '#8B5CF6' },
                  { label: 'Borradores', value: stats.draft, icon: XCircleIcon, color: '#F59E0B' },
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
                      placeholder="Buscar por nombre o descripción..."
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
                          <MenuItem value="draft">Borrador</MenuItem>
                          <MenuItem value="open">Abierto</MenuItem>
                          <MenuItem value="active">Activo</MenuItem>
                          <MenuItem value="completed">Completado</MenuItem>
                          <MenuItem value="cancelled">Cancelado</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel>Tipo</InputLabel>
                        <Select
                          value={typeFilter}
                          onChange={(e) => setTypeFilter(e.target.value)}
                          label="Tipo"
                        >
                          <MenuItem value="all">Todos</MenuItem>
                          <MenuItem value="single_elimination">Eliminación Simple</MenuItem>
                          <MenuItem value="double_elimination">Eliminación Doble</MenuItem>
                          <MenuItem value="round_robin">Todos contra Todos</MenuItem>
                          <MenuItem value="swiss">Sistema Suizo</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tournaments Grid */}
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
                {filteredTournaments.length === 0 ? (
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
                      <TrophyIcon style={{ width: 32, height: 32, color: 'var(--mui-palette-grey-400)' }} />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                        ? 'No se encontraron torneos'
                        : 'No hay torneos registrados'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                      {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                        ? 'Intenta ajustar los filtros de búsqueda.'
                        : 'Comienza creando el primer torneo del club.'}
                    </Typography>
                    {(!searchTerm && statusFilter === 'all' && typeFilter === 'all') && (
                      <Button
                        onClick={openCreateModal}
                        variant="contained"
                        startIcon={<PlusIcon style={{ width: 20, height: 20 }} />}
                      >
                        Crear Torneo
                      </Button>
                    )}
                  </CardContent>
                ) : (
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 3,
                        justifyContent: { xs: 'center', md: 'flex-start' },
                      }}
                    >
                      <AnimatePresence>
                        {filteredTournaments.map((tournament, index) => {
                          const StatusIcon = getStatusIcon(tournament.status);
                          return (
                            <motion.div
                              key={tournament.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                              <Card
                                sx={{
                                  width: { xs: '100%', sm: 350 },
                                  borderRadius: 2,
                                  border: '1px solid rgba(0, 0, 0, 0.06)',
                                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                                  },
                                }}
                              >
                                <CardContent sx={{ p: 3 }}>
                                  {/* Tournament Header */}
                                  <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 3 }}>
                                    <Avatar
                                      sx={{
                                        width: 48,
                                        height: 48,
                                        backgroundColor: 'primary.50',
                                      }}
                                    >
                                      <TrophyIcon style={{ width: 24, height: 24, color: 'var(--mui-palette-primary-main)' }} />
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                        {tournament.name}
                                      </Typography>
                                      <Stack direction="row" spacing={1}>
                                        <Chip
                                          label={getStatusLabel(tournament.status)}
                                          size="small"
                                          color={getStatusColor(tournament.status) as import('@mui/material').ChipProps['color']}
                                          variant="outlined"
                                          icon={<StatusIcon style={{ width: 14, height: 14 }} />}
                                        />
                                        <Chip
                                          label={getTypeLabel(tournament.tournament_type)}
                                          size="small"
                                          variant="outlined"
                                          sx={{ fontSize: '0.75rem' }}
                                        />
                                      </Stack>
                                    </Box>
                                  </Stack>

                                  {/* Tournament Info */}
                                  <Stack spacing={2} sx={{ mb: 3 }}>
                                    {tournament.description && (
                                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        {tournament.description}
                                      </Typography>
                                    )}
                                    
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                      <CalendarIcon style={{ width: 16, height: 16, color: 'var(--mui-palette-text-secondary)' }} />
                                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
                                      </Typography>
                                    </Stack>

                                    <Stack direction="row" alignItems="center" spacing={1}>
                                      <UserGroupIcon style={{ width: 16, height: 16, color: 'var(--mui-palette-text-secondary)' }} />
                                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        {tournament.current_participants || 0} / {tournament.max_participants || '∞'} participantes
                                      </Typography>
                                    </Stack>

                                    {tournament.entry_fee && (
                                      <Stack direction="row" alignItems="center" spacing={1}>
                                        <CurrencyDollarIcon style={{ width: 16, height: 16, color: 'var(--mui-palette-text-secondary)' }} />
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                          Inscripción: ${tournament.entry_fee}
                                        </Typography>
                                      </Stack>
                                    )}

                                    <Stack direction="row" alignItems="center" spacing={1}>
                                      <ClockIcon style={{ width: 16, height: 16, color: 'var(--mui-palette-text-secondary)' }} />
                                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Registro hasta: {new Date(tournament.registration_deadline).toLocaleDateString()}
                                      </Typography>
                                    </Stack>
                                  </Stack>

                                  <Divider sx={{ mb: 3 }} />

                                  {/* Actions */}
                                  <Stack direction="row" spacing={1}>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={<EyeIcon style={{ width: 16, height: 16 }} />}
                                      sx={{ flex: 1 }}
                                      onClick={() => openDetailsModal(tournament)}
                                    >
                                      Ver Detalles
                                    </Button>
                                    
                                    <IconButton
                                      onClick={() => openEditModal(tournament)}
                                      size="small"
                                      sx={{
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        '&:hover': {
                                          backgroundColor: 'primary.50',
                                          borderColor: 'primary.main',
                                        },
                                      }}
                                    >
                                      <PencilIcon style={{ width: 16, height: 16 }} />
                                    </IconButton>
                                    
                                    <IconButton
                                      onClick={() => openDeleteModal(tournament)}
                                      size="small"
                                      sx={{
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        '&:hover': {
                                          backgroundColor: 'error.50',
                                          borderColor: 'error.main',
                                        },
                                      }}
                                    >
                                      <TrashIcon style={{ width: 16, height: 16 }} />
                                    </IconButton>
                                  </Stack>
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </Box>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          </Stack>
        </motion.div>
      </Container>

      {/* Modals */}
      <TournamentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTournament}
        tournament={null}
        currentClub={currentClub}
      />
      
      <TournamentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateTournament}
        tournament={selectedTournament}
        currentClub={currentClub}
      />
      
      <TournamentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        tournament={selectedTournament}
      />
      
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteTournament}
        title="Eliminar Torneo"
        message={`¿Estás seguro de que deseas eliminar el torneo "${selectedTournament?.name}"?`}
        itemName={selectedTournament?.name}
      />

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