'use client';

import React, { use, useState } from 'react';
import {
  Box, Container, Typography, Button, Chip, Divider, CircularProgress,
  Alert,
} from '@mui/material';
import {
  ShoppingCart, Add, Remove, CalendarToday, Place, ArrowBack,
  LocalOffer, ConfirmationNumber, CheckCircleOutline,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useGetEventByIdQuery } from '@/src/stores/services/EventApi';
import { useGetAvailableTicketTypesQuery } from '@/src/stores/services/TicketTypeApi';
import { useCreateOrderMutation, useCheckoutOrderMutation } from '@/src/stores/services/OrderApi';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import { PaymentProvider } from '@/src/stores/types/order';
import SnackbarNotification from '@/src/components/SnackbarNotification';
import { useSnackbar } from '@/src/hooks/useSnackbar';
import { useTranslation } from 'react-i18next';

const FALLBACK_IMG =
  'https://static.vecteezy.com/system/resources/thumbnails/041/388/388/small/ai-generated-concert-crowd-enjoying-live-music-event-photo.jpg';

const fmtPrice = (p: number) => (p === 0 ? 'Free' : `$${p.toLocaleString()}`);

export default function EventTicketsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { t } = useTranslation();
  const { id: eventId } = use(params);

  const [selectedTickets, setSelectedTickets] = useState<Record<number, number>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentProvider>(PaymentProvider.MOMO);
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  const { data: eventResponse, isLoading: eventLoading } = useGetEventByIdQuery(eventId);
  const { data: ticketTypesResponse, isLoading: ticketsLoading } = useGetAvailableTicketTypesQuery(eventId);
  const [createOrder] = useCreateOrderMutation();

  const event = eventResponse?.data;
  const ticketTypes = ticketTypesResponse?.data ?? [];

  const handleQuantityChange = (ticketTypeId: number, change: number) => {
    const ticket = ticketTypes.find((t) => t.id === ticketTypeId);
    if (!ticket) return;

    setSelectedTickets((prev) => {
      const newQuantity = (prev[ticketTypeId] ?? 0) + change;

      if (newQuantity <= 0) {
        const { [ticketTypeId]: _removed, ...rest } = prev;
        return rest;
      }

      if (ticket.perUserLimit && newQuantity > ticket.perUserLimit) {
        showSnackbar(t('customer.maxTicketsPerUser', { count: ticket.perUserLimit, name: ticket.name }), 'warning');
        return prev;
      }

      const available = ticket.total - ticket.sold;
      if (newQuantity > available) {
        showSnackbar(t('customer.onlyTicketsAvailable', { count: available, name: ticket.name }), 'warning');
        return prev;
      }

      return { ...prev, [ticketTypeId]: newQuantity };
    });
  };

  const totalAmount = ticketTypes.reduce((sum, ticket) => sum + ticket.price * (selectedTickets[ticket.id] ?? 0), 0);
  const totalQuantity = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);

  const handleCheckout = async () => {
    if (totalQuantity === 0) {
      showSnackbar(t('customer.selectAtLeastOneTicket'), 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      const orderItems = Object.entries(selectedTickets).map(([ticketTypeId, quantity]) => ({
        ticketTypeId: parseInt(ticketTypeId),
        quantity,
      }));

      const result = await createOrder({ eventId, items: orderItems }).unwrap();
      const orderId = result.data?.id;
      router.push(`/dashboard/customer/cart/${orderId}?provider=${selectedPaymentMethod}`);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string }; message?: string };
      showSnackbar(err?.data?.message ?? err?.message ?? t('messages.error.operationFailed'), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (eventLoading || ticketsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
        <CircularProgress sx={{ color: '#F36BF9' }} />
      </Box>
    );
  }

  if (!event) {
    return (
      <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert severity="error">{t('messages.error.notFound', { item: t('common.entities.event') })}</Alert>
        </Container>
        <Footer />
      </Box>
    );
  }

  if (event.status !== 'PUBLISHED' && event.status !== 'ONGOING') {
    router.replace('/dashboard/customer');
    return null;
  }

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* ── Compact event hero ──────────────────────────────────── */}
      <Box sx={{ position: 'relative', width: '100%', height: { xs: 140, md: 200 }, overflow: 'hidden' }}>
        <Box
          component="img"
          src={event.coverUrl || FALLBACK_IMG}
          alt={event.title}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.75) 100%)' }} />

        <Box sx={{ position: 'absolute', top: 16, left: { xs: 16, md: 40 }, zIndex: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.back()}
            sx={{
              color: '#fff',
              bgcolor: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(8px)',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 13,
              px: 2,
              py: 0.75,
              '&:hover': { bgcolor: 'rgba(0,0,0,0.55)' },
            }}
          >
            {t('customer.backToEvents')}
          </Button>
        </Box>

        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: { xs: 2.5, md: 5 }, zIndex: 2 }}>
          <Typography
            variant="h5"
            sx={{ color: '#fff', fontWeight: 800, fontSize: { xs: '1.1rem', md: '1.5rem' }, textShadow: '0 2px 8px rgba(0,0,0,0.5)', mb: 0.5 }}
            noWrap
          >
            {event.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'rgba(255,255,255,0.8)' }}>
              <CalendarToday sx={{ fontSize: 13 }} />
              <Typography variant="caption" sx={{ fontSize: 12 }}>{fmt(event.startAt)}</Typography>
            </Box>
            {event.venue && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'rgba(255,255,255,0.8)' }}>
                <Place sx={{ fontSize: 13 }} />
                <Typography variant="caption" sx={{ fontSize: 12 }}>{event.venue.name}, {event.venue.city}</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* ── Body ──────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, py: { xs: 3, md: 5 }, pb: { xs: 12, lg: 5 } }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1fr 360px' },
              gap: { xs: 3, lg: 5 },
              alignItems: 'start',
            }}
          >
            {/* ── LEFT: Ticket selection ──────────────────────────── */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <ConfirmationNumber sx={{ color: '#F36BF9', fontSize: 22 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: 20 }}>
                  {t('customer.selectTickets')}
                </Typography>
              </Box>

              {ticketTypes.length === 0 ? (
                <Box sx={{ bgcolor: '#fff', borderRadius: '16px', p: 6, textAlign: 'center', border: '1px solid #F1F5F9' }}>
                  <ConfirmationNumber sx={{ fontSize: 48, color: '#E2E8F0', mb: 2 }} />
                  <Typography variant="h6" color="#64748B" fontWeight={600} sx={{ mb: 1 }}>
                    {t('customer.noTicketsAvailable')}
                  </Typography>
                  <Typography variant="body2" color="#94A3B8">
                    Check back later for available tickets
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {ticketTypes.map((ticket) => {
                    const available = ticket.total - ticket.sold;
                    const isAvailable = available > 0;
                    const qty = selectedTickets[ticket.id] ?? 0;
                    const atMax = qty >= available || Boolean(ticket.perUserLimit && qty >= ticket.perUserLimit);
                    const soldPct = ticket.total > 0 ? (ticket.sold / ticket.total) * 100 : 0;
                    const almostGone = isAvailable && soldPct >= 80;
                    const isSelected = qty > 0;

                    return (
                      <Box
                        key={ticket.id}
                        sx={{
                          bgcolor: '#fff',
                          borderRadius: '16px',
                          p: { xs: 2.5, md: 3 },
                          border: isSelected ? '2px solid #F36BF9' : '1.5px solid #F1F5F9',
                          boxShadow: isSelected ? '0 4px 20px rgba(243,107,249,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                          transition: 'border-color 0.2s, box-shadow 0.2s',
                          opacity: isAvailable ? 1 : 0.6,
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' }, alignItems: 'flex-start' }}>

                          {/* Info */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', fontSize: 16 }}>
                                {ticket.name}
                              </Typography>
                              {ticket.earlyBird && (
                                <Chip label="Early Bird" size="small" sx={{ bgcolor: '#FEF3C7', color: '#D97706', fontWeight: 700, fontSize: 10, height: 20, '& .MuiChip-label': { px: 1 } }} />
                              )}
                              {!isAvailable && (
                                <Chip label="Sold Out" size="small" sx={{ bgcolor: 'rgba(239,68,68,0.1)', color: '#EF4444', fontWeight: 700, fontSize: 10, height: 20, '& .MuiChip-label': { px: 1 } }} />
                              )}
                            </Box>

                            {ticket.description && (
                              <Typography variant="body2" sx={{ color: '#64748B', fontSize: 13, mb: 1.5, lineHeight: 1.5 }}>
                                {ticket.description}
                              </Typography>
                            )}

                            {/* Availability row */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                              {isAvailable ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CheckCircleOutline sx={{ fontSize: 13, color: almostGone ? '#F59E0B' : '#22C55E' }} />
                                  <Typography variant="caption" sx={{ fontSize: 12, fontWeight: 600, color: almostGone ? '#F59E0B' : '#22C55E' }}>
                                    {almostGone ? `Only ${available} left!` : `${available} available`}
                                  </Typography>
                                </Box>
                              ) : null}
                              {ticket.perUserLimit && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <LocalOffer sx={{ fontSize: 12, color: '#94A3B8' }} />
                                  <Typography variant="caption" sx={{ fontSize: 12, color: '#94A3B8' }}>
                                    Max {ticket.perUserLimit}/person
                                  </Typography>
                                </Box>
                              )}
                            </Box>

                            {/* Progress bar */}
                            {isAvailable && (
                              <Box sx={{ height: 3, borderRadius: 2, bgcolor: '#F1F5F9', overflow: 'hidden', mt: 1.5 }}>
                                <Box sx={{
                                  height: '100%', width: `${soldPct}%`, borderRadius: 2,
                                  background: almostGone ? 'linear-gradient(90deg,#F59E0B,#EF4444)' : 'linear-gradient(90deg,#F36BF9,#8E2DE2)',
                                  transition: 'width 0.4s',
                                }} />
                              </Box>
                            )}
                          </Box>

                          {/* Price + Qty */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' }, gap: 1.5, flexShrink: 0 }}>
                            <Typography sx={{
                              fontWeight: 900, fontSize: 22,
                              background: 'linear-gradient(135deg,#F36BF9,#8E2DE2)',
                              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                              lineHeight: 1,
                            }}>
                              {fmtPrice(ticket.price)}
                            </Typography>

                            {isAvailable && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  onClick={() => handleQuantityChange(ticket.id, -1)}
                                  sx={{
                                    width: 34, height: 34, borderRadius: '8px',
                                    border: '1.5px solid #E2E8F0',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: qty === 0 ? 'not-allowed' : 'pointer',
                                    color: qty === 0 ? '#CBD5E1' : '#475569',
                                    bgcolor: qty === 0 ? '#F8FAFC' : '#fff',
                                    transition: 'all 0.15s',
                                    '&:hover': qty > 0 ? { borderColor: '#F36BF9', color: '#F36BF9' } : {},
                                    userSelect: 'none',
                                  }}
                                >
                                  <Remove sx={{ fontSize: 16 }} />
                                </Box>

                                <Typography sx={{ minWidth: 32, textAlign: 'center', fontWeight: 700, fontSize: 16, color: '#0F172A' }}>
                                  {qty}
                                </Typography>

                                <Box
                                  onClick={() => !atMax && handleQuantityChange(ticket.id, 1)}
                                  sx={{
                                    width: 34, height: 34, borderRadius: '8px',
                                    background: atMax ? '#F1F5F9' : 'linear-gradient(135deg,#F36BF9,#8E2DE2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: atMax ? 'not-allowed' : 'pointer',
                                    color: atMax ? '#CBD5E1' : '#fff',
                                    transition: 'all 0.15s',
                                    boxShadow: atMax ? 'none' : '0 2px 8px rgba(243,107,249,0.35)',
                                    '&:hover': !atMax ? { boxShadow: '0 4px 12px rgba(243,107,249,0.45)' } : {},
                                    userSelect: 'none',
                                  }}
                                >
                                  <Add sx={{ fontSize: 16 }} />
                                </Box>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>

            {/* ── RIGHT: Order summary ─────────────────────────────── */}
            <Box sx={{ position: { lg: 'sticky' }, top: { lg: 24 } }}>
              <Box sx={{ bgcolor: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', border: '1px solid #F1F5F9' }}>
                {/* Header */}
                <Box sx={{ px: 3, pt: 3, pb: 2.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: 17 }}>
                    {t('customer.orderSummary')}
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: '#F1F5F9' }} />

                {/* Line items */}
                <Box sx={{ px: 3, py: 2.5, minHeight: 80 }}>
                  {totalQuantity === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="body2" color="#94A3B8" fontSize={13}>
                        No tickets selected yet
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {Object.entries(selectedTickets).map(([ticketTypeId, quantity]) => {
                        const ticket = ticketTypes.find((t) => t.id === parseInt(ticketTypeId));
                        if (!ticket) return null;
                        return (
                          <Box key={ticketTypeId} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', fontSize: 13 }}>
                                {ticket.name}
                              </Typography>
                              <Typography variant="caption" color="#94A3B8" fontSize={12}>
                                {fmtPrice(ticket.price)} × {quantity}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: 14 }}>
                              {fmtPrice(ticket.price * quantity)}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Box>

                <Divider sx={{ borderColor: '#F1F5F9' }} />

                {/* Total */}
                <Box sx={{ px: 3, py: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', fontSize: 14 }}>
                      {t('common.labels.total')}
                    </Typography>
                    <Typography sx={{ fontWeight: 900, fontSize: 22, background: 'linear-gradient(135deg,#F36BF9,#8E2DE2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {fmtPrice(totalAmount)}
                    </Typography>
                  </Box>

                  {/* Payment method — only for paid orders */}
                  {totalAmount > 0 && (
                    <>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#94A3B8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 1.5 }}>
                        {t('customer.paymentMethod')}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                        {[PaymentProvider.MOMO, PaymentProvider.VNPAY].map((provider) => {
                          const isSelected = selectedPaymentMethod === provider;
                          const label = provider === PaymentProvider.MOMO ? 'MoMo' : 'VNPay';
                          const color = provider === PaymentProvider.MOMO ? '#A50064' : '#005BAC';
                          return (
                            <Box
                              key={provider}
                              onClick={() => setSelectedPaymentMethod(provider)}
                              sx={{
                                px: 2, py: 1.25, borderRadius: '10px',
                                border: isSelected ? `2px solid ${color}` : '1.5px solid #E2E8F0',
                                bgcolor: isSelected ? (provider === PaymentProvider.MOMO ? 'rgba(165,0,100,0.05)' : 'rgba(0,91,172,0.05)') : '#fff',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                transition: 'all 0.15s', userSelect: 'none',
                                '&:hover': { borderColor: color },
                              }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: isSelected ? 700 : 500, fontSize: 13, color: isSelected ? color : '#475569' }}>
                                {label}
                              </Typography>
                              {isSelected && (
                                <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#fff' }} />
                                </Box>
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    </>
                  )}

                  {/* Checkout CTA */}
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={totalQuantity === 0 || isProcessing}
                    onClick={handleCheckout}
                    startIcon={isProcessing ? <CircularProgress size={18} color="inherit" /> : <ShoppingCart />}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 800,
                      fontSize: 16,
                      py: 1.75,
                      background: totalQuantity === 0 ? undefined : 'linear-gradient(135deg,#F36BF9,#8E2DE2)',
                      boxShadow: totalQuantity === 0 ? 'none' : '0 6px 20px rgba(243,107,249,0.35)',
                      '&:hover': { background: 'linear-gradient(135deg,#e055e8,#7d26d1)', boxShadow: '0 8px 24px rgba(243,107,249,0.45)' },
                    }}
                  >
                    {isProcessing ? t('customer.processing') : t('common.buttons.checkout')}
                  </Button>

                  {totalQuantity > 0 && !isProcessing && (
                    <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#94A3B8', fontSize: 11, mt: 1 }}>
                      No hidden fees · Instant confirmation
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Mobile sticky checkout bar */}
      {totalQuantity > 0 && (
        <Box
          sx={{
            display: { xs: 'block', lg: 'none' },
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            bgcolor: '#fff',
            borderTop: '1px solid #F1F5F9',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
            zIndex: 100,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 11 }}>
                {totalQuantity} ticket{totalQuantity !== 1 ? 's' : ''}
              </Typography>
              <Typography sx={{ fontWeight: 900, fontSize: 20, background: 'linear-gradient(135deg,#F36BF9,#8E2DE2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
                {fmtPrice(totalAmount)}
              </Typography>
            </Box>
            <Button
              fullWidth
              variant="contained"
              disabled={isProcessing}
              onClick={handleCheckout}
              startIcon={isProcessing ? <CircularProgress size={16} color="inherit" /> : <ShoppingCart />}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: 15,
                py: 1.5,
                background: 'linear-gradient(135deg,#F36BF9,#8E2DE2)',
                boxShadow: '0 4px 14px rgba(243,107,249,0.35)',
                '&:hover': { background: 'linear-gradient(135deg,#e055e8,#7d26d1)' },
              }}
            >
              {isProcessing ? t('customer.processing') : t('common.buttons.checkout')}
            </Button>
          </Box>
        </Box>
      )}

      <Footer />

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={closeSnackbar}
      />
    </Box>
  );
}
