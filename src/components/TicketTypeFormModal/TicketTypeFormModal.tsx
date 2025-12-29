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
} from '@mui/material';
import { Close } from '@mui/icons-material';
import FormTextField from '../FormTextField';
import { ticketTypeSchema } from '@/src/utils/validationSchema/ticketTypeValidationSchema';
import { useCreateTicketTypeMutation, useUpdateTicketTypeMutation } from '@/src/stores/services';
import { TicketTypeResponse, CreateTicketTypeRequest } from '@/src/stores/types';

interface TicketTypeFormModalProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  ticketType?: TicketTypeResponse;
  onSuccess?: () => void;
}

const TicketTypeFormModal = ({ open, onClose, eventId, ticketType, onSuccess }: TicketTypeFormModalProps) => {
  const [createTicketType, { isLoading: creating }] = useCreateTicketTypeMutation();
  const [updateTicketType, { isLoading: updating }] = useUpdateTicketTypeMutation();

  const isEditMode = !!ticketType;
  const loading = creating || updating;

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
        await updateTicketType({
          eventId,
          ticketTypeId: ticketType.id,
          data: values,
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
      alert(error?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} ticket type`);
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
                    <FormTextField id="price" name="price" label="Price" type="number" required />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormTextField id="currency" name="currency" label="Currency" disabled value="VND" />
                  </Grid>

                  {/* Early Bird Discount */}
                  <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={values.earlyBird}
                          onChange={(e) => setFieldValue('earlyBird', e.target.checked)}
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
                    <FormTextField id="total" name="total" label="Total Tickets" type="number" required />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormTextField
                      id="perUserLimit"
                      name="perUserLimit"
                      label="Per User Limit"
                      type="number"
                      placeholder="Max tickets per user"
                      required
                    />
                  </Grid>

                  {/* Sales Period */}
                  <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                      Sales Period
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormTextField id="salesStart" name="salesStart" label="Sales Start" type="datetime-local" required />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormTextField id="salesEnd" name="salesEnd" label="Sales End" type="datetime-local" required />
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
                  disabled={loading}
                  sx={{
                    backgroundColor: '#f36bf9',
                    '&:hover': {
                      backgroundColor: '#e55ae0',
                    },
                  }}
                >
                  {loading ? (isEditMode ? 'Updating...' : 'Creating...') : isEditMode ? 'Update' : 'Create'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
  );
};

export default TicketTypeFormModal;
