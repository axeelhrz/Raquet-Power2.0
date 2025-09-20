'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthLayout from '@/components/auth/AuthLayout';
import MemberWaitingRoom from '@/components/auth/MemberWaitingRoom';
import { Box, CircularProgress } from '@mui/material';

export default function WaitingRoomPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Si no hay usuario, redirigir al login
      if (!user) {
        router.push('/auth/sign-in');
        return;
      }

      // Si el usuario no es miembro, redirigir a su dashboard correspondiente
      if (user.role !== 'miembro') {
        switch (user.role) {
          case 'super_admin':
            router.push('/dashboard');
            break;
          case 'liga':
            router.push('/dashboard/liga');
            break;
          case 'club':
            router.push('/dashboard/club');
            break;
          default:
            router.push('/dashboard');
        }
      }
    }
  }, [user, loading, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <AuthLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </Box>
      </AuthLayout>
    );
  }

  // Si no hay usuario o no es miembro, no mostrar nada (se está redirigiendo)
  if (!user || user.role !== 'miembro') {
    return (
      <AuthLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </Box>
      </AuthLayout>
    );
  }

  // Obtener información del miembro
  const memberName = user.full_name || user.name || 'Miembro';
  const clubName = user.parent_club_id != null ? String(user.parent_club_id) : 'Club';

  return (
    <AuthLayout>
      <MemberWaitingRoom 
        memberName={memberName}
        clubName={clubName}
      />
    </AuthLayout>
  );
}
