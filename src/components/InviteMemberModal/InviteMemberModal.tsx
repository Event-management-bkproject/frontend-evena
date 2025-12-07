'use client';

import React, { useState } from 'react';
import { Box, Button, MenuItem, Typography, Alert } from '@mui/material';
import BaseModal from '../BaseModal';
import FormTextField from '../FormTextField';
import Forms from '../Forms';
import { OrganizationRole } from '@/src/stores/types/enums';
import * as yup from 'yup';

interface InviteMemberModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string, role: OrganizationRole) => Promise<void>;
  loading?: boolean;
}

const inviteMemberSchema = yup.object({
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  role: yup
    .string()
    .oneOf(Object.values(OrganizationRole), 'Please select a valid role')
    .required('Role is required'),
});

export default function InviteMemberModal({ open, onClose, onSubmit, loading = false }: InviteMemberModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: { email: string; role: OrganizationRole }, actions: any) => {
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(values.email, values.role);
      actions.resetForm();
      onClose();
    } catch (err: any) {
      console.error('Error inviting member:', err);
      setError(err?.data?.message || err?.message || 'Failed to send invitation');
    } finally {
      setSubmitting(false);
      actions.setSubmitting(false);
    }
  };

  const roleOptions = [
    { value: OrganizationRole.MANAGER, label: 'Manager', description: 'Can manage events and team members' },
    { value: OrganizationRole.COORDINATOR, label: 'Coordinator', description: 'Can manage events' },
    { value: OrganizationRole.SCANNER, label: 'Scanner', description: 'Can only scan tickets' },
    { value: OrganizationRole.VIEWER, label: 'Viewer', description: 'View-only access' },
  ];

  return (
    <BaseModal open={open} onClose={onClose} title="Invite Team Member" maxWidth="sm">
      <Forms
        values={{ email: '', role: OrganizationRole.VIEWER }}
        onSubmit={handleSubmit}
        validationSchema={inviteMemberSchema}
        enableReinitialize
        isRegister={false}
      >
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Info Box */}
          <Box
            sx={{
              p: 2,
              backgroundColor: '#FFF4E6',
              borderRadius: '8px',
              border: '1px solid #FFB74D',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              ⚠️ <strong>Important:</strong> You can only invite users who have registered as <strong>Organizers</strong>.
              The email must belong to an existing organizer account in the system.
            </Typography>
          </Box>

          {/* Email Field */}
          <FormTextField
            id="invite-member-email"
            name="email"
            label="Organizer Email Address"
            type="email"
            required={true}
            placeholder="organizer@example.com"
          />

          {/* Role Field */}
          <Box>
            <FormTextField
              id="invite-member-role"
              name="role"
              label="Role"
              type="text"
              required={true}
              select={true}
            >
              {roleOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box>
                    <Box sx={{ fontWeight: 600 }}>{option.label}</Box>
                    <Box sx={{ fontSize: '12px', color: 'text.secondary' }}>{option.description}</Box>
                  </Box>
                </MenuItem>
              ))}
            </FormTextField>

            {/* Role Descriptions */}
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#FAFAFA', borderRadius: '8px' }}>
              <Typography variant="caption" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                Role Permissions:
              </Typography>
              {roleOptions.map((role) => (
                <Typography key={role.value} variant="caption" sx={{ display: 'block', mb: 0.5, color: 'text.secondary' }}>
                  • <strong>{role.label}:</strong> {role.description}
                </Typography>
              ))}
            </Box>
          </Box>

          {/* Actions - Only 1 button */}
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting || loading}
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
              {submitting ? 'Sending Invitation...' : 'Send Invitation'}
            </Button>
          </Box>
        </Box>
      </Forms>
    </BaseModal>
  );
}
