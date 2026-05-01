'use client';

import { useState } from 'react';
import { EventResponse } from '@/src/stores/types';
import { useParams, useRouter } from 'next/navigation';
import { Box, CircularProgress, Alert } from '@mui/material';
import LayoutWithSidebar from '@/src/components/layout/LayoutWithSidebar';
import DashboardHeader from '@/src/components/DashboardHeader';
import EventContent from '@/src/components/EventContent';
import TicketTypeManagement from '@/src/components/TicketTypeManagement';
import FileUploadManager from '@/src/components/FileUploadManager/FileUploadManager';
import BaseModal from '@/src/components/BaseModal';
import UpdateEventForm from '@/src/components/UpdateEventForm';
import { ConfirmationDialog } from '@/src/components/ConfirmationDialog';
import Snackbar from '@/src/components/SnackBar';
import { useGetEventByIdQuery, useUpdateEventMutation, useDeleteEventMutation } from '@/src/stores/services';
import { useGetCategoriesQuery } from '@/src/stores/services/CategoryApi';
import { useGetVenuesQuery } from '@/src/stores/services/VenueApi';
import { useGetMyOrganizationsQuery } from '@/src/stores/services/OrganizerApi';
import { UpdateEventRequest } from '@/src/stores/types';
import { useTranslation } from 'react-i18next';
export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { t } = useTranslation();

  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventResponse | null>(null); // Snapshot for edit modal
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  const {
    data: eventResponse,
    isLoading,
    error,
    refetch,
  } = useGetEventByIdQuery(eventId, {
    skip: !eventId,
    refetchOnMountOrArgChange: 120, // Refetch if data is older than 120 seconds
    refetchOnFocus: true, // Refetch when window regains focus
  });

  const { data: organizersResponse } = useGetMyOrganizationsQuery();
  const { data: categoriesResponse } = useGetCategoriesQuery();
  const { data: venuesResponse } = useGetVenuesQuery({ page: 0, size: 100 });

  const [updateEvent, { isLoading: updatingEvent }] = useUpdateEventMutation();
  const [deleteEvent, { isLoading: deletingEvent }] = useDeleteEventMutation();

  const event = eventResponse?.data;
  const organizations = organizersResponse?.data || [];
  const categories = categoriesResponse?.data || [];
  const venues = venuesResponse?.data?.content || [];

  const breadcrumbs = [
    { label: t('common.navigation.dashboard'), href: '/dashboard/organizer' },
    { label: t('common.navigation.events'), href: '/dashboard/organizer/events' },
    { label: t('organizer.eventDetails') },
  ];

  const handleEdit = () => {
    setEditingEvent(event || null); // Snapshot current event data (not live query)
    setUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setUpdateModalOpen(false);
    setEditingEvent(null); // Clear snapshot → unmount form → reset hooks
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleUpdateSubmit = async (formData: any) => {
    try {
      const updateData: UpdateEventRequest = {
        title: formData.title,
        description: formData.description,
        startAt: formData.startAt,
        endAt: formData.endAt,
        categoryId: formData.categoryId,
        venueId: formData.venueId,
        coverUrl: formData.coverUrl,
        imageUrls: formData.imageUrls,
        version: formData.version || 0, // Include version for optimistic locking
      };

      await updateEvent({ id: eventId, data: updateData }).unwrap();
      showSnackbar(t('messages.success.updated', { item: t('common.entities.event') }));
      handleCloseUpdateModal();
    } catch (error: any) {
      const errorMessage = error?.data?.message || t('messages.error.operationFailed');
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteEvent(eventId).unwrap();
      setSnackbar({
        open: true,
        message: t('messages.success.deleted', { item: t('common.entities.event') }),
        severity: 'success',
      });
      setDeleteDialogOpen(false);
      router.push('/dashboard/organizer/events');
    } catch (error) {
      setSnackbar({
        open: true,
        message: t('messages.error.updateFailed', { item: t('common.entities.event') }),
        severity: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <LayoutWithSidebar currentPage="events">
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 20px)' }}>
          <Box sx={{ mb: '10px' }}>
            <DashboardHeader title={t('organizer.eventDetails')} breadcrumbs={breadcrumbs} />
          </Box>
          <Box
            sx={{
              flex: 1,
              p: 3,
              overflow: 'auto',
              backgroundColor: '#F7F7F7',
              borderRadius: '20px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <CircularProgress sx={{ color: '#f36bf9' }} />
          </Box>
        </Box>
      </LayoutWithSidebar>
    );
  }

  if (error || !event) {
    return (
      <LayoutWithSidebar currentPage="events">
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 20px)' }}>
          <Box sx={{ mb: '10px' }}>
            <DashboardHeader title={t('organizer.eventDetails')} breadcrumbs={breadcrumbs} />
          </Box>
          <Box sx={{ flex: 1, p: 3, overflow: 'auto', backgroundColor: '#F7F7F7', borderRadius: '20px' }}>
            <Alert severity="error">{error ? t('messages.error.loadFailed', { item: t('common.entities.event') }) : t('messages.error.notFound', { item: t('common.entities.event') })}</Alert>
          </Box>
        </Box>
      </LayoutWithSidebar>
    );
  }

  return (
    <LayoutWithSidebar currentPage="events">
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 20px)' }}>
        <Box sx={{ mb: '10px' }}>
          <DashboardHeader title={event.title} breadcrumbs={breadcrumbs} />
        </Box>

        <Box sx={{ flex: 1, p: 3, overflow: 'auto', backgroundColor: '#F7F7F7', borderRadius: '20px' }}>
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              flexDirection: { xs: 'column', lg: 'row' },
            }}
          >
            {/* Left Side - Event Content */}
            <Box sx={{ flex: { xs: '1 1 100%', lg: 1 }, minWidth: 0 }}>
              <EventContent event={event} onRefresh={refetch} onEdit={handleEdit} onDelete={handleDelete} />
            </Box>

            {/* Right Side - Ticket Type Management + File Manager */}
            <Box sx={{ width: { xs: '100%', lg: '400px' }, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TicketTypeManagement eventId={eventId} event={event} />
              <Box sx={{ backgroundColor: '#fff', borderRadius: '16px', p: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <FileUploadManager mode={{ type: 'event', eventId }} title="Event Documents" />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Update Event Modal (conditional rendering - unmounts on close, resets hooks) */}
      {editingEvent && (
        <BaseModal open={updateModalOpen} onClose={handleCloseUpdateModal} title={t('event.edit')}>
          <UpdateEventForm
            event={editingEvent}
            onSubmit={handleUpdateSubmit}
            onCancel={handleCloseUpdateModal}
            loading={updatingEvent}
            organizers={organizations}
            categories={categories}
            venues={venues}
          />
        </BaseModal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t('event.delete')}
        message={t('dialog.delete.message', { name: event?.title || '' })}
        variant="error"
        loading={deletingEvent}
        confirmText={t('common.buttons.delete')}
        cancelText={t('common.buttons.cancel')}
        disableBackdropClose
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        vertical="top"
        horizontal="right"
      />
    </LayoutWithSidebar>
  );
}
