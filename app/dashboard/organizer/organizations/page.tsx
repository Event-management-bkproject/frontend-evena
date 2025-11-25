// app/organizations/page.tsx
'use client';

import { useAuth } from '@/src/hook/useAuth';
import { useCreateOrganizationMutation, useGetMyOrganizationsQuery } from '@/src/stores/services/OrganizerApi';
import React, { useState } from 'react';
import ProtectedContent from '@/src/components/ProtectedContent';
import { Button, Box } from '@mui/material';
import { Add } from '@mui/icons-material';
import BaseModal from '@/src/components/BaseModal';
import CreateOrganizationForm, {
  OrganizationFormData,
} from '@/src/components/CreateOrganisationForm/CreateOrganisationForm';
import { OrganizationResponse } from '@/src/stores/types';
import LayoutWithSidebar from '@/src/components/layout/LayoutWithSidebar';
import OrganizationGrid from '@/src/components/OrganizationCard/OrganizationGrid';
import Snackbar from '@/src/components/SnackBar';

export default function OrganizationsPage() {
  const { auth } = useAuth();
  const [organizationModalOpen, setOrganizationModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  const {
    data: organizersResponse,
    isLoading: loadingOrganizers,
    error: organizersError,
    refetch: refetchOrganizers,
  } = useGetMyOrganizationsQuery(undefined, {
    skip: !auth.accessToken,
  });

  const [createOrganizer, { isLoading: creatingOrganizer }] = useCreateOrganizationMutation();

  const handleCreateOrganization = async (formData: OrganizationFormData) => {
    try {
      const response = await createOrganizer(formData).unwrap();

      setSnackbar({
        open: true,
        message: 'Organization created successfully!',
        severity: 'success',
      });
      setOrganizationModalOpen(false);

      // Refetch organizations sau khi tạo mới
      refetchOrganizers();
    } catch (error: any) {
      console.error('Error creating organization:', error);

      setSnackbar({
        open: true,
        message: error?.data?.message || 'Failed to create organization. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleOrganizationClick = (org: OrganizationResponse) => {
    // Có thể điều hướng đến trang chi tiết organization
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const organizations: OrganizationResponse[] = organizersResponse?.data || [];

  return (
    <ProtectedContent fallback={<div className="p-6">Initializing authentication...</div>}>
      <LayoutWithSidebar title="Organizations" currentPage="organizations">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Organizations</h1>
              <p className="text-gray-600 mt-2">Manage your organizations and create new ones to host events</p>
            </div>
            <Box display="flex">
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOrganizationModalOpen(true)}
                disabled={loadingOrganizers}
                sx={{
                  backgroundColor: '#f36bf9',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  '&:hover': { backgroundColor: '#e55ae0' },
                  '&:disabled': {
                    backgroundColor: '#ccc',
                  },
                }}
              >
                Create Organization
              </Button>
            </Box>
          </div>

          {/* Error Display */}
          {organizersError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-red-800 font-semibold">Error loading organizations:</h3>
              <p className="text-red-600">{(organizersError as any)?.data?.message || 'Unknown error occurred'}</p>
            </div>
          )}

          {/* Organizations Grid */}
          <section className="mb-8">
            <OrganizationGrid
              organizations={organizations}
              onCardClick={handleOrganizationClick}
              loading={loadingOrganizers}
            />
          </section>

          {/* Stats */}
          {/* {organizations.length > 0 && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-2xl font-bold text-blue-600">{organizations.length}</div>
                  <div className="text-gray-600">Total Organizations</div>
                </div>
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-2xl font-bold text-green-600">
                    {organizations.filter((org) => org.verified).length}
                  </div>
                  <div className="text-gray-600">Verified</div>
                </div>
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-2xl font-bold text-purple-600">
                    {organizations.reduce((total, org) => total + (org.totalEvents || 0), 0)}
                  </div>
                  <div className="text-gray-600">Total Events</div>
                </div>
              </div>
            </div>
          )} */}

          {/* Create Organization Modal */}
          <BaseModal
            open={organizationModalOpen}
            onClose={() => setOrganizationModalOpen(false)}
            title="Create New Organization"
            maxWidth="md"
          >
            <CreateOrganizationForm
              onSubmit={handleCreateOrganization}
              onCancel={() => setOrganizationModalOpen(false)}
              loading={creatingOrganizer}
            />
          </BaseModal>

          {/* Snackbar */}
          <Snackbar
            open={snackbar.open}
            message={snackbar.message}
            severity={snackbar.severity}
            onClose={handleCloseSnackbar}
            vertical="bottom"
            horizontal="right"
          />
        </div>
      </LayoutWithSidebar>
    </ProtectedContent>
  );
}
