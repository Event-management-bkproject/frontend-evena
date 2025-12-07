'use client';

import React, { useState } from 'react';
import { Box, Container, Typography, Button, Card, CardMedia, Chip, Alert, Grid } from '@mui/material';
import { CalendarToday, Place, Category, AccessTime, ConfirmationNumber } from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import { useGetEventByIdQuery } from '@/src/stores/services/EventApi';
import { useAuth } from '@/src/hook/useAuth';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import AuthLoadingScreen from '@/src/components/AuthLoadingScreen';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const eventId = params?.id as string;

  const { data: eventResponse, isLoading, error } = useGetEventByIdQuery(eventId);
  const event = eventResponse?.data;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBuyTicket = () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      router.push(`/login?redirect=${encodeURIComponent(`/events/${eventId}`)}`);
      return;
    }

    // TODO: Navigate to ticket selection/checkout page
    router.push(`/events/${eventId}/tickets`);
  };

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (error || !event) {
    return (
      <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
        <Header cartItemCount={0} />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert severity="error">Failed to load event details. Please try again later.</Alert>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header cartItemCount={0} />

      <Box sx={{ flex: 1 }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Event Image */}
          <Card sx={{ borderRadius: '20px', overflow: 'hidden', mb: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <CardMedia
              component="img"
              image={event.coverUrl || '/images/event-placeholder.jpg'}
              alt={event.title}
              sx={{
                height: { xs: 300, md: 500 },
                objectFit: 'cover',
              }}
            />
          </Card>

          <Grid container spacing={4}>
            {/* Main Content */}
            <Grid size={{ xs: 12, md: 8 }}>
              {/* Title and Category */}
              <Box sx={{ mb: 4 }}>
                {event.category?.name && (
                  <Chip
                    icon={<Category />}
                    label={event.category.name}
                    sx={{
                      mb: 2,
                      backgroundColor: '#F0F7FF',
                      color: '#36437C',
                      fontWeight: 600,
                    }}
                  />
                )}
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: '#2A3363',
                    mb: 2,
                  }}
                >
                  {event.title}
                </Typography>
              </Box>

              {/* Event Details */}
              <Card sx={{ borderRadius: '16px', p: 3, mb: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#2A3363', mb: 3 }}>
                  Event Details
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Date and Time */}
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <CalendarToday sx={{ color: '#F36BF9', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                        Date & Time
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {formatDate(event.startAt)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {formatTime(event.startAt)} - {formatTime(event.endAt)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Location */}
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Place sx={{ color: '#F36BF9', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                        Location
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {event.venue?.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {event.venue?.city}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Card>

              {/* Description */}
              <Card sx={{ borderRadius: '16px', p: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#2A3363', mb: 2 }}>
                  About This Event
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#666',
                    lineHeight: 1.8,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {event.description}
                </Typography>
              </Card>
            </Grid>

            {/* Sidebar - Ticket Booking */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  borderRadius: '16px',
                  p: 3,
                  position: { md: 'sticky' },
                  top: { md: 100 },
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2A3363', mb: 3 }}>
                  Get Your Tickets
                </Typography>

                {!isAuthenticated && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Please login to purchase tickets
                  </Alert>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<ConfirmationNumber />}
                  onClick={handleBuyTicket}
                  sx={{
                    backgroundColor: '#F36BF9',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    py: 2,
                    borderRadius: '12px',
                    textTransform: 'none',
                    boxShadow: '0 4px 16px rgba(243, 107, 249, 0.3)',
                    '&:hover': {
                      backgroundColor: '#e55ae0',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(243, 107, 249, 0.4)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isAuthenticated ? 'Buy Tickets' : 'Login to Buy Tickets'}
                </Button>

                {/* Event Status */}
                <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #E0E0E0' }}>
                  <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                    Event Status
                  </Typography>
                  <Chip
                    label={event.status}
                    sx={{
                      backgroundColor:
                        event.status === 'PUBLISHED' ? '#E8F5E9' : event.status === 'CANCELLED' ? '#FFEBEE' : '#FFF3E0',
                      color:
                        event.status === 'PUBLISHED' ? '#2E7D32' : event.status === 'CANCELLED' ? '#C62828' : '#E65100',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
