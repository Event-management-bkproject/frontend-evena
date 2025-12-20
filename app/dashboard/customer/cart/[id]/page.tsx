'use client';

import React, { use, useMemo } from 'react';
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

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedParams = use(params);
  const orderId = parseInt(resolvedParams.id);
  const isSuccess = searchParams.get('success') === 'true';

  // Fetch all orders and find the specific one
  const { data, isLoading, error } = useGetMyOrdersQuery({ page: 0, size: 100 });

  const order = useMemo(() => {
    if (!data?.data?.content) return null;
    return data.data.content.find((o: any) => o.id === orderId);
  }, [data, orderId]);

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
        <Header cartItemCount={0} />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert severity="error">Order not found</Alert>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header cartItemCount={0} />

      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/dashboard/customer/cart')}
          sx={{ mb: 3, color: '#2A3363' }}
        >
          Back to Orders
        </Button>

        {isSuccess && (
          <Alert icon={<CheckCircle />} severity="success" sx={{ mb: 3 }}>
            Order placed successfully! Your tickets have been sent to your email.
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
                  Event
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {order.eventTitle}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Tickets
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {order.ticketCount} tickets
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Order Date
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {new Date(order.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </Card>

            {order.items && order.items.length > 0 && (
              <Card sx={{ p: 3, borderRadius: '16px' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#2A3363', mb: 2 }}>
                  Order Items
                </Typography>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                        <TableCell><Typography fontWeight={700}>Ticket Type</Typography></TableCell>
                        <TableCell><Typography fontWeight={700}>Price</Typography></TableCell>
                        <TableCell><Typography fontWeight={700}>Quantity</Typography></TableCell>
                        <TableCell><Typography fontWeight={700}>Subtotal</Typography></TableCell>
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
                Payment Summary
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
                  Total
                </Typography>
                <Typography variant="h6" fontWeight={700} color="#F36BF9">
                  ${order.totalAmount.toLocaleString()}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Payment Status
                </Typography>
                <Chip
                  label={order.status === OrderStatus.CONFIRMED ? 'PAID' : 'PENDING'}
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
                View My Tickets
              </Button>
            )}
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
}
