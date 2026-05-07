'use client';

import { Box, Button } from '@mui/material';
import { organizationSchema } from '@/src/utils/validationSchema/organisationValidationSchema';
import Forms from '../Forms';
import FormTextField from '../FormTextField';
import FormTextareaField from '../FormTextAreaField';
import ImageUploadField from '../ImageUploadField/ImageUploadField';
import { useUploadImageMutation } from '@/src/stores/services/StorageApi';
import { useUploadOrgLogoMutation } from '@/src/stores/services/OrganizerApi';

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
  /** Provided in edit mode so logo upload uses the org-specific endpoint */
  organizationId?: number;
}

// Inner wrapper — needs Formik context from <Forms>
const LogoSection = ({ organizationId }: { organizationId?: number }) => {
  const [uploadGeneric] = useUploadImageMutation();
  const [uploadOrgLogo] = useUploadOrgLogoMutation();

  const uploadFn = async (file: File): Promise<string> => {
    if (organizationId) {
      const res = await uploadOrgLogo({ organizationId, file }).unwrap();
      return res.url;
    }
    const res = await uploadGeneric(file).unwrap();
    return res.url;
  };

  return (
    <ImageUploadField
      name="logoUrl"
      label="Logo"
      uploadFn={uploadFn}
      previewHeight={140}
    />
  );
};

const CreateOrganizationForm = ({
  onSubmit,
  onCancel,
  loading = false,
  initialValues,
  organizationId,
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
        <FormTextField
          id="organization-name"
          name="name"
          label="Organization Name"
          type="text"
          required
          placeholder="Enter organization name"
        />

        <FormTextareaField
          id="organization-description"
          name="description"
          label="Description"
        />

        {/* Logo — upload button + URL preview */}
        <LogoSection organizationId={organizationId} />

        <FormTextField
          id="organization-website"
          name="website"
          label="Website"
          type="url"
          placeholder="https://example.com"
        />

        <FormTextField
          id="organization-email"
          name="email"
          label="Email"
          type="email"
          placeholder="organization@example.com"
        />

        <FormTextField
          id="organization-phone"
          name="phone"
          label="Phone"
          type="text"
          disabledNaturalBase
          placeholder="Enter phone number"
        />
      </Box>

      <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
        {onCancel && (
          <Button
            onClick={onCancel}
            variant="outlined"
            disabled={loading}
            sx={{ borderRadius: '10px', padding: '10px 24px', textTransform: 'none', fontSize: '16px' }}
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
            '&:hover': { backgroundColor: '#e55ae0' },
            '&:disabled': { backgroundColor: '#cccccc' },
          }}
        >
          {loading ? (organizationId ? 'Saving...' : 'Creating...') : (organizationId ? 'Save Changes' : 'Create Organization')}
        </Button>
      </Box>
    </Forms>
  );
};

export default CreateOrganizationForm;
