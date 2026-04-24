'use client';

import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { BRAND } from '@/src/utils/constants/constant';
import { useGetMyListingsQuery, useCancelListingMutation } from '@/src/stores/services/FlexPassApi';
import { FlexPassListingStatus } from '@/src/stores/types/flexpass';
import { formatCurrency } from './types';
import { format, parseISO } from 'date-fns';

function formatDate(iso: string) {
  try { return format(parseISO(iso), 'dd/MM/yyyy'); } catch { return iso; }
}

const STATUS_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  PENDING_APPROVAL: { label: 'Pending Approval', bg: '#fffbeb', color: '#92400e' },
  APPROVED:         { label: 'Approved',          bg: '#ecfdf5', color: '#065f46' },
  PRICE_LOCKED:     { label: 'Price Locked',       bg: '#eff6ff', color: '#1e40af' },
  PAYMENT_PENDING:  { label: 'Payment Pending',    bg: '#fffbeb', color: '#92400e' },
  COMPLETED:        { label: 'Sold',               bg: '#ecfdf5', color: '#065f46' },
  REJECTED:         { label: 'Rejected',           bg: '#fef2f2', color: '#991b1b' },
  CANCELLED:        { label: 'Cancelled',          bg: '#f7f7f7', color: '#717182' },
  EXPIRED:          { label: 'Expired',            bg: '#f7f7f7', color: '#717182' },
  FAILED:           { label: 'Failed',             bg: '#fef2f2', color: '#991b1b' },
};

const CANCELLABLE_STATUSES: FlexPassListingStatus[] = [
  FlexPassListingStatus.PENDING_APPROVAL,
  FlexPassListingStatus.APPROVED,
];

export function MyListingsTab() {
  const { data, isLoading, error } = useGetMyListingsQuery();
  const [cancelListing, { isLoading: cancelling }] = useCancelListingMutation();

  const listings = data?.data ?? [];

  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: '32px' }}>
      <CircularProgress size={24} sx={{ color: BRAND.primary }} />
    </Box>
  );

  if (error) return (
    <Alert severity="error" sx={{ borderRadius: '10px' }}>Failed to load your listings.</Alert>
  );

  if (listings.length === 0) return (
    <Box sx={{ textAlign: 'center', py: '32px' }}>
      <Typography sx={{ fontSize: 13, color: '#717182' }}>
        You have no FlexPass listings yet.
      </Typography>
      <Typography sx={{ fontSize: 12, color: '#b0b0c0', mt: '6px' }}>
        Switch to the &quot;Sell a Ticket&quot; tab to create a listing.
      </Typography>
    </Box>
  );

  return (
    <>
      <Typography sx={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.05em', color: '#717182', mb: '10px' }}>
        Your listings
      </Typography>

      {listings.map((listing) => {
        const badge = STATUS_BADGE[listing.status] ?? { label: listing.status, bg: '#f7f7f7', color: '#717182' };
        const displayPrice = listing.finalPrice ?? listing.submittedPrice;
        const canCancel = CANCELLABLE_STATUSES.includes(listing.status);

        return (
          <Box key={listing.id} sx={{ bgcolor: 'white', border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '10px', p: '14px', mb: '10px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: '10px' }}>
              <Box>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#030213' }}>
                  {listing.eventTitle}
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#717182', mt: '2px' }}>
                  {listing.ticketTypeName} · Listed {formatDate(listing.createdAt)}
                </Typography>
              </Box>
              <Box sx={{ fontSize: 11, fontWeight: 600, px: '10px', py: '3px', borderRadius: '20px',
                bgcolor: badge.bg, color: badge.color, flexShrink: 0 }}>
                {badge.label}
              </Box>
            </Box>

            <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.07)', my: '10px' }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: '3px' }}>
              <Typography sx={{ fontSize: 13, color: '#717182' }}>Original price</Typography>
              <Typography sx={{ fontSize: 13, color: '#030213' }}>{formatCurrency(listing.originalPrice)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: '3px' }}>
              <Typography sx={{ fontSize: 13, color: '#717182' }}>Your price</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#030213' }}>{formatCurrency(listing.submittedPrice)}</Typography>
            </Box>
            {listing.finalPrice && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: '3px' }}>
                <Typography sx={{ fontSize: 13, color: '#717182' }}>Final (locked)</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1d4ed8' }}>{formatCurrency(listing.finalPrice)}</Typography>
              </Box>
            )}
            {listing.rejectionReason && (
              <Typography sx={{ fontSize: 12, color: '#b91c1c', mt: '6px', fontStyle: 'italic' }}>
                Reason: {listing.rejectionReason}
              </Typography>
            )}

            {canCancel && (
              <Box sx={{ mt: '12px' }}>
                <Button size="small" variant="outlined" color="error" fullWidth disabled={cancelling}
                  onClick={() => cancelListing(listing.id)}
                  sx={{ textTransform: 'none', borderRadius: '8px', fontSize: 12 }}>
                  {cancelling ? 'Cancelling…' : 'Cancel Listing'}
                </Button>
              </Box>
            )}
          </Box>
        );
      })}
    </>
  );
}
