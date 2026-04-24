'use client';

import { Box, Typography, CircularProgress, Alert, Button, Chip } from '@mui/material';
import { FormatListBulleted as ListIcon } from '@mui/icons-material';
import { BRAND } from '@/src/utils/constants/constant';
import { useGetMyListingsQuery, useCancelListingMutation } from '@/src/stores/services/FlexPassApi';
import { FlexPassListingStatus } from '@/src/stores/types/flexpass';
import { formatCurrency } from './types';
import { format, parseISO } from 'date-fns';

function formatDate(iso: string) {
  try { return format(parseISO(iso), 'dd MMM yyyy'); } catch { return iso; }
}

const STATUS_BADGE: Record<string, { label: string; bg: string; color: string; border: string }> = {
  PENDING_APPROVAL: { label: 'Pending Approval', bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
  APPROVED:         { label: 'Approved',          bg: '#ecfdf5', color: '#065f46', border: '#6ee7b7' },
  PRICE_LOCKED:     { label: 'Price Locked',      bg: '#eff6ff', color: '#1e40af', border: '#93c5fd' },
  PAYMENT_PENDING:  { label: 'Payment Pending',   bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
  COMPLETED:        { label: 'Sold',              bg: '#ecfdf5', color: '#065f46', border: '#6ee7b7' },
  REJECTED:         { label: 'Rejected',          bg: '#fef2f2', color: '#991b1b', border: '#fca5a5' },
  CANCELLED:        { label: 'Cancelled',         bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
  EXPIRED:          { label: 'Expired',           bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
  FAILED:           { label: 'Failed',            bg: '#fef2f2', color: '#991b1b', border: '#fca5a5' },
};

const CANCELLABLE_STATUSES: FlexPassListingStatus[] = [
  FlexPassListingStatus.PENDING_APPROVAL,
  FlexPassListingStatus.APPROVED,
];

export function MyListingsTab() {
  const { data, isLoading, error } = useGetMyListingsQuery();
  const [cancelListing, { isLoading: cancelling }] = useCancelListingMutation();

  const listings = data?.data ?? [];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: '64px' }}>
        <CircularProgress size={28} sx={{ color: BRAND.primary }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: '10px' }}>
        Failed to load your listings.
      </Alert>
    );
  }

  if (listings.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: '72px' }}>
        <Box sx={{
          width: 64, height: 64, borderRadius: '16px',
          background: 'linear-gradient(135deg, #37437d, #2A3363)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mx: 'auto', mb: '16px',
        }}>
          <ListIcon sx={{ fontSize: 32, color: 'white' }} />
        </Box>
        <Typography sx={{ fontSize: 16, fontWeight: 600, color: BRAND.dark, mb: '6px' }}>
          No listings yet
        </Typography>
        <Typography sx={{ fontSize: 13, color: '#94a3b8', maxWidth: 320, mx: 'auto' }}>
          Switch to the &quot;Sell a Ticket&quot; tab to create your first resale listing.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '20px' }}>
        <Box>
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: BRAND.dark }}>
            Your Listings
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#94a3b8', mt: '2px' }}>
            Track the status of your submitted resale listings
          </Typography>
        </Box>
        <Chip
          label={`${listings.length} total`}
          size="small"
          sx={{ fontSize: 11, fontWeight: 600, bgcolor: '#f1f5f9', color: '#64748b', borderRadius: '20px' }}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {listings.map((listing) => {
          const badge = STATUS_BADGE[listing.status] ?? { label: listing.status, bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
          const displayPrice = listing.finalPrice ?? listing.submittedPrice;
          const canCancel = CANCELLABLE_STATUSES.includes(listing.status);

          return (
            <Box
              key={listing.id}
              sx={{
                bgcolor: 'white',
                border: '1px solid rgba(0,0,0,0.07)',
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <Box sx={{
                px: '18px',
                py: '14px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
              }}>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: BRAND.dark,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {listing.eventTitle}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#94a3b8', mt: '3px' }}>
                    {listing.ticketTypeName} · Listed {formatDate(listing.createdAt)}
                  </Typography>
                </Box>
                <Chip
                  label={badge.label}
                  size="small"
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    height: 22,
                    bgcolor: badge.bg,
                    color: badge.color,
                    border: `1px solid ${badge.border}`,
                    borderRadius: '20px',
                    flexShrink: 0,
                  }}
                />
              </Box>

              <Box sx={{ px: '18px', py: '12px' }}>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: listing.finalPrice ? '1fr 1fr 1fr' : '1fr 1fr',
                  gap: '12px',
                  mb: listing.rejectionReason || canCancel ? '12px' : 0,
                }}>
                  <Box>
                    <Typography sx={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, mb: '2px' }}>
                      Original
                    </Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: BRAND.dark }}>
                      {formatCurrency(listing.originalPrice)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, mb: '2px' }}>
                      Your Price
                    </Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: BRAND.dark }}>
                      {formatCurrency(listing.submittedPrice)}
                    </Typography>
                  </Box>
                  {listing.finalPrice && (
                    <Box>
                      <Typography sx={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, mb: '2px' }}>
                        Final (locked)
                      </Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1d4ed8' }}>
                        {formatCurrency(listing.finalPrice)}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {listing.rejectionReason && (
                  <Box sx={{
                    bgcolor: '#fef2f2',
                    border: '1px solid #fca5a5',
                    borderRadius: '8px',
                    px: '12px',
                    py: '8px',
                    mb: canCancel ? '12px' : 0,
                  }}>
                    <Typography sx={{ fontSize: 12, color: '#b91c1c' }}>
                      <strong>Rejection reason:</strong> {listing.rejectionReason}
                    </Typography>
                  </Box>
                )}

                {canCancel && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    fullWidth
                    disabled={cancelling}
                    onClick={() => cancelListing(listing.id)}
                    sx={{
                      textTransform: 'none',
                      borderRadius: '8px',
                      fontSize: 12,
                      fontWeight: 600,
                      py: '7px',
                    }}
                  >
                    {cancelling ? 'Cancelling…' : 'Cancel Listing'}
                  </Button>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </>
  );
}
