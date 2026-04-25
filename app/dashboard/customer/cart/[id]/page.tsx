'use client';

export const dynamic = 'force-dynamic';

import React, { use, useEffect, useMemo, useState } from 'react';
import {
  Box, Container, Typography, Button, Divider,
  CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import {
  ArrowBack, AssignmentReturn, CheckCircle, ConfirmationNumber,
  CalendarToday, Payment, Cancel,
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetMyOrdersQuery, useCheckoutOrderMutation } from '@/src/stores/services/OrderApi';
import { OrderStatus, PaymentProvider } from '@/src/stores/types/order';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import { useTranslation } from 'react-i18next';
import { CreateRefundRequestDialog } from '@/src/components/CreateRefundRequestDialog/CreateRefundRequestDialog';
import { useGetMyRefundRequestsQuery } from '@/src/stores/services/RefundRequestApi';
import { RefundRequestStatus } from '@/src/stores/types/refundRequest';

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const PROVIDER_META: Record<PaymentProvider, { label: string; color: string; bg: string }> = {
  [PaymentProvider.MOMO]:  { label: 'MoMo',  color: '#A50064', bg: 'rgba(165,0,100,0.06)' },
  [PaymentProvider.VNPAY]: { label: 'VNPay', color: '#005BAC', bg: 'rgba(0,91,172,0.06)' },
  [PaymentProvider.CASH]:  { label: 'Cash',  color: '#22C55E', bg: 'rgba(34,197,94,0.06)' },
  [PaymentProvider.CARD]:  { label: 'Card',  color: '#6093FC', bg: 'rgba(96,147,252,0.06)' },
};

const ORDER_GRADIENT: Record<OrderStatus, string> = {
  [OrderStatus.CONFIRMED]:  'linear-gradient(135deg,#22C55E,#16A34A)',
  [OrderStatus.PENDING]:    'linear-gradient(135deg,#F97316,#EA580C)',
  [OrderStatus.PROCESSING]: 'linear-gradient(135deg,#6093FC,#2563EB)',
  [OrderStatus.CANCELLED]:  'linear-gradient(135deg,#94A3B8,#64748B)',
  [OrderStatus.EXPIRED]:    'linear-gradient(135deg,#94A3B8,#64748B)',
  [OrderStatus.REFUNDED]:   'linear-gradient(135deg,#A78BFA,#7C3AED)',
};

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  [OrderStatus.CONFIRMED]:  'Confirmed',
  [OrderStatus.PENDING]:    'Pending Payment',
  [OrderStatus.PROCESSING]: 'Processing',
  [OrderStatus.CANCELLED]:  'Cancelled',
  [OrderStatus.EXPIRED]:    'Expired',
  [OrderStatus.REFUNDED]:   'Refunded',
};

