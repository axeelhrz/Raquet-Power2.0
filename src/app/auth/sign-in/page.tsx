import React from 'react';
import type { Metadata } from 'next';
import SignInPageClient from './SignInPageClient';

// SEO Metadata
export const metadata: Metadata = {
  title: 'Iniciar Sesión | Raquet Power',
  description: 'Inicia sesión en tu cuenta de Raquet Power para acceder a tu panel de control y gestionar tu información deportiva.',
  keywords: 'iniciar sesión, login, Raquet Power, deportes, gestión deportiva',
  robots: 'noindex, nofollow', // Auth pages shouldn't be indexed
  openGraph: {
    title: 'Iniciar Sesión | Raquet Power',
    description: 'Accede a tu cuenta de Raquet Power',
    type: 'website',
  },
};

const SignInPage: React.FC = () => {
  return <SignInPageClient />;
};

export default SignInPage;