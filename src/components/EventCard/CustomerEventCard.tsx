'use client';

import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { Place, LocalFireDepartment } from '@mui/icons-material';
import { EventListResponse } from '@/src/stores/types';
import { useRouter } from 'next/navigation';
import { formatTime as utilFormatTime } from '@/src/utils/dateFormatters';

const FALLBACK_IMG =
  'https://static.vecteezy.com/system/resources/thumbnails/041/388/388/small/ai-generated-concert-crowd-enjoying-live-music-event-photo.jpg';

interface CustomerEventCardProps {
  event: EventListResponse;
  hot?: boolean;
}

export default function CustomerEventCard({ event, hot }: CustomerEventCardProps) {
  const router = useRouter();

  const date = new Date(event.startAt);
  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = date.getDate();
  const time = utilFormatTime(event.startAt);

  const isSoldOut = event.availableTickets === 0;
  const isAlmostGone = !isSoldOut && event.soldPercentage >= 80;

  const handleClick = () => router.push(`/dashboard/customer/events/${event.id}`);

  return (
    <Box
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`View ${event.title}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
      sx={{
        borderRadius: '16px',
        overflow: 'hidden',
        bgcolor: '#fff',
        cursor: 'pointer',
        transition: 'transform 0.25s, box-shadow 0.25s',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 32px rgba(96,147,252,0.18)',
        },
        '&:focus-visible': { outline: '2px solid #6093FC', outlineOffset: 2 },
      }}
    >
      {/* Image */}
      <Box sx={{ position: 'relative', height: 200, flexShrink: 0, overflow: 'hidden' }}>
        <Box
          component="img"
          src={event.coverUrl || FALLBACK_IMG}
          alt={event.title}
          sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', '.MuiBox-root:hover &': { transform: 'scale(1.05)' } }}
        />

        {/* Gradient overlay */}
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.6) 0%, transparent 55%)' }} />

        {/* HOT badge */}
        {hot && (
          <Box sx={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 0.4, px: 1, py: 0.4, borderRadius: '20px', bgcolor: '#FF4D00', backdropFilter: 'blur(4px)' }}>
            <LocalFireDepartment sx={{ fontSize: 12, color: '#fff' }} />
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>HOT</Typography>
          </Box>
        )}

        {/* Category chip */}
        {event.categoryName && (
          <Chip
            label={event.categoryName}
            size="small"
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              bgcolor: 'rgba(255,255,255,0.92)',
              color: '#0F172A',
              fontWeight: 600,
              fontSize: 11,
              height: 22,
              backdropFilter: 'blur(4px)',
              '& .MuiChip-label': { px: 1 },
            }}
          />
        )}

        {/* Price badge */}
        <Box sx={{ position: 'absolute', bottom: 10, right: 10 }}>
          {isSoldOut ? (
            <Box sx={{ px: 1.5, py: 0.5, borderRadius: '8px', bgcolor: 'rgba(30,30,30,0.75)', backdropFilter: 'blur(4px)' }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.5px' }}>SOLD OUT</Typography>
            </Box>
          ) : (
            <Box sx={{ px: 1.5, py: 0.5, borderRadius: '8px', background: 'linear-gradient(135deg,#F36BF9,#6093FC)', backdropFilter: 'blur(4px)' }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
                {event.minPrice === 0 ? 'Free' : `From $${event.minPrice.toLocaleString()}`}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Date badge bottom-left */}
        <Box sx={{ position: 'absolute', bottom: 10, left: 10, display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{day}</Typography>
          <Box>
            <Typography sx={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.5px', lineHeight: 1 }}>{month}</Typography>
            <Typography sx={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', lineHeight: 1 }}>{time}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 15,
            color: '#0F172A',
            lineHeight: 1.35,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {event.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B', mt: 'auto' }}>
          <Place sx={{ fontSize: 14, flexShrink: 0 }} />
          <Typography variant="caption" sx={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {event.venueName}, {event.city}
          </Typography>
        </Box>

        {/* Availability bar */}
        {!isSoldOut && (
          <Box sx={{ mt: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontSize: 11, color: isAlmostGone ? '#F59E0B' : '#94A3B8' }}>
                {isAlmostGone ? '⚡ Almost gone' : `${event.availableTickets} tickets left`}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: 11, color: '#94A3B8' }}>{Math.round(event.soldPercentage)}% sold</Typography>
            </Box>
            <Box sx={{ height: 3, borderRadius: 2, bgcolor: '#F1F5F9', overflow: 'hidden' }}>
              <Box sx={{
                height: '100%',
                width: `${event.soldPercentage}%`,
                borderRadius: 2,
                background: isAlmostGone ? 'linear-gradient(90deg,#F59E0B,#EF4444)' : 'linear-gradient(90deg,#F36BF9,#6093FC)',
                transition: 'width 0.4s',
              }} />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
