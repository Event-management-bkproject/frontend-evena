'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { Warning } from '@mui/icons-material';

interface CancelEventDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventTitle: string;
  loading?: boolean;
}

const CancelEventDialog = ({ open, onClose, onConfirm, eventTitle, loading = false }: CancelEventDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Warning sx={{ color: '#FF5B5E', fontSize: 28 }} />
          <Typography variant="h6" fontWeight="bold">
            Cancel Event
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2, borderRadius: '12px' }}>
          This action cannot be undone. The event will be marked as cancelled.
        </Alert>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Are you sure you want to cancel <strong>"{eventTitle}"</strong>?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Cancelled events will no longer be visible to customers and ticket sales will be stopped.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            color: '#666',
          }}
        >
          Go Back
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: '#FF5B5E',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '10px',
            '&:hover': {
              backgroundColor: '#ff4146',
            },
          }}
        >
          {loading ? 'Cancelling...' : 'Yes, Cancel Event'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelEventDialog;
