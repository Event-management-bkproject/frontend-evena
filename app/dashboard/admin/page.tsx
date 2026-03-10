// app/dashboard/admin/page.tsx
'use client';

import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import RoleGuard from '@/src/components/RoleGuard';

import { CreateCategoryRequest, CreateVenueRequest } from '@/src/stores/types';
import { CategoryResponse, VenueResponse } from '@/src/stores/types/event';
import {
  useCreateCategoryMutation,
  useCreateVenueMutation,
  useDeleteCategoryMutation,
  useDeleteVenueMutation,
  useGetCategoriesQuery,
  useGetVenuesQuery,
  useUpdateCategoryMutation,
  useUpdateVenueMutation,
  useGetOrganizationsQuery,
  useVerifyOrganizationMutation,
  useDeleteOrganizationMutation,
} from '@/src/stores/services';

import CreateCategoryForm from '@/src/components/CreateCategoryForm/CreateCategoryForm';
import CreateVenueFormWithMap from '@/src/components/CreateVenueForm/CreateVenueFormWithMap';
import { useAuth } from '@/src/hooks/auth/useAuth';
import CategoryTable from '@/src/components/CategoryTable';
import VenueTable from '@/src/components/VenueTable';
import { AdminOrganizationTable } from '@/src/components/AdminOrganizationTable';
import {
  AdminHeader,
  AdminStatsCards,
  AdminTabBar,
} from '@/src/components/AdminDashboard';
import { ConfirmationDialog } from '@/src/components/ConfirmationDialog';
import SnackbarNotification from '@/src/components/SnackbarNotification';
import { useSnackbar } from '@/src/hooks/useSnackbar';

