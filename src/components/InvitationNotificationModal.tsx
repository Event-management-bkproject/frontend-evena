'use client';

import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Business, Check, Close } from '@mui/icons-material';
import BaseModal from './BaseModal';
import {
  useGetPendingInvitationsQuery,
  useAcceptInvitationMutation,
  useRejectInvitationMutation,
} from '@/src/stores/services/OrganizationMemberApi';
import { useSnackbar } from '@/src/hooks/ui/useSnackbar';

interface InvitationNotificationModalProps {
  open: boolean;
  onClose: () => void;
}

export default function InvitationNotificationModal({ open, onClose }: InvitationNotificationModalProps) {
  const { showSnackbar } = useSnackbar();

  // Fetch pending invitations
  const { data, isLoading, error } = useGetPendingInvitationsQuery(undefined, {
    skip: !open,
  });

  const [acceptInvitation, { isLoading: accepting }] = useAcceptInvitationMutation();
  const [rejectInvitation, { isLoading: rejecting }] = useRejectInvitationMutation();

  const invitations = data?.data || [];

  const handleAccept = async (invitationId: number, orgName?: string) => {
    try {
      await acceptInvitation(invitationId).unwrap();
      showSnackbar(`Accepted invitation to ${orgName || 'organization'}`, 'success');
    } catch (err: any) {
      showSnackbar(err?.data?.message || 'Failed to accept invitation', 'error');
    }
  };

  const handleReject = async (invitationId: number, orgName?: string) => {
    try {
      await rejectInvitation(invitationId).unwrap();
      showSnackbar(`Rejected invitation to ${orgName || 'organization'}`, 'info');
    } catch (err: any) {
      showSnackbar(err?.data?.message || 'Failed to reject invitation', 'error');
    }
  };

  return (
    <BaseModal open={open} onClose={onClose} title="Organization Invitations" maxWidth="md">
      <Box sx={{ minHeight: 200 }}>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load invitations. Please try again.
          </Alert>
        )}

        {!isLoading && !error && invitations.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              You have no pending invitations
            </Typography>
          </Box>
        )}

        {!isLoading && !error && invitations.length > 0 && (
          <List sx={{ width: '100%' }}>
            {invitations.map((invitation) => (
              <ListItem
                key={invitation.id}
                sx={{
                  border: '1px solid #E0E0E0',
                  borderRadius: 2,
                  mb: 2,
                  backgroundColor: '#FAFAFA',
                  '&:last-child': { mb: 0 },
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <Business />
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Typography variant="h6" fontWeight={600}>
                      {invitation.organizationName || 'Organization'}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Role:
                      </Typography>
                      <Chip label={invitation.role} size="small" color="primary" variant="outlined" />
                    </Box>
                  }
                />

                <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={<Check />}
                    onClick={() => handleAccept(invitation.id, invitation.organizationName)}
                    disabled={accepting || rejecting}
                    sx={{ textTransform: 'none' }}
                  >
                    {accepting ? 'Accepting...' : 'Accept'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<Close />}
                    onClick={() => handleReject(invitation.id, invitation.organizationName)}
                    disabled={accepting || rejecting}
                    sx={{ textTransform: 'none' }}
                  >
                    {rejecting ? 'Rejecting...' : 'Reject'}
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </BaseModal>
  );
}
