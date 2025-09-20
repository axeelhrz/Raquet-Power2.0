import React from 'react';
import type { Metadata } from 'next';
import QuickRegistrationWaitingRoom from '@/components/auth/QuickRegistrationWaitingRoom';

// SEO Metadata
export const metadata: Metadata = {
  title: 'Sala de Espera - Censo de Tenis de Mesa | Raquet Power',
  description: 'Consulta el estado de tu registro en el censo de tenis de mesa de Ecuador. Revisa tu información y el progreso de tu solicitud.',
  keywords: 'censo tenis de mesa, sala de espera, registro Ecuador, LATEM, estado registro',
  openGraph: {
    title: 'Sala de Espera - Censo de Tenis de Mesa | Raquet Power',
    description: 'Consulta el estado de tu registro en el censo de tenis de mesa de Ecuador',
    type: 'website',
  },
};

interface PageProps {
  searchParams: Promise<{
    code?: string;
  }>;
}

const CensoWaitingRoomPage: React.FC<PageProps> = async ({ searchParams }) => {
  const params = await searchParams;
  const registrationCode = params.code;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <QuickRegistrationWaitingRoom registrationCode={registrationCode} />
      </div>
    </div>
  );
};

export default CensoWaitingRoomPage;