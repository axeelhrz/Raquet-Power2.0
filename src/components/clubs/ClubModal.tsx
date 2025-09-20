import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Club, League, ClubForm } from '@/types';

const clubSchema = z.object({
  // Basic information
  league_id: z.string().optional(),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  ruc: z.string().optional(),
  country: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  google_maps_url: z.string().url('URL inválida').optional().or(z.literal('')),
  description: z.string().optional(),
  founded_date: z.string().optional(),
  
  // Representative information
  representative_name: z.string().optional(),
  representative_phone: z.string().optional(),
  representative_email: z.string().email('Email inválido').optional().or(z.literal('')),
  
  // Administrator 1
  admin1_name: z.string().optional(),
  admin1_phone: z.string().optional(),
  admin1_email: z.string().email('Email inválido').optional().or(z.literal('')),
  
  // Administrator 2
  admin2_name: z.string().optional(),
  admin2_phone: z.string().optional(),
  admin2_email: z.string().email('Email inválido').optional().or(z.literal('')),
  
  // Administrator 3
  admin3_name: z.string().optional(),
  admin3_phone: z.string().optional(),
  admin3_email: z.string().email('Email inválido').optional().or(z.literal('')),
});

type ClubFormValues = z.infer<typeof clubSchema>;

export interface ClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ClubForm) => Promise<void>;
  club?: Club;
  leagues: League[];
  isSubmitting: boolean;
}

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

