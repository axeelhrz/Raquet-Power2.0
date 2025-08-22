'use client';

import LeagueLayout from '@/components/leagues/LeagueLayout';
import { useEffect, useState, useCallback } from 'react';
import {
  CogIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  SparklesIcon,

} from '@heroicons/react/24/outline';
import { Sport, SportParameter } from '@/types';
import axios from '@/lib/axios';
import type { AxiosError } from 'axios';

interface SportParameterForm {
  param_key: string;
  param_value: string;
  param_type: 'text' | 'number' | 'boolean' | 'select';
  options?: string;
  description?: string;
  unit?: string;
  category?: string;
}


export default function LigaSportsPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [parameters, setParameters] = useState<SportParameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [parametersLoading, setParametersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [, setIsParameterModalOpen] = useState(false);
  const [, setIsEditMode] = useState(false);
  const [, setEditingParameter] = useState<SportParameter | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [parameterToDelete, setParameterToDelete] = useState<SportParameter | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setActiveTab] = useState<'suggestions' | 'custom'>('suggestions');
  const [, setSuggestionSearch] = useState('');
  const [, setSelectedCategory] = useState<string>('all');

  // Form state
  const [, setParameterForm] = useState<SportParameterForm>({
    param_key: '',
    param_value: '',
    param_type: 'text',
    options: '',
    description: '',
    unit: '',
    category: ''
  });

  // Sugerencias inteligentes por deporte
    // (Función getSportSuggestions eliminada por no usarse para evitar error de compilación noUnusedLocals)
  
  
  
    // ... (resto de las funciones existentes como fetchSports, fetchParameters, etc.)

  const openCreateModal = () => {
    resetForm();
    setIsEditMode(false);
    setActiveTab('suggestions');
    setSuggestionSearch('');
    setSelectedCategory('all');
    setIsParameterModalOpen(true);
  };






  // ... (resto del JSX con las mejoras del modal)

// (Bloque de return duplicado eliminado; las funciones y el único return permanecen más abajo)

