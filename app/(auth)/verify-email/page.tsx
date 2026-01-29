// app/verify-email/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Typography, Paper, Button, CircularProgress, Alert } from '@mui/material';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const hasVerified = useRef(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Prevent double verification (React StrictMode calls useEffect twice)
    if (hasVerified.current) {
      return;
    }

    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage(t('verifyEmail.invalidLink'));
        return;
      }

      hasVerified.current = true;

      try {
        const res = await fetch(`http://localhost:8080/api/auth/verify-email?token=${token}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setStatus('success');
          setMessage(data.message || t('verifyEmail.success'));
        } else {
          setStatus('error');
          setMessage(data.message || t('verifyEmail.failed'));
        }
      } catch (error) {
        setStatus('error');
        setMessage(t('verifyEmail.networkError'));
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #EEF0FF 0%, #FCD3FF 100%)',
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          borderRadius: 2,
          backgroundColor: '#EEF0FF',
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Image src="/logoOrg.svg" alt="Evena Logo" width={150} height={50} priority />
        </Box>

        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#37437D' }}>
          {t('verifyEmail.title')}
        </Typography>

        {status === 'loading' && (
          <Box sx={{ my: 4 }}>
            <CircularProgress size={60} sx={{ color: '#37437D', mb: 2 }} />
            <Typography variant="body1" sx={{ color: '#37437D' }}>
              {t('verifyEmail.verifying')}
            </Typography>
          </Box>
        )}

        {status === 'success' && (
          <Box sx={{ my: 4 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              {message}
            </Alert>
            <Typography variant="body1" sx={{ color: '#37437D', mb: 3 }}>
              {t('verifyEmail.successMessage')}
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/login')}
              sx={{
                backgroundColor: '#37437D',
                '&:hover': { backgroundColor: '#2a3361' },
                px: 4,
                py: 1.5,
              }}
            >
              {t('common.buttons.login')}
            </Button>
          </Box>
        )}

        {status === 'error' && (
          <Box sx={{ my: 4 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {message}
            </Alert>
            <Typography variant="body1" sx={{ color: '#37437D', mb: 3 }}>
              {t('verifyEmail.errorMessage')}
            </Typography>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push('/register')}
              sx={{
                borderColor: '#37437D',
                color: '#37437D',
                '&:hover': { backgroundColor: '#37437D', color: 'white' },
                px: 4,
                py: 1.5,
                mr: 2,
              }}
            >
              {t('verifyEmail.registerAgain')}
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/login')}
              sx={{
                backgroundColor: '#37437D',
                '&:hover': { backgroundColor: '#2a3361' },
                px: 4,
                py: 1.5,
              }}
            >
              {t('common.buttons.login')}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
