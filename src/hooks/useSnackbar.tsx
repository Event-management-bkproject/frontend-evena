'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import Snackbar from '@/src/components/SnackBar';
import { AlertColor } from '@mui/material';

interface SnackbarContextType {
  showSnackbar: (message: string, severity?: AlertColor) => void;
  hideSnackbar: () => void;
}

interface SnackbarProviderProps {
  children: React.ReactNode;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export function SnackbarProvider({ children }: SnackbarProviderProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('info');

  const showSnackbar = useCallback((msg: string, sev: AlertColor = 'info') => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  }, []);

  const hideSnackbar = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar, hideSnackbar }}>
      {children}
      <Snackbar
        open={open}
        message={message}
        severity={severity}
        onClose={hideSnackbar}
        vertical="top"
        horizontal="right"
      />
    </SnackbarContext.Provider>
  );
}

/**
 * Hook to show global snackbar notifications
 * @returns {showSnackbar, hideSnackbar}
 * @example
 * const { showSnackbar } = useSnackbar();
 * showSnackbar('Login successful!', 'success');
 * showSnackbar('Invalid credentials', 'error');
 */
export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
}
