'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CircularProgress,
} from '@mui/material';
import { CheckCircle, Cancel, HourglassEmpty } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import { useTranslation } from 'react-i18next';

// MoMo redirects back here with query params:
//   orderId    — our internal order ID (set in returnUrl when initiating checkout)
//   resultCode — MoMo result code (0 = success)
//   message    — MoMo message
//   (other MoMo params: partnerCode, requestId, amount, etc.)

type PaymentResult = 'success' | 'failed' | 'pending';

export default function PaymentReturnPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  const [result, setResult] = useState<PaymentResult>('pending');

  const orderId = searchParams.get('orderId');
  // MoMo resultCode: 0 = success, anything else = failure
  const resultCode = searchParams.get('resultCode');
  const momoMessage = searchParams.get('message');

  useEffect(() => {
    if (resultCode === null) {
      // No resultCode — may have navigated here directly, treat as pending
      setResult('pending');
      return;
    }
    setResult(resultCode === '0' ? 'success' : 'failed');
  }, [resultCode]);

  const config: Record<PaymentResult, {
    icon: React.ReactNode;
    color: string;
    titleKey: string;
    descKey: string;
  }> = {
    success: {
      icon: <CheckCircle sx={{ fontSize: 80, color: '#4CAF50' }} />,
      color: '#4CAF50',
      titleKey: 'payment.successTitle',
      descKey: 'payment.successDesc',
    },
    failed: {
      icon: <Cancel sx={{ fontSize: 80, color: '#F44336' }} />,
      color: '#F44336',
      titleKey: 'payment.failedTitle',
      descKey: 'payment.failedDesc',
    },
    pending: {
      icon: <HourglassEmpty sx={{ fontSize: 80, color: '#FF9800' }} />,
      color: '#FF9800',
      titleKey: 'payment.pendingTitle',
      descKey: 'payment.pendingDesc',
    },
  };

  const { icon, color, titleKey, descKey } = config[result];

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <Container maxWidth="sm" sx={{ py: 8, flex: 1, display: 'flex', alignItems: 'center' }}>
        <Card
          sx={{
            width: '100%',
            p: 5,
            borderRadius: '24px',
            textAlign: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          }}
        >
          <Box sx={{ mb: 3 }}>{icon}</Box>

          <Typography variant="h4" fontWeight={700} sx={{ color: '#2A3363', mb: 1 }}>
            {t(titleKey)}
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            {t(descKey)}
          </Typography>

          {momoMessage && result === 'failed' && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {momoMessage}
            </Typography>
          )}

          {orderId && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Order #{orderId}
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {result === 'success' && (
              <Button
                variant="contained"
                onClick={() => router.push('/dashboard/customer/my-tickets')}
                sx={{
                  backgroundColor: '#F36BF9',
                  borderRadius: '12px',
                  fontWeight: 700,
                  px: 4,
                  '&:hover': { backgroundColor: '#e55ae0' },
                }}
              >
                {t('customer.viewMyTickets')}
              </Button>
            )}

            {orderId && (
              <Button
                variant="outlined"
                onClick={() => router.push(`/dashboard/customer/cart/${orderId}`)}
                sx={{ borderRadius: '12px', fontWeight: 700, px: 4 }}
              >
                {t('customer.viewOrder')}
              </Button>
            )}

            <Button
              variant="text"
              onClick={() => router.push('/dashboard/customer/cart')}
              sx={{ borderRadius: '12px', fontWeight: 700, px: 4 }}
            >
              {t('customer.backToOrders')}
            </Button>
          </Box>
        </Card>
      </Container>

      <Footer />
    </Box>
  );
}
