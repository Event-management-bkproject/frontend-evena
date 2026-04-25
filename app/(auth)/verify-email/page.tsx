'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
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
    if (hasVerified.current) return;

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
      } catch {
        setStatus('error');
        setMessage(t('verifyEmail.networkError'));
      }
    };

    verifyEmail();
  }, [token, t]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 45%, #0f3460 100%)',
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, sm: 5 },
          borderRadius: '20px',
          backgroundColor: '#fff',
          maxWidth: 460,
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Evena brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 4 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #F36BF9 0%, #6093FC 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M3 4C1.897 4 1 4.897 1 6V8c0 .275.231.49.491.581C2.078 8.784 2.5 9.344 2.5 10s-.422 1.216-1.009 1.419C1.231 11.51 1 11.725 1 12v2C1 15.103 1.897 16 3 16h14c1.103 0 2-.897 2-2v-2c0-.275-.231-.49-.491-.581C17.922 11.216 17.5 10.656 17.5 10s.422-1.216 1.009-1.419C18.769 8.49 19 8.275 19 8V6c0-1.103-.897-2-2-2H3Z" fill="white"/>
            </svg>
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: 18, color: '#0F172A' }}>Evena</Typography>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.5, letterSpacing: '-0.5px' }}>
          {t('verifyEmail.title')}
        </Typography>

        {status === 'loading' && (
          <Box sx={{ my: 4 }}>
            <CircularProgress
              size={52}
              sx={{
                mb: 2,
                '& .MuiCircularProgress-circle': {
                  stroke: 'url(#grad)',
                },
                color: '#6093FC',
              }}
            />
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              {t('verifyEmail.verifying')}
            </Typography>
          </Box>
        )}

        {status === 'success' && (
          <Box sx={{ my: 3 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: 'rgba(34,197,94,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <CheckCircleOutlineIcon sx={{ fontSize: 32, color: '#22C55E' }} />
            </Box>
            <Typography variant="body2" sx={{ color: '#16A34A', fontWeight: 600, mb: 1 }}>
              {message}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 3, lineHeight: 1.7 }}>
              {t('verifyEmail.successMessage')}
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/login')}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #F36BF9, #6093FC)',
                boxShadow: '0 4px 14px rgba(96,147,252,0.35)',
                '&:hover': { background: 'linear-gradient(135deg, #e055e8, #4a7ef0)' },
                px: 4,
              }}
            >
              {t('common.buttons.login')}
            </Button>
          </Box>
        )}

        {status === 'error' && (
          <Box sx={{ my: 3 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: 'rgba(239,68,68,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <ErrorOutlineIcon sx={{ fontSize: 32, color: '#EF4444' }} />
            </Box>
            <Typography variant="body2" sx={{ color: '#DC2626', fontWeight: 600, mb: 1 }}>
              {message}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 3, lineHeight: 1.7 }}>
              {t('verifyEmail.errorMessage')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push('/register')}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: '#E2E8F0',
                  color: '#64748B',
                  '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
                  px: 3,
                }}
              >
                {t('verifyEmail.registerAgain')}
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push('/login')}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #F36BF9, #6093FC)',
                  boxShadow: '0 4px 14px rgba(96,147,252,0.35)',
                  '&:hover': { background: 'linear-gradient(135deg, #e055e8, #4a7ef0)' },
                  px: 3,
                }}
              >
                {t('common.buttons.login')}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
