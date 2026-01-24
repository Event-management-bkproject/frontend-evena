'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  MenuItem,
  Select,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Alert,
} from '@mui/material';
import { Delete, PersonAdd, CheckCircle, Cancel, Warning } from '@mui/icons-material';
import BaseModal from '../BaseModal';
import { useGetOrganizationMembersQuery, useRemoveMemberMutation, useUpdateMemberRoleMutation } from '@/src/stores/services';
import { OrganizationResponse } from '@/src/stores/types';
import { OrganizationRole } from '@/src/stores/types/enums';
import { useAppSelector } from '@/src/stores/hooks';
import SnackbarNotification from '../SnackbarNotification';
import { useSnackbar } from '@/src/hooks/useSnackbar';
import { useSSE } from '@/src/providers/SSEProvider';

interface MemberManagementModalProps {
  open: boolean;
  onClose: () => void;
  organization: OrganizationResponse;
  onInviteMember: () => void;
  onSuccess?: () => void;
}

export default function MemberManagementModal({
  open,
  onClose,
  organization,
  onInviteMember,
  onSuccess,
}: MemberManagementModalProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  // Get current user from Redux store
  const currentUser = useAppSelector((state) => state.auth.user);

  // Fetch members
  const {
    data: membersResponse,
    isLoading,
    refetch,
  } = useGetOrganizationMembersQuery(organization.id, {
    skip: !open,
  });

  const [removeMember, { isLoading: removing }] = useRemoveMemberMutation();
  const [updateMemberRole, { isLoading: updatingRole }] = useUpdateMemberRoleMutation();

  // Listen to SSE events for real-time member updates
  const { lastEvent } = useSSE();

  useEffect(() => {
    if (!lastEvent || !open) return;

    console.log('📨 [MemberManagementModal] Received SSE event:', lastEvent.type);

    switch (lastEvent.type) {
      case 'INVITATION_CREATED':
      case 'INVITATION_ACCEPTED':
      case 'INVITATION_REJECTED':
        console.log('🔄 [MemberManagementModal] Refetching members...');
        refetch();
        break;
      default:
        break;
    }
  }, [lastEvent, refetch, open]);

  const members = membersResponse?.data || [];

  // Check if current user is the owner of the organization
  const isOwnerOfOrganization = currentUser?.id === organization.owner.id;

  const handleRoleChange = async (memberId: number, newRole: OrganizationRole) => {
    try {
      await updateMemberRole({
        organizationId: organization.id,
        memberId,
        data: { role: newRole },
      }).unwrap();
      refetch();
      onSuccess?.();
    } catch (error: any) {
      console.error('Error updating member role:', error);
      showSnackbar(error?.data?.message || 'Failed to update member role', 'error');
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMemberId) return;

    try {
      await removeMember({
        organizationId: organization.id,
        memberId: selectedMemberId,
      }).unwrap();
      setDeleteDialogOpen(false);
      setSelectedMemberId(null);
      refetch();
      onSuccess?.();
    } catch (error: any) {
      console.error('Error removing member:', error);
      showSnackbar(error?.data?.message || 'Failed to remove member', 'error');
    }
  };

  const openDeleteDialog = (memberId: number) => {
    setSelectedMemberId(memberId);
    setDeleteDialogOpen(true);
  };

  const handleInviteMemberClick = () => {
    if (!organization.verified) {
      showSnackbar('Organization must be verified by admin before inviting members. Please wait for admin verification.', 'warning');
      return;
    }
    onInviteMember();
  };

  const getRoleColor = (role: OrganizationRole) => {
    switch (role) {
      case OrganizationRole.OWNER:
        return { bg: '#FFF4E6', color: '#E65100' };
      case OrganizationRole.MANAGER:
        return { bg: '#E3F2FD', color: '#1565C0' };
      case OrganizationRole.COORDINATOR:
        return { bg: '#F3E5F5', color: '#6A1B9A' };
      case OrganizationRole.SCANNER:
        return { bg: '#E8F5E9', color: '#2E7D32' };
      case OrganizationRole.VIEWER:
        return { bg: '#F5F5F5', color: '#616161' };
      default:
        return { bg: '#F5F5F5', color: '#616161' };
    }
  };

  return (
    <>
      <BaseModal open={open} onClose={onClose} title={`Team Members - ${organization.name}`} maxWidth="lg">
        <Box>
          {/* Verification Warning */}
          {!organization.verified && (
            <Alert severity="warning" icon={<Warning />} sx={{ mb: 3 }}>
              This organization is pending admin verification. You cannot invite members until it is verified.
            </Alert>
          )}

          {/* Header with Invite Button */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="body1" color="text.secondary">
              {isOwnerOfOrganization ? 'Manage your team members and their roles' : 'View team members'}
            </Typography>
            {isOwnerOfOrganization && (
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={handleInviteMemberClick}
                disabled={!organization.verified}
                sx={{
                  backgroundColor: '#f36bf9',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#e55ae0',
                  },
                  '&:disabled': {
                    backgroundColor: '#cccccc',
                    color: '#888888',
                  },
                }}
              >
                Invite Member
              </Button>
            )}
          </Box>

          {/* Members Table */}
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#f36bf9' }} />
            </Box>
          ) : members.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 6,
                px: 3,
                backgroundColor: '#F9FAFB',
                borderRadius: '12px',
                border: '1px dashed #E0E0E0',
              }}
            >
              <Typography variant="h6" gutterBottom color="text.secondary">
                No team members yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click "Invite Member" button above to add team members to collaborate on events
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: 'none', border: '1px solid #E0E0E0' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F9FAFB' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Member</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    {isOwnerOfOrganization && (
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        Actions
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {members.map((member) => {
                    const roleColors = getRoleColor(member.role);
                    const isOwner = member.role === OrganizationRole.OWNER;
                    const isCurrentUser = currentUser?.id === member.userId;

                    return (
                      <TableRow key={member.id} hover>
                        <TableCell>
                          <Typography fontWeight={500}>{member.userName}</Typography>
                          {member.phone && (
                            <Typography variant="caption" color="text.secondary">
                              {member.phone}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{member.email}</Typography>
                        </TableCell>
                        <TableCell>
                          {isOwner || isCurrentUser || !isOwnerOfOrganization ? (
                            <Tooltip title={isCurrentUser ? "You cannot change your own role" : !isOwnerOfOrganization ? "Only owner can change roles" : ""} arrow>
                              <Chip
                                label={member.role}
                                size="small"
                                sx={{
                                  backgroundColor: roleColors.bg,
                                  color: roleColors.color,
                                  fontWeight: 600,
                                }}
                              />
                            </Tooltip>
                          ) : (
                            <Select
                              value={member.role}
                              onChange={(e) => handleRoleChange(member.id, e.target.value as OrganizationRole)}
                              disabled={updatingRole}
                              size="small"
                              sx={{
                                minWidth: 140,
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#E0E0E0',
                                },
                              }}
                            >
                              <MenuItem value={OrganizationRole.MANAGER}>Manager</MenuItem>
                              <MenuItem value={OrganizationRole.COORDINATOR}>Coordinator</MenuItem>
                              <MenuItem value={OrganizationRole.SCANNER}>Scanner</MenuItem>
                              <MenuItem value={OrganizationRole.VIEWER}>Viewer</MenuItem>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell>
                          {member.invitationAccepted ? (
                            <Chip
                              icon={<CheckCircle sx={{ fontSize: 16 }} />}
                              label="Active"
                              size="small"
                              sx={{
                                backgroundColor: '#E8F5E9',
                                color: '#2E7D32',
                                '& .MuiChip-icon': {
                                  color: '#2E7D32',
                                },
                              }}
                            />
                          ) : (
                            <Chip
                              icon={<Cancel sx={{ fontSize: 16 }} />}
                              label="Pending"
                              size="small"
                              sx={{
                                backgroundColor: '#FFF3E0',
                                color: '#E65100',
                                '& .MuiChip-icon': {
                                  color: '#E65100',
                                },
                              }}
                            />
                          )}
                        </TableCell>
                        {isOwnerOfOrganization && (
                          <TableCell align="center">
                            {!isOwner && (
                              <IconButton
                                onClick={() => openDeleteDialog(member.id)}
                                size="small"
                                disabled={removing}
                                sx={{
                                  color: '#F44336',
                                  '&:hover': {
                                    backgroundColor: '#FFEBEE',
                                  },
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </BaseModal>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Remove Team Member</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to remove this team member? They will lose access to this organization.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={removing}>
            Cancel
          </Button>
          <Button onClick={handleRemoveMember} color="error" variant="contained" disabled={removing}>
            {removing ? 'Removing...' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={closeSnackbar}
      />
    </>
  );
}
