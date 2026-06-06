'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  HourglassEmpty,
  ConfirmationNumber,
  Home,
  Receipt,
  SwapHoriz,
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import { useTranslation } from 'react-i18next';

// Payment return page — handles both MoMo and VNPay redirects for:
//   - Regular orders:  ?ref={orderId}
//   - FlexPass:        ?flexpassRef={purchaseId}
//
// MoMo params:  resultCode (0 = success), message
// VNPay params: vnp_ResponseCode ("00" = success), vnp_OrderInfo

type PaymentResult = 'success' | 'failed' | 'pending';

function resolveResult(searchParams: URLSearchParams): PaymentResult {
  const vnpCode = searchParams.get('vnp_ResponseCode');
  if (vnpCode !== null) {
    return vnpCode === '00' ? 'success' : 'failed';
  }
  const resultCode = searchParams.get('resultCode');
  if (resultCode !== null) {
    return resultCode === '0' ? 'success' : 'failed';
  }
  return 'pending';
}

const RESULT_CONFIG = {
  success: {
    gradient: 'linear-gradient(135deg, #22C55E, #16A34A)',
    Icon: CheckCircle,
    titleKey: 'payment.successTitle',
    descKey: 'payment.successDesc',
  },
  failed: {
    gradient: 'linear-gradient(135deg, #EF4444, #DC2626)',
    Icon: Cancel,
    titleKey: 'payment.failedTitle',
    descKey: 'payment.failedDesc',
  },
  pending: {
    gradient: 'linear-gradient(135deg, #F97316, #EA580C)',
    Icon: HourglassEmpty,
    titleKey: 'payment.pendingTitle',
    descKey: 'payment.pendingDesc',
  },
};

export default function PaymentReturnPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  const [result, setResult] = useState<PaymentResult>('pending');

  const orderId = searchParams.get('ref');
  const flexpassRef = searchParams.get('flexpassRef');
  const isFlexPass = Boolean(flexpassRef);

  const errorMessage =
    searchParams.get('message') ||
    (searchParams.get('vnp_ResponseCode') && searchParams.get('vnp_ResponseCode') !== '00'
      ? `VNPay error: ${searchParams.get('vnp_ResponseCode')}`
      : null);

  useEffect(() => {
    setResult(resolveResult(searchParams));
  }, [searchParams]);

  const { gradient, Icon, titleKey, descKey } = RESULT_CONFIG[result];

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: gradient,
          position: 'relative',
          overflow: 'hidden',
          py: { xs: 6, md: 8 },
          textAlign: 'center',
        }}
      >
        <Box sx={{ position: 'absolute', top: -60, left: '5%', width: 260, height: 260, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -40, right: '8%', width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)', filter: 'blur(40px)', pointerEvents: 'none' }} />

        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <Icon sx={{ fontSize: 48, color: '#fff' }} />
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', mb: 1.5 }}>
            {t(titleKey)}
          </Typography>

          <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 1.6 }}>
            {isFlexPass && result === 'success'
              ? 'Your FlexPass ticket has been successfully transferred to your account.'
              : t(descKey)}
          </Typography>

          {errorMessage && result === 'failed' && (
            <Box
              sx={{
                mt: 2,
                px: 2.5,
                py: 1,
                borderRadius: '12px',
                bgcolor: 'rgba(255,255,255,0.15)',
                display: 'inline-block',
              }}
            >
              <Typography sx={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
                {errorMessage}
              </Typography>
            </Box>
          )}
        </Container>
      </Box>

      {/* ── Action card ───────────────────────────────────────────── */}
      <Container maxWidth="sm" sx={{ py: 4, flex: 1 }}>
        <Box
          sx={{
            bgcolor: '#fff',
            borderRadius: '20px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
            overflow: 'hidden',
          }}
        >
          {/* Reference info row */}
          {(flexpassRef || orderId) && (
            <>
              <Box sx={{ px: 4, py: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {isFlexPass
                  ? <SwapHoriz sx={{ fontSize: 20, color: '#94A3B8' }} />
                  : <ConfirmationNumber sx={{ fontSize: 20, color: '#94A3B8' }} />}
                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {isFlexPass ? 'FlexPass Purchase' : t('common.entities.order')}
                  </Typography>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#1E293B' }}>
                    #{isFlexPass ? flexpassRef : orderId}
                  </Typography>
                </Box>
              </Box>
              <Divider />
            </>
          )}

          <Box sx={{ px: 4, py: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* FlexPass success actions */}
            {isFlexPass && result === 'success' && (
              <Button
                fullWidth
                variant="contained"
                startIcon={<ConfirmationNumber />}
                onClick={() => router.push('/dashboard/customer/cart?tab=1')}
                sx={{
                  background: 'linear-gradient(135deg, #F36BF9, #a855f7)',
                  borderRadius: '12px',
                  fontWeight: 700,
                  py: 1.4,
                  textTransform: 'none',
                  fontSize: 15,
                  boxShadow: '0 4px 14px rgba(243,107,249,0.35)',
                  '&:hover': { background: 'linear-gradient(135deg, #e055e6, #9333ea)' },
                }}
              >
                {t('customer.viewMyTickets')}
              </Button>
            )}

            {/* FlexPass failed / pending: go back to marketplace */}
            {isFlexPass && result !== 'success' && (
              <Button
                fullWidth
                variant="contained"
                startIcon={<SwapHoriz />}
                onClick={() => router.push('/dashboard/customer/flexpass')}
                sx={{
                  background: 'linear-gradient(135deg, #64748B, #475569)',
                  borderRadius: '12px',
                  fontWeight: 700,
                  py: 1.4,
                  textTransform: 'none',
                  fontSize: 15,
                  '&:hover': { background: 'linear-gradient(135deg, #475569, #334155)' },
                }}
              >
                Back to FlexPass Marketplace
              </Button>
            )}

            {/* Regular order success: view tickets */}
            {!isFlexPass && result === 'success' && (
              <Button
                fullWidth
                variant="contained"
                startIcon={<ConfirmationNumber />}
                onClick={() => router.push('/dashboard/customer/cart?tab=1')}
                sx={{
                  background: 'linear-gradient(135deg, #F36BF9, #a855f7)',
                  borderRadius: '12px',
                  fontWeight: 700,
                  py: 1.4,
                  textTransform: 'none',
                  fontSize: 15,
                  boxShadow: '0 4px 14px rgba(243,107,249,0.35)',
                  '&:hover': { background: 'linear-gradient(135deg, #e055e6, #9333ea)' },
                }}
              >
                {t('customer.viewMyTickets')}
              </Button>
            )}

            {/* Regular order: view order detail */}
            {!isFlexPass && orderId && (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Receipt />}
                onClick={() => router.push(`/dashboard/customer/cart/${orderId}`)}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 700,
                  py: 1.4,
                  textTransform: 'none',
                  fontSize: 15,
                  borderColor: '#E2E8F0',
                  color: '#1E293B',
                  '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
                }}
              >
                {t('customer.viewOrder')}
              </Button>
            )}

            <Button
              fullWidth
              variant="text"
              startIcon={<Home />}
              onClick={() => router.push('/dashboard/customer/cart')}
              sx={{
                borderRadius: '12px',
                fontWeight: 600,
                py: 1.2,
                textTransform: 'none',
                fontSize: 14,
                color: '#64748B',
                '&:hover': { bgcolor: '#F1F5F9' },
              }}
            >
              {t('customer.backToOrders')}
            </Button>
          </Box>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
}
