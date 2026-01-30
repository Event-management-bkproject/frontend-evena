'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  TextField,
} from '@mui/material';
import {
  Warning,
  Error as ErrorIcon,
  Info,
  CheckCircle,
} from '@mui/icons-material';
import { ConfirmationDialogProps, ConfirmationDialogVariant } from './types';

const variantConfig: Record<
  ConfirmationDialogVariant,
  {
    icon: React.ReactNode;
    color: 'error' | 'warning' | 'info' | 'success';
    defaultConfirmText: string;
    defaultLoadingText: string;
  }
> = {
  error: {
    icon: <ErrorIcon />,
    color: 'error',
    defaultConfirmText: 'Delete',
    defaultLoadingText: 'Deleting...',
  },
  warning: {
    icon: <Warning />,
    color: 'warning',
    defaultConfirmText: 'Confirm',
    defaultLoadingText: 'Processing...',
  },
  info: {
    icon: <Info />,
    color: 'info',
    defaultConfirmText: 'Confirm',
    defaultLoadingText: 'Processing...',
  },
  success: {
    icon: <CheckCircle />,
    color: 'success',
    defaultConfirmText: 'Confirm',
    defaultLoadingText: 'Processing...',
  },
};

export function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  children,
  loading = false,
  variant = 'error',
  confirmText,
  cancelText = 'Cancel',
  loadingText,
  showIcon = true,
  maxWidth = 'xs',
  disableBackdropClose = false,
  requireExplicitConfirmation,
  explicitConfirmationPlaceholder,
}: ConfirmationDialogProps) {
  const config = variantConfig[variant];
  const finalConfirmText = confirmText || config.defaultConfirmText;
  const finalLoadingText = loadingText || config.defaultLoadingText;

  // State for explicit confirmation input
  const [confirmationInput, setConfirmationInput] = useState('');

  // Reset confirmation input when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setConfirmationInput('');
    }
  }, [open]);

  // Check if explicit confirmation is required and matches
  const isExplicitConfirmationRequired = !!requireExplicitConfirmation;
  const isExplicitConfirmationValid = isExplicitConfirmationRequired
    ? confirmationInput === requireExplicitConfirmation
    : true;

  // Determine if confirm button should be disabled
  const isConfirmDisabled = loading || !isExplicitConfirmationValid;

  // Handle dialog close - respect disableBackdropClose
  const handleDialogClose = (_event: object, reason: 'backdropClick' | 'escapeKeyDown') => {
    // When loading, never allow close
    if (loading) return;

    // When disableBackdropClose is true, don't close on backdrop/escape
    if (disableBackdropClose && (reason === 'backdropClick' || reason === 'escapeKeyDown')) {
      return;
    }

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {showIcon && (
            <Box
              sx={{
                color: `${config.color}.main`,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {config.icon}
            </Box>
          )}
          <Typography variant="h6" component="span" fontWeight={600}>
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {typeof message === 'string' ? (
          <Typography color="text.secondary">{message}</Typography>
        ) : (
          message
        )}
        {children}

        {/* Explicit Confirmation Input */}
        {isExplicitConfirmationRequired && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {explicitConfirmationPlaceholder ||
                `Type "${requireExplicitConfirmation}" to confirm`}
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder={requireExplicitConfirmation}
              error={confirmationInput.length > 0 && !isExplicitConfirmationValid}
              disabled={loading}
              autoComplete="off"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isConfirmDisabled}
          variant="contained"
          color={config.color}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '10px',
          }}
        >
          {loading ? finalLoadingText : finalConfirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmationDialog;
