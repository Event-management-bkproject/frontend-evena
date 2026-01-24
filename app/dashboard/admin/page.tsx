// app/dashboard/admin/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Box, Snackbar, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';
import RoleGuard from '@/src/components/RoleGuard';

import { CreateCategoryRequest, CreateVenueRequest } from '@/src/stores/types';
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
import { useSSE } from '@/src/providers/SSEProvider';
import CategoryTable from '@/src/components/CategoryTable';
import VenueTable from '@/src/components/VenueTable';
import { AdminOrganizationTable } from '@/src/components/AdminOrganizationTable';
import {
  AdminHeader,
  AdminStatsCards,
  AdminTabBar,
  AdminDeleteDialog,
  AdminFormDialog,
} from '@/src/components/AdminDashboard';

export default function AdminPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { lastEvent } = useSSE();

  // State
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Category Modal state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | undefined>(undefined);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  // Venue Modal state
  const [venueModalOpen, setVenueModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<any | undefined>(undefined);
  const [deleteVenueDialogOpen, setDeleteVenueDialogOpen] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState<number | null>(null);

  // Organization Modal state
  const [deleteOrganizationDialogOpen, setDeleteOrganizationDialogOpen] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] = useState<number | null>(null);

  // RTK Queries
  const { data: categoriesData, refetch: refetchCategories, isLoading: isLoadingCategories } = useGetCategoriesQuery();
  const {
    data: venuesData,
    refetch: refetchVenues,
    isLoading: isLoadingVenues,
  } = useGetVenuesQuery({ page: 0, size: 100 });
  const {
    data: organizationsData,
    refetch: refetchOrganizations,
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

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };


  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Category Handlers
  const openCreateCategory = () => {
    setEditingCategory(undefined);
    setCategoryModalOpen(true);
  };

  const openEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setEditingCategory(undefined);
    setCategoryModalOpen(false);
  };

  const handleSubmitCategory = async (values: CreateCategoryRequest) => {
    try {
      if (editingCategory) {
        await updateCategory({ id: editingCategory.id, data: values }).unwrap();
        showSnackbar('Category updated successfully');
      } else {
        await createCategory(values).unwrap();
        showSnackbar('Category created successfully');
      }
      refetchCategories();
      closeCategoryModal();
    } catch (error: any) {
      showSnackbar(error?.data?.message || 'Operation failed', 'error');
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
      showSnackbar('Category deleted successfully');
      refetchCategories();
    } catch (error: any) {
      showSnackbar(error?.data?.message || 'Delete failed', 'error');
    } finally {
      setDeleteCategoryDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  // Venue Handlers
  const openCreateVenue = () => {
    setEditingVenue(undefined);
    setVenueModalOpen(true);
  };

  const openEditVenue = (v: any) => {
    setEditingVenue(v);
    setVenueModalOpen(true);
  };

  const closeVenueModal = () => {
    setEditingVenue(undefined);
    setVenueModalOpen(false);
  };

  const handleSubmitVenue = async (values: CreateVenueRequest) => {
    try {
      if (editingVenue) {
        await updateVenue({ id: editingVenue.id, data: values }).unwrap();
        showSnackbar('Venue updated successfully');
      } else {
        await createVenue(values).unwrap();
        showSnackbar('Venue created successfully');
      }
      refetchVenues();
      closeVenueModal();
    } catch (error: any) {
      showSnackbar(error?.data?.message || 'Operation failed', 'error');
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
      showSnackbar('Venue deleted successfully');
      refetchVenues();
    } catch (error: any) {
      showSnackbar(error?.data?.message || 'Delete failed', 'error');
    } finally {
      setDeleteVenueDialogOpen(false);
      setVenueToDelete(null);
    }
  };

  // Organization Handlers
  const handleVerifyOrganization = async (id: number) => {
    try {
      await verifyOrganization(id).unwrap();
      showSnackbar('Organization verified successfully');
      refetchOrganizations();
    } catch (error: any) {
      showSnackbar(error?.data?.message || 'Verification failed', 'error');
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
      showSnackbar('Organization deleted successfully');
      refetchOrganizations();
    } catch (error: any) {
      showSnackbar(error?.data?.message || 'Delete failed', 'error');
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


// Listen to SSE events from SSEProvider
  useEffect(() => {
    if (!lastEvent) return;

    console.log('📨 [Admin] Received SSE event:', lastEvent.type);

    // Handle organization events
    switch (lastEvent.type) {
      case 'ORGANIZATION_CREATED':
      case 'ORGANIZATION_UPDATED':
      case 'ORGANIZATION_VERIFIED':
      case 'ORGANIZATION_UNVERIFIED':
      case 'ORGANIZATION_DELETED':
        console.log('🔄 [Admin] Refetching organizations...');
        refetchOrganizations();
        break;
      default:
        break;
    }
  }, [lastEvent, refetchOrganizations]);

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      {/* <SSESync /> */}
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', p: 3 }}>
        {/* Header */}
        <AdminHeader onLogout={handleLogout} />

        {/* Stats Cards */}
        <AdminStatsCards
          categoriesCount={categoriesData?.data?.length || 0}
          venuesCount={venuesData?.data?.totalElements || 0}
          organizationsCount={organizationsData?.data?.totalElements || 0}
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
            categories={categoriesData?.data || []}
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
            venues={venuesData?.data?.content || []}
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
            organizations={organizationsData?.data?.content || []}
            isLoading={isLoadingOrganizations}
            searchTerm={searchTerm}
            isVerifying={isVerifying}
            onEditOrganization={(org) => {
              // TODO: Implement edit organization if needed
              showSnackbar('Edit organization feature coming soon', 'error');
            }}
            onDeleteOrganization={handleDeleteOrganizationClick}
            onVerifyOrganization={handleVerifyOrganization}
          />
        )}

        {/* Delete Confirmation Dialogs */}
        <AdminDeleteDialog
          open={deleteCategoryDialogOpen}
          title="Confirm Delete"
          message="Are you sure you want to delete this category? This action cannot be undone."
          isDeleting={isDeletingCategory}
          onClose={() => setDeleteCategoryDialogOpen(false)}
          onConfirm={handleDeleteCategoryConfirm}
        />

        <AdminDeleteDialog
          open={deleteVenueDialogOpen}
          title="Confirm Delete"
          message="Are you sure you want to delete this venue? This action cannot be undone."
          isDeleting={isDeletingVenue}
          onClose={() => setDeleteVenueDialogOpen(false)}
          onConfirm={handleDeleteVenueConfirm}
        />

        <AdminDeleteDialog
          open={deleteOrganizationDialogOpen}
          title="Confirm Delete"
          message="Are you sure you want to delete this organization? This action cannot be undone and will affect all associated events."
          isDeleting={isDeletingOrganization}
          onClose={() => setDeleteOrganizationDialogOpen(false)}
          onConfirm={handleDeleteOrganizationConfirm}
        />

        {/* Category Modal */}
        {categoryModalOpen && (
          <AdminFormDialog
            open={categoryModalOpen}
            title={editingCategory ? 'Edit Category' : 'Create New Category'}
            onClose={closeCategoryModal}
            maxWidth="sm"
          >
            <CreateCategoryForm
              open={categoryModalOpen}
              onClose={closeCategoryModal}
              onSubmit={handleSubmitCategory}
              loading={isCreatingCategory || isUpdatingCategory}
              initialValues={
                editingCategory
                  ? {
                      name: editingCategory.name,
                      description: editingCategory.description || '',
                      iconUrl: editingCategory.iconUrl || '',
                    }
                  : undefined
              }
            />
          </AdminFormDialog>
        )}

        {/* Venue Modal with Map */}
        <CreateVenueFormWithMap
          open={venueModalOpen}
          onClose={closeVenueModal}
          onSubmit={handleSubmitVenue}
          loading={isCreatingVenue || isUpdatingVenue}
          initialValues={
            editingVenue
              ? {
                  name: editingVenue.name,
                  address: editingVenue.address,
                  city: editingVenue.city,
                  capacity: editingVenue.capacity,
                  description: editingVenue.description || '',
                  lat: editingVenue.lat,
                  lng: editingVenue.lng,
                }
              : undefined
          }
        />

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </RoleGuard>
  );
}
