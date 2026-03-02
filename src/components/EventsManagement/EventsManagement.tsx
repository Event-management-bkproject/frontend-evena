'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/src/stores/hooks';
import { openModal, closeModal, setEventFilter } from '@/src/stores/slices/uiSlice';
import {
  useGetMyEventsQuery,
  useGetEventByIdQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} from '@/src/stores/services/EventApi';
import { useGetMyOrganizationsQuery } from '@/src/stores/services/OrganizerApi';
import BaseModal from '../BaseModal';
import CreateEventForm from '../CreateEventForm/CreateEventForm';
import UpdateEventForm from '../UpdateEventForm';
import { ConfirmationDialog } from '../ConfirmationDialog';
import DashboardHeader from '../DashboardHeader';
import EventFilters from '../EventFilters';
import Snackbar from '../SnackBar';
import { EventRowList } from '../EventCard';
import {
  CategoryResponse,
  EventListResponse,
  EventResponse,
  OrganizationResponse,
  VenueResponse,
  UpdateEventRequest,
} from '@/src/stores/types';
import { EventFormData } from '../CreateEventForm/types';
interface EventsManagementProps {
  initialCategories: CategoryResponse[];
  initialVenues: VenueResponse[];
  userName: string;
}

export default function EventsManagement({
  initialCategories,
  initialVenues,
  userName,
}: EventsManagementProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // ========== UI STATE từ Redux ==========
  const { modals, selectedItemId, eventFilters } = useAppSelector((state) => state.ui);

  // ========== SERVER STATE từ RTK Query ==========
  // Organizations từ RTK Query (cần auth)
  const { data: organizationsResponse, isLoading: loadingOrganizations } = useGetMyOrganizationsQuery();
  const initialOrganizations = organizationsResponse?.data || [];

  // ========== LOCAL STATE ==========
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<import('@/src/stores/types/enums').EventStatus | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventResponse | null>(null); // Snapshot for edit modal

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // ========== SERVER STATE từ RTK Query ==========
  // Use /events/my-events API to get only organizer's events
  const {
    data: eventsResponse,
    isLoading: loadingEvents,
  } = useGetMyEventsQuery(
    {
      page: 0,
      size: 50,
    },
    {
      // SSEProvider handles real-time cache invalidation via tag system
    }
  );

  // Fetch full event details khi editing
  const { data: fullEventResponse } = useGetEventByIdQuery(selectedItemId as string, {
    skip: !selectedItemId || !modals.updateEvent,
  });

  // ========== MUTATIONS ==========
  const [createEvent, { isLoading: creatingEvent }] = useCreateEventMutation();
  const [updateEvent, { isLoading: updatingEvent }] = useUpdateEventMutation();
  const [deleteEvent, { isLoading: deletingEvent }] = useDeleteEventMutation();

  // ========== DATA PROCESSING ==========
  const events: EventListResponse[] = eventsResponse?.data?.content || [];
  const fullEvent = fullEventResponse?.data;

  // Store snapshot of fullEvent when it loads (for edit modal - not affected by SSE refetch)
  useEffect(() => {
    if (fullEvent && modals.updateEvent && !editingEvent) {
      setEditingEvent(fullEvent);
    }
  }, [fullEvent, modals.updateEvent, editingEvent]);

  // Filter events locally (client-side filtering on /events/my-events results)
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Keyword filter (search in title and description)
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(keyword) ||
          event.description?.toLowerCase().includes(keyword)
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((event) => event.categoryId === selectedCategory);
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter((event) => event.status === selectedStatus);
    }

    // Time range filter
    if (timeRange !== 'all') {
      const now = new Date();
      const startDate = new Date(now);

      switch (timeRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.startAt);
        return eventDate >= startDate;
      });
    }

    return filtered;
  }, [events, searchKeyword, selectedCategory, selectedStatus, timeRange]);

  // Format data for dropdowns
  const organizerOptions = initialOrganizations.map((org) => ({
    id: org.id,
    name: org.name,
  }));

  const categoryOptions = initialCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
  }));

  const venueOptions = initialVenues.map((venue) => ({
    id: venue.id,
    name: venue.name,
    city: venue.city,
    address: venue.address,
  }));

  const canCreateEvent = initialOrganizations.length > 0;

  // ========== HANDLERS ==========
  const handleCreateEvent = async (formData: EventFormData) => {
    try {
      await createEvent(formData).unwrap();
      showSuccessMessage(t('messages.success.eventCreated'));
      dispatch(closeModal('createEvent'));
    } catch (error: any) {
      showErrorMessage(error?.data?.message || error?.message || t('messages.error.eventCreateFailed'));
    }
  };

  const handleUpdateEvent = async (formData: EventFormData & { version?: number }) => {
    if (!selectedItemId) return;

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

      await updateEvent({ id: selectedItemId as string, data: updateData }).unwrap();
      showSuccessMessage(t('messages.success.eventUpdated'));
      handleCloseUpdateEvent();
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || t('messages.error.eventUpdateFailed');
      showErrorMessage(errorMessage);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedItemId) return;

    try {
      await deleteEvent(selectedItemId as string).unwrap();
      showSuccessMessage(t('messages.success.eventDeleted'));
      dispatch(closeModal('deleteConfirm'));
    } catch (error: any) {
      showErrorMessage(error?.data?.message || error?.message || t('messages.error.eventDeleteFailed'));
    }
  };

  const handleEventEdit = (event: EventListResponse | EventResponse) => {
    setEditingEvent(null); // Clear old snapshot so new one will be set from fullEvent
    dispatch(openModal({ modal: 'updateEvent', itemId: event.id }));
  };

  const handleCloseUpdateEvent = () => {
    dispatch(closeModal('updateEvent'));
    setEditingEvent(null); // Clear snapshot → unmount form → reset hooks
  };

  const handleEventDelete = (event: EventListResponse | EventResponse) => {
    dispatch(openModal({ modal: 'deleteConfirm', itemId: event.id }));
  };

  const handleEventClick = (event: EventListResponse | EventResponse) => {
    router.push(`/dashboard/organizer/events/${event.id}`);
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

  const isLoading = loadingEvents || loadingOrganizations;

  const selectedEvent = filteredEvents.find((e) => e.id === selectedItemId);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 20px)' }}>
      {/* Header */}
      <Box sx={{ mb: '10px' }}>
        <DashboardHeader
          title={t('common.navigation.events')}
          breadcrumbs={[{ label: t('common.navigation.dashboard'), href: '/dashboard/organizer' }, { label: t('common.navigation.events') }]}
          userName={userName}
        />
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, p: 3, overflow: 'hidden', backgroundColor: '#F7F7F7', borderRadius: '20px', display: 'flex', flexDirection: 'column' }}>
        {/* Filters */}
        <EventFilters
          onSearch={setSearchKeyword}
          onCategoryChange={setSelectedCategory}
          onTimeRangeChange={setTimeRange}
          onStatusChange={setSelectedStatus}
          onCreateClick={() => dispatch(openModal({ modal: 'createEvent' }))}
          categories={initialCategories}
          events={events}
          loading={isLoading}
          disabled={!canCreateEvent}
        />

        {/* Warning if no organization */}
        {!canCreateEvent && (
          <Box sx={{ mb: 2, p: 2, bgcolor: '#FABABB', borderRadius: 1, color: '#FF5B5E' }}>
            {t('event.needOrganization')}
          </Box>
        )}

        {/* Events List — only this part scrolls */}
        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <EventRowList
            events={filteredEvents}
            onEdit={handleEventEdit}
            onDelete={handleEventDelete}
            onClick={handleEventClick}
            loading={isLoading}
          />
        </Box>
      </Box>

      {/* Create Event Modal */}
      <BaseModal
        open={modals.createEvent}
        onClose={() => dispatch(closeModal('createEvent'))}
        title={t('event.createNew')}
        maxWidth="lg"
      >
        <CreateEventForm
          onSubmit={handleCreateEvent}
          onCancel={() => dispatch(closeModal('createEvent'))}
          loading={creatingEvent}
          organizers={organizerOptions}
          categories={categoryOptions}
          venues={venueOptions}
        />
      </BaseModal>

      {/* Update Event Modal (conditional rendering - unmounts on close, resets hooks) */}
      {editingEvent && (
        <BaseModal
          open={modals.updateEvent}
          onClose={handleCloseUpdateEvent}
          title={t('event.edit')}
          maxWidth="lg"
        >
          <UpdateEventForm
            event={editingEvent}
            onSubmit={handleUpdateEvent}
            onCancel={handleCloseUpdateEvent}
            loading={updatingEvent}
            organizers={organizerOptions}
            categories={categoryOptions}
            venues={venueOptions}
          />
        </BaseModal>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={modals.deleteConfirm}
        onClose={() => dispatch(closeModal('deleteConfirm'))}
        onConfirm={handleDeleteEvent}
        title={t('event.delete')}
        message={t('dialog.delete.message', { name: selectedEvent?.title || '' })}
        variant="error"
        loading={deletingEvent}
        confirmText={t('common.buttons.delete')}
        cancelText={t('common.buttons.cancel')}
        disableBackdropClose
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
        vertical="top"
        horizontal="right"
      />
    </Box>
  );
}
