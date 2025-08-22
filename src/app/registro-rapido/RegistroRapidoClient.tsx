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
import authTheme from '@/theme/authTheme';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthHeader from '@/components/auth/AuthHeader';
import CustomBrandHelper from '@/components/ui/CustomBrandHelper';
import axios from '@/lib/axios';
import { isAxiosError } from 'axios';

const registroRapidoSchema = z.object({
  // Información personal básica
  first_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  last_name: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  doc_id: z.string().optional(),
  email: z.string().email('Por favor ingresa un email válido'),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  birth_date: z.string().optional(),
  gender: z.enum(['masculino', 'femenino']).optional(),
  
  // Ubicación
  country: z.string().optional(),
  province: z.string().min(1, 'Por favor selecciona una provincia'),
  city: z.string().min(1, 'Por favor selecciona una ciudad'),
  
  // Club y federación
  club_name: z.string().optional(),
  federation: z.string().optional(),
  
  // Estilo de juego
  playing_side: z.enum(['derecho', 'zurdo']).optional(),
  playing_style: z.enum(['clasico', 'lapicero']).optional(),
  
  // Raqueta - palo
  racket_brand: z.string().optional(),
  racket_model: z.string().optional(),
  racket_custom_brand: z.string().optional(),
  racket_custom_model: z.string().optional(),
  
  // Caucho del drive
  drive_rubber_brand: z.string().optional(),
  drive_rubber_model: z.string().optional(),
  drive_rubber_type: z.enum(['liso', 'pupo_largo', 'pupo_corto', 'antitopspin']).optional(),
  drive_rubber_color: z.enum(['negro', 'rojo', 'verde', 'azul', 'amarillo', 'morado', 'fucsia']).optional(),
  drive_rubber_sponge: z.string().optional(),
  drive_rubber_hardness: z.string().optional(),
  drive_rubber_custom_brand: z.string().optional(),
  drive_rubber_custom_model: z.string().optional(),
  
  // Caucho del back
  backhand_rubber_brand: z.string().optional(),
  backhand_rubber_model: z.string().optional(),
  backhand_rubber_type: z.enum(['liso', 'pupo_largo', 'pupo_corto', 'antitopspin']).optional(),
  backhand_rubber_color: z.enum(['negro', 'rojo', 'verde', 'azul', 'amarillo', 'morado', 'fucsia']).optional(),
  backhand_rubber_sponge: z.string().optional(),
  backhand_rubber_hardness: z.string().optional(),
  backhand_rubber_custom_brand: z.string().optional(),
  backhand_rubber_custom_model: z.string().optional(),
  
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

const TT_CLUBS_ECUADOR = [
  { name: 'PPH Cuenca', federation: 'Fede Guayas' },
  { name: 'Ping Pro', federation: 'Fede Guayas' },
  { name: 'Billy Team', federation: 'Fede Guayas' },
  { name: 'Independiente', federation: 'Fede Guayas' },
  { name: 'BackSpin', federation: 'Fede Guayas' },
  { name: 'Spin Factor', federation: 'Fede - Manabí' },
  { name: 'Spin Zone', federation: 'Fede Tungurahua' },
  { name: 'TM - Manta', federation: 'Fede - Manabí' },
  { name: 'Primorac', federation: 'Fede Pichincha' },
  { name: 'TT Quevedo', federation: 'Fede Los Ríos' },
  { name: 'Fede Santa Elena', federation: 'Fede Santa Elena' },
  { name: 'Ranking Uartes', federation: 'Fede Galápagos' },
  { name: 'Guayaquil City', federation: 'Fede Guayas' },
  { name: 'Buena Fe', federation: 'Fede Guayas' },
  { name: 'Milagro', federation: 'Fede Guayas' },
  { name: 'Ping Pong Rick', federation: 'Fede Guayas' },
  { name: 'Ranking Liga 593', federation: 'LATEM' },
];

const POPULAR_BRANDS = [
  'Butterfly', 'DHS', 'Sanwei', 'Nittaku', 'Yasaka', 'Stiga', 
  'Victas', 'Joola', 'Xiom', 'Saviga', 'Friendship', 'Dr. Neubauer', 'Double Fish'
];

const RUBBER_COLORS = ['negro', 'rojo', 'verde', 'azul', 'amarillo', 'morado', 'fucsia'];
const RUBBER_TYPES = [
  { value: 'liso', label: 'Liso' },
  { value: 'pupo_largo', label: 'Pupo Largo' },
  { value: 'pupo_corto', label: 'Pupo Corto' },
  { value: 'antitopspin', label: 'Antitopspin' }
];
const HARDNESS_LEVELS = ['h42', 'h44', 'h46', 'h48', 'h50'];
const SPONGE_THICKNESSES = ['sin esponja', '1.0', '1.5', '1.8', '2.0', 'max'];

// Tipos fuertes para los campos de marcas/modelos
type BrandFieldName = 'racket_brand' | 'drive_rubber_brand' | 'backhand_rubber_brand';
type CustomBrandFieldName = 'racket_custom_brand' | 'drive_rubber_custom_brand' | 'backhand_rubber_custom_brand';
type CustomModelFieldName = 'racket_custom_model' | 'drive_rubber_custom_model' | 'backhand_rubber_custom_model';
// Componente para campos personalizados mejorado
const CustomBrandFields: React.FC<{
  show: boolean;
  brandFieldName: CustomBrandFieldName;
  modelFieldName: CustomModelFieldName;
  register: UseFormRegister<RegistroRapidoFormValues>;
  brandLabel?: string;
  modelLabel?: string;
  brandPlaceholder?: string;
  modelPlaceholder?: string;
  type?: 'racket' | 'rubber';
}> = ({ 
  show, 
  brandFieldName, 
  modelFieldName, 
  register, 
  brandLabel = "Marca Personalizada",
  modelLabel = "Modelo Personalizado",
  brandPlaceholder = "Ej: Tibhar, Andro, Gewo",
  modelPlaceholder = "Ej: Evolution MX-P, Hexer",
  type = 'rubber'
}) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="col-span-full"
    >
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h4 className="text-amber-800 font-bold text-sm">Marca Personalizada</h4>
          </div>
          <CustomBrandHelper type={type} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-amber-800">
              {brandLabel} <span className="text-red-600">*</span>
            </label>
            <input
              {...register(brandFieldName)}
              type="text"
              placeholder={brandPlaceholder}
              className="w-full px-4 py-3 rounded-xl border-2 border-amber-400 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 hover:border-amber-500 text-gray-900 font-semibold placeholder-amber-600"
            />
            <p className="text-xs text-amber-700 font-medium">
              Ingresa cualquier marca que no esté en la lista
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-amber-800">
              {modelLabel}
            </label>
            <input
              {...register(modelFieldName)}
              type="text"
              placeholder={modelPlaceholder}
              className="w-full px-4 py-3 rounded-xl border-2 border-amber-400 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 hover:border-amber-500 text-gray-900 font-semibold placeholder-amber-600"
            />
            <p className="text-xs text-amber-700 font-medium">
              Modelo específico (opcional)
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Componente mejorado para selectores de marca
const BrandSelector: React.FC<{
  label: string;
  fieldName: BrandFieldName;
  register: UseFormRegister<RegistroRapidoFormValues>;
  setValue: UseFormSetValue<RegistroRapidoFormValues>;
  onCustomChange: (isCustom: boolean) => void;
  placeholder?: string;
  helpText?: string;
}> = ({ 
  label, 
  fieldName, 
  register, 
  setValue, 
  onCustomChange, 
  placeholder = "Seleccionar marca",
  helpText
}) => {
  return (
    <div className="space-y-2">
      <label className={`block text-sm font-bold text-gray-800 mb-1`}>
        {label}
      </label>
      <select
        {...register(fieldName)}
        onChange={(e) => {
          const isCustom = e.target.value === 'custom';
          onCustomChange(isCustom);
          if (!isCustom) {
            switch (fieldName) {
              case 'racket_brand':
                setValue('racket_custom_brand', '');
                setValue('racket_custom_model', '');
                break;
              case 'drive_rubber_brand':
                setValue('drive_rubber_custom_brand', '');
                setValue('drive_rubber_custom_model', '');
                break;
              case 'backhand_rubber_brand':
                setValue('backhand_rubber_custom_brand', '');
                setValue('backhand_rubber_custom_model', '');
                break;
            }
          }
        }}
        className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 font-semibold placeholder-gray-600 bg-white hover:border-gray-400 border-gray-300"
      >
        <option value="">{placeholder}</option>
        {POPULAR_BRANDS.map((brand) => (
          <option key={brand} value={brand}>
            {brand}
          </option>
        ))}
        <option value="custom" className="bg-amber-50 text-amber-800 font-bold">
          🎯 ¿Tu marca no está aquí? ¡Agrégala!
        </option>
      </select>
      {helpText && (
        <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{helpText}</span>
        </p>
      )}
    </div>
  );
};

const RegistroRapidoClient: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registrationCode, setRegistrationCode] = useState('');
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showCustomRacketBrand, setShowCustomRacketBrand] = useState(false);
  const [showCustomDriveRubber, setShowCustomDriveRubber] = useState(false);
  const [showCustomBackhandRubber, setShowCustomBackhandRubber] = useState(false);
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
  const watchedClubName = watch('club_name');
  const selectedProvince = ECUADOR_PROVINCES.find(p => p.name === watchedProvince);
  const selectedClub = TT_CLUBS_ECUADOR.find(c => c.name === watchedClubName);

  // Auto-set federation when club is selected
  React.useEffect(() => {
    if (selectedClub) {
      setValue('federation', selectedClub.federation);
    }
  }, [selectedClub, setValue]);

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

  const onSubmit = async (data: RegistroRapidoFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Add all form data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          formData.append(key, String(value));
        }
      });

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
      }

      // Send to API
      const response = await axios.post('/api/registro-rapido', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Extract registration data from response
      const responseData = response.data;
      const registrationInfo = responseData.data || responseData;
      
      // Set registration code and data
      setRegistrationCode(responseData.registration_code || registrationInfo.registration_code || '');
      setRegistrationData({
        ...registrationInfo,
        full_name: `${data.first_name} ${data.last_name}`,
        email: data.email,
        location: `${data.city}, ${data.province}`,
        club: data.club_name || 'Sin club especificado'
      });
      
      setIsSuccess(true);
    } catch (error: unknown) {
      console.error('Error en registro rápido:', error);

      if (isAxiosError(error)) {
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
  const inputStyles = "w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 font-semibold placeholder-gray-600 bg-white hover:border-gray-400";
  const inputErrorStyles = "border-red-400 bg-red-50 text-red-900 font-semibold placeholder-red-500";
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
                onClick={() => router.push('/')}
                className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 py-4 px-6 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-bold text-lg border-2 border-gray-300"
              >
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    <label
                      htmlFor="photo"
                      className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-3 cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
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
                  <p className="text-sm text-gray-600 font-medium">
                    📸 Foto opcional - Máximo 5MB (JPEG, PNG, GIF, WebP)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Puedes completar el registro sin foto y agregarla después
                  </p>
                </div>

                {/* Información Personal */}
                <div className="space-y-6">
                  <h3 className={sectionTitleStyles}>
                    Información Personal
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="first_name" className={labelStyles}>
                        Nombres <span className="text-red-600 font-bold">*</span>
                      </label>
                      <input
                        {...register('first_name')}
                        type="text"
                        id="first_name"
                        placeholder="Luis Abelardo"
                        className={`${inputStyles} ${errors.first_name ? inputErrorStyles : inputNormalStyles}`}
                      />
                      {errors.first_name && (
                        <p className="text-sm text-red-700 font-semibold">{errors.first_name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="last_name" className={labelStyles}>
                        Apellido <span className="text-red-600 font-bold">*</span>
                      </label>
                      <input
                        {...register('last_name')}
                        type="text"
                        id="last_name"
                        placeholder="Vale Zurita"
                        className={`${inputStyles} ${errors.last_name ? inputErrorStyles : inputNormalStyles}`}
                      />
                      {errors.last_name && (
                        <p className="text-sm text-red-700 font-semibold">{errors.last_name.message}</p>
                      )}
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

                {/* Club y Federación */}
                <div className="space-y-6">
                  <h3 className={sectionTitleStyles}>
                    Club y Federación
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="club_name" className={labelStyles}>Club</label>
                      <select
                        {...register('club_name')}
                        id="club_name"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      >
                        <option value="">Seleccionar club</option>
                        {TT_CLUBS_ECUADOR.map((club) => (
                          <option key={club.name} value={club.name}>
                            {club.name}
                          </option>
                        ))}
                        <option value="otro">Otro (no listado)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="federation" className={labelStyles}>Federación</label>
                      <input
                        {...register('federation')}
                        type="text"
                        id="federation"
                        placeholder="Fede Guayas"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      />
                    </div>
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

                {/* Raqueta - Palo */}
                <div className="space-y-6">
                  <h3 className={sectionTitleStyles}>
                    Raqueta - Palo
                  </h3>
                  
                  {/* Banner informativo sobre marcas personalizadas */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 rounded-full p-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-blue-900 font-bold text-sm">💡 ¿No encuentras tu marca?</h4>
                        <p className="text-blue-800 text-xs font-medium">
                          Selecciona &quot;¿Tu marca no está aquí? ¡Agrégala!&quot; para ingresar cualquier marca personalizada
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <BrandSelector
                      label="Marca"
                      fieldName="racket_brand"
                      register={register}
                      setValue={setValue}
                      onCustomChange={setShowCustomRacketBrand}
                      helpText="Marcas populares de raquetas de tenis de mesa"
                    />

                    <div className="space-y-2">
                      <label htmlFor="racket_model" className={labelStyles}>Modelo</label>
                      <input
                        {...register('racket_model')}
                        type="text"
                        id="racket_model"
                        placeholder="5L carbono+"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      />
                    </div>

                    <CustomBrandFields
                      show={showCustomRacketBrand}
                      brandFieldName="racket_custom_brand"
                      modelFieldName="racket_custom_model"
                      register={register}
                      brandLabel="Marca de Raqueta"
                      modelLabel="Modelo de Raqueta"
                      brandPlaceholder="Ej: Tibhar, Andro, Gewo"
                      modelPlaceholder="Ej: Stratus PowerWood, Ligna CO"
                      type="racket"
                    />
                  </div>
                </div>

                {/* Caucho del Drive */}
                <div className="space-y-6">
                  <h3 className={sectionTitleStyles}>
                    Caucho del Drive
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <BrandSelector
                      label="Marca"
                      fieldName="drive_rubber_brand"
                      register={register}
                      setValue={setValue}
                      onCustomChange={setShowCustomDriveRubber}
                      helpText="Marcas de cauchos más utilizadas"
                    />

                    <div className="space-y-2">
                      <label htmlFor="drive_rubber_model" className={labelStyles}>Modelo</label>
                      <input
                        {...register('drive_rubber_model')}
                        type="text"
                        id="drive_rubber_model"
                        placeholder="Cross 729"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      />
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
                            {thickness} {thickness !== 'sin esponja' && 'mm'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="drive_rubber_hardness" className={labelStyles}>Hardness</label>
                      <select
                        {...register('drive_rubber_hardness')}
                        id="drive_rubber_hardness"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      >
                        <option value="">Seleccionar hardness</option>
                        {HARDNESS_LEVELS.map((hardness) => (
                          <option key={hardness} value={hardness}>
                            {hardness}
                          </option>
                        ))}
                      </select>
                    </div>

                    <CustomBrandFields
                      show={showCustomDriveRubber}
                      brandFieldName="drive_rubber_custom_brand"
                      modelFieldName="drive_rubber_custom_model"
                      register={register}
                      brandLabel="Marca de Caucho Drive"
                      modelLabel="Modelo de Caucho Drive"
                      brandPlaceholder="Ej: Tibhar, Andro, Gewo"
                      modelPlaceholder="Ej: Evolution MX-P, Hexer"
                      type="rubber"
                    />
                  </div>
                </div>

                {/* Caucho del Back */}
                <div className="space-y-6">
                  <h3 className={sectionTitleStyles}>
                    Caucho del Back
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <BrandSelector
                      label="Marca"
                      fieldName="backhand_rubber_brand"
                      register={register}
                      setValue={setValue}
                      onCustomChange={setShowCustomBackhandRubber}
                      helpText="Marcas de cauchos para revés"
                    />

                    <div className="space-y-2">
                      <label htmlFor="backhand_rubber_model" className={labelStyles}>Modelo</label>
                      <input
                        {...register('backhand_rubber_model')}
                        type="text"
                        id="backhand_rubber_model"
                        placeholder="Cross 729"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      />
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
                            {thickness} {thickness !== 'sin esponja' && 'mm'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="backhand_rubber_hardness" className={labelStyles}>Hardness</label>
                      <select
                        {...register('backhand_rubber_hardness')}
                        id="backhand_rubber_hardness"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      >
                        <option value="">Seleccionar hardness</option>
                        {HARDNESS_LEVELS.map((hardness) => (
                          <option key={hardness} value={hardness}>
                            {hardness}
                          </option>
                        ))}
                      </select>
                    </div>

                    <CustomBrandFields
                      show={showCustomBackhandRubber}
                      brandFieldName="backhand_rubber_custom_brand"
                      modelFieldName="backhand_rubber_custom_model"
                      register={register}
                      brandLabel="Marca de Caucho Back"
                      modelLabel="Modelo de Caucho Back"
                      brandPlaceholder="Ej: Tibhar, Andro, Gewo"
                      modelPlaceholder="Ej: Grass D.TecS, Plaxon"
                      type="rubber"
                    />
                  </div>
                </div>

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
                    <p className="text-xs text-gray-600 font-medium">
                      💬 Espacio opcional para cualquier información adicional
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
                        Registrando...
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
                  
                  <p className="text-center text-sm text-gray-600 font-medium mt-4">
                    🔒 Tu información está segura y será utilizada únicamente para el censo de tenis de mesa
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