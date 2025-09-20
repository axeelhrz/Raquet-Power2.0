import React from 'react';
import type { Metadata } from 'next';
import RegistroRapidoClient from './RegistroRapidoClient';

// SEO Metadata
export const metadata: Metadata = {
  title: 'Registro Rápido | Raquet Power',
  description: 'Regístrate rápidamente en Raquet Power. Solo necesitas tu información básica para comenzar.',
  keywords: 'registro rápido, sala de espera, Raquet Power, tenis de mesa, deportes',
  openGraph: {
    title: 'Registro Rápido | Raquet Power',
    description: 'Únete rápidamente a la comunidad de Raquet Power',
    type: 'website',
  },
};

const RegistroRapidoPage: React.FC = () => {
  return <RegistroRapidoClient />;
};

export default RegistroRapidoPage;