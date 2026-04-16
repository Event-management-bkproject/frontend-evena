'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import { CheckCircle, Cancel, AssignmentReturn } from '@mui/icons-material';
import { useReviewRefundRequestMutation } from '@/src/stores/services/RefundRequestApi';
import { RefundRequestResponse, RefundRequestStatus } from '@/src/stores/types/refundRequest';

interface ReviewRefundRequestDialogProps {
  open: boolean;
  onClose: () => void;
  request: RefundRequestResponse;
  onSuccess?: () => void;
}

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

export function ReviewRefundRequestDialog({
  open,
  onClose,
  request,
  onSuccess,
}: ReviewRefundRequestDialogProps) {
  const [reviewNote, setReviewNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [reviewRefundRequest, { isLoading }] = useReviewRefundRequestMutation();

  const handleClose = () => {
    if (isLoading) return;
    setReviewNote('');
    setError(null);
    onClose();
  };

  const handleReview = async (approved: boolean) => {
    if (!reviewNote.trim()) {
      setError('Please provide a review note.');
      return;
    }
    setError(null);
    try {
      await reviewRefundRequest({ id: request.id, approved, reviewNote: reviewNote.trim() }).unwrap();
      setReviewNote('');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.data?.message ?? err?.message ?? 'Failed to submit review.');
    }
  };

  const isPending = request.status === RefundRequestStatus.PENDING;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <AssignmentReturn sx={{ color: '#F36BF9' }} />
        <Typography variant="h6" fontWeight={700} component="span">
          Review Refund Request
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Request <strong>#{request.id}</strong> — <strong>{request.eventName}</strong>
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
            <Chip label={request.status} size="small" color={isPending ? 'warning' : 'default'} />
            <Typography variant="body2" color="text.secondary">
              {request.requesterName} ({request.requesterEmail})
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Refund amount
          </Typography>
          <Typography variant="body1" fontWeight={700} color="#F36BF9">
            {formatVND(request.refundAmount)}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Customer reason
          </Typography>
          <Typography
            variant="body2"
            sx={{ p: 1.5, backgroundColor: '#F5F5F5', borderRadius: '8px', whiteSpace: 'pre-wrap' }}
          >
            {request.reason}
          </Typography>
        </Box>

        {isPending && (
          <TextField
            label="Review note"
            multiline
            rows={3}
            fullWidth
            required
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            inputProps={{ maxLength: 500 }}
            helperText={`${reviewNote.length}/500 — This note will be sent to the customer if rejected.`}
            disabled={isLoading}
          />
        )}

        {!isPending && request.reviewNote && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Review note
            </Typography>
            <Typography
              variant="body2"
              sx={{ p: 1.5, backgroundColor: '#F5F5F5', borderRadius: '8px', whiteSpace: 'pre-wrap' }}
            >
              {request.reviewNote}
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Button onClick={handleClose} disabled={isLoading} variant="text" color="inherit" sx={{ borderRadius: '20px' }}>
          Close
        </Button>
        {isPending && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={() => handleReview(false)}
              disabled={isLoading || !reviewNote.trim()}
              variant="contained"
              color="error"
              startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <Cancel />}
              sx={{ borderRadius: '20px', minWidth: 110 }}
            >
              Reject
            </Button>
            <Button
              onClick={() => handleReview(true)}
              disabled={isLoading || !reviewNote.trim()}
              variant="contained"
              color="success"
              startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <CheckCircle />}
              sx={{ borderRadius: '20px', minWidth: 110 }}
            >
              Approve
            </Button>
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default ReviewRefundRequestDialog;
