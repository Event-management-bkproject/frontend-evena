'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Button,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { CheckCircle as CheckIcon, LocalActivity as LocalActivityIcon, Sell as SellIcon, HighlightOff as CancelIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { BRAND } from '@/src/utils/constants/constant';
import { useGetMyTicketsQuery } from '@/src/stores/services/OrderApi';
import { useCreateListingMutation, useGetMyListingsQuery, useCancelListingMutation } from '@/src/stores/services/FlexPassApi';
import { FlexPassListingStatus } from '@/src/stores/types/flexpass';
import { TicketStatus } from '@/src/stores/types/order';
import { formatCurrency } from './types';
import { format, parseISO } from 'date-fns';

const ACTIVE_LISTING_STATUSES = new Set<FlexPassListingStatus>([
  FlexPassListingStatus.PENDING_APPROVAL,
  FlexPassListingStatus.APPROVED,
  FlexPassListingStatus.PRICE_LOCKED,
  FlexPassListingStatus.PAYMENT_PENDING,
]);

const CANCELLABLE_STATUSES = new Set<FlexPassListingStatus>([
  FlexPassListingStatus.PENDING_APPROVAL,
  FlexPassListingStatus.APPROVED,
]);

type SellFilter = 'ALL' | 'AVAILABLE' | 'LISTED' | 'EXPIRED_LISTING';

function formatEventTime(iso: string) {
  try { return format(parseISO(iso), 'dd MMM yyyy · HH:mm'); } catch { return iso; }
}

