/**
 * CreateVenueFormWithMap - With Optimistic Locking
 *
 * BUSINESS LOGIC PRESERVED:
 * - All form fields and validation
 * - Map integration for location selection
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

import { useState } from 'react';
import { Alert, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Tab, Tabs } from '@mui/material';
import Forms from '../Forms';
import FormTextField from '../FormTextField';
import FormTextareaField from '../FormTextAreaField';
import LeafletMapPicker from '../LeafletMapPicker';
import { venueSchema } from '@/src/utils/validationSchema/venueValidationSchema';
import { CreateVenueFormProps, VenueFormData } from './types';
import { useOptimisticLocking, ENTITY_EVENT_TYPES } from '@/src/hooks/useOptimisticLocking';
import { PRIMARY_BUTTON_SX, SECONDARY_BUTTON_SX } from '@/src/theme/buttonStyles';

const CreateVenueFormWithMap = ({
  open,
  onSubmit,
  onClose,
  loading = false,
  initialValues,
  title,
  venue,
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

  // Determine edit mode
  const isEditMode = !!(venue?.id);

  // Always call useOptimisticLocking (Rules of Hooks - must call hooks unconditionally)
  // Pass dummy values when not in edit mode
  const { hasConflict, conflictMessage, version } = useOptimisticLocking({
    entityId: venue?.id || 0,
    entityVersion: venue?.version || 0,
    entityType: 'VENUE',
    eventTypes: ENTITY_EVENT_TYPES.VENUE,
  });

  const handleSubmit = (values: VenueFormData, actions: any) => {
    // Include version for edit mode
    const submitData = isEditMode ? { ...values, version } : values;
    onSubmit(submitData);
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
                  {/* Conflict Warning */}
                  {hasConflict && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      {conflictMessage}
                    </Alert>
                  )}

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
                      sx={SECONDARY_BUTTON_SX}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading || hasConflict}
                      sx={PRIMARY_BUTTON_SX}
                    >
                      {loading
                        ? initialValues?.name
                          ? 'Updating...'
                          : 'Creating...'
                        : hasConflict
                          ? 'Data Changed - Close & Reopen'
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
