import { ReactNode } from 'react';

/**
 * Severity/variant types for confirmation dialogs
 * - error: Destructive actions (delete, remove)
 * - warning: Potentially dangerous actions (cancel, deactivate)
 * - info: Informational confirmations
 * - success: Positive confirmations
 */
export type ConfirmationDialogVariant = 'error' | 'warning' | 'info' | 'success';

export interface ConfirmationDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog is closed */
  onClose: () => void;
  /** Callback when confirm button is clicked */
  onConfirm: () => void;
  /** Dialog title */
  title: string;
  /** Main message/description */
  message: string | ReactNode;
  /** Additional content below the message (alerts, warnings, etc.) */
  children?: ReactNode;
  /** Loading state - disables buttons and shows spinner */
  loading?: boolean;
  /** Dialog variant - affects icon and button color */
  variant?: ConfirmationDialogVariant;
  /** Confirm button text (default based on variant) */
  confirmText?: string;
  /** Cancel button text (default: "Cancel") */
  cancelText?: string;
  /** Loading text (default based on variant) */
  loadingText?: string;
  /** Whether to show the icon in title */
  showIcon?: boolean;
  /** Maximum width of dialog */
  maxWidth?: 'xs' | 'sm' | 'md';

  // ============= SAFETY FEATURES =============

  /**
   * Disable closing dialog by clicking backdrop or pressing Escape.
   * MUST be true for destructive actions to prevent accidental dismissal.
   * When true, user must explicitly click Cancel or Confirm.
   */
  disableBackdropClose?: boolean;

  /**
   * Require user to type an exact string to enable the confirm button.
   * Use for highly destructive actions (e.g., "DELETE", "CANCEL EVENT").
   * The confirm button will be disabled until the user types this exact text.
   */
  requireExplicitConfirmation?: string;

  /**
   * Placeholder text for the explicit confirmation input field.
   * Default: "Type {requireExplicitConfirmation} to confirm"
   */
  explicitConfirmationPlaceholder?: string;
}
