'use client';

import { useState, useEffect } from 'react';
import {
  Box, Card, Typography, Chip, TextField, InputAdornment,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  CircularProgress, IconButton, Tooltip, ToggleButtonGroup, ToggleButton, Pagination,
} from '@mui/material';
import { Search as SearchIcon, AssignmentReturn as RefundIcon, CheckCircle as ApproveIcon } from '@mui/icons-material';

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
  [RefundRequestStatus.PENDING]:           { label: 'Pending',    bg: ADMIN.warningBg, color: ADMIN.warningText },
  [RefundRequestStatus.APPROVED]:          { label: 'Approved',   bg: ADMIN.successBg, color: ADMIN.successText },
  [RefundRequestStatus.REJECTED]:          { label: 'Rejected',   bg: ADMIN.errorBg,   color: ADMIN.errorText },
  [RefundRequestStatus.REFUND_PROCESSING]: { label: 'Processing', bg: ADMIN.infoBg,    color: ADMIN.infoText },
  [RefundRequestStatus.REFUND_FAILED]:     { label: 'Failed',     bg: ADMIN.errorBg,   color: ADMIN.errorText },
  [RefundRequestStatus.REFUNDED]:          { label: 'Refunded',   bg: ADMIN.pageBg,    color: ADMIN.textSecondary },
};

export default function AdminRefundsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [page, setPage] = useState(0);
  const [reviewTarget, setReviewTarget] = useState<RefundRequestResponse | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useGetOrganizerRefundRequestsQuery({
    page,
    size: 20,
    status: filter !== 'all' ? filter : undefined,
    keyword: debouncedSearch || undefined,
  });

  const refunds = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const totalElements = data?.data?.totalElements ?? 0;

  const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <AdminLayout>
        <AdminPageShell
          title="Refund Requests"
          breadcrumbs={[{ label: 'Admin', href: '/dashboard/admin' }, { label: 'Refunds' }]}
        >
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search by customer, event, or order ID…"
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
              {Object.values(RefundRequestStatus).map((s) => (
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
            ) : refunds.length === 0 ? (
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
                    {refunds.map((r) => {
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
                              <Tooltip title="Approve / Reject">
                                <IconButton size="small" onClick={() => setReviewTarget(r)} sx={{ color: ADMIN.primary, '&:hover': { bgcolor: ADMIN.infoBg } }}>
                                  <ApproveIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
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

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination count={totalPages} page={page + 1} onChange={(_, v) => setPage(v - 1)} shape="rounded" color="primary" />
            </Box>
          )}
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
