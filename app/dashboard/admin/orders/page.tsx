'use client';

import { useState, useMemo } from 'react';
import {
  Box, Card, Typography, Chip, TextField, InputAdornment,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  CircularProgress, ToggleButtonGroup, ToggleButton,
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
  const [filter, setFilter] = useState<FilterMode>('all');

  const { data, isLoading } = useGetOrganizerOrdersQuery({ page: 0, size: 200 });
  const allOrders = data?.data?.content ?? [];

  const filtered = useMemo(() => {
    let list = filter !== 'all' ? allOrders.filter((o) => o.status === filter) : allOrders;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((o) =>
        (o.userEmail ?? '').toLowerCase().includes(q) ||
        String(o.id).includes(q) ||
        (o.eventSnapshot?.title ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [allOrders, filter, search]);

  const confirmedOrders = useMemo(() => allOrders.filter((o) => o.status === OrderStatus.CONFIRMED), [allOrders]);
  const totalRevenue = useMemo(() => confirmedOrders.reduce((s, o) => s + o.totalAmount, 0), [confirmedOrders]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: allOrders.length };
    Object.values(OrderStatus).forEach((s) => { c[s] = allOrders.filter((o) => o.status === s).length; });
    return c;
  }, [allOrders]);

  const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  const summaryCards = [
    { label: 'Total Orders', value: allOrders.length, color: ADMIN.primary },
    { label: 'Confirmed', value: confirmedOrders.length, color: ADMIN.success },
    { label: 'Pending', value: counts[OrderStatus.PENDING] ?? 0, color: ADMIN.warning },
    { label: 'Total Revenue', value: fmt(totalRevenue), color: ADMIN.info },
  ];

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <AdminLayout>
        <AdminPageShell
          title="Orders & Revenue"
          breadcrumbs={[{ label: 'Admin', href: '/dashboard/admin' }, { label: 'Orders' }]}
        >
          {/* Summary row */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
            {summaryCards.map((s) => (
              <Card key={s.label} sx={{ p: 2, borderRadius: '12px', border: `1px solid ${ADMIN.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: s.color }}>
                  {isLoading ? <CircularProgress size={18} /> : s.value}
                </Typography>
                <Typography variant="body2" sx={{ color: ADMIN.textSecondary, fontSize: 12 }}>{s.label}</Typography>
              </Card>
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search by email, order ID, or event…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 280, bgcolor: ADMIN.cardBg, borderRadius: '8px' }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: ADMIN.textMuted }} /></InputAdornment> }}
            />
            <ToggleButtonGroup value={filter} exclusive onChange={(_, v) => v && setFilter(v)} size="small" sx={{ flexWrap: 'wrap' }}>
              <ToggleButton value="all" sx={{ textTransform: 'none', fontSize: 12 }}>All ({counts.all})</ToggleButton>
              {Object.values(OrderStatus).map((s) => (
                <ToggleButton key={s} value={s} sx={{ textTransform: 'none', fontSize: 12 }}>
                  {STATUS_META[s].label} ({counts[s] ?? 0})
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <Card sx={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${ADMIN.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress sx={{ color: ADMIN.primary }} />
              </Box>
            ) : filtered.length === 0 ? (
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
                    {filtered.map((order) => {
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
        </AdminPageShell>
      </AdminLayout>
    </RoleGuard>
  );
}
