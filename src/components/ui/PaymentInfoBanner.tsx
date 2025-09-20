import React from 'react';
import {
  InformationCircleIcon,
  CreditCardIcon,
  UserPlusIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface PaymentInfoBannerProps {
  onLearnMore?: () => void;
}

const PaymentInfoBanner: React.FC<PaymentInfoBannerProps> = ({ onLearnMore }) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start space-x-4">
        <div className="bg-blue-100 p-3 rounded-full flex-shrink-0">
          <CreditCardIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            ¿Cómo agregar nuevos miembros a tu club?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center space-x-3 bg-white rounded-lg p-3 shadow-sm">
              <div className="bg-blue-100 p-2 rounded-full">
                <UserPlusIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">1. Registro</p>
                <p className="text-xs text-gray-600">El interesado se registra</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 bg-white rounded-lg p-3 shadow-sm">
              <div className="bg-yellow-100 p-2 rounded-full">
                <ClockIcon className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">2. Pago</p>
                <p className="text-xs text-gray-600">Realiza el pago requerido</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 bg-white rounded-lg p-3 shadow-sm">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircleIcon className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">3. Aprobación</p>
                <p className="text-xs text-gray-600">Aparece en tu club</p>
              </div>
            </div>
          </div>
          
          <p className="text-blue-800 text-sm mb-4">
            Los nuevos miembros deben completar el proceso de registro rápido y realizar el pago 
            correspondiente antes de ser agregados automáticamente a tu club.
          </p>
          
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/registro-rapido"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlusIcon className="h-4 w-4 mr-2" />
              Ir al registro rápido
            </a>
            
            {onLearnMore && (
              <button
                onClick={onLearnMore}
                className="inline-flex items-center px-4 py-2 bg-white text-blue-700 text-sm font-medium rounded-lg border border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <InformationCircleIcon className="h-4 w-4 mr-2" />
                Ver proceso completo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentInfoBanner;
