'use client';

import React, { use, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from '@mui/material';
import { ArrowBack, AssignmentReturn, CheckCircle, Payment } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetMyOrdersQuery, useCheckoutOrderMutation } from '@/src/stores/services/OrderApi';
import { OrderStatus, PaymentProvider } from '@/src/stores/types/order';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import { useTranslation } from 'react-i18next';
import { CreateRefundRequestDialog } from '@/src/components/CreateRefundRequestDialog/CreateRefundRequestDialog';
import { useGetMyRefundRequestsQuery } from '@/src/stores/services/RefundRequestApi';
import { RefundRequestStatus } from '@/src/stores/types/refundRequest';

// SSE cache invalidation is handled globally by SSEProvider.
// useGetMyOrdersQuery (provides ['Order']) auto-refetches on order:confirm/cancel/expire events.

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const resolvedParams = use(params);
  const orderId = parseInt(resolvedParams.id);
  const isSuccess = searchParams.get('success') === 'true';

  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>(PaymentProvider.MOMO);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);

  const { data, isLoading, error } = useGetMyOrdersQuery({ page: 0, size: 100 });
  const [checkoutOrder, { isLoading: isCheckingOut }] = useCheckoutOrderMutation();

  // Check if a pending refund request already exists for this order
  const { data: myRefundRequests } = useGetMyRefundRequestsQuery({ page: 0, size: 50 });
  const hasExistingRequest = useMemo(() => {
    const requests = myRefundRequests?.data?.content ?? [];
    return requests.some(
      (r) => r.orderId === orderId && r.status === RefundRequestStatus.PENDING,
    );
  }, [myRefundRequests, orderId]);

  const order = useMemo(() => {
    if (!data?.data?.content) return null;
    return data.data.content.find((o: any) => o.id === orderId);
  }, [data, orderId]);

  const isFreeOrder = order?.totalAmount === 0;

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.CONFIRMED:  return 'success';
      case OrderStatus.PENDING:    return 'warning';
      case OrderStatus.PROCESSING: return 'info';
      case OrderStatus.CANCELLED:
      case OrderStatus.EXPIRED:    return 'error';
      case OrderStatus.REFUNDED:   return 'info';
      default:                     return 'default';
    }
  };

  const handleCheckout = async () => {
    if (!order) return;
    setCheckoutError(null);

    try {
      const returnUrl = `${window.location.origin}/payment/return?orderId=${order.id}`;
      const result = await checkoutOrder({
        orderId: order.id,
        provider: isFreeOrder ? PaymentProvider.CASH : selectedProvider,
        returnUrl,
      }).unwrap();

      const paymentUrl = result.data?.paymentUrl;

      if (paymentUrl) {
        // Paid order — redirect to MoMo gateway
        window.location.href = paymentUrl;
      } else {
        // Free order — tickets issued immediately
        router.push('/dashboard/customer/my-tickets');
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
      <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert severity="error">{t('messages.error.notFound', { item: t('common.entities.order') })}</Alert>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/dashboard/customer/cart')}
          sx={{ mb: 3, color: '#2A3363' }}
        >
          {t('customer.backToOrders')}
        </Button>

        {isSuccess && (
          <Alert icon={<CheckCircle />} severity="success" sx={{ mb: 3 }}>
            {t('customer.orderPlacedSuccess')}
          </Alert>
        )}

        {checkoutError && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setCheckoutError(null)}>
            {checkoutError}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Left: order info + items */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ p: 3, borderRadius: '16px', mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2A3363' }}>
                  Order #{order.id}
                </Typography>
                <Chip label={order.status} color={getStatusColor(order.status)} sx={{ fontWeight: 600 }} />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('common.labels.event')}
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {order.eventTitle}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('customer.totalTickets')}
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {order.ticketCount} tickets
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('customer.orderDate')}
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {new Date(order.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </Card>

            {order.items && order.items.length > 0 && (
              <Card sx={{ p: 3, borderRadius: '16px' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#2A3363', mb: 2 }}>
                  {t('customer.orderItems')}
                </Typography>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                        <TableCell><Typography fontWeight={700}>{t('common.labels.ticketType')}</Typography></TableCell>
                        <TableCell><Typography fontWeight={700}>{t('common.labels.price')}</Typography></TableCell>
                        <TableCell><Typography fontWeight={700}>{t('common.labels.quantity')}</Typography></TableCell>
                        <TableCell><Typography fontWeight={700}>{t('common.labels.subtotal')}</Typography></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.ticketTypeName}</TableCell>
                          <TableCell>
                            {item.unitPrice === 0 ? (
                              <Chip label={t('common.labels.free')} size="small" color="success" />
                            ) : (
                              formatVND(item.unitPrice)
                            )}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            <Typography fontWeight={600}>
                              {item.subtotal === 0 ? t('common.labels.free') : formatVND(item.subtotal)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            )}
          </Grid>

          {/* Right: payment summary + checkout action */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ p: 3, borderRadius: '16px', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#2A3363', mb: 2 }}>
                {t('customer.paymentSummary')}
              </Typography>

              {order.items && order.items.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  {order.items.map((item) => (
                    <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        {item.ticketTypeName} x {item.quantity}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {item.subtotal === 0 ? t('common.labels.free') : formatVND(item.subtotal)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>
                  {t('common.labels.total')}
                </Typography>
                <Typography variant="h6" fontWeight={700} color="#F36BF9">
                  {order.totalAmount === 0 ? t('common.labels.free') : formatVND(order.totalAmount)}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('customer.paymentStatus')}
                </Typography>
                <Chip
                  label={
                    order.status === OrderStatus.CONFIRMED
                      ? t('common.status.paid')
                      : order.status === OrderStatus.PROCESSING
                        ? t('common.status.processing')
                        : t('common.status.pendingPayment')
                  }
                  color={
                    order.status === OrderStatus.CONFIRMED
                      ? 'success'
                      : order.status === OrderStatus.PROCESSING
                        ? 'info'
                        : 'warning'
                  }
                  size="small"
                />
              </Box>
            </Card>

            {/* Checkout panel — only for PENDING orders */}
            {order.status === OrderStatus.PENDING && (
              <Card sx={{ p: 3, borderRadius: '16px', mb: 2 }}>
                {isFreeOrder ? (
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {t('customer.freeTicketNotice')}
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={isCheckingOut ? <CircularProgress size={18} color="inherit" /> : <CheckCircle />}
                      disabled={isCheckingOut}
                      onClick={handleCheckout}
                      sx={{
                        backgroundColor: '#4CAF50',
                        py: 1.5,
                        borderRadius: '12px',
                        fontWeight: 700,
                        '&:hover': { backgroundColor: '#43A047' },
                      }}
                    >
                      {isCheckingOut ? t('common.labels.processing') : t('customer.claimFreeTickets')}
                    </Button>
                  </>
                ) : (
                  <>
                    <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
                      <FormLabel component="legend" sx={{ fontWeight: 600, color: '#2A3363', mb: 1 }}>
                        {t('customer.selectPaymentMethod')}
                      </FormLabel>
                      <RadioGroup
                        value={selectedProvider}
                        onChange={(e) => setSelectedProvider(e.target.value as PaymentProvider)}
                      >
                        <FormControlLabel
                          value={PaymentProvider.MOMO}
                          control={<Radio sx={{ color: '#A50064', '&.Mui-checked': { color: '#A50064' } }} />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Payment fontSize="small" />
                              <Typography variant="body2" fontWeight={600}>MoMo</Typography>
                            </Box>
                          }
                        />
                      </RadioGroup>
                    </FormControl>

                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={isCheckingOut ? <CircularProgress size={18} color="inherit" /> : <Payment />}
                      disabled={isCheckingOut}
                      onClick={handleCheckout}
                      sx={{
                        backgroundColor: '#F36BF9',
                        py: 1.5,
                        borderRadius: '12px',
                        fontWeight: 700,
                        '&:hover': { backgroundColor: '#e55ae0' },
                      }}
                    >
                      {isCheckingOut ? t('common.labels.processing') : t('customer.payNow')}
                    </Button>
                  </>
                )}
              </Card>
            )}

            {/* View tickets + refund request for CONFIRMED orders */}
            {order.status === OrderStatus.CONFIRMED && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => router.push('/dashboard/customer/my-tickets')}
                  sx={{
                    backgroundColor: '#F36BF9',
                    py: 1.5,
                    borderRadius: '12px',
                    fontWeight: 700,
                    '&:hover': { backgroundColor: '#e55ae0' },
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
                      py: 1.5,
                      borderRadius: '12px',
                      fontWeight: 600,
                      borderColor: '#F36BF9',
                      color: '#F36BF9',
                      '&:hover': { borderColor: '#d94ee0', color: '#d94ee0', backgroundColor: 'rgba(243,107,249,0.04)' },
                      '&.Mui-disabled': { opacity: 0.5 },
                    }}
                  >
                    {hasExistingRequest ? 'Refund Request Pending' : 'Request Refund'}
                  </Button>
                )}
              </Box>
            )}

            {/* Processing state — allow user to continue payment */}
            {order.status === OrderStatus.PROCESSING && (
              <Card sx={{ p: 3, borderRadius: '16px', mb: 2 }}>
                <Alert severity="info" sx={{ mb: 2, borderRadius: '8px' }}>
                  {t('customer.processingPayment')}
                </Alert>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={isCheckingOut ? <CircularProgress size={18} color="inherit" /> : <Payment />}
                  disabled={isCheckingOut}
                  onClick={handleCheckout}
                  sx={{
                    backgroundColor: '#F36BF9',
                    py: 1.5,
                    borderRadius: '12px',
                    fontWeight: 700,
                    '&:hover': { backgroundColor: '#e55ae0' },
                  }}
                >
                  {isCheckingOut ? t('common.labels.processing') : t('customer.continuePayment')}
                </Button>
              </Card>
            )}
          </Grid>
        </Grid>
      </Container>

      <Footer />

      {/* Refund request dialog */}
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
