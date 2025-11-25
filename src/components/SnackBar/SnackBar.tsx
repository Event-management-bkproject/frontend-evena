import { Alert, AlertProps, SnackbarOrigin, SnackbarProps } from '@mui/material';

import { memo } from 'react';
import { StyledSnackbar } from './styles';
import { Palette } from '../MainTheme/colors/colors';
import dayjs from 'dayjs';
function arePropsEqual(
  oldProps: SnackbarProps & AlertProps & SnackbarOrigin,
  newProps: SnackbarProps & AlertProps & SnackbarOrigin,
) {
  return oldProps.open === newProps.open && oldProps.message === newProps.message;
}

const Snackbar = memo(function Snackbar(props: SnackbarProps & AlertProps & SnackbarOrigin) {
  const { vertical, horizontal, open, message, severity, onClose } = props;
  return (
    <StyledSnackbar
      key={dayjs().toString()}
      anchorOrigin={{ vertical, horizontal }}
      autoHideDuration={3000}
      open={open}
      onClose={onClose}
      {...props}
    >
      <Alert
        className="unit-setting-alert"
        severity={severity}
        variant="filled"
        sx={{
          '&.MuiAlert-root.unit-setting-alert': {
            backgroundColor: Palette.dark[severity ?? 'success']?.main + '!important',
          },
        }}
      >
        {message}
      </Alert>
    </StyledSnackbar>
  );
}, arePropsEqual);

export default Snackbar;
