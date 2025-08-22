'use client';

import React from 'react';
import { Box, Typography, Card, Avatar } from '@mui/material';
import { motion, Variants } from 'framer-motion';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';

interface RoleSelectorProps {
  selectedRole: string;
  onRoleSelect: (role: 'liga' | 'miembro' | 'club') => void;
}

interface Role {
  id: 'liga' | 'miembro' | 'club';
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
}

const roles: Role[] = [
  {
    id: 'liga',
    name: 'Liga',
    description: 'Administra múltiples clubes y competencias deportivas',
    icon: 'M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z',
    color: '#2F6DFB',
    bgColor: 'linear-gradient(135deg, rgba(47, 109, 251, 0.08) 0%, rgba(47, 109, 251, 0.04) 100%)'
  },
  {
    id: 'miembro',
    name: 'Miembro',
    description: 'Participa en actividades y competencias del club',
    icon: 'M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z',
    color: '#10B981',
    bgColor: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%)'
  },
  {
    id: 'club',
    name: 'Club',
    description: 'Gestiona miembros y actividades deportivas del club',
    icon: 'M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2ZM12 7C13.1 7 14 7.9 14 9S13.1 11 12 11 10 10.1 10 9 10.9 7 12 7ZM18 15C18 12.34 15.33 10.5 12 10.5S6 12.34 6 15V16H18V15Z',
    color: '#8B5CF6',
    bgColor: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%)'
  }
];

const getIconComponent = (roleId: string) => {
  switch (roleId) {
    case 'liga':
      return SportsTennisIcon;
    case 'miembro':
      return PersonIcon;
    case 'club':
      return BusinessIcon;
    default:
      return PersonIcon;
  }
};

const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onRoleSelect }) => {
  const containerVariants: Variants = {
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
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } // replaced string easing with cubic-bezier array
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box sx={{ mb: 4 }}>
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'text.primary',
                mb: 1.5,
                letterSpacing: '-0.01em',
              }}
            >
              Selecciona tu tipo de cuenta
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                fontSize: '1rem',
                lineHeight: 1.6,
                maxWidth: 400,
                mx: 'auto',
              }}
            >
              Elige el rol que mejor describa tu participación en Raquet Power
            </Typography>
          </Box>
        </motion.div>

        {/* Role Cards */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {roles.map((role) => {
            const IconComponent = getIconComponent(role.id);
            const isSelected = selectedRole === role.id;
            
            return (
              <motion.div
                key={role.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  onClick={() => onRoleSelect(role.id)}
                  sx={{
                    p: 3,
                    cursor: 'pointer',
                    border: isSelected ? `2px solid ${role.color}` : '2px solid',
                    borderColor: isSelected ? role.color : 'divider',
                    borderRadius: 3,
                    background: isSelected ? role.bgColor : 'background.paper',
                    boxShadow: isSelected 
                      ? `0 8px 25px ${role.color}20, 0 4px 10px ${role.color}10`
                      : '0 2px 8px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      boxShadow: isSelected 
                        ? `0 12px 35px ${role.color}25, 0 6px 15px ${role.color}15`
                        : '0 4px 15px rgba(0, 0, 0, 0.08)',
                      transform: 'translateY(-2px)',
                      borderColor: isSelected ? role.color : 'primary.light',
                    },
                  }}
                >
                  {/* Selection Indicator */}
                  {isSelected && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: `linear-gradient(90deg, ${role.color} 0%, ${role.color}80 100%)`,
                      }}
                    />
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    {/* Icon */}
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        backgroundColor: isSelected ? role.color : 'background.default',
                        color: isSelected ? 'white' : role.color,
                        transition: 'all 0.3s ease',
                        boxShadow: isSelected 
                          ? `0 4px 12px ${role.color}30`
                          : '0 2px 8px rgba(0, 0, 0, 0.08)',
                      }}
                    >
                      <IconComponent sx={{ fontSize: 28 }} />
                    </Avatar>

                    {/* Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: '1.125rem',
                          fontWeight: 600,
                          color: isSelected ? role.color : 'text.primary',
                          mb: 0.5,
                          transition: 'color 0.3s ease',
                        }}
                      >
                        {role.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.875rem',
                          lineHeight: 1.5,
                        }}
                      >
                        {role.description}
                      </Typography>
                    </Box>

                    {/* Selection Indicator */}
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        border: '2px solid',
                        borderColor: isSelected ? role.color : 'divider',
                        backgroundColor: isSelected ? role.color : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        flexShrink: 0,
                      }}
                    >
                      {isSelected && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2, delay: 0.1 }}
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M10 3L4.5 8.5L2 6"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </motion.svg>
                      )}
                    </Box>
                  </Box>
                </Card>
              </motion.div>
            );
          })}
        </Box>
      </Box>
    </motion.div>
  );
};

export default RoleSelector;