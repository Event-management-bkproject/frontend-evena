'use client';

import React from 'react';
import { Box, CircularProgress, Typography, Container } from '@mui/material';
import { keyframes } from '@mui/system';

// Fade in animation
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Pulse animation for logo
const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

interface AuthLoadingPageProps {
  message?: string;
}

/**
 * Full-page authentication loading screen
 * Displayed during auth initialization
 */
export const AuthLoadingPage: React.FC<AuthLoadingPageProps> = ({
  message = 'Initializing authentication...'
}) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            textAlign: 'center',
            animation: `${fadeIn} 0.6s ease-out`,
          }}
        >
          {/* Logo or Brand */}
          <Box
            sx={{
              mb: 4,
              animation: `${pulse} 2s ease-in-out infinite`,
            }}
          >
            <Typography
              variant="h2"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                letterSpacing: '2px',
              }}
            >
              EVENA
            </Typography>
          </Box>

          {/* Loading Spinner */}
          <Box sx={{ mb: 3 }}>
            <CircularProgress
              size={60}
              thickness={4}
              sx={{
                color: 'white',
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                },
              }}
            />
          </Box>

          {/* Loading Message */}
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 400,
              mb: 1,
            }}
          >
            {message}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            Please wait a moment...
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AuthLoadingPage;
