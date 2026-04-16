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
} from '@mui/material';
import { AssignmentReturn } from '@mui/icons-material';
import { useCreateRefundRequestMutation } from '@/src/stores/services/RefundRequestApi';

interface CreateRefundRequestDialogProps {
  open: boolean;
  onClose: () => void;
  orderId: number;
  eventTitle: string;
  refundAmount: number;
  onSuccess?: () => void;
}

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

export function CreateRefundRequestDialog({
  open,
  onClose,
  orderId,
  eventTitle,
  refundAmount,
  onSuccess,
}: CreateRefundRequestDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [createRefundRequest, { isLoading }] = useCreateRefundRequestMutation();

  const handleClose = () => {
    if (isLoading) return;
    setReason('');
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for the refund request.');
      return;
    }
    setError(null);
    try {
      await createRefundRequest({ orderId, reason: reason.trim() }).unwrap();
      setReason('');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.data?.message ?? err?.message ?? 'Failed to submit refund request.');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <AssignmentReturn sx={{ color: '#F36BF9' }} />
        <Typography variant="h6" fontWeight={700} component="span">
          Request Refund
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Order <strong>#{orderId}</strong> — <strong>{eventTitle}</strong>
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            Refund amount: {formatVND(refundAmount)}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Your request will be reviewed by the event organizer. You will be notified of the decision.
        </Typography>

        <TextField
          label="Reason for refund"
          multiline
          rows={3}
          fullWidth
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          inputProps={{ maxLength: 500 }}
          helperText={`${reason.length}/500`}
          disabled={isLoading}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={handleClose} disabled={isLoading} variant="outlined" sx={{ borderRadius: '20px' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !reason.trim()}
          variant="contained"
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <AssignmentReturn />}
          sx={{
            borderRadius: '20px',
            backgroundColor: '#F36BF9',
            '&:hover': { backgroundColor: '#d94ee0' },
          }}
        >
          {isLoading ? 'Submitting...' : 'Submit Request'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateRefundRequestDialog;
