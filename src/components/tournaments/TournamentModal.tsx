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
  EmojiEvents
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

// Opciones de ranking para los filtros
const RANKING_OPTIONS = [
  { value: 'U800', label: 'U800' },
  { value: 'U899', label: 'U899' },
  { value: 'U900', label: 'U900' },
  { value: 'U999', label: 'U999' },
  { value: 'U1000', label: 'U1000' },
  { value: 'U1099', label: 'U1099' },
  { value: 'U1100', label: 'U1100' },
  { value: 'U1199', label: 'U1199' },
  { value: 'U1200', label: 'U1200' },
  { value: 'U1299', label: 'U1299' },
  { value: 'U1300', label: 'U1300' },
  { value: 'U1399', label: 'U1399' },
  { value: 'U1400', label: 'U1400' },
  { value: 'U1499', label: 'U1499' },
  { value: 'U1500', label: 'U1500' },
  { value: 'U1599', label: 'U1599' },
  { value: 'U1600', label: 'U1600' },
  { value: 'U1699', label: 'U1699' },
  { value: 'U1700', label: 'U1700' },
  { value: 'U1799', label: 'U1799' },
  { value: 'U1800', label: 'U1800' },
  { value: 'U1899', label: 'U1899' },
  { value: '+U1899', label: '+U1899' }
];

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
    
    // Información básica - FIXED: code should be number
    code: 0,
    name: '',
    date: '',
    time: '',
    registrationDeadline: '',
    country: 'Ecuador',
    province: '',
    city: '',
    clubName: '',
    clubAddress: '',
    
    // Parámetros del torneo - Individual
    modality: true,
    matchType: 'best_of_3',
    eliminationType: 'groups',
    maxParticipants: 32,
    seedingType: 'random',
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
    teamModality: 'singles',
    teamMatchType: 'best_2_of_3',
    teamEliminationType: 'groups',
    playersPerTeam: 2,
    maxRankingBetweenPlayers: 1000,
    categories: [] as string[],
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
    
    // Información de contacto
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
    return Math.floor(100000 + Math.random() * 900000);
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
        // FIXED: tournament_type is 'individual' | 'team', not elimination format
        type: tournament.tournament_type || 'individual',
        // FIXED: Convert string code to number, or generate new code if invalid
        code: tournament.code ? (typeof tournament.code === 'number' ? tournament.code : parseInt(tournament.code) || generateTournamentCode()) : generateTournamentCode(),
        name: tournament.name || '',
        date: tournament.start_date?.split('T')[0] || '',
        time: tournament.start_date?.split('T')[1]?.slice(0, 5) || '',
        registrationDeadline: tournament.registration_deadline?.split('T')[0] || '',
        country: 'Ecuador',
        province: tournament.club?.province || '',
        city: tournament.club?.city || '',
        clubName: tournament.club?.name || '',
        clubAddress: tournament.club?.address || '',
        modality: true,
        matchType: 'best_of_3',
        // FIXED: Use tournament_format for elimination type, not tournament_type
        eliminationType: tournament.tournament_format === 'round_robin' ? 'round_robin' : 
                        tournament.tournament_format === 'single_elimination' ? 'direct_elimination' : 
                        tournament.tournament_format === 'double_elimination' ? 'direct_elimination' : 'groups',
        maxParticipants: tournament.max_participants || 32,
        seedingType: 'random',
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
        teamEliminationType: tournament.tournament_format === 'round_robin' ? 'round_robin' : 
                            tournament.tournament_format === 'single_elimination' ? 'direct_elimination' : 
                            tournament.tournament_format === 'double_elimination' ? 'direct_elimination' : 'groups',
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
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Lógica para filtros de ranking - Individual
      if (field === 'rankingFilter') {
        if (value === true) {
          newData.minRanking = 'todos';
          newData.maxRanking = 'todos';
        } else {
          newData.minRanking = '';
          newData.maxRanking = '';
        }
      }
      
      // Lógica para filtros de edad - Individual
      if (field === 'ageFilter') {
        if (value === true) {
          newData.minAge = 'todos';
          newData.maxAge = 'todos';
        } else {
          newData.minAge = '';
          newData.maxAge = '';
        }
      }
      
      // Lógica para filtros de ranking - Equipos
      if (field === 'teamRankingFilter') {
        if (value === true) {
          newData.teamMinRanking = 'todos';
          newData.teamMaxRanking = 'todos';
        } else {
          newData.teamMinRanking = '';
          newData.teamMaxRanking = '';
        }
      }
      
      // Lógica para filtros de edad - Equipos
      if (field === 'teamAgeFilter') {
        if (value === true) {
          newData.teamMinAge = 'todos';
          newData.teamMaxAge = 'todos';
        } else {
          newData.teamMinAge = '';
          newData.teamMaxAge = '';
        }
      }
      
      return newData;
    });
    
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
      // Create an image element to check dimensions
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        img.onload = () => {
          // Check if image dimensions are exactly 1080x1080
          if (img.width !== 1080 || img.height !== 1080) {
            setErrors(prev => ({
              ...prev,
              image: `La imagen debe tener exactamente 1080 x 1080 píxeles. Imagen actual: ${img.width} x ${img.height} píxeles.`
            }));
            // Clear the file input
            if (event.target) {
              event.target.value = '';
            }
            return;
          }
          
          // Clear any previous image errors
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.image;
            return newErrors;
          });
          
          // If dimensions are correct, proceed with upload
          setFormData(prev => ({ 
            ...prev, 
            image: file,
            imagePreview: e.target?.result as string 
          }));
        };
        
        img.src = e.target?.result as string;
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
        if (!formData.code) {
          newErrors.code = 'El código del torneo es obligatorio';
        } else if (typeof formData.code !== 'number' || formData.code < 1) {
          newErrors.code = 'El código debe ser un número positivo';
        }
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
          if (formData.teamRankingFilter && formData.teamMinRanking !== 'todos' && (!formData.teamMinRanking || !formData.teamMaxRanking)) {
            newErrors.teamRanking = 'Define el rango de ranking';
          }
          if (formData.teamAgeFilter && formData.teamMinAge !== 'todos' && (!formData.teamMinAge || !formData.teamMaxAge)) {
            newErrors.teamAge = 'Define el rango de edad';
          }
        } else {
          if (!formData.maxParticipants || formData.maxParticipants < 4) {
            newErrors.maxParticipants = 'Mínimo 4 participantes';
          }
          if (formData.rankingFilter && formData.minRanking !== 'todos' && (!formData.minRanking || !formData.maxRanking)) {
            newErrors.ranking = 'Define el rango de ranking';
          }
          if (formData.ageFilter && formData.minAge !== 'todos' && (!formData.minAge || !formData.maxAge)) {
            newErrors.age = 'Define el rango de edad';
          }
        }
        break;
      case 4:
        if (isTeam) {
          if (!formData.firstPrize) newErrors.firstPrize = '1er premio es obligatorio';
          if (!formData.secondPrize) newErrors.secondPrize = '2do premio es obligatorio';
        }
        break;
      case 5:
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
      
      try {
        const validDate = formData.date;
        const validTime = formData.time;
        const validRegistrationDeadline = formData.registrationDeadline;

        // FIXED: Proper data mapping for API
        const tournamentData: Partial<Tournament> = {
          name: formData.name,
          description: `${isTeam ? 'Torneo por Equipos' : 'Torneo Individual'} - ${isTeam ? formData.teamEliminationType : formData.eliminationType}`,
          
          // FIXED: Send tournament_type as 'individual' or 'team' (not elimination type)
          tournament_type: isTeam ? 'team' : 'individual',
          
          // FIXED: Send tournament_format with the actual elimination type
          tournament_format: isTeam
            ? (formData.teamEliminationType === 'groups' ? 'round_robin' : 
               formData.teamEliminationType === 'direct_elimination' ? 'single_elimination' : 
               formData.teamEliminationType === 'round_robin' ? 'round_robin' : 'single_elimination')
            : (formData.eliminationType === 'groups' ? 'round_robin' : 
               formData.eliminationType === 'direct_elimination' ? 'single_elimination' : 
               formData.eliminationType === 'round_robin' ? 'round_robin' : 'single_elimination'),
          
          start_date: `${validDate}T${validTime}:00`,
          end_date: `${validDate}T23:59:59`,
          registration_deadline: `${validRegistrationDeadline}T23:59:59`,
          max_participants: isTeam ? formData.numberOfTeams : formData.maxParticipants,
          entry_fee: 0,
          status: 'upcoming',
          club_id: currentClub?.id,
          
          // FIXED: Send code as string
          code: String(formData.code),
          
          // Location fields
          country: formData.country,
          province: formData.province,
          city: formData.city,
          club_name: formData.clubName,
          club_address: formData.clubAddress,
          
          // Campos específicos según tipo
          ...(isTeam ? {
            // Campos para equipos
            team_size: formData.playersPerTeam,
            // FIXED: Use undefined instead of null for optional number fields
            min_age: formData.teamAgeFilter && formData.teamMinAge && formData.teamMinAge !== 'todos' ? parseInt(formData.teamMinAge) : undefined,
            max_age: formData.teamAgeFilter && formData.teamMaxAge && formData.teamMaxAge !== 'todos' ? parseInt(formData.teamMaxAge) : undefined,
            gender_restriction: (['mixed', 'male', 'female'].includes(formData.teamGender) ? formData.teamGender as 'mixed' | 'male' | 'female' : undefined),
            skill_level: 'intermediate',
            
            // Team specific fields
            team_modality: formData.teamModality,
            team_match_type: formData.teamMatchType,
            team_elimination_type: formData.teamEliminationType,
            players_per_team: formData.playersPerTeam,
            max_ranking_between_players: formData.maxRankingBetweenPlayers,
            categories: formData.categories,
            number_of_teams: formData.numberOfTeams,
            team_seeding_type: formData.teamSeedingType,
            team_ranking_filter: formData.teamRankingFilter,
            team_min_ranking: formData.teamRankingFilter && formData.teamMinRanking && formData.teamMinRanking !== 'todos' ? formData.teamMinRanking : undefined,
            team_max_ranking: formData.teamRankingFilter && formData.teamMaxRanking && formData.teamMaxRanking !== 'todos' ? formData.teamMaxRanking : undefined,
            team_age_filter: formData.teamAgeFilter,
            team_min_age: formData.teamAgeFilter && formData.teamMinAge && formData.teamMinAge !== 'todos' ? parseInt(formData.teamMinAge) : undefined,
            team_max_age: formData.teamAgeFilter && formData.teamMaxAge && formData.teamMaxAge !== 'todos' ? parseInt(formData.teamMaxAge) : undefined,
            team_gender: (['mixed', 'male', 'female'].includes(formData.teamGender) ? formData.teamGender as 'mixed' | 'male' | 'female' : undefined),
            team_affects_ranking: formData.teamAffectsRanking,
            team_draw_lottery: formData.teamDrawLottery,
            team_system_invitation: formData.teamSystemInvitation,
            team_scheduled_reminder: formData.teamScheduledReminder,
            team_reminder_days: formData.teamScheduledReminder ? formData.teamReminderDays : undefined,
            
            // Premios
            first_prize: formData.firstPrize || undefined,
            second_prize: formData.secondPrize || undefined,
            third_prize: formData.thirdPrize || undefined,
            fourth_prize: formData.fourthPrize || undefined,
            fifth_prize: formData.fifthPrize || undefined,
            
            // Contacto
            contact_name: formData.contact || undefined,
            contact_phone: formData.phone || undefined,
            ball_info: formData.ballInfo || undefined
          } : {
            // Campos para individual
            modality: formData.modality ? 'singles' : 'doubles',
            match_type: formData.matchType,
            seeding_type: formData.seedingType,
            ranking_filter: formData.rankingFilter,
            min_ranking: formData.rankingFilter && formData.minRanking && formData.minRanking !== 'todos' ? formData.minRanking : undefined,
            max_ranking: formData.rankingFilter && formData.maxRanking && formData.maxRanking !== 'todos' ? formData.maxRanking : undefined,
            age_filter: formData.ageFilter,
            min_age: formData.ageFilter && formData.minAge && formData.minAge !== 'todos' ? parseInt(formData.minAge) : undefined,
            max_age: formData.ageFilter && formData.maxAge && formData.maxAge !== 'todos' ? parseInt(formData.maxAge) : undefined,
            gender: (formData.gender === 'mixed' || formData.gender === 'male' || formData.gender === 'female') ? formData.gender as 'mixed' | 'male' | 'female' : undefined,
            affects_ranking: formData.affectsRanking,
            draw_lottery: formData.drawLottery,
            system_invitation: formData.systemInvitation,
            scheduled_reminder: formData.scheduledReminder,
            reminder_days: formData.scheduledReminder ? formData.reminderDays : undefined,
            
            // Premios para individual
            first_prize: formData.firstPrize || undefined,
            second_prize: formData.secondPrize || undefined,
            third_prize: formData.thirdPrize || undefined,
            fourth_prize: formData.fourthPrize || undefined,
            fifth_prize: formData.fifthPrize || undefined,
            
            // Contacto para individual
            contact_name: formData.contact || undefined,
            contact_phone: formData.phone || undefined,
            ball_info: formData.ballInfo || undefined
          })
        };
        
        // Remove null and undefined values to avoid sending unnecessary data
        Object.keys(tournamentData).forEach(key => {
          const typedKey = key as keyof Tournament;
          if (
            tournamentData[typedKey] === null ||
            tournamentData[typedKey] === undefined ||
            tournamentData[typedKey] === ''
          ) {
            delete tournamentData[typedKey];
          }
        });
        
        console.log('🏆 Submitting tournament data:', tournamentData);
        onSubmit(tournamentData);
      } catch (error) {
        console.error('❌ Data preparation error:', error);
        setErrors(prev => ({
          ...prev,
          date: 'Por favor, verifica que los datos sean válidos'
        }));
      }
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setFormData({
      type: '',
      code: 0,
      name: '',
      date: '',
      time: '',
      registrationDeadline: '',
      country: 'Ecuador',
      province: '',
      city: '',
      clubName: '',
      clubAddress: '',
      modality: true,
      matchType: 'best_of_3',
      eliminationType: 'groups',
      maxParticipants: 32,
      seedingType: 'random',
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
                  type="number"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', parseInt(e.target.value) || 0)}
                  error={!!errors.code}
                  helperText={errors.code || 'Código numérico único del torneo'}
                  fullWidth
                  required
                  slotProps={{
                    htmlInput: { min: 1 }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleInputChange('code', generateTournamentCode())}
                          size="small"
                          title="Generar código aleatorio"
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
                  slotProps={{
                    inputLabel: { shrink: true }
                  }}
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
                  slotProps={{
                    inputLabel: { shrink: true }
                  }}
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
                slotProps={{
                  inputLabel: { shrink: true }
                }}
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
                      
                      {formData.teamRankingFilter ? (
                        // Switch activado - Solo mostrar "Todos"
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: 'primary.50', 
                          borderRadius: 1, 
                          border: '1px solid',
                          borderColor: 'primary.200'
                        }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 'bold', 
                              color: 'primary.main',
                              textAlign: 'center'
                            }}
                          >
                            ✓ Todos los rankings incluidos
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'text.secondary',
                              textAlign: 'center',
                              display: 'block',
                              mt: 0.5
                            }}
                          >
                            No se aplicará filtro de ranking
                          </Typography>
                        </Box>
                      ) : (
                        // Switch desactivado - Mostrar dropdowns de filtrado
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography variant="body2" sx={{ minWidth: 50 }}>Desde</Typography>
                          <FormControl sx={{ minWidth: 120 }}>
                            <Select
                              value={formData.teamMinRanking}
                              onChange={(e) => handleInputChange('teamMinRanking', e.target.value)}
                              size="small"
                              displayEmpty
                            >
                              <MenuItem value="">Seleccionar</MenuItem>
                              {RANKING_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <Typography variant="body2" sx={{ minWidth: 50 }}>Hasta</Typography>
                          <FormControl sx={{ minWidth: 120 }}>
                            <Select
                              value={formData.teamMaxRanking}
                              onChange={(e) => handleInputChange('teamMaxRanking', e.target.value)}
                              size="small"
                              displayEmpty
                            >
                              <MenuItem value="">Seleccionar</MenuItem>
                              {RANKING_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
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

                      {formData.teamAgeFilter ? (
                        // Switch activado - Solo mostrar "Todos"
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: 'success.50', 
                          borderRadius: 1, 
                          border: '1px solid',
                          borderColor: 'success.200'
                        }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 'bold', 
                              color: 'success.main',
                              textAlign: 'center'
                            }}
                          >
                            ✓ Todas las edades incluidas
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'text.secondary',
                              textAlign: 'center',
                              display: 'block',
                              mt: 0.5
                            }}
                          >
                            No se aplicará filtro de edad
                          </Typography>
                        </Box>
                      ) : (
                        // Switch desactivado - Mostrar campos numéricos editables
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography variant="body2" sx={{ minWidth: 50 }}>Desde</Typography>
                          <TextField
                            type="number"
                            value={formData.teamMinAge}
                            onChange={(e) => handleInputChange('teamMinAge', e.target.value)}
                            size="small"
                            inputProps={{ min: 5, max: 100 }}
                            sx={{ width: 100 }}
                            placeholder="Edad mín"
                          />
                          <Typography variant="body2" sx={{ minWidth: 50 }}>Hasta</Typography>
                          <TextField
                            type="number"
                            value={formData.teamMaxAge}
                            onChange={(e) => handleInputChange('teamMaxAge', e.target.value)}
                            size="small"
                            inputProps={{ min: 5, max: 100 }}
                            sx={{ width: 100 }}
                            placeholder="Edad máx"
                          />
                          <Typography variant="body2" color="text.secondary">años</Typography>
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
                      <MenuItem value="groups">Por Grupos</MenuItem>
                      <MenuItem value="direct_elimination">Eliminación Directa</MenuItem>
                      <MenuItem value="round_robin">Todos contra Todos</MenuItem>
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
                      <MenuItem value="random">Aleatorio</MenuItem>
                      <MenuItem value="sequential">Secuencial</MenuItem>
                      <MenuItem value="traditional">Tradicional</MenuItem>
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
                      
                      {formData.rankingFilter ? (
                        // Switch activado - Solo mostrar "Todos"
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: 'primary.50', 
                          borderRadius: 1, 
                          border: '1px solid',
                          borderColor: 'primary.200'
                        }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 'bold', 
                              color: 'primary.main',
                              textAlign: 'center'
                            }}
                          >
                            ✓ Todos los rankings incluidos
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'text.secondary',
                              textAlign: 'center',
                              display: 'block',
                              mt: 0.5
                            }}
                          >
                            No se aplicará filtro de ranking
                          </Typography>
                        </Box>
                      ) : (
                        // Switch desactivado - Mostrar dropdowns de filtrado
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography variant="body2" sx={{ minWidth: 50 }}>Desde</Typography>
                          <FormControl sx={{ minWidth: 120 }}>
                            <Select
                              value={formData.minRanking}
                              onChange={(e) => handleInputChange('minRanking', e.target.value)}
                              size="small"
                              displayEmpty
                            >
                              <MenuItem value="">Seleccionar</MenuItem>
                              {RANKING_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <Typography variant="body2" sx={{ minWidth: 50 }}>Hasta</Typography>
                          <FormControl sx={{ minWidth: 120 }}>
                            <Select
                              value={formData.maxRanking}
                              onChange={(e) => handleInputChange('maxRanking', e.target.value)}
                              size="small"
                              displayEmpty
                            >
                              <MenuItem value="">Seleccionar</MenuItem>
                              {RANKING_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
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

                      {formData.ageFilter ? (
                        // Switch activado - Solo mostrar "Todos"
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: 'success.50', 
                          borderRadius: 1, 
                          border: '1px solid',
                          borderColor: 'success.200'
                        }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 'bold', 
                              color: 'success.main',
                              textAlign: 'center'
                            }}
                          >
                            ✓ Todas las edades incluidas
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'text.secondary',
                              textAlign: 'center',
                              display: 'block',
                              mt: 0.5
                            }}
                          >
                            No se aplicará filtro de edad
                          </Typography>
                        </Box>
                      ) : (
                        // Switch desactivado - Mostrar campos numéricos editables
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography variant="body2" sx={{ minWidth: 50 }}>Desde</Typography>
                          <TextField
                            type="number"
                            value={formData.minAge}
                            onChange={(e) => handleInputChange('minAge', e.target.value)}
                            size="small"
                            inputProps={{ min: 5, max: 100 }}
                            sx={{ width: 100 }}
                            placeholder="Edad mín"
                          />
                          <Typography variant="body2" sx={{ minWidth: 50 }}>Hasta</Typography>
                          <TextField
                            type="number"
                            value={formData.maxAge}
                            onChange={(e) => handleInputChange('maxAge', e.target.value)}
                            size="small"
                            inputProps={{ min: 5, max: 100 }}
                            sx={{ width: 100 }}
                            placeholder="Edad máx"
                          />
                          <Typography variant="body2" color="text.secondary">años</Typography>
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
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  La imagen debe tener exactamente 1080 x 1080 píxeles
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
                
                {errors.image && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {errors.image}
                  </Alert>
                )}
                
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
                placeholder="Ej: $250, Reconocimiento, etc."
              />
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
              <Alert severity="info" sx={{ mb: 2 }}>
                {isTeam 
                  ? 'Proporciona información de contacto para los participantes del torneo por equipos.'
                  : 'Proporciona información de contacto para los participantes del torneo individual.'
                }
              </Alert>
              
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
                placeholder="Número de teléfono de contacto"
              />

              <TextField
                label="Información de Pelotas"
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
            </Stack>
          </Box>
        );

      default:
        return <Box>Step content for step {step}</Box>;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            minHeight: '80vh'
          }
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" component="div" fontWeight="bold">
          {tournament ? 'Editar Torneo' : 'Crear Nuevo Torneo'}
        </Typography>
        {formData.type && (
          <Typography variant="body2" color="text.secondary">
            {formData.type === 'team' ? 'Torneo por Equipos' : 'Torneo Individual'}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        {formData.type && (
          <Box sx={{ mb: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        )}

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

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={handleClose} color="inherit">
          Cancelar
        </Button>
        
        {activeStep > 0 && (
          <Button onClick={handleBack} variant="outlined">
            Atrás
          </Button>
        )}
        
        {activeStep < steps.length - 1 ? (
          <Button 
            onClick={handleNext} 
            variant="contained"
            disabled={!formData.type && activeStep === 0}
          >
            Siguiente
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="success"
          >
            {tournament ? 'Actualizar Torneo' : 'Crear Torneo'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TournamentModal;