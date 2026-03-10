'use client';

import React, { useState } from 'react';
import {
  Box, Container, Typography, Button, Card,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Alert, Pagination,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useGetMyOrdersQuery, useCancelOrderMutation } from '@/src/stores/services/OrderApi';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import SnackbarNotification from '@/src/components/SnackbarNotification';
import { OrderRow } from '@/src/components/OrderRow/OrderRow';
import { ConfirmationDialog } from '@/src/components/ConfirmationDialog';
import { useSnackbar } from '@/src/hooks/useSnackbar';
import { useTranslation } from 'react-i18next';
import { BRAND } from '@/src/utils/constants/constant';

// SSE cache invalidation is handled globally by SSEProvider.
// Order cache is auto-refreshed when SSE order events arrive.

export default function MyOrdersPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const [page, setPage] = useState(0);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [cancelTargetId, setCancelTargetId] = useState<number | null>(null);

  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const { data, isLoading, error } = useGetMyOrdersQuery({ page, size: 10 });
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const orders = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 0;

  const handleCancelConfirm = async () => {
    if (cancelTargetId === null) return;
    try {
      await cancelOrder(cancelTargetId).unwrap();
      showSnackbar(t('messages.success.orderCancelled'), 'success');
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      showSnackbar(
        t('messages.error.cancelFailed', {
          item: t('common.entities.order'),
          reason: err?.data?.message ?? '',
        }),
        'error',
      );
    } finally {
      setCancelTargetId(null);
    }
  };

  const handleToggleExpand = (orderId: number) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: BRAND.primary }} />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: BRAND.bgPage, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <Container maxWidth="xl" sx={{ py: 4, flex: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: BRAND.dark, mb: 4 }}>
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
              sx={{ backgroundColor: BRAND.primary, '&:hover': { backgroundColor: BRAND.primaryHover } }}
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
                      onCancel={(id) => setCancelTargetId(id)}
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
                      backgroundColor: BRAND.primary,
                      '&:hover': { backgroundColor: BRAND.primaryHover },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>

      <Footer />

      {/* Cancel confirmation — replaces native window.confirm() */}
      <ConfirmationDialog
        open={cancelTargetId !== null}
        onClose={() => setCancelTargetId(null)}
        onConfirm={handleCancelConfirm}
        title={t('customer.cancelOrderTitle')}
        message={t('customer.confirmCancelOrder')}
        variant="error"
        loading={isCancelling}
        confirmText={t('common.buttons.confirm')}
        cancelText={t('common.buttons.cancel')}
      />

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={closeSnackbar}
      />
    </Box>
  );
}
