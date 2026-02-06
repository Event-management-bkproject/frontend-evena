/**
 * CreateCategoryForm - Refactored with Optimistic Locking
 *
 * BUSINESS LOGIC PRESERVED:
 * - All form fields and validation
 * - Submit handling
 * - Edit mode detection
 * - Optimistic locking with SSE conflict detection
 *
 * UI CHANGES:
 * - Shows inline Alert when conflict detected
 * - Disables submit button when conflict exists
 * - Uses shared button styles
 */
'use client';

import { useTranslation } from 'react-i18next';
import { Alert, Box, Button, Dialog, DialogContent, DialogTitle } from '@mui/material';
import FormTextField from '../FormTextField';
import FormTextareaField from '../FormTextAreaField';
import Forms from '../Forms';
import { categorySchema } from '@/src/utils/validationSchema/categoryValidationSchema';
import { CategoryFormData, CreateCategoryFormProps } from './types';
import { useOptimisticLocking, ENTITY_EVENT_TYPES } from '@/src/hooks/useOptimisticLocking';
import { PRIMARY_BUTTON_SX, SECONDARY_BUTTON_SX } from '@/src/theme/buttonStyles';

const CreateCategoryForm = ({
  open,
  onSubmit,
  onClose,
  loading = false,
  initialValues,
  title,
  category,
}: CreateCategoryFormProps) => {
  const { t } = useTranslation();

  const defaultValues: CategoryFormData = {
    name: '',
    description: '',
    iconUrl: '',
    ...initialValues,
  };

  // Determine edit mode
  const isEditMode = !!(category?.id);

  // Always call useOptimisticLocking (Rules of Hooks - must call hooks unconditionally)
  // Pass dummy values when not in edit mode
  const { hasConflict, conflictMessage, version } = useOptimisticLocking({
    entityId: category?.id || 0,
    entityVersion: category?.version || 0,
    entityType: 'CATEGORY',
    eventTypes: ENTITY_EVENT_TYPES.CATEGORY,
  });

  // Handle form submission
  const handleSubmit = (values: CategoryFormData, actions: any) => {
    // Include version for edit mode
    const submitData = isEditMode ? { ...values, version } : values;
    onSubmit(submitData);
    actions.setSubmitting(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title || (isEditMode ? t('category.update') : t('category.create'))}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Forms
            values={defaultValues}
            onSubmit={handleSubmit}
            validationSchema={categorySchema}
            enableReinitialize
            isRegister={false}
          >
            <Box display="flex" flexDirection="column" gap={3}>
              {/* Conflict Warning */}
              {hasConflict && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {conflictMessage}
                </Alert>
              )}

              {/* Name Field */}
              <FormTextField
                id="category-name"
                name="name"
                label={t('category.form.name')}
                type="text"
                required
                placeholder={t('category.form.namePlaceholder')}
              />

              {/* Icon URL Field */}
              <FormTextField
                id="category-iconUrl"
                name="iconUrl"
                label={t('category.form.icon')}
                type="text"
                required
                placeholder={t('category.form.iconPlaceholder')}
                helperText={t('category.form.iconHelper')}
              />

              {/* Description Field */}
              <FormTextareaField
                id="category-description"
                name="description"
                label={t('category.form.descriptionPlaceholder')}
                required
              />

              {/* Actions */}
              <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
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
                  disabled={loading || hasConflict}
                  sx={PRIMARY_BUTTON_SX}
                >
                  {loading
                    ? t('event.updating')
                    : hasConflict
                      ? t('messages.error.dataChangedCloseReopen', { defaultValue: 'Data Changed - Close & Reopen' })
                      : isEditMode
                        ? t('category.update')
                        : t('category.create')}
                </Button>
              </Box>
            </Box>
          </Forms>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategoryForm;
