'use client';

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
  TableRow,
  TableCell,
  Table,
  TableHead,
  TableBody,
} from '@mui/material';
import { Visibility, Cancel, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { OrderListResponse, OrderStatus } from '@/src/stores/types/order';

interface OrderRowProps {
  order: OrderListResponse;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onCancel: (orderId: number) => void;
  isCancelling: boolean;
}

const STATUS_COLOR: Record<OrderStatus, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  [OrderStatus.CONFIRMED]:  'success',
  [OrderStatus.PENDING]:    'warning',
  [OrderStatus.CANCELLED]:  'error',
  [OrderStatus.EXPIRED]:    'error',
  [OrderStatus.REFUNDED]:   'info',
  [OrderStatus.PROCESSING]: 'default',
};

export function OrderRow({ order, isExpanded, onToggleExpand, onCancel, isCancelling }: OrderRowProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const statusColor = STATUS_COLOR[order.status] ?? 'default';

  return (
    <>
      <TableRow hover>
        <TableCell>
          <IconButton size="small" onClick={onToggleExpand}>
            {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
        <TableCell>{order.ticketCount} {t('common.entities.ticket')}</TableCell>
        <TableCell sx={{ fontWeight: 600 }}>${order.totalAmount.toLocaleString()}</TableCell>
        <TableCell>
          <Chip label={order.status} color={statusColor} size="small" />
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
                        <TableCell><Typography variant="body2" fontWeight={600}>{t('common.labels.event')}</Typography></TableCell>
                        <TableCell><Typography variant="body2" fontWeight={600}>{t('common.labels.ticketType')}</Typography></TableCell>
                        <TableCell><Typography variant="body2" fontWeight={600}>{t('common.labels.price')}</Typography></TableCell>
                        <TableCell><Typography variant="body2" fontWeight={600}>{t('common.labels.quantity')}</Typography></TableCell>
                        <TableCell><Typography variant="body2" fontWeight={600}>{t('common.labels.subtotal')}</Typography></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.items.map((item) => (
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

export default OrderRow;
