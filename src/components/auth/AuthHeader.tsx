'use client';

import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          mb: 4,
        }}
      >
        {/* Icon Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Avatar
            sx={{
              width: 64,
              height: 64,
              mb: 3,
              background: 'linear-gradient(135deg, #2F6DFB 0%, #6AA6FF 100%)',
              boxShadow: '0 8px 20px rgba(47, 109, 251, 0.25)',
            }}
          >
            <SportsBaseballIcon 
              sx={{ 
                fontSize: 28, 
                color: 'white',
                transform: 'rotate(-15deg)',
              }} 
            />
          </Avatar>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.25rem', sm: '2.75rem' },
              fontWeight: 700,
              color: 'text.primary',
              mb: 1,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Typography
            variant="h2"
            sx={{
              fontSize: '1.125rem',
              fontWeight: 500,
              color: 'text.secondary',
              maxWidth: 400,
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </Typography>
        </motion.div>
      </Box>
    </motion.div>
  );
};

export default AuthHeader;