'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  CircularProgress,
  Avatar,
  ToggleButtonGroup,
  ToggleButton,
  Pagination,
} from '@mui/material';
import { Search as SearchIcon, Event as EventIcon } from '@mui/icons-material';
import AdminLayout from '@/src/components/layout/AdminLayout';
import AdminPageShell from '@/src/components/AdminSidebar/AdminPageShell';
import RoleGuard from '@/src/components/RoleGuard';
import { useGetMyEventsQuery } from '@/src/stores/services/EventApi';
import { EventStatus } from '@/src/stores/types/enums';
import { ADMIN } from '@/src/utils/constants/adminBrand';
import dayjs from 'dayjs';

type FilterMode = 'all' | EventStatus;

const STATUS_META: Record<EventStatus, { label: string; bg: string; color: string }> = {
  [EventStatus.DRAFT]:     { label: 'Draft',     bg: ADMIN.pageBg,    color: ADMIN.textSecondary },
  [EventStatus.PUBLISHED]: { label: 'Published', bg: ADMIN.infoBg,    color: ADMIN.infoText },
  [EventStatus.ONGOING]:   { label: 'Ongoing',   bg: ADMIN.successBg, color: ADMIN.successText },
  [EventStatus.COMPLETED]: { label: 'Completed', bg: ADMIN.pageBg,    color: ADMIN.textMuted },
  [EventStatus.CANCELLED]: { label: 'Cancelled', bg: ADMIN.errorBg,   color: ADMIN.errorText },
};

export default function AdminEventsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [page, setPage] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useGetMyEventsQuery({
    page,
    size: 20,
    keyword: debouncedSearch || undefined,
    status: filter !== 'all' ? filter : undefined,
  });

  const events = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  const fmt = (n: number) => n > 0 ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n) : 'Free';

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <AdminLayout>
        <AdminPageShell
          title="Events"
          breadcrumbs={[{ label: 'Admin', href: '/dashboard/admin' }, { label: 'Events' }]}
        >
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search events…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 240, bgcolor: ADMIN.cardBg, borderRadius: '8px' }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: ADMIN.textMuted }} /></InputAdornment> }}
            />
            <ToggleButtonGroup
              value={filter}
              exclusive
              onChange={(_, v) => { if (v) { setFilter(v); setPage(0); } }}
              size="small"
              sx={{ flexWrap: 'wrap' }}
            >
              <ToggleButton value="all" sx={{ textTransform: 'none', fontSize: 12 }}>All</ToggleButton>
              {Object.values(EventStatus).map((s) => (
                <ToggleButton key={s} value={s} sx={{ textTransform: 'none', fontSize: 12 }}>
                  {STATUS_META[s].label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <Card sx={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${ADMIN.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress sx={{ color: ADMIN.primary }} />
              </Box>
            ) : events.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <EventIcon sx={{ fontSize: 48, color: ADMIN.border, mb: 1 }} />
                <Typography sx={{ color: ADMIN.textSecondary }}>No events found</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: ADMIN.pageBg }}>
                      {['Event', 'Organizer', 'Category / Venue', 'Date', 'Status', 'Min Price', 'Sold%'].map((h) => (
                        <TableCell key={h} sx={{ fontWeight: 600, color: ADMIN.heading, fontSize: 12, borderBottom: `1px solid ${ADMIN.border}` }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {events.map((event) => {
                      const meta = STATUS_META[event.status as EventStatus];
                      return (
                        <TableRow key={event.id} sx={{ '&:hover': { bgcolor: ADMIN.surfaceBg } }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar src={event.coverUrl} variant="rounded" sx={{ width: 36, height: 36, bgcolor: ADMIN.infoBg, flexShrink: 0 }}>
                                <EventIcon sx={{ color: ADMIN.primary, fontSize: 18 }} />
                              </Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: ADMIN.heading, maxWidth: 180 }} noWrap>
                                {event.title}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: ADMIN.body }}>{event.organizerName ?? '—'}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: ADMIN.body }}>{event.categoryName}</Typography>
                            <Typography variant="caption" sx={{ color: ADMIN.textMuted }}>{event.venueName}, {event.city}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: 12, color: ADMIN.body }}>{dayjs(event.startAt).format('DD/MM/YY HH:mm')}</Typography>
                            <Typography variant="caption" sx={{ color: ADMIN.textMuted }}>→ {dayjs(event.endAt).format('DD/MM/YY HH:mm')}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={meta.label} size="small" sx={{ bgcolor: meta.bg, color: meta.color, fontWeight: 600, fontSize: 11 }} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: 12, color: ADMIN.body }}>{fmt(event.minPrice)}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: 12, color: ADMIN.body, mb: 0.5 }}>
                              {Math.round(event.soldPercentage ?? 0)}%
                            </Typography>
                            <Box sx={{ width: 56, height: 4, borderRadius: 2, bgcolor: ADMIN.border, overflow: 'hidden' }}>
                              <Box sx={{
                                height: '100%',
                                width: `${Math.min(event.soldPercentage ?? 0, 100)}%`,
                                bgcolor: (event.soldPercentage ?? 0) >= 90 ? ADMIN.error : (event.soldPercentage ?? 0) >= 60 ? ADMIN.warning : ADMIN.success,
                                borderRadius: 2,
                              }} />
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination count={totalPages} page={page + 1} onChange={(_, v) => setPage(v - 1)} shape="rounded" color="primary" />
            </Box>
          )}
        </AdminPageShell>
      </AdminLayout>
    </RoleGuard>
  );
}
