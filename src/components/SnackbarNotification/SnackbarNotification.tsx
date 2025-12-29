'use client';

import React from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface SnackbarNotificationProps {
  open: boolean;
  message: string;
  severity: AlertColor;
  onClose: () => void;
  autoHideDuration?: number;
}

const SnackbarNotification = ({
  open,
  message,
  severity,
  onClose,
  autoHideDuration = 6000,
}: SnackbarNotificationProps) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SnackbarNotification;
