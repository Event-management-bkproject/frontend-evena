// components/BaseModalV2.tsx (Alternative version)
'use client';

import { Modal, Box, IconButton, Typography, Paper } from '@mui/material';
import { Close } from '@mui/icons-material';

interface BaseModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const modalWidths = {
  xs: 400,
  sm: 500,
  md: 600,
  lg: 800,
  xl: 1000,
};

const BaseModalV2 = ({ open, onClose, title, children, actions, maxWidth = 'lg' }: BaseModalProps) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      // Quan trọng: disable portal để tránh aria-hidden issues
      disablePortal={false}
      disableScrollLock={false}
      keepMounted={false}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Đảm bảo modal nằm trên cùng
        zIndex: 1300,
      }}
      // Quản lý focus tốt hơn
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      }}
    >
      <Paper
        sx={{
          width: modalWidths[maxWidth],
          maxWidth: '90vw',
          maxHeight: '90vh',
          borderRadius: '16px',
          overflow: 'auto',
          outline: 'none', // Quan trọng: remove outline
        }}
        elevation={8}
        // Ngăn không cho focus ra ngoài modal
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onClose();
          }
        }}
      >
        {/* Header */}
        {(title || true) && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px 16px 24px',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            {title && (
              <Typography id="modal-title" variant="h5" component="h2" fontWeight="bold">
                {title}
              </Typography>
            )}
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                marginLeft: 'auto',
                '&:focus': {
                  outline: '2px solid #1976d2',
                  outlineOffset: '2px',
                },
              }}
              aria-label="Close modal"
            >
              <Close />
            </IconButton>
          </Box>
        )}

        {/* Content */}
        <Box
          sx={{
            padding: '24px',
            '&:focus': {
              outline: 'none',
            },
          }}
          id="modal-description"
          tabIndex={-1} // Ngăn focus vào content container
        >
          {children}
        </Box>

        {/* Actions */}
        {actions && (
          <Box
            sx={{
              padding: '16px 24px',
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
            }}
          >
            {actions}
          </Box>
        )}
      </Paper>
    </Modal>
  );
};

export default BaseModalV2;
