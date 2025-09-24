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
  Avatar,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  PersonAdd,
  Person,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  Warning,
  Search,
  FilterList
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Tournament, TournamentParticipant, Member } from '@/types';
import api from '@/lib/axios';

interface TournamentParticipantsProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament;
  embedded?: boolean; // Nueva prop para indicar si está embebido en otro modal
}

// Define proper type for Chip color prop
type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

const TournamentParticipants: React.FC<TournamentParticipantsProps> = ({
  isOpen,
  onClose,
  tournament,
  embedded = false
}) => {
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editingParticipant, setEditingParticipant] = useState<TournamentParticipant | null>(null);
  const [notes, setNotes] = useState('');
  const [newStatus, setNewStatus] = useState<string>('registered');
  const [seed, setSeed] = useState<number | ''>('');

  useEffect(() => {
    if (isOpen || embedded) {
      fetchParticipants();
      fetchAvailableMembers();
    }
  }, [isOpen, embedded, tournament.id]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tournaments/${tournament.id}/participants`);
      if (response.data.success) {
        setParticipants(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableMembers = async () => {
    try {
      const response = await api.get(`/tournaments/${tournament.id}/available-members`);
      if (response.data.success) {
        setAvailableMembers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching available members:', error);
    }
  };

  const handleAddParticipant = async () => {
    if (!selectedMember) return;

    try {
      setLoading(true);
      const response = await api.post(`/tournaments/${tournament.id}/participants`, {
        member_id: selectedMember.id,
        notes: notes
      });

      if (response.data.success) {
        await fetchParticipants();
        await fetchAvailableMembers();
        setShowAddModal(false);
        setSelectedMember(null);
        setNotes('');
      }
    } catch (error: unknown) {
      console.error('Error adding participant:', error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Error al agregar participante';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateParticipant = async () => {
    if (!editingParticipant) return;

    try {
      setLoading(true);
      const response = await api.put(
        `/tournaments/${tournament.id}/participants/${editingParticipant.id}`,
        {
          status: newStatus,
          seed: seed || null,
          notes: notes
        }
      );

      if (response.data.success) {
        await fetchParticipants();
        setEditingParticipant(null);
        setNotes('');
        setNewStatus('registered');
        setSeed('');
      }
    } catch (error: unknown) {
      console.error('Error updating participant:', error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Error al actualizar participante';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveParticipant = async (participant: TournamentParticipant) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este participante?')) return;

    try {
      setLoading(true);
      const response = await api.delete(
        `/tournaments/${tournament.id}/participants/${participant.id}`
      );

      if (response.data.success) {
        await fetchParticipants();
        await fetchAvailableMembers();
      }
    } catch (error: unknown) {
      console.error('Error removing participant:', error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Error al eliminar participante';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): ChipColor => {
    switch (status) {
      case 'registered': return 'info';
      case 'confirmed': return 'success';
      case 'withdrawn': return 'warning';
      case 'disqualified': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'registered': return 'Registrado';
      case 'confirmed': return 'Confirmado';
      case 'withdrawn': return 'Retirado';
      case 'disqualified': return 'Descalificado';
      default: return status;
    }
  };

  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = participant.member?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.member?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || participant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeParticipants = participants.filter(p => ['registered', 'confirmed'].includes(p.status));

  // Si está embebido, renderizar solo el contenido sin el Dialog wrapper
  const renderContent = () => (
    <>
      {/* Tournament Info */}
      <Card sx={{ mb: 3, bgcolor: 'primary.50' }}>
        <CardContent>
          <Stack direction="row" spacing={3} alignItems="center">
            <Box>
              <Typography variant="h6" color="primary.main">
                {activeParticipants.length} / {tournament.max_participants}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Participantes Activos
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Fecha límite de inscripción
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {new Date(tournament.registration_deadline).toLocaleDateString()}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Estado del torneo
              </Typography>
              <Chip 
                label={tournament.status} 
                color={tournament.status === 'upcoming' ? 'info' : 'default'}
                size="small"
              />
            </Box>
            <Box sx={{ ml: 'auto' }}>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => setShowAddModal(true)}
                disabled={activeParticipants.length >= (tournament.max_participants || 0)}
              >
                Agregar Participante
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Filters */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Buscar participantes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ flexGrow: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Estado"
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="registered">Registrado</MenuItem>
            <MenuItem value="confirmed">Confirmado</MenuItem>
            <MenuItem value="withdrawn">Retirado</MenuItem>
            <MenuItem value="disqualified">Descalificado</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Participants List */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Cargando participantes...</Typography>
        </Box>
      ) : filteredParticipants.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No hay participantes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {participants.length === 0 
              ? 'Aún no se han registrado participantes en este torneo'
              : 'No se encontraron participantes con los filtros aplicados'
            }
          </Typography>
        </Box>
      ) : (
        <List>
          <AnimatePresence>
            {filteredParticipants.map((participant, index) => (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <ListItem
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    mb: 1,
                    bgcolor: 'background.paper'
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {participant.member?.full_name?.charAt(0) || 'P'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {participant.member?.full_name || 'Sin nombre'}
                        </Typography>
                        <Chip
                          label={getStatusLabel(participant.status)}
                          color={getStatusColor(participant.status)}
                          size="small"
                        />
                        {participant.seed && (
                          <Chip
                            label={`Seed #${participant.seed}`}
                            variant="outlined"
                            size="small"
                          />
                        )}
                      </Stack>
                    }
                    secondary={
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          {participant.member?.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Registrado: {participant.registration_date 
                            ? new Date(participant.registration_date).toLocaleDateString()
                            : 'Fecha no disponible'
                          }
                        </Typography>
                        {participant.notes && (
                          <Typography variant="caption" color="text.secondary">
                            Notas: {participant.notes}
                          </Typography>
                        )}
                      </Stack>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingParticipant(participant);
                          setNewStatus(participant.status);
                          setSeed(participant.seed || '');
                          setNotes(participant.notes || '');
                        }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveParticipant(participant)}
                      >
                        <Delete />
                      </IconButton>
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
              </motion.div>
            ))}
          </AnimatePresence>
        </List>
      )}
    </>
  );

  if (embedded) {
    return (
      <>
        {renderContent()}
        
        {/* Add Participant Modal */}
        <Dialog
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Agregar Participante</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Seleccionar Miembro</InputLabel>
                <Select
                  value={selectedMember?.id || ''}
                  onChange={(e) => {
                    const member = availableMembers.find(m => m.id === e.target.value);
                    setSelectedMember(member || null);
                  }}
                  label="Seleccionar Miembro"
                >
                  {availableMembers.map((member) => (
                    <MenuItem key={member.id} value={member.id}>
                      <Stack>
                        <Typography>{member.full_name || member.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {member.email} - {member.club?.name}
                        </Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Notas (opcional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                rows={3}
                fullWidth
              />

              {availableMembers.length === 0 && (
                <Alert severity="info">
                  No hay miembros disponibles para agregar a este torneo.
                </Alert>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAddModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddParticipant}
              variant="contained"
              disabled={!selectedMember || loading}
            >
              Agregar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Participant Modal */}
        <Dialog
          open={!!editingParticipant}
          onClose={() => setEditingParticipant(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Editar Participante</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Typography variant="subtitle1">
                {editingParticipant?.member?.full_name}
              </Typography>

              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  label="Estado"
                >
                  <MenuItem value="registered">Registrado</MenuItem>
                  <MenuItem value="confirmed">Confirmado</MenuItem>
                  <MenuItem value="withdrawn">Retirado</MenuItem>
                  <MenuItem value="disqualified">Descalificado</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Seed (opcional)"
                type="number"
                value={seed}
                onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : '')}
                fullWidth
                inputProps={{ min: 1 }}
              />

              <TextField
                label="Notas"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                rows={3}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingParticipant(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateParticipant}
              variant="contained"
              disabled={loading}
            >
              Actualizar
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  // Renderizado normal como modal independiente
  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, minHeight: '80vh' }
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h5" component="div" fontWeight="bold">
                Participantes del Torneo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tournament.name}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => setShowAddModal(true)}
              disabled={activeParticipants.length >= (tournament.max_participants || 0)}
            >
              Agregar Participante
            </Button>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2 }}>
          {renderContent()}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Participant Modal */}
      <Dialog
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Agregar Participante</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Seleccionar Miembro</InputLabel>
              <Select
                value={selectedMember?.id || ''}
                onChange={(e) => {
                  const member = availableMembers.find(m => m.id === e.target.value);
                  setSelectedMember(member || null);
                }}
                label="Seleccionar Miembro"
              >
                {availableMembers.map((member) => (
                  <MenuItem key={member.id} value={member.id}>
                    <Stack>
                      <Typography>{member.full_name || member.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {member.email} - {member.club?.name}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Notas (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />

            {availableMembers.length === 0 && (
              <Alert severity="info">
                No hay miembros disponibles para agregar a este torneo.
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddModal(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleAddParticipant}
            variant="contained"
            disabled={!selectedMember || loading}
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Participant Modal */}
      <Dialog
        open={!!editingParticipant}
        onClose={() => setEditingParticipant(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar Participante</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Typography variant="subtitle1">
              {editingParticipant?.member?.full_name}
            </Typography>

            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                label="Estado"
              >
                <MenuItem value="registered">Registrado</MenuItem>
                <MenuItem value="confirmed">Confirmado</MenuItem>
                <MenuItem value="withdrawn">Retirado</MenuItem>
                <MenuItem value="disqualified">Descalificado</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Seed (opcional)"
              type="number"
              value={seed}
              onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : '')}
              fullWidth
              inputProps={{ min: 1 }}
            />

            <TextField
              label="Notas"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingParticipant(null)}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpdateParticipant}
            variant="contained"
            disabled={loading}
          >
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TournamentParticipants;