'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  MenuItem,
  Select,
  Chip,
} from '@mui/material';
import { ShoppingCart as BuyIcon, ConfirmationNumber as TicketIcon } from '@mui/icons-material';
import { BRAND } from '@/src/utils/constants/constant';
import { useGetMarketplaceListingsQuery, useCheckoutListingMutation } from '@/src/stores/services/FlexPassApi';
import { FlexPassListingStatus } from '@/src/stores/types/flexpass';
import { formatCurrency } from './types';

const GRADIENT_PALETTES = [
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#fa709a', '#fee140'],
  ['#a18cd1', '#fbc2eb'],
  ['#ffecd2', '#fcb69f'],
  ['#30cfd0', '#330867'],
];

function getGradient(title: string): string {
  const idx = title.charCodeAt(0) % GRADIENT_PALETTES.length;
  const [from, to] = GRADIENT_PALETTES[idx];
  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function PriceBadge({ original, final, submitted }: { original: number; final: number | null; submitted: number }) {
  const price = final ?? submitted;
  const pct = ((price - original) / original) * 100;
  const isAbove = pct > 0;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
      <Chip
        label={pct === 0 ? 'Face' : `${isAbove ? '+' : ''}${pct.toFixed(0)}%`}
        size="small"
        sx={{
          fontSize: 10,
          fontWeight: 700,
          height: 18,
          bgcolor: isAbove ? '#ecfdf5' : '#f1f5f9',
          color: isAbove ? '#059669' : '#64748b',
          border: `1px solid ${isAbove ? '#6ee7b7' : '#e2e8f0'}`,
          borderRadius: '20px',
        }}
      />
      <Box sx={{ textAlign: 'right' }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: BRAND.dark, lineHeight: 1.2 }}>
          {formatCurrency(price)}
        </Typography>
        <Typography sx={{ fontSize: 11, color: '#94a3b8', textDecoration: 'line-through', lineHeight: 1.2 }}>
          {formatCurrency(original)}
        </Typography>
      </Box>
    </Box>
  );
}