// ... (continuación del código anterior)

  const fetchSports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('/api/sports');

      if (response.data && response.data.data) {
        const sportsData = response.data.data.data || response.data.data;
        setSports(sportsData);

        if (sportsData.length > 0) {
          setSelectedSport(prev => prev || sportsData[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching sports:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Error al cargar deportes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSports();
  }, [fetchSports]);

  useEffect(() => {
    if (selectedSport) {
      fetchParameters(selectedSport.id);
    }
  }, [selectedSport]);

  const fetchParameters = async (sportId: number) => {
    try {
      setParametersLoading(true);
      const response = await axios.get(`/api/sports/${sportId}/parameters`);

      if (response.data && response.data.data) {
        const paramsData = response.data.data.data || response.data.data;
        setParameters(paramsData);
      } else {
        setParameters([]);
      }
    } catch (error) {
      console.error('Error fetching parameters:', error);
      setParameters([]);
    } finally {
      setParametersLoading(false);
    }
  };


  const handleDeleteParameter = async () => {
    if (!selectedSport || !parameterToDelete) return;

    try {
      setIsProcessing(true);
      await axios.delete(
        `/api/sports/${selectedSport.id}/parameters/${parameterToDelete.id}`
      );
      await fetchParameters(selectedSport.id);
      setIsDeleteModalOpen(false);
      setParameterToDelete(null);
    } catch (error) {
      console.error('Error deleting parameter:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || 'Error al eliminar parámetro');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAutoConfigureSport = async () => {
    if (!selectedSport) return;

    const autoConfigs = getAutoConfiguration(selectedSport.code);

    if (autoConfigs.length === 0) {
      alert('No hay configuración automática disponible para este deporte');
      return;
    }

    try {
      setIsProcessing(true);

      // Create all parameters for this sport
      for (const config of autoConfigs) {
        try {
          await axios.post(`/api/sports/${selectedSport.id}/parameters`, config);
        } catch (error) {
          console.error('Error creating parameter:', config.param_key, error);
        }
      }

      await fetchParameters(selectedSport.id);
    } catch (error) {
      console.error('Error auto-configuring sport:', error);
      alert('Error en la configuración automática');
    } finally {
      setIsProcessing(false);
    }
  };

  const getAutoConfiguration = (sportCode: string): SportParameterForm[] => {
    // Configuración básica para auto-configurar (versión simplificada)
    const configs: Record<string, SportParameterForm[]> = {
      tennis: [
        { param_key: 'court_length', param_value: '23.77', param_type: 'number', description: 'Longitud total de la cancha', unit: 'metros', category: 'dimensions' },
        { param_key: 'court_width_singles', param_value: '8.23', param_type: 'number', description: 'Ancho para individuales', unit: 'metros', category: 'dimensions' },
        { param_key: 'net_height', param_value: '91.4', param_type: 'number', description: 'Altura de la red en el centro', unit: 'cm', category: 'dimensions' },
        { param_key: 'surface_type', param_value: 'clay', param_type: 'select', options: 'clay,grass,hard,synthetic', description: 'Tipo de superficie', category: 'equipment' },
        { param_key: 'set_format', param_value: 'best_of_3', param_type: 'select', options: 'best_of_3,best_of_5', description: 'Formato de sets', category: 'scoring' }
      ],
      table_tennis: [
        { param_key: 'table_length', param_value: '274', param_type: 'number', description: 'Longitud de la mesa', unit: 'cm', category: 'dimensions' },
        { param_key: 'table_width', param_value: '152.5', param_type: 'number', description: 'Ancho de la mesa', unit: 'cm', category: 'dimensions' },
        { param_key: 'net_height', param_value: '15.25', param_type: 'number', description: 'Altura de la red', unit: 'cm', category: 'dimensions' },
        { param_key: 'ball_color', param_value: 'white', param_type: 'select', options: 'white,orange', description: 'Color de la pelota', category: 'equipment' },
        { param_key: 'points_per_game', param_value: '11', param_type: 'number', description: 'Puntos por juego', category: 'scoring' }
      ],
      padel: [
        { param_key: 'court_length', param_value: '20', param_type: 'number', description: 'Longitud de la cancha', unit: 'metros', category: 'dimensions' },
        { param_key: 'court_width', param_value: '10', param_type: 'number', description: 'Ancho de la cancha', unit: 'metros', category: 'dimensions' },
        { param_key: 'back_wall_height', param_value: '4', param_type: 'number', description: 'Altura pared de fondo', unit: 'metros', category: 'dimensions' },
        { param_key: 'ball_pressure', param_value: 'low_pressure', param_type: 'select', options: 'low_pressure,medium_pressure', description: 'Presión de pelota', category: 'equipment' },
        { param_key: 'scoring_system', param_value: 'tennis_scoring', param_type: 'select', options: 'tennis_scoring,point_scoring', description: 'Sistema de puntuación', category: 'scoring' }
      ],
      pickleball: [
        { param_key: 'court_length', param_value: '44', param_type: 'number', description: 'Longitud de cancha', unit: 'pies', category: 'dimensions' },
        { param_key: 'court_width', param_value: '20', param_type: 'number', description: 'Ancho de cancha', unit: 'pies', category: 'dimensions' },
        { param_key: 'net_height_center', param_value: '34', param_type: 'number', description: 'Altura red en centro', unit: 'pulgadas', category: 'dimensions' },
        { param_key: 'non_volley_zone', param_value: '7', param_type: 'number', description: 'Zona de no-volea', unit: 'pies', category: 'dimensions' },
        { param_key: 'points_to_win', param_value: '11', param_type: 'select', options: '11,15,21', description: 'Puntos para ganar', category: 'scoring' }
      ],
      badminton: [
        { param_key: 'court_length', param_value: '13.4', param_type: 'number', description: 'Longitud de cancha', unit: 'metros', category: 'dimensions' },
        { param_key: 'court_width_singles', param_value: '5.18', param_type: 'number', description: 'Ancho individuales', unit: 'metros', category: 'dimensions' },
        { param_key: 'net_height', param_value: '1.524', param_type: 'number', description: 'Altura de red', unit: 'metros', category: 'dimensions' },
        { param_key: 'shuttlecock_type', param_value: 'feather', param_type: 'select', options: 'feather,synthetic', description: 'Tipo de volante', category: 'equipment' },
        { param_key: 'points_per_game', param_value: '21', param_type: 'number', description: 'Puntos por juego', category: 'scoring' }
      ],
      handball: [
        { param_key: 'court_length', param_value: '40', param_type: 'number', description: 'Longitud de cancha', unit: 'metros', category: 'dimensions' },
        { param_key: 'court_width', param_value: '20', param_type: 'number', description: 'Ancho de cancha', unit: 'metros', category: 'dimensions' },
        { param_key: 'goal_width', param_value: '3', param_type: 'number', description: 'Ancho de portería', unit: 'metros', category: 'dimensions' },
        { param_key: 'goal_height', param_value: '2', param_type: 'number', description: 'Altura de portería', unit: 'metros', category: 'dimensions' },
        { param_key: 'players_per_team', param_value: '7', param_type: 'number', description: 'Jugadores por equipo', category: 'rules' },
        { param_key: 'match_duration', param_value: '60', param_type: 'number', description: 'Duración del partido', unit: 'minutos', category: 'timing' }
      ],
      racquetball: [
        { param_key: 'court_length', param_value: '40', param_type: 'number', description: 'Longitud de cancha', unit: 'pies', category: 'dimensions' },
        { param_key: 'court_width', param_value: '20', param_type: 'number', description: 'Ancho de cancha', unit: 'pies', category: 'dimensions' },
        { param_key: 'court_height', param_value: '20', param_type: 'number', description: 'Altura de cancha', unit: 'pies', category: 'dimensions' },
        { param_key: 'ball_type', param_value: 'blue', param_type: 'select', options: 'blue,red,green,black', description: 'Tipo de pelota', category: 'equipment' },
        { param_key: 'points_to_win', param_value: '15', param_type: 'select', options: '11,15,21', description: 'Puntos para ganar', category: 'scoring' }
      ]
    };

    return configs[sportCode] || [];
  };

  // Type guard to ensure only allowed param types are used
  const isValidParamType = (type: string): type is SportParameterForm['param_type'] =>
    ['text', 'number', 'boolean', 'select'].includes(type);

  const openEditModal = (parameter: SportParameter) => {
    setParameterForm({
      param_key: parameter.param_key,
      param_value: parameter.param_value,
      param_type: isValidParamType(parameter.param_type) ? parameter.param_type : 'text',
      options: parameter.options || '',
      description: parameter.description || '',
      unit: parameter.unit || '',
      category: parameter.category || ''
    });
    setEditingParameter(parameter);
    setIsEditMode(true);
    setIsParameterModalOpen(true);
  };

  const openDeleteModal = (parameter: SportParameter) => {
    setParameterToDelete(parameter);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setParameterForm({
      param_key: '',
      param_value: '',
      param_type: 'text',
      options: '',
      description: '',
      unit: '',
      category: ''
    });
  };

  const filteredSports = sports.filter(sport =>
    sport.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sport.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <LeagueLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
        </div>
      </LeagueLayout>
    );
  }

  return (
    <LeagueLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CogIcon className="h-8 w-8 text-yellow-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Configuración de Deportes
                </h1>
                <p className="text-gray-600">
                  Gestiona los parámetros específicos de cada deporte con sugerencias inteligentes
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sports List Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Deportes</h2>
                <span className="text-sm text-gray-500">{sports.length} deportes</span>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar deportes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              {/* Sports List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredSports.map((sport) => (
                  <div
                    key={sport.id}
                    onClick={() => setSelectedSport(sport)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedSport?.id === sport.id
                        ? 'border-yellow-300 bg-yellow-50'
                        : 'border-gray-200 hover:border-yellow-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{sport.name}</h3>
                        <p className="text-sm text-gray-500">Código: {sport.code}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {parameters.length > 0 && selectedSport?.id === sport.id && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {parameters.length} parámetros
                          </span>
                        )}
                        <CogIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Parameters Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              {selectedSport ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        Parámetros de {selectedSport.name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Configura los parámetros específicos para este deporte
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleAutoConfigureSport}
                        disabled={isProcessing}
                        className="inline-flex items-center px-3 py-2 border border-yellow-300 text-sm font-medium rounded-lg text-yellow-700 bg-yellow-50 hover:bg-yellow-100 disabled:opacity-50"
                      >
                        <SparklesIcon className="h-4 w-4 mr-2" />
                        Auto-configurar
                      </button>
                      <button
                        onClick={openCreateModal}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-yellow-600 hover:bg-yellow-700"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Agregar Parámetro
                      </button>
                    </div>
                  </div>

                  {parametersLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Cargando parámetros...</p>
                    </div>
                  ) : parameters.length === 0 ? (
                    <div className="text-center py-8">
                      <CogIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Sin parámetros configurados
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Este deporte no tiene parámetros configurados aún.
                      </p>
                      <div className="flex justify-center space-x-3">
                        <button
                          onClick={handleAutoConfigureSport}
                          disabled={isProcessing}
                          className="inline-flex items-center px-4 py-2 border border-yellow-300 text-sm font-medium rounded-lg text-yellow-700 bg-yellow-50 hover:bg-yellow-100 disabled:opacity-50"
                        >
                          <SparklesIcon className="h-4 w-4 mr-2" />
                          Auto-configurar
                        </button>
                        <button
                          onClick={openCreateModal}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-yellow-600 hover:bg-yellow-700"
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Agregar Manualmente
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {parameters.map((parameter) => (
                        <div
                          key={parameter.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-medium text-gray-900">
                                  {parameter.param_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </h4>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  parameter.param_type === 'text' ? 'bg-blue-100 text-blue-800' :
                                  parameter.param_type === 'number' ? 'bg-green-100 text-green-800' :
                                  parameter.param_type === 'boolean' ? 'bg-purple-100 text-purple-800' :
                                  'bg-orange-100 text-orange-800'
                                }`}>
                                  {parameter.param_type}
                                </span>
                                {parameter.unit && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {parameter.unit}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-900 mb-1">
                                <strong>Valor:</strong> {parameter.param_value}
                              </p>
                              {parameter.options && (
                                <p className="text-sm text-gray-600 mb-1">
                                  <strong>Opciones:</strong> {parameter.options}
                                </p>
                              )}
                              {parameter.description && (
                                <p className="text-sm text-gray-600">
                                  {parameter.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => openEditModal(parameter)}
                                className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(parameter)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <CogIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Selecciona un deporte
                  </h3>
                  <p className="text-gray-600">
                    Elige un deporte de la lista para configurar sus parámetros.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal mejorado con pestañas - ya incluido en el código anterior */}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && parameterToDelete && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <TrashIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Eliminar Parámetro
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  ¿Estás seguro de que deseas eliminar el parámetro &quot;{parameterToDelete.param_key}&quot;?
                  Esta acción no se puede deshacer.
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={isProcessing}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteParameter}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {isProcessing ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </LeagueLayout>
  );
}
