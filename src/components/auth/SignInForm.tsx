'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Link,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Fade,
} from '@mui/material';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useSignIn } from '@/hooks/useSignIn';
import NextLink from 'next/link';

// Zod schema for form validation
const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'El correo electrónico es requerido')
    .email('Ingresa un correo electrónico válido'),
  password: z
    .string()
    .trim()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  remember: z.boolean().optional(),
});

type SignInFormData = z.infer<typeof signInSchema>;

const SignInForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { signIn, isLoading, error, clearError } = useSignIn();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });


  const onSubmit = async (data: SignInFormData) => {
    clearError();
    await signIn(data);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    },
  };

  const getFieldState = (fieldName: string, value: string, hasError: boolean) => {
    if (hasError) return 'error';
    if (value && !hasError) return 'success';
    if (focusedField === fieldName) return 'focused';
    return 'default';
  };

  const getIconColor = (state: string) => {
    switch (state) {
      case 'error': return 'error.main';
      case 'success': return 'success.main';
      case 'focused': return 'primary.main';
      default: return 'text.secondary';
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Alert 
                severity="error" 
                onClose={clearError}
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  '& .MuiAlert-message': {
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }
                }}
              >
                {error}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email Field */}
        <motion.div variants={itemVariants}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => {
              const fieldState = getFieldState('email', field.value, !!errors.email);
              
              return (
                <Box sx={{ position: 'relative', mb: 3 }}>
                  <TextField
                    {...field}
                    fullWidth
                    label="Correo electrónico"
                    type="email"
                    autoComplete="username"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={isLoading}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="tu@email.com"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon 
                            sx={{ 
                              color: getIconColor(fieldState),
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              fontSize: 20,
                            }} 
                          />
                        </InputAdornment>
                      ),
                      endAdornment: field.value && !errors.email && (
                        <InputAdornment position="end">
                          <Fade in={true}>
                            <CheckCircleIcon 
                              sx={{ 
                                color: 'success.main',
                                fontSize: 20,
                              }} 
                            />
                          </Fade>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: 56,
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        '& fieldset': {
                          borderColor: fieldState === 'error' ? 'error.main' : 
                                      fieldState === 'success' ? 'success.light' :
                                      fieldState === 'focused' ? 'primary.main' : 'divider',
                          borderWidth: fieldState === 'focused' ? 2 : 1,
                        },
                        '&:hover fieldset': {
                          borderColor: fieldState === 'error' ? 'error.main' : 
                                      fieldState === 'success' ? 'success.main' :
                                      'primary.light',
                        },
                        '&.Mui-focused': {
                          transform: 'scale(1.005)',
                          boxShadow: fieldState === 'error' ? 
                            '0 0 0 4px rgba(244, 67, 54, 0.08)' :
                            '0 0 0 4px rgba(47, 109, 251, 0.08)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: fieldState === 'error' ? 'error.main' : 'text.secondary',
                        fontWeight: 500,
                        fontSize: '0.9375rem',
                        '&.Mui-focused': {
                          color: fieldState === 'error' ? 'error.main' : 'primary.main',
                        },
                      },
                      '& .MuiOutlinedInput-input': {
                        fontSize: '0.9375rem',
                        fontWeight: 400,
                        '&::placeholder': {
                          color: 'text.disabled',
                          opacity: 0.7,
                        },
                      },
                      '& .MuiFormHelperText-root': {
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        marginLeft: 0,
                        marginTop: 1,
                      },
                    }}
                  />
                </Box>
              );
            }}
          />
        </motion.div>

        {/* Password Field */}
        <motion.div variants={itemVariants}>
          <Controller
            name="password"
            control={control}
            render={({ field }) => {
              const fieldState = getFieldState('password', field.value, !!errors.password);
              
              return (
                <Box sx={{ position: 'relative', mb: 2 }}>
                  <TextField
                    {...field}
                    fullWidth
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    disabled={isLoading}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Ingresa tu contraseña"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon 
                            sx={{ 
                              color: getIconColor(fieldState),
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              fontSize: 20,
                            }} 
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {field.value && !errors.password && (
                              <Fade in={true}>
                                <CheckCircleIcon 
                                  sx={{ 
                                    color: 'success.main',
                                    fontSize: 20,
                                  }} 
                                />
                              </Fade>
                            )}
                            <IconButton
                              onClick={togglePasswordVisibility}
                              edge="end"
                              disabled={isLoading}
                              sx={{ 
                                color: 'text.secondary',
                                '&:hover': {
                                  color: 'text.primary',
                                  backgroundColor: 'action.hover',
                                },
                                transition: 'all 0.2s ease',
                              }}
                            >
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </Box>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: 56,
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        '& fieldset': {
                          borderColor: fieldState === 'error' ? 'error.main' : 
                                      fieldState === 'success' ? 'success.light' :
                                      fieldState === 'focused' ? 'primary.main' : 'divider',
                          borderWidth: fieldState === 'focused' ? 2 : 1,
                        },
                        '&:hover fieldset': {
                          borderColor: fieldState === 'error' ? 'error.main' : 
                                      fieldState === 'success' ? 'success.main' :
                                      'primary.light',
                        },
                        '&.Mui-focused': {
                          transform: 'scale(1.005)',
                          boxShadow: fieldState === 'error' ? 
                            '0 0 0 4px rgba(244, 67, 54, 0.08)' :
                            '0 0 0 4px rgba(47, 109, 251, 0.08)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: fieldState === 'error' ? 'error.main' : 'text.secondary',
                        fontWeight: 500,
                        fontSize: '0.9375rem',
                        '&.Mui-focused': {
                          color: fieldState === 'error' ? 'error.main' : 'primary.main',
                        },
                      },
                      '& .MuiOutlinedInput-input': {
                        fontSize: '0.9375rem',
                        fontWeight: 400,
                        '&::placeholder': {
                          color: 'text.disabled',
                          opacity: 0.7,
                        },
                      },
                      '& .MuiFormHelperText-root': {
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        marginLeft: 0,
                        marginTop: 1,
                      },
                    }}
                  />
                </Box>
              );
            }}
          />
        </motion.div>

        {/* Remember Me & Forgot Password */}
        <motion.div variants={itemVariants}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 4,
              mt: 3,
            }}
          >
            <Controller
              name="remember"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={field.value || false}
                      disabled={isLoading}
                      size="small"
                      sx={{
                        '&.Mui-checked': {
                          color: 'primary.main',
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(47, 109, 251, 0.04)',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'text.secondary',
                      }}
                    >
                      Recordarme
                    </Typography>
                  }
                />
              )}
            />
            <Link
              component={NextLink}
              href="/auth/forgot-password"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                textDecoration: 'none',
                color: 'primary.main',
                transition: 'all 0.2s ease',
                '&:hover': {
                  textDecoration: 'underline',
                  color: 'primary.dark',
                },
              }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </Box>
        </motion.div>

        {/* Sign In Button */}
        <motion.div variants={itemVariants}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading || !isValid}
            sx={{
              height: 56,
              mb: 4,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: 2,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(47, 109, 251, 0.15)',
              '&:hover': {
                boxShadow: '0 8px 20px rgba(47, 109, 251, 0.25)',
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
              '&:disabled': {
                backgroundColor: 'action.disabledBackground',
                color: 'action.disabled',
                boxShadow: 'none',
                transform: 'none',
              },
            }}
            component={motion.button}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1 }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CircularProgress size={20} color="inherit" />
                <Typography variant="button" sx={{ fontWeight: 600 }}>
                  Iniciando sesión...
                </Typography>
              </Box>
            ) : (
              'Iniciar sesión'
            )}
          </Button>
        </motion.div>

        {/* Sign Up Link */}
        <motion.div variants={itemVariants}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.875rem',
              }}
            >
              ¿No tienes cuenta?{' '}
              <Link
                component={NextLink}
                href="/auth/sign-up"
                sx={{
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: 'primary.main',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    textDecoration: 'underline',
                    color: 'primary.dark',
                  },
                }}
              >
                Crear nueva cuenta
              </Link>
            </Typography>
          </Box>
        </motion.div>
      </Box>
    </motion.div>
  );
};

export default SignInForm;