export default function AdminPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { logout } = useAuth();
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  // State
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Category Modal state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | undefined>(undefined);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  // Venue Modal state
  const [venueModalOpen, setVenueModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<VenueResponse | undefined>(undefined);
  const [deleteVenueDialogOpen, setDeleteVenueDialogOpen] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState<number | null>(null);

  // Organization Modal state
  const [deleteOrganizationDialogOpen, setDeleteOrganizationDialogOpen] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] = useState<number | null>(null);

  // RTK Queries
  const { data: categoriesData, isLoading: isLoadingCategories } = useGetCategoriesQuery();
  const {
    data: venuesData,
    isLoading: isLoadingVenues,
  } = useGetVenuesQuery({ page: 0, size: 100 });
  const {
    data: organizationsData,
    isLoading: isLoadingOrganizations,
  } = useGetOrganizationsQuery({ page: 0, size: 100 });

  // Mutations
  const [createCategory, { isLoading: isCreatingCategory }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdatingCategory }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeletingCategory }] = useDeleteCategoryMutation();

  const [createVenue, { isLoading: isCreatingVenue }] = useCreateVenueMutation();
  const [updateVenue, { isLoading: isUpdatingVenue }] = useUpdateVenueMutation();
  const [deleteVenue, { isLoading: isDeletingVenue }] = useDeleteVenueMutation();

  const [verifyOrganization, { isLoading: isVerifying }] = useVerifyOrganizationMutation();
  const [deleteOrganization, { isLoading: isDeletingOrganization }] = useDeleteOrganizationMutation();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Category Handlers (follows Organization pattern: conditional rendering + clear state on close)
  const openCreateCategory = () => {
    setEditingCategory(undefined);
    setCategoryModalOpen(true);
  };

  const openEditCategory = (cat: CategoryResponse) => {
    setEditingCategory(cat);
    setCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setCategoryModalOpen(false);
    setEditingCategory(undefined);
  };

  const handleSubmitCategory = async (values: CreateCategoryRequest) => {
    try {
      if (editingCategory) {
        await updateCategory({ id: editingCategory.id, data: values }).unwrap();
        showSnackbar(t('messages.success.updated', { item: t('common.entities.category') }), 'success');
      } else {
        await createCategory(values).unwrap();
        showSnackbar(t('messages.success.created', { item: t('common.entities.category') }), 'success');
      }
      closeCategoryModal();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      showSnackbar(err?.data?.message ?? t('messages.error.operationFailed'), 'error');
    }
  };

  const handleDeleteCategoryClick = (id: number) => {
    setCategoryToDelete(id);
    setDeleteCategoryDialogOpen(true);
  };

  const handleDeleteCategoryConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategory(categoryToDelete).unwrap();
      showSnackbar(t('messages.success.deleted', { item: t('common.entities.category') }), 'success');
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      showSnackbar(err?.data?.message ?? t('messages.error.deleteFailed'), 'error');
    } finally {
      setDeleteCategoryDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  // Venue Handlers (follows Organization pattern: conditional rendering + clear state on close)
  const openCreateVenue = () => {
    setEditingVenue(undefined);
    setVenueModalOpen(true);
  };

  const openEditVenue = (v: VenueResponse) => {
    setEditingVenue(v);
    setVenueModalOpen(true);
  };

  const closeVenueModal = () => {
    setVenueModalOpen(false);
    setEditingVenue(undefined);
  };

  const handleSubmitVenue = async (values: CreateVenueRequest) => {
    try {
      if (editingVenue) {
        await updateVenue({ id: editingVenue.id, data: values }).unwrap();
        showSnackbar(t('messages.success.updated', { item: t('common.entities.venue') }), 'success');
      } else {
        await createVenue(values).unwrap();
        showSnackbar(t('messages.success.created', { item: t('common.entities.venue') }), 'success');
      }
      closeVenueModal();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      showSnackbar(err?.data?.message ?? t('messages.error.operationFailed'), 'error');
    }
  };

  const handleDeleteVenueClick = (id: number) => {
    setVenueToDelete(id);
    setDeleteVenueDialogOpen(true);
  };

  const handleDeleteVenueConfirm = async () => {
    if (!venueToDelete) return;

    try {
      await deleteVenue(venueToDelete).unwrap();
      showSnackbar(t('messages.success.deleted', { item: t('common.entities.venue') }), 'success');
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      showSnackbar(err?.data?.message ?? t('messages.error.deleteFailed'), 'error');
    } finally {
      setDeleteVenueDialogOpen(false);
      setVenueToDelete(null);
    }
  };

  // Organization Handlers
  const handleVerifyOrganization = async (id: number) => {
    try {
      await verifyOrganization(id).unwrap();
      showSnackbar(t('messages.success.verified', { item: t('common.entities.organization') }), 'success');
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      showSnackbar(err?.data?.message ?? t('messages.error.verificationFailed'), 'error');
    }
  };

  const handleDeleteOrganizationClick = (id: number) => {
    setOrganizationToDelete(id);
    setDeleteOrganizationDialogOpen(true);
  };

  const handleDeleteOrganizationConfirm = async () => {
    if (!organizationToDelete) return;

    try {
      await deleteOrganization(organizationToDelete).unwrap();
      showSnackbar(t('messages.success.deleted', { item: t('common.entities.organization') }), 'success');
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      showSnackbar(err?.data?.message ?? t('messages.error.deleteFailed'), 'error');
    } finally {
      setDeleteOrganizationDialogOpen(false);
      setOrganizationToDelete(null);
    }
  };

  const handleTabChange = (tab: number) => {
    setActiveTab(tab);
    setSearchTerm('');
  };

  const handleAddClick = () => {
    if (activeTab === 0) {
      openCreateCategory();
    } else if (activeTab === 1) {
      openCreateVenue();
    }
    // No add action for organizations (tab 2)
  };


  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', p: 3 }}>
        {/* Header */}
        <AdminHeader onLogout={handleLogout} />

        {/* Stats Cards */}
        <AdminStatsCards
          categoriesCount={categoriesData?.data?.length ?? 0}
          venuesCount={venuesData?.data?.totalElements ?? 0}
          organizationsCount={organizationsData?.data?.totalElements ?? 0}
        />

        {/* Tabs and Search Bar */}
        <AdminTabBar
          activeTab={activeTab}
          searchTerm={searchTerm}
          onTabChange={handleTabChange}
          onSearchChange={setSearchTerm}
          onAddClick={handleAddClick}
          showAddButton={activeTab !== 2}
        />

        {/* Category Tab Panel */}
        {activeTab === 0 && (
          <CategoryTable
            categories={categoriesData?.data ?? []}
            isLoading={isLoadingCategories}
            searchTerm={searchTerm}
            isDeletingCategory={isDeletingCategory}
            onEditCategory={openEditCategory}
            onDeleteCategory={handleDeleteCategoryClick}
          />
        )}

        {/* Venue Tab Panel */}
        {activeTab === 1 && (
          <VenueTable
            venues={venuesData?.data?.content ?? []}
            isLoading={isLoadingVenues}
            searchTerm={searchTerm}
            isDeletingVenue={isDeletingVenue}
            onEditVenue={openEditVenue}
            onDeleteVenue={handleDeleteVenueClick}
          />
        )}

        {/* Organization Tab Panel */}
        {activeTab === 2 && (
          <AdminOrganizationTable
            organizations={organizationsData?.data?.content ?? []}
            isLoading={isLoadingOrganizations}
            searchTerm={searchTerm}
            isVerifying={isVerifying}
            onEditOrganization={(org) => {
              // TODO: Implement edit organization if needed
              showSnackbar(t('messages.info.featureComingSoon', { item: t('common.entities.venue') }), 'error');
            }}
            onDeleteOrganization={handleDeleteOrganizationClick}
            onVerifyOrganization={handleVerifyOrganization}
          />
        )}

        {/* Delete Confirmation Dialogs */}
        <ConfirmationDialog
          open={deleteCategoryDialogOpen}
          title={t('dialog.confirmAction')}
          message={t('admin.confirmDelete', { item: t('common.entities.category') })}
          variant="error"
          loading={isDeletingCategory}
          onClose={() => setDeleteCategoryDialogOpen(false)}
          onConfirm={handleDeleteCategoryConfirm}
          confirmText={t('common.buttons.delete')}
          cancelText={t('common.buttons.cancel')}
          disableBackdropClose
        />

        <ConfirmationDialog
          open={deleteVenueDialogOpen}
          title={t('dialog.confirmAction')}
          message={t('admin.confirmDelete', { item: t('common.entities.venue') })}
          variant="error"
          loading={isDeletingVenue}
          onClose={() => setDeleteVenueDialogOpen(false)}
          onConfirm={handleDeleteVenueConfirm}
          confirmText={t('common.buttons.delete')}
          cancelText={t('common.buttons.cancel')}
          disableBackdropClose
        />

        <ConfirmationDialog
          open={deleteOrganizationDialogOpen}
          title={t('dialog.confirmAction')}
          message={t('admin.confirmDeleteWithWarning', { item: t('common.entities.organization') })}
          variant="error"
          loading={isDeletingOrganization}
          onClose={() => setDeleteOrganizationDialogOpen(false)}
          onConfirm={handleDeleteOrganizationConfirm}
          confirmText={t('common.buttons.delete')}
          cancelText={t('common.buttons.cancel')}
          disableBackdropClose
        />

        {/* Category Create Modal */}
        <CreateCategoryForm
          open={categoryModalOpen && !editingCategory}
          onClose={closeCategoryModal}
          onSubmit={handleSubmitCategory}
          loading={isCreatingCategory}
        />

        {/* Category Edit Modal (conditional rendering - unmounts on close, resets hooks) */}
        {editingCategory && (
          <CreateCategoryForm
            open={categoryModalOpen}
            onClose={closeCategoryModal}
            onSubmit={handleSubmitCategory}
            loading={isUpdatingCategory}
            category={editingCategory}
            initialValues={{
              name: editingCategory.name,
              description: editingCategory.description ?? '',
              iconUrl: editingCategory.iconUrl ?? '',
              version: editingCategory.version,
            }}
          />
        )}

        {/* Venue Create Modal */}
        <CreateVenueFormWithMap
          open={venueModalOpen && !editingVenue}
          onClose={closeVenueModal}
          onSubmit={handleSubmitVenue}
          loading={isCreatingVenue}
        />

        {/* Venue Edit Modal (conditional rendering - unmounts on close, resets hooks) */}
        {editingVenue && (
          <CreateVenueFormWithMap
            open={venueModalOpen}
            onClose={closeVenueModal}
            onSubmit={handleSubmitVenue}
            loading={isUpdatingVenue}
            venue={editingVenue}
            initialValues={{
              name: editingVenue.name,
              address: editingVenue.address,
              city: editingVenue.city,
              capacity: editingVenue.capacity,
              description: editingVenue.description ?? '',
              lat: editingVenue.lat,
              lng: editingVenue.lng,
              version: editingVenue.version,
            }}
          />
        )}

        <SnackbarNotification
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={closeSnackbar}
        />
      </Box>
    </RoleGuard>
  );
}
