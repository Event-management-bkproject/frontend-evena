// Shared hook types

import { AlertColor } from '@mui/material';
import { ReactNode } from 'react';

/**
 * Snackbar context type for global notification system
 */
export interface SnackbarContextType {
  showSnackbar: (message: string, severity?: AlertColor) => void;
  hideSnackbar: () => void;
}

/**
 * Props for SnackbarProvider component
 */
export interface SnackbarProviderProps {
  children: ReactNode;
}

/**
 * Type parameter for useRegister hook
 */
export interface RegisterType {
  type: 'customer' | 'organizer';
}
