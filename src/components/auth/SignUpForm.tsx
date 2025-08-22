'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Link,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Avatar,
  Divider,
  Stack,
  Checkbox,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PublicIcon from '@mui/icons-material/Public';
import PhoneIcon from '@mui/icons-material/Phone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import HomeIcon from '@mui/icons-material/Home';
import CakeIcon from '@mui/icons-material/Cake';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import MapIcon from '@mui/icons-material/Map';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { styled } from '@mui/material/styles';
import { useSignUp } from '@/hooks/useSignUp';
import api from '@/lib/axios';
import NextLink from 'next/link';

// Styled Components
const StyledCard = styled(Card)(({  }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
  overflow: 'hidden',
}));

const RoleCard = styled(Card)<{ selected?: boolean; roleColor?: string }>(({ theme, selected, roleColor }) => ({
  cursor: 'pointer',
  borderRadius: 12,
  border: selected ? `2px solid ${roleColor}` : '2px solid transparent',
  background: selected 
    ? `linear-gradient(135deg, ${roleColor}05 0%, ${roleColor}02 100%)`
    : 'rgba(255, 255, 255, 0.7)',
  transition: 'all 0.2s ease',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: selected 
      ? `0 8px 25px ${roleColor}15`
      : '0 8px 25px rgba(0, 0, 0, 0.08)',
    borderColor: selected ? roleColor : theme.palette.divider,
  },
}));

const StepIndicator = styled(Box)<{ active?: boolean }>(({ theme, active }) => ({
  width: 32,
  height: 32,
  borderRadius: '50%',
  backgroundColor: active ? theme.palette.primary.main : theme.palette.action.disabled,
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.875rem',
  fontWeight: 600,
  transition: 'all 0.3s ease',
}));

// Ecuador provinces and cities
const ECUADOR_PROVINCES = [
  { name: 'Guayas', cities: ['Guayaquil', 'Milagro', 'Buena Fe', 'Daule', 'Durán'] },
  { name: 'Pichincha', cities: ['Quito', 'Cayambe', 'Mejía', 'Pedro Moncayo', 'Rumiñahui'] },
  { name: 'Manabí', cities: ['Manta', 'Portoviejo', 'Chone', 'Montecristi', 'Jipijapa'] },
  { name: 'Azuay', cities: ['Cuenca', 'Gualaceo', 'Paute', 'Santa Isabel', 'Sigsig'] },
  { name: 'Tungurahua', cities: ['Ambato', 'Baños', 'Cevallos', 'Mocha', 'Patate'] },
  { name: 'Los Ríos', cities: ['Quevedo', 'Babahoyo', 'Ventanas', 'Vinces', 'Urdaneta'] },
  { name: 'Santa Elena', cities: ['La Libertad', 'Salinas', 'Santa Elena'] },
  { name: 'Galápagos', cities: ['Puerto Ayora', 'Puerto Baquerizo Moreno', 'Puerto Villamil'] },
  { name: 'El Oro', cities: ['Machala', 'Pasaje', 'Santa Rosa', 'Huaquillas', 'Arenillas'] },
  { name: 'Esmeraldas', cities: ['Esmeraldas', 'Atacames', 'Muisne', 'Quinindé', 'San Lorenzo'] },
];

