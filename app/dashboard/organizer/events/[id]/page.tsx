'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, CircularProgress, Alert } from '@mui/material';
import LayoutWithSidebar from '@/src/components/layout/LayoutWithSidebar';
import DashboardHeader from '@/src/components/DashboardHeader';
import EventContent from '@/src/components/EventContent';
import TicketTypeManagement from '@/src/components/TicketTypeManagement';
import BaseModal from '@/src/components/BaseModal';
import UpdateEventForm from '@/src/components/UpdateEventForm';
import DeleteConfirmDialog from '@/src/components/DeleteConfirmDialog';
import Snackbar from '@/src/components/SnackBar';
import { useGetEventByIdQuery, useUpdateEventMutation, useDeleteEventMutation } from '@/src/stores/services';
import { useGetCategoriesQuery } from '@/src/stores/services/CategoryApi';
import { useGetVenuesQuery } from '@/src/stores/services/VenueApi';
import { useGetMyOrganizationsQuery } from '@/src/stores/services/OrganizerApi';
import { UpdateEventRequest } from '@/src/stores/types';

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [updateModalOpen, setUpdateModalOpen] = useState(false);
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
    refetchOnMountOrArgChange: 30, // Refetch if data is older than 30 seconds
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
    { label: 'Dashboard', href: '/dashboard/organizer' },
    { label: 'Events', href: '/dashboard/organizer/events' },
    { label: 'Event Details' },
  ];

  const handleEdit = () => {
    setUpdateModalOpen(true);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
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
      };

      await updateEvent({ id: eventId, data: updateData }).unwrap();
      setSnackbar({
        open: true,
        message: 'Event updated successfully!',
        severity: 'success',
      });
      setUpdateModalOpen(false);
      refetch();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update event. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteEvent(eventId).unwrap();
      setSnackbar({
        open: true,
        message: 'Event deleted successfully!',
        severity: 'success',
      });
      setDeleteDialogOpen(false);
      router.push('/dashboard/organizer/events');
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete event. Please try again.',
        severity: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <LayoutWithSidebar currentPage="events">
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 20px)' }}>
          <Box sx={{ mb: '10px' }}>
            <DashboardHeader title="Event Details" breadcrumbs={breadcrumbs} />
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
            <DashboardHeader title="Event Details" breadcrumbs={breadcrumbs} />
          </Box>
          <Box sx={{ flex: 1, p: 3, overflow: 'auto', backgroundColor: '#F7F7F7', borderRadius: '20px' }}>
            <Alert severity="error">{error ? 'Failed to load event details' : 'Event not found'}</Alert>
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
            <Box sx={{ flex: { xs: '1 1 100%', lg: 1 } }}>
              <EventContent event={event} onRefresh={refetch} onEdit={handleEdit} onDelete={handleDelete} />
            </Box>

            {/* Right Side - Ticket Type Management - Fixed Width */}
            <Box sx={{ width: { xs: '100%', lg: '550px' }, flexShrink: 0 }}>
              <TicketTypeManagement eventId={eventId} event={event} onEventUpdate={refetch} />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Update Event Modal */}
      <BaseModal open={updateModalOpen} onClose={() => setUpdateModalOpen(false)} title="Edit Event">
        <UpdateEventForm
          event={event}
          onSubmit={handleUpdateSubmit}
          onCancel={() => setUpdateModalOpen(false)}
          loading={updatingEvent}
          organizers={organizations}
          categories={categories}
          venues={venues}
        />
      </BaseModal>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Event"
        message={`Are you sure you want to delete "${event?.title}"? This action cannot be undone.`}
        loading={deletingEvent}
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
