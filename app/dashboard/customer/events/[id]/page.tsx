'use client';

import React, { use, useEffect } from 'react';
import { Box, Container, Typography, Button, Card, Chip, Alert, CircularProgress } from '@mui/material';
import { CalendarToday, Place, AccessTime, AttachMoney } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useGetEventByIdQuery } from '@/src/stores/services/EventApi';
import { useGetAvailableTicketTypesQuery } from '@/src/stores/services/TicketTypeApi';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { useSSE } from '@/src/providers/SSEProvider';

export default function CustomerEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { t } = useTranslation();
  const { lastEvent } = useSSE();
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const { data: eventResponse, isLoading: eventLoading, error: eventError, refetch: refetchEvent } = useGetEventByIdQuery(eventId);
  const { data: ticketTypesResponse, isLoading: ticketsLoading, refetch: refetchTickets } = useGetAvailableTicketTypesQuery(eventId);

  const event = eventResponse?.data;
  const ticketTypes = ticketTypesResponse?.data || [];

  // Listen to SSE events for real-time updates
  useEffect(() => {
    if (!lastEvent) return;

    const eventData = lastEvent.data;
    const affectsThisEvent =
      eventData?.eventId === eventId ||
      eventData?.eventId?.toString() === eventId;

    console.log('📨 [CustomerEventDetail] Received SSE event:', lastEvent.type);

    switch (lastEvent.type) {
      case 'EVENT_UPDATED':
      case 'EVENT_CANCELLED':
        if (affectsThisEvent) {
          console.log('🔄 [CustomerEventDetail] Refetching event...');
          refetchEvent();
        }
        break;
      case 'TICKET_TYPE_CREATED':
      case 'TICKET_TYPE_UPDATED':
      case 'TICKET_TYPE_DELETED':
      case 'TICKET_TYPE_DEACTIVATED':
        // Refetch tickets when ticket types change (availability updates)
        if (affectsThisEvent) {
          console.log('🔄 [CustomerEventDetail] Refetching tickets...');
          refetchTickets();
        }
        break;
      default:
        break;
    }
  }, [lastEvent, eventId, refetchEvent, refetchTickets]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMinPrice = () => {
    if (ticketTypes.length === 0) return 0;
    return Math.min(...ticketTypes.map((t) => t.price));
  };

  const getSalesDateRange = () => {
    if (ticketTypes.length === 0) return 'N/A';
    const allStartDates = ticketTypes.map((t) => new Date(t.salesStart));
    const allEndDates = ticketTypes.map((t) => new Date(t.salesEnd));
    const minStart = new Date(Math.min(...allStartDates.map((d) => d.getTime())));
    const maxEnd = new Date(Math.max(...allEndDates.map((d) => d.getTime())));
    return `${formatDate(minStart.toISOString())} – ${formatDate(maxEnd.toISOString())}`;
  };

  const handleBookNow = () => {
    router.push(`/dashboard/customer/events/${eventId}/tickets`);
  };

  // Split event title into lines
  const titleWords = event?.title.split(' ') || [];
  const titleLine1 = titleWords.slice(0, -1).join(' ');
  const titleLine2 = titleWords[titleWords.length - 1];

  if (eventLoading || ticketsLoading) {
    return (
      <Box
        sx={{
          backgroundColor: '#FAFAFA',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress sx={{ color: '#F36BF9' }} />
      </Box>
    );
  }

  if (eventError || !event) {
    return (
      <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert severity="error">{t('messages.error.loadFailed', { item: t('common.entities.event') })}</Alert>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* 1️⃣ HERO SECTION - Background 70% Height */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: '600px', md: '70vh' },
          minHeight: '500px',
          overflow: 'hidden',
        }}
      >
        {/* Background Image - Only 70% of Hero Height */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '60%',
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${
              event.coverUrl || '/images/concert-crowd.jpg'
            })`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
          }}
        />

        {/* Content Container */}
        <Container
          maxWidth="xl"
          sx={{
            position: 'relative',
            zIndex: 1,
            height: '100%',
            py: { xs: 4, md: 6 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 4, md: 6 },
              height: '100%',
            }}
          >
            {/* LEFT SIDE - Text Content + Summary Part */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                color: 'white',
              }}
            >
              {/* TEXT CONTENT */}
              <Box>
                {/* Small Label */}
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontWeight: 600,
                    letterSpacing: '4px',
                    textTransform: 'uppercase',
                    opacity: 0.95,
                    mb: 3,
                  }}
                >
                  {t('customer.theEvents')}
                </Typography>

                {/* Large Title - Multi-line */}
                <Box sx={{ mb: 4 }}>
                  <Typography
                    component="h1"
                    sx={{
                      fontSize: { xs: '3rem', sm: '4rem', md: '5rem', lg: '6rem' },
                      fontWeight: 800,
                      lineHeight: 0.95,
                      textShadow: '0 4px 30px rgba(0,0,0,0.5)',
                      mb: 0,
                    }}
                  >
                    {titleLine1}
                  </Typography>
                  <Typography
                    component="h1"
                    sx={{
                      fontSize: { xs: '3rem', sm: '4rem', md: '5rem', lg: '6rem' },
                      fontWeight: 800,
                      lineHeight: 0.95,
                      textShadow: '0 4px 30px rgba(0,0,0,0.5)',
                    }}
                  >
                    {titleLine2}
                  </Typography>
                </Box>

                {/* CTA Button - Pill Shape */}
                <Button
                  onClick={handleBookNow}
                  variant="outlined"
                  size="large"
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    borderWidth: '3px',
                    borderRadius: '999px',
                    px: 6,
                    py: 2,
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    letterSpacing: '1px',
                    '&:hover': {
                      borderWidth: '3px',
                      backgroundColor: 'white',
                      color: '#2A3363',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {t('customer.bookNow')}
                </Button>
              </Box>

              {/* SUMMARY PART */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 4,
                  alignItems: { xs: 'flex-start', sm: 'flex-end' },
                  mt: 4,
                }}
              >
                {/* Left - Sale, Date, Location (Flex Column) */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, flex: 1 }}>
                  {/* Sale From */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CalendarToday sx={{ color: '#36437C', fontSize: 24 }} />
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ color: '#36437C', display: 'block', fontSize: '11px', mb: 0.5 }}
                      >
                        {t('customer.saleFrom')}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#ADACAE' }}>
                        {getSalesDateRange()}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Date & Time */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AccessTime sx={{ color: '#36437C', fontSize: 24 }} />
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ color: '#36437C', display: 'block', fontSize: '11px', mb: 0.5 }}
                      >
                        {t('customer.dateAndTime')}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#ADACAE' }}>
                        {formatDate(event.startAt)} • {formatTime(event.startAt)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Location */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Place sx={{ color: '#36437C', fontSize: 24 }} />
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ color: '#36437C', display: 'block', fontSize: '11px', mb: 0.5 }}
                      >
                        {t('customer.location')}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#ADACAE' }}>
                        {event.venue?.name}, {event.venue?.city}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Right - Price */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    p: 3,
                    borderRadius: '20px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: '#36437C', display: 'block', fontSize: '11px', mb: 0.5 }}
                    >
                      {t('customer.startingFrom')}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 900,
                        color: '#F36BF9',
                        fontSize: '2rem',
                        textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                      }}
                    >
                      ${getMinPrice().toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* RIGHT SIDE - Rectangular Image with Large Border Radius */}
            <Box
              sx={{
                flex: { xs: 1, md: 0.8 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: { xs: '100%', md: '600px' },
                  height: { xs: '300px', sm: '400px', md: '100%' },
                  borderRadius: '200px',
                  overflow: 'hidden',
                }}
              >
                <Image
                  src={event.coverUrl || '/images/stage-performance.jpg'}
                  alt={event.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 500px"
                  priority
                />
              </Box>
            </Box>
          </Box>
        </Container>

        {/* Bottom 30% - Gradient to Page Background */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '30%',
            background: 'linear-gradient(to bottom, transparent, #FAFAFA)',
            zIndex: 0,
          }}
        />
      </Box>

      {/* 3️⃣ MAIN CONTENT SECTION */}
      <Box sx={{ flex: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '400px 1fr' },
              gap: 6,
            }}
          >
            {/* LEFT COLUMN - Packages */}
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: '#2A3363',
                  mb: 4,
                  fontSize: '2.5rem',
                }}
              >
                {t('customer.packages')}
              </Typography>

              {/* Ticket Cards */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {ticketTypes.length === 0 ? (
                  <Card
                    sx={{
                      p: 5,
                      borderRadius: '20px',
                      textAlign: 'center',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      border: '2px dashed #E0E0E0',
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      {t('customer.noTicketsAvailable')}
                    </Typography>
                  </Card>
                ) : (
                  ticketTypes.map((ticket) => (
                    <Card
                      key={ticket.id}
                      sx={{
                        p: 3.5,
                        borderRadius: '20px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                        border: '1px solid #F0F0F0',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          boxShadow: '0 12px 32px rgba(243, 107, 249, 0.2)',
                          transform: 'translateY(-4px)',
                          borderColor: '#F36BF9',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        {/* Ticket Name */}
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 700,
                                color: '#2A3363',
                                fontSize: '1.25rem',
                              }}
                            >
                              {ticket.name}
                            </Typography>
                            {ticket.earlyBird && (
                              <Chip
                                label={t('customer.earlyBird')}
                                size="small"
                                sx={{
                                  backgroundColor: '#FFD54F',
                                  color: '#F57C00',
                                  fontWeight: 700,
                                  fontSize: '10px',
                                  height: '22px',
                                  letterSpacing: '0.5px',
                                }}
                              />
                            )}
                          </Box>

                          {/* Description */}
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#666',
                              mb: 2,
                              lineHeight: 1.6,
                              fontSize: '0.95rem',
                            }}
                          >
                            {ticket.description || t('customer.standardAdmission')}
                          </Typography>

                          {/* Badges */}
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            <Chip
                              label={t('customer.available', { count: ticket.total - ticket.sold })}
                              size="small"
                              sx={{
                                backgroundColor: '#E8F5E9',
                                color: '#2E7D32',
                                fontSize: '12px',
                                fontWeight: 600,
                                height: '26px',
                              }}
                            />
                            {ticket.perUserLimit && (
                              <Chip
                                label={t('customer.maxPerUser', { count: ticket.perUserLimit })}
                                size="small"
                                sx={{
                                  backgroundColor: '#E3F2FD',
                                  color: '#1565C0',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  height: '26px',
                                }}
                              />
                            )}
                          </Box>
                        </Box>

                        {/* Price - Right Side */}
                        <Box sx={{ textAlign: 'right', ml: 3 }}>
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 900,
                              background: 'linear-gradient(135deg, #F36BF9 0%, #8E2DE2 100%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              fontSize: '2rem',
                            }}
                          >
                            ${ticket.price.toLocaleString()}
                          </Typography>
                          {ticket.earlyBird && ticket.earlyBirdDiscount && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#F57C00',
                                fontWeight: 700,
                                display: 'block',
                                fontSize: '0.9rem',
                              }}
                            >
                              {t('customer.percentOff', { percent: ticket.earlyBirdDiscount })}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Card>
                  ))
                )}

                {/* Select Tickets Button */}
                {ticketTypes.length > 0 && (
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleBookNow}
                    sx={{
                      mt: 2,
                      background: 'linear-gradient(135deg, #F36BF9 0%, #8E2DE2 100%)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '1.15rem',
                      py: 2.5,
                      borderRadius: '20px',
                      textTransform: 'none',
                      boxShadow: '0 8px 24px rgba(243, 107, 249, 0.35)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #e55ae0 0%, #7d26d1 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 32px rgba(243, 107, 249, 0.45)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {t('customer.selectTickets')} →
                  </Button>
                )}
              </Box>
            </Box>

            {/* RIGHT COLUMN - About Event */}
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: '#2A3363',
                  mb: 4,
                  fontSize: '2.5rem',
                }}
              >
                {t('customer.aboutEvent')}
              </Typography>

              <Card
                sx={{
                  p: 5,
                  borderRadius: '20px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  backgroundColor: 'white',
                  border: '1px solid #F0F0F0',
                }}
              >
                {/* Description */}
                <Typography
                  variant="body1"
                  sx={{
                    color: '#666',
                    lineHeight: 2,
                    fontSize: '1.05rem',
                    whiteSpace: 'pre-wrap',
                    mb: 5,
                  }}
                >
                  {event.description ||
                    `Experience an unforgettable ${event.category?.name || 'event'} at ${
                      event.venue?.name
                    }. This spectacular event promises to deliver an amazing experience with world-class entertainment, vibrant atmosphere, and memories that will last a lifetime.

Join us for an incredible celebration featuring stunning performances, immersive experiences, and the opportunity to connect with fellow enthusiasts. Whether you're a longtime fan or discovering this for the first time, this event is designed to create magical moments for everyone.

Don't miss your chance to be part of this extraordinary occasion. Get your tickets now and prepare for an experience unlike any other!`}
                </Typography>

                {/* Divider */}
                <Box sx={{ borderTop: '2px solid #E0E0E0', my: 4 }} />

                {/* Event Details */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: '#2A3363',
                    mb: 3,
                    fontSize: '1.35rem',
                  }}
                >
                  {t('customer.eventDetails')}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Category */}
                  {event.category && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: '#999', minWidth: '120px', fontWeight: 600, fontSize: '0.95rem' }}
                      >
                        {t('common.labels.category')}
                      </Typography>
                      <Chip
                        label={event.category.name}
                        sx={{
                          backgroundColor: '#EEF2FF',
                          color: '#4F46E5',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          height: '32px',
                          px: 1,
                        }}
                      />
                    </Box>
                  )}

                  {/* Organized by */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: '#999', minWidth: '120px', fontWeight: 600, fontSize: '0.95rem' }}
                    >
                      {t('customer.organizedBy')}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#2A3363', fontSize: '1rem' }}>
                      {event.organizer?.name || t('customer.eventOrganizer')}
                    </Typography>
                  </Box>

                  {/* Status */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: '#999', minWidth: '120px', fontWeight: 600, fontSize: '0.95rem' }}
                    >
                      {t('common.labels.status')}
                    </Typography>
                    <Chip
                      label={event.status}
                      sx={{
                        backgroundColor:
                          event.status === 'PUBLISHED'
                            ? '#D1FAE5'
                            : event.status === 'CANCELLED'
                            ? '#FEE2E2'
                            : '#FEF3C7',
                        color:
                          event.status === 'PUBLISHED'
                            ? '#065F46'
                            : event.status === 'CANCELLED'
                            ? '#991B1B'
                            : '#92400E',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        height: '32px',
                        px: 1,
                      }}
                    />
                  </Box>
                </Box>
              </Card>
            </Box>
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
