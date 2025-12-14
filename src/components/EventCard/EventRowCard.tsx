// components/EventCard/EventRowCard.tsx
'use client';

import React from 'react';
import { Card, Typography, Box, IconButton } from '@mui/material';
import { CalendarToday, Place, ConfirmationNumber } from '@mui/icons-material';
import { EventListResponse, EventResponse } from '@/src/stores/types';

interface EventRowCardProps {
  event: EventListResponse | EventResponse;
  onEdit?: (event: EventListResponse | EventResponse) => void;
  onDelete?: (event: EventListResponse | EventResponse) => void;
  onClick?: (event: EventListResponse | EventResponse) => void;
}

const EventRowCard: React.FC<EventRowCardProps> = ({ event, onEdit, onDelete, onClick }) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(event);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(event);
  };

  const handleCardClick = () => {
    onClick?.(event);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper function để lấy venue info
  const getVenueInfo = () => {
    if ('venue' in event && event.venue) {
      return {
        name: (event as EventResponse).venue.name,
        city: (event as EventResponse).venue.city,
      };
    } else if ('venueName' in event && 'city' in event) {
      return {
        name: (event as EventListResponse).venueName,
        city: (event as EventListResponse).city,
      };
    }
    return { name: 'TBA', city: '' };
  };

  // Helper function để lấy category info
  const getCategoryInfo = () => {
    if ('category' in event && event.category) {
      return (event as EventResponse).category.name;
    } else if ('categoryName' in event) {
      return (event as EventListResponse).categoryName;
    }
    return 'General';
  };

  // Helper function để lấy description
  const getDescription = () => {
    if ('description' in event && event.description) {
      return event.description;
    }
    return '';
  };

  // Helper function để lấy coverUrl
  const getCoverUrl = () => {
    if ('coverUrl' in event && event.coverUrl) {
      return event.coverUrl;
    }
    return '/placeholder-event.jpg'; // Fallback image
  };

  // Helper function để lấy số lượng tickets available
  const getAvailableTickets = () => {
    // EventListResponse có availableTickets field
    if ('availableTickets' in event) {
      return (event as EventListResponse).availableTickets;
    }
    // EventResponse có ticketTypes array - tính tổng available
    if ('ticketTypes' in event && event.ticketTypes) {
      return (event as EventResponse).ticketTypes.reduce(
        (total, ticketType) => total + ticketType.available,
        0
      );
    }
    return 0;
  };

  // Helper function để lấy giá thấp nhất
  const getMinPrice = () => {
    // EventListResponse có minPrice field
    if ('minPrice' in event) {
      return (event as EventListResponse).minPrice;
    }
    // EventResponse có ticketTypes array - tìm price nhỏ nhất
    if ('ticketTypes' in event && event.ticketTypes && event.ticketTypes.length > 0) {
      const prices = (event as EventResponse).ticketTypes.map((tt) => tt.price);
      return Math.min(...prices);
    }
    return 0;
  };

  const venue = getVenueInfo();
  const availableTickets = getAvailableTickets();
  const minPrice = getMinPrice();

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: '25px',
        border: '1px solid #E0E0E0',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease-in-out',
        overflow: 'hidden',
        minHeight: '200px',
        '&:hover': {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(-2px)',
        },
      }}
      onClick={handleCardClick}
    >
      <Box display="flex" height="100%">
        {/* Left Image Area */}
        <Box
          sx={{
            width: '280px',
            flexShrink: 0,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            component="img"
            src={getCoverUrl()}
            alt={event.title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '20px',
              m: 2,
              maxWidth: 'calc(100% - 32px)',
              maxHeight: 'calc(100% - 32px)',
            }}
            onError={(e: any) => {
              e.target.src = 'https://via.placeholder.com/280x200?text=Event+Image';
            }}
          />
        </Box>

        {/* Right Content Area */}
        <Box
          sx={{
            flex: 1,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Top Section: Category and Action Buttons */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            {/* Category */}
            <Box
              sx={{
                backgroundColor: '#FCE2FE',
                borderRadius: '20px',
                px: 2,
                py: 0.75,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: '#F36BF9',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                {getCategoryInfo()}
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Box display="flex" gap={2}>
              <IconButton
                onClick={handleEdit}
                sx={{
                  color: '#F36BF9',
                  padding: '8px',
                  '&:hover': {
                    backgroundColor: 'rgba(243, 107, 249, 0.1)',
                  },
                }}
              >
                <Box component="i" className="fa-regular fa-pen-to-square" sx={{ fontSize: '20px' }} />
              </IconButton>
              <IconButton
                onClick={handleDelete}
                sx={{
                  color: '#36437C',
                  padding: '8px',
                  '&:hover': {
                    backgroundColor: 'rgba(54, 67, 124, 0.1)',
                  },
                }}
              >
                <Box component="i" className="fa-solid fa-trash" sx={{ fontSize: '20px' }} />
              </IconButton>
            </Box>
          </Box>

          {/* Bottom Section: 4 Parts */}
          <Box display="flex" gap={3} flex={1}>
            {/* Part 1: Name and Description */}
            <Box flex={1} display="flex" flexDirection="column" gap={1}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '20px',
                  color: '#2A3363',
                  lineHeight: 1.3,
                }}
              >
                {event.title}
              </Typography>
              {getDescription() && (
                <Typography
                  variant="body2"
                  sx={{
                    color: '#666',
                    fontSize: '14px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.5,
                  }}
                >
                  {getDescription()}
                </Typography>
              )}
            </Box>

            {/* Part 2: Location and Time */}
            <Box flex={1} display="flex" flexDirection="column" gap={2}>
              {/* Location */}
              <Box display="flex" alignItems="flex-start" gap={1}>
                <Place sx={{ fontSize: 20, color: '#F36BF9', mt: 0.3 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#2A3363', fontSize: '14px' }}>
                    {venue.name}
                  </Typography>
                  {venue.city && (
                    <Typography variant="caption" sx={{ color: '#666', fontSize: '12px' }}>
                      {venue.city}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Time */}
              <Box display="flex" alignItems="flex-start" gap={1}>
                <CalendarToday sx={{ fontSize: 20, color: '#F36BF9', mt: 0.3 }} />
                <Box display="flex" alignItems="center" gap={1}>
                  <Box display="flex" flexDirection="column">
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#2A3363', fontSize: '14px' }}>
                      {formatDate(event.startAt)}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#2A3363', fontSize: '14px' }}>
                      {formatTime(event.startAt)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#2A3363', fontSize: '14px', mx: 1 }}>
                    -
                  </Typography>
                  <Box display="flex" flexDirection="column">
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#2A3363', fontSize: '14px' }}>
                      {formatDate(event.endAt)}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#2A3363', fontSize: '14px' }}>
                      {formatTime(event.endAt)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Part 3: Tickets */}
            <Box flex={1} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    backgroundColor: '#F7F7F7',
                    borderRadius: '10px',
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ConfirmationNumber sx={{ fontSize: 28, color: '#F36BF9' }} />
                </Box>
                <Box display="flex" flexDirection="column">
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#2A3363', fontSize: '14px' }}>
                    {availableTickets > 0 ? availableTickets.toLocaleString() : 'N/A'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666', fontSize: '12px' }}>
                    Tickets
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Part 4: Price */}
            <Box flex={1} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
              <Box
                sx={{
                  backgroundColor: '#EEF0FF',
                  borderRadius: '10px',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: '#F36BF9',
                    fontSize: '24px',
                  }}
                >
                  {minPrice > 0 ? `$${minPrice.toFixed(2)}` : 'TBA'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default EventRowCard;
