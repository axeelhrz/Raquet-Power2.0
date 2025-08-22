'use client';

import React from 'react';
import { Box, Container, Card, Typography, Link } from '@mui/material';
import { motion } from 'framer-motion';
import NextLink from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F7F9FC 0%, #EEF2F6 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        py: { xs: 3, sm: 6 },
        px: { xs: 2, sm: 3 },
      }}
    >
      {/* Background Accent - Desktop Only */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: { xs: 0, lg: '40%' },
          height: '100%',
          background: 'linear-gradient(135deg, rgba(47, 109, 251, 0.03) 0%, rgba(106, 166, 255, 0.08) 100%)',
          filter: 'blur(100px)',
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      />

      {/* Geometric Accent */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: '10%', lg: '15%' },
          left: { xs: '5%', lg: '10%' },
          width: { xs: 80, lg: 120 },
          height: { xs: 80, lg: 120 },
          background: 'linear-gradient(45deg, rgba(47, 109, 251, 0.1) 0%, rgba(106, 166, 255, 0.05) 100%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      />

      <Container
        maxWidth="sm"
        sx={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Card
            sx={{
              maxWidth: 480,
              mx: 'auto',
              p: { xs: 3, sm: 5 },
              borderRadius: 4,
              border: '1px solid rgba(15, 23, 42, 0.08)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              backdropFilter: 'blur(10px)',
              background: 'rgba(255, 255, 255, 0.95)',
              position: 'relative',
              overflow: 'visible',
            }}
          >
            {/* Card Glow Effect */}
            <Box
              sx={{
                position: 'absolute',
                top: -2,
                left: -2,
                right: -2,
                bottom: -2,
                background: 'linear-gradient(135deg, rgba(47, 109, 251, 0.1) 0%, rgba(106, 166, 255, 0.05) 100%)',
                borderRadius: 4,
                zIndex: -1,
                opacity: 0.5,
              }}
            />

            {children}
          </Card>
        </motion.div>

        {/* Legal Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Box sx={{ textAlign: 'center', mt: 4, px: 2 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.8125rem',
                lineHeight: 1.6,
                maxWidth: 400,
                mx: 'auto',
              }}
            >
              Al iniciar sesión, aceptas nuestros{' '}
              <Link
                component={NextLink}
                href="/legal/terms"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                términos de servicio
              </Link>
              {' '}y{' '}
              <Link
                component={NextLink}
                href="/legal/privacy"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                política de privacidad
              </Link>
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default AuthLayout;