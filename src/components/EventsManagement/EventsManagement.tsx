'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box } from '@mui/material';
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
import DeleteConfirmDialog from '../DeleteConfirmDialog';
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
    error: eventsError,
  } = useGetMyEventsQuery(
    {
      page: 0,
      size: 50,
    },
    {
      refetchOnMountOrArgChange: 30, // Refetch if data is older than 30 seconds
      refetchOnFocus: true, // Refetch when window regains focus
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
      showSuccessMessage('Event created successfully!');
      dispatch(closeModal('createEvent'));
    } catch (error: any) {
      showErrorMessage(error?.data?.message || error?.message || 'Failed to create event');
    }
  };

  const handleUpdateEvent = async (formData: EventFormData) => {
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
      };

      await updateEvent({ id: selectedItemId as string, data: updateData }).unwrap();
      showSuccessMessage('Event updated successfully!');
      dispatch(closeModal('updateEvent'));
    } catch (error: any) {
      showErrorMessage(error?.data?.message || error?.message || 'Failed to update event');
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedItemId) return;

    try {
      await deleteEvent(selectedItemId as string).unwrap();
      showSuccessMessage('Event deleted successfully!');
      dispatch(closeModal('deleteConfirm'));
    } catch (error: any) {
      showErrorMessage(error?.data?.message || error?.message || 'Failed to delete event');
    }
  };

  const handleEventEdit = (event: EventListResponse | EventResponse) => {
    dispatch(openModal({ modal: 'updateEvent', itemId: event.id }));
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
          title="Events"
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard/organizer' }, { label: 'Events' }]}
          userName={userName}
        />
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, p: 3, overflow: 'auto', backgroundColor: '#F7F7F7', borderRadius: '20px' }}>
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
            You need to create an organization first.
          </Box>
        )}

        {/* Events List */}
        <EventRowList
          events={filteredEvents}
          onEdit={handleEventEdit}
          onDelete={handleEventDelete}
          onClick={handleEventClick}
          loading={isLoading}
        />
      </Box>

      {/* Create Event Modal */}
      <BaseModal
        open={modals.createEvent}
        onClose={() => dispatch(closeModal('createEvent'))}
        title="Create New Event"
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

      {/* Update Event Modal */}
      {fullEvent && (
        <BaseModal
          open={modals.updateEvent}
          onClose={() => dispatch(closeModal('updateEvent'))}
          title="Edit Event"
          maxWidth="lg"
        >
          <UpdateEventForm
            event={fullEvent}
            onSubmit={handleUpdateEvent}
            onCancel={() => dispatch(closeModal('updateEvent'))}
            loading={updatingEvent}
            organizers={organizerOptions}
            categories={categoryOptions}
            venues={venueOptions}
          />
        </BaseModal>
      )}

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={modals.deleteConfirm}
        onClose={() => dispatch(closeModal('deleteConfirm'))}
        onConfirm={handleDeleteEvent}
        title="Delete Event"
        message={`Are you sure you want to delete "${selectedEvent?.title}"? This action cannot be undone.`}
        loading={deletingEvent}
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
