'use client';

import { useState, useMemo } from 'react';
import {
  Box, Card, Typography, Chip, TextField, InputAdornment,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  CircularProgress, IconButton, Tooltip, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import { Search as SearchIcon, AssignmentReturn as RefundIcon, CheckCircle as ApproveIcon, Cancel as RejectIcon } from '@mui/icons-material';
import AdminLayout from '@/src/components/layout/AdminLayout';
import AdminPageShell from '@/src/components/AdminSidebar/AdminPageShell';
import RoleGuard from '@/src/components/RoleGuard';
import Snackbar from '@/src/components/SnackBar';
import { ReviewRefundRequestDialog } from '@/src/components/ReviewRefundRequestDialog/ReviewRefundRequestDialog';
import { useGetOrganizerRefundRequestsQuery } from '@/src/stores/services/RefundRequestApi';
import { RefundRequestResponse, RefundRequestStatus } from '@/src/stores/types/refundRequest';
import { ADMIN } from '@/src/utils/constants/adminBrand';
import dayjs from 'dayjs';

type FilterMode = 'all' | RefundRequestStatus;

const STATUS_META: Record<RefundRequestStatus, { label: string; bg: string; color: string }> = {
  [RefundRequestStatus.PENDING]:           { label: 'Pending',      bg: ADMIN.warningBg, color: ADMIN.warningText },
  [RefundRequestStatus.APPROVED]:          { label: 'Approved',     bg: ADMIN.successBg, color: ADMIN.successText },
  [RefundRequestStatus.REJECTED]:          { label: 'Rejected',     bg: ADMIN.errorBg,   color: ADMIN.errorText },
  [RefundRequestStatus.REFUND_PROCESSING]: { label: 'Processing',   bg: ADMIN.infoBg,    color: ADMIN.infoText },
  [RefundRequestStatus.REFUND_FAILED]:     { label: 'Failed',       bg: ADMIN.errorBg,   color: ADMIN.errorText },
  [RefundRequestStatus.REFUNDED]:          { label: 'Refunded',     bg: ADMIN.pageBg,    color: ADMIN.textSecondary },
};

export default function AdminRefundsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [reviewTarget, setReviewTarget] = useState<RefundRequestResponse | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const { data, isLoading } = useGetOrganizerRefundRequestsQuery({ page: 0, size: 200 });
  const allRefunds = data?.data?.content ?? [];

  const filtered = useMemo(() => {
    let list = filter !== 'all' ? allRefunds.filter((r) => r.status === filter) : allRefunds;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        r.requesterEmail.toLowerCase().includes(q) ||
        r.requesterName.toLowerCase().includes(q) ||
        r.eventName.toLowerCase().includes(q) ||
        String(r.orderId).includes(q),
      );
    }
    return list;
  }, [allRefunds, filter, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: allRefunds.length };
    Object.values(RefundRequestStatus).forEach((s) => { c[s] = allRefunds.filter((r) => r.status === s).length; });
    return c;
  }, [allRefunds]);

  const pendingCount = counts[RefundRequestStatus.PENDING] ?? 0;
  const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <AdminLayout>
        <AdminPageShell
          title="Refund Requests"
          breadcrumbs={[{ label: 'Admin', href: '/dashboard/admin' }, { label: 'Refunds' }]}
        >
          {/* Summary */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr 1fr', md: '1fr 1fr 1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
            {Object.values(RefundRequestStatus).map((s) => {
              const meta = STATUS_META[s];
              return (
                <Card key={s} sx={{ p: 2, borderRadius: '12px', border: `1px solid ${ADMIN.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: meta.color }}>
                    {isLoading ? <CircularProgress size={16} /> : (counts[s] ?? 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: ADMIN.textSecondary, fontSize: 11 }}>{meta.label}</Typography>
                </Card>
              );
            })}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search by customer, event, or order ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 280, bgcolor: ADMIN.cardBg, borderRadius: '8px' }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: ADMIN.textMuted }} /></InputAdornment> }}
            />
            <ToggleButtonGroup value={filter} exclusive onChange={(_, v) => v && setFilter(v)} size="small" sx={{ flexWrap: 'wrap' }}>
              <ToggleButton value="all" sx={{ textTransform: 'none', fontSize: 12 }}>All ({counts.all})</ToggleButton>
              <ToggleButton value={RefundRequestStatus.PENDING} sx={{ textTransform: 'none', fontSize: 12 }}>
                Pending
                {pendingCount > 0 && <Chip label={pendingCount} size="small" sx={{ ml: 0.5, height: 16, fontSize: 10, bgcolor: ADMIN.error, color: '#fff' }} />}
              </ToggleButton>
              {Object.values(RefundRequestStatus).filter((s) => s !== RefundRequestStatus.PENDING).map((s) => (
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
                <RefundIcon sx={{ fontSize: 48, color: ADMIN.border, mb: 1 }} />
                <Typography sx={{ color: ADMIN.textSecondary }}>No refund requests found</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: ADMIN.pageBg }}>
                      {['ID', 'Customer', 'Event', 'Order', 'Amount', 'Reason', 'Status', 'Submitted', 'Actions'].map((h) => (
                        <TableCell key={h} sx={{ fontWeight: 600, color: ADMIN.heading, fontSize: 12, borderBottom: `1px solid ${ADMIN.border}` }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.map((r) => {
                      const meta = STATUS_META[r.status as RefundRequestStatus];
                      const isPending = r.status === RefundRequestStatus.PENDING;
                      return (
                        <TableRow key={r.id} sx={{ '&:hover': { bgcolor: ADMIN.surfaceBg }, bgcolor: isPending ? ADMIN.warningBg + '40' : ADMIN.cardBg }}>
                          <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: ADMIN.heading }}>#{r.id}</Typography></TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: ADMIN.body }}>{r.requesterName}</Typography>
                            <Typography variant="caption" sx={{ color: ADMIN.textMuted }}>{r.requesterEmail}</Typography>
                          </TableCell>
                          <TableCell><Typography variant="body2" sx={{ maxWidth: 160, color: ADMIN.body }} noWrap>{r.eventName}</Typography></TableCell>
                          <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace', color: ADMIN.body }}>#{r.orderId}</Typography></TableCell>
                          <TableCell><Typography variant="body2" sx={{ fontWeight: 600, color: ADMIN.heading }}>{fmt(r.refundAmount)}</Typography></TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 160, fontSize: 12, color: ADMIN.textSecondary }} title={r.reason}>
                              {r.reason.length > 60 ? r.reason.substring(0, 60) + '…' : r.reason}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={meta.label} size="small" sx={{ bgcolor: meta.bg, color: meta.color, fontWeight: 600, fontSize: 11 }} />
                          </TableCell>
                          <TableCell><Typography variant="body2" sx={{ fontSize: 12, color: ADMIN.body }}>{dayjs(r.createdAt).format('DD/MM/YY HH:mm')}</Typography></TableCell>
                          <TableCell>
                            {isPending && (
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Tooltip title="Approve / Reject">
                                  <IconButton size="small" onClick={() => setReviewTarget(r)} sx={{ color: ADMIN.primary, '&:hover': { bgcolor: ADMIN.infoBg } }}>
                                    <ApproveIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </AdminPageShell>

        {reviewTarget && (
          <ReviewRefundRequestDialog
            open
            request={reviewTarget}
            onClose={() => setReviewTarget(null)}
            onSuccess={() => { setSnackbar({ open: true, message: 'Refund request reviewed', severity: 'success' }); setReviewTarget(null); }}
          />
        )}

        <Snackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })} vertical="top" horizontal="right" />
      </AdminLayout>
    </RoleGuard>
  );
}
