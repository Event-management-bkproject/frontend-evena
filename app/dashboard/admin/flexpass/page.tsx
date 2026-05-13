'use client';

import { useState, useMemo } from 'react';
import {
  Box, Card, Typography, Chip, TextField, InputAdornment,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  CircularProgress, ToggleButtonGroup, ToggleButton, Tabs, Tab,
} from '@mui/material';
import { Search as SearchIcon, SwapHoriz as FlexPassIcon } from '@mui/icons-material';
import AdminLayout from '@/src/components/layout/AdminLayout';
import AdminPageShell from '@/src/components/AdminSidebar/AdminPageShell';
import RoleGuard from '@/src/components/RoleGuard';
import { useGetOrganizerListingsQuery } from '@/src/stores/services/FlexPassApi';
import { useGetAdminSaleWindowsQuery } from '@/src/stores/services/FlexPassApi';
import { FlexPassListingStatus, FlexPassSaleWindowStatus } from '@/src/stores/types/flexpass';
import { ADMIN } from '@/src/utils/constants/adminBrand';
import dayjs from 'dayjs';

// ─── Status configs ───────────────────────────────────────────────────────────

const LISTING_STATUS_META: Record<FlexPassListingStatus, { label: string; bg: string; color: string }> = {
  [FlexPassListingStatus.PENDING_APPROVAL]: { label: 'Pending',        bg: ADMIN.warningBg,  color: ADMIN.warningText  },
  [FlexPassListingStatus.APPROVED]:         { label: 'Approved',       bg: ADMIN.successBg,  color: ADMIN.successText  },
  [FlexPassListingStatus.PRICE_LOCKED]:     { label: 'Price Locked',   bg: ADMIN.infoBg,     color: ADMIN.infoText     },
  [FlexPassListingStatus.PAYMENT_PENDING]:  { label: 'Paying',         bg: ADMIN.warningBg,  color: ADMIN.warningText  },
  [FlexPassListingStatus.COMPLETED]:        { label: 'Sold',           bg: ADMIN.successBg,  color: ADMIN.successText  },
  [FlexPassListingStatus.FAILED]:           { label: 'Failed',         bg: ADMIN.errorBg,    color: ADMIN.errorText    },
  [FlexPassListingStatus.REJECTED]:         { label: 'Rejected',       bg: ADMIN.errorBg,    color: ADMIN.errorText    },
  [FlexPassListingStatus.CANCELLED]:        { label: 'Cancelled',      bg: ADMIN.pageBg,     color: ADMIN.textMuted    },
  [FlexPassListingStatus.EXPIRED]:          { label: 'Expired',        bg: ADMIN.pageBg,     color: ADMIN.textMuted    },
};

const WINDOW_STATUS_META: Record<FlexPassSaleWindowStatus, { label: string; bg: string; color: string }> = {
  [FlexPassSaleWindowStatus.SCHEDULED]: { label: 'Scheduled', bg: ADMIN.infoBg,    color: ADMIN.infoText    },
  [FlexPassSaleWindowStatus.OPENED]:    { label: 'Active',    bg: ADMIN.successBg, color: ADMIN.successText },
  [FlexPassSaleWindowStatus.CLOSED]:    { label: 'Closed',    bg: ADMIN.pageBg,    color: ADMIN.textMuted   },
  [FlexPassSaleWindowStatus.CANCELLED]: { label: 'Cancelled', bg: ADMIN.errorBg,   color: ADMIN.errorText   },
};

type ListingFilter = 'all' | FlexPassListingStatus;

const LISTING_FILTERS: { value: ListingFilter; label: string }[] = [
  { value: 'all',                                   label: 'All'          },
  { value: FlexPassListingStatus.PENDING_APPROVAL,  label: 'Pending'      },
  { value: FlexPassListingStatus.APPROVED,          label: 'Approved'     },
  { value: FlexPassListingStatus.PRICE_LOCKED,      label: 'Price Locked' },
  { value: FlexPassListingStatus.COMPLETED,         label: 'Sold'         },
  { value: FlexPassListingStatus.REJECTED,          label: 'Rejected'     },
  { value: FlexPassListingStatus.EXPIRED,           label: 'Expired'      },
];

