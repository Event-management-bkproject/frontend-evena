'use client';

import { useAuth } from '@/src/hooks/auth/useAuth';
import { useGetMyEventsQuery } from '@/src/stores/services/EventApi';
import { useRouter } from 'next/navigation';
import React, { useMemo } from 'react';
import ProtectedContent from '@/src/components/ProtectedContent';
import { Box, Button, Typography, CircularProgress, Grid } from '@mui/material';
import {
  Event as EventIcon,
  TrendingUp,
  CheckCircle,
  Schedule,
  Add,
} from '@mui/icons-material';
import LayoutWithSidebar from '@/src/components/layout/LayoutWithSidebar';
import DashboardHeader from '@/src/components/DashboardHeader';
import { EventListResponse } from '@/src/stores/types';
import EventCard from '@/src/components/EventCard/EventCard';
import EventCalendar from '@/src/components/EventCalendar/EventCalendar';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { BRAND } from '@/src/utils/constants/constant';

function KpiCard({ icon, label, value, sub, gradient }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  gradient: string;
}) {
  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: '20px', p: '18px', display: 'flex', alignItems: 'center', gap: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: `1px solid ${BRAND.border}` }}>
      <Box sx={{ width: 48, height: 48, borderRadius: '14px', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontSize: 11, color: '#ADACAE', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</Typography>
        <Typography sx={{ fontSize: 20, fontWeight: 800, color: BRAND.dark, lineHeight: 1.2 }}>{value}</Typography>
        {sub && <Typography sx={{ fontSize: 11, color: '#94A3B8', mt: 0.25 }}>{sub}</Typography>}
      </Box>
    </Box>
  );
}

export default function OrganizerDashboard() {
  const { auth } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const { data: eventsResponse, isLoading: loadingEvents, error: eventsError } = useGetMyEventsQuery(
    { page: 0, size: 20 },
    { skip: !auth.accessToken },
  );

  const events: EventListResponse[] = eventsResponse?.data?.content ?? [];
  const totalEvents = eventsResponse?.data?.totalElements ?? 0;

  const now = dayjs();
  const publishedCount = useMemo(() => events.filter((e) => e.status === 'PUBLISHED').length, [events]);
  const upcomingCount = useMemo(() => events.filter((e) => dayjs(e.startAt).isAfter(now)).length, [events, now]);
  const ongoingCount = useMemo(() => events.filter((e) => e.status === 'ONGOING').length, [events]);

  const eventDates = useMemo(() => events.map((e) => dayjs(e.startAt).format('YYYY-MM-DD')), [events]);

  return (
    <ProtectedContent>
      <LayoutWithSidebar currentPage="dashboard">
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 20px)' }}>
          {/* Header */}
          <Box sx={{ mb: '10px' }}>
            <DashboardHeader
              title={t('common.navigation.dashboard')}
              breadcrumbs={[{ label: t('common.navigation.dashboard') }]}
              userName={auth.user?.name ?? 'User'}
              userAvatar={auth.user?.avatarUrl ?? undefined}
              onProfileClick={() => router.push('/dashboard/organizer/profile')}
            />
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, p: '20px', overflow: 'auto', backgroundColor: BRAND.bgSection, borderRadius: '20px' }}>

            {/* KPI row */}
            <Grid container spacing='14px' sx={{ mb: '20px' }}>
              {[
                { icon: <EventIcon sx={{ fontSize: 22 }} />, label: 'Total Events', value: totalEvents, sub: 'all time', gradient: `linear-gradient(135deg, ${BRAND.primary}, #c44de0)` },
                { icon: <CheckCircle sx={{ fontSize: 22 }} />, label: 'Published', value: publishedCount, sub: 'live now', gradient: 'linear-gradient(135deg, #22C55E, #16A34A)' },
                { icon: <Schedule sx={{ fontSize: 22 }} />, label: 'Upcoming', value: upcomingCount, sub: 'scheduled', gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)' },
                { icon: <TrendingUp sx={{ fontSize: 22 }} />, label: 'Ongoing', value: ongoingCount, sub: 'in progress', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)' },
              ].map((kpi) => (
                <Grid key={kpi.label} size={{ xs: 6, md: 3 }}>
                  <KpiCard {...kpi} />
                </Grid>
              ))}
            </Grid>

            <Grid container spacing='20px'>
              {/* Events list — 3/4 width */}
              <Grid size={{ xs: 12, lg: 9 }} sx={{ minWidth: 0 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: BRAND.dark, mb: 0.25 }}>
                        {t('organizer.allEvents')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontSize={13}>
                        {t('organizer.totalEvents', { count: totalEvents })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => router.push('/dashboard/organizer/events')}
                        sx={{
                          bgcolor: BRAND.primary,
                          borderRadius: '20px',
                          textTransform: 'none',
                          px: 2.5,
                          fontWeight: 600,
                          fontSize: 13,
                          boxShadow: 'none',
                          '&:hover': { bgcolor: BRAND.primaryHover },
                        }}
                      >
                        New Event
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => router.push('/dashboard/organizer/events')}
                        sx={{
                          borderColor: BRAND.border,
                          borderRadius: '20px',
                          textTransform: 'none',
                          px: 2.5,
                          fontWeight: 600,
                          fontSize: 13,
                          color: BRAND.dark,
                          '&:hover': { borderColor: BRAND.primary, color: BRAND.primary },
                        }}
                      >
                        {t('organizer.viewAllEvents')}
                      </Button>
                    </Box>
                  </Box>

                  {loadingEvents ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                      <CircularProgress sx={{ color: BRAND.primary }} />
                    </Box>
                  ) : eventsError ? (
                    <Box sx={{ p: 3, bgcolor: '#FEE2E2', borderRadius: '12px' }}>
                      <Typography color="error" fontSize={14}>{t('messages.error.loadFailed', { item: t('common.entities.event') })}</Typography>
                    </Box>
                  ) : events.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: 'center', bgcolor: '#fff', borderRadius: '16px', border: `2px dashed ${BRAND.border}` }}>
                      <EventIcon sx={{ fontSize: 56, color: '#D1D5DB', mb: 2 }} />
                      <Typography variant="h6" color={BRAND.dark} fontWeight={700} sx={{ mb: 0.5 }}>
                        {t('organizer.noEventsYet')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {t('organizer.createFirstEvent')}
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => router.push('/dashboard/organizer/events')}
                        sx={{
                          bgcolor: BRAND.primary,
                          borderRadius: '12px',
                          textTransform: 'none',
                          fontWeight: 600,
                          boxShadow: 'none',
                          '&:hover': { bgcolor: BRAND.primaryHover },
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
                        '&::-webkit-scrollbar': { height: 6 },
                        '&::-webkit-scrollbar-track': { bgcolor: '#F0F0F0', borderRadius: 3 },
                        '&::-webkit-scrollbar-thumb': { bgcolor: BRAND.primary, borderRadius: 3 },
                      }}
                    >
                      {events.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          onClick={() => router.push(`/dashboard/organizer/events/${event.id}`)}
                          variant="dashboard"
                          showActions={false}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Calendar — 1/4 width */}
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
