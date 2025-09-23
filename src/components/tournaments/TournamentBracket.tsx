'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Avatar,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrophyIcon,
  UserIcon,
  ClockIcon,
  PlayIcon,
  CheckCircleIcon,
  PencilIcon,
  EyeIcon,
  CalendarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { Tournament, TournamentParticipant } from '@/types';
import api from '@/lib/axios';

interface SetData {
  set_number: number;
  participant1_score: number;
  participant2_score: number;
  winner_id?: number;
}

interface Match {
  id: number;
  tournament_id: number;
  round: number;
  match_number: number;
  participant1_id?: number;
  participant2_id?: number;
  winner_id?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'bye';
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  score?: string;
  notes?: string;
  court_number?: number;
  referee?: string;
  sets_data?: SetData[];
  duration_minutes?: number;
  bracket_position?: number;
  next_match_id?: number;
  is_bye: boolean;
  participant1?: TournamentParticipant;
  participant2?: TournamentParticipant;
  winner?: TournamentParticipant;
  display_name?: string;
  participant_names?: {
    participant1: string;
    participant2: string;
    winner?: string;
  };
}

interface BracketData {
  tournament: Tournament;
  bracket: Record<string, Match[]>;
  total_rounds: number;
  completed_matches: number;
  total_matches: number;
}

interface TournamentBracketProps {
  tournament: Tournament;
  canManage?: boolean;
  onRefresh?: () => void;
}

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

