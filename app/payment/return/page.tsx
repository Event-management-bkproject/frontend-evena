'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
} from '@mui/material';
import { CheckCircle, Cancel, HourglassEmpty } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import { useTranslation } from 'react-i18next';

// Payment return page — handles both MoMo and VNPay redirects.
//
// MoMo params:  resultCode (0 = success), message
// VNPay params: vnp_ResponseCode ("00" = success), vnp_OrderInfo
//
// Our internal order ID is always in the 'ref' query param, which we append
// to the returnUrl before the gateway adds its own params.

type PaymentResult = 'success' | 'failed' | 'pending';

function resolveResult(searchParams: URLSearchParams): PaymentResult {
  // VNPay
  const vnpCode = searchParams.get('vnp_ResponseCode');
  if (vnpCode !== null) {
    return vnpCode === '00' ? 'success' : 'failed';
  }
  // MoMo
  const resultCode = searchParams.get('resultCode');
  if (resultCode !== null) {
    return resultCode === '0' ? 'success' : 'failed';
  }
  return 'pending';
}

export default function PaymentReturnPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  const [result, setResult] = useState<PaymentResult>('pending');

  // 'ref' carries our internal order ID for both gateways
  const orderId = searchParams.get('ref');
  const errorMessage =
    searchParams.get('message') ||
    (searchParams.get('vnp_ResponseCode') && searchParams.get('vnp_ResponseCode') !== '00'
      ? `VNPay error: ${searchParams.get('vnp_ResponseCode')}`
      : null);

  useEffect(() => {
    setResult(resolveResult(searchParams));
  }, [searchParams]);

  const config: Record<PaymentResult, {
    icon: React.ReactNode;
    titleKey: string;
    descKey: string;
  }> = {
    success: {
      icon: <CheckCircle sx={{ fontSize: 80, color: '#4CAF50' }} />,
      titleKey: 'payment.successTitle',
      descKey: 'payment.successDesc',
    },
    failed: {
      icon: <Cancel sx={{ fontSize: 80, color: '#F44336' }} />,
      titleKey: 'payment.failedTitle',
      descKey: 'payment.failedDesc',
    },
    pending: {
      icon: <HourglassEmpty sx={{ fontSize: 80, color: '#FF9800' }} />,
      titleKey: 'payment.pendingTitle',
      descKey: 'payment.pendingDesc',
    },
  };

  const { icon, titleKey, descKey } = config[result];

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

          {errorMessage && result === 'failed' && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {errorMessage}
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