export function SellTab() {
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [submittedPrice, setSubmittedPrice] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filter, setFilter] = useState<SellFilter>('ALL');

  const { data: ticketsData, isLoading: ticketsLoading } = useGetMyTicketsQuery();
  const { data: listingsData } = useGetMyListingsQuery();
  const [createListing, { isLoading: creating }] = useCreateListingMutation();
  const [cancelListing, { isLoading: cancelling }] = useCancelListingMutation();

  const tickets = (ticketsData?.data ?? []).filter(
    (t) => t.status === TicketStatus.ACTIVE || t.status === TicketStatus.TRANSFER_LOCKED
  );

  const allListings = listingsData?.data ?? [];

  // ticketId → active listing
  const activeListingByTicketId = new Map(
    allListings
      .filter((l) => ACTIVE_LISTING_STATUSES.has(l.status))
      .map((l) => [l.ticketId, l])
  );

  // ticketId → most recent expired listing (for re-list visual)
  const expiredListingByTicketId = new Map(
    allListings
      .filter((l) => l.status === FlexPassListingStatus.EXPIRED && !activeListingByTicketId.has(l.ticketId))
      .map((l) => [l.ticketId, l])
  );

  const listedTicketIds = new Set(activeListingByTicketId.keys());
  const expiredListingTicketIds = new Set(expiredListingByTicketId.keys());

  // Counts for filter chips
  const availableCount = tickets.filter((t) => !listedTicketIds.has(t.id) && !expiredListingTicketIds.has(t.id)).length;
  const listedCount = listedTicketIds.size;
  const expiredListingCount = expiredListingTicketIds.size;

  const filteredTickets = tickets.filter((t) => {
    if (filter === 'AVAILABLE') return !listedTicketIds.has(t.id) && !expiredListingTicketIds.has(t.id);
    if (filter === 'LISTED') return listedTicketIds.has(t.id);
    if (filter === 'EXPIRED_LISTING') return expiredListingTicketIds.has(t.id);
    return true;
  });

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);
  const isFreeTicket = selectedTicket != null && selectedTicket.unitPrice === 0;

  const handleSubmit = async () => {
    if (!selectedTicketId) return;
    const price = isFreeTicket ? 0 : parseFloat(submittedPrice.replace(/[^0-9.]/g, ''));
    if (!isFreeTicket && (isNaN(price) || price < 0)) {
      setErrorMsg('Please enter a valid price.');
      return;
    }
    setErrorMsg(null);
    try {
      await createListing({ ticketId: selectedTicketId, submittedPrice: price }).unwrap();
      setSuccessMsg('Listing submitted for review. Your ticket is now pending organizer approval.');
      setSelectedTicketId(null);
      setSubmittedPrice('');
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      setErrorMsg(apiErr?.data?.message ?? 'Failed to create listing. Please check eligibility rules.');
    }
  };

  if (ticketsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: '64px' }}>
        <CircularProgress size={28} sx={{ color: BRAND.primary }} />
      </Box>
    );
  }

  if (tickets.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: '72px' }}>
        <Box sx={{
          width: 64, height: 64, borderRadius: '16px',
          background: 'linear-gradient(135deg, #6093FC, #3A6FE8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mx: 'auto', mb: '16px',
        }}>
          <LocalActivityIcon sx={{ fontSize: 32, color: 'white' }} />
        </Box>
        <Typography sx={{ fontSize: 16, fontWeight: 600, color: BRAND.dark, mb: '6px' }}>
          No eligible tickets
        </Typography>
        <Typography sx={{ fontSize: 13, color: '#94a3b8', maxWidth: 320, mx: 'auto' }}>
          You have no active FlexPass tickets available for resale. Tickets must be ACTIVE and not previously transferred.
        </Typography>
      </Box>
    );
  }

  const FILTER_TABS: { key: SellFilter; label: string; count: number }[] = [
    { key: 'ALL',             label: 'All',             count: tickets.length },
    { key: 'AVAILABLE',       label: 'Available',       count: availableCount },
    { key: 'LISTED',          label: 'Listed',          count: listedCount },
    { key: 'EXPIRED_LISTING', label: 'Expired Listing', count: expiredListingCount },
  ];

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', lg: '1fr 380px' },
      gap: '24px',
      alignItems: 'start',
    }}>
      <Box>
        {/* Header + filter */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: '14px', gap: '12px', flexWrap: 'wrap' }}>
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: BRAND.dark }}>
              Select a Ticket
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#94a3b8', mt: '2px' }}>
              Choose which ticket you want to list for resale
            </Typography>
          </Box>
          <Chip
            label={`${tickets.length} eligible`}
            size="small"
            sx={{ fontSize: 11, fontWeight: 600, bgcolor: '#f1f5f9', color: '#64748b', borderRadius: '20px' }}
          />
        </Box>

        {/* Filter chips */}
        <Box sx={{ display: 'flex', gap: '6px', mb: '14px', flexWrap: 'wrap' }}>
          {FILTER_TABS.map(({ key, label, count }) => {
            const active = filter === key;
            return (
              <Box
                key={key}
                onClick={() => setFilter(key)}
                sx={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  px: '10px', py: '4px', borderRadius: '20px', cursor: 'pointer',
                  border: `1.5px solid ${active ? BRAND.primary : '#E2E8F0'}`,
                  bgcolor: active ? '#fdf3ff' : '#FAFAFA',
                  transition: 'all 0.14s',
                  '&:hover': { borderColor: BRAND.primary },
                }}
              >
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: active ? BRAND.primary : '#64748B' }}>
                  {label}
                </Typography>
                <Box sx={{
                  minWidth: 16, height: 16, borderRadius: '20px', px: '4px',
                  bgcolor: active ? BRAND.primary : '#E2E8F0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Typography sx={{ fontSize: 9, fontWeight: 700, color: active ? '#fff' : '#64748B' }}>
                    {count}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        {successMsg && (
          <Alert severity="success" onClose={() => setSuccessMsg(null)} sx={{ borderRadius: '10px', mb: '14px', fontSize: 13 }}>
            {successMsg}
          </Alert>
        )}
        {errorMsg && (
          <Alert severity="error" onClose={() => setErrorMsg(null)} sx={{ borderRadius: '10px', mb: '14px', fontSize: 13 }}>
            {errorMsg}
          </Alert>
        )}

        {filteredTickets.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: '40px', color: '#94a3b8', fontSize: 13 }}>
            No tickets in this category.
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '500px', overflowY: 'auto', pr: '2px', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { borderRadius: 4, bgcolor: '#CBD5E1' } }}>
            {filteredTickets.map((ticket) => {
              const isListed = listedTicketIds.has(ticket.id);
              const hasExpiredListing = !isListed && expiredListingTicketIds.has(ticket.id);
              const isSelected = selectedTicketId === ticket.id;
              const activeListing = isListed ? activeListingByTicketId.get(ticket.id)! : null;
              const canCancel = activeListing ? CANCELLABLE_STATUSES.has(activeListing.status) : false;

              // Ticket with expired listing is re-listable (click allowed)
              const isClickable = !isListed;

              return (
                <Box
                  key={ticket.id}
                  onClick={() => {
                    if (!isClickable) return;
                    setSelectedTicketId(ticket.id);
                    setSubmittedPrice('');
                    setErrorMsg(null);
                  }}
                  sx={{
                    border: `1.5px solid ${
                      isListed
                        ? '#E2E8F0'
                        : hasExpiredListing
                          ? (isSelected ? '#F59E0B' : '#FDE68A')
                          : isSelected
                            ? BRAND.primary
                            : 'rgba(0,0,0,0.08)'
                    }`,
                    borderRadius: '12px',
                    p: '14px 16px',
                    bgcolor: isListed
                      ? '#F8FAFC'
                      : hasExpiredListing
                        ? (isSelected ? '#FFFBEB' : '#FEFCE8')
                        : isSelected
                          ? '#fdf3ff'
                          : 'white',
                    cursor: isClickable ? 'pointer' : 'default',
                    opacity: isListed ? 0.72 : 1,
                    transition: 'all 0.18s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    ...(isClickable && !isListed && {
                      '&:hover': {
                        borderColor: hasExpiredListing ? '#F59E0B' : BRAND.primary,
                        bgcolor: hasExpiredListing ? '#FFFBEB' : '#fdf3ff',
                        boxShadow: hasExpiredListing
                          ? '0 2px 8px rgba(245,158,11,0.14)'
                          : '0 2px 8px rgba(243,107,249,0.10)',
                      },
                    }),
                  }}
                >
                  <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center', minWidth: 0 }}>
                    <Box sx={{
                      width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
                      bgcolor: isListed
                        ? '#F1F5F9'
                        : hasExpiredListing
                          ? '#FEF3C7'
                          : isSelected
                            ? BRAND.primaryLight
                            : '#f1f5f9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                    }}>
                      🎫
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mb: '2px', flexWrap: 'wrap' }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: isListed ? '#94A3B8' : BRAND.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ticket.eventTitle}
                        </Typography>
                        {isListed && (
                          <Chip
                            icon={<SellIcon sx={{ fontSize: '10px !important' }} />}
                            label="Listed"
                            size="small"
                            sx={{ height: 16, fontSize: 9, fontWeight: 700, bgcolor: '#EDE9FE', color: '#7C3AED', border: '1px solid #DDD6FE', flexShrink: 0, '& .MuiChip-icon': { color: '#7C3AED' } }}
                          />
                        )}
                        {hasExpiredListing && (
                          <Chip
                            icon={<RefreshIcon sx={{ fontSize: '10px !important' }} />}
                            label="Expired · Re-list"
                            size="small"
                            sx={{ height: 16, fontSize: 9, fontWeight: 700, bgcolor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', flexShrink: 0, '& .MuiChip-icon': { color: '#92400E' } }}
                          />
                        )}
                      </Box>
                      <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>{ticket.ticketTypeName}</Typography>
                      <Typography sx={{ fontSize: 11, color: '#64748B', mt: '1px', fontWeight: 500 }}>
                        🛒 Purchased {formatEventTime(ticket.issuedAt)}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: '#b0b0c0', mt: '1px' }}>#{ticket.id}</Typography>
                    </Box>
                  </Box>

                  {isListed ? (
                    canCancel ? (
                      <Tooltip title="Cancel this listing" placement="left">
                        <IconButton
                          size="small"
                          disabled={cancelling}
                          onClick={(e) => { e.stopPropagation(); cancelListing(activeListing!.id); }}
                          sx={{ flexShrink: 0, color: '#EF4444', '&:hover': { bgcolor: '#FEF2F2' } }}
                        >
                          <CancelIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <SellIcon sx={{ fontSize: 16, color: '#7C3AED', flexShrink: 0 }} />
                    )
                  ) : isSelected ? (
                    <CheckIcon sx={{ color: hasExpiredListing ? '#F59E0B' : BRAND.primary, fontSize: 20, flexShrink: 0 }} />
                  ) : null}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      <Box sx={{
        bgcolor: '#fafbfc',
        border: '1px solid rgba(0,0,0,0.07)',
        borderRadius: '14px',
        p: '20px',
        alignSelf: 'flex-start',
      }}>
        {!selectedTicket ? (
          <Box sx={{ textAlign: 'center', py: '32px' }}>
            <Typography sx={{ fontSize: 32, mb: '10px' }}>💡</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: BRAND.dark, mb: '6px' }}>
              No ticket selected
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>
              Select a ticket on the left to set your resale price.
            </Typography>
          </Box>
        ) : (
          <>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: BRAND.dark, mb: '14px' }}>
              Set Resale Price
            </Typography>

            {expiredListingTicketIds.has(selectedTicket.id) && (
              <Box sx={{ bgcolor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', px: '12px', py: '8px', mb: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshIcon sx={{ fontSize: 14, color: '#92400E', flexShrink: 0 }} />
                <Typography sx={{ fontSize: 11, color: '#92400E', lineHeight: 1.5 }}>
                  Your previous listing expired. You can re-submit at a new price.
                </Typography>
              </Box>
            )}

            <Box sx={{
              bgcolor: 'white',
              border: '1px solid rgba(0,0,0,0.07)',
              borderRadius: '10px',
              p: '12px',
              mb: '16px',
            }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: BRAND.dark, mb: '2px' }}>
                {selectedTicket.eventTitle}
              </Typography>
              <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>
                {selectedTicket.ticketTypeName} · #{selectedTicket.id}
              </Typography>
            </Box>

            {isFreeTicket ? (
              <Box sx={{ bgcolor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', p: '12px', mb: '16px' }}>
                <Typography sx={{ fontSize: 12, color: '#166534', fontWeight: 600, mb: '2px' }}>
                  Free ticket transfer
                </Typography>
                <Typography sx={{ fontSize: 11, color: '#166534', lineHeight: 1.5 }}>
                  This is a free ticket. It will be transferred to the new owner at no cost.
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ bgcolor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', p: '10px 12px', mb: '16px' }}>
                  <Typography sx={{ fontSize: 11, color: '#92400e', lineHeight: 1.5 }}>
                    Price must be between <strong>50%</strong> and <strong>120%</strong> of the original price
                    {selectedTicket && ` (${formatCurrency(selectedTicket.unitPrice * 0.5)} – ${formatCurrency(selectedTicket.unitPrice * 1.2)})`}.
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  label="Your resale price (VND)"
                  value={submittedPrice}
                  onChange={(e) => setSubmittedPrice(e.target.value)}
                  InputProps={{ endAdornment: <InputAdornment position="end">₫</InputAdornment> }}
                  sx={{ mb: '14px', '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: 13, bgcolor: 'white' } }}
                />
              </>
            )}

            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              disabled={creating || (!isFreeTicket && !submittedPrice)}
              sx={{
                py: '11px',
                fontSize: 14,
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '10px',
                bgcolor: BRAND.dark,
                '&:hover': { bgcolor: BRAND.darkSecondary },
                '&:disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' },
              }}
            >
              {creating ? 'Submitting…' : isFreeTicket ? 'List for Free Transfer' : 'Submit for Approval'}
            </Button>

            <Typography sx={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', mt: '10px' }}>
              Organizer reviews your listing before it goes live.
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}
