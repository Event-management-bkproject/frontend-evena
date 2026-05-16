'use client';

import { useAuth } from '@/src/hooks/auth/useAuth';
import { useGetMyEventsQuery } from '@/src/stores/services/EventApi';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import ProtectedContent from '@/src/components/ProtectedContent';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Grid,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Event as EventIcon,
  TrendingUp,
  CheckCircle,
  Schedule,
  Add,
  LocalFireDepartment as FireIcon,
  Warning as WarnIcon,
  Remove as NormalIcon,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import LayoutWithSidebar from '@/src/components/layout/LayoutWithSidebar';
import DashboardHeader from '@/src/components/DashboardHeader';
import { EventListResponse, EventStatus } from '@/src/stores/types';
import EventCard from '@/src/components/EventCard/EventCard';
import EventCalendar from '@/src/components/EventCalendar/EventCalendar';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { BRAND } from '@/src/utils/constants/constant';

type Signal = 'hot' | 'slow' | 'normal';
type SortKey = 'soldPct' | 'daysUntil' | 'signal';

function getSignal(e: EventListResponse, now: dayjs.Dayjs): Signal {
  const pct = e.soldPercentage ?? 0;
  const days = dayjs(e.startAt).diff(now, 'day');
  if (pct >= 80) return 'hot';
  if (pct < 40 && days >= 0 && days < 21) return 'slow';
  return 'normal';
}

function SignalChip({ signal }: { signal: Signal }) {
  if (signal === 'hot') return (
    <Chip
      icon={<FireIcon sx={{ fontSize: '13px !important' }} />}
      label="Hot"
      size="small"
      sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: BRAND.error + '15', color: BRAND.error, '& .MuiChip-icon': { color: BRAND.error } }}
    />
  );
  if (signal === 'slow') return (
    <Chip
      icon={<WarnIcon sx={{ fontSize: '13px !important' }} />}
      label="Slow"
      size="small"
      sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: BRAND.warning + '15', color: BRAND.warning, '& .MuiChip-icon': { color: BRAND.warning } }}
    />
  );
  return (
    <Chip
      icon={<NormalIcon sx={{ fontSize: '13px !important' }} />}
      label="Normal"
      size="small"
      sx={{ height: 20, fontSize: 10, fontWeight: 600, bgcolor: BRAND.border, color: BRAND.textSecondary, '& .MuiChip-icon': { color: BRAND.textSecondary } }}
    />
  );
}

function StatusChip({ status }: { status: EventStatus }) {
  const map: Record<EventStatus, { label: string; color: string }> = {
    DRAFT:      { label: 'Draft',     color: BRAND.textMuted },
    PUBLISHED:  { label: 'Published', color: BRAND.info },
    ONGOING:    { label: 'Ongoing',   color: BRAND.success },
    COMPLETED:  { label: 'Completed', color: BRAND.textSecondary },
    CANCELLED:  { label: 'Cancelled', color: BRAND.error },
  };
  const { label, color } = map[status] ?? { label: status, color: BRAND.textMuted };
  return (
    <Chip label={label} size="small" sx={{ height: 18, fontSize: 10, fontWeight: 600, bgcolor: color + '18', color }} />
  );
}

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

const SIGNAL_ORDER: Record<Signal, number> = { slow: 0, normal: 1, hot: 2 };

