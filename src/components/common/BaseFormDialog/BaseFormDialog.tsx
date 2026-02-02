'use client';

/**
 * BaseFormDialog - Reusable Form Dialog Component
 *
 * Consolidates common form dialog patterns from:
 * - CreateCategoryForm
 * - CreateVenueForm
 * - CreateOrganisationForm
 *
 * BUSINESS LOGIC PRESERVED:
 * - All form validation via passed schema
 * - Form submission handling
 * - Loading states
 * - Optional optimistic locking for update operations
 *
 * CHANGES:
 * - Centralized button styling via shared buttonStyles
 * - Configurable field rendering
 * - Optional conflict detection via useOptimisticLocking
 */

import { ReactNode } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import Forms from '@/src/components/Forms';
import { PRIMARY_BUTTON_SX, SECONDARY_BUTTON_SX } from '@/src/theme/buttonStyles';
import {
  useOptimisticLocking,
  EntityType,
  ENTITY_EVENT_TYPES,
} from '@/src/hooks/useOptimisticLocking';

// Field configuration type
export interface FormFieldConfig {
  name: string;
  component: ReactNode;
}

// Props for optimistic locking in update mode
export interface OptimisticLockingConfig {
  entityId: number;
  entityVersion: number;
  entityType: EntityType;
  eventTypes?: string[];
}

// Generic props for BaseFormDialog
export interface BaseFormDialogProps<T extends Record<string, any>> {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog should close */
  onClose: () => void;
  /** Form submission handler */
  onSubmit: (values: T, version?: number) => void;
  /** Default values for form fields */
  defaultValues: T;
  /** Yup validation schema */
  validationSchema: Yup.ObjectSchema<any>;
  /** Custom dialog title */
  title?: string;
  /** Translation key prefix for auto-generating titles */
  titleKey?: string;
  /** Whether form is in loading state */
  loading?: boolean;
  /** Whether this is edit mode (vs create mode) */
  isEditMode?: boolean;
  /** Dialog max width */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Form fields to render */
  children: ReactNode;
  /** Optimistic locking configuration for update mode */
  optimisticLocking?: OptimisticLockingConfig;
  /** Custom submit button text */
  submitText?: string;
  /** Custom loading text */
  loadingText?: string;
}

function BaseFormDialog<T extends Record<string, any>>({
  open,
  onClose,
  onSubmit,
  defaultValues,
  validationSchema,
  title,
  titleKey,
  loading = false,
  isEditMode = false,
  maxWidth = 'sm',
  children,
  optimisticLocking,
  submitText,
  loadingText,
}: BaseFormDialogProps<T>) {
  const { t } = useTranslation();

  // Use optimistic locking if configured and in edit mode
  const lockingHook = optimisticLocking
    ? useOptimisticLocking({
        entityId: optimisticLocking.entityId,
        entityVersion: optimisticLocking.entityVersion,
        entityType: optimisticLocking.entityType,
        eventTypes:
          optimisticLocking.eventTypes ||
          ENTITY_EVENT_TYPES[optimisticLocking.entityType],
      })
    : null;

  const { hasConflict, conflictMessage, version } = lockingHook || {
    hasConflict: false,
    conflictMessage: '',
    version: optimisticLocking?.entityVersion,
  };

  // Determine dialog title
  const dialogTitle = title || (titleKey ? t(`${titleKey}.${isEditMode ? 'edit' : 'createNew'}`) : '');

  // Determine button text
  const getSubmitButtonText = () => {
    if (loading) {
      return loadingText || t(`common.buttons.${isEditMode ? 'updating' : 'creating'}`);
    }
    return submitText || t(`common.buttons.${isEditMode ? 'update' : 'create'}`);
  };

  // Handle form submission with version
  const handleSubmit = (values: T, actions: any) => {
    // Include version in submission for optimistic locking
    onSubmit(values, version);
    actions.setSubmitting(false);
  };

  // Disable submit if there's a conflict
  const isSubmitDisabled = loading || hasConflict;

  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Conflict warning */}
          {hasConflict && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {conflictMessage}
            </Alert>
          )}

          <Forms
            values={defaultValues}
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
            enableReinitialize
            isRegister={false}
          >
            <Box display="flex" flexDirection="column" gap={3}>
              {children}
            </Box>

            {/* Actions */}
            <DialogActions sx={{ mt: 3, px: 0 }}>
              <Button
                onClick={onClose}
                variant="outlined"
                disabled={loading}
                sx={SECONDARY_BUTTON_SX}
              >
                {t('common.buttons.cancel')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitDisabled}
                sx={PRIMARY_BUTTON_SX}
              >
                {getSubmitButtonText()}
              </Button>
            </DialogActions>
          </Forms>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default BaseFormDialog;
