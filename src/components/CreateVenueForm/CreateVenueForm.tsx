'use client';

import { Box, Button } from '@mui/material';
import Forms from '../Forms';
import FormTextField from '../FormTextField';
import FormTextareaField from '../FormTextAreaField';
import { venueSchema } from '@/src/utils/validationSchema/venueValidationSchema';

export interface VenueFormData {
  name: string;
  address: string;
  city: string;
  lat: number | string; // Cho phép cả string và number
  lng: number | string; // Cho phép cả string và number
  capacity: number;
  description: string;
}

interface CreateVenueFormProps {
  onSubmit: (data: VenueFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
  initialValues?: Partial<VenueFormData>;
}

const CreateVenueForm = ({ onSubmit, onCancel, loading = false, initialValues }: CreateVenueFormProps) => {
  const defaultValues: VenueFormData = {
    name: '',
    address: '',
    city: '',
    lat: 0,
    lng: 0,
    capacity: 1,
    description: '',
    ...initialValues,
  };

  const handleSubmit = (values: VenueFormData, actions: any) => {
    onSubmit(values);
    actions.setSubmitting(false);
  };

  return (
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
            required
            placeholder="e.g., 10.762622"
            fullWidth
          />
          <FormTextField
            id="venue-lng"
            name="lng"
            label="Longitude"
            type="number"
            required
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
        <FormTextareaField id="venue-description" name="description" label="Enter venue description" required />
      </Box>

      {/* Actions */}
      <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
        {onCancel && (
          <Button
            onClick={onCancel}
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
        )}
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
          {loading ? 'Creating...' : 'Create Venue'}
        </Button>
      </Box>
    </Forms>
  );
};

export default CreateVenueForm;
