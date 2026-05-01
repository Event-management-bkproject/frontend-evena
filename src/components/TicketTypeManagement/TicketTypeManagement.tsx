'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  VisibilityOff,
  ConfirmationNumber,
  CheckCircle,
  Cancel,
  Block,
  SellOutlined,
  PowerSettingsNew,
  PlayArrow,
  DraftsOutlined,
  MoreVert,
} from '@mui/icons-material';
import {
  useGetTicketTypesQuery,
  useDeleteTicketTypeMutation,
  useActivateTicketTypeMutation,
  useDeactivateTicketTypeMutation,
} from '@/src/stores/services';
import { EventResponse, TicketTypeResponse, TicketTypeStatus } from '@/src/stores/types';
import TicketTypeFormModal from '../TicketTypeFormModal';
import SnackbarNotification from '../SnackbarNotification';
import ConfirmationDialog from '../ConfirmationDialog';
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
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [ticketTypeToDeactivate, setTicketTypeToDeactivate] = useState<TicketTypeResponse | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuTicketType, setMenuTicketType] = useState<TicketTypeResponse | null>(null);
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, ticketType: TicketTypeResponse) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuTicketType(ticketType);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuTicketType(null);
  };

  const { data: ticketTypesResponse, isLoading, error } = useGetTicketTypesQuery(eventId, {
    refetchOnMountOrArgChange: 120,
  });

  const [deleteTicketType, { isLoading: deleting }] = useDeleteTicketTypeMutation();
  const [activateTicketType, { isLoading: activating }] = useActivateTicketTypeMutation();
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
    } catch (error: any) {
      console.error('Error deleting ticket type:', error);
      showSnackbar(error?.data?.message || 'Failed to delete ticket type', 'error');
    }
  };

  const handleDeactivateClick = (ticketType: TicketTypeResponse) => {
    setTicketTypeToDeactivate(ticketType);
    setDeactivateDialogOpen(true);
  };

  const handleDeactivateConfirm = async () => {
    if (!ticketTypeToDeactivate) return;

    try {
      await deactivateTicketType({
        eventId,
        ticketTypeId: ticketTypeToDeactivate.id,
      }).unwrap();
      setDeactivateDialogOpen(false);
      setTicketTypeToDeactivate(null);
      showSnackbar('Ticket type deactivated successfully', 'success');
    } catch (error: any) {
      console.error('Error deactivating ticket type:', error);
      showSnackbar(error?.data?.message || 'Failed to deactivate ticket type', 'error');
    }
  };

  const handleActivate = async (ticketType: TicketTypeResponse) => {
    try {
      await activateTicketType({ eventId, ticketTypeId: ticketType.id }).unwrap();
      showSnackbar('Ticket type activated successfully', 'success');
    } catch (error: any) {
      showSnackbar(error?.data?.message || 'Failed to activate ticket type', 'error');
    }
  };

  const getStatusColor = (status: TicketTypeStatus) => {
    switch (status) {
      case TicketTypeStatus.DRAFT:
        return { bg: '#E3F2FD', color: '#1565C0', icon: <DraftsOutlined fontSize="small" /> };
      case TicketTypeStatus.ACTIVE:
        return { bg: '#E8F5E9', color: '#2E7D32', icon: <CheckCircle fontSize="small" /> };
      case TicketTypeStatus.SOLD_OUT:
        return { bg: '#FFF3E0', color: '#E65100', icon: <SellOutlined fontSize="small" /> };
      case TicketTypeStatus.DEACTIVATED:
        return { bg: '#F5F5F5', color: '#616161', icon: <Block fontSize="small" /> };
      default:
        return { bg: '#F5F5F5', color: '#616161', icon: <Cancel fontSize="small" /> };
    }
  };

  const getStatusLabel = (status: TicketTypeStatus) => {
  switch (status) {
    case TicketTypeStatus.DRAFT:
      return 'Draft';
    case TicketTypeStatus.ACTIVE:
      return 'Active';
    case TicketTypeStatus.SOLD_OUT:
      return 'Sold out';
    case TicketTypeStatus.DEACTIVATED:
      return 'Off';
    default:
      return status;
  }
};

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <>
      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
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

          {/* Ticket Type List */}
          {!isLoading && !error && ticketTypes.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {ticketTypes.map((ticketType) => {
                const statusStyle = getStatusColor(ticketType.status);
                return (
                  <Box
                    key={ticketType.id}
                    data-id={ticketType.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 1.5,
                      py: 1.25,
                      borderRadius: '10px',
                      border: '1px solid #F0F0F0',
                      backgroundColor: '#FAFAFA',
                      '&:hover': { backgroundColor: '#F5F0FF' },
                      transition: 'background-color 0.15s',
                    }}
                  >
                    {/* Left: name + price + meta */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}
                        >
                          {ticketType.name}
                        </Typography>
                        {ticketType.earlyBird && (
                          <Chip
                            label={`-${ticketType.earlyBirdDiscount}%`}
                            size="small"
                            sx={{ height: 18, fontSize: '0.6rem', backgroundColor: '#FFE0B2', color: '#E65100' }}
                          />
                        )}
                        {!ticketType.visible && (
                          <Chip
                            icon={<VisibilityOff sx={{ fontSize: '0.7rem' }} />}
                            label="Hidden"
                            size="small"
                            sx={{ height: 18, fontSize: '0.6rem' }}
                          />
                        )}
                      </Box>
                      <Typography variant="body2" fontWeight={700} sx={{ color: '#f36bf9', fontSize: '0.8rem' }}>
                        {formatPrice(ticketType.price)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {ticketType.sold}/{ticketType.total} sold · {ticketType.available} left
                      </Typography>
                    </Box>

                    {/* Status chip */}
                    <Chip
                      icon={statusStyle.icon}
                      label={getStatusLabel(ticketType.status)}
                      size="small"
                      sx={{
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                        fontWeight: 600,
                        fontSize: '0.65rem',
                        flexShrink: 0,
                        '& .MuiChip-icon': { color: statusStyle.color, fontSize: '0.85rem' },
                        '& .MuiChip-label': { px: 0.75 },
                      }}
                    />

                    {/* 3-dot menu button */}
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, ticketType)}
                      sx={{ flexShrink: 0, color: '#9E9E9E', '&:hover': { color: '#f36bf9' } }}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Box>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 3-dot actions menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            if (menuTicketType) handleEdit(menuTicketType);
            handleMenuClose();
          }}
          disabled={menuTicketType?.status !== TicketTypeStatus.DRAFT}
        >
          <ListItemIcon><Edit fontSize="small" sx={{ color: '#1976d2' }} /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>

        {menuTicketType?.status === TicketTypeStatus.DRAFT && (
          <MenuItem
            onClick={() => {
              if (menuTicketType) handleActivate(menuTicketType);
              handleMenuClose();
            }}
            disabled={activating}
          >
            <ListItemIcon><PlayArrow fontSize="small" sx={{ color: '#2e7d32' }} /></ListItemIcon>
            <ListItemText>Activate</ListItemText>
          </MenuItem>
        )}

        {(menuTicketType?.status === TicketTypeStatus.ACTIVE || menuTicketType?.status === TicketTypeStatus.SOLD_OUT) && (
          <MenuItem
            onClick={() => {
              if (menuTicketType) handleDeactivateClick(menuTicketType);
              handleMenuClose();
            }}
            disabled={deactivating}
          >
            <ListItemIcon><PowerSettingsNew fontSize="small" sx={{ color: '#ed6c02' }} /></ListItemIcon>
            <ListItemText>Deactivate</ListItemText>
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            if (menuTicketType) handleDeleteClick(menuTicketType);
            handleMenuClose();
          }}
          disabled={
            deleting ||
            menuTicketType?.status !== TicketTypeStatus.DRAFT ||
            (menuTicketType?.sold ?? 0) > 0
          }
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon><Delete fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Create Ticket Type Modal */}
      <TicketTypeFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        eventId={eventId}
        eventStatus={event?.status}
        onSuccess={() => {
          setCreateModalOpen(false);
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
          eventStatus={event?.status}
          hasSoldTickets={selectedTicketType.sold > 0}
          onSuccess={() => {
            setEditModalOpen(false);
            setSelectedTicketType(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Ticket Type"
        message={
          <>
            Are you sure you want to delete <strong>{ticketTypeToDelete?.name}</strong>? This action cannot be undone.
          </>
        }
        variant="error"
        confirmText="Delete"
        loadingText="Deleting..."
        loading={deleting}
      >
        {ticketTypeToDelete && ticketTypeToDelete.sold > 0 && (
          <Alert severity="warning" sx={{ mt: 2, borderRadius: '8px' }}>
            This ticket type has {ticketTypeToDelete.sold} sold tickets and cannot be deleted.
          </Alert>
        )}
      </ConfirmationDialog>

      {/* Deactivate Confirmation Dialog */}
      <ConfirmationDialog
        open={deactivateDialogOpen}
        onClose={() => setDeactivateDialogOpen(false)}
        onConfirm={handleDeactivateConfirm}
        title="Deactivate Ticket Type"
        message={
          <>
            Are you sure you want to deactivate <strong>{ticketTypeToDeactivate?.name}</strong>?
          </>
        }
        variant="warning"
        confirmText="Deactivate"
        loadingText="Deactivating..."
        loading={deactivating}
      >
        <Alert severity="info" sx={{ mt: 2, borderRadius: '8px' }}>
          <Typography variant="body2">
            <strong>What happens when you deactivate:</strong>
          </Typography>
          <Typography variant="body2" component="ul" sx={{ mt: 1, pl: 2 }}>
            <li>New sales will be stopped immediately</li>
            <li>Existing bookings remain valid for check-in</li>
            <li>Existing bookings can still be refunded</li>
            <li>This action follows the immutability rules</li>
          </Typography>
        </Alert>
        {ticketTypeToDeactivate && ticketTypeToDeactivate.sold > 0 && (
          <Alert severity="warning" sx={{ mt: 2, borderRadius: '8px' }}>
            This ticket type has {ticketTypeToDeactivate.sold} sold tickets that will remain valid.
          </Alert>
        )}
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

export default TicketTypeManagement;
