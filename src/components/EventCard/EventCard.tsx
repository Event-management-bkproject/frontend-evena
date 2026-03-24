// components/EventCard/EventCard.tsx
'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CardActionArea,
  Avatar,
} from '@mui/material';
import { MoreVert, CalendarToday, Place, Category, Edit, Delete, Groups, Public, Drafts, Event as EventIcon } from '@mui/icons-material';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { EventListResponse, EventResponse, EventStatus } from '@/src/stores/types';
import { formatDate, formatTime } from '@/src/utils/dateFormatters';
import { getInitials } from '@/src/utils/common.utils';

interface EventCardProps {
  event: EventListResponse | EventResponse;
  onEdit?: (event: EventListResponse | EventResponse) => void;
  onDelete?: (event: EventListResponse | EventResponse) => void;
  onClick?: (event: EventListResponse | EventResponse) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'dashboard';
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onEdit,
  onDelete,
  onClick,
  showActions = true,
  variant = 'default',
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit?.(event);
    setAnchorEl(null);
  };

  const handleDelete = () => {
    onDelete?.(event);
    setAnchorEl(null);
  };

  const handleCardClick = () => {
    onClick?.(event);
  };

  const getStatusColor = (status: EventStatus): 'success' | 'default' | 'error' | 'info' | 'secondary' | 'primary' => {
    switch (status) {
      case EventStatus.PUBLISHED:
        return 'success';
      case EventStatus.DRAFT:
        return 'default';
      case EventStatus.CANCELLED:
        return 'error';
      case EventStatus.ONGOING:
        return 'info';
      case EventStatus.COMPLETED:
        return 'secondary';
      default:
        return 'primary';
    }
  };

  const getStatusIcon = (status: EventStatus) => {
    switch (status) {
      case EventStatus.PUBLISHED:
        return <Public fontSize="small" />;
      case EventStatus.DRAFT:
        return <Drafts fontSize="small" />;
      default:
        return undefined;
    }
  };

  // Helper function để lấy thông tin organizer name
  const getOrganizerName = () => {
    if ('organizer' in event && event.organizer) {
      // EventResponse có organizer object
      return (event as EventResponse).organizer.name;
    } else if ('organizerName' in event) {
      // EventListResponse có organizerName string
      return (event as EventListResponse).organizerName;
    }
    return 'Unknown Organizer';
  };

  // Helper function để lấy venue info
  const getVenueInfo = () => {
    if ('venue' in event && event.venue) {
      // EventResponse có venue object
      return {
        name: (event as EventResponse).venue.name,
        city: (event as EventResponse).venue.city,
      };
    } else if ('venueName' in event && 'city' in event) {
      // EventListResponse có venueName và city
      return {
        name: (event as EventListResponse).venueName,
        city: (event as EventListResponse).city,
      };
    }
    return null;
  };

  // Helper function để lấy category info
  const getCategoryInfo = () => {
    if ('category' in event && event.category) {
      // EventResponse có category object
      return (event as EventResponse).category.name;
    } else if ('categoryName' in event) {
      // EventListResponse có categoryName string
      return (event as EventListResponse).categoryName;
    }
    return null;
  };

  // Dashboard variant - hiển thị như DashboardEventCard
  if (variant === 'dashboard') {
    const startDate = new Date(event.startAt);
    const coverUrl = 'coverUrl' in event ? event.coverUrl : null;

    return (
      <Card
        data-id={event.id}
        onClick={handleCardClick}
        sx={{
          minWidth: 320,
          maxWidth: 320,
          cursor: onClick ? 'pointer' : 'default',
          borderRadius: '16px',
          overflow: 'hidden',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': onClick
            ? {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(243, 107, 249, 0.2)',
              }
            : {},
        }}
      >
        {/* Event Cover Image */}
        <Box sx={{ position: 'relative', width: '100%', height: 180, backgroundColor: '#E4E6F5' }}>
          {coverUrl ? (
            <Image src={coverUrl} alt={event.title} fill sizes="320px" style={{ objectFit: 'cover' }} />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <EventIcon sx={{ fontSize: 60, color: '#2A3363', opacity: 0.3 }} />
            </Box>
          )}

          {/* Status Badge */}
          <Chip
            label={event.status}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              backgroundColor: event.status === EventStatus.PUBLISHED ? '#4CAF50' : '#FF9800',
              color: 'white',
              fontWeight: 600,
            }}
          />
        </Box>

        {/* Event Info */}
        <Box sx={{ p: 2.5 }}>
          {/* Event Name */}
          <Typography
            sx={{
              color: '#000000',
              fontWeight: 500,
              fontSize: '14px',
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              minHeight: 40,
            }}
          >
            {event.title}
          </Typography>

          {/* Venue */}
          {getVenueInfo() && (
            <Typography
              sx={{
                color: '#ADACAE',
                fontSize: '10px',
                mb: 1.5,
              }}
            >
              📍 {getVenueInfo()!.name}, {getVenueInfo()!.city}
            </Typography>
          )}

          {/* Date and Price on same row */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ fontSize: '10px', color: '#ADACAE' }}>
              {startDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Typography>
            {'minPrice' in event && (
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#F36BF9' }}>
                From ${(event as EventListResponse).minPrice.toLocaleString()}
              </Typography>
            )}
          </Box>

          {/* Available tickets */}
          {'availableTickets' in event && (
            <Typography sx={{ fontSize: '10px', color: '#ADACAE', mt: 0.5 }}>
              {(event as EventListResponse).availableTickets.toLocaleString()} tickets available
            </Typography>
          )}
        </Box>
      </Card>
    );
  }

  const cardContent = (
    <CardContent sx={{ p: variant === 'compact' ? 2 : 3, flex: 1 }}>
      {/* Header with avatar, title and actions */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box display="flex" alignItems="center" gap={2} flex={1}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: variant === 'compact' ? 40 : 48,
              height: variant === 'compact' ? 40 : 48,
              fontSize: variant === 'compact' ? '0.875rem' : '1rem',
            }}
          >
            {getInitials(event.title)}
          </Avatar>
          <Box flex={1} minWidth={0}>
            <Typography
              variant={variant === 'compact' ? 'subtitle1' : 'h6'}
              component="h3"
              fontWeight="bold"
              sx={{
                wordBreak: 'break-word',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {event.title}
            </Typography>
            {variant === 'compact' && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                }}
              >
                By {getOrganizerName()}
              </Typography>
            )}
          </Box>
        </Box>

        {showActions && (
          <Box>
            <IconButton size="small" onClick={handleMenuClick} sx={{ mt: -0.5 }}>
              <MoreVert fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Status Chip */}
      <Box mb={variant === 'compact' ? 1 : 2}>
        <Chip
          icon={getStatusIcon(event.status)}
          label={event.status}
          size="small"
          color={getStatusColor(event.status)}
          variant={event.status === EventStatus.PUBLISHED ? 'filled' : 'outlined'}
        />
      </Box>

      {/* Description - only show in default variant và chỉ khi có description */}
      {variant === 'default' && 'description' in event && event.description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {event.description}
        </Typography>
      )}

      {/* Event Details */}
      <Box sx={{ '& > *:not(:last-child)': { mb: 1 } }}>
        {/* Date & Time */}
        <Box display="flex" alignItems="center" gap={1}>
          <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
            }}
          >
            {formatDate(event.startAt)} • {formatTime(event.startAt)}
          </Typography>
        </Box>

        {/* Venue */}
        {getVenueInfo() && (
          <Box display="flex" alignItems="center" gap={1}>
            <Place sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {getVenueInfo()!.name}, {getVenueInfo()!.city}
            </Typography>
          </Box>
        )}

        {/* Category */}
        {getCategoryInfo() && (
          <Box display="flex" alignItems="center" gap={1}>
            <Category sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {getCategoryInfo()}
            </Typography>
          </Box>
        )}

        {/* Organizer - only show in default variant */}
        {variant === 'default' && (
          <Box display="flex" alignItems="center" gap={1}>
            <Groups sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {getOrganizerName()}
            </Typography>
          </Box>
        )}
      </Box>
    </CardContent>
  );

  return (
    <>
      <Card
        data-id={event.id}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.2s ease-in-out',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            boxShadow: 4,
            transform: 'translateY(-2px)',
            borderColor: 'primary.light',
          },
        }}
      >
        {onClick ? (
          <CardActionArea onClick={handleCardClick} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {cardContent}
          </CardActionArea>
        ) : (
          cardContent
        )}
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEdit}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          {t('common.buttons.edit')}
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          {t('common.buttons.delete')}
        </MenuItem>
      </Menu>
    </>
  );
};

// Memoize to prevent unnecessary re-renders
export default React.memo(EventCard);
