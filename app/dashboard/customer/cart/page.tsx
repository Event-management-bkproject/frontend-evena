'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useGetMyOrdersQuery, useCancelOrderMutation } from '@/src/stores/services/OrderApi';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import { orderLogger } from '@/src/utils/logger/flowLogger';
import SnackbarNotification from '@/src/components/SnackbarNotification';
import { OrderRow } from '@/src/components/OrderRow/OrderRow';
import { useSnackbar } from '@/src/hooks/useSnackbar';
import { useTranslation } from 'react-i18next';
import { useSSE } from '@/src/providers/SSEProvider';
import { SSENormalizedType } from '@/src/stores/types/sse';

export default function MyOrdersPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { lastEvent } = useSSE();
  const [page, setPage] = useState(0);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const { data, isLoading, error, refetch: refetchOrders } = useGetMyOrdersQuery({ page, size: 10 });
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const orders = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;

  // Listen to SSE events for real-time order updates
  useEffect(() => {
    if (!lastEvent) return;

    console.log('📨 [MyOrders] Received SSE event:', lastEvent.type);

    // Refetch orders when order-related events occur
    switch (lastEvent.type) {
      case SSENormalizedType.ORDER_CREATED:
      case SSENormalizedType.ORDER_CONFIRMED:
      case SSENormalizedType.ORDER_CANCELLED:
      case SSENormalizedType.ORDER_EXPIRED:
        console.log('🔄 [MyOrders] Refetching orders...');
        refetchOrders();
        break;
      default:
        break;
    }
  }, [lastEvent, refetchOrders]);

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm(t('customer.confirmCancelOrder'))) {
      return;
    }

    try {
      orderLogger.info('Cancelling order', { orderId });
      await cancelOrder(orderId).unwrap();
      orderLogger.info('Order cancelled successfully', { orderId });
      showSnackbar(t('messages.success.orderCancelled'), 'success');
    } catch (error: any) {
      orderLogger.error('Failed to cancel order', { orderId, error });
      showSnackbar(t('messages.error.cancelFailed', { item: t('common.entities.order'), reason: error?.data?.message || '' }), 'error');
    }
  };

  const handleToggleExpand = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: '#F36BF9' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header cartItemCount={0} />

      <Container maxWidth="xl" sx={{ py: 4, flex: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#2A3363', mb: 4 }}>
          {t('customer.myOrders')}
        </Typography>

        {error ? (
          <Alert severity="error">{t('messages.error.loadFailed', { item: t('common.entities.order') })}</Alert>
        ) : orders.length === 0 ? (
          <Card sx={{ p: 6, textAlign: 'center', borderRadius: '16px' }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              {t('customer.noOrdersYet')}
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/dashboard/customer')}
              sx={{
                backgroundColor: '#F36BF9',
                '&:hover': { backgroundColor: '#e55ae0' },
              }}
            >
              {t('customer.browseEvents')}
            </Button>
          </Card>
        ) : (
          <>
            <TableContainer component={Card} sx={{ borderRadius: '16px' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                    <TableCell sx={{ fontWeight: 700, width: '50px' }} />
                    {/* <TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell> */}
                    <TableCell sx={{ fontWeight: 700 }}>{t('common.labels.date')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('common.labels.items')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('common.labels.total')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('common.labels.status')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('common.labels.payment')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('common.labels.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      isExpanded={expandedOrderId === order.id}
                      onToggleExpand={() => handleToggleExpand(order.id)}
                      onCancel={handleCancelOrder}
                      isCancelling={isCancelling}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page + 1}
                  onChange={(_, newPage) => setPage(newPage - 1)}
                  color="primary"
                  sx={{
                    '& .MuiPaginationItem-root.Mui-selected': {
                      backgroundColor: '#F36BF9',
                      '&:hover': { backgroundColor: '#e55ae0' },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
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
