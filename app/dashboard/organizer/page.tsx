// app/organizers-test/page.tsx
'use client';

import { useAuth } from '@/src/hook/useAuth';
import { useCreateOrganizationMutation, useGetMyOrganizationsQuery } from '@/src/stores/services/OrganizerApi';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import ProtectedContent from '@/src/components/ProtectedContent';
import { Button, Box, Tabs, Tab } from '@mui/material';
import { Add, Event, Business, EventNote } from '@mui/icons-material';
import BaseModal from '@/src/components/BaseModal';
import CreateEventForm, { EventFormData } from '@/src/components/CreateEventForm/CreateEventForm';
import Snackbar from '@/src/components/SnackBar';
import { useCreateEventMutation, useGetMyEventsQuery } from '@/src/stores/services/EventApi';
import { useGetCategoriesQuery } from '@/src/stores/services/CategoryApi';
import { useGetVenuesQuery } from '@/src/stores/services/VenueApi';
import CreateOrganizationForm, {
  OrganizationFormData,
} from '@/src/components/CreateOrganisationForm/CreateOrganisationForm';
import {
  CategoryResponse,
  EventListResponse,
  EventResponse,
  OrganizationResponse,
  VenueResponse,
} from '@/src/stores/types';
import LayoutWithSidebar from '@/src/components/layout/LayoutWithSidebar';
import OrganizationGrid from '@/src/components/OrganizationCard/OrganizationGrid';
import { EventGrid } from '@/src/components/EventCard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function OrganizersTestPage() {
  const { logout, auth } = useAuth();
  const router = useRouter();
  const [organizationModalOpen, setOrganizationModalOpen] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // Sử dụng skip để chỉ fetch khi có token
  const {
    data: organizersResponse,
    isLoading: loadingOrganizers,
    error: organizersError,
    refetch: refetchOrganizers,
  } = useGetMyOrganizationsQuery(undefined, {
    skip: !auth.accessToken,
  });

  // Lấy events với pagination
  const {
    data: eventsResponse,
    isLoading: loadingEvents,
    error: eventsError,
    refetch: refetchEvents,
  } = useGetMyEventsQuery(
    { page: 0, size: 12 }, // Thêm pagination parameters
    {
      skip: !auth.accessToken,
    },
  );

  const {
    data: categoriesResponse,
    isLoading: loadingCategories,
    error: categoriesError,
  } = useGetCategoriesQuery(undefined, {
    skip: !auth.accessToken,
  });

  const {
    data: venuesResponse,
    isLoading: loadingVenues,
    error: venuesError,
  } = useGetVenuesQuery(
    { page: 0, size: 10 },
    {
      skip: !auth.accessToken,
    },
  );

  const [createOrganizer, { isLoading: creatingOrganizer }] = useCreateOrganizationMutation();
  const [createEvent, { isLoading: creatingEvent }] = useCreateEventMutation();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

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

  const handleCreateEvent = async (formData: EventFormData) => {
    try {
      // Convert form data to API request format
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

      setSnackbar({
        open: true,
        message: 'Event created successfully!',
        severity: 'success',
      });
      setEventModalOpen(false);

      // Refetch events sau khi tạo mới
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

  const handleOrganizationClick = (org: OrganizationResponse) => {
    // Có thể điều hướng đến trang chi tiết organization
  };

  const handleEventClick = (event: EventResponse) => {
    // Có thể điều hướng đến trang chi tiết event
  };

  const handleEventEdit = (event: EventResponse) => {
    // Mở modal chỉnh sửa event
    setSnackbar({
      open: true,
      message: 'Edit event feature coming soon!',
      severity: 'info',
    });
  };

  const handleEventDelete = (event: EventResponse) => {
    // Xử lý xóa event
    setSnackbar({
      open: true,
      message: 'Delete event feature coming soon!',
      severity: 'warning',
    });
  };

  // Xử lý dữ liệu từ API response
  const organizers: OrganizationResponse[] = organizersResponse?.data || [];

  // Lấy events từ PaginatedResponse
  const events: EventListResponse[] = eventsResponse?.data?.content || [];
  const totalEvents = eventsResponse?.data?.totalElements || 0;

  const categories: CategoryResponse[] = categoriesResponse?.data || [];
  const venues: VenueResponse[] = venuesResponse?.data?.content || [];

  // Format data cho dropdown
  const organizerOptions = organizers.map((org) => ({
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

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Loading state tổng hợp
  const isLoading = loadingOrganizers || loadingEvents || loadingCategories || loadingVenues;

  return (
    <ProtectedContent fallback={<div className="p-6">Initializing authentication...</div>}>
      <LayoutWithSidebar currentPage="organizations-test">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<Event />}
                onClick={() => setEventModalOpen(true)}
                disabled={organizers.length === 0 || isLoading} // Disable nếu chưa có organization hoặc đang loading
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  borderColor: '#f36bf9',
                  color: '#f36bf9',
                  '&:hover': {
                    backgroundColor: '#f36bf9',
                    color: 'white',
                    borderColor: '#f36bf9',
                  },
                  '&:disabled': {
                    borderColor: '#ccc',
                    color: '#ccc',
                  },
                }}
              >
                Create Event
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOrganizationModalOpen(true)}
                disabled={isLoading}
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

          {/* Hiển thị auth state để debug */}
          {/* <div className="mb-4 p-3 bg-gray-100 rounded">
            <h3 className="font-semibold">Auth State:</h3>
            <p>Initialized: {auth.isInitialized ? '✅' : '❌'}</p>
            <p>Authenticated: {auth.accessToken ? '✅' : '❌'}</p>
            <p>User: {auth.user ? auth.user.email : 'None'}</p>
          </div> */}

          {/* Tabs để chuyển đổi giữa Organizations và Events */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="organizer dashboard tabs">
              <Tab icon={<Business />} iconPosition="start" label={`Organizations (${organizers.length})`} />
              <Tab icon={<EventNote />} iconPosition="start" label={`My Events (${totalEvents})`} />
            </Tabs>
          </Box>

          {/* Tab Panel cho Organizations */}
          <TabPanel value={activeTab} index={0}>
            <section className="mb-8 p-4 border rounded-lg">
              <OrganizationGrid
                organizations={organizers}
                onCardClick={handleOrganizationClick}
                loading={loadingOrganizers}
              />
              {/* <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => refetchOrganizers()}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                >
                  Refresh Organizations
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div> */}
            </section>
          </TabPanel>

          {/* Tab Panel cho Events */}
          <TabPanel value={activeTab} index={1}>
            <section className="mb-8 p-4 border rounded-lg">
              {/* Hiển thị lỗi nếu có */}
              {eventsError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                  <h3 className="text-red-800 font-semibold">Error loading events:</h3>
                  <p className="text-red-600">{(eventsError as any)?.data?.message || 'Unknown error occurred'}</p>
                </div>
              )}

              {/* Event Grid */}
              <EventGrid
                events={events}
                loading={loadingEvents}
                emptyMessage="No events found. Create your first event!"
              />

              {/* Pagination Info */}
              {/* {eventsResponse?.data && (
                <div className="mt-4 text-center text-gray-600">
                  Showing {events.length} of {totalEvents} events
                  {eventsResponse.data.totalPages > 1 && (
                    <span>
                      {' '}
                      (Page {eventsResponse.data.number + 1} of {eventsResponse.data.totalPages})
                    </span>
                  )}
                </div>
              )} */}

              {/* <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => refetchEvents()}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                >
                  Refresh Events
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div> */}
            </section>
          </TabPanel>

          {/* Section 3: Available Categories & Venues (for reference) */}
          {/* <section className="mb-8 p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">📊 Available Resources</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  Categories
                  {categoriesResponse?.data && <span className="text-sm text-gray-500">({categories.length})</span>}
                </h3>
                {categoriesError ? (
                  <div className="text-red-500 p-3 bg-red-50 rounded">
                    Error loading categories: {(categoriesError as any)?.data?.message || 'Unknown error'}
                  </div>
                ) : loadingCategories ? (
                  <div className="text-blue-500">Loading categories...</div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2"
                      >
                        {cat.iconUrl && <span className="text-lg">{cat.iconUrl}</span>}
                        <div>
                          <div className="font-medium text-blue-800">{cat.name}</div>
                          {cat.eventCount !== undefined && (
                            <div className="text-xs text-blue-600">{cat.eventCount} events</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  Venues
                  {venuesResponse?.data?.content && <span className="text-sm text-gray-500">({venues.length})</span>}
                </h3>
                {venuesError ? (
                  <div className="text-red-500 p-3 bg-red-50 rounded">
                    Error loading venues: {(venuesError as any)?.data?.message || 'Unknown error'}
                  </div>
                ) : loadingVenues ? (
                  <div className="text-blue-500">Loading venues...</div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {venues.map((venue) => (
                      <div key={venue.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="font-medium text-green-800">{venue.name}</div>
                        <div className="text-sm text-green-600">
                          {venue.address}, {venue.city}
                        </div>
                        {venue.capacity && (
                          <div className="text-xs text-green-500">Capacity: {venue.capacity.toLocaleString()}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section> */}

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

          {/* Custom Snackbar Component */}
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
