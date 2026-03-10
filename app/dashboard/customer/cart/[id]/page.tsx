'use client';

import React, { use, useMemo, useEffect } from 'react';
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
} from '@mui/material';
import { ArrowBack, CheckCircle } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetMyOrdersQuery } from '@/src/stores/services/OrderApi';
import { OrderStatus } from '@/src/stores/types/order';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import { useTranslation } from 'react-i18next';
import { useSSE } from '@/src/providers/SSEProvider';
import { SSENormalizedType } from '@/src/stores/types/sse';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { t } = useTranslation();
  const { lastEvent } = useSSE();
  const searchParams = useSearchParams();
  const resolvedParams = use(params);
  const orderId = parseInt(resolvedParams.id);
  const isSuccess = searchParams.get('success') === 'true';

  // Fetch all orders and find the specific one
  const { data, isLoading, error, refetch: refetchOrders } = useGetMyOrdersQuery({ page: 0, size: 100 });

  const order = useMemo(() => {
    if (!data?.data?.content) return null;
    return data.data.content.find((o: any) => o.id === orderId);
  }, [data, orderId]);

  // Listen to SSE events for real-time order updates
  useEffect(() => {
    if (!lastEvent) return;

    const eventData = lastEvent.data;
    const affectsThisOrder =
      eventData?.orderId === orderId ||
      eventData?.orderId?.toString() === orderId.toString();

    console.log('📨 [OrderDetail] Received SSE event:', lastEvent.type);

    switch (lastEvent.type) {
      case SSENormalizedType.ORDER_CONFIRMED:
      case SSENormalizedType.ORDER_CANCELLED:
      case SSENormalizedType.ORDER_EXPIRED:
        if (affectsThisOrder) {
          console.log('🔄 [OrderDetail] Refetching order...');
          refetchOrders();
        }
        break;
      default:
        break;
    }
  }, [lastEvent, orderId, refetchOrders]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.CONFIRMED:
        return 'success';
      case OrderStatus.PENDING:
        return 'warning';
      case OrderStatus.CANCELLED:
      case OrderStatus.EXPIRED:
        return 'error';
      case OrderStatus.REFUNDED:
        return 'info';
      default:
        return 'default';
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

        <Grid container spacing={4}>
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
                          <TableCell>${item.unitPrice.toLocaleString()}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell><Typography fontWeight={600}>${item.subtotal.toLocaleString()}</Typography></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            )}
          </Grid>

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
                        ${item.subtotal.toLocaleString()}
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
                  ${order.totalAmount.toLocaleString()}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('customer.paymentStatus')}
                </Typography>
                <Chip
                  label={order.status === OrderStatus.CONFIRMED ? t('common.status.paid') : t('common.status.pendingPayment')}
                  color={order.status === OrderStatus.CONFIRMED ? 'success' : 'warning'}
                  size="small"
                />
              </Box>
            </Card>

            {order.status === OrderStatus.CONFIRMED && (
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
            )}
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
}
