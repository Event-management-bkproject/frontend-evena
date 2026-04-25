'use client';

import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, CircularProgress, Alert,
  MenuItem, Select, FormControl, InputLabel, SelectChangeEvent,
  Paper,
} from '@mui/material';
import { Visibility, AssignmentReturn, FilterList } from '@mui/icons-material';
import ProtectedContent from '@/src/components/ProtectedContent';
import LayoutWithSidebar from '@/src/components/layout/LayoutWithSidebar';
import DashboardHeader from '@/src/components/DashboardHeader/DashboardHeader';
import { useGetOrganizerRefundRequestsQuery } from '@/src/stores/services/RefundRequestApi';
import { RefundRequestResponse, RefundRequestStatus } from '@/src/stores/types/refundRequest';
import { ReviewRefundRequestDialog } from '@/src/components/ReviewRefundRequestDialog/ReviewRefundRequestDialog';
import { useSSE } from '@/src/providers/SSEProvider';
import { SSENormalizedType } from '@/src/stores/types/sse';
import { BRAND } from '@/src/utils/constants/constant';

const fmtAmount = (amount: number) =>
  amount === 0 ? 'Free' : `$${amount.toLocaleString()}`;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const STATUS_CONFIG: Record<RefundRequestStatus, { label: string; color: string; bg: string }> = {
  [RefundRequestStatus.PENDING]:           { label: 'Pending',     color: '#D97706', bg: '#FEF3C7' },
  [RefundRequestStatus.APPROVED]:          { label: 'Approved',    color: '#2563EB', bg: '#EFF6FF' },
  [RefundRequestStatus.REJECTED]:          { label: 'Rejected',    color: '#DC2626', bg: '#FEE2E2' },
  [RefundRequestStatus.REFUND_PROCESSING]: { label: 'Processing',  color: '#7C3AED', bg: '#EDE9FE' },
  [RefundRequestStatus.REFUND_FAILED]:     { label: 'Failed',      color: '#DC2626', bg: '#FEE2E2' },
  [RefundRequestStatus.REFUNDED]:          { label: 'Refunded',    color: '#16A34A', bg: '#DCFCE7' },
};

function StatusBadge({ status }: { status: RefundRequestStatus }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: '#64748B', bg: '#F1F5F9' };
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 1.5, py: 0.4, borderRadius: '20px', bgcolor: cfg.bg }}>
      <Typography sx={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>{cfg.label}</Typography>
    </Box>
  );
}

function RefundRequestsContent() {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState<RefundRequestResponse | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useGetOrganizerRefundRequestsQuery({
    page: 0,
    size: 100,
    status: statusFilter,
  });

  const { lastEvent } = useSSE();

  useEffect(() => {
    if (!lastEvent) return;
    const refundEvents: SSENormalizedType[] = [
      SSENormalizedType.REFUND_REQUEST_CREATED,
      SSENormalizedType.REFUND_REQUEST_COMPLETED,
      SSENormalizedType.REFUND_REQUEST_FAILED,
      SSENormalizedType.REFUND_REQUEST_REJECTED,
    ];
    if (refundEvents.includes(lastEvent.type)) refetch();
  }, [lastEvent, refetch]);

  const requests = data?.data?.content ?? [];

  const handleOpenReview = (request: RefundRequestResponse) => {
    setSelectedRequest(request);
    setReviewDialogOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0, flex: 1, minHeight: 0, height: '100%' }}>
      <DashboardHeader
        title="Refund Requests"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard/organizer' },
          { label: 'Refund Requests' },
        ]}
      />

      <Box
        sx={{
          bgcolor: BRAND.bgSection,
          borderRadius: '20px',
          p: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* Filter bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: BRAND.dark }}>
            <FilterList sx={{ fontSize: 18 }} />
            <Typography variant="body2" fontWeight={600}>Filter by status</Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value)}
              sx={{ borderRadius: '10px', bgcolor: '#fff' }}
            >
              <MenuItem value="ALL">All Requests</MenuItem>
              {Object.values(RefundRequestStatus).map((s) => (
                <MenuItem key={s} value={s}>{STATUS_CONFIG[s]?.label ?? s}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {!isLoading && (
            <Box sx={{ ml: 'auto', px: 2, py: 0.5, bgcolor: '#fff', borderRadius: '20px', border: `1px solid ${BRAND.border}` }}>
              <Typography variant="caption" fontWeight={700} color={BRAND.dark}>
                {requests.length} result{requests.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Loading / error */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: BRAND.primary }} />
          </Box>
        )}
        {isError && <Alert severity="error" sx={{ borderRadius: '12px' }}>Failed to load refund requests.</Alert>}

        {/* Table */}
        {!isLoading && !isError && (
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            {requests.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10, bgcolor: '#fff', borderRadius: '16px', border: `2px dashed ${BRAND.border}` }}>
                <AssignmentReturn sx={{ fontSize: 56, color: '#D1D5DB', mb: 2 }} />
                <Typography variant="h6" color={BRAND.dark} fontWeight={700} sx={{ mb: 0.5 }}>
                  No refund requests
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {statusFilter === 'ALL' ? 'No refund requests have been submitted yet.' : `No requests with status "${STATUS_CONFIG[statusFilter as RefundRequestStatus]?.label ?? statusFilter}".`}
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {['ID', 'Event / Order', 'Customer', 'Amount', 'Status', 'Submitted', 'Action'].map((h) => (
                        <TableCell key={h} align={h === 'Action' ? 'center' : 'left'}
                          sx={{ fontWeight: 700, fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', bgcolor: BRAND.bgSection, borderBottom: `1px solid ${BRAND.border}` }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ color: '#94A3B8', fontWeight: 600, fontSize: 13 }}>#{request.id}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700} color={BRAND.dark} noWrap sx={{ maxWidth: 200 }}>
                            {request.eventName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">Order #{request.orderId}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color={BRAND.dark}>{request.requesterName}</Typography>
                          <Typography variant="caption" color="text.secondary">{request.requesterEmail}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={700} fontSize={14} color={BRAND.dark}>{fmtAmount(request.refundAmount)}</Typography>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={request.status} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary" fontWeight={500}>{fmtDate(request.createdAt)}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant={request.status === RefundRequestStatus.PENDING ? 'contained' : 'outlined'}
                            startIcon={<Visibility sx={{ fontSize: 14 }} />}
                            onClick={() => handleOpenReview(request)}
                            sx={{
                              borderRadius: '20px',
                              textTransform: 'none',
                              fontWeight: 600,
                              fontSize: 12,
                              px: 2,
                              ...(request.status === RefundRequestStatus.PENDING
                                ? { bgcolor: BRAND.primary, '&:hover': { bgcolor: BRAND.primaryHover }, boxShadow: 'none' }
                                : { borderColor: BRAND.border, color: BRAND.dark, '&:hover': { borderColor: BRAND.primary, color: BRAND.primary } }),
                            }}
                          >
                            {request.status === RefundRequestStatus.PENDING ? 'Review' : 'View'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Box>

      {selectedRequest && (
        <ReviewRefundRequestDialog
          open={reviewDialogOpen}
          onClose={() => setReviewDialogOpen(false)}
          request={selectedRequest}
          onSuccess={() => refetch()}
        />
      )}
    </Box>
  );
}

export default function RefundRequestsPage() {
  return (
    <ProtectedContent>
      <LayoutWithSidebar currentPage="refund-requests">
        <RefundRequestsContent />
      </LayoutWithSidebar>
    </ProtectedContent>
  );
}
