// styles.ts
import { css, styled } from '@mui/material/styles';

export const StyledFormTextField = styled('div')(
  () => css`
    .MuiOutlinedInput-root {
      border-radius: 8px;
      background-color: #ffffff;

      & fieldset {
        border-radius: 8px;
        border-color: #E2E8F0;
      }

      &:hover fieldset {
        border-color: #94A3B8;
      }

      &.Mui-focused fieldset {
        border-color: #6093FC;
        border-width: 1.5px;
      }

      &.Mui-disabled {
        background-color: #F8FAFC;
        opacity: 0.7;
      }

      .MuiInputBase-input {
        color: #1E293B;
        border-radius: 8px;
      }

      .MuiInputBase-input::placeholder {
        color: #94A3B8;
        opacity: 1;
      }

      /* Fix browser autofill blue background */
      .MuiInputBase-input:-webkit-autofill,
      .MuiInputBase-input:-webkit-autofill:hover,
      .MuiInputBase-input:-webkit-autofill:focus,
      .MuiInputBase-input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
        -webkit-text-fill-color: #1E293B !important;
      }

      /* Eye icon button — no background, no ripple highlight */
      .MuiInputAdornment-root .MuiIconButton-root {
        color: #94A3B8;
        padding: 6px;
        margin-right: -4px;
        background: transparent !important;

        &:hover {
          color: #64748B;
          background: transparent !important;
        }

        .MuiTouchRipple-root {
          display: none;
        }
      }
    }
  `,
);
