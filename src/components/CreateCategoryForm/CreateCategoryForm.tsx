'use client';

import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Forms from '../Forms';
import FormTextField from '../FormTextField';
import FormTextareaField from '../FormTextAreaField';
import { categorySchema } from '@/src/utils/validationSchema/categoryValidationSchema';
import { CategoryFormData, CreateCategoryFormProps } from './types';

const CreateCategoryForm = ({
  open,
  onSubmit,
  onClose,
  loading = false,
  initialValues,
  title,
}: CreateCategoryFormProps) => {
  const defaultValues: CategoryFormData = {
    name: '',
    description: '',
    iconUrl: '',
    ...initialValues,
  };

  const handleSubmit = (values: CategoryFormData, actions: any) => {
    onSubmit(values);
    actions.setSubmitting(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title || (initialValues?.name ? 'Edit Category' : 'Create New Category')}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Forms
            values={defaultValues}
            onSubmit={handleSubmit}
            validationSchema={categorySchema}
            enableReinitialize
            isRegister={false}
          >
            <Box display="flex" flexDirection="column" gap={3}>
              {/* Name Field */}
              <FormTextField
                id="category-name"
                name="name"
                label="Category Name"
                type="text"
                required
                placeholder="Enter category name"
              />

              {/* Icon URL Field */}
              <FormTextField
                id="category-iconUrl"
                name="iconUrl"
                label="Icon URL or Emoji"
                type="text"
                required
                placeholder="https://example.com/icon.png or 🎭"
                helperText="Enter a URL or an emoji"
              />

              {/* Description Field */}
              <FormTextareaField
                id="category-description"
                name="description"
                label="Enter category description"
                required
              />
            </Box>

            {/* Actions */}
            <DialogActions sx={{ mt: 3, px: 0 }}>
              <Button
                onClick={onClose}
                variant="outlined"
                disabled={loading}
                sx={{
                  borderRadius: '10px',
                  padding: '10px 24px',
                  textTransform: 'none',
                  fontSize: '16px',
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  backgroundColor: '#f36bf9',
                  borderRadius: '10px',
                  padding: '10px 24px',
                  textTransform: 'none',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#e55ae0',
                  },
                  '&:disabled': {
                    backgroundColor: '#cccccc',
                  },
                }}
              >
                {loading
                  ? initialValues?.name
                    ? 'Updating...'
                    : 'Creating...'
                  : initialValues?.name
                  ? 'Update Category'
                  : 'Create Category'}
              </Button>
            </DialogActions>
          </Forms>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategoryForm;
