import { Theme } from '@mui/material/styles';
import { css, styled } from '@mui/material/styles';

export const StyledTextareaCustom = styled('div')<{
  error?: boolean;
  disabled?: boolean;
}>(
  ({ theme, error, disabled }: { theme?: Theme; error?: boolean; disabled?: boolean }) => css`
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: 16px;

    textarea {
      width: 100%;
      background-color: #ffffff !important;
      color: #37437d !important;
      border-radius: 4px !important;
      border: 1px solid ${error ? theme?.palette.error.main : '#c4c4c4'} !important;
      font-family: 'Inter, sans-serif';
      font-size: 16px;
      padding: 16.5px 14px !important;
      height: fit-content;
      resize: vertical;
      box-sizing: border-box;

      &::placeholder {
        color: #37437d;
        opacity: 0.7;
      }

      &:hover {
        border-color: #1976d2 !important;
      }

      /* Focus state giống TextField */
      &:focus {
        outline: none;
        border-color: #1976d2 !important;
        border-width: 2px !important;
      }

      /* Disabled state giống TextField */
      &:disabled {
        background-color: #ffffff !important;
        opacity: 0.7;
        color: #37437d !important;
      }

      /* Ẩn scrollbar */
      &::-webkit-scrollbar {
        display: none;
      }
    }

    .error-textarea {
      color: ${theme?.palette.error.main};
      margin: 3px 14px 0;
      line-height: 20px;
      font-size: 14px;
      font-weight: 300;
    }
  `,
);
