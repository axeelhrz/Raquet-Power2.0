'use client';

import React, { useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import authTheme from '@/theme/authTheme';

// Crear cache de Emotion para evitar conflictos de hidratación
const createEmotionCache = () => {
  return createCache({ key: 'css', prepend: true });
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [emotionCache] = useState(() => createEmotionCache());
  const [mounted, setMounted] = useState(false);

  // Evitar problemas de hidratación esperando a que el componente se monte
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Renderizar una versión simplificada durante la hidratación
    return (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    );
  }

  return (
    <CacheProvider value={emotionCache}>
      <MuiThemeProvider theme={authTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </CacheProvider>
  );
}
