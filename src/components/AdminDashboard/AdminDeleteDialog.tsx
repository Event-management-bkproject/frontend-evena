import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface AdminDeleteDialogProps {
  open: boolean;
  title: string;
  message: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const AdminDeleteDialog: React.FC<AdminDeleteDialogProps> = ({
  open,
  title,
  message,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.buttons.cancel')}</Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={isDeleting}>
          {isDeleting ? t('admin.actions.deleting') : t('common.buttons.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
