'use client';

import { useState, useMemo, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField, InputBase, MenuItem, Select } from '@mui/material';
import {
  ConfirmationNumber as TicketIcon,
  ShoppingBag as ShoppingBagIcon,
  TrendingUp as TrendingUpIcon,
  ErrorOutline as AlertIcon,
  CheckCircleOutline as ApproveIcon,
  HighlightOff as RejectIcon,
  AccessTime as ClockIcon,
  CalendarToday as CalendarIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  BarChart as AnalyticsIcon,
  Schedule as ScheduleIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import ProtectedContent from '@/src/components/ProtectedContent';
import LayoutWithSidebar from '@/src/components/layout/LayoutWithSidebar';
import DashboardHeader from '@/src/components/DashboardHeader/DashboardHeader';
import { BRAND } from '@/src/utils/constants/constant';
import { FlexStatsCard } from '@/src/components/FlexPassAdmin/FlexStatsCard';
import { SaleWindowPanel } from '@/src/components/FlexPassAdmin/SaleWindowPanel';
import { useSSE } from '@/src/providers/SSEProvider';
import { SSENormalizedType } from '@/src/stores/types/sse';
import {
  useGetOrganizerListingsQuery,
  useApproveListingMutation,
  useRejectListingMutation,
} from '@/src/stores/services/FlexPassApi';
import { FlexPassListingResponse, FlexPassListingStatus } from '@/src/stores/types/flexpass';
import { format, parseISO } from 'date-fns';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number) {
  return amount.toLocaleString('vi-VN') + ' ₫';
}

function formatDate(iso: string) {
  try { return format(parseISO(iso), 'dd/MM/yyyy'); } catch { return iso; }
}

function statusBadge(status: FlexPassListingStatus) {
  const map: Record<string, { label: string; bg: string; color: string; border: string }> = {
    PENDING_APPROVAL: { label: 'Pending',  bg: '#fffbeb', color: '#92400e', border: '#fcd34d' },
    APPROVED:         { label: 'Approved', bg: '#ecfdf5', color: '#065f46', border: '#6ee7b7' },
    PRICE_LOCKED:     { label: 'Price Locked', bg: '#eff6ff', color: '#1e40af', border: '#93c5fd' },
    REJECTED:         { label: 'Rejected', bg: '#fef2f2', color: '#991b1b', border: '#fca5a5' },
    CANCELLED:        { label: 'Cancelled', bg: '#f7f7f7', color: '#717182', border: '#e5e7eb' },
    EXPIRED:          { label: 'Expired',   bg: '#f7f7f7', color: '#717182', border: '#e5e7eb' },
    PAYMENT_PENDING:  { label: 'Payment Pending', bg: '#fffbeb', color: '#92400e', border: '#fcd34d' },
    COMPLETED:        { label: 'Sold',      bg: '#ecfdf5', color: '#065f46', border: '#6ee7b7' },
    FAILED:           { label: 'Failed',    bg: '#fef2f2', color: '#991b1b', border: '#fca5a5' },
  };
  return map[status] ?? { label: status, bg: '#f7f7f7', color: '#717182', border: '#e5e7eb' };
}

type StatusFilter = 'ALL' | 'PENDING_APPROVAL' | 'APPROVED' | 'PRICE_LOCKED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL',              label: 'All' },
  { value: 'PENDING_APPROVAL', label: 'Pending' },
  { value: 'APPROVED',         label: 'Approved' },
  { value: 'PRICE_LOCKED',     label: 'Price Locked' },
  { value: 'REJECTED',         label: 'Rejected' },
  { value: 'CANCELLED',        label: 'Cancelled' },
  { value: 'EXPIRED',          label: 'Expired' },
];

// ─── Reject Dialog ────────────────────────────────────────────────────────────

interface RejectDialogProps {
  listingId: number | null;
  eventTitle: string;
  onClose: () => void;
  onConfirm: (listingId: number, reason: string) => void;
  loading: boolean;
}

