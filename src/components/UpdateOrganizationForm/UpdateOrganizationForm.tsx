'use client';

import { useEffect, useState } from 'react';
import { Alert, Box, Button } from '@mui/material';
import FormTextField from '../FormTextField';
import Forms from '../Forms';
import FormTextareaField from '../FormTextAreaField';
import { OrganizationFormData } from '../CreateOrganisationForm/CreateOrganisationForm';
import { OrganizationResponse, UpdateOrganizationRequest } from '@/src/stores/types';
import { useSSE } from '@/src/providers/SSEProvider';

interface UpdateOrganizationFormProps {
  organization: OrganizationResponse;
  onSubmit: (data: UpdateOrganizationRequest) => void;
  onCancel?: () => void;
  loading?: boolean;
}

const UpdateOrganizationForm = ({ organization, onSubmit, onCancel, loading = false }: UpdateOrganizationFormProps) => {
  // Track if data has changed while editing (SSE conflict detection)
  const [hasConflict, setHasConflict] = useState(false);
  const [conflictMessage, setConflictMessage] = useState('');
  const { lastEvent } = useSSE();

  // Track the initial version when modal opened
  const [initialVersion, setInitialVersion] = useState(organization.version);

  // Track processed SSE events to avoid re-processing on remount
  const [processedEventId, setProcessedEventId] = useState<string | null>(null);

  // Track the timestamp when form was opened to ignore old SSE events
  const [formOpenedAt] = useState(() => Date.now());

  // Reset conflict state when organization data changes (e.g., modal reopened with fresh data)
  useEffect(() => {
    setHasConflict(false);
    setConflictMessage('');
    setInitialVersion(organization.version);
    setProcessedEventId(null); // Reset processed event when data refreshes
  }, [organization.id, organization.version]);

  // Listen for SSE updates to this organization
  useEffect(() => {
    if (!lastEvent) return;

    // Generate unique event ID
    const eventId = `${lastEvent.type}-${lastEvent.data?.organizationId}-${lastEvent.timestamp || ''}`;

    // Skip if already processed this event
    if (processedEventId === eventId) return;

    // Skip events that happened before form was opened
    const eventTime = lastEvent.timestamp ? new Date(lastEvent.timestamp).getTime() : Date.now();
    if (eventTime < formOpenedAt) return;

    if (
      (lastEvent.type === 'ORGANIZATION_UPDATED' ||
       lastEvent.type === 'ORGANIZATION_VERIFIED' ||
       lastEvent.type === 'ORGANIZATION_UNVERIFIED') &&
      lastEvent.data?.organizationId === organization.id
    ) {
      setHasConflict(true);
      setConflictMessage(
        'This organization has been modified by another user or session. ' +
        'Please close this form and reopen it to get the latest data before making changes.'
      );
      setProcessedEventId(eventId);
    }
  }, [lastEvent, organization.id, processedEventId, formOpenedAt]);

  const initialValues: OrganizationFormData = {
    name: organization.name,
    description: organization.description || '',
    logoUrl: organization.logoUrl || '',
    website: organization.website || '',
    email: organization.email || '',
    phone: organization.phone || '',
  };

  const handleSubmit = (values: OrganizationFormData, actions: any) => {
    // Include version for optimistic locking
    const updateData: UpdateOrganizationRequest = {
      ...values,
      version: initialVersion, // Use the version from when modal was opened
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
            disabled={loading || hasConflict}
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
            {loading ? 'Updating...' : hasConflict ? 'Data Changed - Close & Reopen' : 'Update Organization'}
          </Button>
        </Box>
      </Box>
    </Forms>
  );
};

export default UpdateOrganizationForm;
