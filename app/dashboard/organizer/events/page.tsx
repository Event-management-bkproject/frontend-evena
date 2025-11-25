// app/events/page.tsx
'use client';

import { useAuth } from '@/src/hook/useAuth';
import { useCreateOrganizationMutation, useGetMyOrganizationsQuery } from '@/src/stores/services/OrganizerApi';
import React, { useState } from 'react';
import ProtectedContent from '@/src/components/ProtectedContent';
import { Button, Box } from '@mui/material';
import { Add, Event } from '@mui/icons-material';
import BaseModal from '@/src/components/BaseModal';
import CreateEventForm, { EventFormData } from '@/src/components/CreateEventForm/CreateEventForm';
import Snackbar from '@/src/components/SnackBar';
import { useCreateEventMutation, useGetMyEventsQuery } from '@/src/stores/services/EventApi';
import { useGetCategoriesQuery } from '@/src/stores/services/CategoryApi';
import { useGetVenuesQuery } from '@/src/stores/services/VenueApi';
import {
  CategoryResponse,
  EventListResponse,
  EventResponse,
  OrganizationResponse,
  VenueResponse,
} from '@/src/stores/types';
import LayoutWithSidebar from '@/src/components/layout/LayoutWithSidebar';
import { EventGrid } from '@/src/components/EventCard';

export default function EventsPage() {
  const { auth } = useAuth();
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // Lấy organizations để tạo event
  const { data: organizersResponse, isLoading: loadingOrganizers } = useGetMyOrganizationsQuery(undefined, {
    skip: !auth.accessToken,
  });

  // Lấy events
  const {
    data: eventsResponse,
    isLoading: loadingEvents,
    error: eventsError,
    refetch: refetchEvents,
  } = useGetMyEventsQuery(
    { page: 0, size: 12 },
    {
      skip: !auth.accessToken,
    },
  );

  const { data: categoriesResponse, isLoading: loadingCategories } = useGetCategoriesQuery(undefined, {
    skip: !auth.accessToken,
  });

  const { data: venuesResponse, isLoading: loadingVenues } = useGetVenuesQuery(
    { page: 0, size: 10 },
    {
      skip: !auth.accessToken,
    },
  );

  const [createEvent, { isLoading: creatingEvent }] = useCreateEventMutation();

  const handleCreateEvent = async (formData: EventFormData) => {
    try {
      const eventRequest = {
        title: formData.title,
        description: formData.description,
        startAt: formData.startAt,
        endAt: formData.endAt,
        organizerId: formData.organizerId,
        categoryId: formData.categoryId,
        venueId: formData.venueId,
        coverUrl: formData.coverUrl || undefined,
        imageUrls: formData.imageUrls || [],
      };

      const response = await createEvent(eventRequest).unwrap();
      console.log('Event created:', response);
      setSnackbar({
        open: true,
        message: 'Event created successfully!',
        severity: 'success',
      });
      setEventModalOpen(false);

      refetchEvents();
    } catch (error: any) {
      console.error('Error creating event:', error);

      setSnackbar({
        open: true,
        message: error?.data?.message || 'Failed to create event. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleEventClick = (event: EventResponse) => {
    // Có thể điều hướng đến trang chi tiết event
  };

  const handleEventEdit = (event: EventResponse) => {
    setSnackbar({
      open: true,
      message: 'Edit event feature coming soon!',
      severity: 'info',
    });
  };

  const handleEventDelete = (event: EventResponse) => {
    setSnackbar({
      open: true,
      message: 'Delete event feature coming soon!',
      severity: 'warning',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Xử lý dữ liệu
  const organizations: OrganizationResponse[] = organizersResponse?.data || [];
  const events: EventListResponse[] = eventsResponse?.data?.content || [];
  const totalEvents = eventsResponse?.data?.totalElements || 0;
  const categories: CategoryResponse[] = categoriesResponse?.data || [];
  const venues: VenueResponse[] = venuesResponse?.data?.content || [];

  // Format data cho dropdown
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

  const isLoading = loadingOrganizers || loadingEvents || loadingCategories || loadingVenues;
  const canCreateEvent = organizations.length > 0;

  return (
    <ProtectedContent fallback={<div className="p-6">Initializing authentication...</div>}>
      <LayoutWithSidebar title="Events" currentPage="events">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          <div className="flex justify-between items-center mb-16">
            <div>
              <h1 className="text-3xl font-bold">My Events</h1>
              <p className="text-gray-600 mt-2">Manage your events and create new ones to engage with your audience</p>
            </div>
            <Button
              variant="contained"
              startIcon={<Event />}
              onClick={() => setEventModalOpen(true)}
              disabled={!canCreateEvent || isLoading}
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
              Create Event
            </Button>
          </div>

          {/* Warning nếu chưa có organization */}
          {!canCreateEvent && !loadingOrganizers && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-yellow-800 font-semibold">Create an Organization First</h3>
              <p className="text-yellow-700">
                You need to create an organization before you can create events.
                <a href="/organizations" className="text-blue-600 hover:underline ml-1">
                  Go to Organizations
                </a>
              </p>
            </div>
          )}

          {/* Error Display */}
          {eventsError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-red-800 font-semibold">Error loading events:</h3>
              <p className="text-red-600">{(eventsError as any)?.data?.message || 'Unknown error occurred'}</p>
            </div>
          )}

          {/* Events Grid */}
          <section className="mb-8">
            <EventGrid
              events={events}
              loading={loadingEvents}
              emptyMessage="No events found. Create your first event to get started!"
            />
          </section>

          {/* Stats */}
          {/* {events.length > 0 && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Event Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-2xl font-bold text-blue-600">{totalEvents}</div>
                  <div className="text-gray-600">Total Events</div>
                </div>
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-2xl font-bold text-green-600">
                    {events.filter((event) => event.status === 'PUBLISHED').length}
                  </div>
                  <div className="text-gray-600">Published</div>
                </div>
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-2xl font-bold text-orange-600">
                    {events.filter((event) => event.status === 'DRAFT').length}
                  </div>
                  <div className="text-gray-600">Drafts</div>
                </div>
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-2xl font-bold text-purple-600">
                    {events.filter((event) => event.status === 'ONGOING').length}
                  </div>
                  <div className="text-gray-600">Ongoing</div>
                </div>
              </div>
            </div>
          )} */}

          {/* Create Event Modal */}
          <BaseModal
            open={eventModalOpen}
            onClose={() => setEventModalOpen(false)}
            title="Create New Event"
            maxWidth="lg"
          >
            <CreateEventForm
              onSubmit={handleCreateEvent}
              onCancel={() => setEventModalOpen(false)}
              loading={creatingEvent}
              organizers={organizerOptions}
              categories={categoryOptions}
              venues={venueOptions}
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
