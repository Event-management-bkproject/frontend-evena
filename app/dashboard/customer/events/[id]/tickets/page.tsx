'use client';

import React, { use, useState } from 'react';
import { Box, Container, Typography, Button, Card, Alert, Grid, Chip, Divider, CircularProgress } from '@mui/material';
import { ShoppingCart, Add, Remove, CalendarToday, Place, ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useGetEventByIdQuery } from '@/src/stores/services/EventApi';
import { useGetTicketTypesQuery } from '@/src/stores/services/TicketTypeApi';
import { useCreateOrderMutation, useCheckoutOrderMutation } from '@/src/stores/services/OrderApi';
import { useAuth } from '@/src/hooks/auth/useAuth';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import { orderLogger } from '@/src/utils/logger/flowLogger';
import { PaymentProvider } from '@/src/stores/types/order';
import SnackbarNotification from '@/src/components/SnackbarNotification';
import { useSnackbar } from '@/src/hooks/useSnackbar';
import { useTranslation } from 'react-i18next';

export default function EventTicketsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { t } = useTranslation();
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;
  const { isAuthenticated } = useAuth();

  const [selectedTickets, setSelectedTickets] = useState<Record<number, number>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentProvider>(PaymentProvider.CASH);
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  const { data: eventResponse, isLoading: eventLoading } = useGetEventByIdQuery(eventId);
  const { data: ticketTypesResponse, isLoading: ticketsLoading } = useGetTicketTypesQuery(eventId);
  const [createOrder] = useCreateOrderMutation();
  const [checkoutOrder] = useCheckoutOrderMutation();

  const event = eventResponse?.data;
  const ticketTypes = ticketTypesResponse?.data || [];

  const handleQuantityChange = (ticketTypeId: number, change: number) => {
    const ticket = ticketTypes.find((t) => t.id === ticketTypeId);
    if (!ticket) return;

    setSelectedTickets((prev) => {
      const newQuantity = (prev[ticketTypeId] || 0) + change;

      if (newQuantity <= 0) {
        const { [ticketTypeId]: removed, ...rest } = prev;
        return rest;
      }

      // Check perUserLimit if set
      if (ticket.perUserLimit && newQuantity > ticket.perUserLimit) {
        showSnackbar(t('customer.maxTicketsPerUser', { count: ticket.perUserLimit, name: ticket.name }), 'warning');
        return prev;
      }

      // Check available stock
      const available = ticket.total - ticket.sold;
      if (newQuantity > available) {
        showSnackbar(t('customer.onlyTicketsAvailable', { count: available, name: ticket.name }), 'warning');
        return prev;
      }

      return { ...prev, [ticketTypeId]: newQuantity };
    });
  };

  const calculateTotal = () => {
    return ticketTypes.reduce((total, ticket) => {
      const quantity = selectedTickets[ticket.id] || 0;
      return total + ticket.price * quantity;
    }, 0);
  };

  const getTotalQuantity = () => {
    return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  };

  const handleCheckout = async () => {
    // No auth check needed - already in protected route
    if (getTotalQuantity() === 0) {
      showSnackbar(t('customer.selectAtLeastOneTicket'), 'warning');
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare order items
      const orderItems = [];
      for (const [ticketTypeId, quantity] of Object.entries(selectedTickets)) {
        const ticket = ticketTypes.find((t) => t.id === parseInt(ticketTypeId));
        if (!ticket) {
          throw new Error(`Ticket type ${ticketTypeId} not found`);
        }

        // Check availability
        const available = ticket.total - ticket.sold;
        if (quantity > available) {
          throw new Error(`Only ${available} tickets available for ${ticket.name}`);
        }

        orderItems.push({
          ticketTypeId: parseInt(ticketTypeId),
          quantity,
        });
      }

      console.log('Creating order for event:', eventId);
      console.log('Order items:', orderItems);

      // ✅ ĐÚNG: Có cả eventId và items
      const orderResult = await createOrder({
        eventId: eventId, // UUID string
        items: orderItems,
      }).unwrap();

      if (!orderResult.success || !orderResult.data) {
        throw new Error(orderResult.message || 'Failed to create order');
      }

      const orderId = orderResult.data.id;
      console.log('Order created, ID:', orderId);

      // Process payment
      // const checkoutResult = await checkoutOrder({
      //   orderId,
      //   paymentProvider: selectedPaymentMethod,
      // }).unwrap();

      // if (!checkoutResult.success) {
      //   throw new Error(checkoutResult.message || 'Payment failed');
      // }

      // Success - redirect to order confirmation
      router.push(`/dashboard/customer/cart`);
    } catch (error: any) {
      console.error('Checkout error:', error);

      // Display detailed error
      const errorMsg = error?.data?.message || error?.message || 'Checkout failed';
      showSnackbar(`Error: ${errorMsg}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (eventLoading || ticketsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: '#F36BF9' }} />
      </Box>
    );
  }

  if (!event) {
    return (
      <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
        <Header cartItemCount={0} />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert severity="error">{t('messages.error.notFound', { item: t('common.entities.event') })}</Alert>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header cartItemCount={getTotalQuantity()} />

      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        {/* Back Button */}
        <Button startIcon={<ArrowBack />} onClick={() => router.back()} sx={{ mb: 3, color: '#2A3363' }}>
          {t('customer.backToEvents')}
        </Button>

        {/* Event Info */}
        <Card sx={{ p: 3, mb: 4, borderRadius: '16px' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#2A3363', mb: 2 }}>
            {event.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday sx={{ color: '#F36BF9' }} />
              <Typography variant="body2">{new Date(event.startAt).toLocaleDateString()}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Place sx={{ color: '#F36BF9' }} />
              <Typography variant="body2">{event.venue?.name}</Typography>
            </Box>
          </Box>
        </Card>

        <Grid container spacing={4}>
          {/* Ticket Selection */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#2A3363', mb: 3 }}>
              {t('customer.selectTickets')}
            </Typography>

            {ticketTypes.length === 0 ? (
              <Alert severity="info">{t('customer.noTicketsAvailable')}</Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {ticketTypes.map((ticket) => {
                  const available = ticket.total - ticket.sold;
                  const isAvailable = available > 0;

                  return (
                    <Card key={ticket.id} sx={{ p: 3, borderRadius: '12px' }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#2A3363' }}>
                            {ticket.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {ticket.description}
                          </Typography>
                          <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {ticket.earlyBird && <Chip label={t('customer.earlyBird')} size="small" color="secondary" />}
                            {ticket.perUserLimit && (
                              <Chip label={t('customer.maxPerUser', { count: ticket.perUserLimit })} size="small" color="info" />
                            )}
                            <Chip
                              label={isAvailable ? t('customer.available', { count: available }) : t('customer.soldOut')}
                              size="small"
                              color={isAvailable ? 'success' : 'error'}
                            />
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 3 }}>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: '#F36BF9' }}>
                            ${ticket.price.toLocaleString()}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 3 }}>
                          {isAvailable ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleQuantityChange(ticket.id, -1)}
                                disabled={!selectedTickets[ticket.id]}
                                sx={{ minWidth: '40px', p: 1 }}
                              >
                                <Remove />
                              </Button>
                              <Typography
                                sx={{
                                  minWidth: '40px',
                                  textAlign: 'center',
                                  fontWeight: 600,
                                }}
                              >
                                {selectedTickets[ticket.id] || 0}
                              </Typography>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleQuantityChange(ticket.id, 1)}
                                disabled={
                                  (selectedTickets[ticket.id] || 0) >= available ||
                                  Boolean(
                                    ticket.perUserLimit && (selectedTickets[ticket.id] || 0) >= ticket.perUserLimit,
                                  )
                                }
                                sx={{
                                  minWidth: '40px',
                                  p: 1,
                                  backgroundColor: '#F36BF9',
                                  '&:hover': { backgroundColor: '#e55ae0' },
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

          {/* Order Summary */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                p: 3,
                borderRadius: '16px',
                position: { md: 'sticky' },
                top: { md: 100 },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#2A3363', mb: 2 }}>
                {t('customer.orderSummary')}
              </Typography>

              <Box sx={{ mb: 2 }}>
                {Object.entries(selectedTickets).map(([ticketTypeId, quantity]) => {
                  const ticket = ticketTypes.find((t) => t.id === parseInt(ticketTypeId));
                  if (!ticket) return null;

                  return (
                    <Box
                      key={ticketTypeId}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2">
                        {ticket.name} x {quantity}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        ${(ticket.price * quantity).toLocaleString()}
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
                <Typography variant="h6" fontWeight={700} color="#F36BF9">
                  ${calculateTotal().toLocaleString()}
                </Typography>
              </Box>

              {/* Payment Method Selection */}
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
                      backgroundColor: selectedPaymentMethod === provider ? '#F36BF9' : 'transparent',
                      '&:hover': {
                        backgroundColor: selectedPaymentMethod === provider ? '#e55ae0' : 'rgba(243, 107, 249, 0.1)',
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
                startIcon={isProcessing ? <CircularProgress size={20} /> : <ShoppingCart />}
                disabled={getTotalQuantity() === 0 || isProcessing}
                onClick={handleCheckout}
                sx={{
                  backgroundColor: '#F36BF9',
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  borderRadius: '12px',
                  '&:hover': { backgroundColor: '#e55ae0' },
                }}
              >
                {isProcessing ? t('customer.processing') : t('common.buttons.checkout')}
              </Button>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Footer />

      {/* Snackbar for notifications */}
      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={closeSnackbar}
      />
    </Box>
  );
}