// Validation Schema - Updated with new club fields
const signUpSchema = z.object({
  role: z.enum(['liga', 'miembro', 'club'], {
    error: 'Selecciona un tipo de cuenta',
  }),
  email: z.string().trim().min(1, 'El correo electrónico es requerido').email('Ingresa un correo electrónico válido'),
  password: z.string().trim().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  password_confirmation: z.string().trim().min(1, 'Confirma tu contraseña'),
  phone: z.string().trim().min(1, 'El teléfono es requerido'),
  country: z.string().trim().min(1, 'El país es requerido'),
  
  // Liga fields
  league_name: z.string().optional(),
  province: z.string().optional(),
  
  // Club fields - Enhanced
  club_name: z.string().optional(),
  parent_league_id: z.string().or(z.undefined()).transform((val) => (val && val.trim() !== '' ? val : undefined)),
  city: z.string().optional(),
  address: z.string().optional(),
  ruc: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  google_maps_url: z.string().url('URL inválida').optional().or(z.literal('')),
  description: z.string().optional(),
  founded_date: z.string().optional(),
  number_of_tables: z.number().min(0).max(50).optional(),
  can_create_tournaments: z.boolean().optional(),
  
  // Club representative
  representative_name: z.string().optional(),
  representative_phone: z.string().optional(),
  representative_email: z.string().email('Email inválido').optional().or(z.literal('')),
  
  // Club administrators
  admin1_name: z.string().optional(),
  admin1_phone: z.string().optional(),
  admin1_email: z.string().email('Email inválido').optional().or(z.literal('')),
  admin2_name: z.string().optional(),
  admin2_phone: z.string().optional(),
  admin2_email: z.string().email('Email inválido').optional().or(z.literal('')),
  admin3_name: z.string().optional(),
  admin3_phone: z.string().optional(),
  admin3_email: z.string().email('Email inválido').optional().or(z.literal('')),
  
  // Member fields
  full_name: z.string().optional(),
  parent_club_id: z.string().or(z.undefined()).transform((val) => (val && val.trim() !== '' ? val : undefined)),
  birth_date: z.string().optional(),
  gender: z.enum(['masculino', 'femenino']).optional(),
  rubber_type: z.enum(['liso', 'pupo', 'ambos']).optional(),
  ranking: z.string().optional(),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Las contraseñas no coinciden',
  path: ['password_confirmation'],
}).refine((data) => {
  // Liga validations
  if (data.role === 'liga') {
    return data.league_name && data.league_name.trim().length > 0;
  }
  return true;
}, {
  message: 'El nombre de la liga es requerido',
  path: ['league_name'],
}).refine((data) => {
  if (data.role === 'liga') {
    return data.province && data.province.trim().length > 0;
  }
  return true;
}, {
  message: 'La provincia es requerida',
  path: ['province'],
}).refine((data) => {
  // Club validations - Enhanced
  if (data.role === 'club') {
    return data.club_name && data.club_name.trim().length > 0;
  }
  return true;
}, {
  message: 'El nombre del club es requerido',
  path: ['club_name'],
}).refine((data) => {
  if (data.role === 'club') {
    return data.parent_league_id && String(data.parent_league_id).trim().length > 0;
  }
  return true;
}, {
  message: 'Selecciona la liga a la que pertenece',
  path: ['parent_league_id'],
}).refine((data) => {
  if (data.role === 'club') {
    return data.city && data.city.trim().length > 0;
  }
  return true;
}, {
  message: 'La ciudad es requerida',
  path: ['city'],
}).refine((data) => {
  if (data.role === 'club') {
    return data.address && data.address.trim().length > 0;
  }
  return true;
}, {
  message: 'La dirección es requerida',
  path: ['address'],
}).refine((data) => {
  // Member validations
  if (data.role === 'miembro') {
    return data.full_name && data.full_name.trim().length > 0;
  }
  return true;
}, {
  message: 'El nombre completo es requerido',
  path: ['full_name'],
}).refine((data) => {
  if (data.role === 'miembro') {
    return data.parent_club_id && String(data.parent_club_id).trim().length > 0;
  }
  return true;
}, {
  message: 'Selecciona tu club de pertenencia',
  path: ['parent_club_id'],
}).refine((data) => {
  if (data.role === 'miembro') {
    return data.birth_date && data.birth_date.trim().length > 0;
  }
  return true;
}, {
  message: 'La fecha de nacimiento es requerida',
  path: ['birth_date'],
}).refine((data) => {
  if (data.role === 'miembro') {
    return data.gender && (data.gender === 'masculino' || data.gender === 'femenino');
  }
  return true;
}, {
  message: 'Selecciona tu género',
  path: ['gender'],
}).refine((data) => {
  if (data.role === 'miembro') {
    return data.rubber_type && ['liso', 'pupo', 'ambos'].includes(data.rubber_type);
  }
  return true;
}, {
  message: 'Selecciona tu tipo de caucho',
  path: ['rubber_type'],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

interface League {
  id: string | number;
  name: string;
  province?: string;
}

interface Club {
  id: string | number;
  name: string;
  city?: string;
  league?: {
    id: string | number;
    name: string;
  };
}

const roles = [
  {
    id: 'liga',
    name: 'Liga',
    description: 'Administra múltiples clubes y competencias',
    icon: SportsTennisIcon,
    color: '#2F6DFB',
  },
  {
    id: 'club',
    name: 'Club',
    description: 'Gestiona miembros y actividades deportivas',
    icon: BusinessIcon,
    color: '#8B5CF6',
  },
  {
    id: 'miembro',
    name: 'Miembro',
    description: 'Participa en actividades y competencias',
    icon: PersonIcon,
    color: '#10B981',
  },
];

const SignUpForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loadingLeagues, setLoadingLeagues] = useState(false);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { signUp, isLoading, error, clearError } = useSignUp();

  useEffect(() => {
    setIsClient(true);
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    try {
      setLoadingLeagues(true);
      const response = await api.get('/api/auth/leagues');
      setLeagues(response.data.data || []);
    } catch (error) {
      console.error('Error fetching leagues:', error);
      setLeagues([
        { id: '1', name: 'Liga Nacional de Tenis de Mesa', province: 'Nacional' },
        { id: '2', name: 'Liga Provincial de Pichincha', province: 'Pichincha' },
        { id: '3', name: 'Liga Regional del Guayas', province: 'Guayas' },
      ]);
    } finally {
      setLoadingLeagues(false);
    }
  };

  const fetchClubs = async (leagueId?: string) => {
    try {
      setLoadingClubs(true);
      const url = leagueId ? `/api/auth/clubs?league_id=${leagueId}` : '/api/auth/clubs';
      const response = await api.get(url);
      setClubs(response.data.data || []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      setClubs([
        { id: '1', name: 'Club Deportivo Los Campeones', city: 'Quito', league: { id: '1', name: 'Liga Nacional' } },
        { id: '2', name: 'Club Raqueta de Oro', city: 'Guayaquil', league: { id: '2', name: 'Liga Provincial' } },
        { id: '3', name: 'Club Tenis de Mesa Quito', city: 'Quito', league: { id: '1', name: 'Liga Nacional' } },
      ]);
    } finally {
      setLoadingClubs(false);
    }
  };

  useEffect(() => {
    if (isClient) {
      fetchClubs();
    }
  }, [isClient]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
    defaultValues: {
      role: undefined,
      country: 'Ecuador',
      email: '',
      password: '',
      password_confirmation: '',
      phone: '',
      league_name: '',
      province: '',
      club_name: '',
      parent_league_id: undefined,
      city: '',
      address: '',
      ruc: '',
      latitude: undefined,
      longitude: undefined,
      google_maps_url: '',
      description: '',
      founded_date: '',
      number_of_tables: undefined,
      can_create_tournaments: false,
      representative_name: '',
      representative_phone: '',
      representative_email: '',
      admin1_name: '',
      admin1_phone: '',
      admin1_email: '',
      admin2_name: '',
      admin2_phone: '',
      admin2_email: '',
      admin3_name: '',
      admin3_phone: '',
      admin3_email: '',
      full_name: '',
      parent_club_id: undefined,
      birth_date: '',
      gender: undefined,
      rubber_type: undefined,
      ranking: '',
    },
  });

  const watchedRole = watch('role');
  const watchedProvince = watch('province');
  const selectedProvince = ECUADOR_PROVINCES.find(p => p.name === watchedProvince);

  const onSubmit = async (data: SignUpFormData) => {
    if (currentStep === 0) {
      if (!data.role) return;
      setCurrentStep(1);
      return;
    }

    const cleanedData = { ...data };
    
    if (cleanedData.gender === undefined) delete cleanedData.gender;
    if (cleanedData.rubber_type === undefined) delete cleanedData.rubber_type;
    
    console.log('Submitting form data:', { ...cleanedData, password: '[HIDDEN]', password_confirmation: '[HIDDEN]' });
    
    clearError();
    await signUp(cleanedData);
  };

  const handleRoleSelect = (roleId: string) => {
    setValue('role', roleId as 'liga' | 'miembro' | 'club');
    trigger('role');
  };

  const handleNext = async () => {
    const isRoleValid = await trigger('role');
    if (isRoleValid && watchedRole) {
      setCurrentStep(1);
    }
  };

  const handleBack = () => {
    setCurrentStep(0);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'photo') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'logo') {
          setLogoPreview(reader.result as string);
        } else {
          setPhotoPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedRoleData = roles.find(role => role.id === watchedRole);

  // Helper function to create text fields
  const createTextField = (
    name: keyof SignUpFormData,
    label: string,
    icon: React.ReactNode,
    options: {
      type?: string;
      placeholder?: string;
      multiline?: boolean;
      rows?: number;
    } = {}
  ) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          fullWidth
          label={label}
          type={options.type || 'text'}
          placeholder={options.placeholder}
          multiline={options.multiline}
          rows={options.rows}
          error={!!errors[name]}
          helperText={errors[name]?.message}
          disabled={isLoading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {icon}
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              '&.Mui-focused fieldset': {
                borderColor: selectedRoleData?.color || 'primary.main',
                borderWidth: 2,
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: selectedRoleData?.color || 'primary.main',
            },
          }}
        />
      )}
    />
  );

  if (!isClient) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      {/* Progress Steps */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <StepIndicator active={true}>1</StepIndicator>
          <Box
            sx={{
              width: 80,
              height: 2,
              mx: 2,
              backgroundColor: currentStep >= 1 ? 'primary.main' : 'divider',
              transition: 'all 0.3s ease',
            }}
          />
          <StepIndicator active={currentStep >= 1}>2</StepIndicator>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, color: 'primary.main' }}>
            Tipo de cuenta
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 500, 
              color: currentStep >= 1 ? 'primary.main' : 'text.secondary',
              transition: 'color 0.3s ease',
            }}
          >
            Información
          </Typography>
        </Box>
      </Box>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Alert 
              severity="error" 
              onClose={clearError}
              sx={{ mb: 3, borderRadius: 2 }}
            >
              {error}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <AnimatePresence mode="wait">
          {/* Step 1: Role Selection */}
          {currentStep === 0 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <StyledCard>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        color: 'text.primary',
                        mb: 1,
                      }}
                    >
                      Selecciona tu tipo de cuenta
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '1rem',
                        maxWidth: 400,
                        mx: 'auto',
                      }}
                    >
                      Elige el rol que mejor se adapte a tus necesidades
                    </Typography>
                  </Box>

                  <Stack spacing={2}>
                    {roles.map((role) => {
                      const IconComponent = role.icon;
                      const isSelected = watchedRole === role.id;
                      
                      return (
                        <motion.div
                          key={role.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <RoleCard
                            selected={isSelected}
                            roleColor={role.color}
                            onClick={() => handleRoleSelect(role.id)}
                          >
                            <CardContent sx={{ p: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Avatar
                                  sx={{
                                    width: 48,
                                    height: 48,
                                    backgroundColor: isSelected ? role.color : 'grey.100',
                                    color: isSelected ? 'white' : role.color,
                                    transition: 'all 0.2s ease',
                                  }}
                                >
                                  <IconComponent sx={{ fontSize: 24 }} />
                                </Avatar>

                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      fontSize: '1.125rem',
                                      fontWeight: 600,
                                      color: isSelected ? role.color : 'text.primary',
                                      mb: 0.5,
                                    }}
                                  >
                                    {role.name}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: 'text.secondary',
                                      fontSize: '0.875rem',
                                    }}
                                  >
                                    {role.description}
                                  </Typography>
                                </Box>

                                {isSelected && (
                                  <CheckCircleIcon
                                    sx={{
                                      color: role.color,
                                      fontSize: 24,
                                    }}
                                  />
                                )}
                              </Box>
                            </CardContent>
                          </RoleCard>
                        </motion.div>
                      );
                    })}
                  </Stack>

                  {errors.role && (
                    <Typography 
                      variant="body2" 
                      color="error" 
                      sx={{ mt: 2, textAlign: 'center' }}
                    >
                      {errors.role.message}
                    </Typography>
                  )}

                  <Button
                    onClick={handleNext}
                    disabled={!watchedRole || isLoading}
                    fullWidth
                    variant="contained"
                    sx={{
                      mt: 4,
                      height: 48,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      backgroundColor: selectedRoleData?.color || 'primary.main',
                      '&:hover': {
                        backgroundColor: selectedRoleData?.color || 'primary.dark',
                      },
                    }}
                  >
                    Continuar
                  </Button>
                </CardContent>
              </StyledCard>
            </motion.div>
          )}

          {/* Step 2: Form Fields */}
          {currentStep === 1 && watchedRole && selectedRoleData && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StyledCard>
                <CardContent sx={{ p: 4 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: selectedRoleData.color,
                        color: 'white',
                      }}
                    >
                      <selectedRoleData.icon sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Cuenta de {selectedRoleData.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Completa tu información personal
                      </Typography>
                    </Box>
                  </Box>

                  <Stack spacing={3}>
                    {/* Role-specific Fields */}
                    {watchedRole === 'liga' && (
                      <>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', mt: 2 }}>
                          Información de la Liga
                        </Typography>
                        {createTextField('league_name', 'Nombre de la liga', <BusinessIcon sx={{ color: selectedRoleData.color }} />, {
                          placeholder: 'Ej: Liga Nacional de Tenis de Mesa'
                        })}
                        {createTextField('province', 'Provincia / Región', <LocationOnIcon sx={{ color: selectedRoleData.color }} />, {
                          placeholder: 'Ej: Pichincha, Guayas, Azuay'
                        })}
                        
                        {/* Logo Upload */}
                        <Box
                          component="label"
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2,
                            p: 3,
                            border: '2px dashed',
                            borderColor: 'divider',
                            borderRadius: 2,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: selectedRoleData.color,
                              backgroundColor: `${selectedRoleData.color}08`,
                            },
                          }}
                        >
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'logo')}
                          />
                          {logoPreview ? (
                            <Avatar src={logoPreview} sx={{ width: 64, height: 64 }} />
                          ) : (
                            <Avatar sx={{ width: 64, height: 64, backgroundColor: `${selectedRoleData.color}20`, color: selectedRoleData.color }}>
                              <CloudUploadIcon sx={{ fontSize: 32 }} />
                            </Avatar>
                          )}
                          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                            Logo de la liga (opcional)
                            <br />
                            Haz clic para subir una imagen
                          </Typography>
                        </Box>
                      </>
                    )}

                    {watchedRole === 'club' && (
                      <>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', mt: 2 }}>
                          Información Básica del Club
                        </Typography>
                        {createTextField('club_name', 'Nombre del club', <BusinessIcon sx={{ color: selectedRoleData.color }} />, {
                          placeholder: 'Ej: Club Deportivo Los Campeones'
                        })}
                        
                        {createTextField('ruc', 'RUC (opcional)', <BusinessIcon sx={{ color: selectedRoleData.color }} />, {
                          placeholder: 'Ej: 0912345678001'
                        })}
                        
                        <Controller
                          name="parent_league_id"
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth error={!!errors.parent_league_id}>
                              <InputLabel>Liga a la que pertenece</InputLabel>
                              <Select
                                {...field}
                                label="Liga a la que pertenece"
                                disabled={loadingLeagues}
                                value={field.value || ''}
                                sx={{
                                  borderRadius: 2,
                                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: selectedRoleData.color,
                                    borderWidth: 2,
                                  },
                                }}
                              >
                                {loadingLeagues ? (
                                  <MenuItem disabled>
                                    <CircularProgress size={20} sx={{ mr: 1 }} />
                                    Cargando ligas...
                                  </MenuItem>
                                ) : (
                                  leagues.map((league) => (
                                    <MenuItem key={league.id} value={String(league.id)}>
                                      {league.name} {league.province && `(${league.province})`}
                                    </MenuItem>
                                  ))
                                )}
                              </Select>
                              {errors.parent_league_id && (
                                <FormHelperText>{errors.parent_league_id.message}</FormHelperText>
                              )}
                            </FormControl>
                          )}
                        />

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          Ubicación del Club
                        </Typography>

                        <Controller
                          name="province"
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth>
                              <InputLabel>Provincia</InputLabel>
                              <Select
                                {...field}
                                label="Provincia"
                                value={field.value || ''}
                                sx={{
                                  borderRadius: 2,
                                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: selectedRoleData.color,
                                    borderWidth: 2,
                                  },
                                }}
                              >
                                {ECUADOR_PROVINCES.map((province) => (
                                  <MenuItem key={province.name} value={province.name}>
                                    {province.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        />

                        <Controller
                          name="city"
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth error={!!errors.city}>
                              <InputLabel>Ciudad</InputLabel>
                              <Select
                                {...field}
                                label="Ciudad"
                                disabled={!selectedProvince}
                                value={field.value || ''}
                                sx={{
                                  borderRadius: 2,
                                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: selectedRoleData.color,
                                    borderWidth: 2,
                                  },
                                }}
                              >
                                {selectedProvince?.cities.map((city) => (
                                  <MenuItem key={city} value={city}>
                                    {city}
                                  </MenuItem>
                                ))}
                              </Select>
                              {errors.city && (
                                <FormHelperText>{errors.city.message}</FormHelperText>
                              )}
                            </FormControl>
                          )}
                        />

                        {createTextField('address', 'Dirección completa', <HomeIcon sx={{ color: selectedRoleData.color }} />, {
                          placeholder: 'Ej: Av. 6 de Diciembre N24-253 y Wilson',
                          multiline: true,
                          rows: 2
                        })}

                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Controller
                            name="latitude"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Latitud (GPS)"
                                type="number"
                                placeholder="-2.1894"
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <GpsFixedIcon sx={{ color: selectedRoleData.color }} />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    '&.Mui-focused fieldset': {
                                      borderColor: selectedRoleData.color,
                                      borderWidth: 2,
                                    },
                                  },
                                }}
                              />
                            )}
                          />
                          <Controller
                            name="longitude"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Longitud (GPS)"
                                type="number"
                                placeholder="-79.8890"
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <GpsFixedIcon sx={{ color: selectedRoleData.color }} />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    '&.Mui-focused fieldset': {
                                      borderColor: selectedRoleData.color,
                                      borderWidth: 2,
                                    },
                                  },
                                }}
                              />
                            )}
                          />
                        </Box>

                        {createTextField('google_maps_url', 'URL de Google Maps (opcional)', <MapIcon sx={{ color: selectedRoleData.color }} />, {
                          placeholder: 'https://maps.google.com/...'
                        })}

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          Detalles del Club
                        </Typography>

                        <Controller
                          name="number_of_tables"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Número de mesas"
                              type="number"
                              placeholder="4"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <TableRestaurantIcon sx={{ color: selectedRoleData.color }} />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                  '&.Mui-focused fieldset': {
                                    borderColor: selectedRoleData.color,
                                    borderWidth: 2,
                                  },
                                },
                              }}
                            />
                          )}
                        />

                        <Controller
                          name="founded_date"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Fecha de fundación (opcional)"
                              type="date"
                              InputLabelProps={{ shrink: true }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CakeIcon sx={{ color: selectedRoleData.color }} />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                  '&.Mui-focused fieldset': {
                                    borderColor: selectedRoleData.color,
                                    borderWidth: 2,
                                  },
                                },
                              }}
                            />
                          )}
                        />

                        {createTextField('description', 'Descripción del club (opcional)', <BusinessIcon sx={{ color: selectedRoleData.color }} />, {
                          placeholder: 'Historia, logros, información adicional...',
                          multiline: true,
                          rows: 3
                        })}

                        <Controller
                          name="can_create_tournaments"
                          control={control}
                          render={({ field }) => (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  {...field}
                                  checked={field.value || false}
                                  sx={{
                                    '&.Mui-checked': {
                                      color: selectedRoleData.color,
                                    },
                                  }}
                                />
                              }
                              label="Puede crear torneos por ranking"
                              sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                borderRadius: 2,
                                p: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            />
                          )}
                        />

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          Representante del Club
                        </Typography>

                        {createTextField('representative_name', 'Nombre del representante', <PersonIcon sx={{ color: selectedRoleData.color }} />, {
                          placeholder: 'Juan Pérez'
                        })}
                        {createTextField('representative_phone', 'Teléfono del representante', <PhoneIcon sx={{ color: selectedRoleData.color }} />, {
                          placeholder: '0999123456'
                        })}
                        {createTextField('representative_email', 'Email del representante', <EmailIcon sx={{ color: selectedRoleData.color }} />, {
                          placeholder: 'representante@club.com'
                        })}

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          Administradores del Club
                        </Typography>

                        {/* Admin 1 */}
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                          Administrador 1
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          {createTextField('admin1_name', 'Nombre', <AdminPanelSettingsIcon sx={{ color: selectedRoleData.color }} />, {
                            placeholder: 'María González'
                          })}
                          {createTextField('admin1_phone', 'Teléfono', <PhoneIcon sx={{ color: selectedRoleData.color }} />, {
                            placeholder: '0999654321'
                          })}
                        </Box>
                        {createTextField('admin1_email', 'Email', <EmailIcon sx={{ color: selectedRoleData.color }} />, {
                          placeholder: 'admin1@club.com'
                        })}

                        {/* Admin 2 */}
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mt: 2 }}>
                          Administrador 2 (opcional)
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          {createTextField('admin2_name', 'Nombre', <AdminPanelSettingsIcon sx={{ color: selectedRoleData.color }} />, {
                            placeholder: 'Carlos Rodríguez'
                          })}
                          {createTextField('admin2_phone', 'Teléfono', <PhoneIcon sx={{ color: selectedRoleData.color }} />, {
                            placeholder: '0999987654'
                          })}
                        </Box>
                        {createTextField('admin2_email', 'Email', <EmailIcon sx={{ color: selectedRoleData.color }} />, {
                          placeholder: 'admin2@club.com'
                        })}

                        {/* Admin 3 */}
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mt: 2 }}>
                          Administrador 3 (opcional)
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          {createTextField('admin3_name', 'Nombre', <AdminPanelSettingsIcon sx={{ color: selectedRoleData.color }} />, {
                            placeholder: 'Ana López'
                          })}
                          {createTextField('admin3_phone', 'Teléfono', <PhoneIcon sx={{ color: selectedRoleData.color }} />, {
                            placeholder: '0999456789'
                          })}
                        </Box>
                        {createTextField('admin3_email', 'Email', <EmailIcon sx={{ color: selectedRoleData.color }} />, {
                          placeholder: 'admin3@club.com'
                        })}

                        {/* Logo Upload */}
                        <Box
                          component="label"
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2,
                            p: 3,
                            border: '2px dashed',
                            borderColor: 'divider',
                            borderRadius: 2,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: selectedRoleData.color,
                              backgroundColor: `${selectedRoleData.color}08`,
                            },
                          }}
                        >
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'logo')}
                          />
                          {logoPreview ? (
                            <Avatar src={logoPreview} sx={{ width: 64, height: 64 }} />
                          ) : (
                            <Avatar sx={{ width: 64, height: 64, backgroundColor: `${selectedRoleData.color}20`, color: selectedRoleData.color }}>
                              <CloudUploadIcon sx={{ fontSize: 32 }} />
                            </Avatar>
                          )}
                          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                            Logo del club (opcional)
                            <br />
                            Haz clic para subir una imagen
                          </Typography>
                        </Box>
                      </>
                    )}

                    {watchedRole === 'miembro' && (
                      <>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', mt: 2 }}>
                          Información Personal
                        </Typography>
                        {createTextField('full_name', 'Nombre completo', <PersonIcon sx={{ color: selectedRoleData.color }} />, {
                          placeholder: 'Ej: Juan Carlos Pérez González'
                        })}
                        
                        <Controller
                          name="parent_club_id"
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth error={!!errors.parent_club_id}>
                              <InputLabel>Club de pertenencia</InputLabel>
                              <Select
                                {...field}
                                label="Club de pertenencia"
                                disabled={loadingClubs}
                                value={field.value || ''}
                                sx={{
                                  borderRadius: 2,
                                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: selectedRoleData.color,
                                    borderWidth: 2,
                                  },
                                }}
                              >
                                {loadingClubs ? (
                                  <MenuItem disabled>
                                    <CircularProgress size={20} sx={{ mr: 1 }} />
                                    Cargando clubes...
                                  </MenuItem>
                                ) : (
                                  clubs.map((club) => (
                                    <MenuItem key={club.id} value={String(club.id)}>
                                      {club.name} {club.city && `(${club.city})`}
                                    </MenuItem>
                                  ))
                                )}
                              </Select>
                              {errors.parent_club_id && (
                                <FormHelperText>{errors.parent_club_id.message}</FormHelperText>
                              )}
                            </FormControl>
                          )}
                        />

                        <Controller
                          name="birth_date"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Fecha de nacimiento"
                              type="date"
                              error={!!errors.birth_date}
                              helperText={errors.birth_date?.message}
                              InputLabelProps={{ shrink: true }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CakeIcon sx={{ color: selectedRoleData.color }} />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                  '&.Mui-focused fieldset': {
                                    borderColor: selectedRoleData.color,
                                    borderWidth: 2,
                                  },
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                  color: selectedRoleData.color,
                                },
                              }}
                            />
                          )}
                        />

                        {createTextField('ranking', 'Ranking inicial (opcional)', <EmojiEventsIcon sx={{ color: selectedRoleData.color }} />, {
                          placeholder: 'Ej: 1500 puntos o "Sin ranking"'
                        })}

                        <Box sx={{ display: 'flex', gap: 4 }}>
                          <Controller
                            name="gender"
                            control={control}
                            render={({ field }) => (
                              <FormControl error={!!errors.gender} sx={{ flex: 1 }}>
                                <FormLabel sx={{ mb: 1, fontWeight: 500, color: selectedRoleData.color }}>
                                  Sexo
                                </FormLabel>
                                <RadioGroup 
                                  {...field} 
                                  row
                                  value={field.value || ''}
                                >
                                  <FormControlLabel 
                                    value="masculino" 
                                    control={<Radio sx={{ '&.Mui-checked': { color: selectedRoleData.color } }} />} 
                                    label="Masculino"
                                  />
                                  <FormControlLabel 
                                    value="femenino" 
                                    control={<Radio sx={{ '&.Mui-checked': { color: selectedRoleData.color } }} />} 
                                    label="Femenino"
                                  />
                                </RadioGroup>
                                {errors.gender && (
                                  <FormHelperText>{errors.gender.message}</FormHelperText>
                                )}
                              </FormControl>
                            )}
                          />
                        </Box>

                        <Controller
                          name="rubber_type"
                          control={control}
                          render={({ field }) => (
                            <FormControl error={!!errors.rubber_type}>
                              <FormLabel sx={{ mb: 1, fontWeight: 500, color: selectedRoleData.color }}>
                                Tipo de caucho
                              </FormLabel>
                              <RadioGroup 
                                {...field} 
                                row
                                value={field.value || ''}
                              >
                                <FormControlLabel 
                                  value="liso" 
                                  control={<Radio sx={{ '&.Mui-checked': { color: selectedRoleData.color } }} />} 
                                  label="Liso"
                                />
                                <FormControlLabel 
                                  value="pupo" 
                                  control={<Radio sx={{ '&.Mui-checked': { color: selectedRoleData.color } }} />} 
                                  label="Pupo"
                                />
                                <FormControlLabel 
                                  value="ambos" 
                                  control={<Radio sx={{ '&.Mui-checked': { color: selectedRoleData.color } }} />} 
                                  label="Ambos"
                                />
                              </RadioGroup>
                              {errors.rubber_type && (
                                <FormHelperText>{errors.rubber_type.message}</FormHelperText>
                              )}
                            </FormControl>
                          )}
                        />

                        {/* Photo Upload */}
                        <Box
                          component="label"
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2,
                            p: 3,
                            border: '2px dashed',
                            borderColor: 'divider',
                            borderRadius: 2,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: selectedRoleData.color,
                              backgroundColor: `${selectedRoleData.color}08`,
                            },
                          }}
                        >
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'photo')}
                          />
                          {photoPreview ? (
                            <Avatar src={photoPreview} sx={{ width: 64, height: 64 }} />
                          ) : (
                            <Avatar sx={{ width: 64, height: 64, backgroundColor: `${selectedRoleData.color}20`, color: selectedRoleData.color }}>
                              <PersonIcon sx={{ fontSize: 32 }} />
                            </Avatar>
                          )}
                          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                            Foto de perfil (opcional)
                            <br />
                            Haz clic para subir una imagen
                          </Typography>
                        </Box>
                      </>
                    )}

                    {/* Common Fields */}
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Información de Contacto
                    </Typography>

                    {createTextField('country', 'País', <PublicIcon sx={{ color: selectedRoleData.color }} />)}
                    {createTextField('phone', 'Teléfono de contacto', <PhoneIcon sx={{ color: selectedRoleData.color }} />, {
                      placeholder: '+593 99 123 4567'
                    })}
                    {createTextField('email', 'Correo electrónico', <EmailIcon sx={{ color: selectedRoleData.color }} />, {
                      type: 'email',
                      placeholder: 'tu@email.com'
                    })}

                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Seguridad
                    </Typography>

                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Contraseña"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Mínimo 8 caracteres"
                          error={!!errors.password}
                          helperText={errors.password?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon sx={{ color: selectedRoleData.color }} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                  sx={{ color: 'text.secondary' }}
                                >
                                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'rgba(255, 255, 255, 0.8)',
                              '&.Mui-focused fieldset': {
                                borderColor: selectedRoleData.color,
                                borderWidth: 2,
                              },
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: selectedRoleData.color,
                            },
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="password_confirmation"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Confirmar contraseña"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Repite tu contraseña"
                          error={!!errors.password_confirmation}
                          helperText={errors.password_confirmation?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon sx={{ color: selectedRoleData.color }} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  edge="end"
                                  sx={{ color: 'text.secondary' }}
                                >
                                  {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'rgba(255, 255, 255, 0.8)',
                              '&.Mui-focused fieldset': {
                                borderColor: selectedRoleData.color,
                                borderWidth: 2,
                              },
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: selectedRoleData.color,
                            },
                          }}
                        />
                      )}
                    />
                  </Stack>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                    <Button
                      onClick={handleBack}
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                      disabled={isLoading}
                      sx={{
                        height: 48,
                        px: 3,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        borderColor: selectedRoleData.color,
                        color: selectedRoleData.color,
                        '&:hover': {
                          borderColor: selectedRoleData.color,
                          backgroundColor: `${selectedRoleData.color}08`,
                        },
                      }}
                    >
                      Atrás
                    </Button>
                    
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isLoading}
                      sx={{
                        height: 48,
                        flex: 1,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        backgroundColor: selectedRoleData.color,
                        '&:hover': {
                          backgroundColor: selectedRoleData.color,
                          filter: 'brightness(0.9)',
                        },
                      }}
                    >
                      {isLoading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={20} color="inherit" />
                          Creando cuenta...
                        </Box>
                      ) : (
                        'Crear cuenta'
                      )}
                    </Button>
                  </Box>
                </CardContent>
              </StyledCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sign In Link */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
            ¿Ya tienes cuenta?
          </Typography>
          <Link
            component={NextLink}
            href="/auth/sign-in"
            sx={{
              color: selectedRoleData?.color || 'primary.main',
              textDecoration: 'none',
              fontWeight: 600,
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Iniciar sesión
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default SignUpForm;
