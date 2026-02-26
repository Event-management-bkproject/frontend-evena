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
  Chip,
  CircularProgress,
  Alert,
  Pagination,
  IconButton,
  Tooltip,
  Collapse,
} from '@mui/material';
import { Visibility, Cancel, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useGetMyOrdersQuery, useCancelOrderMutation } from '@/src/stores/services/OrderApi';
import { OrderStatus } from '@/src/stores/types/order';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import { orderLogger } from '@/src/utils/logger/flowLogger';
import SnackbarNotification from '@/src/components/SnackbarNotification';
import { useSnackbar } from '@/src/hooks/useSnackbar';
import { useTranslation } from 'react-i18next';
import { useSSE } from '@/src/providers/SSEProvider';
import { SSENormalizedType } from '@/src/stores/types/sse';

interface OrderRowProps {
  order: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onCancel: (orderId: number) => void;
  isCancelling: boolean;
  getStatusColor: (status: OrderStatus) => any;
  router: any;
  t: any;
}

function OrderRow({
  order,
  isExpanded,
  onToggleExpand,
  onCancel,
  isCancelling,
  getStatusColor,
  router,
  t,
}: OrderRowProps) {
  return (
    <>
      <TableRow hover>
        <TableCell>
          <IconButton size="small" onClick={onToggleExpand}>
            {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        {/* <TableCell>#{order.id}</TableCell> */}
        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
        <TableCell>{order.ticketCount} {t('common.entities.ticket')}</TableCell>
        <TableCell sx={{ fontWeight: 600 }}>${order.totalAmount.toLocaleString()}</TableCell>
        <TableCell>
          <Chip label={order.status} color={getStatusColor(order.status)} size="small" />
        </TableCell>
        <TableCell>
          <Chip
            label={order.status === OrderStatus.CONFIRMED ? t('common.status.paid') : t('common.status.pendingPayment')}
            color={order.status === OrderStatus.CONFIRMED ? 'success' : 'warning'}
            size="small"
          />
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={t('customer.viewDetails')}>
              <IconButton
                size="small"
                onClick={() => router.push(`/dashboard/customer/cart/${order.id}`)}
                sx={{ color: '#F36BF9' }}
              >
                <Visibility />
              </IconButton>
            </Tooltip>
            {order.status === OrderStatus.PENDING && (
              <Tooltip title={t('customer.cancelOrder')}>
                <IconButton
                  size="small"
                  onClick={() => onCancel(order.id)}
                  disabled={isCancelling}
                  sx={{ color: '#f44336' }}
                >
                  <Cancel />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              {order.items && order.items.length > 0 ? (
                <>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2A3363' }}>
                    {t('customer.orderItems')}
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#F9F9F9' }}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {t('common.labels.event')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {t('common.labels.ticketType')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {t('common.labels.price')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {t('common.labels.quantity')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {t('common.labels.subtotal')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.items.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.eventTitle}</TableCell>
                          <TableCell>{item.ticketTypeName}</TableCell>
                          <TableCell>${item.unitPrice.toLocaleString()}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            <Typography fontWeight={600}>${item.subtotal.toLocaleString()}</Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t('customer.noItemsFound')}
                </Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

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
                      getStatusColor={getStatusColor}
                      router={router}
                      t={t}
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