export default function OrganizerDashboard() {
  const { auth } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const now = useMemo(() => dayjs(), []);

  const { data: eventsResponse, isLoading: loadingEvents, error: eventsError } = useGetMyEventsQuery(
    { page: 0, size: 50 },
    { skip: !auth.accessToken },
  );

  const events: EventListResponse[] = eventsResponse?.data?.content ?? [];
  const totalEvents = eventsResponse?.data?.totalElements ?? 0;

  const publishedCount = useMemo(() => events.filter((e) => e.status === 'PUBLISHED').length, [events]);
  const upcomingCount = useMemo(() => events.filter((e) => dayjs(e.startAt).isAfter(now)).length, [events, now]);
  const ongoingCount = useMemo(() => events.filter((e) => e.status === 'ONGOING').length, [events]);
  const hotCount = useMemo(() => events.filter((e) => getSignal(e, now) === 'hot').length, [events, now]);
  const slowCount = useMemo(() => events.filter((e) => getSignal(e, now) === 'slow').length, [events, now]);

  const [signalFilter, setSignalFilter] = useState<Signal | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('signal');
  const [sortAsc, setSortAsc] = useState(true);

  const eventDates = useMemo(() => events.map((e) => dayjs(e.startAt).format('YYYY-MM-DD')), [events]);

  const tableRows = useMemo(() => {
    const enriched = events.map((e) => ({
      ...e,
      signal: getSignal(e, now),
      daysUntil: dayjs(e.startAt).diff(now, 'day'),
    }));

    const filtered = signalFilter === 'all' ? enriched : enriched.filter((e) => e.signal === signalFilter);

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'soldPct') cmp = (a.soldPercentage ?? 0) - (b.soldPercentage ?? 0);
      else if (sortKey === 'daysUntil') cmp = a.daysUntil - b.daysUntil;
      else cmp = SIGNAL_ORDER[a.signal] - SIGNAL_ORDER[b.signal];
      return sortAsc ? cmp : -cmp;
    });
  }, [events, now, signalFilter, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(true); }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return null;
    return sortAsc
      ? <ArrowUpward sx={{ fontSize: 12, ml: 0.25, verticalAlign: 'middle' }} />
      : <ArrowDownward sx={{ fontSize: 12, ml: 0.25, verticalAlign: 'middle' }} />;
  }

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
              {/* Performance table — 3/4 width */}
              <Grid size={{ xs: 12, lg: 9 }} sx={{ minWidth: 0 }}>
                <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: `1px solid ${BRAND.border}`, overflow: 'hidden' }}>
                  {/* Table header */}
                  <Box sx={{ px: 2.5, pt: 2.5, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: BRAND.dark, fontSize: 15 }}>
                        Event Performance
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: BRAND.textSecondary, mt: 0.25 }}>
                        {hotCount > 0 && <span style={{ color: BRAND.error, fontWeight: 600 }}>{hotCount} hot</span>}
                        {hotCount > 0 && slowCount > 0 && ' · '}
                        {slowCount > 0 && <span style={{ color: BRAND.warning, fontWeight: 600 }}>{slowCount} need attention</span>}
                        {hotCount === 0 && slowCount === 0 && 'All events on track'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <ToggleButtonGroup
                        value={signalFilter}
                        exclusive
                        onChange={(_, v) => v && setSignalFilter(v)}
                        size="small"
                        sx={{ '& .MuiToggleButton-root': { py: 0.4, px: 1.2, fontSize: 11, fontWeight: 600, textTransform: 'none', border: `1px solid ${BRAND.border}`, borderRadius: '8px !important', '&.Mui-selected': { bgcolor: BRAND.primary + '15', color: BRAND.primary, borderColor: BRAND.primary + '40' } } }}
                      >
                        <ToggleButton value="all">All</ToggleButton>
                        <ToggleButton value="hot">🔥 Hot</ToggleButton>
                        <ToggleButton value="slow">⚠ Slow</ToggleButton>
                      </ToggleButtonGroup>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => router.push('/dashboard/organizer/events')}
                        sx={{ bgcolor: BRAND.primary, borderRadius: '20px', textTransform: 'none', px: 2, fontWeight: 600, fontSize: 12, boxShadow: 'none', '&:hover': { bgcolor: BRAND.primaryHover } }}
                      >
                        New Event
                      </Button>
                    </Box>
                  </Box>

                  {loadingEvents ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                      <CircularProgress sx={{ color: BRAND.primary }} />
                    </Box>
                  ) : eventsError ? (
                    <Box sx={{ p: 3, m: 2, bgcolor: BRAND.errorBg, borderRadius: '12px' }}>
                      <Typography sx={{ color: BRAND.error, fontSize: 14 }}>{t('messages.error.loadFailed', { item: t('common.entities.event') })}</Typography>
                    </Box>
                  ) : events.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                      <EventIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 1.5 }} />
                      <Typography sx={{ fontWeight: 700, color: BRAND.dark, mb: 0.5 }}>{t('organizer.noEventsYet')}</Typography>
                      <Typography sx={{ fontSize: 13, color: BRAND.textSecondary, mb: 3 }}>{t('organizer.createFirstEvent')}</Typography>
                      <Button variant="contained" startIcon={<Add />} onClick={() => router.push('/dashboard/organizer/events')}
                        sx={{ bgcolor: BRAND.primary, borderRadius: '12px', textTransform: 'none', fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: BRAND.primaryHover } }}>
                        {t('organizer.goToEvents')}
                      </Button>
                    </Box>
                  ) : (
                    <TableContainer sx={{ maxHeight: 420, '&::-webkit-scrollbar': { width: 4, height: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: BRAND.borderLight, borderRadius: 4 } }}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow sx={{ '& th': { bgcolor: BRAND.bgSurface, fontWeight: 700, fontSize: 11, color: BRAND.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${BRAND.border}`, py: 1.25 } }}>
                            <TableCell sx={{ pl: 2.5 }}>Event</TableCell>
                            <TableCell
                              onClick={() => toggleSort('soldPct')}
                              sx={{ cursor: 'pointer', userSelect: 'none', minWidth: 140 }}
                            >
                              Tickets sold <SortIcon k="soldPct" />
                            </TableCell>
                            <TableCell
                              onClick={() => toggleSort('signal')}
                              sx={{ cursor: 'pointer', userSelect: 'none' }}
                            >
                              Signal <SortIcon k="signal" />
                            </TableCell>
                            <TableCell
                              onClick={() => toggleSort('daysUntil')}
                              sx={{ cursor: 'pointer', userSelect: 'none' }}
                            >
                              Event in <SortIcon k="daysUntil" />
                            </TableCell>
                            <TableCell sx={{ pr: 2 }}>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {tableRows.map((e) => {
                            const pct = e.soldPercentage ?? 0;
                            const total = e.totalTickets;
                            const sold = e.soldTickets;
                            const barColor = pct >= 80 ? BRAND.error : pct >= 50 ? BRAND.success : pct >= 30 ? BRAND.warning : BRAND.textMuted;
                            const daysLabel =
                              e.daysUntil < 0 ? `${Math.abs(e.daysUntil)}d ago` :
                              e.daysUntil === 0 ? 'Today' :
                              `${e.daysUntil}d`;

                            return (
                              <TableRow
                                key={e.id}
                                hover
                                onClick={() => router.push(`/dashboard/organizer/events/${e.id}`)}
                                sx={{ cursor: 'pointer', '& td': { borderBottom: `1px solid ${BRAND.border}`, py: 1.25, fontSize: 13 }, '&:last-child td': { borderBottom: 0 }, '&:hover': { bgcolor: BRAND.bgSurface } }}
                              >
                                <TableCell sx={{ pl: 2.5, maxWidth: 220 }}>
                                  <Typography sx={{ fontWeight: 600, color: BRAND.dark, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {e.title}
                                  </Typography>
                                  <StatusChip status={e.status} />
                                </TableCell>
                                <TableCell sx={{ minWidth: 140 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ flex: 1, minWidth: 60 }}>
                                      <LinearProgress
                                        variant="determinate"
                                        value={Math.min(pct, 100)}
                                        sx={{
                                          height: 5,
                                          borderRadius: 3,
                                          bgcolor: barColor + '20',
                                          '& .MuiLinearProgress-bar': { bgcolor: barColor, borderRadius: 3 },
                                        }}
                                      />
                                    </Box>
                                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: barColor, minWidth: 36 }}>
                                      {pct.toFixed(0)}%
                                    </Typography>
                                  </Box>
                                  {total != null && sold != null && (
                                    <Typography sx={{ fontSize: 11, color: BRAND.textMuted, mt: 0.25 }}>
                                      {sold} / {total}
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <SignalChip signal={e.signal} />
                                </TableCell>
                                <TableCell>
                                  <Tooltip title={dayjs(e.startAt).format('DD/MM/YYYY HH:mm')}>
                                    <Typography sx={{ fontSize: 12, color: e.daysUntil >= 0 && e.daysUntil < 7 ? BRAND.warning : BRAND.textSecondary, fontWeight: e.daysUntil < 7 && e.daysUntil >= 0 ? 700 : 400 }}>
                                      {daysLabel}
                                    </Typography>
                                  </Tooltip>
                                </TableCell>
                                <TableCell sx={{ pr: 2 }}>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={(ev) => { ev.stopPropagation(); router.push(`/dashboard/organizer/events/${e.id}`); }}
                                    sx={{ fontSize: 11, py: 0.25, px: 1.25, borderRadius: '8px', textTransform: 'none', borderColor: BRAND.border, color: BRAND.textSecondary, '&:hover': { borderColor: BRAND.primary, color: BRAND.primary } }}
                                  >
                                    View
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}

                  {tableRows.length > 0 && (
                    <Box sx={{ px: 2.5, py: 1.5, borderTop: `1px solid ${BRAND.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: 12, color: BRAND.textMuted }}>
                        Showing {tableRows.length} of {totalEvents} events
                      </Typography>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => router.push('/dashboard/organizer/events')}
                        sx={{ fontSize: 12, textTransform: 'none', color: BRAND.primary, fontWeight: 600 }}
                      >
                        {t('organizer.viewAllEvents')} →
                      </Button>
                    </Box>
                  )}
                </Box>

                {/* All Events cards */}
                {events.length > 0 && (
                  <Box sx={{ mt: 2.5 }}>
                    <Box sx={{ mb: 1.5 }}>
                      <Typography sx={{ fontWeight: 700, color: BRAND.dark, fontSize: 15 }}>
                        {t('organizer.allEvents')}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 3,
                        overflowX: 'auto',
                        pb: 1,
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
                  </Box>
                )}
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
