import { css, styled } from '@mui/material/styles';
// Import SCSS file để sử dụng biến
import '@styles/setting/colors.scss';

export const StyledFormButton = styled('div')(
  () => css`
    width: 100%;
    display: flex;
    justify-content: center; /* Căn giữa theo chiều ngang */
    align-items: center; /* Căn giữa theo chiều dọc (nếu cần) */
    margin: 24px 0; /* Margin top và bottom */

    .button-item {
      background-color: var(--login-btn-bg, #f36bf9);
      border-radius: 10px;
      padding: 12px 24px;
      width: 200px; /* Tăng độ rộng cho đẹp */
      text-transform: none !important;
      font-size: 16px;
      font-weight: bold;
      margin-left: 0;
      margin-right: 0;
      margin-bottom: 0;

      &:hover {
        background-color: var(--login-btn-hover, #e55ae0);
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }

      &:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }
    }
  `,
);
