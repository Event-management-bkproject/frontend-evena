'use client';

import { useState } from 'react';
import { Box, Button, Typography, Alert, Divider, Chip } from '@mui/material';
import {
  ManageAccounts,
  EventAvailable,
  QrCodeScanner,
  Visibility,
  CheckCircle,
  PersonAdd,
  Info,
} from '@mui/icons-material';
import BaseModal from '../BaseModal';
import FormTextField from '../FormTextField';
import Forms from '../Forms';
import { OrganizationRole } from '@/src/stores/types/enums';
import { useAuth } from '@/src/hooks/auth/useAuth';
import { useFormikContext } from 'formik';
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

const roleOptions = [
  {
    value: OrganizationRole.MANAGER,
    label: 'Manager',
    description: 'Manage events and team',
    Icon: ManageAccounts,
    color: '#1565C0',
    bgColor: '#E3F2FD',
    permissions: ['Create & edit events', 'Invite & remove members', 'Manage ticket types', 'View all reports'],
  },
  {
    value: OrganizationRole.COORDINATOR,
    label: 'Coordinator',
    description: 'Manage events only',
    Icon: EventAvailable,
    color: '#6A1B9A',
    bgColor: '#F3E5F5',
    permissions: ['Create & edit events', 'Manage ticket types', 'View event reports'],
  },
  {
    value: OrganizationRole.SCANNER,
    label: 'Scanner',
    description: 'Scan tickets at events',
    Icon: QrCodeScanner,
    color: '#2E7D32',
    bgColor: '#E8F5E9',
    permissions: ['Scan & validate tickets', 'View check-in status'],
  },
  {
    value: OrganizationRole.VIEWER,
    label: 'Viewer',
    description: 'View-only access',
    Icon: Visibility,
    color: '#616161',
    bgColor: '#F5F5F5',
    permissions: ['View events', 'View member list', 'View reports'],
  },
];

function RoleSelector() {
  const { values, setFieldValue, errors, touched } = useFormikContext<{
    email: string;
    role: OrganizationRole;
  }>();

  const selectedRole = roleOptions.find((r) => r.value === values.role);

  return (
    <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
      {/* Left: form fields */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <FormTextField
          id="invite-member-email"
          name="email"
          label="Organizer Email Address"
          type="email"
          required={true}
          placeholder="organizer@example.com"
        />

        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#2A3363', mb: 1.5 }}>
            Select Role <span style={{ color: '#f44336' }}>*</span>
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            {roleOptions.map(({ value, label, description, Icon, color, bgColor }) => {
              const isSelected = values.role === value;
              return (
                <Box
                  key={value}
                  onClick={() => setFieldValue('role', value)}
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    border: `2px solid ${isSelected ? color : '#E0E0E0'}`,
                    backgroundColor: isSelected ? bgColor : '#FAFAFA',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'border-color 0.15s, background-color 0.15s',
                    '&:hover': { borderColor: color, backgroundColor: bgColor },
                  }}
                >
                  {isSelected && (
                    <CheckCircle
                      sx={{ position: 'absolute', top: 8, right: 8, fontSize: 16, color }}
                    />
                  )}
                  <Icon sx={{ fontSize: 24, color, mb: 0.5 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#2A3363', lineHeight: 1.2 }}>
                    {label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                    {description}
                  </Typography>
                </Box>
              );
            })}
          </Box>
          {touched.role && errors.role && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
              {errors.role}
            </Typography>
          )}
        </Box>
      </Box>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Right: role detail panel */}
      <Box sx={{ width: 260, flexShrink: 0 }}>
        {selectedRole ? (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  backgroundColor: selectedRole.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <selectedRole.Icon sx={{ fontSize: 22, color: selectedRole.color }} />
              </Box>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#2A3363', lineHeight: 1.2 }}>
                  {selectedRole.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedRole.description}
                </Typography>
              </Box>
            </Box>

            <Typography variant="caption" sx={{ fontWeight: 600, color: '#37437D', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Permissions
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {selectedRole.permissions.map((perm) => (
                <Box key={perm} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ fontSize: 14, color: selectedRole.color }} />
                  <Typography variant="caption" color="text.secondary">
                    {perm}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: 160,
              color: 'text.disabled',
              gap: 1,
            }}
          >
            <Info sx={{ fontSize: 32, opacity: 0.4 }} />
            <Typography variant="caption" textAlign="center">
              Select a role to see its permissions
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            p: 1.5,
            backgroundColor: '#FFF8F0',
            borderRadius: '10px',
            border: '1px solid #FFD8A8',
          }}
        >
          <Typography variant="caption" sx={{ color: '#7C4A00', lineHeight: 1.6, display: 'block' }}>
            <strong>Note:</strong> Only existing <strong>Organizer accounts</strong> can be invited. Customer accounts cannot join organizations.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function InviteMemberModal({
  open,
  onClose,
  onSubmit,
  loading = false,
}: InviteMemberModalProps) {
  const { auth } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    values: { email: string; role: OrganizationRole },
    actions: any,
  ) => {
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(values.email, values.role);
      actions.resetForm();
      onClose();
    } catch (err: any) {
      console.error('Error inviting member:', err);
      let errorMessage = 'Failed to send invitation';

      if (err?.data?.message) {
        const msg = err.data.message.toLowerCase();
        if (msg.includes('not a organizer') || msg.includes('not an organizer')) {
          errorMessage = `Cannot invite "${values.email}". The user is not an Organizer, does not exist, or you cannot invite yourself.`;
        } else if (msg.includes('not found') || msg.includes('does not exist')) {
          errorMessage = `No account found for "${values.email}". Please ensure the email is registered.`;
        } else if (msg.includes('already') || msg.includes('member')) {
          errorMessage = `"${values.email}" is already a member of this organization.`;
        } else if (msg.includes('yourself') || msg.includes('own')) {
          errorMessage = `You cannot invite yourself. Please enter a different organizer's email.`;
        } else {
          errorMessage = err.data.message;
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

  return (
    <BaseModal open={open} onClose={onClose} title="Invite Team Member" maxWidth="lg">
      <Forms
        values={{ email: '', role: OrganizationRole.VIEWER }}
        onSubmit={handleSubmit}
        validationSchema={inviteMemberSchema}
        enableReinitialize
        isRegister={false}
      >
        <Box display="flex" flexDirection="column" gap={2.5}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: '10px' }}>
              {error}
            </Alert>
          )}

          {/* Top bar: logged-in info + who will be invited */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1.5,
              backgroundColor: '#F9FAFB',
              borderRadius: '10px',
              border: '1px solid #E0E0E0',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonAdd sx={{ fontSize: 18, color: '#37437D' }} />
              <Typography variant="body2" color="text.secondary">
                Inviting a new member to your organization
              </Typography>
            </Box>
            {auth?.user?.email && (
              <Chip
                label={`You: ${auth.user.email}`}
                size="small"
                sx={{ backgroundColor: '#FFF3E0', color: '#E65100', fontWeight: 500, fontSize: '12px' }}
              />
            )}
          </Box>

          <RoleSelector />

          <Box display="flex" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              disabled={submitting || loading}
              startIcon={<PersonAdd />}
              sx={{
                backgroundColor: '#f36bf9',
                borderRadius: '10px',
                padding: '10px 28px',
                textTransform: 'none',
                fontSize: '15px',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#e55ae0' },
                '&:disabled': { backgroundColor: '#cccccc' },
              }}
            >
              {submitting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </Box>
        </Box>
      </Forms>
    </BaseModal>
  );
}
