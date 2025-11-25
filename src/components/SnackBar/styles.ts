import { Snackbar } from '@mui/material';
import { css, styled } from '@mui/material/styles';

export const StyledSnackbar = styled(Snackbar)(
  ({ theme }) => css`
    width: auto;
    .MuiAlert-root.unit-setting-alert {
      padding: 4px 16px !important;
      width: 100% !important;
      white-space: nowrap;
    }
  `,
);
