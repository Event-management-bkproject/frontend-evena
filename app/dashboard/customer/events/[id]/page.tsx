'use client';

import React, { use, useEffect } from 'react';
import {
  Box, Container, Typography, Button, Chip, CircularProgress,
  Alert, Divider,
} from '@mui/material';
import {
  CalendarToday, Place, AccessTime, Group, ArrowBack,
  LocalOffer, CheckCircleOutline, People,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useGetEventByIdQuery } from '@/src/stores/services/EventApi';
import { useGetAvailableTicketTypesQuery } from '@/src/stores/services/TicketTypeApi';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import { useTranslation } from 'react-i18next';

const FALLBACK_IMG =
  'https://static.vecteezy.com/system/resources/thumbnails/041/388/388/small/ai-generated-concert-crowd-enjoying-live-music-event-photo.jpg';

export default function CustomerEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { t } = useTranslation();
  const { id: eventId } = use(params);

  const { data: eventResponse, isLoading: eventLoading, error: eventError } = useGetEventByIdQuery(eventId);
  const { data: ticketTypesResponse, isLoading: ticketsLoading } = useGetAvailableTicketTypesQuery(eventId);

  const event = eventResponse?.data;
  const ticketTypes = ticketTypesResponse?.data ?? [];

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
  const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const fmtPrice = (p: number) =>
    p === 0 ? 'Free' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

  const minPrice = ticketTypes.length ? Math.min(...ticketTypes.map((t) => t.price)) : 0;
  const totalAvailable = ticketTypes.reduce((s, t) => s + (t.total - t.sold), 0);

  useEffect(() => {
    if (eventLoading) return;
    if (eventError || (event && event.status !== 'PUBLISHED' && event.status !== 'ONGOING')) {
      router.replace('/dashboard/customer');
    }
  }, [event?.status, eventLoading, eventError, router]);

  if (eventLoading || ticketsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
        <CircularProgress sx={{ color: '#F36BF9' }} />
      </Box>
    );
  }

  if (!eventLoading && (eventError || (event && event.status !== 'PUBLISHED' && event.status !== 'ONGOING'))) {
    return null;
  }

  if (eventError || !event) {
    return (
      <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert severity="error">{t('messages.error.loadFailed', { item: t('common.entities.event') })}</Alert>
        </Container>
        <Footer />
      </Box>
    );
  }

  const isSoldOut = totalAvailable === 0 && ticketTypes.length > 0;

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <Box sx={{ position: 'relative', width: '100%', height: { xs: 280, sm: 380, md: 480 }, overflow: 'hidden' }}>
        <Box
          component="img"
          src={event.coverUrl || FALLBACK_IMG}
          alt={event.title}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Gradient overlay */}
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.65) 100%)' }} />

        {/* Back button */}
        <Box sx={{ position: 'absolute', top: 20, left: { xs: 16, md: 40 }, zIndex: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.back()}
            sx={{
              color: '#fff',
              bgcolor: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(8px)',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 13,
              px: 2,
              py: 0.75,
              '&:hover': { bgcolor: 'rgba(0,0,0,0.55)' },
            }}
          >
            Back
          </Button>
        </Box>

        {/* Hero text */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: { xs: 3, md: 5 },
            zIndex: 2,
          }}
        >
          {event.category && (
            <Chip
              label={event.category.name}
              size="small"
              sx={{ bgcolor: 'rgba(243,107,249,0.85)', color: '#fff', fontWeight: 700, fontSize: 11, mb: 1.5, backdropFilter: 'blur(4px)' }}
            />
          )}
          <Typography
            variant="h3"
            sx={{
              color: '#fff',
              fontWeight: 800,
              fontSize: { xs: '1.6rem', sm: '2.2rem', md: '2.8rem' },
              lineHeight: 1.2,
              letterSpacing: '-0.5px',
              textShadow: '0 2px 16px rgba(0,0,0,0.4)',
              mb: 1.5,
              maxWidth: 720,
            }}
          >
            {event.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'rgba(255,255,255,0.85)' }}>
              <CalendarToday sx={{ fontSize: 15 }} />
              <Typography variant="caption" sx={{ fontSize: 13, fontWeight: 500 }}>
                {fmt(event.startAt)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'rgba(255,255,255,0.85)' }}>
              <Place sx={{ fontSize: 15 }} />
              <Typography variant="caption" sx={{ fontSize: 13, fontWeight: 500 }}>
                {event.venue?.name}, {event.venue?.city}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Body ──────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1fr 360px' },
              gap: { xs: 4, lg: 5 },
              alignItems: 'start',
            }}
          >
            {/* ── LEFT: About + Details ───────────────────────────── */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

              {/* Quick info pills */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {[
                  { icon: <CalendarToday sx={{ fontSize: 16 }} />, label: fmt(event.startAt) },
                  { icon: <AccessTime sx={{ fontSize: 16 }} />, label: `${fmtTime(event.startAt)} – ${fmtTime(event.endAt)}` },
                  { icon: <Place sx={{ fontSize: 16 }} />, label: `${event.venue?.name}, ${event.venue?.city}` },
                  ...(event.organizer ? [{ icon: <Group sx={{ fontSize: 16 }} />, label: `By ${event.organizer.name}` }] : []),
                ].map(({ icon, label }) => (
                  <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, bgcolor: '#fff', borderRadius: '10px', border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <Box sx={{ color: '#F36BF9' }}>{icon}</Box>
                    <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{label}</Typography>
                  </Box>
                ))}
              </Box>

              {/* Event details card */}
              <Box sx={{ bgcolor: '#fff', borderRadius: '16px', p: { xs: 3, md: 4 }, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 3, fontSize: 18 }}>
                  {t('customer.eventDetails')}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {[
                    { label: 'Date', value: fmt(event.startAt) },
                    { label: 'Time', value: `${fmtTime(event.startAt)} – ${fmtTime(event.endAt)}` },
                    { label: 'Venue', value: event.venue?.name },
                    { label: 'Location', value: event.venue ? `${event.venue.address ?? ''}, ${event.venue.city}` : '—' },
                    ...(event.organizer ? [{ label: 'Organizer', value: event.organizer.name }] : []),
                    ...(event.category ? [{ label: 'Category', value: event.category.name }] : []),
                  ].map(({ label, value }) => (
                    <Box key={label} sx={{ display: 'flex', gap: 2 }}>
                      <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: 13, fontWeight: 600, minWidth: 100 }}>{label}</Typography>
                      <Typography variant="body2" sx={{ color: '#1E293B', fontSize: 13, fontWeight: 500, flex: 1 }}>{value ?? '—'}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* About + Additional Images */}
              <Box sx={{ bgcolor: '#fff', borderRadius: '16px', p: { xs: 3, md: 4 }, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 2.5, fontSize: 18 }}>
                  {t('customer.aboutEvent')}
                </Typography>
                <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.85, fontSize: 15, whiteSpace: 'pre-wrap' }}>
                  {event.description || `Experience an unforgettable ${event.category?.name ?? 'event'} at ${event.venue?.name}. This spectacular event promises to deliver an amazing experience with world-class entertainment and an atmosphere you'll never forget.`}
                </Typography>

                {event.imageUrls && event.imageUrls.length > 0 && (
                  <>
                    <Divider sx={{ my: 3, borderColor: '#CBD5E1' }} />
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 2.5, fontSize: 18 }}>
                      Additional Images
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 1.5 }}>
                      {event.imageUrls.map((url, i) => (
                        <Box
                          key={i}
                          component="img"
                          src={url}
                          alt={`${event.title} photo ${i + 1}`}
                          sx={{
                            width: '100%', height: 120, objectFit: 'cover',
                            borderRadius: '10px', display: 'block',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': { transform: 'scale(1.03)', boxShadow: '0 6px 20px rgba(0,0,0,0.15)' },
                          }}
                        />
                      ))}
                    </Box>
                  </>
                )}
              </Box>

            </Box>

            {/* ── RIGHT: Booking sidebar ───────────────────────────── */}
            <Box sx={{ position: { lg: 'sticky' }, top: { lg: 24 } }}>
              <Box sx={{ bgcolor: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', border: '1px solid #F1F5F9' }}>
                {/* Sidebar header */}
                <Box sx={{ px: 3, pt: 3, pb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {t('customer.startingFrom')}
                    </Typography>
                    {isSoldOut && (
                      <Chip label="Sold Out" size="small" sx={{ bgcolor: 'rgba(239,68,68,0.1)', color: '#EF4444', fontWeight: 700, fontSize: 11 }} />
                    )}
                  </Box>
                  <Typography sx={{ fontSize: 32, fontWeight: 900, background: 'linear-gradient(135deg,#F36BF9,#8E2DE2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>
                    {minPrice === 0 ? 'Free' : fmtPrice(minPrice)}
                  </Typography>
                  {totalAvailable > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <People sx={{ fontSize: 14, color: '#94A3B8' }} />
                      <Typography variant="caption" sx={{ fontSize: 12, color: '#94A3B8' }}>
                        {totalAvailable} tickets remaining
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Divider sx={{ borderColor: '#F1F5F9' }} />

                {/* Ticket type list */}
                <Box sx={{ px: 3, py: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: 14 }}>
                    {t('customer.packages')}
                  </Typography>

                  {ticketTypes.length === 0 ? (
                    <Box sx={{ py: 3, textAlign: 'center' }}>
                      <Typography variant="body2" color="#94A3B8">{t('customer.noTicketsAvailable')}</Typography>
                    </Box>
                  ) : (
                    ticketTypes.map((ticket) => {
                      const available = ticket.total - ticket.sold;
                      const soldPct = ticket.total > 0 ? (ticket.sold / ticket.total) * 100 : 0;
                      const almostGone = available > 0 && soldPct >= 80;

                      return (
                        <Box
                          key={ticket.id}
                          sx={{
                            p: 2,
                            borderRadius: '12px',
                            border: '1.5px solid #F1F5F9',
                            transition: 'border-color 0.15s, box-shadow 0.15s',
                            '&:hover': { borderColor: '#F36BF9', boxShadow: '0 4px 16px rgba(243,107,249,0.12)' },
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Box sx={{ flex: 1, pr: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: 14 }}>
                                  {ticket.name}
                                </Typography>
                                {ticket.earlyBird && (
                                  <Chip label="Early Bird" size="small" sx={{ bgcolor: '#FEF3C7', color: '#D97706', fontWeight: 700, fontSize: 10, height: 18, '& .MuiChip-label': { px: 0.75 } }} />
                                )}
                              </Box>
                              {ticket.description && (
                                <Typography variant="caption" sx={{ color: '#64748B', fontSize: 12, display: 'block', lineHeight: 1.5 }}>
                                  {ticket.description}
                                </Typography>
                              )}
                            </Box>
                            <Typography sx={{ fontWeight: 900, fontSize: 18, background: 'linear-gradient(135deg,#F36BF9,#8E2DE2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', flexShrink: 0 }}>
                              {fmtPrice(ticket.price)}
                            </Typography>
                          </Box>

                          {/* Availability */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {available > 0 ? (
                                <>
                                  <CheckCircleOutline sx={{ fontSize: 13, color: almostGone ? '#F59E0B' : '#22C55E' }} />
                                  <Typography variant="caption" sx={{ fontSize: 11, fontWeight: 600, color: almostGone ? '#F59E0B' : '#22C55E' }}>
                                    {almostGone ? `Only ${available} left!` : `${available} available`}
                                  </Typography>
                                </>
                              ) : (
                                <Typography variant="caption" sx={{ fontSize: 11, fontWeight: 600, color: '#EF4444' }}>Sold out</Typography>
                              )}
                            </Box>
                            {ticket.perUserLimit && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LocalOffer sx={{ fontSize: 12, color: '#94A3B8' }} />
                                <Typography variant="caption" sx={{ fontSize: 11, color: '#94A3B8' }}>
                                  Max {ticket.perUserLimit}/person
                                </Typography>
                              </Box>
                            )}
                          </Box>

                          {/* Progress bar */}
                          <Box sx={{ height: 3, borderRadius: 2, bgcolor: '#F1F5F9', overflow: 'hidden' }}>
                            <Box sx={{
                              height: '100%', width: `${soldPct}%`, borderRadius: 2,
                              background: almostGone ? 'linear-gradient(90deg,#F59E0B,#EF4444)' : 'linear-gradient(90deg,#F36BF9,#8E2DE2)',
                              transition: 'width 0.4s',
                            }} />
                          </Box>
                        </Box>
                      );
                    })
                  )}
                </Box>

                {/* CTA */}
                {ticketTypes.length > 0 && (
                  <Box sx={{ px: 3, pb: 3 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      disabled={isSoldOut}
                      onClick={() => router.push(`/dashboard/customer/events/${eventId}/tickets`)}
                      sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 800,
                        fontSize: 16,
                        py: 1.75,
                        background: isSoldOut ? undefined : 'linear-gradient(135deg,#F36BF9,#8E2DE2)',
                        boxShadow: isSoldOut ? 'none' : '0 6px 20px rgba(243,107,249,0.35)',
                        '&:hover': { background: 'linear-gradient(135deg,#e055e8,#7d26d1)', boxShadow: '0 8px 24px rgba(243,107,249,0.45)' },
                      }}
                    >
                      {isSoldOut ? 'Sold Out' : `${t('customer.selectTickets')} →`}
                    </Button>
                    {!isSoldOut && (
                      <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#94A3B8', fontSize: 11, mt: 1 }}>
                        No hidden fees · Instant confirmation
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Mobile sticky CTA */}
      {ticketTypes.length > 0 && (
        <Box
          sx={{
            display: { xs: 'block', lg: 'none' },
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            bgcolor: '#fff',
            borderTop: '1px solid #F1F5F9',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
            zIndex: 100,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 11 }}>From</Typography>
              <Typography sx={{ fontWeight: 900, fontSize: 20, background: 'linear-gradient(135deg,#F36BF9,#8E2DE2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
                {minPrice === 0 ? 'Free' : fmtPrice(minPrice)}
              </Typography>
            </Box>
            <Button
              fullWidth
              variant="contained"
              disabled={isSoldOut}
              onClick={() => router.push(`/dashboard/customer/events/${eventId}/tickets`)}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: 15,
                py: 1.5,
                background: 'linear-gradient(135deg,#F36BF9,#8E2DE2)',
                boxShadow: '0 4px 14px rgba(243,107,249,0.35)',
                '&:hover': { background: 'linear-gradient(135deg,#e055e8,#7d26d1)' },
              }}
            >
              {isSoldOut ? 'Sold Out' : t('customer.bookNow')}
            </Button>
          </Box>
        </Box>
      )}

      <Footer />
    </Box>
  );
}
