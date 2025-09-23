'use client';

import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Avatar,
  Chip,
  Divider,
  Card,
  CardContent,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  TrophyIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  InformationCircleIcon,
  XMarkIcon,
  CheckCircleIcon,
  PlayIcon,
  StopIcon,
  DocumentTextIcon,
  StarIcon,
  RectangleGroupIcon
} from '@heroicons/react/24/outline';
import { Tournament } from '@/types';
import TournamentBracket from './TournamentBracket';
import TournamentParticipants from './TournamentParticipants';

interface TournamentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament | null;
}

export default function TournamentDetailsModal({
  isOpen,
  onClose,
  tournament,
}: TournamentDetailsModalProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (!tournament) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return DocumentTextIcon;
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

  const getTypeLabel = (type: string, format?: string) => {
    // First show if it's individual or team
    const typeLabel = type === 'individual' ? 'Individual' : type === 'team' ? 'Por Equipos' : type;
    
    // Then show the format if available
    if (format) {
      const formatLabel = format === 'single_elimination' ? 'Eliminación Simple' :
                         format === 'double_elimination' ? 'Eliminación Doble' :
                         format === 'round_robin' ? 'Todos contra Todos' :
                         format === 'swiss_system' ? 'Sistema Suizo' : format;
      return `${typeLabel} - ${formatLabel}`;
    }
    
    return typeLabel;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatusIcon = getStatusIcon(tournament.status);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          maxHeight: '90vh',
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
        }
      }}
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'flex-start',
          paddingTop: '5vh',
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {/* Header */}
        <DialogTitle sx={{ pb: 2, pr: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  backgroundColor: 'primary.50',
                  border: '2px solid',
                  borderColor: 'primary.100',
                }}
              >
                <TrophyIcon style={{ width: 28, height: 28, color: 'var(--mui-palette-primary-main)' }} />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
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
            <IconButton
              onClick={onClose}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'grey.100',
                },
              }}
            >
              <XMarkIcon style={{ width: 24, height: 24 }} />
            </IconButton>
          </Stack>
        </DialogTitle>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="tournament details tabs">
            <Tab 
              label="Información General" 
              icon={<InformationCircleIcon style={{ width: 20, height: 20 }} />}
              iconPosition="start"
            />
            <Tab 
              label="Participantes" 
              icon={<UserGroupIcon style={{ width: 20, height: 20 }} />}
              iconPosition="start"
            />
            <Tab 
              label="Bracket del Torneo" 
              icon={<RectangleGroupIcon style={{ width: 20, height: 20 }} />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <DialogContent sx={{ px: 3, pb: 2 }}>
          {/* Tab Content */}
          {activeTab === 0 && (
            <Stack spacing={3} sx={{ mt: 2 }}>
              {/* Tournament Description */}
              {tournament.description && (
                <Card sx={{ backgroundColor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="flex-start" spacing={2}>
                      <InformationCircleIcon style={{ width: 20, height: 20, color: 'var(--mui-palette-text-secondary)', marginTop: 2 }} />
                      <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                        {tournament.description}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* Main Information Cards */}
              <Stack spacing={3}>
                {/* Dates and Times Card */}
                <Card sx={{ border: '1px solid', borderColor: 'grey.200' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon style={{ width: 20, height: 20, color: 'var(--mui-palette-primary-main)' }} />
                      Fechas y Horarios
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                          Fecha de Inicio
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatDate(tournament.start_date)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {formatTime(tournament.start_date)}
                        </Typography>
                      </Box>
                      
                      <Divider />
                      
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                          Fecha de Finalización
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatDate(tournament.end_date)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {formatTime(tournament.end_date)}
                        </Typography>
                      </Box>
                      
                      <Divider />
                      
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                          Cierre de Inscripciones
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatDate(tournament.registration_deadline)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {formatTime(tournament.registration_deadline)}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Tournament Details Card */}
                <Card sx={{ border: '1px solid', borderColor: 'grey.200' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <InformationCircleIcon style={{ width: 20, height: 20, color: 'var(--mui-palette-primary-main)' }} />
                      Detalles del Torneo
                    </Typography>
                    <Stack spacing={2}>
                      {tournament.code && (
                        <Box>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                            Código del Torneo
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            #{tournament.code}
                          </Typography>
                        </Box>
                      )}
                      
                      {tournament.code && <Divider />}
                      
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                          Participantes
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <UserGroupIcon style={{ width: 16, height: 16, color: 'var(--mui-palette-text-secondary)' }} />
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {tournament.current_participants || 0} / {tournament.max_participants || '∞'}
                          </Typography>
                        </Stack>
                      </Box>
                      
                      {tournament.entry_fee && (
                        <>
                          <Divider />
                          <Box>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                              Costo de Inscripción
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <CurrencyDollarIcon style={{ width: 16, height: 16, color: 'var(--mui-palette-success-main)' }} />
                              <Typography variant="body1" sx={{ fontWeight: 500, color: 'success.main' }}>
                                ${tournament.entry_fee}
                              </Typography>
                            </Stack>
                          </Box>
                        </>
                      )}
                      
                      {tournament.prize_pool && (
                        <>
                          <Divider />
                          <Box>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                              Premio Total
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <StarIcon style={{ width: 16, height: 16, color: 'var(--mui-palette-warning-main)' }} />
                              <Typography variant="body1" sx={{ fontWeight: 500, color: 'warning.main' }}>
                                ${tournament.prize_pool}
                              </Typography>
                            </Stack>
                          </Box>
                        </>
                      )}
                    </Stack>
                  </CardContent>
                </Card>

                {/* Club Information Card */}
                {tournament.club && (
                  <Card sx={{ border: '1px solid', borderColor: 'grey.200' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BuildingOfficeIcon style={{ width: 20, height: 20, color: 'var(--mui-palette-primary-main)' }} />
                        Información del Club
                      </Typography>
                      <Stack spacing={2}>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                              Nombre del Club
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {tournament.club.name}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                              Ubicación
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <MapPinIcon style={{ width: 16, height: 16, color: 'var(--mui-palette-text-secondary)' }} />
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {tournament.club.city}
                                {tournament.club.province && `, ${tournament.club.province}`}
                              </Typography>
                            </Stack>
                          </Box>
                        </Stack>
                        
                        {tournament.club.address && (
                          <>
                            <Divider />
                            <Box>
                              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                Dirección
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {tournament.club.address}
                              </Typography>
                            </Box>
                          </>
                        )}
                        
                        {(tournament.club.phone || tournament.club.email) && (
                          <>
                            <Divider />
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                              {tournament.club.phone && (
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                    Teléfono
                                  </Typography>
                                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {tournament.club.phone}
                                  </Typography>
                                </Box>
                              )}
                              {tournament.club.email && (
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                    Email
                                  </Typography>
                                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {tournament.club.email}
                                  </Typography>
                                </Box>
                              )}
                            </Stack>
                          </>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                )}

                {/* Tournament Progress Card */}
                {(tournament.status === 'active' || tournament.status === 'in_progress' || tournament.status === 'completed') && (
                  <Card sx={{ border: '1px solid', borderColor: 'grey.200' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PlayIcon style={{ width: 20, height: 20, color: 'var(--mui-palette-success-main)' }} />
                        Progreso del Torneo
                      </Typography>
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                        <Box sx={{ flex: 1, textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                            {tournament.current_participants || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Participantes Registrados
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
                            {tournament.matches_played || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Partidos Jugados
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main', mb: 1 }}>
                            {tournament.matches_total || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Total de Partidos
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                )}
              </Stack>
            </Stack>
          )}

          {/* Participants Tab */}
          {activeTab === 1 && (
            <Box sx={{ mt: 2 }}>
              <TournamentParticipants tournament={tournament} isOpen={isOpen} onClose={onClose} />
            </Box>
          )}

          {/* Bracket Tab */}
          {activeTab === 2 && (
            <Box sx={{ mt: 2 }}>
              <TournamentBracket
                tournamentType={tournament.tournament_type}
                tournamentFormat={tournament.tournament_format}
                maxParticipants={tournament.max_participants || 8}
                currentParticipants={tournament.current_participants || 0}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button
            onClick={onClose}
            variant="contained"
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: 2,
              textTransform: 'none',
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 16px rgba(47, 109, 251, 0.4)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </motion.div>
    </Dialog>
  );
}