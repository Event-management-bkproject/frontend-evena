'use client';

import React, { use, useState } from 'react';
import {
  Box, Container, Typography, Button, Card, Alert,
  Grid, Chip, Divider, CircularProgress,
} from '@mui/material';
import { ShoppingCart, Add, Remove, CalendarToday, Place, ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useGetEventByIdQuery } from '@/src/stores/services/EventApi';
import { useGetAvailableTicketTypesQuery } from '@/src/stores/services/TicketTypeApi';
import { useCreateOrderMutation } from '@/src/stores/services/OrderApi';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import { PaymentProvider } from '@/src/stores/types/order';
import SnackbarNotification from '@/src/components/SnackbarNotification';
import { useSnackbar } from '@/src/hooks/useSnackbar';
import { useTranslation } from 'react-i18next';
import { BRAND } from '@/src/utils/constants/constant';

// SSE cache invalidation is handled globally by SSEProvider.
// TicketType and Event caches are auto-refreshed when SSE events arrive.

export default function EventTicketsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { t } = useTranslation();
  const { id: eventId } = use(params);

  const [selectedTickets, setSelectedTickets] = useState<Record<number, number>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentProvider>(PaymentProvider.CASH);
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

      await createOrder({ eventId, items: orderItems }).unwrap();
      router.push('/dashboard/customer/cart');
    } catch (error: unknown) {
      const err = error as { data?: { message?: string }; message?: string };
      const msg = err?.data?.message ?? err?.message ?? t('messages.error.operationFailed');
      showSnackbar(msg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (eventLoading || ticketsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: BRAND.primary }} />
      </Box>
    );
  }

  if (!event) {
    return (
      <Box sx={{ backgroundColor: BRAND.bgPage, minHeight: '100vh' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert severity="error">{t('messages.error.notFound', { item: t('common.entities.event') })}</Alert>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: BRAND.bgPage, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        <Button startIcon={<ArrowBack />} onClick={() => router.back()} sx={{ mb: 3, color: BRAND.dark }}>
          {t('customer.backToEvents')}
        </Button>

        {/* Event summary */}
        <Card sx={{ p: 3, mb: 4, borderRadius: '16px' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: BRAND.dark, mb: 2 }}>
            {event.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday sx={{ color: BRAND.primary }} />
              <Typography variant="body2">{new Date(event.startAt).toLocaleDateString()}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Place sx={{ color: BRAND.primary }} />
              <Typography variant="body2">{event.venue?.name}</Typography>
            </Box>
          </Box>
        </Card>

        <Grid container spacing={4}>
          {/* Ticket list */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: BRAND.dark, mb: 3 }}>
              {t('customer.selectTickets')}
            </Typography>

            {ticketTypes.length === 0 ? (
              <Alert severity="info">{t('customer.noTicketsAvailable')}</Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {ticketTypes.map((ticket) => {
                  const available = ticket.total - ticket.sold;
                  const isAvailable = available > 0;
                  const qty = selectedTickets[ticket.id] ?? 0;
                  const atMax = qty >= available || Boolean(ticket.perUserLimit && qty >= ticket.perUserLimit);

                  return (
                    <Card key={ticket.id} sx={{ p: 3, borderRadius: '12px' }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: BRAND.dark }}>
                            {ticket.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {ticket.description}
                          </Typography>
                          <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {ticket.earlyBird && (
                              <Chip label={t('customer.earlyBird')} size="small" color="secondary" />
                            )}
                            {ticket.perUserLimit && (
                              <Chip
                                label={t('customer.maxPerUser', { count: ticket.perUserLimit })}
                                size="small"
                                color="info"
                              />
                            )}
                            <Chip
                              label={
                                isAvailable
                                  ? t('customer.available', { count: available })
                                  : t('customer.soldOut')
                              }
                              size="small"
                              color={isAvailable ? 'success' : 'error'}
                            />
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 3 }}>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: BRAND.primary }}>
                            {ticket.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 3 }}>
                          {isAvailable ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleQuantityChange(ticket.id, -1)}
                                disabled={!qty}
                                aria-label={t('common.buttons.decrease')}
                                sx={{ minWidth: 40, p: 1 }}
                              >
                                <Remove />
                              </Button>
                              <Typography sx={{ minWidth: 40, textAlign: 'center', fontWeight: 600 }}>
                                {qty}
                              </Typography>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleQuantityChange(ticket.id, 1)}
                                disabled={atMax}
                                aria-label={t('common.buttons.increase')}
                                sx={{
                                  minWidth: 40,
                                  p: 1,
                                  backgroundColor: BRAND.primary,
                                  '&:hover': { backgroundColor: BRAND.primaryHover },
                                }}
                              >
                                <Add />
                              </Button>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="error">
                              {t('customer.soldOut')}
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                    </Card>
                  );
                })}
              </Box>
            )}
          </Grid>

          {/* Order summary sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ p: 3, borderRadius: '16px', position: { md: 'sticky' }, top: { md: 100 } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: BRAND.dark, mb: 2 }}>
                {t('customer.orderSummary')}
              </Typography>

              <Box sx={{ mb: 2 }}>
                {Object.entries(selectedTickets).map(([ticketTypeId, quantity]) => {
                  const ticket = ticketTypes.find((t) => t.id === parseInt(ticketTypeId));
                  if (!ticket) return null;
                  return (
                    <Box key={ticketTypeId} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        {ticket.name} × {quantity}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {(ticket.price * quantity).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>
                  {t('common.labels.total')}
                </Typography>
                <Typography variant="h6" fontWeight={700} sx={{ color: BRAND.primary }}>
                  {totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                {t('customer.paymentMethod')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                {Object.values(PaymentProvider).map((provider) => (
                  <Button
                    key={provider}
                    variant={selectedPaymentMethod === provider ? 'contained' : 'outlined'}
                    onClick={() => setSelectedPaymentMethod(provider)}
                    sx={{
                      backgroundColor: selectedPaymentMethod === provider ? BRAND.primary : 'transparent',
                      '&:hover': {
                        backgroundColor:
                          selectedPaymentMethod === provider ? BRAND.primaryHover : 'rgba(243,107,249,0.1)',
                      },
                    }}
                  >
                    {provider}
                  </Button>
                ))}
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <ShoppingCart />}
                disabled={totalQuantity === 0 || isProcessing}
                onClick={handleCheckout}
                sx={{
                  backgroundColor: BRAND.primary,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  borderRadius: '12px',
                  '&:hover': { backgroundColor: BRAND.primaryHover },
                }}
              >
                {isProcessing ? t('customer.processing') : t('common.buttons.checkout')}
              </Button>
            </Card>
          </Grid>
        </Grid>
      </Container>

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
