'use client';

import { useState, useEffect } from 'react';
import {
  Box, Card, Typography, Chip, TextField, InputAdornment,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  CircularProgress, ToggleButtonGroup, ToggleButton, Pagination,
} from '@mui/material';
import { Search as SearchIcon, ShoppingCart as OrdersIcon } from '@mui/icons-material';
import AdminLayout from '@/src/components/layout/AdminLayout';
import AdminPageShell from '@/src/components/AdminSidebar/AdminPageShell';
import RoleGuard from '@/src/components/RoleGuard';
import { useGetOrganizerOrdersQuery } from '@/src/stores/services/OrderApi';
import { OrderStatus } from '@/src/stores/types/order';
import { ADMIN } from '@/src/utils/constants/adminBrand';
import dayjs from 'dayjs';

type FilterMode = 'all' | OrderStatus;

const STATUS_META: Record<OrderStatus, { label: string; bg: string; color: string }> = {
  [OrderStatus.PENDING]:    { label: 'Pending',    bg: ADMIN.warningBg, color: ADMIN.warningText },
  [OrderStatus.PROCESSING]: { label: 'Processing', bg: ADMIN.infoBg,    color: ADMIN.infoText },
  [OrderStatus.CONFIRMED]:  { label: 'Confirmed',  bg: ADMIN.successBg, color: ADMIN.successText },
  [OrderStatus.CANCELLED]:  { label: 'Cancelled',  bg: ADMIN.errorBg,   color: ADMIN.errorText },
  [OrderStatus.EXPIRED]:    { label: 'Expired',    bg: ADMIN.pageBg,    color: ADMIN.textMuted },
  [OrderStatus.REFUNDED]:   { label: 'Refunded',   bg: ADMIN.pageBg,    color: ADMIN.textSecondary },
};

export default function AdminOrdersPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [page, setPage] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useGetOrganizerOrdersQuery({
    page,
    size: 20,
    status: filter !== 'all' ? filter : undefined,
    keyword: debouncedSearch || undefined,
  });

  const orders = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const totalElements = data?.data?.totalElements ?? 0;

  const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <AdminLayout>
        <AdminPageShell
          title="Orders & Revenue"
          breadcrumbs={[{ label: 'Admin', href: '/dashboard/admin' }, { label: 'Orders' }]}
        >
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search by email, order ID, or event…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 280, bgcolor: ADMIN.cardBg, borderRadius: '8px' }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: ADMIN.textMuted }} /></InputAdornment> }}
            />
            <ToggleButtonGroup
              value={filter}
              exclusive
              onChange={(_, v) => { if (v) { setFilter(v); setPage(0); } }}
              size="small"
              sx={{ flexWrap: 'wrap' }}
            >
              <ToggleButton value="all" sx={{ textTransform: 'none', fontSize: 12 }}>All</ToggleButton>
              {Object.values(OrderStatus).map((s) => (
                <ToggleButton key={s} value={s} sx={{ textTransform: 'none', fontSize: 12 }}>
                  {STATUS_META[s].label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            {!isLoading && (
              <Typography variant="body2" sx={{ color: ADMIN.textMuted, ml: 'auto' }}>
                {totalElements} result{totalElements !== 1 ? 's' : ''}
              </Typography>
            )}
          </Box>

          <Card sx={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${ADMIN.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress sx={{ color: ADMIN.primary }} />
              </Box>
            ) : orders.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <OrdersIcon sx={{ fontSize: 48, color: ADMIN.border, mb: 1 }} />
                <Typography sx={{ color: ADMIN.textSecondary }}>No orders found</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: ADMIN.pageBg }}>
                      {['Order ID', 'Customer', 'Event', 'Items', 'Total', 'Status', 'Date'].map((h) => (
                        <TableCell key={h} sx={{ fontWeight: 600, color: ADMIN.heading, fontSize: 12, borderBottom: `1px solid ${ADMIN.border}` }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order) => {
                      const meta = STATUS_META[order.status as OrderStatus];
                      return (
                        <TableRow key={order.id} sx={{ '&:hover': { bgcolor: ADMIN.surfaceBg } }}>
                          <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: ADMIN.heading }}>#{order.id}</Typography></TableCell>
                          <TableCell><Typography variant="body2" sx={{ color: ADMIN.body, fontSize: 13 }}>{order.userEmail}</Typography></TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 200, color: ADMIN.body }} noWrap>{order.eventSnapshot?.title ?? '—'}</Typography>
                            {order.eventSnapshot?.organizationName && <Typography variant="caption" sx={{ color: ADMIN.textMuted }}>{order.eventSnapshot.organizationName}</Typography>}
                          </TableCell>
                          <TableCell><Typography variant="body2" sx={{ color: ADMIN.body }}>{order.items?.length ?? 0} item(s)</Typography></TableCell>
                          <TableCell><Typography variant="body2" sx={{ fontWeight: 600, color: ADMIN.heading }}>{fmt(order.totalAmount)}</Typography></TableCell>
                          <TableCell><Chip label={meta.label} size="small" sx={{ bgcolor: meta.bg, color: meta.color, fontWeight: 600, fontSize: 11 }} /></TableCell>
                          <TableCell><Typography variant="body2" sx={{ fontSize: 12, color: ADMIN.body }}>{dayjs(order.createdAt).format('DD/MM/YY HH:mm')}</Typography></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination count={totalPages} page={page + 1} onChange={(_, v) => setPage(v - 1)} shape="rounded" color="primary" />
            </Box>
          )}
        </AdminPageShell>
      </AdminLayout>
    </RoleGuard>
  );
}
