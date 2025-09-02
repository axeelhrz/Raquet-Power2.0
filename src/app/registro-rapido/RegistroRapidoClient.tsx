'use client';

import React, { useState } from 'react';
import { useForm, UseFormRegister, UseFormSetValue } from 'react-hook-form';
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
import CustomFieldValidator from '@/components/ui/CustomFieldValidator';
import { validateCustomField, debounce, type FieldType, type ValidationResult } from '@/utils/customFieldValidation';

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
  
  // Club (sin federación)
  club_name: z.string().optional(),
  custom_club_name: z.string().optional(),
  
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
      'El Carmen', 'Flavio Alfaro', 'Jama', 'Jaramijó', 'Jipijapa', 'Junín', 
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
  'Nittaku', 'Palio', 'Sanwei', 'Saviga', 'Stiga', 'Tibhar', 'TSP', 
  'Victas', 'Xiom', 'Yinhe', 'Yasaka'
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

// ACTUALIZADO: Modelos populares de caucho drive
const POPULAR_DRIVE_MODELS = [
  'Acuda Blue P1', 'Acuda Blue P3', 'Battle 2', 'Big Dipper', 'Cross 729', 
  'Dignics 05', 'Dignics 09C', 'Evolution MX-P', 'Evolution MX-S', 
  'Focus 3', 'Friendship 802-40', 'Hexer HD', 'Hexer Powergrip', 
  'Hurricane 3', 'Hurricane 8', 'Omega VII Euro', 'Omega VII Pro', 
  'Rakza 7', 'Rakza 9', 'Rhyzer 48', 'Rhyzer 50', 'Rozena', 
  'Skyline 3', 'Target Pro GT-H47', 'Target Pro GT-M43', 'Tenergy 05', 
  'Tenergy 64', 'Tenergy 80', 'V > 15 Extra', 'V > 20 Double Extra'
];

// ACTUALIZADO: Modelos populares de caucho back
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
}

