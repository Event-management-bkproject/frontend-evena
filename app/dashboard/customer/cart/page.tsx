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
} from '@mui/material';
import { Visibility, Cancel } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useGetMyOrdersQuery, useCancelOrderMutation } from '@/src/stores/services/OrderApi';
import { OrderStatus } from '@/src/stores/types/order';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import { orderLogger } from '@/src/utils/logger/flowLogger';

export default function MyOrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
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
      alert('Order cancelled successfully');
    } catch (error: any) {
      orderLogger.error('Failed to cancel order', { orderId, error });
      alert(`Failed to cancel order: ${error?.data?.message || 'Please try again'}`);
    }
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
                    <TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Event</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Payment</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{order.eventTitle}</TableCell>
                      <TableCell>{order.ticketCount} tickets</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        ${order.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          color={getStatusColor(order.status)}
                          size="small"
                        />
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
                              onClick={() => router.push(`/dashboard/customer/my-orders/${order.id}`)}
                              sx={{ color: '#F36BF9' }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          {order.status === OrderStatus.PENDING && (
                            <Tooltip title="Cancel Order">
                              <IconButton
                                size="small"
                                onClick={() => handleCancelOrder(order.id)}
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
    </Box>
  );
}
