'use client';

import { useAuth } from '@/src/hooks/auth/useAuth';
import { useGetMyEventsQuery } from '@/src/stores/services/EventApi';
import { useRouter } from 'next/navigation';
import React, { useMemo } from 'react';
import ProtectedContent from '@/src/components/ProtectedContent';
import { Box, Button, Typography, CircularProgress, Grid } from '@mui/material';
import { Event as EventIcon, ArrowForward } from '@mui/icons-material';
import LayoutWithSidebar from '@/src/components/layout/LayoutWithSidebar';
import DashboardHeader from '@/src/components/DashboardHeader';
import { EventListResponse } from '@/src/stores/types';
import EventCard from '@/src/components/EventCard/EventCard';
import EventCalendar from '@/src/components/EventCalendar/EventCalendar';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

export default function OrganizerDashboard() {
  const { auth } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  // Fetch events
  const {
    data: eventsResponse,
    isLoading: loadingEvents,
    error: eventsError,
  } = useGetMyEventsQuery(
    { page: 0, size: 20 },
    {
      skip: !auth.accessToken,
    },
  );

  const events: EventListResponse[] = eventsResponse?.data?.content || [];
  const totalEvents = eventsResponse?.data?.totalElements || 0;

  // Get event dates for calendar highlighting
  const eventDates = useMemo(() => {
    return events.map((event) => dayjs(event.startAt).format('YYYY-MM-DD'));
  }, [events]);

  const handleEventClick = (eventId: string) => {
    router.push(`/dashboard/organizer/events/${eventId}`);
  };

  const handleViewAllEvents = () => {
    router.push('/dashboard/organizer/events');
  };

  return (
    <ProtectedContent>
      <LayoutWithSidebar currentPage="dashboard">
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 20px)' }}>
          {/* Header */}
          <Box sx={{ mb: '10px' }}>
            <DashboardHeader
              title={t('common.navigation.dashboard')}
              breadcrumbs={[{ label: t('common.navigation.dashboard') }]}
              userName={auth.user?.name || 'User'}
            />
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, p: '20px', overflow: 'auto', backgroundColor: '#F7F7F7', borderRadius: '20px' }}>
            <Grid container spacing={'20px'}>
              {/* Events Section - 3/4 width */}
              <Grid size={{ xs: 12, lg: 9 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#2A3363', mb: 0.5 }}>
                        {t('organizer.allEvents')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('organizer.totalEvents', { count: totalEvents })}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      onClick={handleViewAllEvents}
                      sx={{
                        backgroundColor: '#EEF0FF',
                        borderRadius: '25px',
                        textTransform: 'none',
                        px: 3,
                        fontWeight: 600,
                        color: '#37437D',
                        '&:hover': { backgroundColor: '#dce0f5' },
                      }}
                    >
                      {t('organizer.viewAllEvents')}
                    </Button>
                  </Box>

                  {/* Horizontal Scrolling Event Cards */}
                  {loadingEvents ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                      <CircularProgress sx={{ color: '#F36BF9' }} />
                    </Box>
                  ) : eventsError ? (
                    <Box sx={{ p: 3, bgcolor: '#FEE', borderRadius: 2 }}>
                      <Typography color="error">{t('messages.error.loadFailed', { item: t('common.entities.event') })}</Typography>
                    </Box>
                  ) : events.length === 0 ? (
                    <Box
                      sx={{
                        p: 6,
                        textAlign: 'center',
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        border: '2px dashed #E0E0E0',
                      }}
                    >
                      <EventIcon sx={{ fontSize: 64, color: '#CCC', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        {t('organizer.noEventsYet')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {t('organizer.createFirstEvent')}
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<EventIcon />}
                        onClick={handleViewAllEvents}
                        sx={{
                          backgroundColor: '#F36BF9',
                          borderRadius: '12px',
                          textTransform: 'none',
                          fontWeight: 600,
                          '&:hover': { backgroundColor: '#e55ae0' },
                        }}
                      >
                        {t('organizer.goToEvents')}
                      </Button>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 3,
                        overflowX: 'auto',
                        pb: 2,
                        '&::-webkit-scrollbar': {
                          height: 8,
                        },
                        '&::-webkit-scrollbar-track': {
                          backgroundColor: '#F0F0F0',
                          borderRadius: 4,
                        },
                        '&::-webkit-scrollbar-thumb': {
                          backgroundColor: '#F36BF9',
                          borderRadius: 4,
                          '&:hover': {
                            backgroundColor: '#e55ae0',
                          },
                        },
                      }}
                    >
                      {events.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          onClick={() => handleEventClick(event.id)}
                          variant="dashboard"
                          showActions={false}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Calendar Section - 1/4 width */}
              <Grid size={{ xs: 12, lg: 3 }}>
                <EventCalendar eventDates={eventDates} events={events} />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </LayoutWithSidebar>
    </ProtectedContent>
  );
}
