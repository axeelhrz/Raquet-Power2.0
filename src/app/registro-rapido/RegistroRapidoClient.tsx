'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { motion, Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';
import axios, { isAxiosError } from 'axios';
import authTheme from '@/theme/authTheme';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthHeader from '@/components/auth/AuthHeader';
import { useExistingClubs, useExistingLeagues } from '@/hooks/useExistingClubs';
import { useDynamicOptions } from '@/hooks/useDynamicOptions';
import CustomFieldValidator from '@/components/ui/CustomFieldValidator';
import { FieldType } from '@/utils/customFieldValidation';

// Define ValidationResult interface for validation states
interface ValidationResult {
  isValid: boolean;
  message?: string;
  suggestions?: string[];
}

const registroRapidoSchema = z.object({
  // Información personal básica - ACTUALIZADO: nombres y apellidos separados
  first_name: z.string().min(2, 'El primer nombre debe tener al menos 2 caracteres'),
  second_name: z.string().optional(),
  last_name: z.string().min(2, 'El primer apellido debe tener al menos 2 caracteres'),
  second_last_name: z.string().min(2, 'El segundo apellido debe tener al menos 2 caracteres'),
  doc_id: z.string().optional(),
  email: z.string().email('Por favor ingresa un email válido'),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  birth_date: z.string().optional(),
  gender: z.enum(['masculino', 'femenino']).optional(),
  
  // Ubicación
  country: z.string().optional(),
  province: z.string().min(1, 'Por favor selecciona una provincia'),
  city: z.string().min(1, 'Por favor selecciona una ciudad'),
  
  // Liga - NUEVO CAMPO
  league: z.string().optional(),
  league_custom: z.string().optional(),
  
  // Club (sin federación)
  club_name: z.string().optional(),
  club_name_custom: z.string().optional(),
  
  // Rol en el club - NUEVO CAMPO
  club_role: z.enum(['ninguno', 'administrador', 'dueño']).optional(),
  
  // Ranking - NUEVO CAMPO
  ranking: z.string().optional(),
  
  // Estilo de juego
  playing_side: z.enum(['derecho', 'zurdo']).optional(),
  playing_style: z.enum(['clasico', 'lapicero']).optional(),
  
  // Raqueta - palo
  racket_brand: z.string().optional(),
  racket_model: z.string().optional(),
  custom_racket_brand: z.string().optional(),
  custom_racket_model: z.string().optional(),
  
  // Caucho del drive
  drive_rubber_brand: z.string().optional(),
  drive_rubber_model: z.string().optional(),
  drive_rubber_type: z.enum(['liso', 'pupo_largo', 'pupo_corto', 'antitopsping']).optional(),
  drive_rubber_color: z.enum(['negro', 'rojo', 'verde', 'azul', 'amarillo', 'morado', 'fucsia']).optional(),
  drive_rubber_sponge: z.string().optional(),
  drive_rubber_hardness: z.string().optional(),
  custom_drive_rubber_brand: z.string().optional(),
  custom_drive_rubber_model: z.string().optional(),
  custom_drive_rubber_hardness: z.string().optional(),
  
  // Caucho del back
  backhand_rubber_brand: z.string().optional(),
  backhand_rubber_model: z.string().optional(),
  backhand_rubber_type: z.enum(['liso', 'pupo_largo', 'pupo_corto', 'antitopsping']).optional(),
  backhand_rubber_color: z.enum(['negro', 'rojo', 'verde', 'azul', 'amarillo', 'morado', 'fucsia']).optional(),
  backhand_rubber_sponge: z.string().optional(),
  backhand_rubber_hardness: z.string().optional(),
  custom_backhand_rubber_brand: z.string().optional(),
  custom_backhand_rubber_model: z.string().optional(),
  custom_backhand_rubber_hardness: z.string().optional(),
  
  // Información adicional
  notes: z.string().optional(),
});

type RegistroRapidoFormValues = z.infer<typeof registroRapidoSchema>;

type RegistrationData = {
  full_name: string;
  email: string;
  location: string;
  club: string;
  [key: string]: unknown;
};

// ACTUALIZADO: Más ciudades por provincia
const ECUADOR_PROVINCES = [
  { 
    name: 'Azuay', 
    cities: [
      'Camilo Ponce Enríquez', 'Chordeleg', 'Cuenca', 'El Pan', 'Girón', 'Gualaceo', 
      'Guachapala', 'Nabón', 'Oña', 'Paute', 'Pucará', 'San Fernando', 'Santa Isabel', 
      'Sevilla de Oro', 'Sigsig'
    ] 
  },
  { 
    name: 'Bolívar', 
    cities: [
      'Caluma', 'Chillanes', 'Chimbo', 'Echeandía', 'Guaranda', 'Las Naves', 'San Miguel'
    ] 
  },
  { 
    name: 'Cañar', 
    cities: ['Azogues', 'Biblián', 'Cañar', 'Déleg', 'El Tambo', 'La Troncal', 'Suscal'] 
  },
  { 
    name: 'Carchi', 
    cities: ['Bolívar', 'Espejo', 'Mira', 'Montúfar', 'San Pedro de Huaca', 'Tulcán'] 
  },
  { 
    name: 'Chimborazo', 
    cities: [
      'Alausí', 'Chambo', 'Chunchi', 'Colta', 'Cumandá', 'Guamote', 'Guano', 
      'Pallatanga', 'Penipe', 'Riobamba'
    ] 
  },
  { 
    name: 'Cotopaxi', 
    cities: [
      'La Maná', 'Latacunga', 'Pangua', 'Pujilí', 'Salcedo', 'Saquisilí', 'Sigchos'
    ] 
  },
  { 
    name: 'El Oro', 
    cities: [
      'Arenillas', 'Atahualpa', 'Balsas', 'Chilla', 'El Guabo', 'Huaquillas', 
      'Las Lajas', 'Machala', 'Marcabelí', 'Pasaje', 'Piñas', 'Portovelo', 
      'Santa Rosa', 'Zaruma'
    ] 
  },
  { 
    name: 'Esmeraldas', 
    cities: [
      'Atacames', 'Eloy Alfaro', 'Esmeraldas', 'La Tola', 'Muisne', 'Quinindé', 
      'Rioverde', 'Same', 'San Lorenzo', 'Súa', 'Tonsupa', 'Tonchigüe'
    ] 
  },
  { 
    name: 'Galápagos', 
    cities: ['Bellavista', 'Puerto Ayora', 'Puerto Baquerizo Moreno', 'Puerto Villamil'] 
  },
  { 
    name: 'Guayas', 
    cities: [
      'Alfredo Baquerizo Moreno', 'Balao', 'Balzar', 'Buena Fe', 'Colimes', 
      'Coronel Marcelino Maridueña', 'Daule', 'Durán', 'El Triunfo', 'Guayaquil', 
      'Isidro Ayora', 'Lomas de Sargentillo', 'Marcelino Maridueña', 'Milagro', 
      'Naranjal', 'Nobol', 'Palestina', 'Pedro Carbo', 'Playas', 'Salitre', 
      'Samborondón', 'Santa Lucía', 'Simón Bolívar', 'Yaguachi'
    ] 
  },
  { 
    name: 'Imbabura', 
    cities: [
      'Antonio Ante', 'Atuntaqui', 'Cotacachi', 'Ibarra', 'Ilumán', 'Natabuela', 
      'Otavalo', 'Pimampiro', 'San Pablo del Lago', 'Urcuquí'
    ] 
  },
  { 
    name: 'Loja', 
    cities: [
      'Alamor', 'Calvas', 'Cariamanga', 'Catacocha', 'Catamayo', 'Célica', 
      'Espíndola', 'Gonzanamá', 'Loja', 'Macará', 'Pindal', 'Puyango', 
      'Quilanga', 'Saraguro', 'Sozoranga', 'Zapotillo'
    ] 
  },
  { 
    name: 'Los Ríos', 
    cities: [
      'Baba', 'Babahoyo', 'Buena Fe', 'Mocache', 'Montalvo', 'Palenque', 
      'Pueblo Viejo', 'Quevedo', 'Ricaurte', 'Urdaneta', 'Valencia', 'Vinces'
    ] 
  },
  { 
    name: 'Manabí', 
    cities: [
      '24 de Mayo', 'Bahía de Caráquez', 'Bolívar', 'Calceta', 'Chone', 'Crucita', 
      'El Carmen', 'Flavio Alfaro', 'Jama', 'Jaramijo', 'Jipijapa', 'Junín', 
      'Manta', 'Montecristi', 'Olmedo', 'Paján', 'Pedernales', 'Pichincha', 
      'Portoviejo', 'Puerto López', 'Rocafuerte', 'San Vicente', 'Santa Ana', 
      'Sucre', 'Tosagua'
    ] 
  },
  { 
    name: 'Morona Santiago', 
    cities: [
      'Gualaquiza', 'Huamboya', 'Limón Indanza', 'Logroño', 'Macas', 'Pablo Sexto', 
      'Palora', 'San Juan Bosco', 'Santiago', 'Sucúa', 'Taisha', 'Tiwintza'
    ] 
  },
  { 
    name: 'Napo', 
    cities: ['Archidona', 'Carlos Julio Arosemena Tola', 'El Chaco', 'Quijos', 'Tena'] 
  },
  { 
    name: 'Orellana', 
    cities: ['Aguarico', 'Francisco de Orellana', 'La Joya de los Sachas', 'Loreto'] 
  },
  { 
    name: 'Pastaza', 
    cities: ['Arajuno', 'Mera', 'Puyo', 'Santa Clara'] 
  },
  { 
    name: 'Pichincha', 
    cities: [
      'Alangasí', 'Amaguaña', 'Calderón', 'Cayambe', 'Conocoto', 'Cumbayá', 
      'Cutuglahua', 'El Quinche', 'Machachi', 'Mejía', 'Pedro Moncayo', 
      'Pedro Vicente Maldonado', 'Pomasqui', 'Puerto Quito', 'Quito', 'Rumiñahui', 
      'San Antonio de Pichincha', 'San Miguel de los Bancos', 'Sangolquí', 
      'Tabacundo', 'Tumbaco'
    ] 
  },
  { 
    name: 'Santa Elena', 
    cities: ['Chanduy', 'Colonche', 'La Libertad', 'Manglaralto', 'Salinas', 'Santa Elena'] 
  },
  { 
    name: 'Santo Domingo', 
    cities: ['La Concordia', 'Santo Domingo'] 
  },
  { 
    name: 'Sucumbíos', 
    cities: [
      'Cascales', 'Cuyabeno', 'Gonzalo Pizarro', 'Nueva Loja', 'Putumayo', 
      'Shushufindi', 'Sucumbíos'
    ] 
  },
  { 
    name: 'Tungurahua', 
    cities: [
      'Ambato', 'Baños', 'Cevallos', 'Huachi Grande', 'Mocha', 'Patate', 'Pelileo', 
      'Píllaro', 'Quero', 'Quisapincha', 'Salasaca', 'Tisaleo'
    ] 
  },
  { 
    name: 'Zamora Chinchipe', 
    cities: [
      'Centinela del Cóndor', 'Chinchipe', 'El Pangui', 'Nangaritza', 'Palanda', 
      'Paquisha', 'Yacuambi', 'Yantzaza', 'Zamora'
    ] 
  }
];

