'use client';

import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Forms from '../Forms';
import FormTextField from '../FormTextField';
import FormTextareaField from '../FormTextAreaField';
import { venueSchema } from '@/src/utils/validationSchema/venueValidationSchema';
import { CreateVenueFormProps, VenueFormData } from './types';

const CreateVenueForm = ({ open, onSubmit, onClose, loading = false, initialValues, title }: CreateVenueFormProps) => {
  const defaultValues: VenueFormData = {
    name: '',
    address: '',
    city: '',
    lat: undefined,
    lng: undefined,
    capacity: 1,
    description: '',
    ...initialValues,
  };

  const handleSubmit = (values: VenueFormData, actions: any) => {
    onSubmit(values);
    actions.setSubmitting(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title || (initialValues?.name ? 'Edit Venue' : 'Create New Venue')}</DialogTitle>
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
                label="Venue Name"
                type="text"
                required
                placeholder="Enter venue name"
              />

              {/* Address Field */}
              <FormTextField
                id="venue-address"
                name="address"
                label="Address"
                type="text"
                required
                placeholder="Enter full address"
              />

              {/* City Field */}
              <FormTextField id="venue-city" name="city" label="City" type="text" required placeholder="Enter city" />

              {/* Coordinates */}
              <Box display="flex" gap={2}>
                <FormTextField
                  id="venue-lat"
                  name="lat"
                  label="Latitude"
                  type="number"
                  placeholder="e.g., 10.762622"
                  fullWidth
                />
                <FormTextField
                  id="venue-lng"
                  name="lng"
                  label="Longitude"
                  type="number"
                  placeholder="e.g., 106.660172"
                  fullWidth
                />
              </Box>

              {/* Capacity Field */}
              <FormTextField
                id="venue-capacity"
                name="capacity"
                label="Capacity"
                type="number"
                required
                disabledNaturalBase
                placeholder="Enter capacity"
              />

              {/* Description Field */}
              <FormTextareaField id="venue-description" name="description" label="Enter venue description" />
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
                Cancel
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
                {loading
                  ? initialValues?.name
                    ? 'Updating...'
                    : 'Creating...'
                  : initialValues?.name
                  ? 'Update Venue'
                  : 'Create Venue'}
              </Button>
            </DialogActions>
          </Forms>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CreateVenueForm;
