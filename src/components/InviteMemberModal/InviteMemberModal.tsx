'use client';

import React, { useState } from 'react';
import { Box, Button, MenuItem, Typography, Alert } from '@mui/material';
import BaseModal from '../BaseModal';
import FormTextField from '../FormTextField';
import Forms from '../Forms';
import { OrganizationRole } from '@/src/stores/types/enums';
import { useAuth } from '@/src/hooks/auth/useAuth';
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
  const { auth } = useAuth();
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

      // Improve error message based on backend response
      let errorMessage = 'Failed to send invitation';

      if (err?.data?.message) {
        const backendMessage = err.data.message;

        // Handle specific error cases
        if (backendMessage.toLowerCase().includes('not a organizer') ||
            backendMessage.toLowerCase().includes('not an organizer')) {
          errorMessage = `Cannot invite "${values.email}". This could be because:\n• The user is not registered as an Organizer\n• You cannot invite yourself\n• The email does not exist in the system\n\nPlease ensure the email belongs to a different Organizer account.`;
        } else if (backendMessage.toLowerCase().includes('not found') ||
                   backendMessage.toLowerCase().includes('does not exist')) {
          errorMessage = `No account found for "${values.email}". Please ensure the email is registered in the system.`;
        } else if (backendMessage.toLowerCase().includes('already') ||
                   backendMessage.toLowerCase().includes('member')) {
          errorMessage = `"${values.email}" is already a member of this organization.`;
        } else if (backendMessage.toLowerCase().includes('yourself') ||
                   backendMessage.toLowerCase().includes('own')) {
          errorMessage = `You cannot invite yourself. Please enter a different organizer's email address.`;
        } else {
          errorMessage = backendMessage;
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
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

          {/* Your Email Info */}
          {auth?.user?.email && (
            <Box
              sx={{
                p: 2,
                backgroundColor: '#FFF9E6',
                borderRadius: '8px',
                border: '1px solid #FFB74D',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#F57C00', mb: 0.5 }}>
                ⚠️ Important
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You are currently logged in as <strong>{auth.user.email}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                You cannot invite yourself. Please enter a <strong>different organizer's email</strong>.
              </Typography>
            </Box>
          )}

          {/* Info Box */}
          <Box
            sx={{
              p: 2,
              backgroundColor: '#E3F2FD',
              borderRadius: '8px',
              border: '1px solid #2196F3',
            }}
          >
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#1976D2' }}>
              📋 Invitation Requirements
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              • The email must belong to an existing <strong>Organizer account</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              • The user must have registered with the "Organizer" role
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Customer accounts cannot be invited to organizations
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
