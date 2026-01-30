'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, CircularProgress, Alert } from '@mui/material';
import LayoutWithSidebar from '@/src/components/layout/LayoutWithSidebar';
import DashboardHeader from '@/src/components/DashboardHeader';
import EventContent from '@/src/components/EventContent';
import TicketTypeManagement from '@/src/components/TicketTypeManagement';
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
import { useSSE } from '@/src/providers/SSEProvider';

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { t } = useTranslation();

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

  // Listen to SSE events for real-time updates
  const { lastEvent } = useSSE();
  const refetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced refetch to prevent API spam from rapid SSE events
  const debouncedRefetch = useCallback(() => {
    if (refetchTimeoutRef.current) {
      clearTimeout(refetchTimeoutRef.current);
    }
    refetchTimeoutRef.current = setTimeout(() => {
      console.log('🔄 [EventDetailsPage] Refetching event (SSE triggered)...');
      refetch();
      refetchTimeoutRef.current = null;
    }, 500);
  }, [refetch]);

  useEffect(() => {
    if (!lastEvent) return;

    const eventData = lastEvent.data;
    const affectsThisEvent =
      eventData?.eventId === eventId ||
      eventData?.eventId?.toString() === eventId;

    // Refetch on relevant SSE events
    switch (lastEvent.type) {
      case 'EVENT_UPDATED':
      case 'EVENT_PUBLISHED':
      case 'EVENT_CANCELLED':
        if (affectsThisEvent) {
          console.log('📨 [EventDetailsPage] SSE event affects this event:', lastEvent.type);
          debouncedRefetch();
        }
        break;
      case 'TICKET_TYPE_CREATED':
      case 'TICKET_TYPE_UPDATED':
      case 'TICKET_TYPE_DELETED':
      case 'TICKET_TYPE_DEACTIVATED':
        if (affectsThisEvent) {
          console.log('📨 [EventDetailsPage] SSE ticket type event:', lastEvent.type);
          debouncedRefetch();
        }
        break;
      default:
        break;
    }
  }, [lastEvent, eventId, debouncedRefetch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
      }
    };
  }, []);

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
        message: t('messages.success.updated', { item: t('common.entities.event') }),
        severity: 'success',
      });
      setUpdateModalOpen(false);
      refetch();
    } catch (error) {
      setSnackbar({
        open: true,
        message: t('messages.error.updateFailed', { item: t('common.entities.event') }),
        severity: 'error',
      });
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
      <BaseModal open={updateModalOpen} onClose={() => setUpdateModalOpen(false)} title={t('event.edit')}>
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
