'use client';

import React from 'react';
import { Box, Typography, Card, CardContent, Avatar, Button, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import ConstructionIcon from '@mui/icons-material/Construction';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NextLink from 'next/link';

const StyledCard = styled(Card)(({  }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
  overflow: 'hidden',
  position: 'relative',
}));

const PulseIcon = styled(Box)(({  }) => ({
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'rgba(16, 185, 129, 0.3)',
    transform: 'translate(-50%, -50%)',
    animation: 'pulse 2s infinite',
  },
  '@keyframes pulse': {
    '0%': {
      transform: 'translate(-50%, -50%) scale(1)',
      opacity: 1,
    },
    '100%': {
      transform: 'translate(-50%, -50%) scale(1.4)',
      opacity: 0,
    },
  },
}));

interface MemberWaitingRoomProps {
  memberName?: string;
  clubName?: string;
}

const MemberWaitingRoom: React.FC<MemberWaitingRoomProps> = ({ 
  memberName = "Miembro", 
  clubName 
}) => {
  const features = [
    {
      icon: PersonIcon,
      title: 'Perfil de Miembro',
      description: 'Gestiona tu información personal y deportiva',
      status: 'coming-soon'
    },
    {
      icon: CheckCircleIcon,
      title: 'Torneos y Competencias',
      description: 'Participa en eventos organizados por tu club',
      status: 'coming-soon'
    },
    {
      icon: AccessTimeIcon,
      title: 'Calendario de Actividades',
      description: 'Consulta horarios y reserva espacios',
      status: 'coming-soon'
    }
  ];

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <StyledCard>
          <CardContent sx={{ p: 5, textAlign: 'center' }}>
            {/* Header with animated icon */}
            <Box sx={{ mb: 4 }}>
              <PulseIcon sx={{ display: 'inline-block', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    backgroundColor: '#10B981',
                    color: 'white',
                    mx: 'auto',
                  }}
                >
                  <ConstructionIcon sx={{ fontSize: 40 }} />
                </Avatar>
              </PulseIcon>
              
              <Typography
                variant="h3"
                sx={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: 'text.primary',
                  mb: 2,
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ¡Bienvenido, {memberName}!
              </Typography>
              
              <Typography
                variant="h6"
                sx={{
                  color: 'text.secondary',
                  fontSize: '1.125rem',
                  fontWeight: 500,
                  mb: 1,
                }}
              >
                Tu cuenta de miembro ha sido creada exitosamente
              </Typography>
              
              {clubName && (
                <Typography
                  variant="body1"
                  sx={{
                    color: '#10B981',
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                >
                  Club: {clubName}
                </Typography>
              )}
            </Box>

            {/* Status Message */}
            <Box
              sx={{
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: 3,
                p: 4,
                mb: 4,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: '#10B981',
                  fontWeight: 600,
                  mb: 2,
                  fontSize: '1.25rem',
                }}
              >
                🚧 Plataforma en Desarrollo
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  color: 'text.primary',
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  mb: 2,
                }}
              >
                Estamos trabajando arduamente para completar todas las funcionalidades 
                de la plataforma para miembros. Muy pronto podrás acceder a:
              </Typography>
            </Box>

            {/* Features List */}
            <Box sx={{ mb: 4 }}>
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 3,
                        mb: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        borderRadius: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(16, 185, 129, 0.05)',
                          borderColor: 'rgba(16, 185, 129, 0.2)',
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          color: '#10B981',
                          mr: 3,
                        }}
                      >
                        <IconComponent sx={{ fontSize: 24 }} />
                      </Avatar>
                      
                      <Box sx={{ flex: 1, textAlign: 'left' }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: 'text.primary',
                            mb: 0.5,
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.875rem',
                          }}
                        >
                          {feature.description}
                        </Typography>
                      </Box>
                      
                      <Box
                        sx={{
                          backgroundColor: 'rgba(255, 193, 7, 0.1)',
                          color: '#F59E0B',
                          px: 2,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        Próximamente
                      </Box>
                    </Box>
                  </motion.div>
                );
              })}
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Timeline */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  color: 'text.primary',
                  fontWeight: 600,
                  mb: 3,
                }}
              >
                ¿Cuándo estará listo?
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  mb: 3,
                }}
              >
                Nuestro equipo de desarrollo está finalizando las últimas funcionalidades. 
                Te notificaremos por correo electrónico tan pronto como la plataforma esté 
                completamente operativa.
              </Typography>
              
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  p: 3,
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  borderRadius: 2,
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                }}
              >
                <AccessTimeIcon sx={{ color: '#3B82F6', fontSize: 24 }} />
                <Typography
                  variant="body1"
                  sx={{
                    color: '#3B82F6',
                    fontWeight: 600,
                  }}
                >
                  Estimado: 2-3 semanas
                </Typography>
              </Box>
            </Box>

            {/* Action Button */}
            <Button
              component={NextLink}
              href="/auth/sign-in"
              variant="contained"
              size="large"
              sx={{
                height: 48,
                px: 4,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                backgroundColor: '#10B981',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                '&:hover': {
                  backgroundColor: '#059669',
                  boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
                },
              }}
            >
              Entendido
            </Button>
          </CardContent>
        </StyledCard>
      </motion.div>
    </Box>
  );
};

export default MemberWaitingRoom;
