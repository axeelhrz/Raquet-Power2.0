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
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrophyIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  CalendarIcon,
  GlobeAltIcon,
  InformationCircleIcon,
  StarIcon,
  ArrowPathIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { League, Club } from '@/types';
import axios from '@/lib/axios';

type LeagueWithStatus = League & { status?: 'active' | 'inactive' | string; clubs_count?: number };

interface ClubStats {
  total_leagues: number;
  active_leagues: number;
  inactive_leagues: number;
  provinces: number;
}

interface DashboardData {
  stats: ClubStats;
  leagues: LeagueWithStatus[];
  currentClub: Club | null;
  lastUpdated: number;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export default function ClubLeaguesPage() {
  const { user, loading } = useAuth();
  const [leagues, setLeagues] = useState<LeagueWithStatus[]>([]);
  const [currentClub, setCurrentClub] = useState<Club | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [provinceFilter, setProvinceFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const hasInitialized = useRef(false);
  const cacheKey = useRef<string>('');

  // Generate cache key based on user
  useEffect(() => {
    if (user?.id) {
      cacheKey.current = `leagues_${user.id}_${user.role}`;
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
        setLeagues(cachedData.leagues);
        setCurrentClub(cachedData.currentClub);
        setLastUpdated(cachedData.lastUpdated);
        return;
      }
    }

    try {
      setLoadingData(true);
      console.log('Leagues - Fetching fresh data for user:', user.id);

      let userClub: Club | null = null;

      if (user.role === 'club') {
        // First, get the club information
        const clubsResponse = await axios.get('/api/clubs');
        console.log('Leagues - Clubs response:', clubsResponse.data);
        
        const allClubs = clubsResponse.data.data;
        userClub = allClubs.data.find((club: Club) => club.user_id === user.id) || null;
        console.log('Leagues - User club found:', userClub);
      }

      // Fetch all leagues
      const leaguesResponse = await axios.get('/api/leagues');
      console.log('Leagues - Leagues response:', leaguesResponse.data);
      
      const allLeagues = leaguesResponse.data.data;
      const leaguesData = Array.isArray(allLeagues.data) ? allLeagues.data : allLeagues;
      console.log('Leagues - Processed leagues:', leaguesData);

      // Calculate stats
      const stats: ClubStats = {
        total_leagues: leaguesData.length,
        active_leagues: leaguesData.filter((l: LeagueWithStatus) => l.status === 'active').length,
        inactive_leagues: leaguesData.filter((l: LeagueWithStatus) => l.status === 'inactive').length,
        provinces: [...new Set(leaguesData.map((l: LeagueWithStatus) => l.province).filter(Boolean))].length,
      };

      // Update state
      setLeagues(leaguesData);
      setCurrentClub(userClub);

      // Save to cache
      saveCachedData({
        stats,
        leagues: leaguesData,
        currentClub: userClub,
      });

    } catch (error) {
      console.error('Leagues - Error fetching data:', error);
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

  const filteredLeagues = leagues.filter(league => {
    const matchesSearch = 
      league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      league.province?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || league.status === statusFilter;
    
    const matchesProvince = provinceFilter === 'all' || league.province === provinceFilter;
    
    return matchesSearch && matchesStatus && matchesProvince;
  });

  const stats = {
    total: leagues.length,
    active: leagues.filter(l => l.status === 'active').length,
    inactive: leagues.filter(l => l.status === 'inactive').length,
    provinces: [...new Set(leagues.map(l => l.province).filter(Boolean))].length,
  };

  const provinces = [...new Set(leagues.map(l => l.province).filter(Boolean))].sort();

  const handleJoinLeague = async (leagueId: number) => {
    try {
      if (!currentClub) {
        alert('No se pudo identificar tu club');
        return;
      }

      // Here you would implement the logic to join a league
      // This might involve creating a relationship between club and league
      console.log('Joining league:', leagueId, 'with club:', currentClub.id);
      
      // For now, just show a message
      alert('Funcionalidad de unirse a liga en desarrollo');
      
    } catch (error) {
      console.error('Error joining league:', error);
      alert('Error al intentar unirse a la liga');
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
                <Skeleton key={i} variant="rectangular" height={280} sx={{ borderRadius: 2, width: 300 }} />
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
                        Ligas para {clubName}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          opacity: 0.9,
                          mb: 2,
                          fontSize: '1rem',
                        }}
                      >
                        Explora y únete a ligas disponibles
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
                            label={`Liga actual: ${currentClub.league.name}`}
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                              color: 'white',
                              '& .MuiChip-icon': { color: 'white' },
                            }}
                          />
                        )}
                        <Chip
                          icon={<StarIcon style={{ width: 14, height: 14 }} />}
                          label="Competencias oficiales"
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            '& .MuiChip-icon': { color: 'white' },
                          }}
                        />
                      </Stack>
                    </Box>

                    {/* Refresh Button */}
                    <Box>
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
                                Liga actual: {currentClub.league.name}
                              </Typography>
                            </Stack>
                          )}
                        </Stack>
                      </Box>
                      <Chip
                        label={currentClub.league ? 'Afiliado' : 'Sin Liga'}
                        color={currentClub.league ? 'success' : 'warning'}
                        variant="outlined"
                        size="small"
                      />
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
                  { label: 'Activas', value: stats.active, icon: CheckCircleIcon, color: '#10B981' },
                  { label: 'Inactivas', value: stats.inactive, icon: XCircleIcon, color: '#EF4444' },
                  { label: 'Provincias', value: stats.provinces, icon: GlobeAltIcon, color: '#8B5CF6' },
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
                      placeholder="Buscar por nombre o provincia..."
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
                          <MenuItem value="active">Activas</MenuItem>
                          <MenuItem value="inactive">Inactivas</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel>Provincia</InputLabel>
                        <Select
                          value={provinceFilter}
                          onChange={(e) => setProvinceFilter(e.target.value)}
                          label="Provincia"
                        >
                          <MenuItem value="all">Todas</MenuItem>
                          {provinces.map((province) => (
                            <MenuItem key={province} value={province}>
                              {province}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>

            {/* Leagues Grid */}
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
                {filteredLeagues.length === 0 ? (
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
                      {searchTerm || statusFilter !== 'all' || provinceFilter !== 'all' 
                        ? 'No se encontraron ligas' 
                        : 'No hay ligas disponibles'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                      {searchTerm || statusFilter !== 'all' || provinceFilter !== 'all'
                        ? 'Intenta ajustar los filtros de búsqueda.'
                        : 'Contacta con el administrador para crear nuevas ligas.'}
                    </Typography>
                    <Button
                      onClick={handleRefresh}
                      variant="contained"
                      startIcon={<ArrowPathIcon style={{ width: 20, height: 20 }} />}
                    >
                      Actualizar
                    </Button>
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
                        {filteredLeagues.map((league, index) => (
                          <motion.div
                            key={league.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <Card
                              sx={{
                                width: { xs: '100%', sm: 320 },
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
                                {/* League Header */}
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
                                      {league.name}
                                    </Typography>
                                    <Chip
                                      label={league.status === 'active' ? 'Activa' : 'Inactiva'}
                                      size="small"
                                      color={league.status === 'active' ? 'success' : 'error'}
                                      variant="outlined"
                                      icon={league.status === 'active' ? 
                                        <CheckCircleIcon style={{ width: 14, height: 14 }} /> : 
                                        <XCircleIcon style={{ width: 14, height: 14 }} />
                                      }
                                    />
                                  </Box>
                                </Stack>

                                {/* League Info */}
                                <Stack spacing={2} sx={{ mb: 3 }}>
                                  {league.province && (
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                      <MapPinIcon style={{ width: 16, height: 16, color: 'var(--mui-palette-text-secondary)' }} />
                                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        {league.province}
                                      </Typography>
                                    </Stack>
                                  )}
                                  
                                  {league.clubs_count !== undefined && (
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                      <UserGroupIcon style={{ width: 16, height: 16, color: 'var(--mui-palette-text-secondary)' }} />
                                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        {league.clubs_count} clubes afiliados
                                      </Typography>
                                    </Stack>
                                  )}

                                  {league.created_at && (
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                      <CalendarIcon style={{ width: 16, height: 16, color: 'var(--mui-palette-text-secondary)' }} />
                                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Creada: {new Date(league.created_at).toLocaleDateString()}
                                      </Typography>
                                    </Stack>
                                  )}
                                </Stack>

                                <Divider sx={{ mb: 3 }} />

                                {/* Actions */}
                                <Stack direction="row" spacing={1}>
                                  <Button
                                    onClick={() => handleJoinLeague(league.id)}
                                    disabled={league.status !== 'active' || currentClub?.league?.id === league.id}
                                    variant="contained"
                                    size="small"
                                    sx={{
                                      flex: 1,
                                      fontWeight: 600,
                                    }}
                                  >
                                    {currentClub?.league?.id === league.id ? 'Ya Afiliado' : 'Solicitar Afiliación'}
                                  </Button>
                                  
                                  <IconButton
                                    size="small"
                                    sx={{
                                      border: '1px solid',
                                      borderColor: 'divider',
                                      '&:hover': {
                                        backgroundColor: 'grey.50',
                                      },
                                    }}
                                  >
                                    <EyeIcon style={{ width: 16, height: 16 }} />
                                  </IconButton>
                                </Stack>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </Box>
                  </CardContent>
                )}
              </Card>
            </motion.div>

            {/* Info Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
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
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Información sobre Afiliaciones
                </Typography>
                <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2 }}>
                  <Typography component="li" variant="body2">
                    Las solicitudes de afiliación deben ser aprobadas por la liga correspondiente
                  </Typography>
                  <Typography component="li" variant="body2">
                    Un club puede estar afiliado a múltiples ligas según las regulaciones
                  </Typography>
                  <Typography component="li" variant="body2">
                    Solo las ligas activas aceptan nuevas afiliaciones
                  </Typography>
                  <Typography component="li" variant="body2">
                    Contacta con el administrador de la liga para más información sobre requisitos
                  </Typography>
                </Stack>
              </Alert>
            </motion.div>
          </Stack>
        </motion.div>
      </Container>

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
