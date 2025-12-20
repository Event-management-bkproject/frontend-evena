// app/dashboard/organizer/organizations/page.tsx
'use client';

import { useAuth } from '@/src/hooks/auth/useAuth';
import {
  useCreateOrganizationMutation,
  useGetMyOrganizationsQuery,
  useUpdateOrganizationMutation,
  useDeleteOrganizationMutation,
} from '@/src/stores/services/OrganizerApi';
import { useInviteMemberMutation } from '@/src/stores/services';
import { useRouter } from 'next/navigation';
import React, { useState, useMemo } from 'react';
import ProtectedContent from '@/src/components/ProtectedContent';
import { Box } from '@mui/material';
import BaseModal from '@/src/components/BaseModal';
import CreateOrganizationForm, {
  OrganizationFormData,
} from '@/src/components/CreateOrganisationForm/CreateOrganisationForm';
import UpdateOrganizationForm from '@/src/components/UpdateOrganizationForm';
import DeleteConfirmDialog from '@/src/components/DeleteConfirmDialog';
import DashboardHeader from '@/src/components/DashboardHeader';
import OrganizationFilters from '@/src/components/OrganizationFilters';
import Snackbar from '@/src/components/SnackBar';
import { OrganizationResponse } from '@/src/stores/types';
import LayoutWithSidebar from '@/src/components/layout/LayoutWithSidebar';
import { OrganizationRowList } from '@/src/components/OrganizationCard/OrganizationRowList';
import InviteMemberModal from '@/src/components/InviteMemberModal';
import MemberManagementModal from '@/src/components/MemberManagementModal';
import { OrganizationRole } from '@/src/stores/types/enums';

