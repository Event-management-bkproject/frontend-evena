/**
 * CreateCategoryForm - Refactored to use BaseFormDialog
 *
 * BUSINESS LOGIC PRESERVED:
 * - All form fields and validation
 * - Submit handling
 * - Edit mode detection
 *
 * UI CHANGES:
 * - Uses BaseFormDialog for consistent dialog structure
 * - Uses shared button styles
 */
'use client';

import { useTranslation } from 'react-i18next';
import FormTextField from '../FormTextField';
import FormTextareaField from '../FormTextAreaField';
import { categorySchema } from '@/src/utils/validationSchema/categoryValidationSchema';
import { CategoryFormData, CreateCategoryFormProps } from './types';
import { BaseFormDialog } from '@/src/components/common/BaseFormDialog';

const CreateCategoryForm = ({
  open,
  onSubmit,
  onClose,
  loading = false,
  initialValues,
  title,
}: CreateCategoryFormProps) => {
  const { t } = useTranslation();

  const defaultValues: CategoryFormData = {
    name: '',
    description: '',
    iconUrl: '',
    ...initialValues,
  };

  // Determine edit mode
  const isEditMode = !!(initialValues?.name);

  // Handle form submission
  const handleSubmit = (values: CategoryFormData) => {
    onSubmit(values);
  };

  return (
    <BaseFormDialog<CategoryFormData>
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      defaultValues={defaultValues}
      validationSchema={categorySchema}
      title={title}
      titleKey="category"
      loading={loading}
      isEditMode={isEditMode}
      maxWidth="sm"
      submitText={isEditMode ? t('category.update') : t('category.create')}
      loadingText={isEditMode ? t('event.updating') : t('event.creating')}
    >
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
    </BaseFormDialog>
  );
};

export default CreateCategoryForm;
