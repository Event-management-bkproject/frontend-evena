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
      PaperProps={{
        sx: {
          borderRadius: '16px',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            {isEditMode ? 'Edit Ticket Type' : 'Create New Ticket Type'}
          </Typography>
          <IconButton onClick={onClose} size="small">
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
        {({ values, setFieldValue, errors, touched }) => (
          <Form>
            <DialogContent sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                {/* Name */}
                <Grid size={{ xs: 12 }}>
                  <FormTextField
                    id="name"
                    name="name"
                    label="Ticket Type Name"
                    placeholder="e.g. VIP, General Admission, Early Bird"
                    required
                    fullWidth
                  />
                </Grid>

                {/* Description */}
                <Grid size={{ xs: 12 }}>
                  <FormTextField
                    id="description"
                    name="description"
                    label="Description"
                    placeholder="Brief description of this ticket type"
                    multiline
                    rows={3}
                    fullWidth
                  />
                </Grid>

                {/* Price & Currency */}
                <Grid size={{ xs: 8 }}>
                  <FormTextField
                    id="price"
                    name="price"
                    label="Price"
                    type="number"
                    required
                    fullWidth
                    inputProps={{ min: 0, step: 1000 }}
                  />
                </Grid>

                <Grid size={{ xs: 4 }}>
                  <FormTextField id="currency" name="currency" label="Currency" placeholder="VND" fullWidth disabled />
                </Grid>

                {/* Total & Per User Limit */}
                <Grid size={{ xs: 6 }}>
                  <FormTextField
                    id="total"
                    name="total"
                    label="Total Tickets"
                    type="number"
                    required
                    fullWidth
                    inputProps={{ min: 1 }}
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <FormTextField
                    id="perUserLimit"
                    name="perUserLimit"
                    label="Per User Limit"
                    type="number"
                    fullWidth
                    inputProps={{ min: 1 }}
                    helperText="Max tickets per customer (optional)"
                  />
                </Grid>

                {/* Sales Period */}
                <Grid size={{ xs: 6 }}>
                  <FormTextField
                    id="salesStart"
                    name="salesStart"
                    label="Sales Start"
                    type="datetime-local"
                    required
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <FormTextField
                    id="salesEnd"
                    name="salesEnd"
                    label="Sales End"
                    type="datetime-local"
                    required
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Early Bird Toggle */}
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={values.earlyBird}
                        onChange={(e) => setFieldValue('earlyBird', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#f36bf9',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#f36bf9',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" fontWeight={500}>
                        Early Bird Discount
                      </Typography>
                    }
                  />
                </Grid>

                {/* Early Bird Discount */}
                {values.earlyBird && (
                  <Grid size={{ xs: 12 }}>
                    <FormTextField
                      id="earlyBirdDiscount"
                      name="earlyBirdDiscount"
                      label="Discount Percentage (%)"
                      type="number"
                      required={values.earlyBird}
                      fullWidth
                      inputProps={{ min: 0, max: 100 }}
                      helperText="Discount applied for early bird tickets (0-100%)"
                    />
                  </Grid>
                )}

                {/* Visibility Toggle */}
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={values.visible}
                        onChange={(e) => setFieldValue('visible', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#f36bf9',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#f36bf9',
                          },
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          Visible to Public
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Hidden tickets can only be accessed via direct link
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  backgroundColor: '#f36bf9',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#e55ae0',
                  },
                }}
              >
                {loading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default TicketTypeFormModal;
