'use client';
import { Button } from '@mui/material';
import { StyledFormButton } from './styles';
interface FormButtonProps {
  className?: string;
  // Button type
  isRegister?: boolean;
  // Button Function
  onSubmit?: () => void;
  // Button state
  disabled?: boolean;
  // Button content
  loginBtnLabelText?: string;
  registerBtnLabelText?: string;
  // Button style
  style?: any;
  disabledColorBtn?: string;
  submitBtnColor?: string;
}

const FormButton = ({
  className = '',
  isRegister = true,
  onSubmit,
  disabled = true,
  loginBtnLabelText = 'Login',
  registerBtnLabelText = 'Register',
  style,
  disabledColorBtn,
}: FormButtonProps) => {
  const handleSubmit = () => {
    onSubmit && onSubmit();
  };
  return (
    <StyledFormButton className={className} style={style || {}}>
      <Button
        onClick={handleSubmit}
        type="submit"
        variant="contained"
        className="button-item"
        disabled={disabled}
        style={{
          backgroundColor: disabledColorBtn,
          pointerEvents: !disabled ? 'unset' : 'none',
        }}
      >
        {isRegister ? registerBtnLabelText : loginBtnLabelText}
      </Button>
    </StyledFormButton>
  );
};

export default FormButton;