const RegistroRapidoClient: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registrationCode, setRegistrationCode] = useState('');
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showCustomRacketBrand, setShowCustomRacketBrand] = useState(false);
  const [showCustomRacketModel, setShowCustomRacketModel] = useState(false);
  const [showCustomDriveRubberBrand, setShowCustomDriveRubberBrand] = useState(false);
  const [showCustomDriveRubberModel, setShowCustomDriveRubberModel] = useState(false);
  const [showCustomBackhandRubberBrand, setShowCustomBackhandRubberBrand] = useState(false);
  const [showCustomBackhandRubberModel, setShowCustomBackhandRubberModel] = useState(false);
  const [showCustomClub, setShowCustomClub] = useState(false);
  const [showCustomDriveHardness, setShowCustomDriveHardness] = useState(false);
  const [showCustomBackhandHardness, setShowCustomBackhandHardness] = useState(false);
  
  // ACTUALIZADO: Estados de validación con marcas compartidas
  const [validationStates, setValidationStates] = useState<ValidationStates>({
    brand: null,  // Una sola validación para todas las marcas
    racketModel: null,
    driveRubberModel: null,
    backhandRubberModel: null,
    driveRubberHardness: null,
    backhandRubberHardness: null,
  });
  
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegistroRapidoFormValues>({
    resolver: zodResolver(registroRapidoSchema),
    defaultValues: {
      country: 'Ecuador',
    },
  });

  const watchedProvince = watch('province');
  const selectedProvince = ECUADOR_PROVINCES.find(p => p.name === watchedProvince);

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
    } else {
      return;
    }
    
    setValidationStates(prev => ({
      ...prev,
      [validationField]: null
    }));
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
      if (data.club_name === 'custom' && data.custom_club_name) {
        formData.set('club_name', data.custom_club_name);
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
        club: data.custom_club_name || data.club_name || 'Sin club especificado'
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
        if (status === 422) {
          const data = error.response?.data as unknown;
          const { errors, message } = (data ?? {}) as { errors?: Record<string, string[] | string>; message?: string };
          if (errors && 'email' in errors) {
            alert('Este email ya está registrado en el censo.');
          } else if (errors && 'photo' in errors) {
            const photoErrors = errors['photo'];
            const first = Array.isArray(photoErrors) ? photoErrors[0] : String(photoErrors ?? '');
            alert('Error con la foto: ' + first);
          } else {
            alert('Error de validación: ' + (message || 'Por favor revisa los datos ingresados.'));
          }
        } else if (status === 500) {
          alert('Error interno del servidor. Por favor intenta de nuevo más tarde.');
        } else {
          alert('Error al registrarse. Por favor intenta de nuevo.');
        }
      } else {
        alert('Error al registrarse. Por favor intenta de nuevo.');
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
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
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        preventDuplicate
        dense
        autoHideDuration={4000}
      >
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={itemVariants}>
              <AuthHeader
                title="Censo de Tenis de Mesa"
                subtitle="593 Liga Amateur de Tenis de Mesa (LATEM)"
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a2 2 0 00-2 2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        </svg>
                      </div>
                    )}
                    <label
                      htmlFor="photo"
                      className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-3 cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
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
                        placeholder="Luis"
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
                        placeholder="Abelardo"
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
                        placeholder="Vale"
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
                        placeholder="Zurita"
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
                        placeholder="913909999"
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
                        placeholder="994818999"
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
                  
                  {/* NUEVO CAMPO: Liga */}
                  <div className="space-y-2">
                    <label htmlFor="league" className={labelStyles}>
                      Liga
                    </label>
                    <select
                      {...register('league')}
                      id="league"
                      className={`${inputStyles} ${inputNormalStyles}`}
                    >
                      <option value="">Seleccionar liga</option>
                      <option value="593LATM">593LATM</option>
                    </select>
                    <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Por el momento solo está disponible la liga 593LATM</span>
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="club_name" className={labelStyles}>Club</label>
                    <select
                      {...register('club_name')}
                      id="club_name"
                      onChange={(e) => {
                        setShowCustomClub(e.target.value === 'custom');
                        if (e.target.value !== 'custom') {
                          setValue('custom_club_name', '');
                        }
                      }}
                      className={`${inputStyles} ${inputNormalStyles}`}
                    >
                      <option value="">Seleccionar club</option>
                      {TT_CLUBS_ECUADOR.map((club) => (
                        <option key={club} value={club}>
                          {club}
                        </option>
                      ))}
                      <option value="custom" className="bg-amber-50 text-amber-800 font-bold">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          ¿Tu club no está aquí? ¡Agrégalo!
                        </div>
                      </option>
                    </select>
                  </div>

                  {/* Campo personalizado para club */}
                  {showCustomClub && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-xl p-4"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10" />
                        </svg>
                        <h4 className="text-amber-800 font-bold text-sm">Club Personalizado</h4>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-amber-800">
                          Nombre del Club <span className="text-red-600">*</span>
                        </label>
                        <input
                          {...register('custom_club_name')}
                          type="text"
                          placeholder="Ej: Club Deportivo Los Campeones"
                          className="w-full px-4 py-3 rounded-xl border-2 border-amber-400 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 hover:border-amber-500 text-gray-900 font-bold placeholder-amber-600"
                        />
                        <p className="text-xs text-amber-700 font-medium">
                          Ingresa el nombre completo de tu club
                        </p>
                      </div>
                    </motion.div>
                  )}

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

                {/* Raqueta - Palo - ACTUALIZADO: Opciones independientes para marca y modelo */}
                <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
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
                    {/* Campo de Marca con opción personalizada independiente */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-800 mb-1">Marca</label>
                      <select
                        {...register('racket_brand')}
                        onChange={(e) => {
                          const isCustom = e.target.value === 'custom';
                          setShowCustomRacketBrand(isCustom);
                          if (!isCustom) {
                            setValue('custom_racket_brand', '');
                          }
                        }}
                        className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 font-bold placeholder-gray-600 bg-white hover:border-gray-400 border-gray-300"
                      >
                        <option value="">Seleccionar marca</option>
                        {POPULAR_BRANDS.map((brand) => (
                          <option key={brand} value={brand}>
                            {brand}
                          </option>
                        ))}
                        <option value="custom" className="bg-amber-50 text-amber-800 font-bold">
                          ¿Tu marca no está aquí? ¡Agrégala!
                        </option>
                      </select>
                      <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Marcas populares de raquetas de tenis de mesa</span>
                      </p>
                    </div>

                    {/* Campo de Modelo con opción personalizada independiente */}
                    <div className="space-y-2">
                      <label htmlFor="racket_model" className={labelStyles}>Modelo</label>
                      <select
                        {...register('racket_model')}
                        id="racket_model"
                        onChange={(e) => {
                          const isCustomModel = e.target.value === 'custom_model';
                          setShowCustomRacketModel(isCustomModel);
                          if (!isCustomModel) {
                            setValue('custom_racket_model', '');
                          }
                        }}
                        className={`${inputStyles} ${inputNormalStyles}`}
                      >
                        <option value="">Seleccionar modelo</option>
                        {POPULAR_RACKET_MODELS.map((model) => (
                          <option key={model} value={model}>
                            {model}
                          </option>
                        ))}
                        <option value="custom_model" className="bg-amber-50 text-amber-800 font-bold">
                          ¿Tu modelo no está aquí? ¡Agrégalo!
                        </option>
                      </select>
                      <p className="text-xs text-gray-600 font-medium">
                        Modelos populares de raquetas
                      </p>
                    </div>

                    {/* Campo personalizado para marca */}
                    {showCustomRacketBrand && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg"
                      >
                        <h4 className="text-lg font-semibold text-amber-800 mb-3">
                          Marca Personalizada de Raqueta
                        </h4>
                        <div className="space-y-3">
                          <input
                            {...register('custom_racket_brand')}
                            type="text"
                            placeholder="Escribe la marca de tu raqueta"
                            className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 font-bold placeholder-amber-600"
                          />
                          <CustomFieldValidator
                            fieldType="brand"
                            value={watch('custom_racket_brand') || ''}
                            onValidationResult={(result) => handleValidationResult('brand', result)}
                            onSuggestionAccepted={(value) => handleSuggestionAccepted('custom_racket_brand', value)}
                            isVisible={showCustomRacketBrand}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Campo personalizado para modelo */}
                    {showCustomRacketModel && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg"
                      >
                        <h4 className="text-lg font-semibold text-green-800 mb-3">
                          Modelo Personalizado de Raqueta
                        </h4>
                        <div className="space-y-3">
                          <input
                            {...register('custom_racket_model')}
                            type="text"
                            placeholder="Escribe el modelo de tu raqueta"
                            className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 font-bold placeholder-green-600"
                          />
                          <CustomFieldValidator
                            fieldType="racket_model"
                            value={watch('custom_racket_model') || ''}
                            onValidationResult={(result) => handleValidationResult('racketModel', result)}
                            onSuggestionAccepted={(value) => handleSuggestionAccepted('custom_racket_model', value)}
                            isVisible={showCustomRacketModel}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

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
                          const isCustom = e.target.value === 'custom';
                          setShowCustomDriveRubberBrand(isCustom);
                          if (!isCustom) {
                            setValue('custom_drive_rubber_brand', '');
                          }
                        }}
                        className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 font-bold placeholder-gray-600 bg-white hover:border-gray-400 border-gray-300"
                      >
                        <option value="">Seleccionar marca</option>
                        {POPULAR_BRANDS.map((brand) => (
                          <option key={brand} value={brand}>
                            {brand}
                          </option>
                        ))}
                        <option value="custom" className="bg-amber-50 text-amber-800 font-bold">
                          ¿Tu marca no está aquí? ¡Agrégala!
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
                          const isCustomModel = e.target.value === 'custom_model';
                          setShowCustomDriveRubberModel(isCustomModel);
                          if (!isCustomModel) {
                            setValue('custom_drive_rubber_model', '');
                          }
                        }}
                        className={`${inputStyles} ${inputNormalStyles}`}
                      >
                        <option value="">Seleccionar modelo</option>
                        {POPULAR_DRIVE_MODELS.map((model) => (
                          <option key={model} value={model}>
                            {model}
                          </option>
                        ))}
                        <option value="custom_model" className="bg-amber-50 text-amber-800 font-bold">
                          ¿Tu modelo no está aquí? ¡Agrégalo!
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
                          const isCustom = e.target.value === 'custom';
                          setShowCustomDriveHardness(isCustom);
                          if (!isCustom) {
                            setValue('custom_drive_rubber_hardness', '');
                          }
                        }}
                        className={`${inputStyles} ${inputNormalStyles}`}
                      >
                        <option value="">Seleccionar hardness</option>
                        {HARDNESS_LEVELS.map((hardness) => (
                          <option key={hardness} value={hardness}>
                            {hardness}
                          </option>
                        ))}
                        <option value="custom" className="bg-amber-50 text-amber-800 font-bold">
                          ¿Tu hardness no está aquí? ¡Escríbelo!
                        </option>
                      </select>
                      <p className="text-xs text-gray-600 font-medium">
                        Incluye N/A si no conoces la dureza
                      </p>
                    </div>

                    {/* Campo personalizado para marca */}
                    {showCustomDriveRubberBrand && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg col-span-full"
                      >
                        <h4 className="text-lg font-semibold text-amber-800 mb-3">
                          Marca Personalizada de Caucho Drive
                        </h4>
                        <div className="space-y-3">
                          <input
                            {...register('custom_drive_rubber_brand')}
                            type="text"
                            placeholder="Escribe la marca de tu caucho drive"
                            className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 font-bold placeholder-amber-600"
                          />
                          <CustomFieldValidator
                            fieldType="brand"
                            value={watch('custom_drive_rubber_brand') || ''}
                            onValidationResult={(result) => handleValidationResult('brand', result)}
                            onSuggestionAccepted={(value) => handleSuggestionAccepted('custom_drive_rubber_brand', value)}
                            isVisible={showCustomDriveRubberBrand}
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
                        className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg col-span-full"
                      >
                        <h4 className="text-lg font-semibold text-green-800 mb-3">
                          Modelo Personalizado de Caucho Drive
                        </h4>
                        <div className="space-y-3">
                          <input
                            {...register('custom_drive_rubber_model')}
                            type="text"
                            placeholder="Escribe el modelo de tu caucho drive"
                            className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 font-bold placeholder-green-600"
                          />
                          <CustomFieldValidator
                            fieldType="drive_rubber_model"
                            value={watch('custom_drive_rubber_model') || ''}
                            onValidationResult={(result) => handleValidationResult('driveRubberModel', result)}
                            onSuggestionAccepted={(value) => handleSuggestionAccepted('custom_drive_rubber_model', value)}
                            isVisible={showCustomDriveRubberModel}
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
                        className="mt-4 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg col-span-full"
                      >
                        <h4 className="text-lg font-semibold text-purple-800 mb-3">
                          Hardness Personalizado - Drive
                        </h4>
                        <div className="space-y-3">
                          <input
                            {...register('custom_drive_rubber_hardness')}
                            type="text"
                            placeholder="Ej: h41, Medium-Soft, 38°, etc."
                            className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 font-bold placeholder-purple-600"
                          />
                          <CustomFieldValidator
                            fieldType="drive_rubber_hardness"
                            value={watch('custom_drive_rubber_hardness') || ''}
                            onValidationResult={(result) => handleValidationResult('driveRubberHardness', result)}
                            onSuggestionAccepted={(value) => handleSuggestionAccepted('custom_drive_rubber_hardness', value)}
                            isVisible={showCustomDriveHardness}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
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
                          const isCustom = e.target.value === 'custom';
                          setShowCustomBackhandRubberBrand(isCustom);
                          if (!isCustom) {
                            setValue('custom_backhand_rubber_brand', '');
                          }
                        }}
                        className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 font-bold placeholder-gray-600 bg-white hover:border-gray-400 border-gray-300"
                      >
                        <option value="">Seleccionar marca</option>
                        {POPULAR_BRANDS.map((brand) => (
                          <option key={brand} value={brand}>
                            {brand}
                          </option>
                        ))}
                        <option value="custom" className="bg-amber-50 text-amber-800 font-bold">
                          ¿Tu marca no está aquí? ¡Agrégala!
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
                          const isCustomModel = e.target.value === 'custom_model';
                          setShowCustomBackhandRubberModel(isCustomModel);
                          if (!isCustomModel) {
                            setValue('custom_backhand_rubber_model', '');
                          }
                        }}
                        className={`${inputStyles} ${inputNormalStyles}`}
                      >
                        <option value="">Seleccionar modelo</option>
                        {POPULAR_BACKHAND_MODELS.map((model) => (
                          <option key={model} value={model}>
                            {model}
                          </option>
                        ))}
                        <option value="custom_model" className="bg-amber-50 text-amber-800 font-bold">
                          ¿Tu modelo no está aquí? ¡Agrégalo!
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
                          const isCustom = e.target.value === 'custom';
                          setShowCustomBackhandHardness(isCustom);
                          if (!isCustom) {
                            setValue('custom_backhand_rubber_hardness', '');
                          }
                        }}
                        className={`${inputStyles} ${inputNormalStyles}`}
                      >
                        <option value="">Seleccionar hardness</option>
                        {HARDNESS_LEVELS.map((hardness) => (
                          <option key={hardness} value={hardness}>
                            {hardness}
                          </option>
                        ))}
                        <option value="custom" className="bg-amber-50 text-amber-800 font-bold">
                          ¿Tu hardness no está aquí? ¡Escríbelo!
                        </option>
                      </select>
                      <p className="text-xs text-gray-600 font-medium">
                        Incluye N/A si no conoces la dureza
                      </p>
                    </div>

                    {/* Campo personalizado para marca */}
                    {showCustomBackhandRubberBrand && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg col-span-full"
                      >
                        <h4 className="text-lg font-semibold text-amber-800 mb-3">
                          Marca Personalizada de Caucho Back
                        </h4>
                        <div className="space-y-3">
                          <input
                            {...register('custom_backhand_rubber_brand')}
                            type="text"
                            placeholder="Escribe la marca de tu caucho back"
                            className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 font-bold placeholder-amber-600"
                          />
                          <CustomFieldValidator
                            fieldType="brand"
                            value={watch('custom_backhand_rubber_brand') || ''}
                            onValidationResult={(result) => handleValidationResult('brand', result)}
                            onSuggestionAccepted={(value) => handleSuggestionAccepted('custom_backhand_rubber_brand', value)}
                            isVisible={showCustomBackhandRubberBrand}
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
                        className="mt-4 p-4 bg-cyan-50 border-2 border-cyan-200 rounded-lg col-span-full"
                      >
                        <h4 className="text-lg font-semibold text-cyan-800 mb-3">
                          Modelo Personalizado de Caucho Back
                        </h4>
                        <div className="space-y-3">
                          <input
                            {...register('custom_backhand_rubber_model')}
                            type="text"
                            placeholder="Escribe el modelo de tu caucho back"
                            className="w-full px-4 py-3 border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 font-bold placeholder-cyan-600"
                          />
                          <CustomFieldValidator
                            fieldType="backhand_rubber_model"
                            value={watch('custom_backhand_rubber_model') || ''}
                            onValidationResult={(result) => handleValidationResult('backhandRubberModel', result)}
                            onSuggestionAccepted={(value) => handleSuggestionAccepted('custom_backhand_rubber_model', value)}
                            isVisible={showCustomBackhandRubberModel}
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
                        className="mt-4 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg col-span-full"
                      >
                        <h4 className="text-lg font-semibold text-purple-800 mb-3">
                          Hardness Personalizado - Back
                        </h4>
                        <div className="space-y-3">
                          <input
                            {...register('custom_backhand_rubber_hardness')}
                            type="text"
                            placeholder="Ej: h41, Medium-Soft, 38°, etc."
                            className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 font-bold placeholder-purple-600"
                          />
                          <CustomFieldValidator
                            fieldType="backhand_rubber_hardness"
                            value={watch('custom_backhand_rubber_hardness') || ''}
                            onValidationResult={(result) => handleValidationResult('backhandRubberHardness', result)}
                            onSuggestionAccepted={(value) => handleSuggestionAccepted('custom_backhand_rubber_hardness', value)}
                            isVisible={showCustomBackhandHardness}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Información adicional */}
                <div className="space-y-6">
                  <h3 className={sectionTitleStyles}>
                    Información Adicional
                  </h3>
                  
                  <div className="space-y-2">
                    <label htmlFor="notes" className={labelStyles}>Notas</label>
                    <textarea
                      {...register('notes')}
                      id="notes"
                      rows={4}
                      placeholder="Información adicional que consideres relevante..."
                      className={`${inputStyles} ${inputNormalStyles} resize-none`}
                    />
                    <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>Espacio opcional para cualquier información adicional</span>
                    </p>
                  </div>
                </div>

                {/* Botón de envío */}
                <div className="pt-6 border-t border-gray-200">
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 ${
                      isSubmitting
                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-3">
                        <svg className="animate-spin h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Confirmar Registro
                      </div>
                    )}
                  </motion.button>
                  
                  <p className="text-center text-sm text-gray-600 font-medium mt-4 flex items-center justify-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Tu información está segura y será utilizada únicamente para el censo de tenis de mesa
                  </p>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default RegistroRapidoClient;
