'use client';

import { useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, MenuItem, Select } from '@mui/material';
import { ShoppingCart as BuyIcon } from '@mui/icons-material';
import { BRAND } from '@/src/utils/constants/constant';
import { useGetMarketplaceListingsQuery, useCheckoutListingMutation } from '@/src/stores/services/FlexPassApi';
import { FlexPassListingStatus } from '@/src/stores/types/flexpass';
import { formatCurrency } from './types';

function PriceBadge({ original, final, submitted }: { original: number; final: number | null; submitted: number }) {
  const price = final ?? submitted;
  const pct = ((price - original) / original) * 100;
  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
      <Typography sx={{ fontSize: 18, fontWeight: 600, color: '#030213' }}>{formatCurrency(price)}</Typography>
      <Typography sx={{ fontSize: 12, color: '#717182', textDecoration: 'line-through' }}>{formatCurrency(original)}</Typography>
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: pct === 0 ? '#717182' : '#10b981' }}>
        {pct === 0 ? 'Face value' : `+${pct.toFixed(0)}%`}
      </Typography>
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
    } catch { /* error toast handled by RTK */ }
  };

  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: '32px' }}>
      <CircularProgress size={24} sx={{ color: BRAND.primary }} />
    </Box>
  );

  if (error) return (
    <Alert severity="error" sx={{ borderRadius: '10px' }}>Failed to load marketplace listings.</Alert>
  );

  if (listings.length === 0) return (
    <Box sx={{ textAlign: 'center', py: '32px' }}>
      <Typography sx={{ fontSize: 13, color: '#717182' }}>No listings available in the marketplace right now.</Typography>
    </Box>
  );

  return (
    <>
      <Typography sx={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#717182', mb: '10px' }}>
        Available resales · verified by system
      </Typography>

      {listings.map((listing) => {
        const canBuy = listing.status === FlexPassListingStatus.PRICE_LOCKED && listing.finalPrice != null;
        return (
          <Box key={listing.id} sx={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '10px', p: '12px',
            mb: '10px', bgcolor: 'white', transition: 'background 0.15s', '&:hover': { bgcolor: '#f7f7f7' } }}>
            <Box sx={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '8px', bgcolor: '#f7f7f7',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                🎫
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: '4px' }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#030213',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                    {listing.eventTitle}
                  </Typography>
                  <Box sx={{ fontSize: 10, fontWeight: 600, px: '8px', py: '2px', borderRadius: '20px', flexShrink: 0,
                    bgcolor: canBuy ? '#ecfdf5' : '#eff6ff',
                    color: canBuy ? '#065f46' : '#1e40af',
                    border: `1px solid ${canBuy ? '#6ee7b7' : '#93c5fd'}` }}>
                    {canBuy ? 'Buy Now' : 'Pending Sale'}
                  </Box>
                </Box>
                <Typography sx={{ fontSize: 12, color: '#717182', mb: '6px' }}>{listing.ticketTypeName}</Typography>
                <PriceBadge original={listing.originalPrice} final={listing.finalPrice} submitted={listing.submittedPrice} />

                {canBuy && (
                  <Box component="button" onClick={() => setConfirmListingId(listing.id)}
                    sx={{ mt: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      width: '100%', py: '8px', fontSize: 13, fontWeight: 600,
                      border: 'none', borderRadius: '8px', bgcolor: '#030213', cursor: 'pointer', color: 'white',
                      transition: 'background 0.15s', '&:hover': { bgcolor: BRAND.darkSecondary } }}>
                    <BuyIcon sx={{ fontSize: 15 }} /> Purchase Ticket
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        );
      })}

      <Typography sx={{ fontSize: 12, color: '#717182', textAlign: 'center', mt: '8px' }}>
        Tickets held in escrow · payment released upon identity verification
      </Typography>

      {/* Purchase confirm dialog */}
      <Dialog open={confirmListingId !== null} onClose={() => setConfirmListingId(null)}
        maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px', p: '8px' } }}>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700, pb: '4px' }}>Confirm Purchase</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: 13, color: '#717182', mb: '16px' }}>
            Purchase <strong>{confirmListing?.ticketTypeName}</strong> for{' '}
            <strong>{confirmListing ? formatCurrency(confirmListing.finalPrice ?? confirmListing.submittedPrice) : ''}</strong>?
          </DialogContentText>
          <Select fullWidth value={provider} onChange={(e) => setProvider(e.target.value as 'VNPAY' | 'MOMO')}
            size="small" sx={{ fontSize: 13, borderRadius: '8px' }}>
            <MenuItem value="VNPAY" sx={{ fontSize: 13 }}>VNPay</MenuItem>
            <MenuItem value="MOMO" sx={{ fontSize: 13 }}>MoMo</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: '24px', pb: '16px' }}>
          <Button onClick={() => setConfirmListingId(null)} variant="text" sx={{ color: '#717182', textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleBuy} variant="contained" disabled={checkoutLoading}
            sx={{ textTransform: 'none', borderRadius: '8px', bgcolor: '#030213', minWidth: 110,
              '&:hover': { bgcolor: BRAND.darkSecondary } }}>
            {checkoutLoading ? 'Redirecting…' : 'Pay Now'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
