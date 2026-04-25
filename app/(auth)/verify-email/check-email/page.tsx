'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Typography, Paper, Button } from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
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
        {/* Icon */}
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(243,107,249,0.12), rgba(96,147,252,0.12))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
          }}
        >
          <MarkEmailReadIcon sx={{ fontSize: 36, background: 'linear-gradient(135deg, #F36BF9, #6093FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', mb: 1, letterSpacing: '-0.5px' }}>
          {t('checkEmail.title')}
        </Typography>

        <Typography variant="body2" sx={{ color: '#64748B', mb: 1, lineHeight: 1.7 }}>
          {t('checkEmail.sentTo')}
        </Typography>
        <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 700, mb: 3 }}>
          {email || t('checkEmail.yourEmail')}
        </Typography>

        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 4, lineHeight: 1.7, fontSize: 13 }}>
          {t('checkEmail.instructions')}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
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
            {t('checkEmail.backToRegister')}
          </Button>
          <Button
            variant="contained"
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
            {t('checkEmail.goToLogin')}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
