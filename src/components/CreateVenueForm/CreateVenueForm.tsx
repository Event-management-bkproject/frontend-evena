'use client';

import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Forms from '../Forms';
import FormTextField from '../FormTextField';
import FormTextareaField from '../FormTextAreaField';
import { venueSchema } from '@/src/utils/validationSchema/venueValidationSchema';
import { CreateVenueFormProps, VenueFormData } from './types';
import { useTranslation } from 'react-i18next';

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

  const handleSubmit = (values: VenueFormData, actions: any) => {
    onSubmit(values);
    actions.setSubmitting(false);
  };

  // Determine if we're in edit mode - use title prop first, then check initialValues
  const isEditMode = initialValues && Object.keys(initialValues).length > 0;
  const dialogTitle = title || (isEditMode ? t('venue.edit') : t('venue.createNew'));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Forms
            values={defaultValues}
            onSubmit={handleSubmit}
            validationSchema={venueSchema}
            enableReinitialize
            isRegister={false}
          >
            <Box display="flex" flexDirection="column" gap={3}>
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
              <FormTextareaField id="venue-description" name="description" label={t('venue.form.descriptionPlaceholder')} />
            </Box>

            {/* Actions */}
            <DialogActions sx={{ mt: 3, px: 0 }}>
              <Button
                onClick={onClose}
                variant="outlined"
                disabled={loading}
                sx={{
                  borderRadius: '10px',
                  padding: '10px 24px',
                  textTransform: 'none',
                  fontSize: '16px',
                }}
              >
                {t('common.buttons.cancel')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  backgroundColor: '#f36bf9',
                  borderRadius: '10px',
                  padding: '10px 24px',
                  textTransform: 'none',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#e55ae0',
                  },
                  '&:disabled': {
                    backgroundColor: '#cccccc',
                  },
                }}
              >
                {loading ? (isEditMode ? t('venue.updating') : t('venue.creating')) : isEditMode ? t('venue.update') : t('venue.create')}
              </Button>
            </DialogActions>
          </Forms>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CreateVenueForm;
