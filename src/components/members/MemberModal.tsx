'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Member, Club } from '@/types';
import Modal from '@/components/ui/Modal';
import { useEffect, useState } from 'react';

const memberSchema = z.object({
  // Basic information
  club_id: z.number().min(1, 'Por favor selecciona un club'),
  first_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  last_name: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  doc_id: z.string().optional(),
  email: z.string().email('Por favor ingresa un email válido').optional().or(z.literal('')),
  phone: z.string().optional(),
  birth_date: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  
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
  drive_rubber_type: z.enum(['liso', 'pupo_largo', 'pupo_corto', 'antitopspin']).optional(),
  drive_rubber_color: z.enum(['negro', 'rojo', 'verde', 'azul', 'amarillo', 'morado', 'fucsia']).optional(),
  drive_rubber_sponge: z.string().optional(),
  drive_rubber_hardness: z.string().optional(),
  drive_rubber_custom_brand: z.string().optional(),
  drive_rubber_custom_model: z.string().optional(),
  
  // Backhand rubber information
  backhand_rubber_brand: z.string().optional(),
  backhand_rubber_model: z.string().optional(),
  backhand_rubber_type: z.enum(['liso', 'pupo_largo', 'pupo_corto', 'antitopspin']).optional(),
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

const STEP_TITLES = [
  'Información Personal',
  'Ubicación',
  'Estilo de Juego',
  'Raqueta',
  'Goma Drive',
  'Goma Backhand',
  'Información Adicional'
];

const RUBBER_COLORS = ['negro', 'rojo', 'verde', 'azul', 'amarillo', 'morado', 'fucsia'];
const RUBBER_TYPES = [
  { value: 'liso', label: 'Liso' },
  { value: 'pupo_largo', label: 'Pupo Largo' },
  { value: 'pupo_corto', label: 'Pupo Corto' },
  { value: 'antitopspin', label: 'Antitopspin' }
];
const SPONGE_THICKNESSES = ['0.5', '0.7', '1.5', '1.6', '1.8', '1.9', '2', '2.1', '2.2', 'sin esponja'];
const HARDNESS_LEVELS = ['h42', 'h44', 'h46', 'h48', 'h50', 'n/a'];
const POPULAR_BRANDS = ['Butterfly', 'DHS', 'Sanwei', 'Nittaku', 'Yasaka', 'Stiga', 'Victas', 'Joola', 'Xiom', 'Saviga', 'Friendship', 'Dr. Neubauer'];

const ECUADOR_PROVINCES = [
  { name: 'Guayas', cities: ['Guayaquil', 'Milagro', 'Buena Fe'] },
  { name: 'Pichincha', cities: ['Quito'] },
  { name: 'Manabí', cities: ['Manta', 'Portoviejo'] },
  { name: 'Azuay', cities: ['Cuenca'] },
  { name: 'Tungurahua', cities: ['Ambato'] },
  { name: 'Los Ríos', cities: ['Quevedo', 'Urdaneta'] },
  { name: 'Santa Elena', cities: ['La Libertad'] },
  { name: 'Galápagos', cities: ['Puerto Ayora'] },
];

const TT_CLUBS_ECUADOR = [
  { name: 'PPH Cuenca', city: 'Cuenca', province: 'Azuay', federation: 'Fede Guayas' },
  { name: 'Ping Pro', city: 'Guayaquil', province: 'Guayas', federation: 'Fede Guayas' },
  { name: 'Billy Team', city: 'Guayaquil', province: 'Guayas', federation: 'Fede Guayas' },
  { name: 'Independiente', city: 'Guayaquil', province: 'Guayas', federation: 'Fede Guayas' },
  { name: 'BackSpin', city: 'Guayaquil', province: 'Guayas', federation: 'Fede Guayas' },
  { name: 'Spin Factor', city: 'Portoviejo', province: 'Manabí', federation: 'Fede - Manabí' },
  { name: 'Spin Zone', city: 'Ambato', province: 'Tungurahua', federation: 'Fede Tungurahua' },
  { name: 'TM - Manta', city: 'Manta', province: 'Manabí', federation: 'Fede - Manabí' },
  { name: 'Primorac', city: 'Quito', province: 'Pichincha', federation: 'Fede Pichincha' },
  { name: 'TT Quevedo', city: 'Quevedo', province: 'Los Ríos', federation: 'Fede Los Ríos' },
  { name: 'Fede Santa Elena', city: 'La Libertad', province: 'Santa Elena', federation: 'Fede Santa Elena' },
  { name: 'Ranking Uartes', city: 'Puerto Ayora', province: 'Galápagos', federation: 'Fede Galápagos' },
  { name: 'Guayaquil City', city: 'Guayaquil', province: 'Guayas', federation: 'Fede Guayas' },
  { name: 'Buena Fe', city: 'Buena Fe', province: 'Guayas', federation: 'Fede Guayas' },
  { name: 'Milagro', city: 'Milagro', province: 'Guayas', federation: 'Fede Guayas' },
  { name: 'Ping Pong Rick', city: 'Guayaquil', province: 'Guayas', federation: 'Fede Guayas' },
  { name: 'Ranking Liga 593', city: 'Guayaquil', province: 'Guayas', federation: 'LATEM' },
];

export default function MemberModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  member, 
  clubs,
  isSubmitting = false 
}: MemberModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showCustomRacketBrand, setShowCustomRacketBrand] = useState(false);
  const [showCustomDriveRubber, setShowCustomDriveRubber] = useState(false);
  const [showCustomBackhandRubber, setShowCustomBackhandRubber] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      club_id: member?.club_id || (clubs.length === 1 ? clubs[0].id : 0),
      first_name: member?.first_name || '',
      last_name: member?.last_name || '',
      doc_id: member?.doc_id || '',
      email: member?.email || '',
      phone: member?.phone || '',
      birth_date: member?.birth_date || '',
      gender: member?.gender || undefined,
      status: member?.status || 'active',
      country: member?.country || 'Ecuador',
      province: member?.province || '',
      city: member?.city || '',
      dominant_hand: member?.dominant_hand || undefined,
      playing_side: member?.playing_side || undefined,
      playing_style: member?.playing_style || undefined,
    },
  });

  const watchedProvince = watch('province');

  // Auto-select club if only one is available
  useEffect(() => {
    if (clubs.length === 1 && !member) {
      setValue('club_id', clubs[0].id);
    }
  }, [clubs, member, setValue]);

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

  // Remove photo
  const removePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    const fileInput = document.getElementById('photo') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleFormSubmit = async (data: MemberFormValues) => {
    // Clean up empty strings
    const cleanData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        value === '' ? undefined : value
      ])
    ) as MemberFormValues;
    
    try {
      await onSubmit(cleanData, selectedPhoto || undefined);
      reset();
      setCurrentStep(0);
      setSelectedPhoto(null);
      setPhotoPreview(null);
    } catch (error) {
      console.error('Error in handleFormSubmit:', error);
    }
  };

  const handleClose = () => {
    reset();
    setCurrentStep(0);
    setShowCustomRacketBrand(false);
    setShowCustomDriveRubber(false);
    setShowCustomBackhandRubber(false);
    setSelectedPhoto(null);
    setPhotoPreview(null);
    onClose();
  };

  const nextStep = () => {
    if (currentStep < STEP_TITLES.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentClub = clubs.length === 1 ? clubs[0] : null;
  const selectedProvince = ECUADOR_PROVINCES.find(p => p.name === watchedProvince);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Información Personal
        return (
          <div className="space-y-6">
            {/* Photo Upload Section */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Foto del Jugador</label>
              <div className="flex items-center space-x-6">
                <div className="shrink-0">
                  {photoPreview || member?.photo_path ? (
                    <img
                      className="h-20 w-20 object-cover rounded-full border-2 border-gray-300"
                      src={photoPreview || (member?.photo_path ? `/storage/${member.photo_path}` : '')}
                      alt="Vista previa"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <label
                      htmlFor="photo"
                      className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer"
                    >
                      {photoPreview || member?.photo_path ? 'Cambiar foto' : 'Subir foto'}
                    </label>
                    <input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="sr-only"
                    />
                    {(photoPreview || member?.photo_path) && (
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="bg-red-100 py-2 px-3 border border-red-300 rounded-md shadow-sm text-sm leading-4 font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                </div>
              </div>
            </div>

            {/* Club Field - Hidden if only one club */}
            {clubs.length > 1 ? (
              <div className="space-y-2">
                <label htmlFor="club_id" className="block text-sm font-medium text-gray-700">
                  Club <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  {...register('club_id', { valueAsNumber: true })}
                  id="club_id"
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-gray-900 ${
                    errors.club_id ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <option value={0}>Selecciona un club</option>
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name} {club.league?.name && `- ${club.league.name}`}
                    </option>
                  ))}
                </select>
                {errors.club_id && (
                  <p className="text-sm text-red-600">{errors.club_id.message}</p>
                )}
              </div>
            ) : currentClub ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-900">Agregando miembro a:</p>
                    <p className="text-lg font-semibold text-green-800">{currentClub.name}</p>
                    {currentClub.league?.name && (
                      <p className="text-sm text-green-600">Liga: {currentClub.league.name}</p>
                    )}
                  </div>
                </div>
                <input type="hidden" {...register('club_id', { valueAsNumber: true })} />
              </div>
            ) : null}

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                  Nombre <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  {...register('first_name')}
                  type="text"
                  id="first_name"
                  placeholder="Luis Abelardo"
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-gray-900 placeholder-gray-500 ${
                    errors.first_name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                />
                {errors.first_name && (
                  <p className="text-sm text-red-600">{errors.first_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                  Apellido <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  {...register('last_name')}
                  type="text"
                  id="last_name"
                  placeholder="Vale Zurita"
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-gray-900 placeholder-gray-500 ${
                    errors.last_name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                />
                {errors.last_name && (
                  <p className="text-sm text-red-600">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  placeholder="correo@hotmail.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 text-gray-900 placeholder-gray-500"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Celular</label>
                <input
                  {...register('phone')}
                  type="tel"
                  id="phone"
                  placeholder="994818999"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="doc_id" className="block text-sm font-medium text-gray-700">Cédula</label>
                <input
                  {...register('doc_id')}
                  type="text"
                  id="doc_id"
                  placeholder="913909999"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 text-gray-900 placeholder-gray-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                <input
                  {...register('birth_date')}
                  type="date"
                  id="birth_date"
                  max="1970-08-10"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Sexo</label>
                <select
                  {...register('gender')}
                  id="gender"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 text-gray-900"
                >
                  <option value="">Seleccionar</option>
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                </select>
              </div>
            </div>

            {/* Status Field */}
            <div className="space-y-2">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
              <select
                {...register('status')}
                id="status"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 text-gray-900"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          </div>
        );

      case 1: // Ubicación
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">País</label>
              <input
                {...register('country')}
                type="text"
                id="country"
                defaultValue="Ecuador"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 text-gray-900"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="province" className="block text-sm font-medium text-gray-700">Provincia</label>
                <select
                  {...register('province')}
                  id="province"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 text-gray-900"
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
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">Ciudad</label>
                <select
                  {...register('city')}
                  id="city"
                  disabled={!selectedProvince}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 text-gray-900 disabled:bg-gray-100"
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

            {/* Reference clubs info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Clubes de Tenis de Mesa en Ecuador</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>593 Liga Amateur de Tenis de Mesa (LATEM)</strong></p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {TT_CLUBS_ECUADOR.slice(0, 8).map((club) => (
                    <div key={club.name} className="text-xs">
                      <span className="font-medium">{club.name}</span> - {club.city}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-blue-600 mt-2">Y más clubes en todo Ecuador...</p>
              </div>
            </div>
          </div>
        );

      case 2: // Estilo de Juego
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="dominant_hand" className="block text-sm font-medium text-gray-700">Mano Dominante</label>
                <select
                  {...register('dominant_hand')}
                  id="dominant_hand"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 text-gray-900"
                >
                  <option value="">Seleccionar</option>
                  <option value="right">Derecha (Right Hand)</option>
                  <option value="left">Izquierda (Left Hand)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="playing_side" className="block text-sm font-medium text-gray-700">Lado de Juego</label>
                <select
                  {...register('playing_side')}
                  id="playing_side"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 text-gray-900"
                >
                  <option value="">Seleccionar</option>
                  <option value="derecho">Derecho</option>
                  <option value="zurdo">Zurdo</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="playing_style" className="block text-sm font-medium text-gray-700">Tipo de Juego</label>
                <select
                  {...register('playing_style')}
                  id="playing_style"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 text-gray-900"
                >
                  <option value="">Seleccionar</option>
                  <option value="clasico">Clásico</option>
                  <option value="lapicero">Lapicero</option>
                </select>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h4 className="text-sm font-medium text-yellow-900 mb-2">Información sobre Estilos de Juego</h4>
              <div className="text-xs text-yellow-700 space-y-1">
                <p><strong>Clásico:</strong> Estilo tradicional con empuñadura europea</p>
                <p><strong>Lapicero:</strong> Estilo asiático con empuñadura tipo lapicero</p>
              </div>
            </div>
          </div>
        );

      case 3: // Raqueta
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="mr-2">🏓</span>
              Raqueta - Palo
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="racket_brand" className="block text-sm font-medium text-gray-700">Marca</label>
                <select
                  {...register('racket_brand')}
                  id="racket_brand"
                  onChange={(e) => {
                    setShowCustomRacketBrand(e.target.value === 'custom');
                    if (e.target.value !== 'custom') {
                      setValue('racket_custom_brand', '');
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 text-gray-900"
                >
                  <option value="">Seleccionar marca</option>
                  {POPULAR_BRANDS.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                  <option value="custom">🔧 Otra marca (personalizada)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="racket_model" className="block text-sm font-medium text-gray-700">Modelo</label>
                <input
                  {...register('racket_model')}
                  type="text"
                  id="racket_model"
                  placeholder="ej: 5L carbono+"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 text-gray-900 placeholder-gray-500"
                />
              </div>

              {showCustomRacketBrand && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="racket_custom_brand" className="block text-sm font-medium text-gray-700">Marca Personalizada</label>
                    <input
                      {...register('racket_custom_brand')}
                      type="text"
                      id="racket_custom_brand"
                      placeholder="Ingresa la marca"
                      className="w-full px-4 py-3 rounded-xl border border-yellow-300 bg-yellow-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 hover:border-yellow-400 text-gray-900 placeholder-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="racket_custom_model" className="block text-sm font-medium text-gray-700">Modelo Personalizado</label>
                    <input
                      {...register('racket_custom_model')}
                      type="text"
                      id="racket_custom_model"
                      placeholder="Ingresa el modelo"
                      className="w-full px-4 py-3 rounded-xl border border-yellow-300 bg-yellow-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 hover:border-yellow-400 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="text-sm font-medium text-green-900 mb-2">💡 Marcas Populares</h4>
              <div className="grid grid-cols-3 gap-2 text-xs text-green-700">
                <div><strong>Sanwei:</strong> 5L carbono+</div>
                <div><strong>Butterfly:</strong> Viscaria</div>
                <div><strong>DHS:</strong> Hurricane Long</div>
              </div>
            </div>
          </div>
        );

      case 4: // Goma Drive
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="mr-2">🔴</span>
              Caucho del Drive
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="drive_rubber_brand" className="block text-sm font-medium text-gray-700">Marca</label>
                <select
                  {...register('drive_rubber_brand')}
                  id="drive_rubber_brand"
                  onChange={(e) => {
                    setShowCustomDriveRubber(e.target.value === 'custom');
                    if (e.target.value !== 'custom') {
                      setValue('drive_rubber_custom_brand', '');
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 text-gray-900"
                >
                  <option value="">Seleccionar marca</option>
                  {POPULAR_BRANDS.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                  <option value="custom">🔧 Otra marca (personalizada)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="drive_rubber_model" className="block text-sm font-medium text-gray-700">Modelo</label>
                <input
                  {...register('drive_rubber_model')}
                  type="text"
                  id="drive_rubber_model"
                  placeholder="ej: Cross 729"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 text-gray-900 placeholder-gray-500"
                />
              </div>

              {showCustomDriveRubber && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="drive_rubber_custom_brand" className="block text-sm font-medium text-gray-700">Marca Personalizada</label>
                    <input
                      {...register('drive_rubber_custom_brand')}
                      type="text"
                      id="drive_rubber_custom_brand"
                      placeholder="Ingresa la marca"
                      className="w-full px-4 py-3 rounded-xl border border-yellow-300 bg-yellow-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 hover:border-yellow-400 text-gray-900 placeholder-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="drive_rubber_custom_model" className="block text-sm font-medium text-gray-700">Modelo Personalizado</label>
                    <input
                      {...register('drive_rubber_custom_model')}
                      type="text"
                      id="drive_rubber_custom_model"
                      placeholder="Ingresa el modelo"
                      className="w-full px-4 py-3 rounded-xl border border-yellow-300 bg-yellow-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 hover:border-yellow-400 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label htmlFor="drive_rubber_type" className="block text-sm font-medium text-gray-700">Tipo</label>
                <select
                  {...register('drive_rubber_type')}
                  id="drive_rubber_type"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 text-gray-900"
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
                <label htmlFor="drive_rubber_color" className="block text-sm font-medium text-gray-700">Color</label>
                <select
                  {...register('drive_rubber_color')}
                  id="drive_rubber_color"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 text-gray-900"
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
                <label htmlFor="drive_rubber_sponge" className="block text-sm font-medium text-gray-700">Esponja</label>
                <select
                  {...register('drive_rubber_sponge')}
                  id="drive_rubber_sponge"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 text-gray-900"
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
                <label htmlFor="drive_rubber_hardness" className="block text-sm font-medium text-gray-700">Hardness</label>
                <select
                  {...register('drive_rubber_hardness')}
                  id="drive_rubber_hardness"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 text-gray-900"
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

            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h4 className="text-sm font-medium text-red-900 mb-2">Ejemplo: Friendship Cross 729</h4>
              <div className="text-xs text-red-700 space-y-1">
                <p><strong>Tipo:</strong> Liso | <strong>Color:</strong> Negro | <strong>Esponja:</strong> 2.1mm | <strong>Hardness:</strong> h42</p>
              </div>
            </div>
          </div>
        );

      case 5: // Goma Backhand
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="mr-2">⚫</span>
              Caucho del Backhand
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="backhand_rubber_brand" className="block text-sm font-medium text-gray-700">Marca</label>
                <select
                  {...register('backhand_rubber_brand')}
                  id="backhand_rubber_brand"
                  onChange={(e) => {
                    setShowCustomBackhandRubber(e.target.value === 'custom');
                    if (e.target.value !== 'custom') {
                      setValue('backhand_rubber_custom_brand', '');
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 text-gray-900"
                >
                  <option value="">Seleccionar marca</option>
                  {POPULAR_BRANDS.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                  <option value="custom">🔧 Otra marca (personalizada)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="backhand_rubber_model" className="block text-sm font-medium text-gray-700">Modelo</label>
                <input
                  {...register('backhand_rubber_model')}
                  type="text"
                  id="backhand_rubber_model"
                  placeholder="ej: Vpupo"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 text-gray-900 placeholder-gray-500"
                />
              </div>

              {showCustomBackhandRubber && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="backhand_rubber_custom_brand" className="block text-sm font-medium text-gray-700">Marca Personalizada</label>
                    <input
                      {...register('backhand_rubber_custom_brand')}
                      type="text"
                      id="backhand_rubber_custom_brand"
                      placeholder="Ingresa la marca"
                      className="w-full px-4 py-3 rounded-xl border border-yellow-300 bg-yellow-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 hover:border-yellow-400 text-gray-900 placeholder-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="backhand_rubber_custom_model" className="block text-sm font-medium text-gray-700">Modelo Personalizado</label>
                    <input
                      {...register('backhand_rubber_custom_model')}
                      type="text"
                      id="backhand_rubber_custom_model"
                      placeholder="Ingresa el modelo"
                      className="w-full px-4 py-3 rounded-xl border border-yellow-300 bg-yellow-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 hover:border-yellow-400 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label htmlFor="backhand_rubber_type" className="block text-sm font-medium text-gray-700">Tipo</label>
                <select
                  {...register('backhand_rubber_type')}
                  id="backhand_rubber_type"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 text-gray-900"
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
                <label htmlFor="backhand_rubber_color" className="block text-sm font-medium text-gray-700">Color</label>
                <select
                  {...register('backhand_rubber_color')}
                  id="backhand_rubber_color"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 text-gray-900"
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
                <label htmlFor="backhand_rubber_sponge" className="block text-sm font-medium text-gray-700">Esponja</label>
                <select
                  {...register('backhand_rubber_sponge')}
                  id="backhand_rubber_sponge"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 text-gray-900"
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
                <label htmlFor="backhand_rubber_hardness" className="block text-sm font-medium text-gray-700">Hardness</label>
                <select
                  {...register('backhand_rubber_hardness')}
                  id="backhand_rubber_hardness"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 text-gray-900"
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

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Ejemplo: Saviga Vpupo</h4>
              <div className="text-xs text-gray-700 space-y-1">
                <p><strong>Tipo:</strong> Pupo Largo | <strong>Color:</strong> Rojo | <strong>Esponja:</strong> 0.5mm | <strong>Hardness:</strong> n/a</p>
              </div>
            </div>
          </div>
        );

      case 6: // Información Adicional
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="mr-2">📊</span>
              Información Adicional
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="ranking_position" className="block text-sm font-medium text-gray-700">Ranking</label>
                <input
                  {...register('ranking_position', { valueAsNumber: true })}
                  type="number"
                  id="ranking_position"
                  placeholder="Posición en ranking"
                  min="1"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 text-gray-900 placeholder-gray-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="ranking_last_updated" className="block text-sm font-medium text-gray-700">Última Actualización Ranking</label>
                <input
                  {...register('ranking_last_updated')}
                  type="date"
                  id="ranking_last_updated"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 text-gray-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notas Adicionales</label>
              <textarea
                {...register('notes')}
                id="notes"
                rows={4}
                placeholder="Información adicional sobre el jugador... (ej: Estilo de juego especial, logros, observaciones)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 text-gray-900 placeholder-gray-500 resize-none"
              />
            </div>

            {/* Ranking Information */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <h4 className="text-sm font-medium text-purple-900 mb-2">📈 Información sobre Ranking</h4>
              <div className="text-xs text-purple-700 space-y-1">
                <p><strong>Gráfico de movimiento de ranking por jugador:</strong></p>
                <p>• Después de 6 meses se puede cambiar de club</p>
                <p>• Estado de cuenta del jugador ranking</p>
                <p>• Ranking Liga 593 - LATEM (Liga Amateur de Tenis de Mesa)</p>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">✅</span>
                Resumen del Censo de Miembro
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre:</span>
                    <span className="font-medium">{watch('first_name')} {watch('last_name')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cédula:</span>
                    <span className="font-medium">{watch('doc_id') || 'No especificada'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{watch('email') || 'No especificado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ubicación:</span>
                    <span className="font-medium">{watch('city')}, {watch('province')}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Raqueta:</span>
                    <span className="font-medium">{watch('racket_brand')} {watch('racket_model')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Drive:</span>
                    <span className="font-medium">{watch('drive_rubber_brand')} {watch('drive_rubber_model')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Backhand:</span>
                    <span className="font-medium">{watch('backhand_rubber_brand')} {watch('backhand_rubber_model')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estilo:</span>
                    <span className="font-medium">{watch('playing_style')} - {watch('dominant_hand')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={member ? 'Editar Miembro' : 'Nuevo Miembro - Censo Completo'}
      size="xl"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {STEP_TITLES[currentStep]}
            </h2>
            <span className="text-sm text-gray-500">
              Paso {currentStep + 1} de {STEP_TITLES.length}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / STEP_TITLES.length) * 100}%` }}
            />
          </div>
          
          {/* Step Indicators */}
          <div className="flex justify-between mt-3">
            {STEP_TITLES.map((title, index) => (
              <div
                key={index}
                className={`flex flex-col items-center transition-all duration-300 ${
                  index <= currentStep ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                    index < currentStep
                      ? 'bg-green-600 text-white'
                      : index === currentStep
                      ? 'bg-green-500 text-white ring-4 ring-green-200'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {index < currentStep ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-xs mt-1 text-center max-w-16 truncate">
                  {title.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[500px]">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20"
            >
              Cancelar
            </button>
            
            {currentStep > 0 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Anterior
              </button>
            )}
          </div>

          <div className="flex gap-3">
            {currentStep < STEP_TITLES.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 flex items-center gap-2"
              >
                Siguiente
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 flex items-center gap-2"
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
      </form>
    </Modal>
  );
}
