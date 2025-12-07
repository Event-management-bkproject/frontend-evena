'use client';

import { Box, Button } from '@mui/material';
import FormTextField from '../FormTextField';
import Forms from '../Forms';
import FormTextareaField from '../FormTextAreaField';
import { OrganizationFormData } from '../CreateOrganisationForm/CreateOrganisationForm';
import { OrganizationResponse } from '@/src/stores/types';

interface UpdateOrganizationFormProps {
  organization: OrganizationResponse;
  onSubmit: (data: OrganizationFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
}

const UpdateOrganizationForm = ({ organization, onSubmit, onCancel, loading = false }: UpdateOrganizationFormProps) => {
  const initialValues: OrganizationFormData = {
    name: organization.name,
    description: organization.description || '',
    logoUrl: organization.logoUrl || '',
    website: organization.website || '',
    email: organization.email || '',
    phone: organization.phone || '',
  };

  const handleSubmit = (values: OrganizationFormData, actions: any) => {
    onSubmit(values);
    actions.setSubmitting(false);
  };

  return (
    <Forms values={initialValues} onSubmit={handleSubmit} enableReinitialize isRegister={false}>
      <Box display="flex" flexDirection="column" gap={3}>
        {/* Name Field */}
        <FormTextField
          id="org-update-name"
          name="name"
          label="Organization Name"
          type="text"
          required={true}
          placeholder="Enter organization name"
        />

        {/* Logo URL Field */}
        <FormTextField id="org-update-logoUrl" name="logoUrl" label="Logo URL" type="url" placeholder="https://example.com/logo.png" />

        {/* Website Field */}
        <FormTextField
          id="org-update-website"
          name="website"
          label="Website"
          type="url"
          placeholder="https://example.com"
        />

        {/* Email Field */}
        <FormTextField
          id="org-update-email"
          name="email"
          label="Contact Email"
          type="email"
          placeholder="contact@example.com"
        />

        {/* Phone Field */}
        <FormTextField
          id="org-update-phone"
          name="phone"
          label="Contact Phone"
          type="tel"
          placeholder="+1234567890"
        />

        {/* Description Field */}
        <FormTextareaField
          id="org-update-description"
          name="description"
          label="Enter organization description"
          required={false}
        />

        {/* Actions */}
        <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
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
            {loading ? 'Updating...' : 'Update Organization'}
          </Button>
        </Box>
      </Box>
    </Forms>
  );
};

export default UpdateOrganizationForm;
