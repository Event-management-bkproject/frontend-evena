/**
 * UpdateOrganizationForm - Refactored to use useOptimisticLocking hook
 *
 * BUSINESS LOGIC PRESERVED:
 * - All form fields and validation
 * - SSE conflict detection (now via useOptimisticLocking hook)
 * - Version tracking for optimistic locking
 * - Submit handling with version
 *
 * UI CHANGES:
 * - Uses shared button styles
 * - Uses centralized useOptimisticLocking hook
 */
'use client';

import { Alert, Box, Button } from '@mui/material';
import FormTextField from '../FormTextField';
import Forms from '../Forms';
import FormTextareaField from '../FormTextAreaField';
import ImageUploadField from '../ImageUploadField/ImageUploadField';
import { OrganizationFormData } from '../CreateOrganisationForm/CreateOrganisationForm';
import { OrganizationResponse, UpdateOrganizationRequest } from '@/src/stores/types';
import { useOptimisticLocking, ENTITY_EVENT_TYPES } from '@/src/hooks/useOptimisticLocking';
import { PRIMARY_BUTTON_SX, SECONDARY_BUTTON_SX } from '@/src/theme/buttonStyles';
import { useUploadOrgLogoMutation } from '@/src/stores/services/OrganizerApi';

interface UpdateOrganizationFormProps {
  organization: OrganizationResponse;
  onSubmit: (data: UpdateOrganizationRequest) => void;
  onCancel?: () => void;
  loading?: boolean;
}

const UpdateOrganizationForm = ({ organization, onSubmit, onCancel, loading = false }: UpdateOrganizationFormProps) => {
  const [uploadOrgLogo] = useUploadOrgLogoMutation();

  const logoUploadFn = async (file: File): Promise<string> => {
    const res = await uploadOrgLogo({ organizationId: organization.id, file }).unwrap();
    return res.url;
  };

  // Use optimistic locking hook for conflict detection
  const { hasConflict, conflictMessage, version } = useOptimisticLocking({
    entityId: organization.id,
    entityVersion: organization.version,
    entityType: 'ORGANIZATION',
    eventTypes: ENTITY_EVENT_TYPES.ORGANIZATION,
  });

  const initialValues: OrganizationFormData = {
    name: organization.name,
    description: organization.description || '',
    logoUrl: organization.logoUrl || '',
    website: organization.website || '',
    email: organization.email || '',
    phone: organization.phone || '',
  };

  const handleSubmit = (values: OrganizationFormData, actions: any) => {
    const updateData: UpdateOrganizationRequest = {
      name: values.name,
      description: values.description || undefined,
      logoUrl: values.logoUrl || undefined,
      website: values.website || undefined,
      email: values.email || undefined,
      phone: values.phone || undefined,
      version,
    };
    onSubmit(updateData);
    actions.setSubmitting(false);
  };

  return (
    <Forms values={initialValues} onSubmit={handleSubmit} enableReinitialize isRegister={false}>
      <Box display="flex" flexDirection="column" gap={3}>
        {/* Conflict Warning */}
        {hasConflict && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {conflictMessage}
          </Alert>
        )}

        {/* Name Field */}
        <FormTextField
          id="org-update-name"
          name="name"
          label="Organization Name"
          type="text"
          required={true}
          placeholder="Enter organization name"
        />

        {/* Logo — upload button updates org entity directly, URL stored in form */}
        <ImageUploadField
          name="logoUrl"
          label="Logo"
          uploadFn={logoUploadFn}
          previewHeight={140}
        />

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
              sx={SECONDARY_BUTTON_SX}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={loading || hasConflict}
            sx={PRIMARY_BUTTON_SX}
          >
            {loading ? 'Updating...' : hasConflict ? 'Data Changed - Close & Reopen' : 'Update Organization'}
          </Button>
        </Box>
      </Box>
    </Forms>
  );
};

export default UpdateOrganizationForm;
