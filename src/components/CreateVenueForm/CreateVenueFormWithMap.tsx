'use client';

import { useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Tab, Tabs } from '@mui/material';
import Forms from '../Forms';
import FormTextField from '../FormTextField';
import FormTextareaField from '../FormTextAreaField';
import LeafletMapPicker from '../LeafletMapPicker';
import { venueSchema } from '@/src/utils/validationSchema/venueValidationSchema';
import { CreateVenueFormProps, VenueFormData } from './types';

const CreateVenueFormWithMap = ({
  open,
  onSubmit,
  onClose,
  loading = false,
  initialValues,
  title,
}: CreateVenueFormProps) => {
  const [tabValue, setTabValue] = useState(0);

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
            {(formikProps) => {
              const { values, setFieldValue } = formikProps;

              const handleLocationSelect = (lat: number, lng: number, address?: string) => {
                setFieldValue('lat', lat);
                setFieldValue('lng', lng);
                if (address && !values.address) {
                  setFieldValue('address', address);
                }
              };

              return (
                <>
                  {/* Tabs */}
                  <Tabs
                    value={tabValue}
                    onChange={(_, newValue) => setTabValue(newValue)}
                    sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
                  >
                    <Tab label="Basic Info" />
                    <Tab label="Location (Map)" />
                  </Tabs>

                  {/* Tab 1: Basic Info */}
                  {tabValue === 0 && (
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
                  )}

                  {/* Tab 2: Location Map */}
                  {tabValue === 1 && (
                    <Box>
                      <LeafletMapPicker
                        lat={values.lat}
                        lng={values.lng}
                        onLocationSelect={handleLocationSelect}
                        height={450}
                      />

                      {/* Manual Coordinates Input */}
                      <Box display="flex" gap={2} mt={3}>
                        <FormTextField
                          id="venue-lat"
                          name="lat"
                          label="Latitude"
                          type="number"
                          placeholder="e.g., 10.762622"
                          fullWidth
                          helperText="Auto-filled from map or enter manually"
                        />
                        <FormTextField
                          id="venue-lng"
                          name="lng"
                          label="Longitude"
                          type="number"
                          placeholder="e.g., 106.660172"
                          fullWidth
                          helperText="Auto-filled from map or enter manually"
                        />
                      </Box>
                    </Box>
                  )}

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
                </>
              );
            }}
          </Forms>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CreateVenueFormWithMap;
