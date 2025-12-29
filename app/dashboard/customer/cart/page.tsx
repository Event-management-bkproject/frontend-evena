'use client';

import React, { useState } from 'react';
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

interface OrderRowProps {
  order: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onCancel: (orderId: number) => void;
  isCancelling: boolean;
  getStatusColor: (status: OrderStatus) => any;
  router: any;
}

function OrderRow({
  order,
  isExpanded,
  onToggleExpand,
  onCancel,
  isCancelling,
  getStatusColor,
  router,
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
        <TableCell>{order.ticketCount} tickets</TableCell>
        <TableCell sx={{ fontWeight: 600 }}>${order.totalAmount.toLocaleString()}</TableCell>
        <TableCell>
          <Chip label={order.status} color={getStatusColor(order.status)} size="small" />
        </TableCell>
        <TableCell>
          <Chip
            label={order.status === OrderStatus.CONFIRMED ? 'PAID' : 'PENDING'}
            color={order.status === OrderStatus.CONFIRMED ? 'success' : 'warning'}
            size="small"
          />
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => router.push(`/dashboard/customer/cart/${order.id}`)}
                sx={{ color: '#F36BF9' }}
              >
                <Visibility />
              </IconButton>
            </Tooltip>
            {order.status === OrderStatus.PENDING && (
              <Tooltip title="Cancel Order">
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
                    Order Items
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#F9F9F9' }}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            Event
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            Ticket Type
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            Price
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            Quantity
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            Subtotal
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
                  No items found
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
  const [page, setPage] = useState(0);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const { data, isLoading, error } = useGetMyOrdersQuery({ page, size: 10 });
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const orders = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;

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
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      orderLogger.info('Cancelling order', { orderId });
      await cancelOrder(orderId).unwrap();
      orderLogger.info('Order cancelled successfully', { orderId });
      showSnackbar('Order cancelled successfully', 'success');
    } catch (error: any) {
      orderLogger.error('Failed to cancel order', { orderId, error });
      showSnackbar(`Failed to cancel order: ${error?.data?.message || 'Please try again'}`, 'error');
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
          My Orders
        </Typography>

        {error ? (
          <Alert severity="error">Failed to load orders. Please try again later.</Alert>
        ) : orders.length === 0 ? (
          <Card sx={{ p: 6, textAlign: 'center', borderRadius: '16px' }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No orders yet
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/dashboard/customer')}
              sx={{
                backgroundColor: '#F36BF9',
                '&:hover': { backgroundColor: '#e55ae0' },
              }}
            >
              Browse Events
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
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Payment</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
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
