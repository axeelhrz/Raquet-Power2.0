import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomBrandHelperProps {
  type: 'racket' | 'rubber';
}

const CustomBrandHelper: React.FC<CustomBrandHelperProps> = ({ type }) => {
  const [isOpen, setIsOpen] = useState(false);

  const racketBrands = [
    'Tibhar', 'Andro', 'Gewo', 'Donic', 'Cornilleau', 'Killerspin', 
    'Palio', 'Gambler', 'Darker', 'TSP', 'Avalox', 'Sword'
  ];

  const rubberBrands = [
    'Tibhar', 'Andro', 'Gewo', 'Donic', 'Cornilleau', 'Killerspin',
    'Palio', 'Gambler', 'Darker', 'TSP', 'Avalox', 'Sword', 'Spinlord',
    'Der-Materialspezialist', 'Butterfly (modelos especiales)', 'Globe'
  ];

  const brands = type === 'racket' ? racketBrands : rubberBrands;
  const title = type === 'racket' ? 'Marcas de Raquetas' : 'Marcas de Cauchos';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Ver ejemplos de marcas
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-2 w-80 bg-white border-2 border-blue-200 rounded-xl shadow-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-blue-900">{title} Adicionales</h4>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-1 text-xs">
              {brands.map((brand, index) => (
                <div
                  key={index}
                  className="bg-blue-50 text-blue-800 px-2 py-1 rounded font-medium"
                >
                  {brand}
                </div>
              ))}
            </div>
            
            <div className="mt-3 text-xs text-gray-600 bg-gray-50 rounded p-2">
              <p className="font-medium">
                💡 <strong>Tip:</strong> Estos son solo ejemplos. Puedes ingresar cualquier marca que uses.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomBrandHelper;
