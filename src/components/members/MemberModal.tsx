import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Member, Club } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';

const memberSchema = z.object({
  // Basic information
  club_id: z.number().min(1, 'Debe seleccionar un club'),
  first_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  last_name: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  doc_id: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  birth_date: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  status: z.enum(['active', 'inactive']),
  
  // Location information
  country: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  
  // Playing style information
  dominant_hand: z.enum(['right', 'left']).optional(),
  playing_side: z.enum(['derecho', 'zurdo']).optional(),
  playing_style: z.enum(['clasico', 'lapicero']).optional(),
  
  // Racket information
  racket_brand: z.string().optional(),
  racket_model: z.string().optional(),
  racket_custom_brand: z.string().optional(),
  racket_custom_model: z.string().optional(),
  
  // Drive rubber information
  drive_rubber_brand: z.string().optional(),
  drive_rubber_model: z.string().optional(),
  drive_rubber_type: z.enum(['liso', 'pupo_largo', 'pupo_corto', 'antitopsping']).optional(),
  drive_rubber_color: z.enum(['negro', 'rojo', 'verde', 'azul', 'amarillo', 'morado', 'fucsia']).optional(),
  drive_rubber_sponge: z.string().optional(),
  drive_rubber_hardness: z.string().optional(),
  drive_rubber_custom_brand: z.string().optional(),
  drive_rubber_custom_model: z.string().optional(),
  
  // Backhand rubber information
  backhand_rubber_brand: z.string().optional(),
  backhand_rubber_model: z.string().optional(),
  backhand_rubber_type: z.enum(['liso', 'pupo_largo', 'pupo_corto', 'antitopsping']).optional(),
  backhand_rubber_color: z.enum(['negro', 'rojo', 'verde', 'azul', 'amarillo', 'morado', 'fucsia']).optional(),
  backhand_rubber_sponge: z.string().optional(),
  backhand_rubber_hardness: z.string().optional(),
  backhand_rubber_custom_brand: z.string().optional(),
  backhand_rubber_custom_model: z.string().optional(),
  
  // Additional information
  notes: z.string().optional(),
  ranking_position: z.number().optional(),
  ranking_last_updated: z.string().optional(),
});

type MemberFormValues = z.infer<typeof memberSchema>;

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MemberFormValues, photo?: File) => Promise<void>;
  member?: Member | null;
  clubs: Club[];
  isSubmitting?: boolean;
}

// Updated constants with corrected values
const RUBBER_TYPES = [
  { value: 'liso', label: 'Liso' },
  { value: 'pupo_largo', label: 'Pupo Largo' },
  { value: 'pupo_corto', label: 'Pupo Corto' },
  { value: 'antitopsping', label: 'Antitopsping' }
];

const SPONGE_THICKNESSES = ['0,5', '0,7', '1,5', '1,6', '1,8', '1,9', '2', '2,1', '2,2', 'sin esponja'];

const POPULAR_BRANDS = [
  'Andro', 'Avalox', 'Butterfly', 'Cornilleau', 'DHS', 'Donic', 'Double Fish', 
  'Dr. Neubauer', 'Friendship', 'Gewo', 'Hurricane', 'Joola', 'Killerspin', 
  'Nittaku', 'Palio', 'Sanwei', 'Saviga', 'Stiga', 'TSP', 
  'Tibhar', 'Victas', 'Xiom', 'Yasaka', 'Yinhe'
];

const RUBBER_COLORS = ['negro', 'rojo', 'verde', 'azul', 'amarillo', 'morado', 'fucsia'];
const HARDNESS_LEVELS = ['h42', 'h44', 'h46', 'h48', 'h50'];

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

const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  member,
  clubs: initialClubs,
  isSubmitting = false
}) => {
  const { user } = useAuth();
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [availableClubs, setAvailableClubs] = useState<Club[]>(initialClubs);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const totalSteps = 5;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      status: 'active',
      country: 'Ecuador',
    },
  });

  const watchedProvince = watch('province');
  const watchedClubId = watch('club_id');
  const selectedProvince = ECUADOR_PROVINCES.find(p => p.name === watchedProvince);
  const selectedClub = availableClubs.find(club => club.id === watchedClubId);

  // Fetch all available clubs when modal opens
  useEffect(() => {
    const fetchAvailableClubs = async () => {
      if (!isOpen) return;
      
      try {
        setLoadingClubs(true);
        const response = await api.get('/api/members/available-clubs');
        setAvailableClubs(response.data.data || []);
      } catch (error) {
        console.error('Error fetching available clubs:', error);
        // Fallback to initial clubs if API fails
        setAvailableClubs(initialClubs);
      } finally {
        setLoadingClubs(false);
      }
    };

    fetchAvailableClubs();
  }, [isOpen, initialClubs]);

  useEffect(() => {
    if (member) {
      reset({
        club_id: member.club_id,
        first_name: member.first_name || '',
        last_name: member.last_name || '',
        doc_id: member.doc_id || '',
        email: member.email || '',
        phone: member.phone || '',
        birth_date: member.birth_date || '',
        gender: member.gender as 'male' | 'female' | 'other' | undefined,
        status: member.status as 'active' | 'inactive',
        country: member.country || 'Ecuador',
        province: member.province || '',
        city: member.city || '',
        dominant_hand: member.dominant_hand as 'right' | 'left' | undefined,
        playing_side: member.playing_side as 'derecho' | 'zurdo' | undefined,
        playing_style: member.playing_style as 'clasico' | 'lapicero' | undefined,
        racket_brand: member.racket_brand || '',
        racket_model: member.racket_model || '',
        racket_custom_brand: member.racket_custom_brand || '',
        racket_custom_model: member.racket_custom_model || '',
        drive_rubber_brand: member.drive_rubber_brand || '',
        drive_rubber_model: member.drive_rubber_model || '',
        drive_rubber_type: member.drive_rubber_type as 'liso' | 'pupo_largo' | 'pupo_corto' | 'antitopsping' | undefined,
        drive_rubber_color: member.drive_rubber_color as 'negro' | 'rojo' | 'verde' | 'azul' | 'amarillo' | 'morado' | 'fucsia' | undefined,
        drive_rubber_sponge: member.drive_rubber_sponge || '',
        drive_rubber_hardness: member.drive_rubber_hardness || '',
        drive_rubber_custom_brand: member.drive_rubber_custom_brand || '',
        drive_rubber_custom_model: member.drive_rubber_custom_model || '',
        backhand_rubber_brand: member.backhand_rubber_brand || '',
        backhand_rubber_model: member.backhand_rubber_model || '',
        backhand_rubber_type: member.backhand_rubber_type as 'liso' | 'pupo_largo' | 'pupo_corto' | 'antitopsping' | undefined,
        backhand_rubber_color: member.backhand_rubber_color as 'negro' | 'rojo' | 'verde' | 'azul' | 'amarillo' | 'morado' | 'fucsia' | undefined,
        backhand_rubber_sponge: member.backhand_rubber_sponge || '',
        backhand_rubber_hardness: member.backhand_rubber_hardness || '',
        backhand_rubber_custom_brand: member.backhand_rubber_custom_brand || '',
        backhand_rubber_custom_model: member.backhand_rubber_custom_model || '',
        notes: member.notes || '',
        ranking_position: member.ranking_position || undefined,
        ranking_last_updated: member.ranking_last_updated || '',
      });

      if (member.photo_path) {
        setPhotoPreview(`/storage/${member.photo_path}`);
      }
    } else {
      reset({
        status: 'active',
        country: 'Ecuador',
      });
      setPhotoPreview(null);
    }
    setCurrentStep(1);
  }, [member, reset]);

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

  const handleFormSubmit = async (data: MemberFormValues) => {
    await onSubmit(data, selectedPhoto || undefined);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const inputStyles = "w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 font-medium placeholder-gray-500 bg-white hover:border-gray-400";
  const inputErrorStyles = "border-red-400 bg-red-50 text-red-900 placeholder-red-500";
  const inputNormalStyles = "border-gray-300";
  const labelStyles = "block text-sm font-bold text-gray-800 mb-2";
  const sectionTitleStyles = "text-xl font-bold text-gray-900 border-b-2 border-blue-300 pb-3 mb-6";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {member ? 'Editar Miembro' : 'Crear Nuevo Miembro'}
              </h2>
              <p className="text-blue-100 mt-1">
                Paso {currentStep} de {totalSteps}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 bg-blue-800 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className={sectionTitleStyles}>Información Personal</h3>
                
                {/* Photo Upload */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    {photoPreview ? (
                      <img
                        className="h-32 w-32 object-cover rounded-full border-4 border-gray-300"
                        src={photoPreview}
                        alt="Foto preview"
                      />
                    ) : (
                      <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                        <svg className="h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="first_name" className={labelStyles}>
                      Nombres <span className="text-red-600">*</span>
                    </label>
                    <input
                      {...register('first_name')}
                      type="text"
                      id="first_name"
                      placeholder="Juan Carlos"
                      className={`${inputStyles} ${errors.first_name ? inputErrorStyles : inputNormalStyles}`}
                    />
                    {errors.first_name && (
                      <p className="text-sm text-red-700 font-medium">{errors.first_name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="last_name" className={labelStyles}>
                      Apellidos <span className="text-red-600">*</span>
                    </label>
                    <input
                      {...register('last_name')}
                      type="text"
                      id="last_name"
                      placeholder="Pérez González"
                      className={`${inputStyles} ${errors.last_name ? inputErrorStyles : inputNormalStyles}`}
                    />
                    {errors.last_name && (
                      <p className="text-sm text-red-700 font-medium">{errors.last_name.message}</p>
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
                      placeholder="1234567890"
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
                    <label htmlFor="gender" className={labelStyles}>Género</label>
                    <select
                      {...register('gender')}
                      id="gender"
                      className={`${inputStyles} ${inputNormalStyles}`}
                    >
                      <option value="">Seleccionar</option>
                      <option value="male">Masculino</option>
                      <option value="female">Femenino</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className={labelStyles}>Email</label>
                    <input
                      {...register('email')}
                      type="email"
                      id="email"
                      placeholder="juan@email.com"
                      className={`${inputStyles} ${errors.email ? inputErrorStyles : inputNormalStyles}`}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-700 font-medium">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className={labelStyles}>Teléfono</label>
                    <input
                      {...register('phone')}
                      type="tel"
                      id="phone"
                      placeholder="0999123456"
                      className={`${inputStyles} ${inputNormalStyles}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="club_id" className={labelStyles}>
                      Club <span className="text-red-600">*</span>
                    </label>
                    {loadingClubs ? (
                      <div className="flex items-center justify-center py-3 px-4 rounded-xl border border-gray-200 bg-gray-50">
                        <svg className="animate-spin h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-gray-500">Cargando clubes...</span>
                      </div>
                    ) : (
                      <select
                        {...register('club_id', { valueAsNumber: true })}
                        id="club_id"
                        className={`${inputStyles} ${errors.club_id ? inputErrorStyles : inputNormalStyles}`}
                      >
                        <option value="">Seleccionar club</option>
                        {availableClubs.map((club) => (
                          <option key={club.id} value={club.id}>
                            {club.name} {club.league?.name ? `- ${club.league.name}` : ''} {club.city ? `(${club.city})` : ''}
                          </option>
                        ))}
                      </select>
                    )}
                    {errors.club_id && (
                      <p className="text-sm text-red-700 font-medium">{errors.club_id.message}</p>
                    )}
                    {selectedClub && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 text-sm text-blue-800">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                          </svg>
                          <span className="font-medium">Club seleccionado:</span>
                        </div>
                        <div className="mt-1 text-sm text-blue-700">
                          <p className="font-semibold">{selectedClub.name}</p>
                          {selectedClub.league && (
                            <p>Liga: {selectedClub.league.name}</p>
                          )}
                          {selectedClub.city && selectedClub.province && (
                            <p>Ubicación: {selectedClub.city}, {selectedClub.province}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="status" className={labelStyles}>Estado</label>
                    <select
                      {...register('status')}
                      id="status"
                      className={`${inputStyles} ${inputNormalStyles}`}
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className={sectionTitleStyles}>Ubicación</h3>
                
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
                    <label htmlFor="province" className={labelStyles}>Provincia</label>
                    <select
                      {...register('province')}
                      id="province"
                      className={`${inputStyles} ${inputNormalStyles}`}
                    >
                      <option value="">Seleccionar provincia</option>
                      {ECUADOR_PROVINCES.map((province) => (
                        <option key={province.name} value={province.name}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="city" className={labelStyles}>Ciudad</label>
                    <select
                      {...register('city')}
                      id="city"
                      disabled={!selectedProvince}
                      className={`${inputStyles} ${inputNormalStyles} ${!selectedProvince ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                    >
                      <option value="">Seleccionar ciudad</option>
                      {selectedProvince?.cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Playing Style */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className={sectionTitleStyles}>Estilo de Juego</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="dominant_hand" className={labelStyles}>Mano Dominante</label>
                    <select
                      {...register('dominant_hand')}
                      id="dominant_hand"
                      className={`${inputStyles} ${inputNormalStyles}`}
                    >
                      <option value="">Seleccionar</option>
                      <option value="right">Derecha</option>
                      <option value="left">Izquierda</option>
                    </select>
                  </div>

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
                    <label htmlFor="playing_style" className={labelStyles}>Estilo de Juego</label>
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

                {/* Racket Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">
                    Información de la Raqueta
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="racket_brand" className={labelStyles}>Marca</label>
                      <select
                        {...register('racket_brand')}
                        id="racket_brand"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      >
                        <option value="">Seleccionar marca</option>
                        {POPULAR_BRANDS.map((brand) => (
                          <option key={brand} value={brand}>
                            {brand}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="racket_model" className={labelStyles}>Modelo</label>
                      <input
                        {...register('racket_model')}
                        type="text"
                        id="racket_model"
                        placeholder="Ej: Viscaria, Timo Boll ALC"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="racket_custom_brand" className={labelStyles}>Marca Personalizada</label>
                      <input
                        {...register('racket_custom_brand')}
                        type="text"
                        id="racket_custom_brand"
                        placeholder="Otra marca no listada"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="racket_custom_model" className={labelStyles}>Modelo Personalizado</label>
                      <input
                        {...register('racket_custom_model')}
                        type="text"
                        id="racket_custom_model"
                        placeholder="Modelo específico"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Drive Rubber */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className={sectionTitleStyles}>Caucho del Drive</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="drive_rubber_brand" className={labelStyles}>Marca</label>
                    <select
                      {...register('drive_rubber_brand')}
                      id="drive_rubber_brand"
                      className={`${inputStyles} ${inputNormalStyles}`}
                    >
                      <option value="">Seleccionar marca</option>
                      {POPULAR_BRANDS.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="drive_rubber_model" className={labelStyles}>Modelo</label>
                    <input
                      {...register('drive_rubber_model')}
                      type="text"
                      id="drive_rubber_model"
                      placeholder="Ej: Tenergy 05, Hurricane 3"
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="drive_rubber_custom_brand" className={labelStyles}>Marca Personalizada</label>
                    <input
                      {...register('drive_rubber_custom_brand')}
                      type="text"
                      id="drive_rubber_custom_brand"
                      placeholder="Otra marca no listada"
                      className={`${inputStyles} ${inputNormalStyles}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="drive_rubber_custom_model" className={labelStyles}>Modelo Personalizado</label>
                    <input
                      {...register('drive_rubber_custom_model')}
                      type="text"
                      id="drive_rubber_custom_model"
                      placeholder="Modelo específico"
                      className={`${inputStyles} ${inputNormalStyles}`}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Backhand Rubber & Additional Info */}
            {currentStep === 5 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className={sectionTitleStyles}>Caucho del Revés</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="backhand_rubber_brand" className={labelStyles}>Marca</label>
                    <select
                      {...register('backhand_rubber_brand')}
                      id="backhand_rubber_brand"
                      className={`${inputStyles} ${inputNormalStyles}`}
                    >
                      <option value="">Seleccionar marca</option>
                      {POPULAR_BRANDS.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="backhand_rubber_model" className={labelStyles}>Modelo</label>
                    <input
                      {...register('backhand_rubber_model')}
                      type="text"
                      id="backhand_rubber_model"
                      placeholder="Ej: Tenergy 64, Dignics 05"
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="backhand_rubber_custom_brand" className={labelStyles}>Marca Personalizada</label>
                    <input
                      {...register('backhand_rubber_custom_brand')}
                      type="text"
                      id="backhand_rubber_custom_brand"
                      placeholder="Otra marca no listada"
                      className={`${inputStyles} ${inputNormalStyles}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="backhand_rubber_custom_model" className={labelStyles}>Modelo Personalizado</label>
                    <input
                      {...register('backhand_rubber_custom_model')}
                      type="text"
                      id="backhand_rubber_custom_model"
                      placeholder="Modelo específico"
                      className={`${inputStyles} ${inputNormalStyles}`}
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4 mt-8">
                  <h4 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">
                    Información Adicional
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="ranking_position" className={labelStyles}>Posición en Ranking</label>
                      <input
                        {...register('ranking_position', { valueAsNumber: true })}
                        type="number"
                        id="ranking_position"
                        placeholder="Ej: 15"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="ranking_last_updated" className={labelStyles}>Última Actualización de Ranking</label>
                      <input
                        {...register('ranking_last_updated')}
                        type="date"
                        id="ranking_last_updated"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="notes" className={labelStyles}>Notas</label>
                    <textarea
                      {...register('notes')}
                      id="notes"
                      rows={4}
                      placeholder="Información adicional sobre el miembro..."
                      className={`${inputStyles} ${inputNormalStyles} resize-none`}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Anterior
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit(handleFormSubmit)}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {member ? 'Actualizar Miembro' : 'Crear Miembro'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MemberModal;
