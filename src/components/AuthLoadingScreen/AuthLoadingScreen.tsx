'use client';

import { Box, CircularProgress, Typography } from '@mui/material';
import { ConfirmationNumber } from '@mui/icons-material';

export default function AuthLoadingScreen() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F36BF9 0%, #e55ae0 50%, #d64cd1 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background circles */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(60px)',
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-20px)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(80px)',
          animation: 'float 8s ease-in-out infinite',
          animationDelay: '1s',
        }}
      />

      {/* Loading content */}
      <Box
        sx={{
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '24px',
          p: 6,
          minWidth: 320,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Logo */}
        <Box
          component="img"
          src="/logoCus.svg"
          alt="Evena Logo"
          sx={{
            height: 60,
            width: 'auto',
            mb: 3,
            mx: 'auto',
            display: 'block',
          }}
        />

        {/* Spinner */}
        <Box
          sx={{
            position: 'relative',
            display: 'inline-flex',
            mb: 3,
          }}
        >
          <CircularProgress
            size={60}
            thickness={4}
            sx={{
              color: '#F36BF9',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ConfirmationNumber sx={{ color: '#F36BF9', fontSize: 28 }} />
          </Box>
        </Box>

        {/* Text */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: '#2A3363',
            mb: 1,
          }}
        >
          Welcome to Evena
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#666',
          }}
        >
          Preparing your experience...
        </Typography>
      </Box>
    </Box>
  );
}
