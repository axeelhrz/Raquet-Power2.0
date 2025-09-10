'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ChunkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is a chunk loading error
    const isChunkError = error.message.includes('Loading chunk') || 
                        error.message.includes('ChunkLoadError') ||
                        error.name === 'ChunkLoadError';
    
    return { 
      hasError: isChunkError, 
      error: isChunkError ? error : undefined 
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Only handle chunk loading errors
    if (error.message.includes('Loading chunk') || error.name === 'ChunkLoadError') {
      console.error('Chunk loading error:', error, errorInfo);
      
      // Attempt to reload the page after a short delay
      setTimeout(() => {
        if (this.state.hasError) {
          window.location.reload();
        }
      }, 3000);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50 flex items-center justify-center px-4">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cargando Recursos</h2>
            
            <p className="text-gray-600 mb-6">
              Estamos cargando los recursos necesarios. La página se actualizará automáticamente en unos segundos.
            </p>
            
            <div className="flex items-center justify-center mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 text-white py-3 px-6 rounded-xl hover:from-yellow-700 hover:to-yellow-800 transition-all duration-200 font-semibold"
              >
                Recargar Ahora
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 py-3 px-6 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-semibold border border-gray-300"
              >
                Volver al Inicio
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              Si el problema persiste, intenta limpiar la caché del navegador
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary;