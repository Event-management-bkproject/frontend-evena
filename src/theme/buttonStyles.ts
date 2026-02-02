/**
 * Shared Button Styles
 * Centralized button styling to eliminate duplicate sx objects across codebase
 *
 * LOGIC PRESERVED: These are purely UI styles, no business logic
 */

import { SxProps, Theme } from '@mui/material';

// Primary brand color
const BRAND_PRIMARY = '#f36bf9';
const BRAND_PRIMARY_HOVER = '#e55ae0';
const BRAND_SECONDARY = '#36437C';

/**
 * Primary action button style (Create, Submit, Save)
 * Used for main CTA buttons across forms and dialogs
 */
export const PRIMARY_BUTTON_SX: SxProps<Theme> = {
  backgroundColor: BRAND_PRIMARY,
  borderRadius: '10px',
  padding: '10px 24px',
  textTransform: 'none',
  fontSize: '16px',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: BRAND_PRIMARY_HOVER,
  },
  '&:disabled': {
    backgroundColor: '#cccccc',
  },
};

/**
 * Secondary/Cancel button style
 * Used for cancel, close, and secondary actions
 */
export const SECONDARY_BUTTON_SX: SxProps<Theme> = {
  borderRadius: '10px',
  padding: '10px 24px',
  textTransform: 'none',
  fontSize: '16px',
  borderColor: '#E5E7EB',
  color: BRAND_SECONDARY,
  '&:hover': {
    backgroundColor: '#F3F4F8',
    borderColor: '#D1D5DB',
  },
};

/**
 * Danger/Delete button style
 * Used for destructive actions
 */
export const DANGER_BUTTON_SX: SxProps<Theme> = {
  backgroundColor: '#ef4444',
  borderRadius: '10px',
  padding: '10px 24px',
  textTransform: 'none',
  fontSize: '16px',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: '#dc2626',
  },
  '&:disabled': {
    backgroundColor: '#cccccc',
  },
};

/**
 * Small button variant
 * Used for inline actions, table buttons
 */
export const SMALL_BUTTON_SX: SxProps<Theme> = {
  borderRadius: '8px',
  padding: '6px 16px',
  textTransform: 'none',
  fontSize: '14px',
};

/**
 * Icon button colors
 */
export const ICON_BUTTON_COLORS = {
  edit: BRAND_SECONDARY,
  delete: '#f44336',
  view: BRAND_SECONDARY,
  verify: '#22c55e',
} as const;

/**
 * Tab button style (active state)
 */
export const TAB_BUTTON_ACTIVE_SX: SxProps<Theme> = {
  borderRadius: '10px',
  textTransform: 'none',
  fontWeight: 600,
  px: { xs: 2, md: 2.5 },
  py: 1,
  bgcolor: BRAND_PRIMARY,
  color: '#FFFFFF',
  boxShadow: '0 4px 12px rgba(243, 107, 249, 0.3)',
  '&:hover': {
    bgcolor: BRAND_PRIMARY_HOVER,
  },
  transition: 'all 0.2s ease',
};

/**
 * Tab button style (inactive state)
 */
export const TAB_BUTTON_INACTIVE_SX: SxProps<Theme> = {
  borderRadius: '10px',
  textTransform: 'none',
  fontWeight: 600,
  px: { xs: 2, md: 2.5 },
  py: 1,
  bgcolor: 'transparent',
  color: '#6B7280',
  '&:hover': {
    bgcolor: 'rgba(243, 107, 249, 0.08)',
    color: BRAND_PRIMARY,
  },
  transition: 'all 0.2s ease',
};