export default function TournamentBracket({
  tournament,
  canManage = false,
  onRefresh
}: TournamentBracketProps) {
  const [bracketData, setBracketData] = useState<BracketData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [resultForm, setResultForm] = useState({
    winner_id: '',
    score: '',
    duration_minutes: '',
    notes: '',
    court_number: '',
    referee: ''
  });

  useEffect(() => {
    fetchBracket();
  }, [tournament.id]);

  const fetchBracket = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/tournaments/${tournament.id}/bracket`);
      
      if (response.data.success) {
        setBracketData(response.data.data);
      } else {
        setError('Error al cargar el bracket');
      }
    } catch (error: unknown) {
      console.error('Error fetching bracket:', error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Error al cargar el bracket';
      setError(errorMessage || 'Error al cargar el bracket');
    } finally {
      setLoading(false);
    }
  };

  const generateBracket = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const response = await api.post(`/tournaments/${tournament.id}/generate-bracket`);
      
      if (response.data.success) {
        await fetchBracket();
        onRefresh?.();
        alert('Bracket generado exitosamente');
      } else {
        setError(response.data.message || 'Error al generar el bracket');
      }
    } catch (error: unknown) {
      console.error('Error generating bracket:', error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Error al generar el bracket';
      setError(errorMessage || 'Error al generar el bracket');
    } finally {
      setIsGenerating(false);
    }
  };

  const openResultModal = (match: Match) => {
    setSelectedMatch(match);
    setResultForm({
      winner_id: '',
      score: '',
      duration_minutes: '',
      notes: match.notes || '',
      court_number: match.court_number?.toString() || '',
      referee: match.referee || ''
    });
    setIsResultModalOpen(true);
  };

  const openDetailsModal = (match: Match) => {
    setSelectedMatch(match);
    setIsDetailsModalOpen(true);
  };

  const handleResultSubmit = async () => {
    if (!selectedMatch || !resultForm.winner_id || !resultForm.score) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    try {
      const response = await api.put(
        `/tournaments/${tournament.id}/matches/${selectedMatch.id}/result`,
        {
          winner_id: parseInt(resultForm.winner_id),
          score: resultForm.score,
          duration_minutes: resultForm.duration_minutes ? parseInt(resultForm.duration_minutes) : null,
          notes: resultForm.notes || null,
          court_number: resultForm.court_number ? parseInt(resultForm.court_number) : null,
          referee: resultForm.referee || null
        }
      );

      if (response.data.success) {
        await fetchBracket();
        onRefresh?.();
        setIsResultModalOpen(false);
        alert('Resultado actualizado exitosamente');
      } else {
        alert(response.data.message || 'Error al actualizar el resultado');
      }
    } catch (error: unknown) {
      console.error('Error updating result:', error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Error al actualizar el resultado';
      alert(errorMessage || 'Error al actualizar el resultado');
    }
  };

  const renderMatch = (match: Match, roundIndex: number, matchIndex: number) => {
    const isCompleted = match.status === 'completed';
    const isScheduled = match.status === 'scheduled' && match.participant1_id && match.participant2_id;
    const isBye = match.is_bye || match.status === 'bye';
    const isEmpty = !match.participant1_id && !match.participant2_id;

    return (
      <motion.div
        key={match.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: (roundIndex * 0.1) + (matchIndex * 0.05) }}
      >
        <Card
          sx={{
            minWidth: 280,
            maxWidth: 320,
            border: '2px solid',
            borderColor: isCompleted ? 'success.main' : 
                        isScheduled ? 'warning.main' : 
                        isBye ? 'info.main' : 'grey.300',
            backgroundColor: isCompleted ? 'success.50' : 
                            isScheduled ? 'warning.50' : 
                            isBye ? 'info.50' : 'background.paper',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 4
            },
            position: 'relative'
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              {/* Header */}
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  {getRoundName(match.round, bracketData?.total_rounds || 0)} - Partido {match.match_number}
                </Typography>
                <Stack direction="row" spacing={0.5}>
                  <Chip
                    size="small"
                    label={getStatusLabel(match.status)}
                    color={getStatusColor(match.status)}
                    variant="outlined"
                    icon={getStatusIcon(match.status)}
                  />
                  {canManage && isScheduled && (
                    <Tooltip title="Ingresar resultado">
                      <IconButton
                        size="small"
                        onClick={() => openResultModal(match)}
                        sx={{ ml: 0.5 }}
                      >
                        <PencilIcon style={{ width: 14, height: 14 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                  {(isCompleted || isScheduled) && (
                    <Tooltip title="Ver detalles">
                      <IconButton
                        size="small"
                        onClick={() => openDetailsModal(match)}
                      >
                        <EyeIcon style={{ width: 14, height: 14 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </Stack>

              <Divider />

              {isEmpty ? (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Esperando participantes
                  </Typography>
                </Box>
              ) : isBye ? (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body2" color="info.main" fontWeight={600}>
                    {match.participant1?.member?.full_name || 'Participante'} - Bye
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1.5,
                      borderRadius: 1,
                      backgroundColor: match.winner_id === match.participant1_id ? 'success.100' : 'grey.50',
                      border: match.winner_id === match.participant1_id ? '2px solid' : '1px solid',
                      borderColor: match.winner_id === match.participant1_id ? 'success.main' : 'grey.200'
                    }}
                  >
                    <Avatar sx={{ width: 28, height: 28, backgroundColor: 'primary.100' }}>
                      <UserIcon style={{ width: 14, height: 14 }} />
                    </Avatar>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        flex: 1,
                        fontWeight: match.winner_id === match.participant1_id ? 700 : 500,
                        color: match.winner_id === match.participant1_id ? 'success.dark' : 'text.primary'
                      }}
                    >
                      {match.participant1?.member?.full_name || 'TBD'}
                    </Typography>
                    {match.winner_id === match.participant1_id && (
                      <TrophyIcon style={{ width: 18, height: 18, color: 'var(--mui-palette-success-main)' }} />
                    )}
                  </Box>

                  <Typography variant="caption" sx={{ textAlign: 'center', color: 'text.secondary', fontWeight: 600 }}>
                    VS
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1.5,
                      borderRadius: 1,
                      backgroundColor: match.winner_id === match.participant2_id ? 'success.100' : 'grey.50',
                      border: match.winner_id === match.participant2_id ? '2px solid' : '1px solid',
                      borderColor: match.winner_id === match.participant2_id ? 'success.main' : 'grey.200'
                    }}
                  >
                    <Avatar sx={{ width: 28, height: 28, backgroundColor: 'secondary.100' }}>
                      <UserIcon style={{ width: 14, height: 14 }} />
                    </Avatar>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        flex: 1,
                        fontWeight: match.winner_id === match.participant2_id ? 700 : 500,
                        color: match.winner_id === match.participant2_id ? 'success.dark' : 'text.primary'
                      }}
                    >
                      {match.participant2?.member?.full_name || 'TBD'}
                    </Typography>
                    {match.winner_id === match.participant2_id && (
                      <TrophyIcon style={{ width: 18, height: 18, color: 'var(--mui-palette-success-main)' }} />
                    )}
                  </Box>
                </Stack>
              )}

              {match.score && (
                <>
                  <Divider />
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {match.score}
                    </Typography>
                    {match.duration_minutes && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Duración: {match.duration_minutes} min
                      </Typography>
                    )}
                  </Box>
                </>
              )}

              {(match.court_number || match.referee) && (
                <>
                  <Divider />
                  <Stack direction="row" spacing={2} sx={{ fontSize: '0.75rem' }}>
                    {match.court_number && (
                      <Typography variant="caption" color="text.secondary">
                        Cancha: {match.court_number}
                      </Typography>
                    )}
                    {match.referee && (
                      <Typography variant="caption" color="text.secondary">
                        Árbitro: {match.referee}
                      </Typography>
                    )}
                  </Stack>
                </>
              )}
            </Stack>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const getRoundName = (round: number, totalRounds: number) => {
    if (totalRounds <= 1) return 'Único';
    if (round === totalRounds) return 'Final';
    if (round === totalRounds - 1) return 'Semifinal';
    if (round === totalRounds - 2) return 'Cuartos';
    return `Ronda ${round}`;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programado';
      case 'in_progress': return 'En Juego';
      case 'completed': return 'Finalizado';
      case 'cancelled': return 'Cancelado';
      case 'bye': return 'Bye';
      default: return status;
    }
  };

  const getStatusColor = (status: string): ChipColor => {
    switch (status) {
      case 'scheduled': return 'info';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'bye': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    const iconStyle = { width: 12, height: 12 };
    switch (status) {
      case 'scheduled': return <ClockIcon style={iconStyle} />;
      case 'in_progress': return <PlayIcon style={iconStyle} />;
      case 'completed': return <CheckCircleIcon style={iconStyle} />;
      case 'bye': return <UserIcon style={iconStyle} />;
      default: return <ClockIcon style={iconStyle} />;
    }
  };

  if (loading) {
    return (
      <Card sx={{ border: '1px solid', borderColor: 'grey.200' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography>Cargando bracket...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ border: '1px solid', borderColor: 'error.main' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button onClick={fetchBracket} variant="outlined">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!bracketData || bracketData.total_matches === 0) {
    return (
      <Card sx={{ border: '1px solid', borderColor: 'grey.200' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, backgroundColor: 'grey.100' }}>
            <TrophyIcon style={{ width: 32, height: 32, color: 'var(--mui-palette-grey-400)' }} />
          </Avatar>
          <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
            Bracket no generado
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            El bracket se generará cuando haya suficientes participantes registrados.
          </Typography>
          {canManage && (
            <Button
              onClick={generateBracket}
              variant="contained"
              disabled={isGenerating}
              startIcon={<TrophyIcon style={{ width: 20, height: 20 }} />}
            >
              {isGenerating ? 'Generando...' : 'Generar Bracket'}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ border: '1px solid', borderColor: 'grey.200' }}>
        <CardContent sx={{ p: 0 }}>
          {/* Tournament Progress */}
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                Bracket del Torneo
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  {bracketData.completed_matches} / {bracketData.total_matches} partidos completados
                </Typography>
                <Button
                  onClick={fetchBracket}
                  variant="outlined"
                  size="small"
                >
                  Actualizar
                </Button>
              </Stack>
            </Stack>
            
            <LinearProgress
              variant="determinate"
              value={(bracketData.completed_matches / bracketData.total_matches) * 100}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          <Box sx={{ overflowX: 'auto', pb: 2 }}>
            <Stack direction="row" spacing={4} sx={{ minWidth: 'fit-content', p: 3 }}>
              {Object.entries(bracketData.bracket).map(([round, matches]) => (
                <Box key={round} sx={{ minWidth: 300 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 3, 
                      textAlign: 'center', 
                      fontWeight: 700,
                      color: 'primary.main'
                    }}
                  >
                    {getRoundName(parseInt(round), bracketData.total_rounds)}
                  </Typography>
                  <Stack spacing={3}>
                    {matches.map((match, matchIndex) => renderMatch(match, parseInt(round), matchIndex))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Dialog
        open={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Ingresar Resultado del Partido</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {selectedMatch && (
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>{selectedMatch.participant1?.member?.full_name}</strong> vs{' '}
                  <strong>{selectedMatch.participant2?.member?.full_name}</strong>
                </Typography>
              </Alert>
            )}

            <FormControl fullWidth required>
              <InputLabel>Ganador</InputLabel>
              <Select
                value={resultForm.winner_id}
                onChange={(e) => setResultForm(prev => ({ ...prev, winner_id: e.target.value }))}
                label="Ganador"
              >
                {selectedMatch?.participant1_id && (
                  <MenuItem value={selectedMatch.participant1_id}>
                    {selectedMatch.participant1?.member?.full_name}
                  </MenuItem>
                )}
                {selectedMatch?.participant2_id && (
                  <MenuItem value={selectedMatch.participant2_id}>
                    {selectedMatch.participant2?.member?.full_name}
                  </MenuItem>
                )}
              </Select>
            </FormControl>

            <TextField
              label="Resultado"
              value={resultForm.score}
              onChange={(e) => setResultForm(prev => ({ ...prev, score: e.target.value }))}
              placeholder="Ej: 3-1, 11-9 11-7 9-11 11-6"
              required
              fullWidth
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Duración (minutos)"
                type="number"
                value={resultForm.duration_minutes}
                onChange={(e) => setResultForm(prev => ({ ...prev, duration_minutes: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Cancha"
                type="number"
                value={resultForm.court_number}
                onChange={(e) => setResultForm(prev => ({ ...prev, court_number: e.target.value }))}
                fullWidth
              />
            </Stack>

            <TextField
              label="Árbitro"
              value={resultForm.referee}
              onChange={(e) => setResultForm(prev => ({ ...prev, referee: e.target.value }))}
              fullWidth
            />

            <TextField
              label="Notas"
              value={resultForm.notes}
              onChange={(e) => setResultForm(prev => ({ ...prev, notes: e.target.value }))}
              multiline
              rows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsResultModalOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleResultSubmit}
            variant="contained"
            disabled={!resultForm.winner_id || !resultForm.score}
          >
            Guardar Resultado
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Detalles del Partido</DialogTitle>
        <DialogContent>
          {selectedMatch && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Typography variant="h6">
                {selectedMatch.participant1?.member?.full_name} vs{' '}
                {selectedMatch.participant2?.member?.full_name}
              </Typography>

              <Stack direction="row" spacing={2}>
                <Chip
                  label={getStatusLabel(selectedMatch.status)}
                  color={getStatusColor(selectedMatch.status)}
                  variant="outlined"
                />
                <Chip
                  label={getRoundName(selectedMatch.round, bracketData?.total_rounds || 0)}
                  variant="outlined"
                />
              </Stack>

              {selectedMatch.score && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Resultado</Typography>
                  <Typography variant="h5" color="primary.main">
                    {selectedMatch.score}
                  </Typography>
                  {selectedMatch.winner && (
                    <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                      Ganador: {selectedMatch.winner.member?.full_name}
                    </Typography>
                  )}
                </Box>
              )}

              {(selectedMatch.duration_minutes || selectedMatch.court_number || selectedMatch.referee) && (
                <Stack spacing={1}>
                  {selectedMatch.duration_minutes && (
                    <Typography variant="body2">
                      <strong>Duración:</strong> {selectedMatch.duration_minutes} minutos
                    </Typography>
                  )}
                  {selectedMatch.court_number && (
                    <Typography variant="body2">
                      <strong>Cancha:</strong> {selectedMatch.court_number}
                    </Typography>
                  )}
                  {selectedMatch.referee && (
                    <Typography variant="body2">
                      <strong>Árbitro:</strong> {selectedMatch.referee}
                    </Typography>
                  )}
                </Stack>
              )}

              {selectedMatch.notes && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Notas</Typography>
                  <Typography variant="body2">{selectedMatch.notes}</Typography>
                </Box>
              )}

              {selectedMatch.completed_at && (
                <Typography variant="caption" color="text.secondary">
                  Completado: {new Date(selectedMatch.completed_at).toLocaleString()}
                </Typography>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDetailsModalOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}