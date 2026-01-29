// app/verify-email/check-email/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Typography, Paper, Button } from '@mui/material';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export default function CheckEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const { t } = useTranslation();

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
          {t('checkEmail.title')}
        </Typography>

        <Typography variant="body1" sx={{ color: '#37437D', mb: 3, lineHeight: 1.6 }}>
          {t('checkEmail.sentTo')}
          <br />
          <strong>{email || t('checkEmail.yourEmail')}</strong>
        </Typography>

        <Typography variant="body2" sx={{ color: '#666', mb: 4, lineHeight: 1.6 }}>
          {t('checkEmail.instructions')}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={() => router.push('/register')}
            sx={{
              borderColor: '#37437D',
              color: '#37437D',
              '&:hover': { backgroundColor: '#37437D', color: 'white' },
              px: 3,
            }}
          >
            {t('checkEmail.backToRegister')}
          </Button>
          <Button
            variant="contained"
            onClick={() => router.push('/login')}
            sx={{
              backgroundColor: '#37437D',
              '&:hover': { backgroundColor: '#2a3361' },
              px: 3,
            }}
          >
            {t('checkEmail.goToLogin')}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
