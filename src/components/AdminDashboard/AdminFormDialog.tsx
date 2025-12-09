import React from 'react';
import { Dialog, DialogTitle, DialogContent, Box } from '@mui/material';

interface AdminFormDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const AdminFormDialog: React.FC<AdminFormDialogProps> = ({ open, title, onClose, children, maxWidth = 'sm' }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>{children}</Box>
      </DialogContent>
    </Dialog>
  );
};
