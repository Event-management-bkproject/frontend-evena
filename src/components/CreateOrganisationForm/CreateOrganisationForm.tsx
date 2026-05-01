'use client';

import { Box, Typography, Button } from '@mui/material';

import { organizationSchema } from '@/src/utils/validationSchema/organisationValidationSchema';
import Forms from '../Forms';
import FormTextField from '../FormTextField';
import FormTextareaField from '../FormTextAreaField';

export interface OrganizationFormData {
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  email?: string;
  phone?: string;
}

interface CreateOrganizationFormProps {
  onSubmit: (data: OrganizationFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
  initialValues?: Partial<OrganizationFormData>;
}

const CreateOrganizationForm = ({
  onSubmit,
  onCancel,
  loading = false,
  initialValues,
}: CreateOrganizationFormProps) => {
  const defaultValues: OrganizationFormData = {
    name: '',
    description: '',
    logoUrl: '',
    website: '',
    email: '',
    phone: '',
    ...initialValues,
  };

  const handleSubmit = (values: OrganizationFormData, actions: any) => {
    const payload = Object.fromEntries(
      Object.entries(values).filter(([, v]) => v !== '')
    ) as OrganizationFormData;
    onSubmit(payload);
    actions.setSubmitting(false);
  };

  return (
    <Forms
      values={defaultValues}
      onSubmit={handleSubmit}
      validationSchema={organizationSchema}
      enableReinitialize
      isRegister={false}
    >
      <Box display="flex" flexDirection="column" gap={3}>
        {/* Name Field */}
        <FormTextField
          id="organization-name"
          name="name"
          label="Organization Name"
          type="text"
          required
          placeholder="Enter organization name"
        />

        {/* Description Field */}
        <Box>
          <Typography
            variant="body1"
            component="label"
            htmlFor="organization-description"
            sx={{
              display: 'block',
              fontWeight: '540',
              color: '#37437D',
              fontSize: '16px',
              marginBottom: '8px',
            }}
          >
            Description
          </Typography>
          <FormTextareaField
            id="organization-description"
            name="description"
            label="Enter organization description"
          />
        </Box>

        {/* Logo URL Field */}
        <FormTextField
          id="organization-logoUrl"
          name="logoUrl"
          label="Logo URL"
          type="url"
          placeholder="https://example.com/logo.png"
        />

        {/* Website Field */}
        <FormTextField
          id="organization-website"
          name="website"
          label="Website"
          type="url"
          placeholder="https://example.com"
        />

        {/* Email Field */}
        <FormTextField
          id="organization-email"
          name="email"
          label="Email"
          type="email"
          placeholder="organization@example.com"
        />

        {/* Phone Field */}
        <FormTextField
          id="organization-phone"
          name="phone"
          label="Phone"
          type="text"
          disabledNaturalBase
          placeholder="Enter phone number"
        />
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
          {loading ? 'Creating...' : 'Create Organization'}
        </Button>
      </Box>
    </Forms>
  );
};

export default CreateOrganizationForm;
