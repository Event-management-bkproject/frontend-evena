import { memo } from 'react';
import { Snackbar, Box, Typography, IconButton, Slide, SlideProps } from '@mui/material';
import { SnackbarProps, AlertProps, SnackbarOrigin } from '@mui/material';
import {
  CheckCircle, ErrorOutline, WarningAmber, InfoOutlined, Close,
} from '@mui/icons-material';
import dayjs from 'dayjs';

const severityConfig = {
  success: {
    icon: CheckCircle,
    color: '#10B981',
    bg: '#F0FDF4',
    border: '#BBF7D0',
  },
  error: {
    icon: ErrorOutline,
    color: '#EF4444',
    bg: '#FEF2F2',
    border: '#FECACA',
  },
  warning: {
    icon: WarningAmber,
    color: '#F59E0B',
    bg: '#FFFBEB',
    border: '#FDE68A',
  },
  info: {
    icon: InfoOutlined,
    color: '#6093FC',
    bg: '#EFF6FF',
    border: '#BFDBFE',
  },
};

function SlideLeft(props: SlideProps) {
  return <Slide {...props} direction="left" />;
}

function arePropsEqual(
  oldProps: SnackbarProps & AlertProps & SnackbarOrigin,
  newProps: SnackbarProps & AlertProps & SnackbarOrigin,
) {
  return oldProps.open === newProps.open && oldProps.message === newProps.message;
}

const Snackbar_ = memo(function Snackbar_(props: SnackbarProps & AlertProps & SnackbarOrigin) {
  const { vertical, horizontal, open, message, severity = 'info', onClose } = props;
  const cfg = severityConfig[severity as keyof typeof severityConfig] ?? severityConfig.info;
  const Icon = cfg.icon;

  return (
    <Snackbar
      key={dayjs().toString()}
      anchorOrigin={{ vertical, horizontal }}
      autoHideDuration={3500}
      open={open}
      onClose={onClose}
      TransitionComponent={SlideLeft}
      sx={{ '& .MuiSnackbar-root': {} }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.5,
          minWidth: 260,
          maxWidth: 420,
          bgcolor: 'white',
          borderRadius: '14px',
          border: `1px solid ${cfg.border}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
          borderLeft: `4px solid ${cfg.color}`,
        }}
      >
        <Icon sx={{ color: cfg.color, fontSize: 22, flexShrink: 0 }} />
        <Typography
          sx={{
            flex: 1,
            fontSize: 14,
            fontWeight: 600,
            color: '#0F172A',
            lineHeight: 1.4,
          }}
        >
          {message}
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => onClose?.(e, 'escapeKeyDown')}
          sx={{ color: '#94A3B8', p: 0.25, '&:hover': { color: '#475569', bgcolor: 'transparent' } }}
        >
          <Close sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Snackbar>
  );
}, arePropsEqual);

export default Snackbar_;
