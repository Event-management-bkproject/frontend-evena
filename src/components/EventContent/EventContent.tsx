'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Divider,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  CalendarMonth,
  LocationOn,
  AttachMoney,
  ConfirmationNumber,
  Map as MapIcon,
  Edit,
  Delete,
  Verified,
  Pending,
  CheckCircle,
  Cancel,
  Check,
  Close,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { EventResponse, EventStatus } from '@/src/stores/types';
import VenueMap from '../VenueMap';
import { ConfirmationDialog } from '../ConfirmationDialog';
import SnackbarNotification from '../SnackbarNotification';
import { usePublishEventMutation, useCancelEventMutation } from '@/src/stores/services';
import { useSnackbar } from '@/src/hooks/useSnackbar';

interface EventContentProps {
  event: EventResponse;
  onRefresh?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const EventContent = ({ event, onRefresh, onEdit, onDelete }: EventContentProps) => {
  const { t } = useTranslation();
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const [publishEvent, { isLoading: publishing }] = usePublishEventMutation();
  const [cancelEvent, { isLoading: cancelling }] = useCancelEventMutation();

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case EventStatus.PUBLISHED:
        return { bg: '#E8F5E9', color: '#2E7D32', icon: <Verified fontSize="small" /> };
      case EventStatus.ONGOING:
        return { bg: '#E3F2FD', color: '#1565C0', icon: <CheckCircle fontSize="small" /> };
      case EventStatus.COMPLETED:
        return { bg: '#F5F5F5', color: '#616161', icon: <CheckCircle fontSize="small" /> };
      case EventStatus.CANCELLED:
        return { bg: '#FFEBEE', color: '#C62828', icon: <Cancel fontSize="small" /> };
      case EventStatus.DRAFT:
      default:
        return { bg: '#FFF3E0', color: '#E65100', icon: <Pending fontSize="small" /> };
    }
  };

  const statusStyle = getStatusColor(event.status);

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'EEE, MMM dd, yyyy - HH:mm');
    } catch {
      return dateString;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handlePublish = async () => {
    try {
      await publishEvent(event.id).unwrap();
      showSnackbar('Event published successfully!', 'success');
      onRefresh?.();
    } catch (error: any) {
      console.error('Error publishing event:', error);
      showSnackbar(error?.data?.message || 'Failed to publish event', 'error');
    }
  };

  const handleCancelClick = () => {
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    try {
      await cancelEvent(event.id).unwrap();
      setCancelDialogOpen(false);
      showSnackbar('Event cancelled successfully!', 'success');
      onRefresh?.();
    } catch (error: any) {
      console.error('Error cancelling event:', error);
      showSnackbar(error?.data?.message || 'Failed to cancel event', 'error');
    }
  };

  const minPrice =
    event.ticketTypes && event.ticketTypes.length > 0 ? Math.min(...event.ticketTypes.map((t) => t.price)) : 0;

  return (
    <>
      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        {/* Event Cover Image with Overlay Badges */}
        {event.coverUrl && (
          <Box sx={{ position: 'relative' }}>
            <Box
              component="img"
              src={event.coverUrl}
              alt={event.title}
              sx={{
                width: '100%',
                height: { xs: 250, md: 350 },
                objectFit: 'cover',
                borderRadius: '16px 16px 0 0',
              }}
            />
            {/* Category Badge - Top Left */}
            <Chip
              label={event.category.name}
              size="small"
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: '#f36bf9',
                fontWeight: 600,
                backdropFilter: 'blur(8px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            />
            {/* Status Badge - Top Right */}
            <Chip
              icon={statusStyle.icon}
              label={event.status}
              size="small"
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                backgroundColor: statusStyle.bg,
                color: statusStyle.color,
                fontWeight: 600,
                backdropFilter: 'blur(8px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                '& .MuiChip-icon': {
                  color: statusStyle.color,
                },
              }}
            />
          </Box>
        )}

        <CardContent sx={{ p: 3 }}>
          {/* Event Title with Action Buttons */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#36437C' }}>
              {event.title}
            </Typography>
            {(onEdit || onDelete || event.status === EventStatus.DRAFT || event.status === EventStatus.PUBLISHED) && (
              <Box display="flex" gap={1}>
                {/* Publish/Cancel Buttons */}
                {event.status === EventStatus.DRAFT && (
                  <IconButton
                    onClick={handlePublish}
                    disabled={publishing}
                    sx={{
                      color: '#F36BF9',
                      padding: '8px',
                      '&:hover': {
                        backgroundColor: 'rgba(243, 107, 249, 0.1)',
                      },
                    }}
                  >
                    <Box component="i" className="fa-regular fa-circle-check" sx={{ fontSize: '20px' }} />
                  </IconButton>
                )}
                {event.status === EventStatus.PUBLISHED && (
                  <IconButton
                    onClick={handleCancelClick}
                    disabled={cancelling}
                    sx={{
                      color: '#FF5B5E',
                      padding: '8px',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 91, 94, 0.1)',
                      },
                    }}
                  >
                    <Box component="i" className="fa-regular fa-circle-xmark" sx={{ fontSize: 20 }} />
                  </IconButton>
                )}

                {/* Edit/Delete Buttons */}
                {onEdit && (
                  <IconButton
                    onClick={onEdit}
                    disabled={event.status !== EventStatus.DRAFT}
                    title={event.status !== EventStatus.DRAFT ? 'Cannot edit: event is published' : 'Edit event'}
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
                )}
                {onDelete && (
                  <IconButton
                    onClick={onDelete}
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
                )}
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Info Grid - Date/Venue Block (Left) and Price/Tickets Block (Right) */}
          <Grid container spacing={4} mb={3}>
            {/* Left Column - Date & Time and Venue */}
            <Grid size={{ xs: 12, md: 8.4 }}>
              {/* Date & Time */}
              <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                <CalendarMonth sx={{ color: '#f36bf9', fontSize: 18 }} />
                <Typography variant="caption" fontWeight={600} sx={{ color: '#ADACAE' }}>
                  Date & Time:
                </Typography>
                <Typography variant="caption" fontWeight={500} sx={{ color: '#ADACAE' }}>
                  {formatDateTime(event.startAt)} to {formatDateTime(event.endAt)}
                </Typography>
              </Box>

              {/* Venue */}
              <Box display="flex" alignItems="center" gap={0.5}>
                <LocationOn sx={{ color: '#f36bf9', fontSize: 18 }} />
                <Typography variant="caption" fontWeight={600} sx={{ color: '#ADACAE' }}>
                  Venue:
                </Typography>
                <Typography variant="caption" fontWeight={500} sx={{ color: '#ADACAE' }}>
                  {event.venue.name}, {event.venue.address}, {event.venue.city}
                </Typography>
                {event.venue.lat && event.venue.lng && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<MapIcon sx={{ fontSize: 12 }} />}
                    onClick={() => setMapDialogOpen(true)}
                    sx={{
                      borderRadius: '6px',
                      textTransform: 'none',
                      backgroundColor: 'white',
                      color: '#f36bf9',
                      borderColor: '#f36bf9',
                      fontSize: '0.65rem',
                      py: 0.4,
                      px: 1.2,
                      fontWeight: 600,
                      minHeight: 'auto',
                      minWidth: 'auto',
                      width: 'fit-content',
                      whiteSpace: 'nowrap',
                      '&:hover': {
                        backgroundColor: 'rgba(243, 107, 249, 0.05)',
                        borderColor: '#f36bf9',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Show Map
                  </Button>
                )}
              </Box>
            </Grid>

            {/* Right Column - Price and Tickets */}
            <Grid size={{ xs: 12, md: 3.6 }}>
              {/* Price */}
              <Box mb={3}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <AttachMoney sx={{ color: '#f36bf9', fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#ADACAE' }}>
                    Starting Price
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="bold" color="#f36bf9">
                  {formatPrice(minPrice)}
                </Typography>
              </Box>

              {/* Available Tickets */}
              {event.stats && (
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <ConfirmationNumber sx={{ color: '#f36bf9', fontSize: 20 }} />
                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                      Tickets
                    </Typography>
                  </Box>
                  <Box display="flex" gap={2.5} flexWrap="wrap">
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Total
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {event.stats.totalTickets.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Sold
                      </Typography>
                      <Typography variant="h6" fontWeight={600} color="success.main">
                        {event.stats.soldTickets.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Available
                      </Typography>
                      <Typography variant="h6" fontWeight={600} color="primary.main">
                        {event.stats.availableTickets.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Sold %
                      </Typography>
                      <Typography variant="h6" fontWeight={600} color="#f36bf9">
                        {event.stats.soldPercentage.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* About Event */}
          <Box mb={3}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#36437C' }}>
              About Event
            </Typography>
            <Typography
              variant="body1"
              sx={{
                whiteSpace: 'pre-wrap',
                lineHeight: 1.8,
                color: '#ADACAE',
              }}
            >
              {event.description}
            </Typography>
          </Box>

          {/* Additional Images */}
          {event.imageUrls && event.imageUrls.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#36437C' }}>
                  Additional Images
                </Typography>
                <Grid container spacing={2}>
                  {event.imageUrls.map((imageUrl: string, index: number) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                      <Box
                        component="img"
                        src={imageUrl}
                        alt={`Event image ${index + 1}`}
                        sx={{
                          width: '100%',
                          height: 200,
                          objectFit: 'cover',
                          borderRadius: '12px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Map Dialog */}
      <Dialog
        open={mapDialogOpen}
        onClose={() => setMapDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
          },
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <LocationOn sx={{ color: '#f36bf9' }} />
            <Typography variant="h6" fontWeight="bold">
              {event.venue.name}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {event.venue.address}, {event.venue.city}
          </Typography>
          <VenueMap lat={event.venue.lat!} lng={event.venue.lng!} venueName={event.venue.name} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMapDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Event Dialog */}
      <ConfirmationDialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={handleCancelConfirm}
        title={t('event.confirmCancel.title')}
        message={t('event.confirmCancel.message', { eventTitle: event.title })}
        variant="warning"
        loading={cancelling}
        confirmText={t('event.confirmCancel.confirm')}
        cancelText={t('common.buttons.goBack')}
        loadingText={t('event.cancelling')}
        maxWidth="sm"
        disableBackdropClose
      >
        <Alert severity="warning" sx={{ mb: 2, mt: 2, borderRadius: '12px' }}>
          {t('event.confirmCancel.warning')}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          {t('event.confirmCancel.info')}
        </Typography>
      </ConfirmationDialog>

      {/* Snackbar for notifications */}
      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={closeSnackbar}
      />
    </>
  );
};

export default EventContent;