export function MarketplaceTab() {
  const [confirmListingId, setConfirmListingId] = useState<number | null>(null);
  const [provider, setProvider] = useState<'VNPAY' | 'MOMO'>('VNPAY');

  const { data, isLoading, error } = useGetMarketplaceListingsQuery();
  const [checkoutListing, { isLoading: checkoutLoading }] = useCheckoutListingMutation();

  const listings = data?.data ?? [];
  const confirmListing = listings.find((l) => l.id === confirmListingId);

  const handleBuy = async () => {
    if (!confirmListingId) return;
    try {
      const result = await checkoutListing({ listingId: confirmListingId, provider }).unwrap();
      if (result.data?.paymentUrl) {
        window.location.href = result.data.paymentUrl;
      }
      setConfirmListingId(null);
    } catch { }
  };

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
        Failed to load marketplace listings.
      </Alert>
    );
  }

  if (listings.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: '72px' }}>
        <Box sx={{
          width: 64, height: 64, borderRadius: '16px',
          background: 'linear-gradient(135deg, #F36BF9, #C845D8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mx: 'auto', mb: '16px',
        }}>
          <TicketIcon sx={{ fontSize: 32, color: 'white' }} />
        </Box>
        <Typography sx={{ fontSize: 16, fontWeight: 600, color: BRAND.dark, mb: '6px' }}>
          No listings right now
        </Typography>
        <Typography sx={{ fontSize: 13, color: '#94a3b8', maxWidth: 320, mx: 'auto' }}>
          Check back soon — approved resale tickets will appear here when sellers list them.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '20px' }}>
        <Box>
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: BRAND.dark }}>
            Available Resales
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#94a3b8', mt: '2px' }}>
            Verified by system · tickets held in escrow
          </Typography>
        </Box>
        <Chip
          label={`${listings.length} listing${listings.length !== 1 ? 's' : ''}`}
          size="small"
          sx={{ fontSize: 11, fontWeight: 600, bgcolor: '#f1f5f9', color: '#64748b', borderRadius: '20px' }}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {listings.map((listing) => {
          const canBuy = listing.status === FlexPassListingStatus.PRICE_LOCKED && listing.finalPrice != null;

          return (
            <Box
              key={listing.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                border: '1px solid rgba(0,0,0,0.07)',
                borderRadius: '12px',
                p: '14px 16px',
                bgcolor: 'white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.18s, border-color 0.18s',
                '&:hover': {
                  boxShadow: '0 3px 12px rgba(0,0,0,0.08)',
                  borderColor: 'rgba(124,58,237,0.2)',
                },
              }}
            >
              {/* Avatar */}
              <Box sx={{
                width: 44,
                height: 44,
                borderRadius: '10px',
                background: getGradient(listing.eventTitle),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 700,
                color: 'white',
                flexShrink: 0,
              }}>
                {getInitials(listing.eventTitle)}
              </Box>

              {/* Info */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '2px' }}>
                  <Typography sx={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: BRAND.dark,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {listing.eventTitle}
                  </Typography>
                  <Chip
                    label={canBuy ? 'Buy Now' : 'Pending'}
                    size="small"
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                      height: 18,
                      flexShrink: 0,
                      bgcolor: canBuy ? '#ecfdf5' : '#eff6ff',
                      color: canBuy ? '#065f46' : '#1e40af',
                      border: `1px solid ${canBuy ? '#6ee7b7' : '#93c5fd'}`,
                      borderRadius: '20px',
                    }}
                  />
                </Box>
                <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>
                  {listing.ticketTypeName} · Verified seller
                </Typography>
              </Box>

              {/* Price + Buy */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                <Box sx={{ textAlign: 'right' }}>
                  <PriceBadge
                    original={listing.originalPrice}
                    final={listing.finalPrice}
                    submitted={listing.submittedPrice}
                  />
                </Box>
                {canBuy && (
                  <Button
                    variant="contained"
                    startIcon={<BuyIcon sx={{ fontSize: 15 }} />}
                    onClick={() => setConfirmListingId(listing.id)}
                    sx={{
                      textTransform: 'none',
                      borderRadius: '9px',
                      fontWeight: 600,
                      fontSize: 13,
                      bgcolor: BRAND.dark,
                      py: '8px',
                      px: '16px',
                      whiteSpace: 'nowrap',
                      '&:hover': { bgcolor: BRAND.darkSecondary },
                    }}
                  >
                    Buy
                  </Button>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      <Typography sx={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', mt: '20px' }}>
        Payment is released to the seller only after identity verification is complete.
      </Typography>

      <Dialog
        open={confirmListingId !== null}
        onClose={() => setConfirmListingId(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', p: '8px' } }}
      >
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700, pb: '4px' }}>Confirm Purchase</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: 13, color: 'text.secondary', mb: '16px' }}>
            Purchase <strong>{confirmListing?.ticketTypeName}</strong> for{' '}
            <strong>
              {confirmListing ? formatCurrency(confirmListing.finalPrice ?? confirmListing.submittedPrice) : ''}
            </strong>
            ?
          </DialogContentText>
          <Select
            fullWidth
            value={provider}
            onChange={(e) => setProvider(e.target.value as 'VNPAY' | 'MOMO')}
            size="small"
            sx={{ fontSize: 13, borderRadius: '8px' }}
          >
            <MenuItem value="VNPAY" sx={{ fontSize: 13 }}>VNPay</MenuItem>
            <MenuItem value="MOMO" sx={{ fontSize: 13 }}>MoMo</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: '24px', pb: '16px' }}>
          <Button
            onClick={() => setConfirmListingId(null)}
            variant="text"
            sx={{ color: 'text.secondary', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBuy}
            variant="contained"
            disabled={checkoutLoading}
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              bgcolor: BRAND.dark,
              minWidth: 110,
              '&:hover': { bgcolor: BRAND.darkSecondary },
            }}
          >
            {checkoutLoading ? 'Redirecting…' : 'Pay Now'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
