'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import ProtectedContent from '@/src/components/ProtectedContent';
import LayoutWithSidebar from '@/src/components/layout/LayoutWithSidebar';
import DashboardHeader from '@/src/components/DashboardHeader/DashboardHeader';
import { useGetOrganizerRefundRequestsQuery } from '@/src/stores/services/RefundRequestApi';
import { RefundRequestResponse, RefundRequestStatus } from '@/src/stores/types/refundRequest';
import { ReviewRefundRequestDialog } from '@/src/components/ReviewRefundRequestDialog/ReviewRefundRequestDialog';
import { useSSE } from '@/src/providers/SSEProvider';
import { SSENormalizedType } from '@/src/stores/types/sse';

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const statusColor = (status: RefundRequestStatus) => {
  switch (status) {
    case RefundRequestStatus.PENDING:           return 'warning';
    case RefundRequestStatus.APPROVED:          return 'info';
    case RefundRequestStatus.REJECTED:          return 'error';
    case RefundRequestStatus.REFUND_PROCESSING: return 'info';
    case RefundRequestStatus.REFUND_FAILED:     return 'error';
    case RefundRequestStatus.REFUNDED:          return 'success';
    default:                                    return 'default';
  }
};

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

  // Auto-refetch when SSE events arrive for refund requests
  useEffect(() => {
    if (!lastEvent) return;
    const refundEvents = [
      SSENormalizedType.REFUND_REQUEST_CREATED,
      SSENormalizedType.REFUND_REQUEST_COMPLETED,
      SSENormalizedType.REFUND_REQUEST_FAILED,
      SSENormalizedType.REFUND_REQUEST_REJECTED,
    ] as SSENormalizedType[];
    if (refundEvents.includes(lastEvent.type)) {
      refetch();
    }
  }, [lastEvent, refetch]);

  const requests = data?.data?.content ?? [];

  const handleStatusChange = (e: SelectChangeEvent) => {
    setStatusFilter(e.target.value);
  };

  const handleOpenReview = (request: RefundRequestResponse) => {
    setSelectedRequest(request);
    setReviewDialogOpen(true);
  };

  const handleReviewSuccess = () => {
    refetch();
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

      {/* Filter bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={handleStatusChange}>
            <MenuItem value="ALL">All</MenuItem>
            {Object.values(RefundRequestStatus).map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#F36BF9' }} />
        </Box>
      )}

      {isError && (
        <Alert severity="error">Failed to load refund requests.</Alert>
      )}

      {!isLoading && !isError && (
        <TableContainer component={Paper} sx={{ borderRadius: '16px', flex: 1 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, backgroundColor: '#F5F5F5' } }}>
                <TableCell>ID</TableCell>
                <TableCell>Event</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No refund requests found.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id} hover>
                    <TableCell>#{request.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {request.eventName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Order #{request.orderId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{request.requesterName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {request.requesterEmail}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>{formatVND(request.refundAmount)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={request.status}
                        size="small"
                        color={statusColor(request.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => handleOpenReview(request)}
                        sx={{
                          borderRadius: '20px',
                          borderColor: '#F36BF9',
                          color: '#F36BF9',
                          '&:hover': { borderColor: '#d94ee0', color: '#d94ee0' },
                        }}
                      >
                        {request.status === RefundRequestStatus.PENDING ? 'Review' : 'View'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {selectedRequest && (
        <ReviewRefundRequestDialog
          open={reviewDialogOpen}
          onClose={() => setReviewDialogOpen(false)}
          request={selectedRequest}
          onSuccess={handleReviewSuccess}
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
