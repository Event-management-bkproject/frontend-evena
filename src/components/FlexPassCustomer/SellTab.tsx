'use client';

import { useState } from 'react';
import { Box, Typography, CircularProgress, Alert, TextField, InputAdornment } from '@mui/material';
import { BRAND } from '@/src/utils/constants/constant';
import { useGetMyTicketsQuery } from '@/src/stores/services/OrderApi';
import { useCreateListingMutation } from '@/src/stores/services/FlexPassApi';
import { TicketStatus } from '@/src/stores/types/order';

export function SellTab() {
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [submittedPrice, setSubmittedPrice] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: ticketsData, isLoading: ticketsLoading } = useGetMyTicketsQuery();
  const [createListing, { isLoading: creating }] = useCreateListingMutation();

  const tickets = (ticketsData?.data ?? []).filter(
    (t) => t.status === TicketStatus.ACTIVE
  );

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  const handleSubmit = async () => {
    if (!selectedTicketId || !submittedPrice) return;
    const price = parseFloat(submittedPrice.replace(/[^0-9.]/g, ''));
    if (isNaN(price) || price <= 0) { setErrorMsg('Please enter a valid price.'); return; }
    setErrorMsg(null);
    try {
      await createListing({ ticketId: selectedTicketId, submittedPrice: price }).unwrap();
      setSuccessMsg(`Listing submitted for review. Your ticket is now pending organizer approval.`);
      setSelectedTicketId(null);
      setSubmittedPrice('');
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      setErrorMsg(apiErr?.data?.message ?? 'Failed to create listing. Please check eligibility rules.');
    }
  };

  if (ticketsLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: '32px' }}>
      <CircularProgress size={24} sx={{ color: BRAND.primary }} />
    </Box>
  );

  if (tickets.length === 0) return (
    <Box sx={{ textAlign: 'center', py: '32px' }}>
      <Typography sx={{ fontSize: 13, color: '#717182' }}>
        You have no active tickets eligible for FlexPass resale.
      </Typography>
      <Typography sx={{ fontSize: 12, color: '#b0b0c0', mt: '6px' }}>
        Tickets must be ACTIVE and not previously transferred.
      </Typography>
    </Box>
  );

  return (
    <>
      <Typography sx={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.05em', color: '#717182', mb: '10px' }}>
        Select a ticket to resell
      </Typography>

      {successMsg && (
        <Alert severity="success" onClose={() => setSuccessMsg(null)} sx={{ borderRadius: '10px', mb: '12px', fontSize: 13 }}>
          {successMsg}
        </Alert>
      )}
      {errorMsg && (
        <Alert severity="error" onClose={() => setErrorMsg(null)} sx={{ borderRadius: '10px', mb: '12px', fontSize: 13 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Ticket picker */}
      {tickets.map((ticket) => (
        <Box key={ticket.id} onClick={() => setSelectedTicketId(ticket.id)}
          sx={{ border: `1.5px solid ${selectedTicketId === ticket.id ? BRAND.primary : 'rgba(0,0,0,0.08)'}`,
            borderRadius: '10px', p: '12px', mb: '8px', bgcolor: 'white', cursor: 'pointer',
            transition: 'all 0.15s', '&:hover': { borderColor: BRAND.primary, bgcolor: '#fdf3ff' } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#030213' }}>
                {ticket.eventTitle}
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#717182', mt: '2px' }}>
                {ticket.ticketTypeName} · #{ticket.id}
              </Typography>
            </Box>
            {selectedTicketId === ticket.id && (
              <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: BRAND.primary,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />
              </Box>
            )}
          </Box>
        </Box>
      ))}

      {/* Price input */}
      {selectedTicket && (
        <Box sx={{ mt: '16px', pt: '16px', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#030213', mb: '8px' }}>
            Set resale price
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#717182', mb: '12px' }}>
            Price must be between 50% and 120% of the original ticket price.
          </Typography>
          <TextField
            fullWidth
            label="Submitted Price (VND)"
            value={submittedPrice}
            onChange={(e) => setSubmittedPrice(e.target.value)}
            InputProps={{
              endAdornment: <InputAdornment position="end">₫</InputAdornment>,
            }}
            sx={{ mb: '12px', '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: 13 } }}
          />
          <Box component="button" onClick={handleSubmit} disabled={creating || !submittedPrice}
            sx={{ width: '100%', py: '11px', fontSize: 14, fontWeight: 600, textAlign: 'center',
              borderRadius: '10px', bgcolor: creating || !submittedPrice ? '#e5e7eb' : '#030213',
              color: creating || !submittedPrice ? '#9ca3af' : 'white',
              border: 'none', cursor: creating || !submittedPrice ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s', '&:hover:not(:disabled)': { bgcolor: BRAND.darkSecondary } }}>
            {creating ? 'Submitting…' : 'Submit for Approval'}
          </Box>
        </Box>
      )}
    </>
  );
}
