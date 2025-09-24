'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';
import { Tournament } from '@/types';

interface Member {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  photo?: string;
  ranking?: string;
  gender?: string;
  club?: {
    id: number;
    name: string;
  };
}

interface TournamentParticipant {
  id: number;
  tournament_id: number;
  member_id: number;
  status: 'registered' | 'confirmed' | 'withdrawn' | 'disqualified';
  registration_date: string;
  member: Member;
}

interface TournamentParticipantsProps {
  tournament: Tournament;
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
  onParticipantsChange?: () => void;
}

const TournamentParticipants: React.FC<TournamentParticipantsProps> = ({
  tournament,
  isOpen,
  onClose,
  embedded = false,
  onParticipantsChange,
}) => {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<TournamentParticipant | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<number | ''>('');
  const [participantStatus, setParticipantStatus] = useState<'registered' | 'confirmed' | 'withdrawn' | 'disqualified'>('registered');

  // Use refs to prevent multiple simultaneous requests
  const fetchingParticipants = useRef(false);
  const fetchingMembers = useRef(false);
  const abortController = useRef<AbortController | null>(null);

  // Get max participants with fallback
  const maxParticipants = tournament.max_participants || 0;

  const fetchParticipants = useCallback(async () => {
    if (fetchingParticipants.current || !tournament?.id) return;
    
    fetchingParticipants.current = true;
    
    try {
      // Create a new AbortController for this specific request
      const controller = new AbortController();
      abortController.current = controller;
      
      console.log('🔄 Fetching participants for tournament:', tournament.id);
      
      const response = await axios.get(`/api/tournaments/${tournament.id}/participants`, {
        signal: controller.signal
      });
      
      console.log('✅ Participants response:', response.data);
      
      // Handle the response data structure
      if (response.data.success) {
        const participantsData = response.data.data || [];
        console.log('📊 Participants data:', participantsData);
        setParticipants(Array.isArray(participantsData) ? participantsData : []);
      } else {
        console.warn('⚠️ API response indicates failure:', response.data);
        setParticipants([]);
      }
      
      setError(null);
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError' && error.name !== 'CanceledError') {
        console.error('❌ Error fetching participants:', error);
        console.error('Error details:', {
          message: error.message,
          response: error instanceof Error && 'response' in error ? (error as { response?: { data?: unknown; status?: number } }).response?.data : undefined,
          status: error instanceof Error && 'response' in error ? (error as { response?: { data?: unknown; status?: number } }).response?.status : undefined
        });
        setError('Error al cargar los participantes');
        setParticipants([]);
      } else if (error instanceof Error && (error.name === 'AbortError' || error.name === 'CanceledError')) {
        console.log('🚫 Request was cancelled (this is normal in development mode)');
      }
    } finally {
      fetchingParticipants.current = false;
    }
  }, [tournament?.id]);

  const fetchAvailableMembers = useCallback(async () => {
    if (fetchingMembers.current || !tournament?.id) return;
    
    fetchingMembers.current = true;
    
    try {
      // Create a new AbortController for this specific request
      const controller = new AbortController();
      
      console.log('🔄 Fetching available members for tournament:', tournament.id);
      
      const response = await axios.get(`/api/tournaments/${tournament.id}/available-members`, {
        signal: controller.signal
      });
      
      console.log('✅ Available members response:', response.data);
      
      if (response.data.success) {
        const membersData = response.data.data || [];
        console.log('👥 Available members data:', membersData);
        setAvailableMembers(Array.isArray(membersData) ? membersData : []);
      } else {
        console.warn('⚠️ Available members API response indicates failure:', response.data);
        setAvailableMembers([]);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError' && error.name !== 'CanceledError') {
        console.error('❌ Error fetching available members:', error);
        setError('Error al cargar los miembros disponibles');
        setAvailableMembers([]);
      }
    } finally {
      fetchingMembers.current = false;
    }
  }, [tournament?.id]);

  // Debounced data fetching
  useEffect(() => {
    if (!isOpen || !tournament?.id) return;

    const timeoutId = setTimeout(() => {
      setLoading(true);
      Promise.all([
        fetchParticipants(),
        fetchAvailableMembers()
      ]).finally(() => {
        setLoading(false);
      });
    }, 100); // Small delay to prevent rapid successive calls

    return () => {
      clearTimeout(timeoutId);
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [isOpen, tournament?.id, fetchParticipants, fetchAvailableMembers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  const handleAddParticipant = async () => {
    if (!selectedMemberId) return;

    try {
      setLoading(true);
      console.log('➕ Adding participant:', { member_id: selectedMemberId, status: participantStatus });
      
      const response = await axios.post(`/api/tournaments/${tournament.id}/participants`, {
        member_id: selectedMemberId,
        status: participantStatus,
      });

      console.log('✅ Participant added:', response.data);

      if (response.data.success) {
        await fetchParticipants();
        await fetchAvailableMembers();
        setAddModalOpen(false);
        setSelectedMemberId('');
        setParticipantStatus('registered');
        onParticipantsChange?.();
        setError(null);
      } else {
        setError(response.data.message || 'Error al agregar participante');
      }
    } catch (error) {
      console.error('❌ Error adding participant:', error);
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'Error al agregar participante');
      } else {
        setError('Error al agregar participante');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditParticipant = async () => {
    if (!selectedParticipant) return;

    try {
      setLoading(true);
      console.log('✏️ Updating participant:', { id: selectedParticipant.id, status: participantStatus });
      
      const response = await axios.put(`/api/tournaments/${tournament.id}/participants/${selectedParticipant.id}`, {
        status: participantStatus,
      });

      console.log('✅ Participant updated:', response.data);

      if (response.data.success) {
        await fetchParticipants();
        setEditModalOpen(false);
        setSelectedParticipant(null);
        onParticipantsChange?.();
        setError(null);
      } else {
        setError(response.data.message || 'Error al actualizar participante');
      }
    } catch (error) {
      console.error('❌ Error updating participant:', error);
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'Error al actualizar participante');
      } else {
        setError('Error al actualizar participante');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteParticipant = async (participantId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este participante?')) return;

    try {
      setLoading(true);
      console.log('🗑️ Deleting participant:', participantId);
      
      const response = await axios.delete(`/api/tournaments/${tournament.id}/participants/${participantId}`);
      
      console.log('✅ Participant deleted:', response.data);

      if (response.data.success) {
        await fetchParticipants();
        await fetchAvailableMembers();
        onParticipantsChange?.();
        setError(null);
      } else {
        setError(response.data.message || 'Error al eliminar participante');
      }
    } catch (error) {
      console.error('❌ Error deleting participant:', error);
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'Error al eliminar participante');
      } else {
        setError('Error al eliminar participante');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): 'success' | 'info' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'registered': return 'info';
      case 'withdrawn': return 'warning';
      case 'disqualified': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'registered': return 'Registrado';
      case 'withdrawn': return 'Retirado';
      case 'disqualified': return 'Descalificado';
      default: return status;
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchParticipants(),
      fetchAvailableMembers()
    ]).finally(() => {
      setLoading(false);
    });
  };

  const renderContent = () => (
    <Box sx={{ p: embedded ? 0 : 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tournament Info Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2">
              {tournament.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <IconButton onClick={handleRefresh} disabled={loading} size="small">
                <RefreshIcon />
              </IconButton>
              {embedded && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setAddModalOpen(true)}
                  disabled={loading || participants.length >= maxParticipants || availableMembers.length === 0}
                  size="small"
                >
                  Agregar Participante
                </Button>
              )}
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip
              label={`${participants.length}/${maxParticipants || '∞'} Participantes`}
              color={participants.length >= maxParticipants ? 'error' : 'primary'}
              variant="outlined"
            />
            <Chip
              label={`${availableMembers.length} Miembros Disponibles`}
              color="info"
              variant="outlined"
            />
            {maxParticipants > 0 && participants.length >= maxParticipants && (
              <Typography variant="body2" color="error">
                Torneo completo
              </Typography>
            )}
            {availableMembers.length === 0 && participants.length < maxParticipants && (
              <Typography variant="body2" color="warning.main">
                No hay miembros disponibles para agregar
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Add Participant Button (for non-embedded mode) */}
      {!embedded && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Participantes
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddModalOpen(true)}
            disabled={loading || (maxParticipants > 0 && participants.length >= maxParticipants) || availableMembers.length === 0}
          >
            Agregar Participante
          </Button>
        </Box>
      )}

      {/* Participants List */}
      {loading && participants.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : participants.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay participantes registrados
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {availableMembers.length > 0 
              ? 'Agrega el primer participante para comenzar'
              : 'No hay miembros disponibles en tu club para este torneo'
            }
          </Typography>
          {availableMembers.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Posibles razones por las que no hay miembros disponibles:
              </Typography>
              <ul style={{ textAlign: 'left', marginTop: 8 }}>
                <li>Todos los miembros del club ya están registrados</li>
                <li>Los filtros del torneo (edad, género, ranking) excluyen a todos los miembros</li>
                <li>No hay miembros activos en el club</li>
              </ul>
            </Alert>
          )}
        </Paper>
      ) : (
        <List>
          <AnimatePresence>
            {participants.map((participant, index) => (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <ListItem
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: 'background.paper',
                  }}
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        edge="end"
                        onClick={() => {
                          setSelectedParticipant(participant);
                          setParticipantStatus(participant.status);
                          setEditModalOpen(true);
                        }}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteParticipant(participant.id)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemAvatar>
                    <Avatar
                      src={participant.member.photo}
                      sx={{ bgcolor: 'primary.main' }}
                    >
                      {participant.member.first_name[0]}{participant.member.last_name[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" component="span">
                          {participant.member.first_name} {participant.member.last_name}
                        </Typography>
                        <Chip
                          label={getStatusLabel(participant.status)}
                          color={getStatusColor(participant.status)}
                          size="small"
                        />
                        {participant.member.club && (
                          <Chip
                            label={participant.member.club.name}
                            variant="outlined"
                            size="small"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Stack spacing={0.5} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary" component="span">
                          {participant.member.email}
                        </Typography>
                        {participant.member.ranking && (
                          <Typography variant="body2" color="text.secondary" component="span">
                            Ranking: {participant.member.ranking}
                          </Typography>
                        )}
                        {participant.member.gender && (
                          <Typography variant="body2" color="text.secondary" component="span">
                            Género: {participant.member.gender === 'male' ? 'Masculino' : participant.member.gender === 'female' ? 'Femenino' : 'Mixto'}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" component="span">
                          Registrado: {new Date(participant.registration_date).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItem>
              </motion.div>
            ))}
          </AnimatePresence>
        </List>
      )}

      {/* Add Participant Modal */}
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Participante</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {availableMembers.length === 0 ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  No hay miembros disponibles para agregar a este torneo.
                </Typography>
                <Typography variant="body2">
                  Esto puede deberse a que todos los miembros ya están registrados o no cumplen con los filtros del torneo.
                </Typography>
              </Alert>
            ) : (
              <>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Seleccionar Miembro</InputLabel>
                  <Select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value as number)}
                    label="Seleccionar Miembro"
                  >
                    {availableMembers.map((member) => (
                      <MenuItem key={member.id} value={member.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          <Avatar
                            src={member.photo}
                            sx={{ width: 32, height: 32 }}
                          >
                            {member.first_name[0]}{member.last_name[0]}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1">
                              {member.first_name} {member.last_name}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <Typography variant="caption" color="text.secondary">
                                {member.email}
                              </Typography>
                              {member.ranking && (
                                <Chip
                                  label={`Ranking: ${member.ranking}`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                              {member.club && (
                                <Chip
                                  label={member.club.name}
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                />
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={participantStatus}
                    onChange={(e) => setParticipantStatus(e.target.value as 'registered' | 'confirmed' | 'withdrawn' | 'disqualified')}
                    label="Estado"
                  >
                    <MenuItem value="registered">Registrado</MenuItem>
                    <MenuItem value="confirmed">Confirmado</MenuItem>
                    <MenuItem value="withdrawn">Retirado</MenuItem>
                    <MenuItem value="disqualified">Descalificado</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddModalOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleAddParticipant}
            variant="contained"
            disabled={!selectedMemberId || loading || availableMembers.length === 0}
          >
            {loading ? <CircularProgress size={20} /> : 'Agregar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Participant Modal */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Participante</DialogTitle>
        <DialogContent>
          {selectedParticipant && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  src={selectedParticipant.member.photo}
                  sx={{ width: 56, height: 56 }}
                >
                  {selectedParticipant.member.first_name[0]}{selectedParticipant.member.last_name[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedParticipant.member.first_name} {selectedParticipant.member.last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedParticipant.member.email}
                  </Typography>
                  {selectedParticipant.member.club && (
                    <Chip
                      label={selectedParticipant.member.club.name}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  )}
                </Box>
              </Box>

              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={participantStatus}
                  onChange={(e) => setParticipantStatus(e.target.value as 'registered' | 'confirmed' | 'withdrawn' | 'disqualified')}
                  label="Estado"
                >
                  <MenuItem value="registered">Registrado</MenuItem>
                  <MenuItem value="confirmed">Confirmado</MenuItem>
                  <MenuItem value="withdrawn">Retirado</MenuItem>
                  <MenuItem value="disqualified">Descalificado</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleEditParticipant}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  if (embedded) {
    return renderContent();
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Participantes del Torneo
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default TournamentParticipants;