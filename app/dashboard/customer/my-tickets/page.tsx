'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Divider,
} from '@mui/material';
import { Close, QrCode2 } from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { useGetMyTicketsQuery } from '@/src/stores/services/OrderApi';
import { TicketStatus } from '@/src/stores/types/order';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useSSE } from '@/src/providers/SSEProvider';
import { SSENormalizedType } from '@/src/stores/types/sse';

export default function MyTicketsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { lastEvent } = useSSE();
  const { data, isLoading, error, refetch: refetchTickets } = useGetMyTicketsQuery();
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const tickets = data?.data || [];

  // Listen to SSE events for real-time ticket updates
  useEffect(() => {
    if (!lastEvent) return;

    console.log('📨 [MyTickets] Received SSE event:', lastEvent.type);

    // Refetch tickets when ticket-related events occur
    switch (lastEvent.type) {
      case SSENormalizedType.TICKET_ISSUED:
      case SSENormalizedType.TICKET_CHECKED_IN:
      case SSENormalizedType.ORDER_CONFIRMED:
      case SSENormalizedType.ORDER_CANCELLED:
      case SSENormalizedType.ORDER_EXPIRED:
        console.log('🔄 [MyTickets] Refetching tickets...');
        refetchTickets();
        break;
      default:
        break;
    }
  }, [lastEvent, refetchTickets]);

  const getStatusColor = (status: TicketStatus) => {
    return status === TicketStatus.ACTIVE ? 'success' : 'default';
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: '#F36BF9' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <Container maxWidth="xl" sx={{ py: 4, flex: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#2A3363', mb: 4 }}>
          {t('customer.myTickets')}
        </Typography>

        {error ? (
          <Alert severity="error">{t('messages.error.loadFailed', { item: t('common.entities.ticket') })}</Alert>
        ) : tickets.length === 0 ? (
          <Card sx={{ p: 6, textAlign: 'center', borderRadius: '16px' }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              {t('customer.noTicketsYet')}
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/dashboard/customer')}
              sx={{
                backgroundColor: '#F36BF9',
                '&:hover': { backgroundColor: '#e55ae0' },
              }}
            >
              {t('customer.browseEvents')}
            </Button>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {tickets.map((ticket) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={ticket.id}>
                <Card
                  sx={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(243, 107, 249, 0.2)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      p: 3,
                      background: 'linear-gradient(135deg, #F36BF9 0%, #5522CC 100%)',
                      color: 'white',
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {ticket.eventTitle || 'Event'}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {ticket.ticketTypeName}
                    </Typography>
                  </Box>

                  <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('common.labels.ticketId')}:
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        #{ticket.id}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('common.labels.status')}:
                      </Typography>
                      <Chip
                        label={ticket.status}
                        color={getStatusColor(ticket.status)}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('common.labels.issued')}:
                      </Typography>
                      <Typography variant="body2">
                        {new Date(ticket.issuedAt).toLocaleDateString()}
                      </Typography>
                    </Box>

                    {ticket.status === TicketStatus.ACTIVE && (
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<QrCode2 />}
                        onClick={() => setSelectedTicket(ticket)}
                        sx={{
                          backgroundColor: '#F36BF9',
                          '&:hover': { backgroundColor: '#e55ae0' },
                        }}
                      >
                        {t('customer.viewQRCode')}
                      </Button>
                    )}

                    {ticket.status === TicketStatus.USED && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        {t('customer.usedOn', { date: new Date(ticket.usedAt!).toLocaleDateString() })}
                      </Alert>
                    )}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* QR Code Modal */}
      <Dialog
        open={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={700}>
              {t('customer.ticketQRCode')}
            </Typography>
            <IconButton onClick={() => setSelectedTicket(null)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#2A3363' }}>
                {selectedTicket.event?.title || 'Event'}
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  p: 3,
                  backgroundColor: '#fff',
                  borderRadius: '16px',
                  mb: 3,
                }}
              >
                <QRCodeSVG value={selectedTicket.qrPayload} size={250} level="H" />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2} sx={{ textAlign: 'left' }}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('common.labels.ticketId')}:
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    #{selectedTicket.id}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('common.labels.ticketType')}:
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedTicket.orderItem?.ticketType?.name}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('common.labels.owner')}:
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedTicket.user.name}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('common.labels.issued')}:
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {new Date(selectedTicket.issuedAt).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 3 }}>
                {t('customer.presentQRCode')}
              </Alert>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </Box>
  );
}
