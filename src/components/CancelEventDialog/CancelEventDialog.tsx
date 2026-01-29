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
import { useTranslation } from 'react-i18next';

interface CancelEventDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventTitle: string;
  loading?: boolean;
}

const CancelEventDialog = ({ open, onClose, onConfirm, eventTitle, loading = false }: CancelEventDialogProps) => {
  const { t } = useTranslation();
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
            {t('event.confirmCancel.title')}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2, borderRadius: '12px' }}>
          {t('event.confirmCancel.warning')}
        </Alert>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {t('event.confirmCancel.message', { eventTitle })}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('event.confirmCancel.info')}
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
          {t('common.buttons.goBack')}
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
          {loading ? t('event.cancelling') : t('event.confirmCancel.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelEventDialog;