const ClubModal: React.FC<ClubModalProps> = ({ isOpen, onClose, onSave, club, leagues, isSubmitting }) => {
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ClubFormValues>({
    resolver: zodResolver(clubSchema),
    defaultValues: {
      league_id: '',
      name: '',
      ruc: '',
      country: 'Ecuador',
      province: '',
      city: '',
      address: '',
      google_maps_url: '',
      description: '',
      founded_date: '',
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
    },
  });

  const watchedProvince = watch('province');
  const selectedProvince = ECUADOR_PROVINCES.find(p => p.name === watchedProvince);

  // Reset form completely when modal opens/closes or club changes
  useEffect(() => {
    if (isOpen) {
      if (club) {
        // Editing existing club
        reset({
          league_id: club.league_id?.toString() || '',
          name: club.name || '',
          ruc: club.ruc || '',
          country: club.country || 'Ecuador',
          province: club.province || '',
          city: club.city || '',
          address: club.address || '',
          google_maps_url: club.google_maps_url || '',
          description: club.description || '',
          founded_date: club.founded_date || '',
          representative_name: club.representative_name || '',
          representative_phone: club.representative_phone || '',
          representative_email: club.representative_email || '',
          admin1_name: club.admin1_name || '',
          admin1_phone: club.admin1_phone || '',
          admin1_email: club.admin1_email || '',
          admin2_name: club.admin2_name || '',
          admin2_phone: club.admin2_phone || '',
          admin2_email: club.admin2_email || '',
          admin3_name: club.admin3_name || '',
          admin3_phone: club.admin3_phone || '',
          admin3_email: club.admin3_email || '',
        });
        
        if (club.logo_path) {
          setLogoPreview(`/storage/${club.logo_path}`);
        } else {
          setLogoPreview(null);
        }
      } else {
        // Creating new club - reset to default values
        reset({
          league_id: '',
          name: '',
          ruc: '',
          country: 'Ecuador',
          province: '',
          city: '',
          address: '',
          google_maps_url: '',
          description: '',
          founded_date: '',
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
        });
        setLogoPreview(null);
        setSelectedLogo(null);
      }
      setCurrentStep(1);
    }
  }, [isOpen, club, reset]);

  // Additional cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Reset form state completely when modal closes
      reset({
        league_id: '',
        name: '',
        ruc: '',
        country: 'Ecuador',
        province: '',
        city: '',
        address: '',
        google_maps_url: '',
        description: '',
        founded_date: '',
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
      });
      setLogoPreview(null);
      setSelectedLogo(null);
      setCurrentStep(1);
    }
  }, [isOpen, reset]);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedLogo(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ClubFormValues) => {
    try {
      console.log('🏢 Form data before processing:', data);
      
      // Convert the form data to ClubForm format and call the parent's onSave
      const clubFormData: ClubForm = {
        // Basic information - ensure all required fields are present
        name: data.name.trim(),
        city: data.city?.trim() || '',
        address: data.address?.trim() || '',
        phone: data.representative_phone?.trim() || '',
        email: data.representative_email?.trim() || '',
        status: 'active', // Always set to active for new/updated clubs
        league_id: data.league_id && data.league_id !== '' ? parseInt(data.league_id) : undefined,
        
        // Additional fields that the backend expects
        ruc: data.ruc?.trim() || '',
        country: data.country?.trim() || 'Ecuador',
        province: data.province?.trim() || '',
        google_maps_url: data.google_maps_url?.trim() || '',
        description: data.description?.trim() || '',
        founded_date: data.founded_date?.trim() || '',
        
        // Representative information
        representative_name: data.representative_name?.trim() || '',
        representative_phone: data.representative_phone?.trim() || '',
        representative_email: data.representative_email?.trim() || '',
        
        // Administrator information
        admin1_name: data.admin1_name?.trim() || '',
        admin1_phone: data.admin1_phone?.trim() || '',
        admin1_email: data.admin1_email?.trim() || '',
        admin2_name: data.admin2_name?.trim() || '',
        admin2_phone: data.admin2_phone?.trim() || '',
        admin2_email: data.admin2_email?.trim() || '',
        admin3_name: data.admin3_name?.trim() || '',
        admin3_phone: data.admin3_phone?.trim() || '',
        admin3_email: data.admin3_email?.trim() || '',
      };

      console.log('🏢 Processed club form data:', clubFormData);

      await onSave(clubFormData);
      
      // After successful save, reset the form and close the modal
      handleClose();
    } catch (error) {
      // Error handling is done in the parent component
      console.error('❌ Error in form submission:', error);
    }
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

  const handleClose = () => {
    // Reset form when closing manually
    reset({
      league_id: '',
      name: '',
      ruc: '',
      country: 'Ecuador',
      province: '',
      city: '',
      address: '',
      google_maps_url: '',
      description: '',
      founded_date: '',
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
    });
    setLogoPreview(null);
    setSelectedLogo(null);
    setCurrentStep(1);
    onClose();
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
                {club ? 'Editar Club' : 'Crear Nuevo Club'}
              </h2>
              <p className="text-blue-100 mt-1">
                Paso {currentStep} de {totalSteps}
              </p>
            </div>
            <button
              onClick={handleClose}
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className={sectionTitleStyles}>Información Básica</h3>
                
                {/* Logo Upload */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    {logoPreview ? (
                      <img
                        className="h-24 w-24 object-cover rounded-xl border-4 border-gray-300"
                        src={logoPreview}
                        alt="Logo preview"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-xl bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                        <svg className="h-8 w-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <label
                      htmlFor="logo"
                      className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </label>
                    <input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="sr-only"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className={labelStyles}>
                      Nombre del Club <span className="text-red-600">*</span>
                    </label>
                    <input
                      {...register('name')}
                      type="text"
                      id="name"
                      placeholder="Ej: Club Deportivo Guayaquil"
                      className={`${inputStyles} ${errors.name ? inputErrorStyles : inputNormalStyles}`}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-700 font-medium">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="ruc" className={labelStyles}>RUC</label>
                    <input
                      {...register('ruc')}
                      type="text"
                      id="ruc"
                      placeholder="0123456789001"
                      className={`${inputStyles} ${inputNormalStyles}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="league_id" className={labelStyles}>Liga</label>
                    <select
                      {...register('league_id')}
                      id="league_id"
                      className={`${inputStyles} ${inputNormalStyles}`}
                    >
                      <option value="">Seleccionar liga</option>
                      {leagues.map((league) => (
                        <option key={league.id} value={league.id.toString()}>
                          {league.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="founded_date" className={labelStyles}>Fecha de Fundación</label>
                    <input
                      {...register('founded_date')}
                      type="date"
                      id="founded_date"
                      className={`${inputStyles} ${inputNormalStyles}`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className={labelStyles}>Descripción</label>
                  <textarea
                    {...register('description')}
                    id="description"
                    rows={3}
                    placeholder="Descripción del club, historia, logros..."
                    className={`${inputStyles} ${inputNormalStyles} resize-none`}
                  />
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
                <h3 className={sectionTitleStyles}>Ubicación del Club</h3>
                
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

                <div className="space-y-2">
                  <label htmlFor="address" className={labelStyles}>Dirección</label>
                  <input
                    {...register('address')}
                    type="text"
                    id="address"
                    placeholder="Av. Principal 123, Sector Norte"
                    className={`${inputStyles} ${inputNormalStyles}`}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="google_maps_url" className={labelStyles}>URL de Google Maps</label>
                  <input
                    {...register('google_maps_url')}
                    type="url"
                    id="google_maps_url"
                    placeholder="https://maps.google.com/..."
                    className={`${inputStyles} ${errors.google_maps_url ? inputErrorStyles : inputNormalStyles}`}
                  />
                  {errors.google_maps_url && (
                    <p className="text-sm text-red-700 font-medium">{errors.google_maps_url.message}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Representative */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className={sectionTitleStyles}>Representante</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="representative_name" className={labelStyles}>Nombre</label>
                    <input
                      {...register('representative_name')}
                      type="text"
                      id="representative_name"
                      placeholder="Juan Pérez"
                      className={`${inputStyles} ${inputNormalStyles}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="representative_phone" className={labelStyles}>Teléfono</label>
                    <input
                      {...register('representative_phone')}
                      type="tel"
                      id="representative_phone"
                      placeholder="0999123456"
                      className={`${inputStyles} ${inputNormalStyles}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="representative_email" className={labelStyles}>Email</label>
                    <input
                      {...register('representative_email')}
                      type="email"
                      id="representative_email"
                      placeholder="representante@club.com"
                      className={`${inputStyles} ${errors.representative_email ? inputErrorStyles : inputNormalStyles}`}
                    />
                    {errors.representative_email && (
                      <p className="text-sm text-red-700 font-medium">{errors.representative_email.message}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Administrators */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className={sectionTitleStyles}>Administradores</h3>
                
                {/* Administrator 1 */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">
                    Administrador 1
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="admin1_name" className={labelStyles}>Nombre</label>
                      <input
                        {...register('admin1_name')}
                        type="text"
                        id="admin1_name"
                        placeholder="María García"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="admin1_phone" className={labelStyles}>Teléfono</label>
                      <input
                        {...register('admin1_phone')}
                        type="tel"
                        id="admin1_phone"
                        placeholder="0999654321"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="admin1_email" className={labelStyles}>Email</label>
                      <input
                        {...register('admin1_email')}
                        type="email"
                        id="admin1_email"
                        placeholder="admin1@club.com"
                        className={`${inputStyles} ${errors.admin1_email ? inputErrorStyles : inputNormalStyles}`}
                      />
                      {errors.admin1_email && (
                        <p className="text-sm text-red-700 font-medium">{errors.admin1_email.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Administrator 2 */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">
                    Administrador 2
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="admin2_name" className={labelStyles}>Nombre</label>
                      <input
                        {...register('admin2_name')}
                        type="text"
                        id="admin2_name"
                        placeholder="Carlos López"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="admin2_phone" className={labelStyles}>Teléfono</label>
                      <input
                        {...register('admin2_phone')}
                        type="tel"
                        id="admin2_phone"
                        placeholder="0999987654"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="admin2_email" className={labelStyles}>Email</label>
                      <input
                        {...register('admin2_email')}
                        type="email"
                        id="admin2_email"
                        placeholder="admin2@club.com"
                        className={`${inputStyles} ${errors.admin2_email ? inputErrorStyles : inputNormalStyles}`}
                      />
                      {errors.admin2_email && (
                        <p className="text-sm text-red-700 font-medium">{errors.admin2_email.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Administrator 3 */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">
                    Administrador 3
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="admin3_name" className={labelStyles}>Nombre</label>
                      <input
                        {...register('admin3_name')}
                        type="text"
                        id="admin3_name"
                        placeholder="Ana Rodríguez"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="admin3_phone" className={labelStyles}>Teléfono</label>
                      <input
                        {...register('admin3_phone')}
                        type="tel"
                        id="admin3_phone"
                        placeholder="0999456789"
                        className={`${inputStyles} ${inputNormalStyles}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="admin3_email" className={labelStyles}>Email</label>
                      <input
                        {...register('admin3_email')}
                        type="email"
                        id="admin3_email"
                        placeholder="admin3@club.com"
                        className={`${inputStyles} ${errors.admin3_email ? inputErrorStyles : inputNormalStyles}`}
                      />
                      {errors.admin3_email && (
                        <p className="text-sm text-red-700 font-medium">{errors.admin3_email.message}</p>
                      )}
                    </div>
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
              onClick={handleClose}
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
                onClick={handleSubmit(onSubmit)}
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
                    {club ? 'Actualizar Club' : 'Crear Club'}
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

export default ClubModal;