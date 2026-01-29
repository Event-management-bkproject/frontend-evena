// app/dashboard/organizer/organizations/page.tsx
'use client';

import { useAuth } from '@/src/hooks/auth/useAuth';
import { useSSE } from '@/src/providers/SSEProvider';
import {
  useCreateOrganizationMutation,
  useGetMyOrganizationsQuery,
  useUpdateOrganizationMutation,
  useDeleteOrganizationMutation,
} from '@/src/stores/services/OrganizerApi';
import { useInviteMemberMutation } from '@/src/stores/services';
import { useRouter } from 'next/navigation';
import React, { useState, useMemo, useEffect } from 'react';
import ProtectedContent from '@/src/components/ProtectedContent';
import { Box } from '@mui/material';
import BaseModal from '@/src/components/BaseModal';
import CreateOrganizationForm, {
  OrganizationFormData,
} from '@/src/components/CreateOrganisationForm/CreateOrganisationForm';
import { UpdateOrganizationRequest } from '@/src/stores/types';
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
import { useTranslation } from 'react-i18next';

export default function OrganizationsPage() {
  const { auth } = useAuth();
  const router = useRouter();
  const { lastEvent } = useSSE();
  const { t } = useTranslation();
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
    // refetchOnMountOrArgChange: true, // Auto-refetch when cache invalidated
    // refetchOnFocus: true, // Auto-refetch when window regains focus
  });

  // Mutations
  const [createOrganization, { isLoading: creatingOrganization }] = useCreateOrganizationMutation();
  const [updateOrganization, { isLoading: updatingOrganization }] = useUpdateOrganizationMutation();
  const [deleteOrganization, { isLoading: deletingOrganization }] = useDeleteOrganizationMutation();
  const [inviteMember, { isLoading: invitingMember }] = useInviteMemberMutation();

  // Listen to SSE events from SSEProvider
  useEffect(() => {
    if (!lastEvent) return;

    console.log('📨 [Organizer] Received SSE event:', lastEvent.type);

    // Handle organization events
    switch (lastEvent.type) {
      case 'ORGANIZATION_CREATED':
      case 'ORGANIZATION_UPDATED':
      case 'ORGANIZATION_VERIFIED':
      case 'ORGANIZATION_UNVERIFIED':
      case 'ORGANIZATION_DELETED':
      case 'INVITATION_ACCEPTED':
      case 'INVITATION_REJECTED':
        console.log('🔄 [Organizer] Refetching organizations...');
        refetchOrganizers().then((result) => {
          console.log('✅ [Organizer] Refetch completed:', result);
        });
        break;
      default:
        break;
    }
  }, [lastEvent, refetchOrganizers]);

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
      showSuccessMessage(t('messages.success.created', { item: t('common.entities.organization') }));
      setCreateModalOpen(false);
      refetchOrganizers();
    } catch (error: any) {
      showErrorMessage(error?.data?.message || t('messages.error.updateFailed', { item: t('common.entities.organization') }));
    }
  };

  const handleUpdateOrganization = async (formData: UpdateOrganizationRequest) => {
    if (!selectedOrganization) return;

    try {
      await updateOrganization({ id: selectedOrganization.id, data: formData }).unwrap();
      showSuccessMessage(t('messages.success.updated', { item: t('common.entities.organization') }));
      setUpdateModalOpen(false);
      setSelectedOrganization(null);
      refetchOrganizers();
    } catch (error: any) {
      const errorMessage = error?.data?.message || t('messages.error.updateFailed', { item: t('common.entities.organization') });

      // Check for version conflict error (optimistic locking)
      if (errorMessage.includes('has been modified by another user')) {
        showErrorMessage(t('messages.error.conflictUpdate', { item: t('common.entities.organization') }));
        setUpdateModalOpen(false);
        setSelectedOrganization(null);
        refetchOrganizers();
      } else {
        showErrorMessage(errorMessage);
      }
    }
  };

  const handleDeleteOrganization = async () => {
    if (!selectedOrganization) return;

    try {
      await deleteOrganization(selectedOrganization.id).unwrap();
      showSuccessMessage(t('messages.success.deleted', { item: t('common.entities.organization') }));
      setDeleteDialogOpen(false);
      setSelectedOrganization(null);
      refetchOrganizers();
    } catch (error: any) {
      // console.error('Delete organization error:', error);
      const errorMessage =
        error?.data?.message ||
        error?.data?.error ||
        error?.message ||
        t('messages.error.deleteFailed');
      showErrorMessage(errorMessage);
      setDeleteDialogOpen(false);
    }
  };

  const handleOrganizationEdit = (organization: OrganizationResponse) => {
    setSelectedOrganization(organization);
    setUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setUpdateModalOpen(false);
    setSelectedOrganization(null);
    refetchOrganizers(); // Refetch to get latest data when modal closes
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
      showErrorMessage(t('messages.error.cannotInviteSelf'));
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
      showSuccessMessage(t('messages.success.invitationSent', { email }));
      setInviteModalOpen(false);
    } catch (error: any) {
      console.error('Error inviting member:', error);
      console.error('Error details:', {
        status: error?.status,
        data: error?.data,
        message: error?.data?.message,
      });

      const errorMessage = error?.data?.message || error?.message || t('messages.error.invitationFailed');
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
      {/* <SSESync /> */}
      <LayoutWithSidebar currentPage="organizations">
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 20px)' }}>
          {/* Header */}
          <Box sx={{ mb: '10px' }}>
            <DashboardHeader
              title={t('common.navigation.organizations')}
              breadcrumbs={[{ label: t('common.navigation.dashboard'), href: '/dashboard/organizer' }, { label: t('common.navigation.organizations') }]}
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
                Error loading organizations: {(organizersError as any)?.data?.message || t('messages.error.operationFailed')}
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
          title={t('organizer.createOrganization')}
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
            onClose={handleCloseUpdateModal}
            title={`${t('common.buttons.edit')} ${t('common.entities.organization')}`}
            maxWidth="md"
          >
            <UpdateOrganizationForm
              organization={selectedOrganization}
              onSubmit={handleUpdateOrganization}
              onCancel={handleCloseUpdateModal}
              loading={updatingOrganization}
            />
          </BaseModal>
        )}

        {/* Delete Confirmation */}
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteOrganization}
          title={`${t('common.buttons.delete')} ${t('common.entities.organization')}`}
          message={t('dialog.delete.message', { name: selectedOrganization?.name || '' })}
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
