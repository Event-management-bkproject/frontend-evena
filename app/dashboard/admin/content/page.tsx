'use client';

import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import RoleGuard from '@/src/components/RoleGuard';
import AdminLayout from '@/src/components/layout/AdminLayout';
import AdminPageShell from '@/src/components/AdminSidebar/AdminPageShell';
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
} from '@/src/stores/services';
import CreateCategoryForm from '@/src/components/CreateCategoryForm/CreateCategoryForm';
import CreateVenueFormWithMap from '@/src/components/CreateVenueForm/CreateVenueFormWithMap';
import CategoryTable from '@/src/components/CategoryTable';
import VenueTable from '@/src/components/VenueTable';
import { AdminTabBar } from '@/src/components/AdminDashboard';
import { ConfirmationDialog } from '@/src/components/ConfirmationDialog';
import SnackbarNotification from '@/src/components/SnackbarNotification';
import { useSnackbar } from '@/src/hooks/useSnackbar';

export default function AdminContentPage() {
  const { t } = useTranslation();
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | undefined>(undefined);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  const [venueModalOpen, setVenueModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<VenueResponse | undefined>(undefined);
  const [deleteVenueDialogOpen, setDeleteVenueDialogOpen] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState<number | null>(null);

  const { data: categoriesData, isLoading: isLoadingCategories } = useGetCategoriesQuery();
  const { data: venuesData, isLoading: isLoadingVenues } = useGetVenuesQuery({ page: 0, size: 100 });

  const [createCategory, { isLoading: isCreatingCategory }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdatingCategory }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeletingCategory }] = useDeleteCategoryMutation();

  const [createVenue, { isLoading: isCreatingVenue }] = useCreateVenueMutation();
  const [updateVenue, { isLoading: isUpdatingVenue }] = useUpdateVenueMutation();
  const [deleteVenue, { isLoading: isDeletingVenue }] = useDeleteVenueMutation();

  const breadcrumbs = [
    { label: 'Admin', href: '/dashboard/admin' },
    { label: 'Content' },
  ];

  const openCreateCategory = () => { setEditingCategory(undefined); setCategoryModalOpen(true); };
  const openEditCategory = (cat: CategoryResponse) => { setEditingCategory(cat); setCategoryModalOpen(true); };
  const closeCategoryModal = () => { setCategoryModalOpen(false); setEditingCategory(undefined); };

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

  const handleDeleteCategoryClick = (id: number) => { setCategoryToDelete(id); setDeleteCategoryDialogOpen(true); };

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

  const openCreateVenue = () => { setEditingVenue(undefined); setVenueModalOpen(true); };
  const openEditVenue = (v: VenueResponse) => { setEditingVenue(v); setVenueModalOpen(true); };
  const closeVenueModal = () => { setVenueModalOpen(false); setEditingVenue(undefined); };

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

  const handleDeleteVenueClick = (id: number) => { setVenueToDelete(id); setDeleteVenueDialogOpen(true); };

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

  const handleTabChange = (tab: number) => { setActiveTab(tab); setSearchTerm(''); };
  const handleAddClick = () => {
    if (activeTab === 0) openCreateCategory();
    else if (activeTab === 1) openCreateVenue();
  };

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <AdminLayout>
        <AdminPageShell
          title="Content Management"
          breadcrumbs={breadcrumbs}
        >
          <Box>
            <AdminTabBar
              activeTab={activeTab}
              searchTerm={searchTerm}
              onTabChange={handleTabChange}
              onSearchChange={setSearchTerm}
              onAddClick={handleAddClick}
              showAddButton
            />

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
          </Box>
        </AdminPageShell>

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

        <CreateCategoryForm
          open={categoryModalOpen && !editingCategory}
          onClose={closeCategoryModal}
          onSubmit={handleSubmitCategory}
          loading={isCreatingCategory}
        />

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

        <CreateVenueFormWithMap
          open={venueModalOpen && !editingVenue}
          onClose={closeVenueModal}
          onSubmit={handleSubmitVenue}
          loading={isCreatingVenue}
        />

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
      </AdminLayout>
    </RoleGuard>
  );
}
