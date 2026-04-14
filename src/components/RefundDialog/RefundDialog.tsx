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
import { MoneyOff } from '@mui/icons-material';
import { useRefundPaymentMutation } from '@/src/stores/services/PaymentApi';

interface RefundDialogProps {
  open: boolean;
  onClose: () => void;
  /** paymentId from order.payments.find(p => p.status === 'SUCCESS')?.paymentId */
  paymentId: number;
  orderId: number;
  orderAmount: number;
  eventTitle: string;
  onSuccess?: () => void;
}

export function RefundDialog({
  open,
  onClose,
  paymentId,
  orderId,
  orderAmount,
  eventTitle,
  onSuccess,
}: RefundDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [refundPayment, { isLoading }] = useRefundPaymentMutation();

  const handleClose = () => {
    if (isLoading) return;
    setReason('');
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for the refund.');
      return;
    }
    setError(null);
    try {
      const result = await refundPayment({ paymentId, reason: reason.trim() }).unwrap();
      if (result.data?.success) {
        setReason('');
        onSuccess?.();
        onClose();
      } else {
        setError(result.data?.message ?? result.message ?? 'Refund failed.');
      }
    } catch (err: any) {
      setError(err?.data?.message ?? err?.message ?? 'An unexpected error occurred.');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <MoneyOff sx={{ color: '#F36BF9' }} />
        <Typography variant="h6" fontWeight={700} component="span">
          Process Refund
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Order <strong>#{orderId}</strong> — <strong>{eventTitle}</strong>
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            Refund amount: ${orderAmount.toLocaleString()}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          This action will refund the payment and cancel all tickets associated with this order.
          The customer will receive a real-time notification.
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
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <MoneyOff />}
          sx={{
            borderRadius: '20px',
            backgroundColor: '#F36BF9',
            '&:hover': { backgroundColor: '#d94ee0' },
          }}
        >
          {isLoading ? 'Processing...' : 'Confirm Refund'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RefundDialog;
