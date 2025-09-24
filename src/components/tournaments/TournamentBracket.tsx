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
  Paper,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  EmojiEvents,
  Person,
  PlayArrow,
  CheckCircle,
  Schedule,
  ArrowForward,
  SportsTennis,
  Warning,
} from '@mui/icons-material';
import api from '@/lib/axios';

interface Match {
  id: number;
  tournament_id: number;
  round: number;
  match_number: number;
  bracket_position: number;
  participant1_id: number | null;
  participant2_id: number | null;
  winner_id: number | null;
  status: 'pending' | 'in_progress' | 'completed' | 'bye' | 'scheduled';
  score?: string;
  participant1_score: number | null;
  participant2_score: number | null;
  scheduled_at: string | null;
  completed_at: string | null;
  is_bye: boolean;
  next_match_id: number | null;
  participant1?: {
    id: number;
    member: {
      id: number;
      first_name: string;
      last_name: string;
      club: {
        name: string;
      };
    };
  };
  participant2?: {
    id: number;
    member: {
      id: number;
      first_name: string;
      last_name: string;
      club: {
        name: string;
      };
    };
  };
}

interface TournamentBracketProps {
  tournamentId: number | undefined;
  onRefresh?: () => void;
}

export default function TournamentBracket({ tournamentId, onRefresh }: TournamentBracketProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
  const [scoreP1, setScoreP1] = useState('');
  const [scoreP2, setScoreP2] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async () => {
    if (!tournamentId) {
      setError('ID de torneo no válido');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching matches for tournament:', tournamentId);
      
      const response = await api.get(`/api/tournaments/${tournamentId}/matches`);
      console.log('✅ Matches response:', response.data);
      
      if (response.data?.success) {
        const matchesData = response.data.data || [];
        console.log('📊 Matches data:', matchesData);
        setMatches(Array.isArray(matchesData) ? matchesData : []);
      } else if (Array.isArray(response.data)) {
        setMatches(response.data);
      } else {
        console.warn('⚠️ Unexpected matches response format:', response.data);
        setMatches([]);
      }
    } catch (error: unknown) {
      console.error('❌ Error fetching matches:', error);
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 404) {
          setError('Torneo no encontrado');
        } else if (axiosError.response?.status === 403) {
          setError('No tienes permisos para ver este torneo');
        } else {
          setError(axiosError.response?.data?.message || 'Error al cargar los partidos. Por favor, intenta de nuevo.');
        }
      } else {
        setError('Error al cargar los partidos. Por favor, intenta de nuevo.');
      }
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const generateBracket = async () => {
    if (!tournamentId) {
      setError('ID de torneo no válido');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🏗️ Generating bracket for tournament:', tournamentId);
      
      const response = await api.post(`/api/tournaments/${tournamentId}/generate-bracket`);
      console.log('✅ Bracket generation response:', response.data);
      
      if (response.data?.success || response.status === 200) {
        console.log('🎉 Bracket generated successfully');
        await fetchMatches();
        onRefresh?.();
      } else {
        setError(response.data?.message || 'Error al generar el bracket');
      }
    } catch (error: unknown) {
      console.error('❌ Error generating bracket:', error);
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 400) {
          setError(axiosError.response.data?.message || 'No se puede generar el bracket');
        } else if (axiosError.response?.status === 403) {
          setError('No tienes permisos para generar el bracket');
        } else {
          setError(axiosError.response?.data?.message || 'Error al generar el bracket. Por favor, intenta de nuevo.');
        }
      } else {
        setError('Error al generar el bracket. Por favor, intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateMatchScore = async () => {
    if (!selectedMatch || !tournamentId) return;

    try {
      setLoading(true);
      setError(null);
      
      // Determine winner based on scores
      const score1 = parseInt(scoreP1) || 0;
      const score2 = parseInt(scoreP2) || 0;
      
      if (score1 === score2) {
        setError('Los puntajes no pueden ser iguales');
        return;
      }
      
      const winnerId = score1 > score2 ? selectedMatch.participant1_id : selectedMatch.participant2_id;
      
      console.log('🏆 Updating match result:', {
        matchId: selectedMatch.id,
        winnerId,
        score: `${score1}-${score2}`
      });
      
      const response = await api.put(`/api/tournaments/${tournamentId}/matches/${selectedMatch.id}/result`, {
        winner_id: winnerId,
        score: `${score1}-${score2}`,
        score_p1: score1,
        score_p2: score2,
      });
      
      console.log('✅ Match result updated:', response.data);
      
      if (response.data?.success || response.status === 200) {
        await fetchMatches();
        setScoreDialogOpen(false);
        setSelectedMatch(null);
        setScoreP1('');
        setScoreP2('');
        onRefresh?.();
      } else {
        setError(response.data?.message || 'Error al actualizar el resultado');
      }
    } catch (error: unknown) {
      console.error('❌ Error updating match score:', error);
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 400) {
          setError(axiosError.response.data?.message || 'Error al actualizar el resultado');
        } else if (axiosError.response?.status === 403) {
          setError('No tienes permisos para actualizar este partido');
        } else {
          setError(axiosError.response?.data?.message || 'Error al actualizar el resultado. Por favor, intenta de nuevo.');
        }
      } else {
        setError('Error al actualizar el resultado. Por favor, intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tournamentId) {
      fetchMatches();
    } else {
      setError('ID de torneo no proporcionado');
      setMatches([]);
    }
  }, [tournamentId]);

  // Early return for invalid tournament ID
  if (!tournamentId) {
    return (
      <Box textAlign="center" py={4}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Error: ID de torneo no válido
          </Typography>
          <Typography color="text.secondary">
            No se puede cargar el bracket sin un ID de torneo válido.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Show error state
  if (error && !loading) {
    return (
      <Box textAlign="center" py={4}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {error}
          </Typography>
        </Alert>
        <Button
          variant="outlined"
          onClick={fetchMatches}
          startIcon={<SportsTennis />}
        >
          Reintentar
        </Button>
      </Box>
    );
  }

  // Organizar partidos por ronda para bracket progresivo
  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  // Ordenar rondas de menor a mayor (izquierda a derecha)
  const rounds = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => a - b);

  const getRoundName = (round: number, totalRounds: number) => {
    const roundsFromEnd = totalRounds - round + 1;
    switch (roundsFromEnd) {
      case 1: return 'Final';
      case 2: return 'Semifinal';
      case 3: return 'Cuartos de Final';
      case 4: return 'Octavos de Final';
      default: return `Ronda ${round}`;
    }
  };

  const getMatchStatusColor = (match: Match) => {
    switch (match.status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'bye': return 'info';
      case 'scheduled': return 'primary';
      default: return 'default';
    }
  };

  const getMatchStatusIcon = (match: Match) => {
    switch (match.status) {
      case 'completed': return <CheckCircle />;
      case 'in_progress': return <PlayArrow />;
      case 'bye': return <ArrowForward />;
      case 'scheduled': return <Schedule />;
      default: return <Schedule />;
    }
  };

  const canPlayMatch = (match: Match) => {
    return match.participant1_id && match.participant2_id && 
           (match.status === 'pending' || match.status === 'scheduled') &&
           !match.is_bye;
  };

  const getParticipantDisplay = (participant: Match['participant1']) => {
    if (!participant) return 'Esperando...';
    return `${participant.member.first_name} ${participant.member.last_name}`;
  };

  const isWinner = (match: Match, participantId: number | null) => {
    return match.winner_id === participantId;
  };

  const getMatchScore = (match: Match) => {
    if (match.is_bye) return 'Bye';
    if (match.score) return match.score;
    if (match.participant1_score !== null && match.participant2_score !== null) {
      return `${match.participant1_score}-${match.participant2_score}`;
    }
    return null;
  };

  // Calcular el espaciado vertical para cada ronda
  const calculateVerticalSpacing = (round: number, totalRounds: number) => {
    const baseSpacing = 120; // Espaciado base entre partidos
    const multiplier = Math.pow(2, round - 1);
    return baseSpacing * multiplier;
  };

  if (loading && matches.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>Cargando bracket...</Typography>
      </Box>
    );
  }

  if (matches.length === 0 && !loading) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" gutterBottom>
          No hay bracket generado
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          Genera el bracket para comenzar el torneo
        </Typography>
        <Button
          variant="contained"
          onClick={generateBracket}
          disabled={loading}
          startIcon={<SportsTennis />}
        >
          Generar Bracket
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          Bracket de Eliminación
        </Typography>
        <Button
          variant="outlined"
          onClick={generateBracket}
          disabled={loading}
          size="small"
        >
          Regenerar Bracket
        </Button>
      </Box>

      {/* Bracket progresivo de izquierda a derecha */}
      <Box sx={{ overflowX: 'auto', overflowY: 'hidden', pb: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          minWidth: 'fit-content',
          minHeight: '600px',
          position: 'relative'
        }}>
          {rounds.map((round, roundIndex) => {
            const roundMatches = matchesByRound[round].sort((a, b) => a.bracket_position - b.bracket_position);
            const spacing = calculateVerticalSpacing(round, rounds.length);
            
            return (
              <Box 
                key={round} 
                sx={{ 
                  minWidth: '300px',
                  marginRight: roundIndex < rounds.length - 1 ? '60px' : '0',
                  position: 'relative'
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  textAlign="center"
                  mb={3}
                  color="primary"
                  sx={{
                    position: 'sticky',
                    top: 0,
                    backgroundColor: 'background.default',
                    zIndex: 1,
                    py: 1
                  }}
                >
                  {getRoundName(round, rounds.length)}
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: `${spacing / 10}px`,
                  alignItems: 'center'
                }}>
                  {roundMatches.map((match, matchIndex) => (
                    <Box key={match.id} sx={{ position: 'relative' }}>
                      <Card
                        elevation={3}
                        sx={{
                          width: '280px',
                          border: match.status === 'completed' ? '2px solid' : '1px solid',
                          borderColor: match.status === 'completed' ? 'success.main' : 'divider',
                          position: 'relative',
                          backgroundColor: match.is_bye ? 'info.50' : 'background.paper',
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          {/* Estado del partido */}
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Chip
                              icon={getMatchStatusIcon(match)}
                              label={match.is_bye ? 'Bye' : 
                                    match.status === 'completed' ? 'Completado' :
                                    match.status === 'in_progress' ? 'En Progreso' : 
                                    match.status === 'scheduled' ? 'Programado' : 'Pendiente'}
                              color={getMatchStatusColor(match)}
                              size="small"
                            />
                            <Typography variant="caption" color="text.secondary">
                              Partido {match.match_number}
                            </Typography>
                          </Box>

                          {/* Participantes */}
                          {!match.is_bye ? (
                            <Stack spacing={1}>
                              {/* Participante 1 */}
                              <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                                p={1}
                                borderRadius={1}
                                bgcolor={
                                  match.status === 'completed' && isWinner(match, match.participant1_id)
                                    ? 'success.light'
                                    : 'background.default'
                                }
                              >
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Avatar sx={{ width: 24, height: 24 }}>
                                    {isWinner(match, match.participant1_id) ? 
                                      <EmojiEvents sx={{ fontSize: 16 }} /> : 
                                      <Person sx={{ fontSize: 16 }} />
                                    }
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" fontWeight="medium">
                                      {getParticipantDisplay(match.participant1)}
                                    </Typography>
                                    {match.participant1 && (
                                      <Typography variant="caption" color="text.secondary">
                                        {match.participant1.member.club.name}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                                {match.status === 'completed' && match.participant1_score !== null && (
                                  <Typography variant="h6" fontWeight="bold">
                                    {match.participant1_score}
                                  </Typography>
                                )}
                              </Box>

                              <Divider>VS</Divider>

                              {/* Participante 2 */}
                              <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                                p={1}
                                borderRadius={1}
                                bgcolor={
                                  match.status === 'completed' && isWinner(match, match.participant2_id)
                                    ? 'success.light'
                                    : 'background.default'
                                }
                              >
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Avatar sx={{ width: 24, height: 24 }}>
                                    {isWinner(match, match.participant2_id) ? 
                                      <EmojiEvents sx={{ fontSize: 16 }} /> : 
                                      <Person sx={{ fontSize: 16 }} />
                                    }
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" fontWeight="medium">
                                      {getParticipantDisplay(match.participant2)}
                                    </Typography>
                                    {match.participant2 && (
                                      <Typography variant="caption" color="text.secondary">
                                        {match.participant2.member.club.name}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                                {match.status === 'completed' && match.participant2_score !== null && (
                                  <Typography variant="h6" fontWeight="bold">
                                    {match.participant2_score}
                                  </Typography>
                                )}
                              </Box>
                            </Stack>
                          ) : (
                            // Bye match display
                            <Box textAlign="center" py={2}>
                              <Typography variant="body1" fontWeight="bold" color="info.main">
                                {getParticipantDisplay(match.participant1)} 
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Pasa automáticamente
                              </Typography>
                            </Box>
                          )}

                          {/* Mostrar resultado final si está disponible */}
                          {match.status === 'completed' && getMatchScore(match) && !match.is_bye && (
                            <Box mt={2} textAlign="center">
                              <Typography variant="body2" color="success.main" fontWeight="bold">
                                Resultado: {getMatchScore(match)}
                              </Typography>
                            </Box>
                          )}

                          {/* Botón para registrar resultado */}
                          {canPlayMatch(match) && (
                            <Box mt={2}>
                              <Button
                                fullWidth
                                variant="contained"
                                size="small"
                                onClick={() => {
                                  setSelectedMatch(match);
                                  setScoreDialogOpen(true);
                                }}
                              >
                                Registrar Resultado
                              </Button>
                            </Box>
                          )}

                          {/* Indicador de que espera ganadores */}
                          {(!match.participant1_id || !match.participant2_id) && 
                           (match.status === 'pending' || match.status === 'scheduled') && 
                           !match.is_bye && (
                            <Box mt={2} textAlign="center">
                              <Typography variant="caption" color="text.secondary">
                                Esperando ganadores de partidos anteriores
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>

                      {/* Línea conectora hacia la siguiente ronda */}
                      {roundIndex < rounds.length - 1 && match.status === 'completed' && (
                        <Box
                          sx={{
                            position: 'absolute',
                            right: '-30px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '30px',
                            height: '2px',
                            backgroundColor: 'success.main',
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              right: '-6px',
                              top: '-4px',
                              width: 0,
                              height: 0,
                              borderLeft: '6px solid',
                              borderLeftColor: 'success.main',
                              borderTop: '4px solid transparent',
                              borderBottom: '4px solid transparent',
                            }
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Información del bracket */}
      <Box mt={3} p={2} bgcolor="background.paper" borderRadius={1}>
        <Typography variant="body2" color="text.secondary">
          <strong>Bracket de Eliminación:</strong> Los ganadores de cada partido avanzan a la siguiente ronda. 
          El bracket progresa de izquierda a derecha hasta llegar a la final.
        </Typography>
      </Box>

      {/* Dialog para registrar puntuación */}
      <Dialog open={scoreDialogOpen} onClose={() => setScoreDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Registrar Resultado del Partido
        </DialogTitle>
        <DialogContent>
          {selectedMatch && (
            <Box>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Ingresa el resultado del partido entre {getParticipantDisplay(selectedMatch.participant1)} 
                y {getParticipantDisplay(selectedMatch.participant2)}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label={getParticipantDisplay(selectedMatch.participant1)}
                    type="number"
                    value={scoreP1}
                    onChange={(e) => setScoreP1(e.target.value)}
                    inputProps={{ min: 0 }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label={getParticipantDisplay(selectedMatch.participant2)}
                    type="number"
                    value={scoreP2}
                    onChange={(e) => setScoreP2(e.target.value)}
                    inputProps={{ min: 0 }}
                  />
                </Box>
              </Box>
              
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setScoreDialogOpen(false);
            setError(null);
            setScoreP1('');
            setScoreP2('');
          }}>
            Cancelar
          </Button>
          <Button
            onClick={updateMatchScore}
            variant="contained"
            disabled={!scoreP1 || !scoreP2 || loading}
          >
            Guardar Resultado
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}