function fmt(n: number) {
  return n.toLocaleString('vi-VN') + ' ₫';
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminFlexPassPage() {
  const [tab, setTab]       = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ListingFilter>('all');

  const { data: listingsData, isLoading: listingsLoading } = useGetOrganizerListingsQuery();
  const { data: windowsData,  isLoading: windowsLoading  } = useGetAdminSaleWindowsQuery();

  const allListings = listingsData?.data ?? [];
  const allWindows  = windowsData?.data  ?? [];

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    allListings.length,
    pending:  allListings.filter((l) => l.status === FlexPassListingStatus.PENDING_APPROVAL).length,
    approved: allListings.filter((l) => l.status === FlexPassListingStatus.APPROVED).length,
    locked:   allListings.filter((l) => l.status === FlexPassListingStatus.PRICE_LOCKED).length,
    sold:     allListings.filter((l) => l.status === FlexPassListingStatus.COMPLETED).length,
  }), [allListings]);

  // ── Filtered listings ──────────────────────────────────────────────────────
  const filteredListings = useMemo(() => {
    let list = filter !== 'all' ? allListings.filter((l) => l.status === filter) : allListings;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          l.eventTitle.toLowerCase().includes(q) ||
          l.sellerName.toLowerCase().includes(q) ||
          l.ticketTypeName.toLowerCase().includes(q),
      );
    }
    return list;
  }, [allListings, filter, search]);

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <AdminLayout>
        <AdminPageShell
          title="FlexPass"
          breadcrumbs={[{ label: 'Admin', href: '/dashboard/admin' }, { label: 'FlexPass' }]}
        >

          {/* Stats */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(5, 1fr)' }, gap: 2, mb: 3 }}>
            {[
              { label: 'Total Listings', value: stats.total },
              { label: 'Pending Approval', value: stats.pending, highlight: ADMIN.warningText },
              { label: 'Approved', value: stats.approved, highlight: ADMIN.successText },
              { label: 'Price Locked', value: stats.locked, highlight: ADMIN.infoText },
              { label: 'Sold', value: stats.sold, highlight: ADMIN.successText },
            ].map(({ label, value, highlight }) => (
              <Card key={label} sx={{ p: 2, borderRadius: '12px', border: `1px solid ${ADMIN.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: highlight ?? ADMIN.heading }}>
                  {listingsLoading ? <CircularProgress size={18} /> : value}
                </Typography>
                <Typography variant="body2" sx={{ color: ADMIN.textSecondary, fontSize: 12 }}>{label}</Typography>
              </Card>
            ))}
          </Box>

          {/* Tabs */}
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ mb: 2, borderBottom: `1px solid ${ADMIN.border}` }}
            TabIndicatorProps={{ style: { backgroundColor: ADMIN.primary } }}
          >
            <Tab label="Listings" sx={{ textTransform: 'none', fontSize: 13, color: tab === 0 ? ADMIN.primary : ADMIN.textSecondary }} />
            <Tab label="Sale Windows" sx={{ textTransform: 'none', fontSize: 13, color: tab === 1 ? ADMIN.primary : ADMIN.textSecondary }} />
          </Tabs>

          {/* ── Listings tab ── */}
          {tab === 0 && (
            <>
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                  size="small"
                  placeholder="Search by event, seller, ticket type…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{ minWidth: 260, bgcolor: ADMIN.cardBg, borderRadius: '8px' }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: ADMIN.textMuted }} /></InputAdornment> }}
                />
                <ToggleButtonGroup value={filter} exclusive onChange={(_, v) => v && setFilter(v)} size="small">
                  {LISTING_FILTERS.map(({ value, label }) => (
                    <ToggleButton key={value} value={value} sx={{ textTransform: 'none', fontSize: 12 }}>
                      {label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>

              <Card sx={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${ADMIN.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                {listingsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress sx={{ color: ADMIN.primary }} />
                  </Box>
                ) : filteredListings.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <FlexPassIcon sx={{ fontSize: 48, color: ADMIN.border, mb: 1 }} />
                    <Typography sx={{ color: ADMIN.textSecondary }}>No listings found</Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: ADMIN.pageBg }}>
                          {['ID', 'Seller', 'Event', 'Ticket Type', 'Original', 'Submitted', 'Final', 'Status', 'Created'].map((h) => (
                            <TableCell key={h} sx={{ fontWeight: 600, color: ADMIN.heading, fontSize: 12, borderBottom: `1px solid ${ADMIN.border}` }}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredListings.map((l) => {
                          const meta = LISTING_STATUS_META[l.status] ?? { label: l.status, bg: ADMIN.pageBg, color: ADMIN.textMuted };
                          return (
                            <TableRow key={l.id} sx={{ '&:hover': { bgcolor: ADMIN.surfaceBg } }}>
                              <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: ADMIN.heading }}>#{l.id}</Typography></TableCell>
                              <TableCell><Typography variant="body2" sx={{ fontWeight: 500, color: ADMIN.body }}>{l.sellerName}</Typography></TableCell>
                              <TableCell><Typography variant="body2" sx={{ maxWidth: 160, color: ADMIN.body }} noWrap>{l.eventTitle}</Typography></TableCell>
                              <TableCell><Typography variant="body2" sx={{ color: ADMIN.body }}>{l.ticketTypeName}</Typography></TableCell>
                              <TableCell><Typography variant="body2" sx={{ fontSize: 12, color: ADMIN.body }}>{fmt(l.originalPrice)}</Typography></TableCell>
                              <TableCell><Typography variant="body2" sx={{ fontSize: 12, color: ADMIN.body }}>{fmt(l.submittedPrice)}</Typography></TableCell>
                              <TableCell><Typography variant="body2" sx={{ fontSize: 12, color: ADMIN.body }}>{l.finalPrice != null ? fmt(l.finalPrice) : '—'}</Typography></TableCell>
                              <TableCell><Chip label={meta.label} size="small" sx={{ bgcolor: meta.bg, color: meta.color, fontWeight: 600, fontSize: 11 }} /></TableCell>
                              <TableCell><Typography variant="body2" sx={{ fontSize: 12, color: ADMIN.body }}>{dayjs(l.createdAt).format('DD/MM/YY HH:mm')}</Typography></TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Card>
            </>
          )}

          {/* ── Sale Windows tab ── */}
          {tab === 1 && (
            <Card sx={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${ADMIN.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              {windowsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress sx={{ color: ADMIN.primary }} />
                </Box>
              ) : allWindows.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <FlexPassIcon sx={{ fontSize: 48, color: ADMIN.border, mb: 1 }} />
                  <Typography sx={{ color: ADMIN.textSecondary }}>No sale windows</Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: ADMIN.pageBg }}>
                        {['ID', 'Event', 'Pricing Method', 'Start', 'End', 'Listings', 'Status'].map((h) => (
                          <TableCell key={h} sx={{ fontWeight: 600, color: ADMIN.heading, fontSize: 12, borderBottom: `1px solid ${ADMIN.border}` }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allWindows.map((w) => {
                        const meta = WINDOW_STATUS_META[w.status] ?? { label: w.status, bg: ADMIN.pageBg, color: ADMIN.textMuted };
                        return (
                          <TableRow key={w.id} sx={{ '&:hover': { bgcolor: ADMIN.surfaceBg } }}>
                            <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: ADMIN.heading }}>#{w.id}</Typography></TableCell>
                            <TableCell><Typography variant="body2" sx={{ maxWidth: 180, color: ADMIN.body }} noWrap>{w.eventTitle}</Typography></TableCell>
                            <TableCell><Typography variant="body2" sx={{ color: ADMIN.body }}>{w.pricingMethod}</Typography></TableCell>
                            <TableCell><Typography variant="body2" sx={{ fontSize: 12, color: ADMIN.body }}>{dayjs(w.startAt).format('DD/MM/YY HH:mm')}</Typography></TableCell>
                            <TableCell><Typography variant="body2" sx={{ fontSize: 12, color: ADMIN.body }}>{dayjs(w.endAt).format('DD/MM/YY HH:mm')}</Typography></TableCell>
                            <TableCell><Typography variant="body2" sx={{ color: ADMIN.body }}>{w.prices.length} types</Typography></TableCell>
                            <TableCell><Chip label={meta.label} size="small" sx={{ bgcolor: meta.bg, color: meta.color, fontWeight: 600, fontSize: 11 }} /></TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Card>
          )}

        </AdminPageShell>
      </AdminLayout>
    </RoleGuard>
  );
}
