// styles.ts
import { css, styled } from '@mui/material/styles';
// Import SCSS file để sử dụng biến
// import '@styles/setting/colors.scss'; // Commented out - colors are hardcoded below

export const StyledFormTextField = styled('div')(
  () => css`
    .MuiOutlinedInput-root {
      border-radius: 4px;
      background-color: #ffffff !important;

      & fieldset {
        border-radius: 4px;
      }

      &:hover fieldset {
        border-color: #1976d2;
      }

      &.Mui-focused fieldset {
        border-color: #1976d2;
      }

      /* Khi disabled cũng giữ màu trắng */
      &.Mui-disabled {
        background-color: #ffffff !important;
        opacity: 0.7;
      }

      /* Đảm bảo màu chữ input trong mọi trạng thái - ĐẶT Ở ĐÂY */
      .MuiInputBase-input {
        color: #37437d !important; /* Thêm !important để đảm bảo áp dụng */
        border-radius: 4px;
      }

      /* Placeholder */
      .MuiInputBase-input::placeholder {
        color: #37437d;
        opacity: 0.7;
      }
    }
  `,
);