function RejectDialog({ listingId, eventTitle, onClose, onConfirm, loading }: RejectDialogProps) {
  const [reason, setReason] = useState('');
  const open = listingId !== null;

  const handleConfirm = () => {
    if (listingId !== null) onConfirm(listingId, reason);
  };

  useEffect(() => { if (!open) setReason(''); }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: '16px', p: '8px' } }}>
      <DialogTitle sx={{ fontSize: 16, fontWeight: 700, pb: '4px' }}>Reject Listing</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ fontSize: 13, color: '#717182', mb: '16px' }}>
          Reject FlexPass listing for <strong>{eventTitle}</strong>? The ticket will be unlocked.
        </DialogContentText>
        <TextField
          fullWidth
          label="Reason (optional)"
          multiline
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          inputProps={{ maxLength: 500 }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: 13 } }}
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: '24px', pb: '16px' }}>
        <Button onClick={onClose} variant="text" sx={{ color: '#717182', textTransform: 'none' }}>Cancel</Button>
        <Button onClick={handleConfirm} variant="contained" color="error" disabled={loading}
          sx={{ textTransform: 'none', borderRadius: '8px', minWidth: 110 }}>
          {loading ? 'Rejecting…' : 'Reject Listing'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Listing Card ──────────────────────────────────────────────────────────────

interface ListingCardProps {
  listing: FlexPassListingResponse;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  approveLoading: boolean;
}

function ListingCard({ listing, onApprove, onReject, approveLoading }: ListingCardProps) {
  const sc = statusBadge(listing.status);
  const priceChange = listing.submittedPrice && listing.originalPrice
    ? ((listing.submittedPrice - listing.originalPrice) / listing.originalPrice) * 100
    : 0;
  const displayPrice = listing.finalPrice ?? listing.submittedPrice;
  const sellerInitials = listing.sellerName
    ? listing.sellerName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  return (
    <Box sx={{ bgcolor: 'white', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)', p: '16px',
      minWidth: 0, overflow: 'hidden',
      transition: 'border-color 0.2s', '&:hover': { borderColor: BRAND.primary } }}>
      <Box sx={{ display: 'flex', gap: '14px', minWidth: 0 }}>
        <Box sx={{ width: 52, height: 52, borderRadius: '10px',
          background: 'linear-gradient(135deg, #f36bf9 0%, #a855f7 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
          🎫
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: '6px', gap: '8px' }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#030213', mb: '2px',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {listing.eventTitle} · {listing.ticketTypeName}
              </Typography>
              <Typography sx={{ fontSize: 11, color: '#717182' }}>
                Listing #{listing.id} · Ticket #{listing.ticketId}
              </Typography>
            </Box>
            <Box sx={{ flexShrink: 0, fontSize: 11, fontWeight: 600, px: '10px', py: '3px',
              borderRadius: '20px', bgcolor: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, whiteSpace: 'nowrap' }}>
              {sc.label}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mb: '8px' }}>
            <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#eef0ff', color: BRAND.darkSecondary,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700 }}>
              {sellerInitials}
            </Box>
            <Typography sx={{ fontSize: 12, color: '#717182' }}>{listing.sellerName}</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '8px', mb: listing.status === 'PENDING_APPROVAL' ? '12px' : '8px' }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#030213' }}>{formatCurrency(displayPrice)}</Typography>
            <Typography sx={{ fontSize: 12, color: '#717182', textDecoration: 'line-through' }}>{formatCurrency(listing.originalPrice)}</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: priceChange === 0 ? '#717182' : '#10b981' }}>
              {priceChange === 0 ? 'Face value' : `+${priceChange.toFixed(0)}%`}
            </Typography>
          </Box>

          {listing.status === FlexPassListingStatus.PENDING_APPROVAL && (
            <Box sx={{ display: 'flex', gap: '8px' }}>
              <Button size="small" variant="outlined" color="error" startIcon={<RejectIcon />}
                onClick={() => onReject(listing.id)}
                sx={{ flex: 1, textTransform: 'none', borderRadius: '8px', fontSize: 12 }}>
                Reject
              </Button>
              <Button size="small" variant="contained" color="success" startIcon={<ApproveIcon />}
                disabled={approveLoading} onClick={() => onApprove(listing.id)}
                sx={{ flex: 1, textTransform: 'none', borderRadius: '8px', fontSize: 12 }}>
                {approveLoading ? 'Approving…' : 'Approve'}
              </Button>
            </Box>
          )}

          {listing.rejectionReason && (
            <Typography sx={{ fontSize: 11, color: '#b91c1c', mt: '6px', fontStyle: 'italic' }}>
              Reason: {listing.rejectionReason}
            </Typography>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', mt: '6px' }}>
            <ClockIcon sx={{ fontSize: 11, color: '#717182' }} />
            <Typography sx={{ fontSize: 11, color: '#717182' }}>Listed {formatDate(listing.createdAt)}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Event Group Panel ────────────────────────────────────────────────────────

interface EventGroup {
  eventId: string;
  eventTitle: string;
  eventStartAt: string;
  listings: FlexPassListingResponse[];
}

type RightView = 'listings' | 'schedule';

// ─── Main Content ─────────────────────────────────────────────────────────────

function FlexPassOrganizerContent() {
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<RightView>('listings');
  const [rejectTarget, setRejectTarget] = useState<{ id: number; eventTitle: string } | null>(null);

  const { data, isLoading, error, refetch } = useGetOrganizerListingsQuery();
  const [approveListing, { isLoading: approveLoading }] = useApproveListingMutation();
  const [rejectListing, { isLoading: rejectLoading }] = useRejectListingMutation();

  const { lastEvent } = useSSE();

  useEffect(() => {
    if (!lastEvent) return;
    const flexpassEvents = [
      SSENormalizedType.FLEXPASS_LISTING_CREATED,
      SSENormalizedType.FLEXPASS_LISTING_CANCELLED,
      SSENormalizedType.FLEXPASS_LISTING_APPROVED,
      SSENormalizedType.FLEXPASS_LISTING_REJECTED,
      SSENormalizedType.FLEXPASS_LISTING_EXPIRED,
      SSENormalizedType.FLEXPASS_PRICE_LOCKED,
      SSENormalizedType.FLEXPASS_SALE_WINDOW_CREATED,
      SSENormalizedType.FLEXPASS_SALE_WINDOW_OPENED,
      SSENormalizedType.FLEXPASS_SALE_WINDOW_CLOSED,
      SSENormalizedType.FLEXPASS_SALE_WINDOW_CANCELLED,
    ] as SSENormalizedType[];
    if (flexpassEvents.includes(lastEvent.type)) refetch();
  }, [lastEvent, refetch]);

  const listings = data?.data ?? [];

  // Filter by status + search
  const filtered = useMemo(() => {
    return listings.filter((l) => {
      const matchStatus = filterStatus === 'ALL' || l.status === filterStatus;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || l.eventTitle.toLowerCase().includes(q) || l.sellerName.toLowerCase().includes(q) || l.ticketTypeName.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [listings, filterStatus, searchQuery]);

  // Group by event
  const groups = useMemo<EventGroup[]>(() => {
    const map = new Map<string, EventGroup>();
    for (const l of filtered) {
      if (!map.has(l.eventId)) {
        map.set(l.eventId, { eventId: l.eventId, eventTitle: l.eventTitle, eventStartAt: l.eventStartAt, listings: [] });
      }
      map.get(l.eventId)!.listings.push(l);
    }
    return Array.from(map.values());
  }, [filtered]);

  // Auto-expand event with pending listings on first load
  useEffect(() => {
    if (!expandedEventId || !groups.find((g) => g.eventId === expandedEventId)) {
      const withPending = groups.find((g) => g.listings.some((l) => l.status === 'PENDING_APPROVAL'));
      const autoId = withPending?.eventId ?? groups[0]?.eventId ?? null;
      if (autoId) {
        setExpandedEventId(autoId);
        setSelectedEventId(autoId);
        setSelectedView('listings');
      }
    }
  }, [groups]);

  const selectedGroup = groups.find((g) => g.eventId === selectedEventId) ?? null;

  const handleEventClick = (eventId: string) => {
    if (expandedEventId === eventId) {
      setExpandedEventId(null);
    } else {
      setExpandedEventId(eventId);
      setSelectedEventId(eventId);
      setSelectedView('listings');
    }
  };

  const handleSubViewClick = (eventId: string, view: RightView) => {
    setSelectedEventId(eventId);
    setSelectedView(view);
  };

  // Stats
  const pending  = listings.filter((l) => l.status === FlexPassListingStatus.PENDING_APPROVAL).length;
  const approved = listings.filter((l) => l.status === FlexPassListingStatus.APPROVED || l.status === FlexPassListingStatus.PRICE_LOCKED).length;
  const sold     = listings.filter((l) => l.status === FlexPassListingStatus.COMPLETED).length;
  const total    = listings.length;

  const handleApprove = async (listingId: number) => {
    try { await approveListing(listingId).unwrap(); } catch { /* toast shown by RTK */ }
  };

  const handleRejectConfirm = async (listingId: number, reason: string) => {
    try {
      await rejectListing({ listingId, reason: reason || undefined }).unwrap();
      setRejectTarget(null);
    } catch { /* toast shown by RTK */ }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0, flex: 1, pb: '20px' }}>
      <DashboardHeader
        title="FlexPass"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard/organizer' },
          { label: 'FlexPass' },
        ]}
      />

      <Box sx={{ bgcolor: BRAND.bgSection, borderRadius: '20px', p: '20px',
        display: 'flex', flexDirection: 'column', gap: '15px', overflow: 'hidden' }}>

        {/* Stats row */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: '10px', flexShrink: 0 }}>
          <FlexStatsCard title="Total Listings" value={String(total)} change={undefined}
            icon={<TicketIcon sx={{ fontSize: 20, color: BRAND.primary }} />} iconBg="#fef1ff" />
          <FlexStatsCard title="Awaiting Approval" value={String(pending)}
            icon={<AlertIcon sx={{ fontSize: 20, color: '#f59e0b' }} />} iconBg="#fffbeb" />
          <FlexStatsCard title="Active / Locked" value={String(approved)} change={undefined}
            icon={<ShoppingBagIcon sx={{ fontSize: 20, color: '#3b82f6' }} />} iconBg="#eff6ff" />
          <FlexStatsCard title="Completed" value={String(sold)} change={undefined}
            icon={<TrendingUpIcon sx={{ fontSize: 20, color: '#10b981' }} />} iconBg="#ecfdf5" />
        </Box>

        {/* Toolbar */}
        <Box sx={{ bgcolor: 'white', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.07)', p: '12px', flexShrink: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', bgcolor: BRAND.bgSection, borderRadius: '8px', px: '12px', py: '8px' }}>
              <SearchIcon sx={{ fontSize: 16, color: '#717182' }} />
              <InputBase placeholder="Search by event, seller, or ticket type…"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flex: 1, fontSize: 13, color: '#030213', '& input::placeholder': { color: '#717182' } }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FilterIcon sx={{ fontSize: 16, color: '#717182' }} />
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as StatusFilter)}
                size="small" variant="outlined"
                sx={{ fontSize: 13, borderRadius: '8px', bgcolor: BRAND.bgSection,
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}>
                {STATUS_FILTERS.map((f) => <MenuItem key={f.value} value={f.value} sx={{ fontSize: 13 }}>{f.label}</MenuItem>)}
              </Select>
            </Box>
            <Box component="button" onClick={() => refetch()}
              sx={{ display: 'flex', alignItems: 'center', gap: '5px', px: '10px', py: '8px',
                bgcolor: BRAND.bgSection, border: 'none', borderRadius: '8px', cursor: 'pointer',
                fontSize: 12, color: '#717182', '&:hover': { bgcolor: '#efefef' } }}>
              <RefreshIcon sx={{ fontSize: 14 }} /> Refresh
            </Box>
          </Box>
        </Box>

        {/* Loading / Error */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: '40px' }}>
            <CircularProgress size={28} sx={{ color: BRAND.primary }} />
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ borderRadius: '10px' }}>
            Failed to load FlexPass listings. Please try again.
          </Alert>
        )}

        {/* Master-detail */}
        {!isLoading && !error && groups.length === 0 && (
          <Box sx={{
            bgcolor: 'white', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.07)',
            py: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
          }}>
            <Box sx={{
              width: 72, height: 72, borderRadius: '18px',
              background: 'linear-gradient(135deg, #fef1ff 0%, #ede9fe 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TicketIcon sx={{ fontSize: 36, color: BRAND.primary, opacity: 0.6 }} />
            </Box>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#030213' }}>
              {filterStatus !== 'ALL' || searchQuery
                ? 'No listings match your filter'
                : 'No FlexPass listings yet'}
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#717182', textAlign: 'center', maxWidth: 380, lineHeight: 1.7 }}>
              {filterStatus !== 'ALL' || searchQuery
                ? 'Try adjusting your search or status filter to find what you\'re looking for.'
                : 'When customers submit tickets for resale, they will appear here for review and approval.'}
            </Typography>
            {(filterStatus !== 'ALL' || searchQuery) && (
              <Box
                component="button"
                onClick={() => { setFilterStatus('ALL'); setSearchQuery(''); }}
                sx={{
                  mt: '4px', px: '16px', py: '8px', borderRadius: '8px', fontSize: 13, fontWeight: 600,
                  bgcolor: BRAND.bgSection, border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', color: '#030213',
                  '&:hover': { bgcolor: '#efefef' },
                }}
              >
                Clear filters
              </Box>
            )}
          </Box>
        )}

        {!isLoading && !error && groups.length > 0 && (
          <Box sx={{ display: 'flex', gap: '12px', flexDirection: { xs: 'column', md: 'row' }, height: { xs: 'auto', md: 'calc(100vh - 340px)' }, minHeight: { xs: 0, md: 400 } }}>

            {/* Event list (left) */}
            <Box sx={{ width: { xs: '100%', md: 230 }, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '6px', overflowY: { xs: 'visible', md: 'auto' }, pr: '4px', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { borderRadius: 4, bgcolor: '#CBD5E1' } }}>
              {groups.map((group) => {
                const pendingCount = group.listings.filter((l) => l.status === 'PENDING_APPROVAL').length;
                const isExpanded = expandedEventId === group.eventId;
                const isListingsActive = selectedEventId === group.eventId && selectedView === 'listings';
                const isScheduleActive = selectedEventId === group.eventId && selectedView === 'schedule';
                return (
                  <Box key={group.eventId} sx={{
                    bgcolor: isExpanded ? 'white' : 'rgba(255,255,255,0.6)',
                    border: `1.5px solid ${isExpanded ? BRAND.primary : 'rgba(0,0,0,0.08)'}`,
                    borderRadius: '10px',
                    overflow: 'visible',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    boxShadow: isExpanded ? '0 2px 8px rgba(243,107,249,0.10)' : 'none',
                  }}>
                    {/* Event header — click to toggle expand */}
                    <Box onClick={() => handleEventClick(group.eventId)}
                      sx={{ p: '11px', cursor: 'pointer', overflow: 'hidden',
                        '&:hover': { bgcolor: 'rgba(243,107,249,0.03)' } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', mb: '4px', minWidth: 0 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 600,
                          color: isExpanded ? BRAND.primary : '#030213',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          flex: 1, minWidth: 0 }}>
                          {group.eventTitle}
                        </Typography>
                        <ChevronRightIcon sx={{
                          fontSize: 16, flexShrink: 0,
                          color: isExpanded ? BRAND.primary : '#94a3b8',
                          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease, color 0.15s',
                        }} />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', mb: '7px' }}>
                        <CalendarIcon sx={{ fontSize: 10, color: '#717182' }} />
                        <Typography sx={{ fontSize: 10, color: '#717182' }}>{formatDate(group.eventStartAt)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <Box sx={{ fontSize: 10, fontWeight: 500, px: '7px', py: '2px', borderRadius: '20px',
                          bgcolor: '#f7f7f7', color: '#717182', border: '1px solid rgba(0,0,0,0.07)' }}>
                          {group.listings.length} listing{group.listings.length !== 1 ? 's' : ''}
                        </Box>
                        {pendingCount > 0 && (
                          <Box sx={{ fontSize: 10, fontWeight: 600, px: '7px', py: '2px', borderRadius: '20px',
                            bgcolor: '#fffbeb', color: '#92400e', border: '1px solid #fcd34d' }}>
                            {pendingCount} pending
                          </Box>
                        )}
                      </Box>
                    </Box>

                    {/* Dropdown sub-options */}
                    {isExpanded && (
                      <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                        {/* Listings */}
                        <Box onClick={() => handleSubViewClick(group.eventId, 'listings')}
                          sx={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            px: '14px', py: '8px', cursor: 'pointer',
                            bgcolor: isListingsActive ? '#fdf3ff' : 'white',
                            borderLeft: `3px solid ${isListingsActive ? BRAND.primary : 'transparent'}`,
                            transition: 'all 0.13s',
                            '&:hover': { bgcolor: '#fdf3ff' },
                          }}>
                          <TicketIcon sx={{ fontSize: 13, color: isListingsActive ? BRAND.primary : '#94a3b8' }} />
                          <Typography sx={{ fontSize: 12, fontWeight: 600, color: isListingsActive ? BRAND.primary : '#64748b', flex: 1 }}>
                            Listings
                          </Typography>
                          <Box sx={{ fontSize: 10, fontWeight: 700, px: '6px', py: '1px', borderRadius: '20px',
                            bgcolor: isListingsActive ? BRAND.primaryLight : '#f1f5f9',
                            color: isListingsActive ? BRAND.primary : '#94a3b8' }}>
                            {group.listings.length}
                          </Box>
                        </Box>

                        {/* Schedule Window */}
                        <Box onClick={() => handleSubViewClick(group.eventId, 'schedule')}
                          sx={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            px: '14px', pt: '8px', pb: '10px', cursor: 'pointer',
                            bgcolor: isScheduleActive ? '#eff6ff' : 'white',
                            borderLeft: `3px solid ${isScheduleActive ? '#3b82f6' : 'transparent'}`,
                            borderTop: '1px solid rgba(0,0,0,0.04)',
                            borderBottomLeftRadius: '8px',
                            borderBottomRightRadius: '8px',
                            transition: 'all 0.13s',
                            '&:hover': { bgcolor: '#eff6ff' },
                          }}>
                          <ScheduleIcon sx={{ fontSize: 13, color: isScheduleActive ? '#3b82f6' : '#94a3b8' }} />
                          <Typography sx={{ fontSize: 12, fontWeight: 600, color: isScheduleActive ? '#3b82f6' : '#64748b' }}>
                            Schedule Window
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>

            {/* Right panel */}
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: { xs: 'visible', md: 'auto' }, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { borderRadius: 4, bgcolor: '#CBD5E1' } }}>
              {!selectedGroup ? (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: 'white', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.07)' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: 32, mb: '8px' }}>📋</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#030213', mb: '4px' }}>Select an event</Typography>
                    <Typography sx={{ fontSize: 12, color: '#717182' }}>Click an event on the left to view listings or manage sale windows.</Typography>
                  </Box>
                </Box>
              ) : (
                <>
                  {/* Right panel header */}
                  <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px', px: '2px',
                    pb: '8px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#030213',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedGroup.eventTitle}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', mt: '2px' }}>
                        <CalendarIcon sx={{ fontSize: 11, color: '#717182' }} />
                        <Typography sx={{ fontSize: 11, color: '#717182' }}>{formatDate(selectedGroup.eventStartAt)}</Typography>
                      </Box>
                    </Box>
                    {/* View tabs */}
                    <Box sx={{ display: 'flex', gap: '4px', bgcolor: '#f1f5f9', borderRadius: '8px', p: '3px', flexShrink: 0 }}>
                      <Box onClick={() => setSelectedView('listings')}
                        sx={{ display: 'flex', alignItems: 'center', gap: '5px', px: '10px', py: '5px',
                          borderRadius: '6px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                          bgcolor: selectedView === 'listings' ? 'white' : 'transparent',
                          color: selectedView === 'listings' ? BRAND.primary : '#717182',
                          boxShadow: selectedView === 'listings' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                          transition: 'all 0.13s' }}>
                        <TicketIcon sx={{ fontSize: 13 }} /> Listings
                      </Box>
                      <Box onClick={() => setSelectedView('schedule')}
                        sx={{ display: 'flex', alignItems: 'center', gap: '5px', px: '10px', py: '5px',
                          borderRadius: '6px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                          bgcolor: selectedView === 'schedule' ? 'white' : 'transparent',
                          color: selectedView === 'schedule' ? '#3b82f6' : '#717182',
                          boxShadow: selectedView === 'schedule' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                          transition: 'all 0.13s' }}>
                        <ScheduleIcon sx={{ fontSize: 13 }} /> Schedule Window
                      </Box>
                    </Box>
                  </Box>

                  {/* Schedule Window view */}
                  {selectedView === 'schedule' && (
                    <SaleWindowPanel
                      eventId={selectedGroup.eventId}
                      eventTitle={selectedGroup.eventTitle}
                      eventStartAt={selectedGroup.eventStartAt}
                      waitingListings={selectedGroup.listings.filter(
                        l => l.status === FlexPassListingStatus.APPROVED && l.saleWindowId === null
                      )}
                    />
                  )}

                  {/* Listings view */}
                  {selectedView === 'listings' && (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: '2px', mt: '-4px', flexShrink: 0 }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                          letterSpacing: '0.05em', color: '#717182' }}>
                          {selectedGroup.listings.length} listing{selectedGroup.listings.length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: '10px', pb: '4px' }}>
                        {selectedGroup.listings.map((listing) => (
                          <ListingCard key={listing.id} listing={listing}
                            onApprove={handleApprove}
                            onReject={(id) => setRejectTarget({ id, eventTitle: listing.eventTitle })}
                            approveLoading={approveLoading} />
                        ))}
                      </Box>
                    </>
                  )}
                </>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* Reject dialog */}
      <RejectDialog
        listingId={rejectTarget?.id ?? null}
        eventTitle={rejectTarget?.eventTitle ?? ''}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
        loading={rejectLoading}
      />
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FlexPassOrganizerPage() {
  return (
    <ProtectedContent>
      <LayoutWithSidebar currentPage="flexpass">
        <FlexPassOrganizerContent />
      </LayoutWithSidebar>
    </ProtectedContent>
  );
}