// ACTUALIZADO: Más clubes
const TT_CLUBS_ECUADOR = [
  'Amazonas Ping Pong',
  'Ambato',
  'Azuay TT',
  'BackSping',
  'Billy Team',
  'Bolívar TT',
  'Buena Fe',
  'Cañar TT Club',
  'Carchi Racket Club',
  'Chimborazo Ping',
  'Club Deportivo Loja',
  'Costa TT Club',
  'Cotopaxi TT',
  'Cuenca',
  'El Oro Table Tennis',
  'Esmeraldas TT',
  'Fede - Manabi',
  'Fede Guayas',
  'Fede Santa Elena',
  'Galapagos',
  'Guayaquil City',
  'Imbabura Racket',
  'Independiente',
  'Los Ríos TT',
  'Manabí Spin',
  'Oriente TT',
  'Ping Pong Rick',
  'Ping Pro',
  'PPH',
  'Primorac',
  'Quito',
  'Selva TT',
  'Sierra Racket',
  'Spin Factor',
  'Spin Zone',
  'TM - Manta',
  'TT Quevedo',
  'Tungurahua Ping Pong',
  'Uartes'
];

// Updated brands list with Hurricane and Yinhe
const POPULAR_BRANDS = [
  'Andro', 'Avalox', 'Butterfly', 'Cornilleau', 'DHS', 'Donic', 'Double Fish', 
  'Dr. Neubauer', 'Friendship', 'Gewo', 'Hurricane', 'Joola', 'Killerspin', 
  'Nittaku', 'Palio', 'Sanwei', 'Saviga', 'Stiga', 'TSP', 
  'Tibhar', 'Victas', 'Xiom', 'Yasaka', 'Yinhe'
];

// ACTUALIZADO: Modelos populares de raquetas
const POPULAR_RACKET_MODELS = [
  'Allround Classic', 'Carbotec 7000', 'Clipper Wood', 'Defplay Senso', 
  'Evolution MX-P', 'Harimoto ALC', 'Hurricane Long 5', 'Innerforce Layer ALC', 
  'Kong Linghui', 'Ligna CO', 'Lin Gaoyuan ALC', 'Ma Lin Extra Offensive', 
  'Ma Long Carbon', 'Offensive Classic', 'Ovtcharov Innerforce ALC', 
  'Persson Powerplay', 'Power G7', 'Primorac Carbon', 'Quantum X Pro', 
  'Stratus PowerWood', 'Timo Boll ALC', 'Viscaria', 'Waldner Offensive', 
  'Zhang Jike Super ZLC'
];

// ACTUALIZADO: Modelos populares de caucho drive - RESTAURADO: Lista completa
const POPULAR_DRIVE_MODELS = [
  'Acuda Blue P1', 'Acuda Blue P3', 'Battle 2', 'Big Dipper', 'Cross 729', 
  'Dignics 05', 'Dignics 09C', 'Evolution MX-P', 'Evolution MX-S', 
  'Focus 3', 'Friendship 802-40', 'Hexer HD', 'Hexer Powergrip', 
  'Hurricane 3', 'Hurricane 8', 'Omega VII Euro', 'Omega VII Pro', 
  'Rakza 7', 'Rakza 9', 'Rhyzer 48', 'Rhyzer 50', 'Rozena', 
  'Skyline 3', 'Target Pro GT-H47', 'Target Pro GT-M43', 'Tenergy 05', 
  'Tenergy 64', 'Tenergy 80', 'V > 15 Extra', 'V > 20 Double Extra'
];

// ACTUALIZADO: Modelos populares de caucho back - RESTAURADO: Lista completa
const POPULAR_BACKHAND_MODELS = [
  'Acuda Blue P1', 'Acuda Blue P2', 'Battle 2 Back', 'Cross 729-2', 
  'Dignics 05', 'Dignics 80', 'Evolution EL-P', 'Evolution MX-P', 
  'Focus Snipe', 'Friendship 729 Super FX', 'Grass D.TecS', 'Hexer Pips+', 
  'Hexer Powergrip', 'Hurricane 3 Neo', 'Omega VII Euro', 'Omega VII Pro', 
  'Plaxon 450', 'Rakza 7 Soft', 'Rakza X', 'Rhyzer 43', 'Rhyzer 48', 
  'Rozena', 'Target Pro GT-M40', 'Target Pro GT-S43', 'Tenergy 05', 
  'Tenergy 64', 'Tenergy 80', 'V > 15 Extra', 'V > 20 Double Extra'
];

const RUBBER_COLORS = ['amarillo', 'azul', 'fucsia', 'morado', 'negro', 'rojo', 'verde'];

// Updated rubber types with corrected name
const RUBBER_TYPES = [
  { value: 'antitopsping', label: 'Antitopsping' },
  { value: 'liso', label: 'Liso' },
  { value: 'pupo_corto', label: 'Pupo Corto' },
  { value: 'pupo_largo', label: 'Pupo Largo' }
];

// ACTUALIZADO: Más opciones de hardness incluyendo N/A
const HARDNESS_LEVELS = [
  'Extra Hard', 'h35', 'h37', 'h39', 'h40', 'h42', 'h44', 'h46', 'h48', 'h50', 
  'h52', 'h54', 'Hard', 'Medium', 'N/A', 'Soft'
];

// Updated sponge thickness options as requested
const SPONGE_THICKNESSES = ['0,5', '0,7', '1,5', '1,6', '1,8', '1,9', '2', '2,1', '2,2', 'sin esponja'];

