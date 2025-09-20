'use client';

import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Avatar
} from '@mui/material';
import { motion } from 'framer-motion';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  isDeleting?: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isDeleting = false,
}: DeleteConfirmationModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
        }
      }}
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'flex-start',
          paddingTop: '10vh',
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <DialogTitle sx={{ pb: 2, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {title}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pb: 2 }}>
          <Stack spacing={3} alignItems="center">
            {/* Warning Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  backgroundColor: 'error.50',
                  border: '3px solid',
                  borderColor: 'error.100',
                }}
              >
                <svg 
                  className="h-10 w-10" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  style={{ color: 'var(--mui-palette-error-main)' }}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" 
                  />
                </svg>
              </Avatar>
            </motion.div>

            {/* Message */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary', 
                  mb: 2,
                  fontSize: '1.1rem',
                  lineHeight: 1.6
                }}
              >
                {message}
              </Typography>
              
              {itemName && (
                <Box
                  sx={{
                    backgroundColor: 'grey.50',
                    border: '1px solid',
                    borderColor: 'grey.200',
                    borderRadius: 2,
                    px: 3,
                    py: 2,
                    mb: 2,
                  }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 600,
                      color: 'text.primary',
                      fontSize: '1rem'
                    }}
                  >
                    &quot;{itemName}&quot;
                  </Typography>
                </Box>
              )}
              
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  fontStyle: 'italic'
                }}
              >
                Esta acción no se puede deshacer.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
            <Button
              onClick={onClose}
              disabled={isDeleting}
              variant="outlined"
              size="large"
              sx={{
                flex: 1,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                borderColor: 'grey.300',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'grey.400',
                  backgroundColor: 'grey.50',
                },
                '&:disabled': {
                  opacity: 0.6,
                },
              }}
            >
              Cancelar
            </Button>
            
            <Button
              onClick={onConfirm}
              disabled={isDeleting}
              variant="contained"
              size="large"
              sx={{
                flex: 1,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                backgroundColor: 'error.main',
                color: 'white',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                '&:hover': {
                  backgroundColor: 'error.dark',
                  boxShadow: '0 6px 16px rgba(239, 68, 68, 0.4)',
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  opacity: 0.6,
                  cursor: 'not-allowed',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {isDeleting ? (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <svg 
                      className="h-5 w-5" 
                      fill="none" 
                      viewBox="0 0 24 24"
                      style={{ color: 'white' }}
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </motion.div>
                  <Typography>Eliminando...</Typography>
                </Stack>
              ) : (
                'Eliminar'
              )}
            </Button>
          </Stack>
        </DialogActions>
      </motion.div>
    </Dialog>
  );
}