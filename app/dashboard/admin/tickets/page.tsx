'use client';

import { useState, useEffect } from 'react';
import {
  Box, Card, Typography, Chip, TextField, InputAdornment,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  CircularProgress, ToggleButtonGroup, ToggleButton, Pagination,
} from '@mui/material';
import { Search as SearchIcon, ConfirmationNumber as TicketsIcon } from '@mui/icons-material';
import AdminLayout from '@/src/components/layout/AdminLayout';
import AdminPageShell from '@/src/components/AdminSidebar/AdminPageShell';
import RoleGuard from '@/src/components/RoleGuard';
import { useGetAdminTicketsQuery } from '@/src/stores/services/OrderApi';
import { TicketStatus } from '@/src/stores/types/order';
import { ADMIN } from '@/src/utils/constants/adminBrand';
import dayjs from 'dayjs';

type FilterMode = 'all' | TicketStatus;

const STATUS_META: Record<TicketStatus, { label: string; bg: string; color: string }> = {
  [TicketStatus.ACTIVE]:          { label: 'Active',          bg: ADMIN.successBg, color: ADMIN.successText },
  [TicketStatus.TRANSFER_LOCKED]: { label: 'Transfer Locked', bg: ADMIN.warningBg, color: ADMIN.warningText },
  [TicketStatus.USED]:            { label: 'Used',            bg: ADMIN.infoBg,    color: ADMIN.infoText },
  [TicketStatus.CANCELLED]:       { label: 'Cancelled',       bg: ADMIN.errorBg,   color: ADMIN.errorText },
  [TicketStatus.EXPIRED]:         { label: 'Expired',         bg: ADMIN.pageBg,    color: ADMIN.textMuted },
};

export default function AdminTicketsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [page, setPage] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useGetAdminTicketsQuery({
    page,
    size: 20,
    status: filter !== 'all' ? filter : undefined,
    keyword: debouncedSearch || undefined,
  });

  const tickets = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const totalElements = data?.data?.totalElements ?? 0;

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <AdminLayout>
        <AdminPageShell
          title="Tickets"
          breadcrumbs={[{ label: 'Admin', href: '/dashboard/admin' }, { label: 'Tickets' }]}
        >
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search by event or ticket type…"
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
            >
              <ToggleButton value="all" sx={{ textTransform: 'none', fontSize: 12 }}>All</ToggleButton>
              {Object.values(TicketStatus).map((s) => (
                <ToggleButton key={s} value={s} sx={{ textTransform: 'none', fontSize: 12 }}>
                  {STATUS_META[s].label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            {!isLoading && (
              <Typography variant="body2" sx={{ color: ADMIN.textMuted, ml: 'auto' }}>
                {totalElements} result{totalElements !== 1 ? 's' : ''}
              </Typography>
            )}
          </Box>

          <Card sx={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${ADMIN.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress sx={{ color: ADMIN.primary }} />
              </Box>
            ) : tickets.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <TicketsIcon sx={{ fontSize: 48, color: ADMIN.border, mb: 1 }} />
                <Typography sx={{ color: ADMIN.textSecondary }}>No tickets found</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: ADMIN.pageBg }}>
                      {['ID', 'Buyer', 'Event', 'Type', 'Venue', 'Event Date', 'Status', 'Issued', 'Used At'].map((h) => (
                        <TableCell key={h} sx={{ fontWeight: 600, color: ADMIN.heading, fontSize: 12, borderBottom: `1px solid ${ADMIN.border}` }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tickets.map((t) => {
                      const meta = STATUS_META[t.status as TicketStatus];
                      return (
                        <TableRow key={t.id} sx={{ '&:hover': { bgcolor: ADMIN.surfaceBg } }}>
                          <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: ADMIN.heading }}>#{t.id}</Typography></TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: ADMIN.body }}>{t.buyerName ?? '—'}</Typography>
                            <Typography variant="caption" sx={{ color: ADMIN.textMuted }}>{t.buyerEmail}</Typography>
                          </TableCell>
                          <TableCell><Typography variant="body2" sx={{ maxWidth: 160, color: ADMIN.body }} noWrap>{t.eventTitle}</Typography></TableCell>
                          <TableCell><Typography variant="body2" sx={{ color: ADMIN.body }}>{t.ticketTypeName}</Typography></TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: 12, color: ADMIN.body }}>{t.venueName}</Typography>
                            <Typography variant="caption" sx={{ color: ADMIN.textMuted }}>{t.venueAddress}</Typography>
                          </TableCell>
                          <TableCell><Typography variant="body2" sx={{ fontSize: 12, color: ADMIN.body }}>{dayjs(t.eventStartAt).format('DD/MM/YY HH:mm')}</Typography></TableCell>
                          <TableCell><Chip label={meta.label} size="small" sx={{ bgcolor: meta.bg, color: meta.color, fontWeight: 600, fontSize: 11 }} /></TableCell>
                          <TableCell><Typography variant="body2" sx={{ fontSize: 12, color: ADMIN.body }}>{dayjs(t.issuedAt).format('DD/MM/YY HH:mm')}</Typography></TableCell>
                          <TableCell><Typography variant="body2" sx={{ fontSize: 12, color: ADMIN.body }}>{t.usedAt ? dayjs(t.usedAt).format('DD/MM/YY HH:mm') : '—'}</Typography></TableCell>
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