// Add validation states - ACTUALIZADO: Marcas comparten, modelos independientes
interface ValidationStates {
  brand: ValidationResult | null;  // Marcas compartidas
  racketModel: ValidationResult | null;  // Modelos independientes
  driveRubberModel: ValidationResult | null;  // Modelos independientes
  backhandRubberModel: ValidationResult | null;  // Modelos independientes
  driveRubberHardness: ValidationResult | null;
  backhandRubberHardness: ValidationResult | null;
  club: ValidationResult | null;
  league: ValidationResult | null;
}

const RegistroRapidoClient: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registrationCode, setRegistrationCode] = useState('');
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [validationStates, setValidationStates] = useState<ValidationStates>({
    brand: null,
    racketModel: null,
    driveRubberModel: null,
    backhandRubberModel: null,
    driveRubberHardness: null,
    backhandRubberHardness: null,
    club: null,
    league: null,
  });

  // Custom field visibility states
  const [showCustomLeague, setShowCustomLeague] = useState(false);
  const [showCustomClub, setShowCustomClub] = useState(false);
  const [showCustomRacketBrand, setShowCustomRacketBrand] = useState(false);
  const [showCustomRacketModel, setShowCustomRacketModel] = useState(false);
  const [showCustomDriveRubberBrand, setShowCustomDriveRubberBrand] = useState(false);
  const [showCustomDriveRubberModel, setShowCustomDriveRubberModel] = useState(false);
  const [showCustomDriveHardness, setShowCustomDriveHardness] = useState(false);
  const [showCustomBackhandRubberBrand, setShowCustomBackhandRubberBrand] = useState(false);
  const [showCustomBackhandRubberModel, setShowCustomBackhandRubberModel] = useState(false);
  const [showCustomBackhandHardness, setShowCustomBackhandHardness] = useState(false);

  // Use the existing clubs and leagues hooks separately
  const {
    clubs: existingClubs,
    loading: clubsLoading,
    error: clubsError,
    searchClubs,
    refetch: refetchClubs
  } = useExistingClubs();

  const {
    leagues: existingLeagues,
    loading: leaguesLoading,
    error: leaguesError,
    searchLeagues,
    refetch: refetchLeagues
  } = useExistingLeagues();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<RegistroRapidoFormValues>({
    resolver: zodResolver(registroRapidoSchema),
    mode: 'onChange',
  });

  // Dynamic options hooks - ACTUALIZADO: Incluir club y league
  const racketBrandOptions = useDynamicOptions('brand', POPULAR_BRANDS);
  const racketModelOptions = useDynamicOptions('racket_model', POPULAR_RACKET_MODELS);
  const rubberDriveBrandOptions = useDynamicOptions('brand', POPULAR_BRANDS);
  const rubberDriveModelOptions = useDynamicOptions('drive_rubber_model', POPULAR_DRIVE_MODELS);
  const rubberBackBrandOptions = useDynamicOptions('brand', POPULAR_BRANDS);
  const rubberBackModelOptions = useDynamicOptions('backhand_rubber_model', POPULAR_BACKHAND_MODELS);
  const driveHardnessOptions = useDynamicOptions('drive_rubber_hardness', HARDNESS_LEVELS);
  const backhandHardnessOptions = useDynamicOptions('backhand_rubber_hardness', HARDNESS_LEVELS);

  // NUEVO: Opciones dinámicas para club y league
  const clubOptions = useDynamicOptions('club', TT_CLUBS_ECUADOR);
  const leagueOptions = useDynamicOptions('league', [
    '593LATM'
  ]);

  // Watch for province selection
  const selectedProvinceName = watch('province');
  const selectedProvince = ECUADOR_PROVINCES.find(p => p.name === selectedProvinceName);

  // Watch for club selection to show/hide club role field
  const watchedClubName = watch('club_name');
  const watchedClubNameCustom = watch('club_name_custom');
  const hasClubSelected = (watchedClubName && watchedClubName !== '') || (watchedClubNameCustom && watchedClubNameCustom !== '');

  // Handle photo selection
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validation handlers
  const handleValidationResult = (field: keyof ValidationStates, result: ValidationResult | null) => {
    setValidationStates(prev => ({
      ...prev,
      [field]: result
    }));
  };

  const handleSuggestionAccepted = (field: string, suggestedValue: string) => {
    setValue(field as keyof RegistroRapidoFormValues, suggestedValue);
    // Clear the validation state for this field
    let validationField: keyof ValidationStates;
    
    // ACTUALIZADO: Mapear campos a estados de validación
    if (field.includes('brand')) {
      validationField = 'brand';  // Todas las marcas usan el mismo estado
    } else if (field.includes('racket') && field.includes('model')) {
      validationField = 'racketModel';
    } else if (field.includes('drive_rubber') && field.includes('model')) {
      validationField = 'driveRubberModel';
    } else if (field.includes('backhand_rubber') && field.includes('model')) {
      validationField = 'backhandRubberModel';
    } else if (field.includes('drive_rubber') && field.includes('hardness')) {
      validationField = 'driveRubberHardness';
    } else if (field.includes('backhand_rubber') && field.includes('hardness')) {
      validationField = 'backhandRubberHardness';
    } else if (field.includes('club')) {
      validationField = 'club';
    } else if (field.includes('league')) {
      validationField = 'league';
    } else {
      return;
    }
    
    setValidationStates(prev => ({
      ...prev,
      [validationField]: null
    }));
  };

  // ACTUALIZADO: Callback para cuando se agrega un campo personalizado
  const handleFieldAdded = (fieldType: FieldType, value: string) => {
    switch (fieldType) {
      case 'brand':
        racketBrandOptions.addOptionToList(value);
        rubberDriveBrandOptions.addOptionToList(value);
        rubberBackBrandOptions.addOptionToList(value);
        break;
      case 'racket_model':
        racketModelOptions.addOptionToList(value);
        break;
      case 'drive_rubber_model':
        rubberDriveModelOptions.addOptionToList(value);
        break;
      case 'backhand_rubber_model':
        rubberBackModelOptions.addOptionToList(value);
        break;
      case 'drive_rubber_hardness':
        driveHardnessOptions.addOptionToList(value);
        break;
      case 'backhand_rubber_hardness':
        backhandHardnessOptions.addOptionToList(value);
        break;
      case 'club':  // MODIFICADO: Comportamiento especial para clubes
        clubOptions.addOptionToList(value);
        // Automáticamente seleccionar el club recién agregado
        setValue('club_name', value);
        // Limpiar el campo personalizado
        setValue('club_name_custom', '');
        // Ocultar el campo personalizado
        setShowCustomClub(false);
        break;
      case 'league':  // NUEVO
        leagueOptions.addOptionToList(value);
        // Automáticamente seleccionar la liga recién agregada
        setValue('league', value);
        // Limpiar el campo personalizado
        setValue('league_custom', '');
        // Ocultar el campo personalizado
        setShowCustomLeague(false);
        break;
    }
  };

  const onSubmit = async (data: RegistroRapidoFormValues) => {
    setIsSubmitting(true);
    try {
      console.log('Form data being submitted:', data);
      
      const formData = new FormData();
      
      // Add all form data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          formData.append(key, String(value));
          console.log(`Adding to FormData: ${key} = ${value}`);
        }
      });

      // Handle custom club
      if (data.club_name === 'other' && data.club_name_custom) {
        formData.set('club_name', data.club_name_custom);
        formData.delete('club_name_custom');
      }

      // Handle custom league
      if (data.league === 'other' && data.league_custom) {
        formData.set('league', data.league_custom);
        formData.delete('league_custom');
      }

      // Handle custom racket brand
      if (data.racket_brand === 'other' && data.custom_racket_brand) {
        formData.set('racket_brand', data.custom_racket_brand);
        formData.delete('custom_racket_brand');
      }

      // Handle custom racket model
      if (data.racket_model === 'other' && data.custom_racket_model) {
        formData.set('racket_model', data.custom_racket_model);
        formData.delete('custom_racket_model');
      }

      // Handle custom drive rubber brand
      if (data.drive_rubber_brand === 'other' && data.custom_drive_rubber_brand) {
        formData.set('drive_rubber_brand', data.custom_drive_rubber_brand);
        formData.delete('custom_drive_rubber_brand');
      }

      // Handle custom drive rubber model
      if (data.drive_rubber_model === 'other' && data.custom_drive_rubber_model) {
        formData.set('drive_rubber_model', data.custom_drive_rubber_model);
        formData.delete('custom_drive_rubber_model');
      }

      // Handle custom drive rubber hardness
      if (data.drive_rubber_hardness === 'other' && data.custom_drive_rubber_hardness) {
        formData.set('drive_rubber_hardness', data.custom_drive_rubber_hardness);
        formData.delete('custom_drive_rubber_hardness');
      }

      // Handle custom backhand rubber brand
      if (data.backhand_rubber_brand === 'other' && data.custom_backhand_rubber_brand) {
        formData.set('backhand_rubber_brand', data.custom_backhand_rubber_brand);
        formData.delete('custom_backhand_rubber_brand');
      }

      // Handle custom backhand rubber model
      if (data.backhand_rubber_model === 'other' && data.custom_backhand_rubber_model) {
        formData.set('backhand_rubber_model', data.custom_backhand_rubber_model);
        formData.delete('custom_backhand_rubber_model');
      }

      // Handle custom backhand rubber hardness
      if (data.backhand_rubber_hardness === 'other' && data.custom_backhand_rubber_hardness) {
        formData.set('backhand_rubber_hardness', data.custom_backhand_rubber_hardness);
        formData.delete('custom_backhand_rubber_hardness');
      }

      // Add photo if selected (optional)
      if (selectedPhoto) {
        // Validate photo size (5MB max)
        if (selectedPhoto.size > 5 * 1024 * 1024) {
          alert('La foto es demasiado grande. El tamaño máximo es 5MB.');
          return;
        }
        
        // Validate photo type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(selectedPhoto.type)) {
          alert('Tipo de archivo no permitido. Usa JPEG, PNG, GIF o WebP.');
          return;
        }

        formData.append('photo', selectedPhoto);
        console.log('Photo added to FormData:', selectedPhoto.name, selectedPhoto.size);
      }

      console.log('Sending request to /api/registro-rapido...');
      
      // Log FormData contents for debugging
      console.log('FormData contents:');
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      
      // Send to API
      const response = await axios.post('/api/registro-rapido', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
      });

      console.log('Response received:', response.data);

      // Extract registration data from response
      const responseData = response.data;
      const registrationInfo = responseData.data || responseData;
      
      // Set registration code and data
      setRegistrationCode(responseData.registration_code || registrationInfo.registration_code || '');
      setRegistrationData({
        ...registrationInfo,
        full_name: `${data.first_name} ${data.second_name || ''} ${data.last_name} ${data.second_last_name || ''}`.replace(/\s+/g, ' ').trim(),
        email: data.email,
        location: `${data.city}, ${data.province}`,
        club: data.club_name_custom || data.club_name || 'Sin club especificado'
      });
      
      setIsSuccess(true);
    } catch (error: unknown) {
      console.error('Error en registro rápido:', error);

      if (isAxiosError(error)) {
        console.error('Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
          method: error.config?.method
        });

        const status = error.response?.status;
        const errorData = error.response?.data;
        
        if (status === 422) {
          // Validation errors
          const { errors, message } = (errorData ?? {}) as { errors?: Record<string, string[] | string>; message?: string };
          
          if (errors) {
            // Handle specific field errors
            if ('email' in errors) {
              alert('Este email ya está registrado en el censo.');
            } else if ('photo' in errors) {
              const photoErrors = errors['photo'];
              const firstError = Array.isArray(photoErrors) ? photoErrors[0] : String(photoErrors ?? '');
              alert('Error con la foto: ' + firstError);
            } else if ('second_last_name' in errors) {
              alert('El segundo apellido es obligatorio.');
            } else if ('province' in errors) {
              alert('Por favor selecciona una provincia.');
            } else if ('city' in errors) {
              alert('Por favor selecciona una ciudad.');
            } else {
              // Show first validation error
              const firstField = Object.keys(errors)[0];
              const firstError = errors[firstField];
              const errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
              alert(`Error en ${firstField}: ${errorMessage}`);
            }
          } else {
            alert('Error de validación: ' + (message || 'Por favor revisa los datos ingresados.'));
          }
        } else if (status === 500) {
          const serverMessage = errorData?.message || 'Error interno del servidor';
          alert(`Error del servidor: ${serverMessage}. Por favor intenta de nuevo más tarde.`);
        } else if (status === 404) {
          alert('Endpoint no encontrado. Por favor contacta al soporte técnico.');
        } else if (status === 0 || !status) {
          alert('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
        } else {
          alert(`Error ${status}: ${errorData?.message || 'Error desconocido'}. Por favor intenta de nuevo.`);
        }
      } else {
        alert('Error de conexión. Por favor verifica tu conexión a internet e intenta de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: [0.42, 0, 0.58, 1] }
    },
  };

  // Estilos mejorados para mejor visibilidad
  const inputStyles = "w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 font-bold placeholder-gray-600 bg-white hover:border-gray-400";
  const inputErrorStyles = "border-red-400 bg-red-50 text-red-900 font-bold placeholder-red-500";
  const inputNormalStyles = "border-gray-300 hover:border-gray-400";
  const labelStyles = "block text-sm font-bold text-gray-800 mb-1";
  const sectionTitleStyles = "text-xl font-bold text-gray-900 border-b-2 border-gray-300 pb-3 mb-6";

  if (isSuccess) {
    return (
      <ThemeProvider theme={authTheme}>
        <CssBaseline />
        <AuthLayout>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Registro Exitoso</h2>
            
            {/* Información del usuario registrado */}
            {registrationData && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-green-800 mb-3">
                  Hola {registrationData.full_name}
                </h3>
                <div className="space-y-2 text-green-700">
                  <p className="font-semibold">
                    Email: <span className="font-normal">{registrationData.email}</span>
                  </p>
                  <p className="font-semibold">
                    Ubicación: <span className="font-normal">{registrationData.location}</span>
                  </p>
                  {registrationData.club && registrationData.club !== 'Sin club especificado' && (
                    <p className="font-semibold">
                      Club: <span className="font-normal">{registrationData.club}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Código de registro */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-blue-800 mb-2">Tu Código de Registro</h3>
              <div className="bg-white border-2 border-blue-300 rounded-lg p-4 mb-3">
                <span className="text-2xl font-bold text-blue-600 tracking-wider">
                  {registrationCode || 'Generando código...'}
                </span>
              </div>
              <p className="text-sm text-blue-700 font-medium">
                Guarda este código, lo necesitarás para consultar tu estado
              </p>
            </div>
            
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
              <p className="text-yellow-800 font-semibold text-sm">
                Te has registrado exitosamente en el censo de tenis de mesa. 
                Pronto nos pondremos en contacto contigo para completar el proceso.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push('/censo-waiting-room')}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl"
              >
                Ir a Sala de Espera
              </button>
              <button
                onClick={() => window.location.href = 'https://raquet-power2-0.vercel.app/registro-rapido'}
                className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 py-4 px-6 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-bold text-lg border-2 border-gray-300 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Volver al Inicio
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 font-medium">
                Tu información está segura y será utilizada únicamente para el censo de tenis de mesa
              </p>
            </div>
          </motion.div>
        </AuthLayout>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={authTheme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <AuthLayout>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={itemVariants}>
              <AuthHeader
                title="Censo de Tenis de Mesa"
                subtitle="593LATM (liga amateur de tenis de mesa)"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-8 mt-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Foto */}
                <div className="flex justify-center">
                  <div className="relative">
                    {photoPreview ? (
                      <img
                        className="h-32 w-32 object-cover rounded-full border-4 border-gray-400"
                        src={photoPreview}
                        alt="Vista previa"
                      />
                    ) : (
                      <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-400">
                        <svg className="h-12 w-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    <label
                      htmlFor="photo"
                      className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-3 cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0112.07 4h3.86a2 2 0 011.664.89l.812 1.22a2 2 0 001.664.89H20a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V9z" />
                      </svg>
                    </label>
                    <input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="sr-only"
                    />
                  </div>
                </div>

                {/* Photo info */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 font-medium flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Foto opcional - Máximo 5MB (JPEG, PNG, GIF, WebP)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Puedes completar el registro sin foto y agregarla después
                  </p>
                </div>

                {/* Información Personal - ACTUALIZADO: Nombres y apellidos separados */}
                <div className="space-y-6">
                  <h3 className={sectionTitleStyles}>
                    Información Personal
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="first_name" className={labelStyles}>
                        Primer Nombre <span className="text-red-600 font-bold">*</span>
                      </label>
                      <input
                        {...register('first_name')}
                        type="text"
                        id="first_name"
                        placeholder="Juan"
                        className={`${inputStyles} ${errors.first_name ? inputErrorStyles : inputNormalStyles}`}
                      />
                      {errors.first_name && (
                        <p className="text-sm text-red-700 font-semibold">{errors.first_name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="second_name" className={labelStyles}>
                        Segundo Nombre
                      </label>
                      <input
                        {...register('second_name')}
                        type="text"
                        id="second_name"
                        placeholder="Carlos"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      />
                      <p className="text-xs text-gray-600 font-medium">
                        Campo opcional
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="last_name" className={labelStyles}>
                        Primer Apellido <span className="text-red-600 font-bold">*</span>
                      </label>
                      <input
                        {...register('last_name')}
                        type="text"
                        id="last_name"
                        placeholder="Pérez"
                        className={`${inputStyles} ${errors.last_name ? inputErrorStyles : inputNormalStyles}`}
                      />
                      {errors.last_name && (
                        <p className="text-sm text-red-700 font-semibold">{errors.last_name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="second_last_name" className={labelStyles}>
                        Segundo Apellido <span className="text-red-600 font-bold">*</span>
                      </label>
                      <input
                        {...register('second_last_name')}
                        type="text"
                        id="second_last_name"
                        placeholder="Paz"
                        className={`${inputStyles} ${errors.second_last_name ? inputErrorStyles : inputNormalStyles}`}
                      />
                      {errors.second_last_name && (
                        <p className="text-sm text-red-700 font-semibold">{errors.second_last_name.message}</p>
                      )}
                      <p className="text-xs text-gray-600 font-medium">
                        Campo obligatorio
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="doc_id" className={labelStyles}>Cédula</label>
                      <input
                        {...register('doc_id')}
                        type="text"
                        id="doc_id"
                        placeholder="0999999999"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="birth_date" className={labelStyles}>Fecha de Nacimiento</label>
                      <input
                        {...register('birth_date')}
                        type="date"
                        id="birth_date"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="gender" className={labelStyles}>Sexo</label>
                      <select
                        {...register('gender')}
                        id="gender"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      >
                        <option value="">Seleccionar</option>
                        <option value="masculino">Masculino</option>
                        <option value="femenino">Femenino</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="email" className={labelStyles}>
                        Email <span className="text-red-600 font-bold">*</span>
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        id="email"
                        placeholder="correo@hotmail.com"
                        className={`${inputStyles} ${errors.email ? inputErrorStyles : inputNormalStyles}`}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-700 font-semibold">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phone" className={labelStyles}>
                        Celular <span className="text-red-600 font-bold">*</span>
                      </label>
                      <input
                        {...register('phone')}
                        type="tel"
                        id="phone"
                        placeholder="0989999999"
                        className={`${inputStyles} ${errors.phone ? inputErrorStyles : inputNormalStyles}`}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-700 font-semibold">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ubicación */}
                <div className="space-y-6">
                  <h3 className={sectionTitleStyles}>
                    Ubicación
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="country" className={labelStyles}>País</label>
                      <input
                        {...register('country')}
                        type="text"
                        id="country"
                        defaultValue="Ecuador"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="province" className={labelStyles}>
                        Provincia <span className="text-red-600 font-bold">*</span>
                      </label>
                      <select
                        {...register('province')}
                        id="province"
                        className={`${inputStyles} ${errors.province ? inputErrorStyles : inputNormalStyles}`}
                      >
                        <option value="">Seleccionar provincia</option>
                        {ECUADOR_PROVINCES.map((province) => (
                          <option key={province.name} value={province.name}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                      {errors.province && (
                        <p className="text-sm text-red-700 font-semibold">{errors.province.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="city" className={labelStyles}>
                        Ciudad <span className="text-red-600 font-bold">*</span>
                      </label>
                      <select
                        {...register('city')}
                        id="city"
                        disabled={!selectedProvince}
                        className={`${inputStyles} ${errors.city ? inputErrorStyles : inputNormalStyles} ${!selectedProvince ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                      >
                        <option value="">Seleccionar ciudad</option>
                        {selectedProvince?.cities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                      {errors.city && (
                        <p className="text-sm text-red-700 font-semibold">{errors.city.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Liga y Club - ACTUALIZADO: Agregar selección de liga */}
                <div className="space-y-6">
                  <h3 className={sectionTitleStyles}>
                    Liga y Club
                  </h3>
                  
                  {/* ACTUALIZADO: Renderizar campo de liga con detección de ligas existentes */}
                  <div className="space-y-2">
                    <label htmlFor="league" className={labelStyles}>
                      Liga
                    </label>
                    <select
                      {...register('league')}
                      id="league"
                      className={`${inputStyles} ${inputNormalStyles}`}
                      onChange={(e) => {
                        setValue('league', e.target.value);
                        const isCustom = e.target.value === 'other';
                        setShowCustomLeague(isCustom);
                        if (!isCustom) {
                          setValue('league_custom', '');
                        }
                      }}
                    >
                      <option value="">Seleccionar liga</option>
                      {/* Mostrar ligas existentes de la base de datos primero */}
                      {existingLeagues
                        .filter(league => league.source === 'database')
                        .map((league) => (
                          <option key={league.name} value={league.name} className="bg-green-50 text-green-800 font-bold">
                            🏆 {league.display_name} (Registrada)
                          </option>
                        ))}
                      {/* Separador visual si hay ligas de la BD */}
                      {existingLeagues.some(l => l.source === 'database') && 
                       existingLeagues.some(l => l.source === 'predefined') && (
                        <option disabled className="bg-gray-100 text-gray-500">
                          ──── Otras opciones ────
                        </option>
                      )}
                      {/* Mostrar ligas predefinidas */}
                      {existingLeagues
                        .filter(league => league.source === 'predefined')
                        .map((league) => (
                          <option key={league.name} value={league.name}>
                            {league.name}
                          </option>
                        ))}
                      <option value="other" className="bg-amber-50 text-amber-800 font-bold">
                        🏆 ¿Tu liga no está aquí? ¡Agrégala al listado!
                      </option>
                    </select>
                    
                    {/* Información sobre ligas existentes */}
                    {existingLeagues.length > 0 && (
                      <div className="text-xs text-gray-600 font-medium flex items-center gap-1">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          {existingLeagues.filter(l => l.source === 'database').length > 0 
                            ? `${existingLeagues.filter(l => l.source === 'database').length} ligas registradas encontradas`
                            : `${existingLeagues.length} ligas disponibles`
                          }
                        </span>
                      </div>
                    )}
                    
                    {leaguesLoading && (
                      <div className="text-xs text-blue-600 font-medium flex items-center gap-1">
                        <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Buscando ligas registradas...</span>
                      </div>
                    )}
                    
                    {/* Campo personalizado para liga */}
                    {showCustomLeague && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl shadow-sm"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-amber-100 rounded-full p-2">
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-amber-800">
                              🏆 Agregar Liga al Listado
                            </h4>
                            <p className="text-amber-700 text-sm font-medium">
                              Escribe el nombre de tu liga y agrégala para que otros también puedan seleccionarla
                            </p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <input
                            {...register('league_custom')}
                            type="text"
                            placeholder="Escribe el nombre de tu liga"
                            className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 font-bold placeholder-amber-600 bg-white"
                          />
                          <CustomFieldValidator
                            fieldType="league"
                            value={watch('league_custom') || ''}
                            onValidationResult={(result) => handleValidationResult('league', result)}
                            onSuggestionAccepted={(value) => handleSuggestionAccepted('league_custom', value)}
                            onFieldAdded={handleFieldAdded}
                            isVisible={!!watch('league_custom')}
                            currentOptions={leagueOptions.options}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  {/* ACTUALIZADO: Renderizar campo de club con detección de clubes existentes */}
                  <div className="space-y-2">
                    <label htmlFor="club_name" className={labelStyles}>Club</label>
                    <select
                      {...register('club_name')}
                      id="club_name"
                      className={`${inputStyles} ${inputNormalStyles}`}
                      onChange={(e) => {
                        setValue('club_name', e.target.value);
                        const isCustom = e.target.value === 'other';
                        setShowCustomClub(isCustom);
                        if (!isCustom) {
                          setValue('club_name_custom', '');
                        }
                      }}
                    >
                      <option value="">Seleccionar club</option>
                      {/* Mostrar clubes existentes de la base de datos primero */}
                      {existingClubs
                        .filter(club => club.source === 'database')
                        .map((club) => (
                          <option key={club.name} value={club.name} className="bg-green-50 text-green-800 font-bold">
                            🏓 {club.display_name} (Registrado)
                          </option>
                        ))}
                      {/* Separador visual si hay clubes de la BD */}
                      {existingClubs.some(c => c.source === 'database') && 
                       existingClubs.some(c => c.source === 'predefined') && (
                        <option disabled className="bg-gray-100 text-gray-500">
                          ──── Otros clubes ────
                        </option>
                      )}
                      {/* Mostrar clubes predefinidos */}
                      {existingClubs
                        .filter(club => club.source === 'predefined')
                        .map((club) => (
                          <option key={club.name} value={club.name}>
                            {club.name}
                          </option>
                        ))}
                      <option value="other" className="bg-amber-50 text-amber-800 font-bold">
                        🏓 ¿Tu club no está aquí? ¡Agrégalo al listado!
                      </option>
                    </select>
                    
                    {/* Información sobre clubes existentes */}
                    {existingClubs.length > 0 && (
                      <div className="text-xs text-gray-600 font-medium flex items-center gap-1">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          {existingClubs.filter(c => c.source === 'database').length > 0 
                            ? `${existingClubs.filter(c => c.source === 'database').length} clubes registrados encontrados`
                            : `${existingClubs.length} clubes disponibles`
                          }
                        </span>
                      </div>
                    )}
                    
                    {clubsLoading && (
                      <div className="text-xs text-blue-600 font-medium flex items-center gap-1">
                        <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Buscando clubes registrados...</span>
                      </div>
                    )}
                    
                    {/* Campo personalizado para club */}
                    {showCustomClub && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl shadow-sm"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-amber-100 rounded-full p-2">
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-amber-800">
                              🏓 Agregar Club al Listado
                            </h4>
                            <p className="text-amber-700 text-sm font-medium">
                              Escribe el nombre de tu club y agrégalo para que otros también puedan seleccionarlo
                            </p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <input
                            {...register('club_name_custom')}
                            type="text"
                            placeholder="Escribe el nombre de tu club"
                            className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 font-bold placeholder-amber-600 bg-white"
                          />
                          <CustomFieldValidator
                            fieldType="club"
                            value={watch('club_name_custom') || ''}
                            onValidationResult={(result) => handleValidationResult('club', result)}
                            onSuggestionAccepted={(value) => handleSuggestionAccepted('club_name_custom', value)}
                            onFieldAdded={handleFieldAdded}
                            isVisible={showCustomClub}
                            currentOptions={clubOptions.options}
                          />
                        </div>
                      </motion.div>
                    )}
                    
                    <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        {clubOptions.options.length > 0 
                          ? `${clubOptions.options.length} clubes disponibles. ¿No encuentras el tuyo? ¡Agrégalo!`
                          : 'Cargando lista de clubes...'
                        }
                      </span>
                    </p>
                  </div>

                  {/* Campo de Ranking */}
                  <div className="space-y-2">
                    <label htmlFor="ranking" className={labelStyles}>
                      Ranking
                    </label>
                    <input
                      {...register('ranking')}
                      type="text"
                      id="ranking"
                      placeholder="Ej: 1500, 1200, 800, etc."
                      className={`${inputStyles} ${inputNormalStyles}`}
                    />
                    <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Ingresa tu ranking actual si lo conoces (campo opcional)</span>
                    </p>
                  </div>

                  {/* NUEVO: Campo de Rol en el Club - Solo visible cuando se selecciona un club */}
                  {hasClubSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <label htmlFor="club_role" className={labelStyles}>
                        Rol en el Club
                      </label>
                      <select
                        {...register('club_role')}
                        id="club_role"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      >
                        <option value="ninguno">Ninguno</option>
                        <option value="administrador">Administrador del Club</option>
                        <option value="dueño">Dueño del Club</option>
                      </select>
                      <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Selecciona tu rol en el club si tienes alguna responsabilidad administrativa</span>
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Estilo de Juego */}
                <div className="space-y-6">
                  <h3 className={sectionTitleStyles}>
                    Estilo de Juego
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="playing_side" className={labelStyles}>Lado de Juego</label>
                      <select
                        {...register('playing_side')}
                        id="playing_side"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      >
                        <option value="">Seleccionar</option>
                        <option value="derecho">Derecho</option>
                        <option value="zurdo">Zurdo</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="playing_style" className={labelStyles}>Tipo de Juego</label>
                      <select
                        {...register('playing_style')}
                        id="playing_style"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      >
                        <option value="">Seleccionar</option>
                        <option value="clasico">Clásico</option>
                        <option value="lapicero">Lapicero</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Raqueta - Palo - ACTUALIZADO: Usar opciones dinámicas */}
                <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Raqueta - Palo
                  </h3>
                  
                  {/* Banner informativo sobre marcas personalizadas */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 rounded-full p-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-blue-900 font-bold text-sm flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          ¿No encuentras tu marca o modelo?
                        </h4>
                        <p className="text-blue-800 text-xs font-medium">
                          Cada campo tiene su propia opción para agregar marcas o modelos personalizados
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Campo de Marca con opciones dinámicas */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-800 mb-1">
                        Marca
                        {racketBrandOptions.isLoading && (
                          <span className="ml-2 text-xs text-blue-600">Cargando opciones...</span>
                        )}
                      </label>
                      <select
                        {...register('racket_brand')}
                        onChange={(e) => {
                          const isCustom = e.target.value === 'other';
                          setShowCustomRacketBrand(isCustom);
                          if (!isCustom) {
                            setValue('custom_racket_brand', '');
                          }
                        }}
                        className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 font-bold placeholder-gray-600 bg-white hover:border-gray-400 border-gray-300"
                      >
                        <option value="">Seleccionar marca</option>
                        {racketBrandOptions.options.map((brand) => (
                          <option key={brand} value={brand}>
                            {brand}
                          </option>
                        ))}
                        <option value="other" className="bg-amber-50 text-amber-800 font-bold">
                          🏷️ ¿Tu marca no está aquí? ¡Agrégala al listado!
                        </option>
                      </select>
                      <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Marcas populares de raquetas de tenis de mesa</span>
                      </p>
                    </div>

                    {/* Campo de Modelo con opciones dinámicas */}
                    <div className="space-y-2">
                      <label htmlFor="racket_model" className={labelStyles}>
                        Modelo
                        {racketModelOptions.isLoading && (
                          <span className="ml-2 text-xs text-blue-600">Cargando opciones...</span>
                        )}
                      </label>
                      <select
                        {...register('racket_model')}
                        id="racket_model"
                        onChange={(e) => {
                          const isCustomModel = e.target.value === 'other';
                          setShowCustomRacketModel(isCustomModel);
                          if (!isCustomModel) {
                            setValue('custom_racket_model', '');
                          }
                        }}
                        className={`${inputStyles} ${inputNormalStyles}`}
                      >
                        <option value="">Seleccionar modelo</option>
                        {racketModelOptions.options.map((model) => (
                          <option key={model} value={model}>
                            {model}
                          </option>
                        ))}
                        <option value="other" className="bg-amber-50 text-amber-800 font-bold">
                          🎯 ¿Tu modelo no está aquí? ¡Agrégalo al listado!
                        </option>
                      </select>
                      <p className="text-xs text-gray-600 font-medium">
                        Modelos populares de raquetas
                      </p>
                    </div>
                  </div>

                  {/* Campo personalizado para marca - CORREGIDO: Fuera del grid, debajo de las opciones */}
                  {showCustomRacketBrand && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl shadow-sm"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-amber-100 rounded-full p-2">
                          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-amber-800">
                            🏷️ Agregar Marca al Listado
                          </h4>
                          <p className="text-amber-700 text-sm font-medium">
                            Escribe el nombre de la marca y agrégala para que otros también puedan seleccionarla
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <input
                          {...register('custom_racket_brand')}
                          type="text"
                          placeholder="Escribe la marca de tu raqueta"
                          className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 font-bold placeholder-amber-600 bg-white"
                        />
                        <CustomFieldValidator
                          fieldType="brand"
                          value={watch('custom_racket_brand') || ''}
                          onValidationResult={(result) => handleValidationResult('brand', result)}
                          onSuggestionAccepted={(value) => handleSuggestionAccepted('custom_racket_brand', value)}
                          onFieldAdded={handleFieldAdded}
                          isVisible={showCustomRacketBrand}
                          currentOptions={racketBrandOptions.options}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Campo personalizado para modelo - CORREGIDO: Fuera del grid, debajo de las opciones */}
                  {showCustomRacketModel && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-sm"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-green-100 rounded-full p-2">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-green-800">
                            🎯 Agregar Modelo al Listado
                          </h4>
                          <p className="text-green-700 text-sm font-medium">
                            Escribe el modelo de tu raqueta y agrégalo para que otros también puedan seleccionarlo
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <input
                          {...register('custom_racket_model')}
                          type="text"
                          placeholder="Escribe el modelo de tu raqueta"
                          className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 font-bold placeholder-green-600 bg-white"
                        />
                        <CustomFieldValidator
                          fieldType="racket_model"
                          value={watch('custom_racket_model') || ''}
                          onValidationResult={(result) => handleValidationResult('racketModel', result)}
                          onSuggestionAccepted={(value) => handleSuggestionAccepted('custom_racket_model', value)}
                          onFieldAdded={handleFieldAdded}
                          isVisible={showCustomRacketModel}
                          currentOptions={racketModelOptions.options}
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Submit button */}
                <div className="flex flex-col md:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                                        <span>Registrando...</span>
                      </div>
                    ) : (
                      'Registrar en el Censo'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => router.push('/censo-waiting-room')}
                    className="flex-1 bg-gray-100 text-gray-800 py-4 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200 font-bold text-lg border-2 border-gray-300 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Ir a Sala de Espera
                  </button>
                </div>

                {/* Caucho del Drive - ACTUALIZADO: Opciones independientes para marca y modelo */}
                <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                    Caucho del Drive
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Campo de Marca con opción personalizada independiente */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-800 mb-1">Marca</label>
                      <select
                        {...register('drive_rubber_brand')}
                        onChange={(e) => {
                          const isCustom = e.target.value === 'other';
                          setShowCustomDriveRubberBrand(isCustom);
                          if (!isCustom) {
                            setValue('custom_drive_rubber_brand', '');
                          }
                        }}
                        className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 font-bold placeholder-gray-600 bg-white hover:border-gray-400 border-gray-300"
                      >
                        <option value="">Seleccionar marca</option>
                        {rubberDriveBrandOptions.options.map((brand) => (
                          <option key={brand} value={brand}>
                            {brand}
                          </option>
                        ))}
                        <option value="other" className="bg-amber-50 text-amber-800 font-bold">
                          🏷️ ¿Tu marca no está aquí? ¡Agrégala al listado!
                        </option>
                      </select>
                      <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Marcas de cauchos más utilizadas</span>
                      </p>
                    </div>

                    {/* Campo de Modelo con opción personalizada independiente */}
                    <div className="space-y-2">
                      <label htmlFor="drive_rubber_model" className={labelStyles}>Modelo</label>
                      <select
                        {...register('drive_rubber_model')}
                        id="drive_rubber_model"
                        onChange={(e) => {
                          const isCustomModel = e.target.value === 'other';
                          setShowCustomDriveRubberModel(isCustomModel);
                          if (!isCustomModel) {
                            setValue('custom_drive_rubber_model', '');
                          }
                        }}
                        className={`${inputStyles} ${inputNormalStyles}`}
                      >
                        <option value="">Seleccionar modelo</option>
                        {rubberDriveModelOptions.options.map((model) => (
                          <option key={model} value={model}>
                            {model}
                          </option>
                        ))}
                        <option value="other" className="bg-amber-50 text-amber-800 font-bold">
                          🎯 ¿Tu modelo no está aquí? ¡Agrégalo al listado!
                        </option>
                      </select>
                      <p className="text-xs text-gray-600 font-medium">
                        Modelos populares para drive
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="drive_rubber_type" className={labelStyles}>Tipo</label>
                      <select
                        {...register('drive_rubber_type')}
                        id="drive_rubber_type"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      >
                        <option value="">Seleccionar tipo</option>
                        {RUBBER_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="drive_rubber_color" className={labelStyles}>Color</label>
                      <select
                        {...register('drive_rubber_color')}
                        id="drive_rubber_color"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      >
                        <option value="">Seleccionar color</option>
                        {RUBBER_COLORS.map((color) => (
                          <option key={color} value={color}>
                            {color.charAt(0).toUpperCase() + color.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="drive_rubber_sponge" className={labelStyles}>Esponja</label>
                      <select
                        {...register('drive_rubber_sponge')}
                        id="drive_rubber_sponge"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      >
                        <option value="">Seleccionar esponja</option>
                        {SPONGE_THICKNESSES.map((thickness) => (
                          <option key={thickness} value={thickness}>
                            {thickness === 'sin esponja' ? thickness : `${thickness} mm`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="drive_rubber_hardness" className={labelStyles}>Hardness</label>
                      <select
                        {...register('drive_rubber_hardness')}
                        id="drive_rubber_hardness"
                        onChange={(e) => {
                          const isCustom = e.target.value === 'other';
                          setShowCustomDriveHardness(isCustom);
                          if (!isCustom) {
                            setValue('custom_drive_rubber_hardness', '');
                          }
                        }}
                        className={`${inputStyles} ${inputNormalStyles}`}
                      >
                        <option value="">Seleccionar hardness</option>
                        {driveHardnessOptions.options.map((hardness) => (
                          <option key={hardness} value={hardness}>
                            {hardness}
                          </option>
                        ))}
                        <option value="other" className="bg-amber-50 text-amber-800 font-bold">
                          ¿Tu hardness no está aquí? ¡Escríbelo!
                        </option>
                      </select>
                      <p className="text-xs text-gray-600 font-medium">
                        Incluye N/A si no conoces la dureza
                      </p>
                    </div>
                  </div>

                  {/* Campo personalizado para marca */}
                  {showCustomDriveRubberBrand && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl shadow-sm"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-amber-100 rounded-full p-2">
                          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-amber-800">
                            🏷️ Agregar Marca de Caucho Drive
                          </h4>
                          <p className="text-amber-700 text-sm font-medium">
                            Escribe la marca de tu caucho drive y agrégala para que otros también puedan seleccionarla
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <input
                          {...register('custom_drive_rubber_brand')}
                          type="text"
                          placeholder="Escribe la marca de tu caucho drive"
                          className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 font-bold placeholder-amber-600 bg-white"
                        />
                        <CustomFieldValidator
                          fieldType="brand"
                          value={watch('custom_drive_rubber_brand') || ''}
                          onValidationResult={(result) => handleValidationResult('brand', result)}
                          onSuggestionAccepted={(value) => handleSuggestionAccepted('custom_drive_rubber_brand', value)}
                          onFieldAdded={handleFieldAdded}
                          isVisible={showCustomDriveRubberBrand}
                          currentOptions={rubberDriveBrandOptions.options}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Campo personalizado para modelo */}
                  {showCustomDriveRubberModel && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl shadow-sm"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-cyan-100 rounded-full p-2">
                          <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-cyan-800">
                            🎯 Agregar Modelo de Caucho Drive
                          </h4>
                          <p className="text-cyan-700 text-sm font-medium">
                            Escribe el modelo de tu caucho drive y agrégalo para que otros también puedan seleccionarlo
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <input
                          {...register('custom_drive_rubber_model')}
                          type="text"
                          placeholder="Escribe el modelo de tu caucho drive"
                          className="w-full px-4 py-3 border-2 border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 font-bold placeholder-cyan-600 bg-white"
                        />
                        <CustomFieldValidator
                          fieldType="drive_rubber_model"
                          value={watch('custom_drive_rubber_model') || ''}
                          onValidationResult={(result) => handleValidationResult('driveRubberModel', result)}
                          onSuggestionAccepted={(value) => handleSuggestionAccepted('custom_drive_rubber_model', value)}
                          onFieldAdded={handleFieldAdded}
                          isVisible={showCustomDriveRubberModel}
                          currentOptions={rubberDriveModelOptions.options}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Campo personalizado para hardness del drive */}
                  {showCustomDriveHardness && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl shadow-sm"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-purple-100 rounded-full p-2">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-purple-800">
                            💎 Agregar Hardness Drive
                          </h4>
                          <p className="text-purple-700 text-sm font-medium">
                            Escribe el hardness de tu caucho drive y agrégalo para que otros también puedan seleccionarlo
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <input
                          {...register('custom_drive_rubber_hardness')}
                          type="text"
                          placeholder="Ej: h41, Medium-Soft, 38°, etc."
                          className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 font-bold placeholder-purple-600 bg-white"
                        />
                        <CustomFieldValidator
                          fieldType="drive_rubber_hardness"
                          value={watch('custom_drive_rubber_hardness') || ''}
                          onValidationResult={(result) => handleValidationResult('driveRubberHardness', result)}
                          onSuggestionAccepted={(value) => handleSuggestionAccepted('custom_drive_rubber_hardness', value)}
                          onFieldAdded={handleFieldAdded}
                          isVisible={showCustomDriveHardness}
                          currentOptions={driveHardnessOptions.options}
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Caucho del Back - ACTUALIZADO: Opciones independientes para marca y modelo */}
                <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <div className="w-6 h-6 bg-black rounded-full"></div>
                    Caucho del Back
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Campo de Marca con opción personalizada independiente */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-800 mb-1">Marca</label>
                      <select
                        {...register('backhand_rubber_brand')}
                        onChange={(e) => {
                          const isCustom = e.target.value === 'other';
                          setShowCustomBackhandRubberBrand(isCustom);
                          if (!isCustom) {
                            setValue('custom_backhand_rubber_brand', '');
                          }
                        }}
                        className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 font-bold placeholder-gray-600 bg-white hover:border-gray-400 border-gray-300"
                      >
                        <option value="">Seleccionar marca</option>
                        {rubberBackBrandOptions.options.map((brand) => (
                          <option key={brand} value={brand}>
                            {brand}
                          </option>
                        ))}
                        <option value="other" className="bg-amber-50 text-amber-800 font-bold">
                          🏷️ ¿Tu marca no está aquí? ¡Agrégala al listado!
                        </option>
                      </select>
                      <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Marcas de cauchos para revés</span>
                      </p>
                    </div>

                    {/* Campo de Modelo con opción personalizada independiente */}
                    <div className="space-y-2">
                      <label htmlFor="backhand_rubber_model" className={labelStyles}>Modelo</label>
                      <select
                        {...register('backhand_rubber_model')}
                        id="backhand_rubber_model"
                        onChange={(e) => {
                          const isCustomModel = e.target.value === 'other';
                          setShowCustomBackhandRubberModel(isCustomModel);
                          if (!isCustomModel) {
                            setValue('custom_backhand_rubber_model', '');
                          }
                        }}
                        className={`${inputStyles} ${inputNormalStyles}`}
                      >
                        <option value="">Seleccionar modelo</option>
                        {rubberBackModelOptions.options.map((model) => (
                          <option key={model} value={model}>
                            {model}
                          </option>
                        ))}
                        <option value="other" className="bg-amber-50 text-amber-800 font-bold">
                          🎯 ¿Tu modelo no está aquí? ¡Agrégalo al listado!
                        </option>
                      </select>
                      <p className="text-xs text-gray-600 font-medium">
                        Modelos populares para backhand
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="backhand_rubber_type" className={labelStyles}>Tipo</label>
                      <select
                        {...register('backhand_rubber_type')}
                        id="backhand_rubber_type"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      >
                        <option value="">Seleccionar tipo</option>
                        {RUBBER_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="backhand_rubber_color" className={labelStyles}>Color</label>
                      <select
                        {...register('backhand_rubber_color')}
                        id="backhand_rubber_color"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      >
                        <option value="">Seleccionar color</option>
                        {RUBBER_COLORS.map((color) => (
                          <option key={color} value={color}>
                            {color.charAt(0).toUpperCase() + color.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="backhand_rubber_sponge" className={labelStyles}>Esponja</label>
                      <select
                        {...register('backhand_rubber_sponge')}
                        id="backhand_rubber_sponge"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      >
                        <option value="">Seleccionar esponja</option>
                        {SPONGE_THICKNESSES.map((thickness) => (
                          <option key={thickness} value={thickness}>
                            {thickness === 'sin esponja' ? thickness : `${thickness} mm`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="backhand_rubber_hardness" className={labelStyles}>Hardness</label>
                      <select
                        {...register('backhand_rubber_hardness')}
                        id="backhand_rubber_hardness"
                        onChange={(e) => {
                          const isCustom = e.target.value === 'other';
                          setShowCustomBackhandHardness(isCustom);
                          if (!isCustom) {
                            setValue('custom_backhand_rubber_hardness', '');
                          }
                        }}
                        className={`${inputStyles} ${inputNormalStyles}`}
                      >
                        <option value="">Seleccionar hardness</option>
                        {backhandHardnessOptions.options.map((hardness) => (
                          <option key={hardness} value={hardness}>
                            {hardness}
                          </option>
                        ))}
                        <option value="other" className="bg-amber-50 text-amber-800 font-bold">
                          💎 ¿Tu hardness no está aquí? ¡Agrégalo al listado!
                        </option>
                      </select>
                      <p className="text-xs text-gray-600 font-medium">
                        Incluye N/A si no conoces la dureza
                      </p>
                    </div>
                  </div>

                  {/* Campo personalizado para marca */}
                  {showCustomBackhandRubberBrand && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl shadow-sm"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-amber-100 rounded-full p-2">
                          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-amber-800">
                            🏷️ Agregar Marca de Caucho Back
                          </h4>
                          <p className="text-amber-700 text-sm font-medium">
                            Escribe la marca de tu caucho back y agrégala para que otros también puedan seleccionarla
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <input
                          {...register('custom_backhand_rubber_brand')}
                          type="text"
                          placeholder="Escribe la marca de tu caucho back"
                          className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 font-bold placeholder-amber-600 bg-white"
                        />
                        <CustomFieldValidator
                          fieldType="brand"
                          value={watch('custom_backhand_rubber_brand') || ''}
                          onValidationResult={(result) => handleValidationResult('brand', result)}
                          onSuggestionAccepted={(value) => handleSuggestionAccepted('custom_backhand_rubber_brand', value)}
                          onFieldAdded={handleFieldAdded}
                          isVisible={showCustomBackhandRubberBrand}
                          currentOptions={rubberBackBrandOptions.options}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Campo personalizado para modelo */}
                  {showCustomBackhandRubberModel && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-sm"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-green-100 rounded-full p-2">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-green-800">
                            🎯 Agregar Modelo de Caucho Back
                          </h4>
                          <p className="text-green-700 text-sm font-medium">
                            Escribe el modelo de tu caucho back y agrégalo para que otros también puedan seleccionarlo
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <input
                          {...register('custom_backhand_rubber_model')}
                          type="text"
                          placeholder="Escribe el modelo de tu caucho back"
                          className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 font-bold placeholder-green-600 bg-white"
                        />
                        <CustomFieldValidator
                          fieldType="backhand_rubber_model"
                          value={watch('custom_backhand_rubber_model') || ''}
                          onValidationResult={(result) => handleValidationResult('backhandRubberModel', result)}
                          onSuggestionAccepted={(value) => handleSuggestionAccepted('custom_backhand_rubber_model', value)}
                          onFieldAdded={handleFieldAdded}
                          isVisible={showCustomBackhandRubberModel}
                          currentOptions={rubberBackModelOptions.options}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Campo personalizado para hardness del back */}
                  {showCustomBackhandHardness && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl shadow-sm"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-purple-100 rounded-full p-2">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-purple-800">
                            💎 Agregar Hardness Back
                          </h4>
                          <p className="text-purple-700 text-sm font-medium">
                            Escribe el hardness de tu caucho back y agrégalo para que otros también puedan seleccionarlo
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <input
                          {...register('custom_backhand_rubber_hardness')}
                          type="text"
                          placeholder="Ej: h41, Medium-Soft, 38°, etc."
                          className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 font-bold placeholder-purple-600 bg-white"
                        />
                        <CustomFieldValidator
                          fieldType="backhand_rubber_hardness"
                          value={watch('custom_backhand_rubber_hardness') || ''}
                          onValidationResult={(result) => handleValidationResult('backhandRubberHardness', result)}
                          onSuggestionAccepted={(value) => handleSuggestionAccepted('custom_backhand_rubber_hardness', value)}
                          onFieldAdded={handleFieldAdded}
                          isVisible={showCustomBackhandHardness}
                          currentOptions={backhandHardnessOptions.options}
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Información adicional */}
                <div className="space-y-6">
                  <h3 className={sectionTitleStyles}>
                    Información Adicional
                  </h3>
                  
                  <div className="space-y-2">
                    <label htmlFor="notes" className={labelStyles}>Notas adicionales</label>
                    <textarea
                      {...register('notes')}
                      id="notes"
                      rows={4}
                      className={`${inputStyles} ${inputNormalStyles}`}
                      placeholder="Escribe cualquier nota sobre tu juego, experiencia o preferencias"
                    />
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </AuthLayout>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default RegistroRapidoClient;

