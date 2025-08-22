'use client';

import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { motion, type Variants } from 'framer-motion';
import authTheme from '@/theme/authTheme';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthHeader from '@/components/auth/AuthHeader';
import SignInForm from '@/components/auth/SignInForm';

const SignInPageClient: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.42, 0, 0.58, 1] } // cubic-bezier (ease-in-out)
    },
  };

  return (
    <ThemeProvider theme={authTheme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        preventDuplicate
        dense
        autoHideDuration={4000}
      >
        <AuthLayout>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header */}
            <motion.div variants={itemVariants}>
              <AuthHeader
                title="Bienvenido de vuelta"
                subtitle="Inicia sesión en tu cuenta de Raquet Power"
              />
            </motion.div>

            {/* Form */}
            <motion.div variants={itemVariants}>
              <SignInForm />
            </motion.div>
          </motion.div>
        </AuthLayout>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default SignInPageClient;