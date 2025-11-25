'use client';

import { Box, Button } from '@mui/material';
import Forms from '../Forms';
import FormTextField from '../FormTextField';
import FormTextareaField from '../FormTextAreaField';
import { categorySchema } from '@/src/utils/validationSchema/categoryValidationSchema';

export interface CategoryFormData {
  name: string;
  description: string;
  iconUrl: string;
}

interface CreateCategoryFormProps {
  onSubmit: (data: CategoryFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
  initialValues?: Partial<CategoryFormData>;
}

const CreateCategoryForm = ({ onSubmit, onCancel, loading = false, initialValues }: CreateCategoryFormProps) => {
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
          label="Icon URL"
          type="url"
          required
          placeholder="https://example.com/icon.png"
        />

        {/* Description Field */}
        <FormTextareaField id="category-description" name="description" label="Enter category description" required />
      </Box>

      {/* Actions */}
      <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
        {onCancel && (
          <Button
            onClick={onCancel}
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
        )}
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
          {loading ? 'Creating...' : 'Create Category'}
        </Button>
      </Box>
    </Forms>
  );
};

export default CreateCategoryForm;
