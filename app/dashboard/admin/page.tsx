// app/dashboard/admin/page.tsx
'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Place as PlaceIcon,
  Category as CategoryIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

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
} from '@/src/stores/services';

import CreateCategoryForm from '@/src/components/CreateCategoryForm/CreateCategoryForm';
import CreateVenueForm from '@/src/components/CreateVenueForm/CreateVenueForm';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '@/src/hook/useAuth';
import CategoryTable from '@/src/components/CategoryTable';
import VenueTable from '@/src/components/VenueTable';

export default function AdminPage() {
  const router = useRouter();
  const { logout } = useAuth();

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

  // RTK Queries
  const { data: categoriesData, refetch: refetchCategories, isLoading: isLoadingCategories } = useGetCategoriesQuery();
  const {
    data: venuesData,
    refetch: refetchVenues,
    isLoading: isLoadingVenues,
  } = useGetVenuesQuery({ page: 0, size: 100 });

  // Mutations
  const [createCategory, { isLoading: isCreatingCategory }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdatingCategory }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeletingCategory }] = useDeleteCategoryMutation();

  const [createVenue, { isLoading: isCreatingVenue }] = useCreateVenueMutation();
  const [updateVenue, { isLoading: isUpdatingVenue }] = useUpdateVenueMutation();
  const [deleteVenue, { isLoading: isDeletingVenue }] = useDeleteVenueMutation();

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

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="#2A3363" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage categories and venues for the platform
          </Typography>
        </Box>

        <Box>
          <Button
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            variant="outlined"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              color: '#36437C',
              borderColor: '#C5CBDC',
              '&:hover': { backgroundColor: '#F3F4F8' },
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        <Box>
          <Card sx={{ bgcolor: '#2A3363', color: 'white' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <CategoryIcon fontSize="large" />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {categoriesData?.data?.length || 0}
                  </Typography>
                  <Typography variant="body2">Total Categories</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
        <Box>
          <Card sx={{ bgcolor: '#F36BF9', color: 'white' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <PlaceIcon fontSize="large" />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {venuesData?.data?.totalElements || 0}
                  </Typography>
                  <Typography variant="body2">Total Venues</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Tabs and Search Bar */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Button
              variant={activeTab === 0 ? 'contained' : 'text'}
              onClick={() => setActiveTab(0)}
              sx={{
                mr: 2,
                bgcolor: activeTab === 0 ? '#F36BF9' : undefined,
                color: activeTab === 0 ? '#FFFFFF' : '#2A3363',
                '&:hover': {
                  bgcolor: activeTab === 0 ? '#F36BF9' : 'rgba(0,0,0,0.04)',
                },
              }}
              startIcon={<CategoryIcon />}
            >
              Categories
            </Button>
            <Button
              variant={activeTab === 1 ? 'contained' : 'text'}
              onClick={() => setActiveTab(1)}
              sx={{
                bgcolor: activeTab === 1 ? '#F36BF9' : undefined,
                color: activeTab === 1 ? '#FFFFFF' : '#2A3363',
                '&:hover': {
                  bgcolor: activeTab === 1 ? '#F36BF9' : 'rgba(0,0,0,0.04)',
                },
              }}
              startIcon={<PlaceIcon />}
            >
              Venues
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
              sx={{ width: { xs: '100%', sm: 250 } }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => (activeTab === 0 ? openCreateCategory() : openCreateVenue())}
              sx={{
                bgcolor: '#F36BF9',
                '&:hover': { bgcolor: '#e055e9' },
              }}
            >
              Add {activeTab === 0 ? 'Category' : 'Venue'}
            </Button>
          </Box>
        </Box>
      </Paper>

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

      {/* Delete Confirmation Dialogs */}
      <Dialog open={deleteCategoryDialogOpen} onClose={() => setDeleteCategoryDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this category? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteCategoryDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteCategoryConfirm} color="error" variant="contained" disabled={isDeletingCategory}>
            {isDeletingCategory ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteVenueDialogOpen} onClose={() => setDeleteVenueDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this venue? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteVenueDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteVenueConfirm} color="error" variant="contained" disabled={isDeletingVenue}>
            {isDeletingVenue ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Category Modal */}
      {categoryModalOpen && (
        <Dialog open={categoryModalOpen} onClose={closeCategoryModal} maxWidth="sm" fullWidth>
          <DialogTitle>{editingCategory ? 'Edit Category' : 'Create New Category'}</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
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
            </Box>
          </DialogContent>
        </Dialog>
      )}

      {/* Venue Modal */}
      {venueModalOpen && (
        <Dialog open={venueModalOpen} onClose={closeVenueModal} maxWidth="md" fullWidth>
          <DialogTitle>{editingVenue ? 'Edit Venue' : 'Create New Venue'}</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <CreateVenueForm
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
            </Box>
          </DialogContent>
        </Dialog>
      )}

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
  );
}
