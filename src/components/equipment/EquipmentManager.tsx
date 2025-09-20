'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from '@/lib/axios';

interface RubberBrand {
  id: number;
  name: string;
  country?: string;
}

interface RubberModel {
  id: number;
  brand_id: number;
  name: string;
  type: 'liso' | 'pupo_largo' | 'pupo_corto' | 'antitopspin';
  speed?: number;
  spin?: number;
  control?: number;
  brand_name: string;
  available_colors?: string[];
  available_sponges?: string[];
  available_hardness?: string[];
}

const EquipmentManager: React.FC = () => {
  const [rubberBrands, setRubberBrands] = useState<RubberBrand[]>([]);
  const [rubberModels, setRubberModels] = useState<RubberModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [showAddModel, setShowAddModel] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: '', country: '' });
  const [newModel, setNewModel] = useState({
    brand_id: '',
    name: '',
    type: 'liso',
    speed: '',
    spin: '',
    control: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [brandsResponse, modelsResponse] = await Promise.all([
        axios.get('/api/equipment/rubber-brands'),
        axios.get('/api/equipment/rubber-models')
      ]);

      if (brandsResponse.data.success) {
        setRubberBrands(brandsResponse.data.data);
      }

      if (modelsResponse.data.success) {
        setRubberModels(modelsResponse.data.data);
      }
    } catch (err: unknown) {
      setError('Error al cargar datos de equipamiento');
      console.error('Error fetching equipment data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post('/api/equipment/rubber-brands', newBrand);
      
      if (response.data.success) {
        setSuccess('Marca agregada exitosamente');
        setNewBrand({ name: '', country: '' });
        setShowAddBrand(false);
        fetchData();
      }
    } catch (err: unknown) {
      interface AxiosError {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
      const axiosError = err as AxiosError;
      if (
        axiosError.response &&
        axiosError.response.data &&
        typeof axiosError.response.data === 'object' &&
        'message' in axiosError.response.data
      ) {
        setError(axiosError.response.data?.message || 'Error al agregar marca');
      } else {
        setError('Error al agregar marca');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddModel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const modelData = {
        ...newModel,
        brand_id: parseInt(newModel.brand_id),
        speed: newModel.speed ? parseInt(newModel.speed) : null,
        spin: newModel.spin ? parseInt(newModel.spin) : null,
        control: newModel.control ? parseInt(newModel.control) : null,
      };

      const response = await axios.post('/api/equipment/rubber-models', modelData);
      
      if (response.data.success) {
        setSuccess('Modelo agregado exitosamente');
        setNewModel({
          brand_id: '',
          name: '',
          type: 'liso',
          speed: '',
          spin: '',
          control: '',
        });
        setShowAddModel(false);
        fetchData();
      }
    } catch (err: unknown) {
      interface AxiosError {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
      const axiosError = err as AxiosError;
      if (
        axiosError.response &&
        axiosError.response.data &&
        typeof axiosError.response.data === 'object' &&
        'message' in axiosError.response.data
      ) {
        setError(axiosError.response.data?.message || 'Error al agregar modelo');
      } else {
        setError('Error al agregar modelo');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <h1 className="text-3xl font-bold">Gestión de Equipamiento</h1>
          <p className="text-blue-100 mt-2">Administra marcas y modelos de cauchos</p>
        </div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-l-4 border-red-400 p-4 m-6"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button onClick={clearMessages} className="text-red-400 hover:text-red-600">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border-l-4 border-green-400 p-4 m-6"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
              <div className="ml-auto pl-3">
                <button onClick={clearMessages} className="text-green-400 hover:text-green-600">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="p-6">
          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setShowAddBrand(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Agregar Marca
            </button>
            <button
              onClick={() => setShowAddModel(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Agregar Modelo
            </button>
          </div>

          {/* Add Brand Modal */}
          {showAddBrand && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
              >
                <h3 className="text-xl font-bold mb-4">Agregar Nueva Marca</h3>
                <form onSubmit={handleAddBrand}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de la Marca *
                      </label>
                      <input
                        type="text"
                        value={newBrand.name}
                        onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        País
                      </label>
                      <input
                        type="text"
                        value={newBrand.country}
                        onChange={(e) => setNewBrand({ ...newBrand, country: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddBrand(false)}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {loading ? 'Agregando...' : 'Agregar'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}

          {/* Add Model Modal */}
          {showAddModel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
              >
                <h3 className="text-xl font-bold mb-4">Agregar Nuevo Modelo</h3>
                <form onSubmit={handleAddModel}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Marca *
                      </label>
                      <select
                        value={newModel.brand_id}
                        onChange={(e) => setNewModel({ ...newModel, brand_id: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Seleccionar marca</option>
                        {rubberBrands.map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Modelo *
                      </label>
                      <input
                        type="text"
                        value={newModel.name}
                        onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo *
                      </label>
                      <select
                        value={newModel.type}
                        onChange={(e) => setNewModel({ ...newModel, type: e.target.value as RubberModel['type'] })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="liso">Liso</option>
                        <option value="pupo_largo">Pupo Largo</option>
                        <option value="pupo_corto">Pupo Corto</option>
                        <option value="antitopspin">Antitopspin</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Velocidad (1-10)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={newModel.speed}
                          onChange={(e) => setNewModel({ ...newModel, speed: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Efecto (1-10)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={newModel.spin}
                          onChange={(e) => setNewModel({ ...newModel, spin: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Control (1-10)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={newModel.control}
                          onChange={(e) => setNewModel({ ...newModel, control: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddModel(false)}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {loading ? 'Agregando...' : 'Agregar'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}

          {/* Data Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Brands */}
            <div>
              <h2 className="text-xl font-bold mb-4">Marcas de Caucho ({rubberBrands.length})</h2>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Cargando...</p>
                  </div>
                ) : rubberBrands.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No hay marcas registradas</p>
                ) : (
                  <div className="space-y-2">
                    {rubberBrands.map((brand) => (
                      <div key={brand.id} className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="font-medium">{brand.name}</div>
                        {brand.country && (
                          <div className="text-sm text-gray-600">{brand.country}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Models */}
            <div>
              <h2 className="text-xl font-bold mb-4">Modelos de Caucho ({rubberModels.length})</h2>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Cargando...</p>
                  </div>
                ) : rubberModels.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No hay modelos registrados</p>
                ) : (
                  <div className="space-y-2">
                    {rubberModels.map((model) => (
                      <div key={model.id} className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="font-medium">{model.name}</div>
                        <div className="text-sm text-gray-600">
                          {model.brand_name} • {model.type}
                        </div>
                        {(model.speed || model.spin || model.control) && (
                          <div className="text-xs text-gray-500 mt-1">
                            {model.speed && `Vel: ${model.speed}`}
                            {model.spin && ` • Efecto: ${model.spin}`}
                            {model.control && ` • Control: ${model.control}`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentManager;