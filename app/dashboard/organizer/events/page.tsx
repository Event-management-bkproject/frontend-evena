// app/dashboard/organizer/events/page.tsx
'use client';

import { useAuth } from '@/src/hook/useAuth';
import { useGetMyOrganizationsQuery } from '@/src/stores/services/OrganizerApi';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedContent from '@/src/components/ProtectedContent';
import { Box } from '@mui/material';
import BaseModal from '@/src/components/BaseModal';
import CreateEventForm from '@/src/components/CreateEventForm/CreateEventForm';
import UpdateEventForm from '@/src/components/UpdateEventForm';
import DeleteConfirmDialog from '@/src/components/DeleteConfirmDialog';
import DashboardHeader from '@/src/components/DashboardHeader';
import EventFilters from '@/src/components/EventFilters';
import Snackbar from '@/src/components/SnackBar';
import {
  useCreateEventMutation,
  useGetMyEventsQuery,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useGetEventByIdQuery,
} from '@/src/stores/services/EventApi';
import { useGetCategoriesQuery } from '@/src/stores/services/CategoryApi';
import { useGetVenuesQuery } from '@/src/stores/services/VenueApi';
import {
  CategoryResponse,
  EventListResponse,
  EventResponse,
  OrganizationResponse,
  VenueResponse,
  UpdateEventRequest,
} from '@/src/stores/types';
import LayoutWithSidebar from '@/src/components/layout/LayoutWithSidebar';
import { EventRowList } from '@/src/components/EventCard';
import { EventFormData } from '@/src/components/CreateEventForm/types';

export default function EventsPage() {
  const router = useRouter();
  const { auth } = useAuth();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Filters state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<import('@/src/stores/types/enums').EventStatus | null>(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // Queries
  const { data: organizersResponse, isLoading: loadingOrganizers } = useGetMyOrganizationsQuery(undefined, {
    skip: !auth.accessToken,
  });

  const {
    data: eventsResponse,
    isLoading: loadingEvents,
    error: eventsError,
    refetch: refetchEvents,
  } = useGetMyEventsQuery(
    { page: 0, size: 50 },
    {
      skip: !auth.accessToken,
    },
  );

  const { data: categoriesResponse, isLoading: loadingCategories } = useGetCategoriesQuery(undefined, {
    skip: !auth.accessToken,
  });

  const { data: venuesResponse, isLoading: loadingVenues } = useGetVenuesQuery(
    { page: 0, size: 100 },
    {
      skip: !auth.accessToken,
    },
  );

  // Fetch full event details when editing
  const { data: fullEventResponse } = useGetEventByIdQuery(selectedEventId!, {
    skip: !selectedEventId,
  });

  // Mutations
  const [createEvent, { isLoading: creatingEvent }] = useCreateEventMutation();
  const [updateEvent, { isLoading: updatingEvent }] = useUpdateEventMutation();
  const [deleteEvent, { isLoading: deletingEvent }] = useDeleteEventMutation();

  // Data processing
  const organizations: OrganizationResponse[] = organizersResponse?.data || [];
  const events: EventListResponse[] = eventsResponse?.data?.content || [];
  const categories: CategoryResponse[] = categoriesResponse?.data || [];
  const venues: VenueResponse[] = venuesResponse?.data?.content || [];

  // Filter events
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Search filter
    if (searchKeyword) {
      filtered = filtered.filter((event) => event.title.toLowerCase().includes(searchKeyword.toLowerCase()));
    }

    // Category filter
    if (selectedCategory) {
      const categoryName = categories.find((c) => c.id === selectedCategory)?.name;
      filtered = filtered.filter((event) => event.categoryName === categoryName);
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

      console.log('Time range filter:', {
        timeRange,
        now: now.toISOString(),
        startDate: startDate.toISOString(),
        eventsBeforeFilter: filtered.length,
      });

      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.startAt);
        const passes = eventDate >= startDate;
        console.log(
          'Event:',
          event.title,
          'startAt:',
          event.startAt,
          'eventDate:',
          eventDate.toISOString(),
          'passes:',
          passes,
        );
        return passes;
      });

      console.log('Events after time filter:', filtered.length);
    }

    return filtered;
  }, [events, searchKeyword, selectedCategory, selectedStatus, timeRange, categories]);

  // Format data for dropdowns
  const organizerOptions = organizations.map((org) => ({
    id: org.id,
    name: org.name,
  }));

  const categoryOptions = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
  }));

  const venueOptions = venues.map((venue) => ({
    id: venue.id,
    name: venue.name,
    city: venue.city,
    address: venue.address,
  }));

  const canCreateEvent = organizations.length > 0;

  // Handlers
  const handleCreateEvent = async (formData: EventFormData) => {
    try {
      await createEvent(formData).unwrap();
      showSuccessMessage('Event created successfully!');
      setCreateModalOpen(false);
      refetchEvents();
    } catch (error: any) {
      showErrorMessage(error?.data?.message || 'Failed to create event');
    }
  };

  const handleUpdateEvent = async (formData: EventFormData) => {
    if (!selectedEventId) return;

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

      await updateEvent({ id: selectedEventId, data: updateData }).unwrap();
      showSuccessMessage('Event updated successfully!');
      setUpdateModalOpen(false);
      setSelectedEventId(null);
      refetchEvents();
    } catch (error: any) {
      showErrorMessage(error?.data?.message || 'Failed to update event');
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      await deleteEvent(selectedEvent.id).unwrap();
      showSuccessMessage('Event deleted successfully!');
      setDeleteDialogOpen(false);
      setSelectedEvent(null);
      refetchEvents();
    } catch (error: any) {
      showErrorMessage(error?.data?.message || 'Failed to delete event');
    }
  };

  const handleEventEdit = (event: EventListResponse | EventResponse) => {
    // Set the event ID to trigger fetching full event details
    setSelectedEventId(event.id);
    setUpdateModalOpen(true);
  };

  const handleEventDelete = (event: EventListResponse | EventResponse) => {
    setSelectedEvent(event as EventResponse);
    setDeleteDialogOpen(true);
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

  const isLoading = loadingOrganizers || loadingEvents || loadingCategories || loadingVenues;

  return (
    <ProtectedContent>
      <LayoutWithSidebar currentPage="events">
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 20px)' }}>
          {/* Header */}
          <Box sx={{ mb: '10px' }}>
            <DashboardHeader
              title="Events"
              breadcrumbs={[{ label: 'Dashboard', href: '/dashboard/organizer' }, { label: 'Events' }]}
              userName={auth.user?.name || 'User'}
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
              onCreateClick={() => setCreateModalOpen(true)}
              categories={categories}
              events={events}
              loading={isLoading}
              disabled={!canCreateEvent}
            />

            {/* Warning if no organization */}
            {!canCreateEvent && !loadingOrganizers && (
              <Box sx={{ mb: 2, p: 2, bgcolor: '#FABABB', borderRadius: 1, color: '#FF5B5E' }}>
                You need to create an organization first.
                {/* <a href="/dashboard/organizer/organizations" style={{ fontWeight: 600 }}>
                  Go to Organizations
                </a> */}
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
        </Box>

        {/* Create Event Modal */}
        <BaseModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Create New Event"
          maxWidth="lg"
        >
          <CreateEventForm
            onSubmit={handleCreateEvent}
            onCancel={() => setCreateModalOpen(false)}
            loading={creatingEvent}
            organizers={organizerOptions}
            categories={categoryOptions}
            venues={venueOptions}
          />
        </BaseModal>

        {/* Update Event Modal */}
        {fullEventResponse?.data && (
          <BaseModal open={updateModalOpen} onClose={() => setUpdateModalOpen(false)} title="Edit Event" maxWidth="lg">
            <UpdateEventForm
              event={fullEventResponse.data}
              onSubmit={handleUpdateEvent}
              onCancel={() => setUpdateModalOpen(false)}
              loading={updatingEvent}
              organizers={organizerOptions}
              categories={categoryOptions}
              venues={venueOptions}
            />
          </BaseModal>
        )}

        {/* Delete Confirmation */}
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
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
          vertical="top" // Add this
          horizontal="right" // Add this
        />
      </LayoutWithSidebar>
    </ProtectedContent>
  );
}
