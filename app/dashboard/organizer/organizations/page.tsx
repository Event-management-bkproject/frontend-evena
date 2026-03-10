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
import { UpdateOrganizationRequest } from '@/src/stores/types';
import UpdateOrganizationForm from '@/src/components/UpdateOrganizationForm';
import { ConfirmationDialog } from '@/src/components/ConfirmationDialog';
import DashboardHeader from '@/src/components/DashboardHeader';
import OrganizationFilters from '@/src/components/OrganizationFilters';
import SnackbarNotification from '@/src/components/SnackbarNotification';
import { OrganizationResponse } from '@/src/stores/types';
import LayoutWithSidebar from '@/src/components/layout/LayoutWithSidebar';
import { OrganizationRowList } from '@/src/components/OrganizationCard/OrganizationRowList';
import InviteMemberModal from '@/src/components/InviteMemberModal';
import MemberManagementModal from '@/src/components/MemberManagementModal';
import { OrganizationRole } from '@/src/stores/types/enums';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '@/src/hooks/useSnackbar';
import { BRAND } from '@/src/utils/constants/constant';

export default function OrganizationsPage() {
  const { auth } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<OrganizationResponse | null>(null);

  // Filters state
  const [searchKeyword, setSearchKeyword] = useState('');

  // Queries
  const {
    data: organizersResponse,
    isLoading: loadingOrganizers,
    error: organizersError,
  } = useGetMyOrganizationsQuery(undefined, {
    skip: !auth.accessToken,
  });

  // Mutations
  const [createOrganization, { isLoading: creatingOrganization }] = useCreateOrganizationMutation();
  const [updateOrganization, { isLoading: updatingOrganization }] = useUpdateOrganizationMutation();
  const [deleteOrganization, { isLoading: deletingOrganization }] = useDeleteOrganizationMutation();
  const [inviteMember, { isLoading: invitingMember }] = useInviteMemberMutation();

  // Data processing
  const organizations: OrganizationResponse[] = organizersResponse?.data ?? [];

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
      showSnackbar(t('messages.success.created', { item: t('common.entities.organization') }), 'success');
      setCreateModalOpen(false);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      showSnackbar(err?.data?.message ?? t('messages.error.updateFailed', { item: t('common.entities.organization') }), 'error');
    }
  };

  const handleUpdateOrganization = async (formData: UpdateOrganizationRequest) => {
    if (!selectedOrganization) return;

    try {
      await updateOrganization({ id: selectedOrganization.id, data: formData }).unwrap();
      showSnackbar(t('messages.success.updated', { item: t('common.entities.organization') }), 'success');
      setUpdateModalOpen(false);
      setSelectedOrganization(null);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      const errorMessage = err?.data?.message ?? t('messages.error.updateFailed', { item: t('common.entities.organization') });

      // Check for version conflict error (optimistic locking)
      if (errorMessage.includes('has been modified by another user')) {
        showSnackbar(t('messages.error.conflictUpdate', { item: t('common.entities.organization') }), 'error');
        setUpdateModalOpen(false);
        setSelectedOrganization(null);
      } else {
        showSnackbar(errorMessage, 'error');
      }
    }
  };

  const handleDeleteOrganization = async () => {
    if (!selectedOrganization) return;

    try {
      await deleteOrganization(selectedOrganization.id).unwrap();
      showSnackbar(t('messages.success.deleted', { item: t('common.entities.organization') }), 'success');
      setDeleteDialogOpen(false);
      setSelectedOrganization(null);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string; error?: string }; message?: string };
      const errorMessage = err?.data?.message ?? err?.data?.error ?? err?.message ?? t('messages.error.deleteFailed');
      showSnackbar(errorMessage, 'error');
      setDeleteDialogOpen(false);
    }
  };

  const handleOrganizationEdit = (organization: OrganizationResponse) => {
    if (organization.verified) {
      showSnackbar(t('messages.error.verifiedOrgCannotEdit'), 'error');
      return;
    }
    setSelectedOrganization(organization);
    setUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setUpdateModalOpen(false);
    setSelectedOrganization(null);
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
    if (!selectedOrganization) return;

    // Client-side validation: prevent inviting yourself
    if (auth?.user?.email && email.toLowerCase() === auth.user.email.toLowerCase()) {
      showSnackbar(t('messages.error.cannotInviteSelf'), 'error');
      throw new Error('Cannot invite yourself');
    }

    try {
      await inviteMember({
        organizationId: selectedOrganization.id,
        data: { email, role },
      }).unwrap();

      showSnackbar(t('messages.success.invitationSent', { email }), 'success');
      setInviteModalOpen(false);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string }; message?: string };
      const errorMessage = err?.data?.message ?? err?.message ?? t('messages.error.invitationFailed');
      showSnackbar(errorMessage, 'error');
      throw error; // Re-throw to let InviteMemberModal handle it
    }
  };

  return (
    <ProtectedContent>
      <LayoutWithSidebar currentPage="organizations">
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 20px)' }}>
          {/* Header */}
          <Box sx={{ mb: '10px' }}>
            <DashboardHeader
              title={t('common.navigation.organizations')}
              breadcrumbs={[{ label: t('common.navigation.dashboard'), href: '/dashboard/organizer' }, { label: t('common.navigation.organizations') }]}
              userName={auth.user?.name ?? 'User'}
            />
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, p: 3, overflow: 'hidden', backgroundColor: BRAND.bgSection, borderRadius: '20px', display: 'flex', flexDirection: 'column' }}>
            {/* Filters */}
            <OrganizationFilters
              onSearch={setSearchKeyword}
              onCreateClick={() => setCreateModalOpen(true)}
              organizations={organizations}
              loading={loadingOrganizers}
            />

            {/* Error Display */}
            {organizersError && (
              <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1, color: 'error.contrastText' }}>
                {(organizersError as { data?: { message?: string } })?.data?.message ?? t('messages.error.operationFailed')}
              </Box>
            )}

            {/* Organizations List — only this part scrolls */}
            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
              <OrganizationRowList
                organizations={filteredOrganizations}
                onEdit={handleOrganizationEdit}
                onDelete={handleOrganizationDelete}
                onManageMembers={handleManageMembers}
                onClick={handleOrganizationClick}
                loading={loadingOrganizers}
              />
            </Box>
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
        <ConfirmationDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteOrganization}
          title={`${t('common.buttons.delete')} ${t('common.entities.organization')}`}
          message={t('dialog.delete.message', { name: selectedOrganization?.name ?? '' })}
          variant="error"
          loading={deletingOrganization}
          confirmText={t('common.buttons.delete')}
          cancelText={t('common.buttons.cancel')}
          disableBackdropClose
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

        <SnackbarNotification
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={closeSnackbar}
        />
      </LayoutWithSidebar>
    </ProtectedContent>
  );
}
