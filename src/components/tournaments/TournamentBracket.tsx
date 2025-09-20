'use client';

import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Avatar,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  TrophyIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Match {
  id: string;
  round: number;
  position: number;
  player1?: string;
  player2?: string;
  winner?: string;
  score?: string;
  date?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface TournamentBracketProps {
  tournamentType: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
  maxParticipants: number;
  currentParticipants: number;
  matches?: Match[];
}

export default function TournamentBracket({
  tournamentType,
  maxParticipants,
  currentParticipants,
  matches = []
}: TournamentBracketProps) {
  
  // Generar estructura de bracket basada en el número de participantes
  const generateBracketStructure = () => {
    const participants = Math.min(maxParticipants, currentParticipants);
    
    if (tournamentType === 'round_robin') {
      return generateRoundRobinStructure(participants);
    }
    
    if (tournamentType === 'single_elimination') {
      return generateSingleEliminationStructure(participants);
    }
    
    if (tournamentType === 'double_elimination') {
      return generateDoubleEliminationStructure(participants);
    }
    
    return generateSwissStructure(participants);
  };

  const generateSingleEliminationStructure = (participants: number) => {
    const rounds = Math.ceil(Math.log2(participants));
    const structure: Match[][] = [];
    
    for (let round = 1; round <= rounds; round++) {
      const matchesInRound = Math.pow(2, rounds - round);
      const roundMatches: Match[] = [];
      
      for (let match = 0; match < matchesInRound; match++) {
        roundMatches.push({
          id: `r${round}m${match}`,
          round,
          position: match,
          player1: round === 1 ? `Jugador ${match * 2 + 1}` : undefined,
          player2: round === 1 ? `Jugador ${match * 2 + 2}` : undefined,
          status: 'pending'
        });
      }
      
      structure.push(roundMatches);
    }
    
    return structure;
  };

  const generateDoubleEliminationStructure = (participants: number) => {
    // Simplificado: mostrar bracket principal y bracket de perdedores
    const mainBracket = generateSingleEliminationStructure(participants);
    const losersBracket = generateSingleEliminationStructure(Math.floor(participants / 2));
    
    return {
      main: mainBracket,
      losers: losersBracket,
      final: [{
        id: 'final',
        round: 1,
        position: 0,
        player1: 'Ganador Bracket Principal',
        player2: 'Ganador Bracket Perdedores',
        status: 'pending' as const
      }]
    };
  };

  const generateRoundRobinStructure = (participants: number) => {
    const matches: Match[] = [];
    let matchId = 0;
    
    for (let i = 1; i <= participants; i++) {
      for (let j = i + 1; j <= participants; j++) {
        matches.push({
          id: `rr${matchId}`,
          round: 1,
          position: matchId,
          player1: `Jugador ${i}`,
          player2: `Jugador ${j}`,
          status: 'pending'
        });
        matchId++;
      }
    }
    
    return [matches];
  };

  const generateSwissStructure = (participants: number) => {
    const rounds = Math.ceil(Math.log2(participants));
    const structure: Match[][] = [];
    
    for (let round = 1; round <= rounds; round++) {
      const matchesInRound = Math.floor(participants / 2);
      const roundMatches: Match[] = [];
      
      for (let match = 0; match < matchesInRound; match++) {
        roundMatches.push({
          id: `s${round}m${match}`,
          round,
          position: match,
          player1: `Jugador ${match * 2 + 1}`,
          player2: `Jugador ${match * 2 + 2}`,
          status: 'pending'
        });
      }
      
      structure.push(roundMatches);
    }
    
    return structure;
  };

  const renderMatch = (match: Match, index: number) => (
    <motion.div
      key={match.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        sx={{
          minWidth: 200,
          border: '1px solid',
          borderColor: match.status === 'completed' ? 'success.main' : 
                      match.status === 'in_progress' ? 'warning.main' : 'grey.300',
          backgroundColor: match.status === 'completed' ? 'success.50' : 
                          match.status === 'in_progress' ? 'warning.50' : 'background.paper',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 2
          }
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Stack spacing={1}>
            {/* Header del partido */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {match.round > 1 ? `Ronda ${match.round}` : 'Primera Ronda'}
              </Typography>
              <Chip
                size="small"
                label={
                  match.status === 'completed' ? 'Finalizado' :
                  match.status === 'in_progress' ? 'En Juego' : 'Pendiente'
                }
                color={
                  match.status === 'completed' ? 'success' :
                  match.status === 'in_progress' ? 'warning' : 'default'
                }
                variant="outlined"
              />
            </Stack>

            <Divider />

            {/* Jugadores */}
            <Stack spacing={1}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: match.winner === match.player1 ? 'success.100' : 'transparent',
                  border: match.winner === match.player1 ? '1px solid' : 'none',
                  borderColor: match.winner === match.player1 ? 'success.main' : 'transparent'
                }}
              >
                <Avatar sx={{ width: 24, height: 24, backgroundColor: 'primary.100' }}>
                  <UserIcon style={{ width: 12, height: 12 }} />
                </Avatar>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    flex: 1,
                    fontWeight: match.winner === match.player1 ? 600 : 400,
                    color: match.winner === match.player1 ? 'success.dark' : 'text.primary'
                  }}
                >
                  {match.player1 || 'TBD'}
                </Typography>
                {match.winner === match.player1 && (
                  <TrophyIcon style={{ width: 16, height: 16, color: 'var(--mui-palette-success-main)' }} />
                )}
              </Box>

              <Typography variant="caption" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                VS
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: match.winner === match.player2 ? 'success.100' : 'transparent',
                  border: match.winner === match.player2 ? '1px solid' : 'none',
                  borderColor: match.winner === match.player2 ? 'success.main' : 'transparent'
                }}
              >
                <Avatar sx={{ width: 24, height: 24, backgroundColor: 'secondary.100' }}>
                  <UserIcon style={{ width: 12, height: 12 }} />
                </Avatar>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    flex: 1,
                    fontWeight: match.winner === match.player2 ? 600 : 400,
                    color: match.winner === match.player2 ? 'success.dark' : 'text.primary'
                  }}
                >
                  {match.player2 || 'TBD'}
                </Typography>
                {match.winner === match.player2 && (
                  <TrophyIcon style={{ width: 16, height: 16, color: 'var(--mui-palette-success-main)' }} />
                )}
              </Box>
            </Stack>

            {/* Información adicional */}
            {(match.score || match.date) && (
              <>
                <Divider />
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  {match.score && (
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {match.score}
                    </Typography>
                  )}
                  {match.date && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <ClockIcon style={{ width: 12, height: 12, color: 'var(--mui-palette-text-secondary)' }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {match.date}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderSingleElimination = (structure: Match[][]) => (
    <Box sx={{ overflowX: 'auto', pb: 2 }}>
      <Stack direction="row" spacing={4} sx={{ minWidth: 'fit-content', p: 2 }}>
        {structure.map((round, roundIndex) => (
          <Box key={roundIndex} sx={{ minWidth: 220 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2, 
                textAlign: 'center', 
                fontWeight: 600,
                color: 'primary.main'
              }}
            >
              {roundIndex === structure.length - 1 ? 'Final' : 
               roundIndex === structure.length - 2 ? 'Semifinal' :
               roundIndex === structure.length - 3 ? 'Cuartos' :
               `Ronda ${roundIndex + 1}`}
            </Typography>
            <Stack spacing={3}>
              {round.map((match, matchIndex) => renderMatch(match, matchIndex))}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );

  const renderRoundRobin = (structure: Match[][]) => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 600, color: 'primary.main' }}>
        Todos contra Todos
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 2,
          maxHeight: 400,
          overflowY: 'auto'
        }}
      >
        {structure[0]?.map((match, index) => renderMatch(match, index))}
      </Box>
    </Box>
  );

  const renderDoubleElimination = (
    structure: { main: Match[][]; losers: Match[][]; final: Match[] }
  ) => (
    <Box sx={{ overflowX: 'auto', pb: 2 }}>
      <Stack spacing={4}>
        {/* Bracket Principal */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 600, color: 'primary.main' }}>
            Bracket Principal
          </Typography>
          <Stack direction="row" spacing={4} sx={{ minWidth: 'fit-content', p: 2 }}>
            {structure.main.map((round: Match[], roundIndex: number) => (
              <Box key={roundIndex} sx={{ minWidth: 220 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, textAlign: 'center', color: 'text.secondary' }}>
                  Ronda {roundIndex + 1}
                </Typography>
                <Stack spacing={3}>
                  {round.map((match: Match, matchIndex: number) => renderMatch(match, matchIndex))}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Bracket de Perdedores */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 600, color: 'warning.main' }}>
            Bracket de Perdedores
          </Typography>
          <Stack direction="row" spacing={4} sx={{ minWidth: 'fit-content', p: 2 }}>
            {structure.losers.map((round: Match[], roundIndex: number) => (
              <Box key={roundIndex} sx={{ minWidth: 220 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, textAlign: 'center', color: 'text.secondary' }}>
                  L-Ronda {roundIndex + 1}
                </Typography>
                <Stack spacing={3}>
                  {round.map((match: Match, matchIndex: number) => renderMatch(match, matchIndex))}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Final */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 600, color: 'success.main' }}>
            Gran Final
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            {renderMatch(structure.final[0], 0)}
          </Box>
        </Box>
      </Stack>
    </Box>
  );

  const structure = generateBracketStructure();

  if (currentParticipants === 0) {
    return (
      <Card sx={{ border: '1px solid', borderColor: 'grey.200' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, backgroundColor: 'grey.100' }}>
            <TrophyIcon style={{ width: 32, height: 32, color: 'var(--mui-palette-grey-400)' }} />
          </Avatar>
          <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
            Sin Participantes
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            El bracket se generará automáticamente cuando se registren los participantes.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ border: '1px solid', borderColor: 'grey.200' }}>
      <CardContent sx={{ p: 0 }}>
        {tournamentType === 'single_elimination' && renderSingleElimination(structure as Match[][])}
        {tournamentType === 'double_elimination' && 
          typeof structure === 'object' &&
          structure !== null &&
          'main' in structure &&
          'losers' in structure &&
          'final' in structure &&
          renderDoubleElimination(structure as { main: Match[][]; losers: Match[][]; final: Match[] })}
        {tournamentType === 'round_robin' && renderRoundRobin(structure as Match[][])}
        {tournamentType === 'swiss' && renderSingleElimination(structure as Match[][])}
      </CardContent>
    </Card>
  );
}