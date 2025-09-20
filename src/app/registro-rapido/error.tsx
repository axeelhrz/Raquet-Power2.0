'use client';

import React from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const Error: React.FC<ErrorProps> = ({ error, reset }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Error de Carga</h2>
        
        <p className="text-gray-600 mb-6">
          Hubo un problema al cargar el formulario de registro. Esto puede deberse a:
        </p>
        
        <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-1">•</span>
            <span>Problemas de conectividad</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-1">•</span>
            <span>Límite de solicitudes excedido</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-1">•</span>
            <span>Error temporal del servidor</span>
          </li>
        </ul>
        
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold"
          >
            Intentar de Nuevo
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 py-3 px-6 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-semibold border border-gray-300"
          >
            Volver al Inicio
          </button>
        </div>
        
        {error.digest && (
          <p className="text-xs text-gray-400 mt-4">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
};

export default Error;