const PAID_PROVIDERS = [PaymentProvider.MOMO, PaymentProvider.VNPAY];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const resolvedParams = use(params);
  const orderId = parseInt(resolvedParams.id);

  const isSuccess = searchParams.get('success') === 'true';
  const providerParam = searchParams.get('provider') as PaymentProvider | null;

  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>(
    providerParam && PAID_PROVIDERS.includes(providerParam) ? providerParam : PaymentProvider.MOMO,
  );
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);

  const { data, isLoading, error } = useGetMyOrdersQuery({ page: 0, size: 100 });
  const [checkoutOrder, { isLoading: isCheckingOut }] = useCheckoutOrderMutation();

  const { data: myRefundRequests } = useGetMyRefundRequestsQuery({ page: 0, size: 50 });
  const hasExistingRequest = useMemo(() => {
    const requests = myRefundRequests?.data?.content ?? [];
    return requests.some((r) => r.orderId === orderId && r.status === RefundRequestStatus.PENDING);
  }, [myRefundRequests, orderId]);

  const order = useMemo(() => {
    if (!data?.data?.content) return null;
    return data.data.content.find((o: any) => o.id === orderId);
  }, [data, orderId]);

  // If user already paid with a provider, pre-select it (unless URL param overrides)
  useEffect(() => {
    if (providerParam && PAID_PROVIDERS.includes(providerParam)) return;
    const existingProvider = order?.payments?.[0]?.provider;
    if (existingProvider && PAID_PROVIDERS.includes(existingProvider as PaymentProvider)) {
      setSelectedProvider(existingProvider as PaymentProvider);
    }
  }, [order, providerParam]);

  const isFreeOrder = order?.totalAmount === 0;
  const canPay = order?.status === OrderStatus.PENDING || order?.status === OrderStatus.PROCESSING;

  const handleCheckout = async () => {
    if (!order) return;
    setCheckoutError(null);
    try {
      const returnUrl = `${window.location.origin}/dashboard/customer/payment/return?ref=${order.id}`;
      const result = await checkoutOrder({
        orderId: order.id,
        provider: isFreeOrder ? PaymentProvider.CASH : selectedProvider,
        returnUrl,
      }).unwrap();

      const paymentUrl = result.data?.paymentUrl;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        router.push('/dashboard/customer/cart?tab=1');
      }
    } catch (err: any) {
      setCheckoutError(err?.data?.message ?? t('messages.error.checkout'));
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: '#F36BF9' }} />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert severity="error">{t('messages.error.notFound', { item: t('common.entities.order') })}</Alert>
        </Container>
        <Footer />
      </Box>
    );
  }

  const gradient = ORDER_GRADIENT[order.status];
  const statusLabel = ORDER_STATUS_LABEL[order.status] ?? order.status;

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* ── Page hero ───────────────────────────────────────────── */}
      <Box sx={{ background: gradient, position: 'relative', overflow: 'hidden', pb: { xs: 3, md: 4 }, pt: { xs: 3, md: 4 } }}>
        <Box sx={{ position: 'absolute', top: -40, right: '8%', width: 220, height: 220, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/dashboard/customer/cart')}
            sx={{
              color: 'rgba(255,255,255,0.8)', mb: 2, textTransform: 'none', fontWeight: 600,
              bgcolor: 'rgba(255,255,255,0.12)', borderRadius: '10px', px: 2, py: 0.75,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' },
            }}
          >
            {t('customer.backToOrders')}
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
            <Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, mb: 0.5 }}>
                Order #{order.id}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', fontSize: { xs: '1.2rem', md: '1.5rem' }, lineHeight: 1.25 }}>
                {order.eventTitle}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'rgba(255,255,255,0.75)' }}>
                  <CalendarToday sx={{ fontSize: 13 }} />
                  <Typography variant="caption" sx={{ fontSize: 12 }}>
                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'rgba(255,255,255,0.75)' }}>
                  <ConfirmationNumber sx={{ fontSize: 13 }} />
                  <Typography variant="caption" sx={{ fontSize: 12 }}>
                    {order.ticketCount} ticket{order.ticketCount !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box
              sx={{
                px: 2, py: 0.75, borderRadius: '20px',
                bgcolor: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(8px)',
                alignSelf: 'flex-start',
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{statusLabel}</Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── Main content ─────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        {isSuccess && (
          <Alert icon={<CheckCircle />} severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
            {t('customer.orderPlacedSuccess')}
          </Alert>
        )}
        {checkoutError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setCheckoutError(null)}>
            {checkoutError}
          </Alert>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 380px' },
            gap: { xs: 3, lg: 5 },
            alignItems: 'start',
          }}
        >
          {/* ── LEFT: Order details ─────────────────────────────── */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Event / order info */}
            <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid #F1F5F9', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <Box sx={{ px: 3, pt: 3, pb: 2.5, borderBottom: '1px solid #F1F5F9' }}>
                <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: 16, mb: 2 }}>
                  {t('customer.orderItems')}
                </Typography>

                {order.items && order.items.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {order.items.map((item) => (
                      <Box
                        key={item.id}
                        sx={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #F1F5F9',
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: 14 }}>
                            {item.ticketTypeName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 12 }}>
                            {item.unitPrice === 0 ? 'Free' : formatVND(item.unitPrice)} × {item.quantity}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: 15 }}>
                          {item.subtotal === 0 ? (
                            <Box component="span" sx={{ color: '#22C55E', fontWeight: 700 }}>Free</Box>
                          ) : formatVND(item.subtotal)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="#94A3B8">{t('customer.noItemsFound')}</Typography>
                )}
              </Box>

              <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontWeight: 700, color: '#475569', fontSize: 14 }}>
                  {t('common.labels.total')}
                </Typography>
                <Typography sx={{
                  fontWeight: 900, fontSize: 22,
                  background: gradient,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  {order.totalAmount === 0 ? 'Free' : formatVND(order.totalAmount)}
                </Typography>
              </Box>
            </Box>

            {/* CONFIRMED: payment info */}
            {order.status === OrderStatus.CONFIRMED && order.payments && order.payments.length > 0 && (
              <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid #F1F5F9', p: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: 16, mb: 2 }}>
                  {t('customer.paymentSummary')}
                </Typography>
                {order.payments.map((p) => (
                  <Box key={p.paymentId} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="#64748B" fontSize={13}>Provider</Typography>
                      <Typography variant="caption" fontWeight={700} color="#0F172A" fontSize={13}>
                        {PROVIDER_META[p.provider as PaymentProvider]?.label ?? p.provider}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="#64748B" fontSize={13}>Amount</Typography>
                      <Typography variant="caption" fontWeight={700} color="#0F172A" fontSize={13}>
                        {p.amount === 0 ? 'Free' : formatVND(p.amount)}
                      </Typography>
                    </Box>
                    {p.transactionId && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="#64748B" fontSize={13}>Transaction ID</Typography>
                        <Typography variant="caption" fontWeight={700} color="#0F172A" fontSize={13} sx={{ fontFamily: 'monospace' }}>
                          {p.transactionId}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* ── RIGHT: Action panel ─────────────────────────────── */}
          <Box sx={{ position: { lg: 'sticky' }, top: { lg: 24 } }}>
            <Box sx={{ bgcolor: '#fff', borderRadius: '20px', border: '1px solid #F1F5F9', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

              {/* Panel header */}
              <Box sx={{ px: 3, pt: 3, pb: 2.5 }}>
                <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: 16 }}>
                  {canPay ? t('customer.paymentSummary') : t('customer.orderSummary')}
                </Typography>
              </Box>

              <Divider sx={{ borderColor: '#F1F5F9' }} />

              {/* Line items recap */}
              <Box sx={{ px: 3, py: 2.5 }}>
                {order.items && order.items.length > 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2.5 }}>
                    {order.items.map((item) => (
                      <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#475569', fontSize: 13 }}>
                          {item.ticketTypeName} × {item.quantity}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: 13 }}>
                          {item.subtotal === 0 ? 'Free' : formatVND(item.subtotal)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography sx={{ fontWeight: 700, color: '#475569', fontSize: 14 }}>Total</Typography>
                  <Typography sx={{
                    fontWeight: 900, fontSize: 20,
                    background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>
                    {order.totalAmount === 0 ? 'Free' : formatVND(order.totalAmount)}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: '#F1F5F9' }} />

              {/* ── PENDING / PROCESSING: payment method + pay button ── */}
              {canPay && (
                <Box sx={{ px: 3, py: 2.5 }}>
                  {isFreeOrder ? (
                    <>
                      <Typography variant="body2" color="#64748B" sx={{ mb: 2.5, fontSize: 13, lineHeight: 1.6 }}>
                        {t('customer.freeTicketNotice')}
                      </Typography>
                      <Button
                        fullWidth
                        variant="contained"
                        disabled={isCheckingOut}
                        startIcon={isCheckingOut ? <CircularProgress size={18} color="inherit" /> : <CheckCircle />}
                        onClick={handleCheckout}
                        sx={{
                          borderRadius: '12px', textTransform: 'none', fontWeight: 800, fontSize: 15, py: 1.75,
                          background: 'linear-gradient(135deg,#22C55E,#16A34A)',
                          boxShadow: '0 6px 20px rgba(34,197,94,0.35)',
                          '&:hover': { background: 'linear-gradient(135deg,#16A34A,#15803D)' },
                        }}
                      >
                        {isCheckingOut ? t('common.labels.processing') : t('customer.claimFreeTickets')}
                      </Button>
                    </>
                  ) : (
                    <>
                      {order.status === OrderStatus.PROCESSING && (
                        <Alert severity="info" sx={{ mb: 2.5, borderRadius: '10px', fontSize: 13 }}>
                          {t('customer.processingPayment')}
                        </Alert>
                      )}

                      <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
                        <InputLabel sx={{ fontWeight: 600, fontSize: 13 }}>
                          {t('customer.selectPaymentMethod')}
                        </InputLabel>
                        <Select
                          value={selectedProvider}
                          label={t('customer.selectPaymentMethod')}
                          onChange={(e) => setSelectedProvider(e.target.value as PaymentProvider)}
                          sx={{
                            borderRadius: '12px',
                            fontWeight: 600,
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#F36BF9' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#F36BF9' },
                          }}
                        >
                          {PAID_PROVIDERS.map((provider) => {
                            const meta = PROVIDER_META[provider];
                            return (
                              <MenuItem key={provider} value={provider}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Payment sx={{ fontSize: 16, color: meta.color }} />
                                  <Typography sx={{ fontWeight: 600, fontSize: 14, color: meta.color }}>
                                    {meta.label}
                                  </Typography>
                                </Box>
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>

                      <Button
                        fullWidth
                        variant="contained"
                        disabled={isCheckingOut}
                        startIcon={isCheckingOut ? <CircularProgress size={18} color="inherit" /> : <Payment />}
                        onClick={handleCheckout}
                        sx={{
                          borderRadius: '12px', textTransform: 'none', fontWeight: 800, fontSize: 15, py: 1.75,
                          background: gradient,
                          boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
                          '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.25)' },
                        }}
                      >
                        {isCheckingOut
                          ? t('common.labels.processing')
                          : order.status === OrderStatus.PROCESSING
                            ? t('customer.continuePayment')
                            : t('customer.payNow')}
                      </Button>

                      <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#94A3B8', fontSize: 11, mt: 1 }}>
                        You can change payment method at any time
                      </Typography>
                    </>
                  )}
                </Box>
              )}

              {/* ── CONFIRMED: view tickets + refund ── */}
              {order.status === OrderStatus.CONFIRMED && (
                <Box sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, bgcolor: 'rgba(34,197,94,0.07)', borderRadius: '12px', border: '1px solid rgba(34,197,94,0.2)', mb: 0.5 }}>
                    <CheckCircle sx={{ color: '#22C55E', fontSize: 18 }} />
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#16A34A' }}>
                      Payment confirmed
                    </Typography>
                  </Box>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<ConfirmationNumber />}
                    onClick={() => router.push('/dashboard/customer/cart?tab=1')}
                    sx={{
                      borderRadius: '12px', textTransform: 'none', fontWeight: 700, py: 1.5,
                      background: 'linear-gradient(135deg,#F36BF9,#6093FC)',
                      boxShadow: '0 4px 14px rgba(96,147,252,0.35)',
                      '&:hover': { background: 'linear-gradient(135deg,#e055e8,#4a7ef0)' },
                    }}
                  >
                    {t('customer.viewMyTickets')}
                  </Button>

                  {order.totalAmount > 0 && (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<AssignmentReturn />}
                      disabled={hasExistingRequest}
                      onClick={() => setRefundDialogOpen(true)}
                      sx={{
                        py: 1.5, borderRadius: '12px', textTransform: 'none', fontWeight: 600,
                        borderColor: '#F36BF9', color: '#F36BF9',
                        '&:hover': { borderColor: '#d94ee0', color: '#d94ee0', bgcolor: 'rgba(243,107,249,0.04)' },
                        '&.Mui-disabled': { opacity: 0.5 },
                      }}
                    >
                      {hasExistingRequest ? 'Refund Request Pending' : 'Request Refund'}
                    </Button>
                  )}
                </Box>
              )}

              {/* ── CANCELLED / EXPIRED / REFUNDED ── */}
              {(order.status === OrderStatus.CANCELLED
                || order.status === OrderStatus.EXPIRED
                || order.status === OrderStatus.REFUNDED) && (
                <Box sx={{ px: 3, py: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                    <Cancel sx={{ color: '#94A3B8', fontSize: 18 }} />
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>
                      {statusLabel}
                    </Typography>
                  </Box>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => router.push('/dashboard/customer')}
                    sx={{
                      mt: 2, py: 1.5, borderRadius: '12px', textTransform: 'none', fontWeight: 600,
                      borderColor: '#E2E8F0', color: '#475569',
                      '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
                    }}
                  >
                    {t('customer.browseEvents')}
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Container>

      <Footer />

      <CreateRefundRequestDialog
        open={refundDialogOpen}
        onClose={() => setRefundDialogOpen(false)}
        orderId={order.id}
        eventTitle={order.eventTitle}
        refundAmount={order.totalAmount}
      />
    </Box>
  );
}
