'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Card,
  CardContent,
  Chip,
  Avatar,
  Divider,
  Tab,
  Tabs,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrophyIcon,
  CalendarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
  XMarkIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { Tournament } from '@/types';
import TournamentBracket from './TournamentBracket';
import TournamentParticipants from './TournamentParticipants';
import { useAuth } from '@/contexts/AuthContext';

interface TournamentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament | null;
  onRefresh?: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tournament-tabpanel-${index}`}
      aria-labelledby={`tournament-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const TournamentDetailsModal: React.FC<TournamentDetailsModalProps> = ({
  isOpen,
  onClose,
  tournament,
  onRefresh
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(0);
    }
  }, [isOpen]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    onRefresh?.();
  };

  const canManage = Boolean(user && tournament && (
    user.role === 'super_admin' ||
    (user.role === 'club' && tournament.club_id) ||
    (user.role === 'liga' && tournament.league_id)
  ));

  const getStatusColor = (status: string): ChipColor => {
    switch (status) {
      case 'upcoming': return 'info';
      case 'active': return 'success';
      case 'completed': return 'primary';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Próximo';
      case 'active': return 'Activo';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    const iconStyle = { width: 16, height: 16 };
    switch (status) {
      case 'upcoming': return <ClockIcon style={iconStyle} />;
      case 'active': return <PlayIcon style={iconStyle} />;
      case 'completed': return <CheckCircleIcon style={iconStyle} />;
      case 'cancelled': return <XMarkIcon style={iconStyle} />;
      default: return <ClockIcon style={iconStyle} />;
    }
  };

  if (!tournament) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 3, 
          minHeight: '80vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h5" component="div" fontWeight="bold">
              {tournament.name}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
              <Chip
                label={getStatusLabel(tournament.status)}
                color={getStatusColor(tournament.status)}
                variant="outlined"
                size="small"
                icon={getStatusIcon(tournament.status)}
              />
              <Chip
                label={tournament.tournament_type === 'individual' ? 'Individual' : 'Por Equipos'}
                variant="outlined"
                size="small"
              />
              <Chip
                label={tournament.tournament_format || 'Eliminación Simple'}
                variant="outlined"
                size="small"
              />
            </Stack>
          </Box>
          <IconButton onClick={onClose}>
            <XMarkIcon style={{ width: 24, height: 24 }} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 0, py: 0 }}>
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Card sx={{ flex: 1, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Información General
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CalendarIcon style={{ width: 16, height: 16, color: 'var(--mui-palette-text-secondary)' }} />
                    <Typography variant="body2">
                      {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
                    </Typography>
                  </Stack>
                  
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ClockIcon style={{ width: 16, height: 16, color: 'var(--mui-palette-text-secondary)' }} />
                    <Typography variant="body2">
                      Registro hasta: {new Date(tournament.registration_deadline).toLocaleDateString()}
                    </Typography>
                  </Stack>

                  {tournament.location && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <MapPinIcon style={{ width: 16, height: 16, color: 'var(--mui-palette-text-secondary)' }} />
                      <Typography variant="body2">{tournament.location}</Typography>
                    </Stack>
                  )}

                  <Stack direction="row" alignItems="center" spacing={1}>
                    <UsersIcon style={{ width: 16, height: 16, color: 'var(--mui-palette-text-secondary)' }} />
                    <Typography variant="body2">
                      {tournament.current_participants || 0} / {tournament.max_participants} participantes
                    </Typography>
                  </Stack>

                  {tournament.entry_fee && tournament.entry_fee > 0 && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CurrencyDollarIcon style={{ width: 16, height: 16, color: 'var(--mui-palette-text-secondary)' }} />
                      <Typography variant="body2">
                        Inscripción: ${tournament.entry_fee}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Progreso del Torneo
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Partidos completados
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {tournament.matches_played || 0} / {tournament.matches_total || 0}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={tournament.matches_total ? ((tournament.matches_played || 0) / tournament.matches_total) * 100 : 0}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Stack direction="row" spacing={2}>
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                      <Typography variant="h6" color="primary.main">
                        {tournament.current_participants || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Participantes
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                      <Typography variant="h6" color="success.main">
                        {tournament.matches_played || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Partidos
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {(tournament.first_prize || tournament.second_prize || tournament.third_prize) && (
              <Card sx={{ flex: 1, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Premios
                  </Typography>
                  <Stack spacing={1}>
                    {tournament.first_prize && (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <TrophyIcon style={{ width: 16, height: 16, color: 'var(--mui-palette-warning-main)' }} />
                        <Typography variant="body2">1°: {tournament.first_prize}</Typography>
                      </Stack>
                    )}
                    {tournament.second_prize && (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <TrophyIcon style={{ width: 16, height: 16, color: 'var(--mui-palette-grey-500)' }} />
                        <Typography variant="body2">2°: {tournament.second_prize}</Typography>
                      </Stack>
                    )}
                    {tournament.third_prize && (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <TrophyIcon style={{ width: 16, height: 16, color: 'var(--mui-palette-orange-600)' }} />
                        <Typography variant="body2">3°: {tournament.third_prize}</Typography>
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="tournament details tabs">
            <Tab 
              label="Bracket" 
              icon={<ChartBarIcon style={{ width: 20, height: 20 }} />}
              iconPosition="start"
            />
            <Tab 
              label="Participantes" 
              icon={<UserGroupIcon style={{ width: 20, height: 20 }} />}
              iconPosition="start"
            />
            <Tab 
              label="Detalles" 
              icon={<TrophyIcon style={{ width: 20, height: 20 }} />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <Box sx={{ px: 3, minHeight: 400 }}>
          <TabPanel value={activeTab} index={0}>
            <TournamentBracket
              key={`bracket-${refreshKey}`}
              tournamentId={tournament.id}
              onRefresh={handleRefresh}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <TournamentParticipants
              key={`participants-${refreshKey}`}
              isOpen={activeTab === 1}
              onClose={() => {}}
              tournament={tournament}
              embedded={true}
              onParticipantsChange={handleRefresh}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Stack spacing={3}>
              {tournament.description && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      Descripción
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tournament.description}
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {tournament.rules && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      Reglas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tournament.rules}
                    </Typography>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Configuración del Torneo
                  </Typography>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={4}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Tipo</Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {tournament.tournament_type === 'individual' ? 'Individual' : 'Por Equipos'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Formato</Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {tournament.tournament_format === 'single_elimination' ? 'Eliminación Simple' :
                           tournament.tournament_format === 'double_elimination' ? 'Doble Eliminación' :
                           tournament.tournament_format === 'round_robin' ? 'Todos contra Todos' :
                           tournament.tournament_format || 'Eliminación Simple'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Modalidad</Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {tournament.modality === 'singles' ? 'Singles' : 
                           tournament.modality === 'doubles' ? 'Dobles' : 'Singles'}
                        </Typography>
                      </Box>
                    </Stack>

                    {(tournament.age_filter || tournament.ranking_filter || tournament.gender) && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Filtros</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {tournament.age_filter && tournament.min_age && tournament.max_age && (
                            <Chip
                              label={`Edad: ${tournament.min_age}-${tournament.max_age} años`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {tournament.ranking_filter && tournament.min_ranking && tournament.max_ranking && (
                            <Chip
                              label={`Ranking: ${tournament.min_ranking}-${tournament.max_ranking}`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {tournament.gender && tournament.gender !== 'mixed' && (
                            <Chip
                              label={tournament.gender === 'male' ? 'Masculino' : 'Femenino'}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {(tournament.contact_name || tournament.contact_phone || tournament.ball_info) && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      Información de Contacto
                    </Typography>
                    <Stack spacing={1}>
                      {tournament.contact_name && (
                        <Typography variant="body2">
                          <strong>Contacto:</strong> {tournament.contact_name}
                        </Typography>
                      )}
                      {tournament.contact_phone && (
                        <Typography variant="body2">
                          <strong>Teléfono:</strong> {tournament.contact_phone}
                        </Typography>
                      )}
                      {tournament.ball_info && (
                        <Typography variant="body2">
                          <strong>Información de Pelotas:</strong> {tournament.ball_info}
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {tournament.club && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      Club Organizador
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body1" fontWeight={500}>
                        {tournament.club.name}
                      </Typography>
                      {tournament.club.city && (
                        <Typography variant="body2" color="text.secondary">
                          {tournament.club.city}, {tournament.club.province}
                        </Typography>
                      )}
                      {tournament.club.address && (
                        <Typography variant="body2" color="text.secondary">
                          {tournament.club.address}
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </TabPanel>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
        {canManage && (
          <Tooltip title="Actualizar información del torneo">
            <Button onClick={handleRefresh} variant="contained">
              Actualizar
            </Button>
          </Tooltip>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TournamentDetailsModal;