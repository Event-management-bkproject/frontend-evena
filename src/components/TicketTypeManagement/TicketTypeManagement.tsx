'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  ConfirmationNumber,
  CheckCircle,
  Cancel,
  Block,
  SellOutlined,
} from '@mui/icons-material';
import { format } from 'date-fns';
import {
  useGetTicketTypesQuery,
  useDeleteTicketTypeMutation,
  useDeactivateTicketTypeMutation,
  useGetEventByIdQuery,
} from '@/src/stores/services';
import { EventResponse, TicketTypeResponse, TicketTypeStatus } from '@/src/stores/types';
import TicketTypeFormModal from '../TicketTypeFormModal';
import SnackbarNotification from '../SnackbarNotification';
import { useSnackbar } from '@/src/hooks/useSnackbar';

interface TicketTypeManagementProps {
  eventId: string;
  event: EventResponse;
  onEventUpdate?: () => void; // Optional callback when event data should be refreshed
}

const TicketTypeManagement = ({ eventId, event, onEventUpdate }: TicketTypeManagementProps) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketTypeResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ticketTypeToDelete, setTicketTypeToDelete] = useState<TicketTypeResponse | null>(null);
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  const { data: ticketTypesResponse, isLoading, error, refetch } = useGetTicketTypesQuery(eventId, {
    refetchOnMountOrArgChange: 10, // Refetch if data is older than 10 seconds
  });

  const [deleteTicketType, { isLoading: deleting }] = useDeleteTicketTypeMutation();
  const [deactivateTicketType, { isLoading: deactivating }] = useDeactivateTicketTypeMutation();

  const ticketTypes = ticketTypesResponse?.data || [];

  const handleEdit = (ticketType: TicketTypeResponse) => {
    setSelectedTicketType(ticketType);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (ticketType: TicketTypeResponse) => {
    setTicketTypeToDelete(ticketType);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!ticketTypeToDelete) return;

    try {
      await deleteTicketType({
        eventId,
        ticketTypeId: ticketTypeToDelete.id,
      }).unwrap();
      setDeleteDialogOpen(false);
      setTicketTypeToDelete(null);

      // Refetch ticket types
      await refetch();

      // Trigger parent Event refetch to update minPrice and availableTickets
      if (onEventUpdate) {
        onEventUpdate();
      }
    } catch (error: any) {
      console.error('Error deleting ticket type:', error);
      showSnackbar(error?.data?.message || 'Failed to delete ticket type', 'error');
    }
  };

  const getStatusColor = (status: TicketTypeStatus) => {
    switch (status) {
      case TicketTypeStatus.ACTIVE:
        return { bg: '#E8F5E9', color: '#2E7D32', icon: <CheckCircle fontSize="small" /> };
      case TicketTypeStatus.SOLD_OUT:
        return { bg: '#FFF3E0', color: '#E65100', icon: <SellOutlined fontSize="small" /> };
      case TicketTypeStatus.INACTIVE:
        return { bg: '#F5F5F5', color: '#616161', icon: <Block fontSize="small" /> };
      case TicketTypeStatus.CANCELLED:
        return { bg: '#FFEBEE', color: '#C62828', icon: <Cancel fontSize="small" /> };
      default:
        return { bg: '#F5F5F5', color: '#616161', icon: <Block fontSize="small" /> };
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <ConfirmationNumber sx={{ color: '#f36bf9', fontSize: 16 }} />
              <Typography variant="h6" fontWeight="bold">
                Ticket Types
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateModalOpen(true)}
              sx={{
                backgroundColor: '#f36bf9',
                borderRadius: '10px',
                textTransform: 'none',
                fontSize: '12px',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#e55ae0',
                },
              }}
            >
              Add Ticket Types
            </Button>
          </Box>

          {/* Loading State */}
          {isLoading && (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress sx={{ color: '#f36bf9' }} />
            </Box>
          )}

          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ borderRadius: '12px' }}>
              Failed to load ticket types
            </Alert>
          )}

          {/* Empty State */}
          {!isLoading && !error && ticketTypes.length === 0 && (
            <Box
              textAlign="center"
              py={6}
              px={3}
              sx={{
                backgroundColor: '#F9FAFB',
                borderRadius: '12px',
                border: '1px dashed #E0E0E0',
              }}
            >
              <ConfirmationNumber sx={{ fontSize: 48, color: '#BDBDBD', mb: 2 }} />
              <Typography variant="h6" gutterBottom color="text.secondary">
                No ticket types yet
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Create your first ticket type to start selling tickets
              </Typography>
            </Box>
          )}

          {/* Ticket Types Table */}
          {!isLoading && !error && ticketTypes.length > 0 && (
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: '12px',
                boxShadow: 'none',
                border: '1px solid #E0E0E0',
              }}
            >
              <Table stickyHeader sx={{ tableLayout: 'fixed', width: '100%' }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F9FAFB' }}>
                    <TableCell sx={{ fontWeight: 600, width: '25%' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: '20%' }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: '25%' }}>Tickets</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: '15%' }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, width: '15%' }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ticketTypes.map((ticketType) => {
                    const statusStyle = getStatusColor(ticketType.status);

                    return (
                      <TableRow key={ticketType.id} hover>
                        <TableCell sx={{ overflow: 'hidden' }}>
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight={500}
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {ticketType.name}
                            </Typography>
                            {ticketType.earlyBird && (
                              <Chip
                                label={`-${ticketType.earlyBirdDiscount}%`}
                                size="small"
                                sx={{
                                  mt: 0.5,
                                  height: 20,
                                  fontSize: '0.65rem',
                                  backgroundColor: '#FFE0B2',
                                  color: '#E65100',
                                }}
                              />
                            )}
                            {!ticketType.visible && (
                              <Chip
                                icon={<VisibilityOff sx={{ fontSize: '0.75rem' }} />}
                                label="Hidden"
                                size="small"
                                sx={{
                                  mt: 0.5,
                                  ml: 0.5,
                                  height: 20,
                                  fontSize: '0.65rem',
                                }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ overflow: 'hidden' }}>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="#f36bf9"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {formatPrice(ticketType.price)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              Sold: <strong>{ticketType.sold}</strong> / {ticketType.total}
                            </Typography>
                            <Typography variant="caption" color="success.main">
                              Available: <strong>{ticketType.available}</strong>
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={statusStyle.icon}
                            label={ticketType.status}
                            size="small"
                            sx={{
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.color,
                              fontWeight: 600,
                              '& .MuiChip-icon': {
                                color: statusStyle.color,
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" gap={0.5} justifyContent="center">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(ticketType)}
                              sx={{
                                color: '#1976d2',
                                '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.08)' },
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(ticketType)}
                              disabled={deleting || ticketType.sold > 0}
                              sx={{
                                color: '#d32f2f',
                                '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.08)' },
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Create Ticket Type Modal */}
      <TicketTypeFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        eventId={eventId}
        onSuccess={async () => {
          setCreateModalOpen(false);
          await refetch();
          if (onEventUpdate) {
            onEventUpdate();
          }
        }}
      />

      {/* Edit Ticket Type Modal */}
      {selectedTicketType && (
        <TicketTypeFormModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedTicketType(null);
          }}
          eventId={eventId}
          ticketType={selectedTicketType}
          onSuccess={async () => {
            setEditModalOpen(false);
            setSelectedTicketType(null);
            await refetch();
            if (onEventUpdate) {
              onEventUpdate();
            }
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px' },
        }}
      >
        <DialogTitle>Delete Ticket Type</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{ticketTypeToDelete?.name}</strong>? This action cannot be undone.
          </Typography>
          {ticketTypeToDelete && ticketTypeToDelete.sold > 0 && (
            <Alert severity="warning" sx={{ mt: 2, borderRadius: '8px' }}>
              This ticket type has {ticketTypeToDelete.sold} sold tickets and cannot be deleted.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting || (ticketTypeToDelete?.sold || 0) > 0}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default TicketTypeManagement;
