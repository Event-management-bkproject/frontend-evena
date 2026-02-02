/**
 * CreateVenueForm - Refactored to use BaseFormDialog
 *
 * BUSINESS LOGIC PRESERVED:
 * - All form fields and validation
 * - Submit handling
 * - Edit mode detection
 * - Default coordinates (Ho Chi Minh City)
 *
 * UI CHANGES:
 * - Uses BaseFormDialog for consistent dialog structure
 * - Uses shared button styles
 */
'use client';

import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import FormTextField from '../FormTextField';
import FormTextareaField from '../FormTextAreaField';
import { venueSchema } from '@/src/utils/validationSchema/venueValidationSchema';
import { CreateVenueFormProps, VenueFormData } from './types';
import { BaseFormDialog } from '@/src/components/common/BaseFormDialog';

const CreateVenueForm = ({ open, onSubmit, onClose, loading = false, initialValues, title }: CreateVenueFormProps) => {
  const { t } = useTranslation();

  const defaultValues: VenueFormData = {
    name: '',
    address: '',
    city: '',
    lat: 10.762622, // Default: Ho Chi Minh City
    lng: 106.660172,
    capacity: 1,
    description: '',
    ...initialValues,
  };

  // Determine if we're in edit mode
  const isEditMode = initialValues && Object.keys(initialValues).length > 0;

  // Handle form submission
  const handleSubmit = (values: VenueFormData) => {
    onSubmit(values);
  };

  return (
    <BaseFormDialog<VenueFormData>
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      defaultValues={defaultValues}
      validationSchema={venueSchema}
      title={title}
      titleKey="venue"
      loading={loading}
      isEditMode={!!isEditMode}
      maxWidth="md"
      submitText={isEditMode ? t('venue.update') : t('venue.create')}
      loadingText={isEditMode ? t('venue.updating') : t('venue.creating')}
    >
      {/* Name Field */}
      <FormTextField
        id="venue-name"
        name="name"
        label={t('venue.form.name')}
        type="text"
        required
        placeholder={t('venue.form.namePlaceholder')}
      />

      {/* Address Field */}
      <FormTextField
        id="venue-address"
        name="address"
        label={t('venue.form.address')}
        type="text"
        required
        placeholder={t('venue.form.addressPlaceholder')}
      />

      {/* City Field */}
      <FormTextField
        id="venue-city"
        name="city"
        label={t('venue.form.city')}
        type="text"
        required
        placeholder={t('venue.form.cityPlaceholder')}
      />

      {/* Coordinates */}
      <Box display="flex" gap={2}>
        <FormTextField
          id="venue-lat"
          name="lat"
          label={t('venue.form.latitude')}
          type="number"
          placeholder={t('venue.form.latitudePlaceholder')}
          fullWidth
        />
        <FormTextField
          id="venue-lng"
          name="lng"
          label={t('venue.form.longitude')}
          type="number"
          placeholder={t('venue.form.longitudePlaceholder')}
          fullWidth
        />
      </Box>

      {/* Capacity Field */}
      <FormTextField
        id="venue-capacity"
        name="capacity"
        label={t('venue.form.capacity')}
        type="number"
        required
        disabledNaturalBase
        placeholder={t('venue.form.capacityPlaceholder')}
      />

      {/* Description Field */}
      <FormTextareaField
        id="venue-description"
        name="description"
        label={t('venue.form.descriptionPlaceholder')}
      />
    </BaseFormDialog>
  );
};

export default CreateVenueForm;
