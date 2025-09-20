'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Stack,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Switch,
  FormControlLabel,
  Chip,
  Avatar,
  Divider,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  SportsTennis,
  Groups,
  CheckCircle,
  Upload,
  Refresh,
  CalendarToday,
  LocationOn,
  Person,
  EmojiEvents,
  Settings,
  EmojiEventsOutlined
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Tournament, Club } from '@/types';

interface TournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tournament: Partial<Tournament>) => void;
  tournament?: Tournament | null;
  currentClub?: Club | null;
}

const getStepsForType = (type: string) => {
  if (type === 'team') {
    return ['Tipo de Torneo', 'Información Básica', 'Parámetros del Torneo', 'Imagen y Previsualización', 'Premios', 'Información de Contacto'];
  }
  return ['Tipo de Torneo', 'Información Básica', 'Parámetros del Torneo', 'Imagen y Previsualización', 'Premios', 'Información de Contacto'];
};

const TournamentModal: React.FC<TournamentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  tournament,
  currentClub
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Tipo de torneo
    type: '',
    
    // Información básica
    code: '',
    name: '',
    date: '',
    time: '',
    registrationDeadline: '',
    country: 'Argentina',
    province: '',
    city: '',
    clubName: '',
    clubAddress: '',
    
    // Parámetros del torneo - Individual
    modality: true,
    matchType: 'best_of_3',
    eliminationType: 'single',
    maxParticipants: 32,
    seedingType: 'ranking',
    rankingFilter: false,
    minRanking: '',
    maxRanking: '',
    ageFilter: false,
    minAge: '',
    maxAge: '',
    gender: 'mixed',
    affectsRanking: true,
    drawLottery: true,
    systemInvitation: true,
    scheduledReminder: false,
    reminderDays: 7,
    
    // Parámetros del torneo - Equipos
    teamModality: 'singles', // singles o dobles
    teamMatchType: 'best_2_of_3', // 2 de 3, 3 de 5, 4 de 7
    teamEliminationType: 'groups', // Por Grupos, Eliminación Directa, Todos contra Todos, Mixto
    playersPerTeam: 2,
    maxRankingBetweenPlayers: 1000,
    categories: [] as string[], // Array de categorías seleccionadas
    numberOfTeams: 8, // 4, 8, 16, 32
    teamSeedingType: 'random', // Aleatorio, Tradicional, Secuencial
    teamRankingFilter: false,
    teamMinRanking: '',
    teamMaxRanking: '',
    teamAgeFilter: false,
    teamMinAge: '',
    teamMaxAge: '',
    teamGender: 'mixed',
    teamAffectsRanking: true,
    teamDrawLottery: true,
    teamSystemInvitation: true,
    teamScheduledReminder: false,
    teamReminderDays: 7, // 7 o 15 días
    
    // Premios (solo para equipos)
    firstPrize: '',
    secondPrize: '',
    thirdPrize: '',
    fourthPrize: '',
    fifthPrize: '',
    
    // Información de contacto (solo para equipos)
    contact: '',
    phone: '',
    ballInfo: '',
    
    // Imagen
    image: null as File | null,
    imagePreview: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Generar código único automáticamente
  const generateTournamentCode = () => {
    const prefix = formData.type === 'individual' ? 'IND' : 'TEA';
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}${date}${random}`;
  };

  useEffect(() => {
    if (isOpen && !tournament) {
      // Generar código automáticamente al abrir modal para nuevo torneo
      setFormData(prev => ({
        ...prev,
        code: generateTournamentCode(),
        clubName: currentClub?.name || '',
        clubAddress: currentClub?.address || '',
        city: currentClub?.city || '',
        province: currentClub?.province || ''
      }));
    }
  }, [isOpen, tournament, currentClub]);

  useEffect(() => {
    if (tournament) {
      setFormData({
        type: tournament.tournament_type === 'single_elimination' || tournament.tournament_type === 'double_elimination' || tournament.tournament_type === 'round_robin' || tournament.tournament_type === 'swiss' ? 'individual' : 'team',
        code: tournament.name?.substring(0, 10).toUpperCase() || '',
        name: tournament.name || '',
        date: tournament.start_date?.split('T')[0] || '',
        time: tournament.start_date?.split('T')[1]?.slice(0, 5) || '',
        registrationDeadline: tournament.registration_deadline?.split('T')[0] || '',
        country: 'Argentina',
        province: tournament.club?.province || '',
        city: tournament.club?.city || '',
        clubName: tournament.club?.name || '',
        clubAddress: tournament.club?.address || '',
        modality: true,
        matchType: 'best_of_3',
        eliminationType: tournament.tournament_type || 'single_elimination',
        maxParticipants: tournament.max_participants || 32,
        seedingType: 'ranking',
        rankingFilter: false,
        minRanking: '',
        maxRanking: '',
        ageFilter: false,
        minAge: '',
        maxAge: '',
        gender: 'mixed',
        affectsRanking: true,
        drawLottery: true,
        systemInvitation: true,
        scheduledReminder: false,
        reminderDays: 7,
        
        // Campos específicos para equipos
        teamModality: 'singles',
        teamMatchType: 'best_2_of_3',
        teamEliminationType: 'groups',
        playersPerTeam: 2,
        maxRankingBetweenPlayers: 1000,
        categories: [],
        numberOfTeams: 8,
        teamSeedingType: 'random',
        teamRankingFilter: false,
        teamMinRanking: '',
        teamMaxRanking: '',
        teamAgeFilter: false,
        teamMinAge: '',
        teamMaxAge: '',
        teamGender: 'mixed',
        teamAffectsRanking: true,
        teamDrawLottery: true,
        teamSystemInvitation: true,
        teamScheduledReminder: false,
        teamReminderDays: 7,
        
        // Premios
        firstPrize: '',
        secondPrize: '',
        thirdPrize: '',
        fourthPrize: '',
        fifthPrize: '',
        
        // Contacto
        contact: '',
        phone: '',
        ballInfo: '',
        
        image: null,
        imagePreview: tournament.description || ''
      });
    }
  }, [tournament]);

  const handleInputChange = (field: string, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, imagePreview: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    const isTeam = formData.type === 'team';

    switch (step) {
      case 0:
        if (!formData.type) newErrors.type = 'Selecciona un tipo de torneo';
        break;
      case 1:
        if (!formData.name) newErrors.name = 'El nombre del torneo es obligatorio';
        if (!formData.date) newErrors.date = 'La fecha es obligatoria';
        if (!formData.time) newErrors.time = 'La hora es obligatoria';
        if (!formData.registrationDeadline) newErrors.registrationDeadline = 'La fecha de cierre es obligatoria';
        if (!formData.country) newErrors.country = 'El país es obligatorio';
        if (!formData.province) newErrors.province = 'La provincia es obligatoria';
        if (!formData.city) newErrors.city = 'La ciudad es obligatoria';
        break;
      case 2:
        if (isTeam) {
          if (!formData.playersPerTeam || formData.playersPerTeam < 1) {
            newErrors.playersPerTeam = 'Mínimo 1 jugador por equipo';
          }
          if (formData.categories.length === 0) {
            newErrors.categories = 'Selecciona al menos una categoría';
          }
          if (formData.teamRankingFilter && (!formData.teamMinRanking || !formData.teamMaxRanking)) {
            newErrors.teamRanking = 'Define el rango de ranking';
          }
          if (formData.teamAgeFilter && (!formData.teamMinAge || !formData.teamMaxAge)) {
            newErrors.teamAge = 'Define el rango de edad';
          }
        } else {
          if (!formData.maxParticipants || formData.maxParticipants < 4) {
            newErrors.maxParticipants = 'Mínimo 4 participantes';
          }
          if (formData.ageFilter && (!formData.minAge || !formData.maxAge)) {
            newErrors.age = 'Define el rango de edad';
          }
        }
        break;
      case 4: // Premios - FOR BOTH INDIVIDUAL AND TEAM TOURNAMENTS
        if (isTeam) {
          if (!formData.firstPrize) newErrors.firstPrize = '1er premio es obligatorio';
          if (!formData.secondPrize) newErrors.secondPrize = '2do premio es obligatorio';
        }
        break;
      case 5: // Información de contacto - FOR BOTH INDIVIDUAL AND TEAM TOURNAMENTS
        if (isTeam) {
          if (!formData.contact) newErrors.contact = 'Contacto es obligatorio';
          if (!formData.phone) newErrors.phone = 'Teléfono es obligatorio';
          if (!formData.ballInfo) newErrors.ballInfo = 'Ball Info es obligatorio';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    if (validateStep(activeStep)) {
      const isTeam = formData.type === 'team';
      
      // Validate and format dates properly
      const validateDate = (dateString: string): string => {
        if (!dateString) {
          throw new Error('Date is required');
        }
        
        // Check if the date is in YYYY-MM-DD format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dateString)) {
          throw new Error('Invalid date format');
        }
        
        // Validate that it's a real date
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date');
        }
        
        return dateString;
      };

      const validateTime = (timeString: string): string => {
        if (!timeString) {
          throw new Error('Time is required');
        }
        
        // Check if the time is in HH:MM format
        const timeRegex = /^\d{2}:\d{2}$/;
        if (!timeRegex.test(timeString)) {
          throw new Error('Invalid time format');
        }
        
        return timeString;
      };

      try {
        const validDate = validateDate(formData.date);
        const validTime = validateTime(formData.time);
        const validRegistrationDeadline = validateDate(formData.registrationDeadline);

        // Mapear los datos del formulario al formato esperado por la API
        const tournamentData: Partial<Tournament> = {
          name: formData.name,
          description: `${isTeam ? 'Torneo por Equipos' : 'Torneo Individual'} - ${isTeam ? formData.teamEliminationType : formData.eliminationType}`,
          tournament_type: (isTeam ? 'team' : 'individual') as 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss',
          start_date: `${validDate}T${validTime}:00`,
          end_date: `${validDate}T23:59:59`,
          registration_deadline: `${validRegistrationDeadline}T23:59:59`,
          max_participants: isTeam ? formData.numberOfTeams : formData.maxParticipants,
          entry_fee: 0,
          status: 'draft' as const,
          club_id: currentClub?.id,
          
          // Campos básicos
          ...(formData.code && { code: formData.code }),
          ...(formData.country && { country: formData.country }),
          ...(formData.province && { province: formData.province }),
          ...(formData.city && { city: formData.city }),
          ...(formData.clubName && { club_name: formData.clubName }),
          ...(formData.clubAddress && { club_address: formData.clubAddress }),
          ...(formData.imagePreview && { image: formData.imagePreview }),
          
          // Campos específicos según tipo
          ...(isTeam ? {
            // Campos para equipos
            ...(formData.playersPerTeam && { team_size: formData.playersPerTeam }),
            ...(formData.teamAgeFilter && formData.teamMinAge && { min_age: parseInt(formData.teamMinAge) }),
            ...(formData.teamAgeFilter && formData.teamMaxAge && { max_age: parseInt(formData.teamMaxAge) }),
            ...(formData.teamGender !== 'mixed' && { gender_restriction: formData.teamGender }),
            skill_level: 'intermediate' as const,
            
            // Premios
            ...(formData.firstPrize && { first_prize: formData.firstPrize }),
            ...(formData.secondPrize && { second_prize: formData.secondPrize }),
            ...(formData.thirdPrize && { third_prize: formData.thirdPrize }),
            ...(formData.fourthPrize && { fourth_prize: formData.fourthPrize }),
            ...(formData.fifthPrize && { fifth_prize: formData.fifthPrize }),
            
            // Contacto
            ...(formData.contact && { contact_name: formData.contact }),
            ...(formData.phone && { contact_phone: formData.phone }),
            ...(formData.ballInfo && { ball_info: formData.ballInfo })
          } : {
            // Campos para individual
            ...(formData.modality !== undefined && { modality: formData.modality ? 'singles' : 'doubles' }),
            ...(formData.eliminationType && { 
              elimination_type: formData.eliminationType === 'single' ? 'simple_elimination' :
                               formData.eliminationType === 'direct' ? 'direct_elimination' :
                               formData.eliminationType === 'round_robin' ? 'round_robin' : 'mixed'
            }),
            ...(formData.rankingFilter && formData.minRanking && { min_ranking: parseInt(formData.minRanking) }),
            ...(formData.rankingFilter && formData.maxRanking && { max_ranking: parseInt(formData.maxRanking) }),
            ...(formData.scheduledReminder && { reminder_days: formData.reminderDays }),
            
            // Premios para individual
            ...(formData.firstPrize && { first_prize: formData.firstPrize }),
            ...(formData.secondPrize && { second_prize: formData.secondPrize }),
            ...(formData.thirdPrize && { third_prize: formData.thirdPrize }),
            ...(formData.fourthPrize && { fourth_prize: formData.fourthPrize }),
            ...(formData.fifthPrize && { fifth_prize: formData.fifthPrize }),
            
            // Contacto para individual
            ...(formData.contact && { contact_name: formData.contact }),
            ...(formData.phone && { contact_phone: formData.phone }),
            ...(formData.ballInfo && { ball_info: formData.ballInfo })
          })
        };
        
        console.log('🏆 Submitting tournament data:', tournamentData);
        onSubmit(tournamentData);
      } catch (error) {
        console.error('❌ Date validation error:', error);
        setErrors(prev => ({
          ...prev,
          date: 'Por favor, verifica que las fechas sean válidas',
          registrationDeadline: 'Por favor, verifica que las fechas sean válidas'
        }));
      }
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setFormData({
      type: '',
      code: '',
      name: '',
      date: '',
      time: '',
      registrationDeadline: '',
      country: 'Argentina',
      province: '',
      city: '',
      clubName: '',
      clubAddress: '',
      modality: true,
      matchType: 'best_of_3',
      eliminationType: 'single',
      maxParticipants: 32,
      seedingType: 'ranking',
      rankingFilter: false,
      minRanking: '',
      maxRanking: '',
      ageFilter: false,
      minAge: '',
      maxAge: '',
      gender: 'mixed',
      affectsRanking: true,
      drawLottery: true,
      systemInvitation: true,
      scheduledReminder: false,
      reminderDays: 7,
      teamModality: 'singles',
      teamMatchType: 'best_2_of_3',
      teamEliminationType: 'groups',
      playersPerTeam: 2,
      maxRankingBetweenPlayers: 1000,
      categories: [],
      numberOfTeams: 8,
      teamSeedingType: 'random',
      teamRankingFilter: false,
      teamMinRanking: '',
      teamMaxRanking: '',
      teamAgeFilter: false,
      teamMinAge: '',
      teamMaxAge: '',
      teamGender: 'mixed',
      teamAffectsRanking: true,
      teamDrawLottery: true,
      teamSystemInvitation: true,
      teamScheduledReminder: false,
      teamReminderDays: 7,
      firstPrize: '',
      secondPrize: '',
      thirdPrize: '',
      fourthPrize: '',
      fifthPrize: '',
      contact: '',
      phone: '',
      ballInfo: '',
      image: null,
      imagePreview: ''
    });
    setErrors({});
    onClose();
  };

  const steps = getStepsForType(formData.type);

  const renderStepContent = (step: number) => {
    const isTeam = formData.type === 'team';
    
    switch (step) {
      case 0:
        return (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom align="center" sx={{ mb: 4 }}>
              Selecciona el Tipo de Torneo
            </Typography>
            <Stack spacing={3}>
              {[
                {
                  id: 'individual',
                  title: 'Torneo Individual',
                  description: 'Competencia individual entre jugadores',
                  icon: <SportsTennis sx={{ fontSize: 40 }} />,
                  color: '#2196F3'
                },
                {
                  id: 'team',
                  title: 'Torneo por Equipos',
                  description: 'Competencia entre equipos de jugadores',
                  icon: <Groups sx={{ fontSize: 40 }} />,
                  color: '#FF9800'
                }
              ].map((type, index) => (
                <motion.div
                  key={type.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: formData.type === type.id ? `2px solid ${type.color}` : '2px solid transparent',
                      backgroundColor: formData.type === type.id ? `${type.color}10` : 'background.paper',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      }
                    }}
                    onClick={() => handleInputChange('type', type.id)}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" spacing={3} alignItems="center">
                        <Box sx={{ color: type.color }}>
                          {type.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {type.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {type.description}
                          </Typography>
                        </Box>
                        {formData.type === type.id && (
                          <CheckCircle sx={{ color: 'success.main', fontSize: 30 }} />
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Stack>
            {errors.type && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errors.type}
              </Alert>
            )}
          </Box>
        );

      case 1:
        return (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Información Básica
            </Typography>
            <Stack spacing={3}>
              {/* Código del Torneo */}
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  label="Código del Torneo"
                  value={formData.code}
                  disabled
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleInputChange('code', generateTournamentCode())}
                          size="small"
                        >
                          <Refresh />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <TextField
                  label="Logo del Club"
                  value={currentClub?.logo_path || 'Sin logo'}
                  disabled
                  fullWidth
                />
              </Stack>

              {/* País, Provincia, Ciudad */}
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  label="País"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  error={!!errors.country}
                  helperText={errors.country}
                  fullWidth
                  required
                />
                <TextField
                  label="Provincia"
                  value={formData.province}
                  onChange={(e) => handleInputChange('province', e.target.value)}
                  error={!!errors.province}
                  helperText={errors.province}
                  fullWidth
                  required
                />
                <TextField
                  label="Ciudad"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  error={!!errors.city}
                  helperText={errors.city}
                  fullWidth
                  required
                />
              </Stack>

              {/* Club y Dirección */}
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  label="Club"
                  value={formData.clubName}
                  onChange={(e) => handleInputChange('clubName', e.target.value)}
                  fullWidth
                  disabled
                />
                <TextField
                  label="Dirección del Club"
                  value={formData.clubAddress}
                  onChange={(e) => handleInputChange('clubAddress', e.target.value)}
                  fullWidth
                />
              </Stack>

              {/* Nombre del Torneo */}
              <TextField
                label="Nombre del Torneo"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                fullWidth
                required
              />

              {/* Fecha y Hora */}
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  label="Fecha"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  error={!!errors.date}
                  helperText={errors.date}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Hora"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  error={!!errors.time}
                  helperText={errors.time}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              {/* Cierre de Inscripciones */}
              <TextField
                label="Cierre de Inscripciones"
                type="date"
                value={formData.registrationDeadline}
                onChange={(e) => handleInputChange('registrationDeadline', e.target.value)}
                error={!!errors.registrationDeadline}
                helperText={errors.registrationDeadline}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Parámetros del Torneo
            </Typography>
            <Stack spacing={3}>
              {isTeam ? (
                // Parámetros para Torneos por Equipos
                <>
                  {/* Modalidad */}
                  <FormControl fullWidth>
                    <InputLabel>Modalidad</InputLabel>
                    <Select
                      value={formData.teamModality}
                      onChange={(e) => handleInputChange('teamModality', e.target.value)}
                      label="Modalidad"
                    >
                      <MenuItem value="singles">Singles</MenuItem>
                      <MenuItem value="dobles">Dobles</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Tipo de Partidos */}
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Partidos</InputLabel>
                    <Select
                      value={formData.teamMatchType}
                      onChange={(e) => handleInputChange('teamMatchType', e.target.value)}
                      label="Tipo de Partidos"
                    >
                      <MenuItem value="best_2_of_3">Al mejor de: 2 de 3 sets</MenuItem>
                      <MenuItem value="best_3_of_5">Al mejor de: 3 de 5 sets</MenuItem>
                      <MenuItem value="best_4_of_7">Al mejor de: 4 de 7 sets</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Tipo de Eliminación */}
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Eliminación</InputLabel>
                    <Select
                      value={formData.teamEliminationType}
                      onChange={(e) => handleInputChange('teamEliminationType', e.target.value)}
                      label="Tipo de Eliminación"
                    >
                      <MenuItem value="groups">Por Grupos</MenuItem>
                      <MenuItem value="direct_elimination">Eliminación Directa</MenuItem>
                      <MenuItem value="round_robin">Todos contra Todos</MenuItem>
                      <MenuItem value="mixed">Mixto</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Cantidad de jugadores por Equipo y Máximo Ranking */}
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      label="Cantidad de jugadores por Equipo"
                      type="number"
                      value={formData.playersPerTeam}
                      onChange={(e) => handleInputChange('playersPerTeam', parseInt(e.target.value))}
                      error={!!errors.playersPerTeam}
                      helperText={errors.playersPerTeam}
                      fullWidth
                      inputProps={{ min: 1, max: 10 }}
                    />
                    <TextField
                      label="Máximo Ranking entre jugadores"
                      type="number"
                      value={formData.maxRankingBetweenPlayers}
                      onChange={(e) => handleInputChange('maxRankingBetweenPlayers', parseInt(e.target.value))}
                      fullWidth
                      inputProps={{ min: 100, max: 5000 }}
                    />
                  </Stack>

                  {/* Categorías a Jugar */}
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Categorías a Jugar
                    </Typography>
                    <Stack spacing={1}>
                      {[
                        { id: 'A_U1400_U1599', label: 'A Categoría U1400 - U1599' },
                        { id: 'B_U1600_U1699', label: 'B Categoría U1600 - U1699' },
                        { id: 'C_U1800_U1899', label: 'C Categoría U1800 - U1899' },
                        { id: 'U5000', label: 'U5000' }
                      ].map((category) => (
                        <FormControlLabel
                          key={category.id}
                          control={
                            <Switch
                              checked={formData.categories.includes(category.id)}
                              onChange={() => handleCategoryChange(category.id)}
                            />
                          }
                          label={category.label}
                        />
                      ))}
                    </Stack>
                    {errors.categories && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        {errors.categories}
                      </Typography>
                    )}
                  </Box>

                  {/* Número de Equipos */}
                  <FormControl fullWidth>
                    <InputLabel>Número de Equipos</InputLabel>
                    <Select
                      value={formData.numberOfTeams}
                      onChange={(e) => handleInputChange('numberOfTeams', e.target.value)}
                      label="Número de Equipos"
                    >
                      <MenuItem value={4}>4</MenuItem>
                      <MenuItem value={8}>8</MenuItem>
                      <MenuItem value={16}>16</MenuItem>
                      <MenuItem value={32}>32</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Tipo de Siembra */}
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Siembra</InputLabel>
                    <Select
                      value={formData.teamSeedingType}
                      onChange={(e) => handleInputChange('teamSeedingType', e.target.value)}
                      label="Tipo de Siembra"
                    >
                      <MenuItem value="random">Aleatorio</MenuItem>
                      <MenuItem value="traditional">Tradicional</MenuItem>
                      <MenuItem value="sequential">Secuencial</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Filtros */}
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Filtros
                    </Typography>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.teamRankingFilter}
                            onChange={(e) => handleInputChange('teamRankingFilter', e.target.checked)}
                          />
                        }
                        label="Filtrar por Ranking"
                      />
                      
                      {formData.teamRankingFilter && (
                        <Stack direction="row" spacing={2}>
                          <TextField
                            label="Ranking Mínimo"
                            type="number"
                            value={formData.teamMinRanking}
                            onChange={(e) => handleInputChange('teamMinRanking', e.target.value)}
                            size="small"
                            inputProps={{ min: 1000, max: 5000 }}
                          />
                          <TextField
                            label="Ranking Máximo"
                            type="number"
                            value={formData.teamMaxRanking}
                            onChange={(e) => handleInputChange('teamMaxRanking', e.target.value)}
                            size="small"
                            inputProps={{ min: 1000, max: 5000 }}
                          />
                        </Stack>
                      )}

                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.teamAgeFilter}
                            onChange={(e) => handleInputChange('teamAgeFilter', e.target.checked)}
                          />
                        }
                        label="Filtrar por Edad"
                      />

                      {formData.teamAgeFilter && (
                        <Stack direction="row" spacing={2}>
                          <TextField
                            label="Edad Mínima"
                            type="number"
                            value={formData.teamMinAge}
                            onChange={(e) => handleInputChange('teamMinAge', e.target.value)}
                            size="small"
                            inputProps={{ min: 5, max: 100 }}
                          />
                          <TextField
                            label="Edad Máxima"
                            type="number"
                            value={formData.teamMaxAge}
                            onChange={(e) => handleInputChange('teamMaxAge', e.target.value)}
                            size="small"
                            inputProps={{ min: 5, max: 100 }}
                          />
                        </Stack>
                      )}
                    </Stack>
                    {errors.teamRanking && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        {errors.teamRanking}
                      </Typography>
                    )}
                    {errors.teamAge && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        {errors.teamAge}
                      </Typography>
                    )}
                  </Box>

                  {/* Sexo */}
                  <FormControl fullWidth>
                    <InputLabel>Sexo</InputLabel>
                    <Select
                      value={formData.teamGender}
                      onChange={(e) => handleInputChange('teamGender', e.target.value)}
                      label="Sexo"
                    >
                      <MenuItem value="mixed">Mixto</MenuItem>
                      <MenuItem value="male">Masculino</MenuItem>
                      <MenuItem value="female">Femenino</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Configuraciones adicionales */}
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Configuraciones Adicionales
                    </Typography>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.teamAffectsRanking}
                            onChange={(e) => handleInputChange('teamAffectsRanking', e.target.checked)}
                          />
                        }
                        label="Afecta al Ranking"
                      />
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.teamDrawLottery}
                            onChange={(e) => handleInputChange('teamDrawLottery', e.target.checked)}
                          />
                        }
                        label="Sorteo de Saque"
                      />

                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.teamSystemInvitation}
                            onChange={(e) => handleInputChange('teamSystemInvitation', e.target.checked)}
                          />
                        }
                        label="Envío de Invitación por Sistema"
                      />

                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.teamScheduledReminder}
                            onChange={(e) => handleInputChange('teamScheduledReminder', e.target.checked)}
                          />
                        }
                        label="Reenvío de Invitación Programable"
                      />

                      {formData.teamScheduledReminder && (
                        <FormControl sx={{ maxWidth: 200 }}>
                          <InputLabel>Días antes del evento</InputLabel>
                          <Select
                            value={formData.teamReminderDays}
                            onChange={(e) => handleInputChange('teamReminderDays', e.target.value)}
                            label="Días antes del evento"
                          >
                            <MenuItem value={7}>7 días</MenuItem>
                            <MenuItem value={15}>15 días</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    </Stack>
                  </Box>
                </>
              ) : (
                // Parámetros para Torneos Individuales - UPDATED WITH NEW REQUIREMENTS
                <>
                  {/* Modalidad */}
                  <FormControl fullWidth>
                    <InputLabel>Modalidad</InputLabel>
                    <Select
                      value={formData.modality ? 'singles' : 'dobles'}
                      onChange={(e) => handleInputChange('modality', e.target.value === 'singles')}
                      label="Modalidad"
                    >
                      <MenuItem value="singles">Singles</MenuItem>
                      <MenuItem value="dobles">Dobles</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Tipo de Eliminación */}
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Eliminación</InputLabel>
                    <Select
                      value={formData.eliminationType}
                      onChange={(e) => handleInputChange('eliminationType', e.target.value)}
                      label="Tipo de Eliminación"
                    >
                      <MenuItem value="single">Eliminación Simple</MenuItem>
                      <MenuItem value="direct">Eliminación Directa</MenuItem>
                      <MenuItem value="round_robin">Todos contra Todos</MenuItem>
                      <MenuItem value="mixed">Mixto</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Número de Participantes"
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                    error={!!errors.maxParticipants}
                    helperText={errors.maxParticipants}
                    fullWidth
                    inputProps={{ min: 4, max: 128 }}
                  />

                  <FormControl fullWidth>
                    <InputLabel>Tipo de Siembra</InputLabel>
                    <Select
                      value={formData.seedingType}
                      onChange={(e) => handleInputChange('seedingType', e.target.value)}
                      label="Tipo de Siembra"
                    >
                      <MenuItem value="ranking">Por Ranking</MenuItem>
                      <MenuItem value="random">Aleatorio</MenuItem>
                      <MenuItem value="manual">Manual</MenuItem>
                    </Select>
                  </FormControl>

                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Filtros de Participación
                    </Typography>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.rankingFilter}
                            onChange={(e) => handleInputChange('rankingFilter', e.target.checked)}
                          />
                        }
                        label="Filtrar por Ranking"
                      />
                      
                      {formData.rankingFilter && (
                        <Stack direction="row" spacing={2}>
                          <TextField
                            label="Ranking Desde"
                            type="number"
                            value={formData.minRanking}
                            onChange={(e) => handleInputChange('minRanking', e.target.value)}
                            size="small"
                            inputProps={{ min: 1000, max: 5000 }}
                            placeholder="1000"
                          />
                          <TextField
                            label="Ranking Hasta"
                            type="number"
                            value={formData.maxRanking}
                            onChange={(e) => handleInputChange('maxRanking', e.target.value)}
                            size="small"
                            inputProps={{ min: 1000, max: 5000 }}
                            placeholder="5000"
                          />
                        </Stack>
                      )}
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.ageFilter}
                            onChange={(e) => handleInputChange('ageFilter', e.target.checked)}
                          />
                        }
                        label="Filtrar por Edad"
                      />

                      {formData.ageFilter && (
                        <Stack direction="row" spacing={2}>
                          <TextField
                            label="Edad Mínima"
                            type="number"
                            value={formData.minAge}
                            onChange={(e) => handleInputChange('minAge', e.target.value)}
                            size="small"
                            inputProps={{ min: 5, max: 100 }}
                          />
                          <TextField
                            label="Edad Máxima"
                            type="number"
                            value={formData.maxAge}
                            onChange={(e) => handleInputChange('maxAge', e.target.value)}
                            size="small"
                            inputProps={{ min: 5, max: 100 }}
                          />
                        </Stack>
                      )}
                    </Stack>
                  </Box>

                  <FormControl fullWidth>
                    <InputLabel>Sexo</InputLabel>
                    <Select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      label="Sexo"
                    >
                      <MenuItem value="mixed">Mixto</MenuItem>
                      <MenuItem value="male">Masculino</MenuItem>
                      <MenuItem value="female">Femenino</MenuItem>
                    </Select>
                  </FormControl>

                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Configuraciones Adicionales
                    </Typography>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.affectsRanking}
                            onChange={(e) => handleInputChange('affectsRanking', e.target.checked)}
                          />
                        }
                        label="Afecta al Ranking"
                      />
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.drawLottery}
                            onChange={(e) => handleInputChange('drawLottery', e.target.checked)}
                          />
                        }
                        label="Sorteo de Saque"
                      />

                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.systemInvitation}
                            onChange={(e) => handleInputChange('systemInvitation', e.target.checked)}
                          />
                        }
                        label="Envío de Invitación por Sistema"
                      />

                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.scheduledReminder}
                            onChange={(e) => handleInputChange('scheduledReminder', e.target.checked)}
                          />
                        }
                        label="Reenvío de Invitación Programada"
                      />

                      {formData.scheduledReminder && (
                        <FormControl sx={{ maxWidth: 200 }}>
                          <InputLabel>Días antes del evento</InputLabel>
                          <Select
                            value={formData.reminderDays}
                            onChange={(e) => handleInputChange('reminderDays', e.target.value)}
                            label="Días antes del evento"
                          >
                            <MenuItem value={7}>7 días</MenuItem>
                            <MenuItem value={15}>15 días</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    </Stack>
                  </Box>
                </>
              )}
            </Stack>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Imagen y Previsualización
            </Typography>
            <Stack spacing={3}>
              {/* Subida de imagen */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Imagen del Torneo
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<Upload />}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Subir Imagen
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>
                
                {formData.imagePreview && (
                  <Box
                    sx={{
                      width: '100%',
                      height: 300,
                      border: '2px dashed #ccc',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundImage: `url(${formData.imagePreview})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative'
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1
                      }}
                    >
                      1080 × 1080
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Previsualización de la publicidad */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Previsualización de la Publicidad
                </Typography>
                <Card 
                  sx={{ 
                    p: 3, 
                    position: 'relative',
                    minHeight: 400,
                    backgroundImage: formData.imagePreview ? `url(${formData.imagePreview})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    '&::before': formData.imagePreview ? {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      borderRadius: 'inherit'
                    } : {}
                  }}
                >
                  <Stack 
                    spacing={2} 
                    alignItems="center" 
                    sx={{ 
                      position: 'relative', 
                      zIndex: 1,
                      color: formData.imagePreview ? 'white' : 'inherit'
                    }}
                  >
                    <Avatar
                      sx={{ 
                        width: 60, 
                        height: 60, 
                        bgcolor: formData.imagePreview ? 'rgba(255, 255, 255, 0.9)' : 'primary.main',
                        color: formData.imagePreview ? 'primary.main' : 'white'
                      }}
                    >
                      {isTeam ? <Groups /> : <EmojiEvents />}
                    </Avatar>
                    
                    <Typography 
                      variant="h5" 
                      align="center" 
                      fontWeight="bold"
                      sx={{ 
                        color: formData.imagePreview ? 'white' : 'inherit',
                        textShadow: formData.imagePreview ? '2px 2px 4px rgba(0,0,0,0.8)' : 'none'
                      }}
                    >
                      {formData.name || 'Nombre del Torneo'}
                    </Typography>
                    
                    <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
                      <Chip
                        icon={<CalendarToday />}
                        label={formData.date ? new Date(formData.date).toLocaleDateString() : 'Fecha'}
                        color="primary"
                        variant={formData.imagePreview ? "filled" : "outlined"}
                        sx={{
                          backgroundColor: formData.imagePreview ? 'rgba(25, 118, 210, 0.9)' : undefined,
                          color: formData.imagePreview ? 'white' : undefined
                        }}
                      />
                      <Chip
                        icon={<LocationOn />}
                        label={formData.clubName || 'Club'}
                        color="secondary"
                        variant={formData.imagePreview ? "filled" : "outlined"}
                        sx={{
                          backgroundColor: formData.imagePreview ? 'rgba(156, 39, 176, 0.9)' : undefined,
                          color: formData.imagePreview ? 'white' : undefined
                        }}
                      />
                      <Chip
                        icon={<Person />}
                        label={isTeam ? `${formData.numberOfTeams} equipos` : `${formData.maxParticipants} participantes`}
                        color="success"
                        variant={formData.imagePreview ? "filled" : "outlined"}
                        sx={{
                          backgroundColor: formData.imagePreview ? 'rgba(46, 125, 50, 0.9)' : undefined,
                          color: formData.imagePreview ? 'white' : undefined
                        }}
                      />
                    </Stack>

                    <Typography 
                      variant="body2" 
                      align="center"
                      sx={{ 
                        color: formData.imagePreview ? 'rgba(255, 255, 255, 0.9)' : 'text.secondary',
                        textShadow: formData.imagePreview ? '1px 1px 2px rgba(0,0,0,0.8)' : 'none'
                      }}
                    >
                      {isTeam ? 'Torneo por Equipos' : 'Torneo Individual'} • {' '}
                      {isTeam ? 
                        (formData.teamEliminationType === 'groups' ? 'Por Grupos' :
                         formData.teamEliminationType === 'direct_elimination' ? 'Eliminación Directa' :
                         formData.teamEliminationType === 'round_robin' ? 'Todos contra Todos' : 'Mixto') :
                        (formData.eliminationType === 'single' ? 'Eliminación Simple' :
                         formData.eliminationType === 'double' ? 'Eliminación Doble' :
                         formData.eliminationType === 'round_robin' ? 'Todos contra Todos' : 'Sistema Suizo')
                      }
                    </Typography>

                    <Typography 
                      variant="body2" 
                      align="center"
                      sx={{ 
                        color: formData.imagePreview ? 'rgba(255, 255, 255, 0.9)' : 'inherit',
                        textShadow: formData.imagePreview ? '1px 1px 2px rgba(0,0,0,0.8)' : 'none'
                      }}
                    >
                      Inscripciones hasta: {formData.registrationDeadline ? 
                        new Date(formData.registrationDeadline).toLocaleDateString() : 'Fecha límite'}
                    </Typography>

                    <Button 
                      variant="contained" 
                      size="large" 
                      disabled
                      sx={{
                        backgroundColor: formData.imagePreview ? 'rgba(25, 118, 210, 0.9)' : undefined,
                        '&:disabled': {
                          backgroundColor: formData.imagePreview ? 'rgba(25, 118, 210, 0.6)' : undefined,
                          color: formData.imagePreview ? 'rgba(255, 255, 255, 0.7)' : undefined
                        }
                      }}
                    >
                      Inscribirse
                    </Button>
                  </Stack>
                </Card>
              </Box>
            </Stack>
          </Box>
        );

      case 4:
        // Premios - FOR BOTH INDIVIDUAL AND TEAM TOURNAMENTS
        return (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Premios
            </Typography>
            <Stack spacing={3}>
              <Alert severity="info" sx={{ mb: 2 }}>
                {isTeam 
                  ? 'Los premios pueden ser monetarios o no monetarios. Describe cada premio.'
                  : 'Los premios pueden ser monetarios o no monetarios. Describe cada premio.'
                }
              </Alert>
              
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  label="1er Premio"
                  value={formData.firstPrize}
                  onChange={(e) => handleInputChange('firstPrize', e.target.value)}
                  error={!!errors.firstPrize}
                  helperText={errors.firstPrize}
                  fullWidth
                  required={isTeam}
                  placeholder="Ej: $5000, Trofeo de oro, etc."
                />
                <TextField
                  label="2do Premio"
                  value={formData.secondPrize}
                  onChange={(e) => handleInputChange('secondPrize', e.target.value)}
                  error={!!errors.secondPrize}
                  helperText={errors.secondPrize}
                  fullWidth
                  required={isTeam}
                  placeholder="Ej: $3000, Trofeo de plata, etc."
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  label="3er Premio"
                  value={formData.thirdPrize}
                  onChange={(e) => handleInputChange('thirdPrize', e.target.value)}
                  fullWidth
                  placeholder="Ej: $1000, Trofeo de bronce, etc."
                />
                <TextField
                  label="4to Premio"
                  value={formData.fourthPrize}
                  onChange={(e) => handleInputChange('fourthPrize', e.target.value)}
                  fullWidth
                  placeholder="Ej: $500, Medalla, etc."
                />
              </Stack>

              <TextField
                label="5to Premio"
                value={formData.fifthPrize}
                onChange={(e) => handleInputChange('fifthPrize', e.target.value)}
                fullWidth
                sx={{ maxWidth: { md: '50%' } }}
                placeholder="Ej: $250, Diploma, etc."
              />

              {/* Preview de premios */}
              <Card sx={{ p: 3, backgroundColor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom align="center">
                  Estructura de Premios
                </Typography>
                <Stack spacing={2}>
                  {[
                    { position: '1er Lugar', prize: formData.firstPrize, icon: '🥇' },
                    { position: '2do Lugar', prize: formData.secondPrize, icon: '🥈' },
                    { position: '3er Lugar', prize: formData.thirdPrize, icon: '🥉' },
                    { position: '4to Lugar', prize: formData.fourthPrize, icon: '🏆' },
                    { position: '5to Lugar', prize: formData.fifthPrize, icon: '🏆' }
                  ].map((item, index) => (
                    item.prize && (
                      <Stack key={index} direction="row" alignItems="center" spacing={2}>
                        <Typography variant="h6">{item.icon}</Typography>
                        <Typography variant="body1" sx={{ flex: 1 }}>
                          {item.position}
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          {item.prize}
                        </Typography>
                      </Stack>
                    )
                  ))}
                  {!formData.firstPrize && !formData.secondPrize && !formData.thirdPrize && 
                   !formData.fourthPrize && !formData.fifthPrize && (
                    <Typography variant="body2" color="text.secondary" align="center">
                      No se han definido premios aún
                    </Typography>
                  )}
                </Stack>
              </Card>
            </Stack>
          </Box>
        );

      case 5:
        // Información de contacto - FOR BOTH INDIVIDUAL AND TEAM TOURNAMENTS
        return (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Información de Contacto
            </Typography>
            <Stack spacing={3}>
              <TextField
                label="Contacto"
                value={formData.contact}
                onChange={(e) => handleInputChange('contact', e.target.value)}
                error={!!errors.contact}
                helperText={errors.contact}
                fullWidth
                required={isTeam}
                placeholder="Nombre del organizador o responsable"
              />

              <TextField
                label="Teléfono"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone}
                fullWidth
                required={isTeam}
                placeholder="+54 9 11 1234-5678"
              />

              <TextField
                label="Ball Info"
                value={formData.ballInfo}
                onChange={(e) => handleInputChange('ballInfo', e.target.value)}
                error={!!errors.ballInfo}
                helperText={errors.ballInfo}
                fullWidth
                required={isTeam}
                multiline
                rows={3}
                placeholder="Información sobre las pelotas a utilizar en el torneo"
              />

              {/* Preview de información de contacto */}
              <Card sx={{ p: 3, backgroundColor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom>
                  Información de Contacto
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                      Contacto:
                    </Typography>
                    <Typography variant="body1">
                      {formData.contact || 'No especificado'}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                      Teléfono:
                    </Typography>
                    <Typography variant="body1">
                      {formData.phone || 'No especificado'}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="flex-start" spacing={2}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                      Ball Info:
                    </Typography>
                    <Typography variant="body1">
                      {formData.ballInfo || 'No especificado'}
                    </Typography>
                  </Stack>
                </Stack>
              </Card>
            </Stack>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {formData.type === 'team' ? <Groups /> : <EmojiEvents />}
          </Avatar>
          <Box>
            <Typography variant="h6">
              {tournament ? 'Editar Torneo' : 'Crear Nuevo Torneo'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formData.type === 'individual' ? 'Torneo Individual' : 
               formData.type === 'team' ? 'Torneo por Equipos' : 'Configuración de torneo'}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent(activeStep)}
          </motion.div>
        </AnimatePresence>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose}>
          Cancelar
        </Button>
        {activeStep > 0 && (
          <Button onClick={handleBack}>
            Atrás
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={activeStep === 0 && !formData.type}
          >
            Siguiente
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            color="primary"
          >
            {tournament ? 'Actualizar Torneo' : 'Crear Torneo'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TournamentModal;