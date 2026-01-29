'use client';

import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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
      <DialogTitle>{title || (initialValues?.name ? t('category.edit') : t('category.createNew'))}</DialogTitle>
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
                label={t('category.form.name')}
                type="text"
                required
                placeholder={t('category.form.namePlaceholder')}
              />

              {/* Icon URL Field */}
              <FormTextField
                id="category-iconUrl"
                name="iconUrl"
                label={t('category.form.icon')}
                type="text"
                required
                placeholder={t('category.form.iconPlaceholder')}
                helperText={t('category.form.iconHelper')}
              />

              {/* Description Field */}
              <FormTextareaField
                id="category-description"
                name="description"
                label={t('category.form.descriptionPlaceholder')}
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
                {t('common.buttons.cancel')}
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
                    ? t('event.updating')
                    : t('event.creating')
                  : initialValues?.name
                  ? t('category.update')
                  : t('category.create')}
              </Button>
            </DialogActions>
          </Forms>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategoryForm;