export default function OrganizationsPage() {
  const { auth } = useAuth();
  const router = useRouter();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<OrganizationResponse | null>(null);

  // Filters state
  const [searchKeyword, setSearchKeyword] = useState('');

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // Queries
  const {
    data: organizersResponse,
    isLoading: loadingOrganizers,
    error: organizersError,
    refetch: refetchOrganizers,
  } = useGetMyOrganizationsQuery(undefined, {
    skip: !auth.accessToken,
  });

  // Mutations
  const [createOrganization, { isLoading: creatingOrganization }] = useCreateOrganizationMutation();
  const [updateOrganization, { isLoading: updatingOrganization }] = useUpdateOrganizationMutation();
  const [deleteOrganization, { isLoading: deletingOrganization }] = useDeleteOrganizationMutation();
  const [inviteMember, { isLoading: invitingMember }] = useInviteMemberMutation();

  // Data processing
  const organizations: OrganizationResponse[] = organizersResponse?.data || [];

  // Filter organizations
  const filteredOrganizations = useMemo(() => {
    let filtered = organizations;

    // Search filter
    if (searchKeyword) {
      filtered = filtered.filter(
        (org) =>
          org.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          org.description?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          org.email?.toLowerCase().includes(searchKeyword.toLowerCase()),
      );
    }

    return filtered;
  }, [organizations, searchKeyword]);

  // Handlers
  const handleCreateOrganization = async (formData: OrganizationFormData) => {
    try {
      await createOrganization(formData).unwrap();
      showSuccessMessage('Organization created successfully!');
      setCreateModalOpen(false);
      refetchOrganizers();
    } catch (error: any) {
      showErrorMessage(error?.data?.message || 'Failed to create organization');
    }
  };

  const handleUpdateOrganization = async (formData: OrganizationFormData) => {
    if (!selectedOrganization) return;

    try {
      await updateOrganization({ id: selectedOrganization.id, data: formData }).unwrap();
      showSuccessMessage('Organization updated successfully!');
      setUpdateModalOpen(false);
      setSelectedOrganization(null);
      refetchOrganizers();
    } catch (error: any) {
      showErrorMessage(error?.data?.message || 'Failed to update organization');
    }
  };

  const handleDeleteOrganization = async () => {
    if (!selectedOrganization) return;

    try {
      await deleteOrganization(selectedOrganization.id).unwrap();
      showSuccessMessage('Organization deleted successfully!');
      setDeleteDialogOpen(false);
      setSelectedOrganization(null);
      refetchOrganizers();
    } catch (error: any) {
      // console.error('Delete organization error:', error);
      const errorMessage =
        error?.data?.message ||
        error?.data?.error ||
        error?.message ||
        'Failed to delete organization. It may have active events or members.';
      showErrorMessage(errorMessage);
      setDeleteDialogOpen(false);
    }
  };

  const handleOrganizationEdit = (organization: OrganizationResponse) => {
    setSelectedOrganization(organization);
    setUpdateModalOpen(true);
  };

  const handleOrganizationDelete = (organization: OrganizationResponse) => {
    setSelectedOrganization(organization);
    setDeleteDialogOpen(true);
  };

  const handleManageMembers = (organization: OrganizationResponse) => {
    setSelectedOrganization(organization);
    setMemberModalOpen(true);
  };

  const handleOrganizationClick = (organization: OrganizationResponse) => {
    router.push(`/dashboard/organizer/organizations/${organization.id}`);
  };

  const handleInviteMember = async (email: string, role: OrganizationRole) => {
    if (!selectedOrganization) {
      console.error('No organization selected');
      return;
    }

    // Client-side validation: prevent inviting yourself
    if (auth?.user?.email && email.toLowerCase() === auth.user.email.toLowerCase()) {
      showErrorMessage("You cannot invite yourself. Please enter a different organizer's email address.");
      throw new Error('Cannot invite yourself');
    }

    console.log('Inviting member:', {
      organizationId: selectedOrganization.id,
      email,
      role,
    });

    try {
      const result = await inviteMember({
        organizationId: selectedOrganization.id,
        data: { email, role },
      }).unwrap();

      console.log('Invitation result:', result);
      showSuccessMessage(`Invitation sent to ${email}`);
      setInviteModalOpen(false);
    } catch (error: any) {
      console.error('Error inviting member:', error);
      console.error('Error details:', {
        status: error?.status,
        data: error?.data,
        message: error?.data?.message,
      });

      const errorMessage = error?.data?.message || error?.message || 'Failed to send invitation';
      showErrorMessage(errorMessage);
      throw error; // Re-throw to let InviteMemberModal handle it
    }
  };

  const showSuccessMessage = (message: string) => {
    setSnackbar({ open: true, message, severity: 'success' });
  };

  const showErrorMessage = (message: string) => {
    setSnackbar({ open: true, message, severity: 'error' });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const isLoading = loadingOrganizers;

  return (
    <ProtectedContent>
      <LayoutWithSidebar currentPage="organizations">
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 20px)' }}>
          {/* Header */}
          <Box sx={{ mb: '10px' }}>
            <DashboardHeader
              title="Organizations"
              breadcrumbs={[{ label: 'Dashboard', href: '/dashboard/organizer' }, { label: 'Organizations' }]}
              userName={auth.user?.name || 'User'}
            />
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, p: 3, overflow: 'auto', backgroundColor: '#F7F7F7', borderRadius: '20px' }}>
            {/* Filters */}
            <OrganizationFilters
              onSearch={setSearchKeyword}
              onCreateClick={() => setCreateModalOpen(true)}
              organizations={organizations}
              loading={isLoading}
            />

            {/* Error Display */}
            {organizersError && (
              <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1, color: 'error.contrastText' }}>
                Error loading organizations: {(organizersError as any)?.data?.message || 'Unknown error occurred'}
              </Box>
            )}

            {/* Organizations List */}
            <OrganizationRowList
              organizations={filteredOrganizations}
              onEdit={handleOrganizationEdit}
              onDelete={handleOrganizationDelete}
              onManageMembers={handleManageMembers}
              onClick={handleOrganizationClick}
              loading={isLoading}
            />
          </Box>
        </Box>

        {/* Create Organization Modal */}
        <BaseModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Create New Organization"
          maxWidth="md"
        >
          <CreateOrganizationForm
            onSubmit={handleCreateOrganization}
            onCancel={() => setCreateModalOpen(false)}
            loading={creatingOrganization}
          />
        </BaseModal>

        {/* Update Organization Modal */}
        {selectedOrganization && (
          <BaseModal
            open={updateModalOpen}
            onClose={() => setUpdateModalOpen(false)}
            title="Edit Organization"
            maxWidth="md"
          >
            <UpdateOrganizationForm
              organization={selectedOrganization}
              onSubmit={handleUpdateOrganization}
              onCancel={() => setUpdateModalOpen(false)}
              loading={updatingOrganization}
            />
          </BaseModal>
        )}

        {/* Delete Confirmation */}
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteOrganization}
          title="Delete Organization"
          message={`Are you sure you want to delete "${selectedOrganization?.name}"? This action cannot be undone.`}
          loading={deletingOrganization}
        />

        {/* Member Management Modal */}
        {selectedOrganization && (
          <MemberManagementModal
            open={memberModalOpen}
            onClose={() => {
              setMemberModalOpen(false);
              setSelectedOrganization(null);
            }}
            organization={selectedOrganization}
            onInviteMember={() => setInviteModalOpen(true)}
            onSuccess={() => {
              refetchOrganizers();
            }}
          />
        )}

        {/* Invite Member Modal */}
        {selectedOrganization && (
          <InviteMemberModal
            open={inviteModalOpen}
            onClose={() => setInviteModalOpen(false)}
            onSubmit={handleInviteMember}
            loading={invitingMember}
          />
        )}

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={handleCloseSnackbar}
          vertical="top"
          horizontal="right"
        />
      </LayoutWithSidebar>
    </ProtectedContent>
  );
}
