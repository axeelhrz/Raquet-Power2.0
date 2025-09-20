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
  Fade,
  Skeleton,
  Divider,
  Stack,
  IconButton,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UsersIcon, 
  TrophyIcon, 
  PlusIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ArrowRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import axios from '@/lib/axios';
import type { Member, League, Club } from '@/types';
import Link from 'next/link';

interface ClubStats {
  total_members: number;
  active_members: number;
  male_members: number;
  female_members: number;
}

interface DashboardData {
  stats: ClubStats;
  recentMembers: Member[];
  leagues: League[];
  currentClub: Club | null;
  lastUpdated: number;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export default function ClubDashboardPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<ClubStats | null>(null);
  const [recentMembers, setRecentMembers] = useState<Member[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [currentClub, setCurrentClub] = useState<Club | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const hasInitialized = useRef(false);
  const cacheKey = useRef<string>('');

  // Generate cache key based on user
  useEffect(() => {
    if (user?.id) {
      cacheKey.current = `dashboard_${user.id}_${user.role}`;
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

  const fetchDashboardData = useCallback(async (forceRefresh = false) => {
    if (!user || (user.role !== 'club' && user.role !== 'super_admin')) return;

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = loadCachedData();
      if (cachedData) {
        setStats(cachedData.stats);
        setRecentMembers(cachedData.recentMembers);
        setLeagues(cachedData.leagues);
        setCurrentClub(cachedData.currentClub);
        setLastUpdated(cachedData.lastUpdated);
        return;
      }
    }

    try {
      setLoadingData(true);
      console.log('Dashboard - Fetching fresh data for user:', user.id);

      let clubStats: ClubStats = {
        total_members: 0,
        active_members: 0,
        male_members: 0,
        female_members: 0,
      };
      let members: Member[] = [];
      let userClub: Club | null = null;

      if (user.role === 'club') {
        // Fetch clubs to find the current user's club
        const clubsResponse = await axios.get('/api/clubs');
        const allClubs = clubsResponse.data.data;
        
        // Find the club that belongs to this user
        userClub = allClubs.data.find((club: Club) => club.user_id === user.id) || null;
        
        if (userClub) {
          // Fetch members for this specific club
          const membersResponse = await axios.get(`/api/members?club_id=${userClub.id}`);
          
          if (membersResponse.data.data) {
            // Handle both paginated and non-paginated responses
            members = Array.isArray(membersResponse.data.data.data) 
              ? membersResponse.data.data.data 
              : Array.isArray(membersResponse.data.data)
              ? membersResponse.data.data
              : [];
          }

          // Calculate stats for this specific club
          clubStats = {
            total_members: members.length,
            active_members: members.filter(member => member.status === 'active').length,
            male_members: members.filter(member => member.gender === 'male').length,
            female_members: members.filter(member => member.gender === 'female').length,
          };
        }
      } else if (user.role === 'super_admin') {
        // Super admin can see all data
        const [membersResponse] = await Promise.all([
          axios.get('/api/members'),
          axios.get('/api/clubs')
        ]);
        
        const allMembers = membersResponse.data.data;
        members = Array.isArray(allMembers.data) ? allMembers.data : allMembers;
        
        clubStats = {
          total_members: members.length,
          active_members: members.filter((member: Member) => member.status === 'active').length,
          male_members: members.filter((member: Member) => member.gender === 'male').length,
          female_members: members.filter((member: Member) => member.gender === 'female').length,
        };
      }

      // Fetch leagues (available for all roles)
      const leaguesResponse = await axios.get('/api/leagues');
      const allLeagues = leaguesResponse.data.data;
      const leaguesData = Array.isArray(allLeagues.data) ? allLeagues.data : allLeagues;
      const limitedLeagues = leaguesData.slice(0, 3);

      // Update state
      setStats(clubStats);
      setRecentMembers(members.slice(0, 5));
      setLeagues(limitedLeagues);
      setCurrentClub(userClub);

      // Save to cache
      saveCachedData({
        stats: clubStats,
        recentMembers: members.slice(0, 5),
        leagues: limitedLeagues,
        currentClub: userClub,
      });

    } catch (error) {
      console.error('Dashboard - Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  }, [user, loadCachedData, saveCachedData]);

  // Initialize data only once
  useEffect(() => {
    if (user && (user.role === 'club' || user.role === 'super_admin') && !hasInitialized.current) {
      hasInitialized.current = true;
      fetchDashboardData(false);
    }
  }, [user, fetchDashboardData]);

  // Manual refresh function
  const handleRefresh = () => {
    fetchDashboardData(true);
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

  if (loading) {
    return (
      <ClubLayout>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Stack spacing={4}>
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            <Stack direction="row" spacing={2}>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: 2, flex: 1 }} />
              ))}
            </Stack>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            <Stack direction="row" spacing={3}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2, flex: 1 }} />
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2, flex: 1 }} />
            </Stack>
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
            <Button
              component={Link}
              href="/auth/sign-in"
              variant="contained"
              color="error"
            >
              Iniciar Sesión
            </Button>
          </Card>
        </Container>
      </ClubLayout>
    );
  }

  const clubName = currentClub?.name || user?.name || 'Mi Club';
  const clubCity = currentClub?.city || user?.city;

  return (
    <ClubLayout>
      <Container maxWidth="md">
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
                      <BuildingOfficeIcon style={{ width: 32, height: 32, color: 'white' }} />
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
                        {clubName}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          opacity: 0.9,
                          mb: 2,
                          fontSize: '1rem',
                        }}
                      >
                        Panel de administración del club
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

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Stack direction="row" spacing={2}>
                {[
                  { label: 'Total', value: stats?.total_members || 0, icon: UsersIcon, color: '#2F6DFB' },
                  { label: 'Activos', value: stats?.active_members || 0, icon: UserGroupIcon, color: '#10B981' },
                  { label: 'Hombres', value: stats?.male_members || 0, icon: UsersIcon, color: '#8B5CF6' },
                  { label: 'Mujeres', value: stats?.female_members || 0, icon: UsersIcon, color: '#F59E0B' },
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

            {/* Quick Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button
                component={Link}
                href="/dashboard/club/members"
                variant="outlined"
                size="large"
                startIcon={<PlusIcon style={{ width: 20, height: 20 }} />}
                endIcon={<ArrowRightIcon style={{ width: 16, height: 16 }} />}
                sx={{
                  width: '100%',
                  py: 2,
                  borderRadius: 2,
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'primary.50',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(47, 109, 251, 0.15)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <Box sx={{ textAlign: 'left', flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Gestionar Miembros
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Agregar y administrar miembros del club
                  </Typography>
                </Box>
              </Button>
            </motion.div>

            {/* Content Sections */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              {/* Recent Members */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                style={{ flex: 1 }}
              >
                <Card
                  sx={{
                    borderRadius: 2,
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 3, pb: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          Miembros Recientes
                        </Typography>
                        <Button
                          component={Link}
                          href="/dashboard/club/members"
                          size="small"
                          sx={{ fontWeight: 500, fontSize: '0.8125rem' }}
                        >
                          Ver todos
                        </Button>
                      </Stack>
                    </Box>
                    
                    <Divider />
                    
                    <Box sx={{ p: 3 }}>
                      {recentMembers.length > 0 ? (
                        <Stack spacing={2}>
                          {recentMembers.map((member, index) => (
                            <Fade in={true} timeout={200 + index * 50} key={member.id}>
                              <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                sx={{
                                  p: 2,
                                  borderRadius: 1.5,
                                  backgroundColor: 'grey.50',
                                  transition: 'all 0.15s ease',
                                  '&:hover': {
                                    backgroundColor: 'grey.100',
                                  },
                                }}
                              >
                                <Stack direction="row" alignItems="center" spacing={2}>
                                  <Avatar
                                    sx={{
                                      width: 36,
                                      height: 36,
                                      backgroundColor: 'primary.50',
                                    }}
                                  >
                                    <UsersIcon style={{ width: 18, height: 18, color: 'var(--mui-palette-primary-main)' }} />
                                  </Avatar>
                                  <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                      {member.first_name} {member.last_name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                                      {member.email || 'Sin email'}
                                    </Typography>
                                  </Box>
                                </Stack>
                                <Chip
                                  label={member.status === 'active' ? 'Activo' : 'Inactivo'}
                                  size="small"
                                  color={member.status === 'active' ? 'success' : 'error'}
                                  variant="outlined"
                                  sx={{ fontSize: '0.75rem' }}
                                />
                              </Stack>
                            </Fade>
                          ))}
                        </Stack>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Avatar
                            sx={{
                              width: 48,
                              height: 48,
                              backgroundColor: 'grey.100',
                              mx: 'auto',
                              mb: 2,
                            }}
                          >
                            <UsersIcon style={{ width: 24, height: 24, color: 'var(--mui-palette-grey-400)' }} />
                          </Avatar>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                            No hay miembros
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                            Comienza registrando el primer miembro.
                          </Typography>
                          <Button
                            component={Link}
                            href="/dashboard/club/members"
                            variant="contained"
                            size="small"
                            startIcon={<PlusIcon style={{ width: 16, height: 16 }} />}
                          >
                            Registrar Miembro
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Leagues */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                style={{ flex: 1 }}
              >
                <Card
                  sx={{
                    borderRadius: 2,
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 3, pb: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          Ligas Disponibles
                        </Typography>
                        <Button
                          component={Link}
                          href="/leagues"
                          size="small"
                          sx={{ fontWeight: 500, fontSize: '0.8125rem' }}
                        >
                          Ver todas
                        </Button>
                      </Stack>
                    </Box>
                    
                    <Divider />
                    
                    <Box sx={{ p: 3 }}>
                      {leagues.length > 0 ? (
                        <Stack spacing={2}>
                          {leagues.map((league, index) => (
                            <Fade in={true} timeout={200 + index * 50} key={league.id}>
                              <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                sx={{
                                  p: 2,
                                  borderRadius: 1.5,
                                  backgroundColor: 'grey.50',
                                  transition: 'all 0.15s ease',
                                  '&:hover': {
                                    backgroundColor: 'grey.100',
                                  },
                                }}
                              >
                                <Stack direction="row" alignItems="center" spacing={2}>
                                  <Avatar
                                    sx={{
                                      width: 36,
                                      height: 36,
                                      backgroundColor: 'warning.50',
                                    }}
                                  >
                                    <TrophyIcon style={{ width: 18, height: 18, color: 'var(--mui-palette-warning-main)' }} />
                                  </Avatar>
                                  <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                      {league.name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                                      {league.province && `${league.province}`}
                                      {league.clubs_count && ` • ${league.clubs_count} clubes`}
                                    </Typography>
                                  </Box>
                                </Stack>
                                <Chip
                                  label={league.status === 'active' ? 'Activa' : 'Inactiva'}
                                  size="small"
                                  color={league.status === 'active' ? 'success' : 'error'}
                                  variant="outlined"
                                  sx={{ fontSize: '0.75rem' }}
                                />
                              </Stack>
                            </Fade>
                          ))}
                        </Stack>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Avatar
                            sx={{
                              width: 48,
                              height: 48,
                              backgroundColor: 'grey.100',
                              mx: 'auto',
                              mb: 2,
                            }}
                          >
                            <TrophyIcon style={{ width: 24, height: 24, color: 'var(--mui-palette-grey-400)' }} />
                          </Avatar>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                            No hay ligas disponibles
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Contacta con el administrador para unirte a una liga.
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Stack>
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
