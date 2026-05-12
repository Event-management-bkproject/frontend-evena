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
} from '@mui/material';
import { CheckCircle as CheckIcon, LocalActivity as LocalActivityIcon } from '@mui/icons-material';
import { BRAND } from '@/src/utils/constants/constant';
import { useGetMyTicketsQuery } from '@/src/stores/services/OrderApi';
import { useCreateListingMutation } from '@/src/stores/services/FlexPassApi';
import { TicketStatus } from '@/src/stores/types/order';
import { formatCurrency } from './types';
import { format, parseISO } from 'date-fns';

function formatDate(iso: string) {
  try { return format(parseISO(iso), 'dd MMM yyyy'); } catch { return iso; }
}

function formatEventTime(iso: string) {
  try { return format(parseISO(iso), 'dd MMM yyyy · HH:mm'); } catch { return iso; }
}

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

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', lg: '1fr 380px' },
      gap: '24px',
      alignItems: 'start',
    }}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '16px' }}>
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

        {successMsg && (
          <Alert
            severity="success"
            onClose={() => setSuccessMsg(null)}
            sx={{ borderRadius: '10px', mb: '14px', fontSize: 13 }}
          >
            {successMsg}
          </Alert>
        )}
        {errorMsg && (
          <Alert
            severity="error"
            onClose={() => setErrorMsg(null)}
            sx={{ borderRadius: '10px', mb: '14px', fontSize: 13 }}
          >
            {errorMsg}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '60vh', overflowY: 'auto', pr: '4px' }}>
          {tickets.map((ticket) => {
            const isSelected = selectedTicketId === ticket.id;
            return (
              <Box
                key={ticket.id}
                onClick={() => {
                  setSelectedTicketId(ticket.id);
                  setSubmittedPrice('');
                  setErrorMsg(null);
                }}
                sx={{
                  border: `1.5px solid ${isSelected ? BRAND.primary : 'rgba(0,0,0,0.08)'}`,
                  borderRadius: '12px',
                  p: '14px 16px',
                  bgcolor: isSelected ? '#fdf3ff' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  '&:hover': {
                    borderColor: BRAND.primary,
                    bgcolor: '#fdf3ff',
                    boxShadow: '0 2px 8px rgba(243,107,249,0.10)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center', minWidth: 0 }}>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    bgcolor: isSelected ? BRAND.primaryLight : '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    flexShrink: 0,
                  }}>
                    🎫
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: BRAND.dark,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {ticket.eventTitle}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: '#94a3b8', mt: '2px' }}>
                      {ticket.ticketTypeName}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: '#64748B', mt: '1px', fontWeight: 500 }}>
                      🛒 Purchased {formatEventTime(ticket.issuedAt)}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: '#b0b0c0', mt: '1px' }}>
                      #{ticket.id}
                    </Typography>
                  </Box>
                </Box>

                {isSelected && (
                  <CheckIcon sx={{ color: BRAND.primary, fontSize: 20, flexShrink: 0 }} />
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box sx={{
        bgcolor: '#fafbfc',
        border: '1px solid rgba(0,0,0,0.07)',
        borderRadius: '14px',
        p: '20px',
        position: { lg: 'sticky' },
        top: { lg: '24px' },
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
