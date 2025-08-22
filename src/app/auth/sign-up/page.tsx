import React from 'react';
import type { Metadata } from 'next';
import SignUpPageClient from './SignUpPageClient';

// SEO Metadata
export const metadata: Metadata = {
  title: 'Crear Cuenta | Raquet Power',
  description: 'Únete a Raquet Power y crea tu cuenta para acceder a la mejor plataforma de gestión deportiva. Elige tu rol y comienza tu experiencia.',
  keywords: 'registro, crear cuenta, sign up, Raquet Power, deportes, gestión deportiva, liga, club, miembro',
  robots: 'noindex, nofollow', // Auth pages shouldn't be indexed
  openGraph: {
    title: 'Crear Cuenta | Raquet Power',
    description: 'Únete a Raquet Power y comienza tu experiencia deportiva',
    type: 'website',
  },
};

const SignUpPage: React.FC = () => {
  return <SignUpPageClient />;
};

export default SignUpPage;