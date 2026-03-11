'use client';

import { Formik, Form } from 'formik';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Box,
  Typography,
  IconButton,
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import { Close, Info } from '@mui/icons-material';
import FormTextField from '../FormTextField';
import { ticketTypeSchema } from '@/src/utils/validationSchema/ticketTypeValidationSchema';
import { useCreateTicketTypeMutation, useUpdateTicketTypeMutation } from '@/src/stores/services';
import { TicketTypeResponse, CreateTicketTypeRequest, EventStatus } from '@/src/stores/types';
import { isBusinessRuleViolation } from '@/src/stores/types/api';
import { useOptimisticLocking, ENTITY_EVENT_TYPES } from '@/src/hooks/useOptimisticLocking';

interface TicketTypeFormModalProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  ticketType?: TicketTypeResponse;
  onSuccess?: () => void;
  eventStatus?: EventStatus;
  hasSoldTickets?: boolean;
}

const TicketTypeFormModal = ({
  open,
  onClose,
  eventId,
  ticketType,
  onSuccess,
  eventStatus,
  hasSoldTickets = false,
}: TicketTypeFormModalProps) => {
  const [createTicketType, { isLoading: creating }] = useCreateTicketTypeMutation();
  const [updateTicketType, { isLoading: updating }] = useUpdateTicketTypeMutation();

  const isEditMode = !!ticketType;
  const loading = creating || updating;

  const { hasConflict, conflictMessage, version } = useOptimisticLocking({
    entityId: ticketType?.id ?? 0,
    entityVersion: ticketType?.version ?? 0,
    entityType: 'TICKET_TYPE',
    eventTypes: ENTITY_EVENT_TYPES.TICKET_TYPE,
  });

  // Business rule: Critical fields are immutable when event is published or has sold tickets
  const isEventPublished =
    eventStatus === EventStatus.PUBLISHED ||
    eventStatus === EventStatus.ONGOING ||
    eventStatus === EventStatus.COMPLETED;
  const isCriticalFieldsLocked = isEditMode && (isEventPublished || hasSoldTickets);

  const initialValues: CreateTicketTypeRequest = ticketType
    ? {
        name: ticketType.name,
        description: ticketType.description || '',
        price: ticketType.price,
        currency: ticketType.currency || 'VND',
        total: ticketType.total,
        perUserLimit: ticketType.perUserLimit,
        salesStart: ticketType.salesStart,
        salesEnd: ticketType.salesEnd,
        earlyBird: ticketType.earlyBird || false,
        earlyBirdDiscount: ticketType.earlyBirdDiscount,
        visible: ticketType.visible !== false,
      }
    : {
        name: '',
        description: '',
        price: 0,
        currency: 'VND',
        total: 100,
        perUserLimit: 5,
        salesStart: '',
        salesEnd: '',
        earlyBird: false,
        earlyBirdDiscount: 0,
        visible: true,
      };

  const handleSubmit = async (values: CreateTicketTypeRequest) => {
    try {
      if (isEditMode) {
        // When critical fields are locked, only send safe update fields
        const updateData = isCriticalFieldsLocked
          ? {
              version,
              name: values.name,
              description: values.description,
              visible: values.visible,
            }
          : { ...values, version };

        await updateTicketType({
          eventId,
          ticketTypeId: ticketType.id,
          data: updateData,
        }).unwrap();
      } else {
        await createTicketType({
          eventId,
          data: values,
        }).unwrap();
      }
      onSuccess?.();
    } catch (error: any) {
      console.error('Error saving ticket type:', error);

      // Handle business rule violation errors
      if (isBusinessRuleViolation(error?.data)) {
        alert(`Business Rule Violation: ${error.data.message}`);
      } else {
        alert(error?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} ticket type`);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '16px',
            maxHeight: '90vh',
          },
        },
      }}
    >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              {isEditMode ? 'Edit Ticket Type' : 'Create New Ticket Type'}
            </Typography>
            <IconButton onClick={onClose} disabled={loading}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <Formik
          initialValues={initialValues}
          validationSchema={ticketTypeSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, setFieldValue }) => (
            <Form>
              <DialogContent dividers sx={{ py: 3 }}>
                <Grid container spacing={3}>
                  {/* Optimistic Locking Conflict Warning */}
                  {hasConflict && (
                    <Grid size={{ xs: 12 }}>
                      <Alert severity="warning">
                        {conflictMessage}
                      </Alert>
                    </Grid>
                  )}

                  {/* Business Rule Warning */}
                  {isCriticalFieldsLocked && (
                    <Grid size={{ xs: 12 }}>
                      <Alert severity="info" icon={<Info />}>
                        <Typography variant="body2" fontWeight={500}>
                          Critical fields are locked
                        </Typography>
                        <Typography variant="body2">
                          {hasSoldTickets
                            ? 'This ticket type has sold tickets. Only name, description, and visibility can be edited.'
                            : 'Event is published. Only name, description, and visibility can be edited.'}
                          {' '}To change pricing or quantity, deactivate this ticket type and create a new one.
                        </Typography>
                      </Alert>
                    </Grid>
                  )}

                  {/* Basic Information */}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                      Basic Information
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <FormTextField id="name" name="name" label="Ticket Name" placeholder="e.g., VIP, Regular, Student" required />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <FormTextField
                      id="description"
                      name="description"
                      label="Description"
                      placeholder="Describe what's included with this ticket"
                      multiline
                      rows={3}
                    />
                  </Grid>

                  {/* Pricing */}
                  <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                      Pricing
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormTextField
                      id="price"
                      name="price"
                      label="Price"
                      type="number"
                      required
                      disabled={isCriticalFieldsLocked}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormTextField
                      id="currency"
                      name="currency"
                      label="Currency"
                      disabled
                      value="VND"
                    />
                  </Grid>

                  {/* Early Bird Discount */}
                  <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={values.earlyBird}
                          onChange={(e) => setFieldValue('earlyBird', e.target.checked)}
                          disabled={isCriticalFieldsLocked}
                        />
                      }
                      label="Enable Early Bird Discount"
                    />
                  </Grid>

                  {values.earlyBird && (
                    <Grid size={{ xs: 12 }}>
                      <FormTextField
                        id="earlyBirdDiscount"
                        name="earlyBirdDiscount"
                        label="Early Bird Discount (%)"
                        type="number"
                        placeholder="e.g., 20"
                        disabled={isCriticalFieldsLocked}
                      />
                    </Grid>
                  )}

                  {/* Quantity */}
                  <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                      Quantity & Limits
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormTextField
                      id="total"
                      name="total"
                      label="Total Tickets"
                      type="number"
                      required
                      disabled={isCriticalFieldsLocked}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormTextField
                      id="perUserLimit"
                      name="perUserLimit"
                      label="Per User Limit"
                      type="number"
                      placeholder="Max tickets per user"
                      required
                      disabled={isCriticalFieldsLocked}
                    />
                  </Grid>

                  {/* Sales Period */}
                  <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                      Sales Period
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormTextField
                      id="salesStart"
                      name="salesStart"
                      label="Sales Start"
                      type="datetime-local"
                      required
                      disabled={isCriticalFieldsLocked}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormTextField
                      id="salesEnd"
                      name="salesEnd"
                      label="Sales End"
                      type="datetime-local"
                      required
                      disabled={isCriticalFieldsLocked}
                    />
                  </Grid>

                  {/* Visibility */}
                  <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                      control={
                        <Switch checked={values.visible} onChange={(e) => setFieldValue('visible', e.target.checked)} />
                      }
                      label="Visible to customers"
                    />
                  </Grid>
                </Grid>
              </DialogContent>

              <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || hasConflict}
                  sx={{
                    backgroundColor: '#f36bf9',
                    '&:hover': {
                      backgroundColor: '#e55ae0',
                    },
                  }}
                >
                  {loading
                    ? (isEditMode ? 'Updating...' : 'Creating...')
                    : hasConflict
                      ? 'Data Changed — Close & Reopen'
                      : isEditMode ? 'Update' : 'Create'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
  );
};

export default TicketTypeFormModal;
