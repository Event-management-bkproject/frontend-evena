// FormTextField.tsx
import { CharacterKeyCode, KEY_CODE_IS_NOT_NUMERIC_VALUE } from '@/src/utils/constants/constant';
import { TextField, TextFieldProps, Typography } from '@mui/material';
import { Field, FieldProps, useFormikContext } from 'formik';
import { useEffect } from 'react';
import { StyledFormTextField } from './styles';

interface FormTextFieldProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  disabledDecimal?: boolean;
  disabledNaturalBase?: boolean;
  disabledNegative?: boolean;
  disabledPositive?: boolean;
  disabledAutoTrimTextValueWhenOutFocus?: boolean;
  variant?: TextFieldProps['variant'];
  margin?: TextFieldProps['margin'];
  placeholder: string;
  fullWidth?: boolean;
}

const FormTextField = ({
  id,
  name,
  label,
  type = 'text',
  required = false,
  disabled = false,
  disabledDecimal = false,
  disabledNaturalBase = false,
  disabledNegative = false,
  disabledPositive = false,
  disabledAutoTrimTextValueWhenOutFocus = false,
  variant,
  margin = 'normal',
  placeholder,
  fullWidth = true,
}: FormTextFieldProps) => {
  const onKeyDown = (e: any) => {
    if (e.target.type === 'number' && e.target.nodeName === 'INPUT') {
      if (
        (disabledDecimal && CharacterKeyCode.DECIMALPOINT_KEYCODE.includes(e.keyCode)) ||
        (disabledNaturalBase && CharacterKeyCode.NATURALBASE_KEYCODE.includes(e.keyCode)) ||
        (disabledNegative && CharacterKeyCode.NEGATIVE_KEYCODE.includes(e.keyCode)) ||
        (disabledPositive && CharacterKeyCode.POSITIVE_KEYCODE.includes(e.keyCode)) ||
        CharacterKeyCode.NON_NUMBER_KEYCODE.includes(e.keyCode)
      ) {
        e.preventDefault();
      }
    }
    return;
  };
  const { setFieldValue } = useFormikContext();

  useEffect(() => {
    const inputElement = document.getElementById(id);
    inputElement?.addEventListener('keydown', onKeyDown);
    return function () {
      inputElement?.removeEventListener('keydown', onKeyDown);
    };
  }, []);
  const handleBlur = (field: any) => (e: React.FocusEvent<HTMLInputElement>) => {
    field.onBlur(e);
    if (!disabledAutoTrimTextValueWhenOutFocus && type !== 'number') {
      const trimmedValue = e.target.value.trim();
      setFieldValue(name, trimmedValue);
    }
  };

  return (
    <StyledFormTextField>
      <Typography
        variant="body1"
        component="label"
        htmlFor={id}
        sx={{
          display: 'block',
          fontWeight: '540',
          color: '#37437D',
          fontSize: '16px',
        }}
      >
        {label}
      </Typography>
      <Field name={name}>
        {({ field, meta }: FieldProps) => (
          <TextField
            {...field}
            id={id}
            name={name}
            type={type}
            required={required}
            disabled={disabled}
            variant={variant}
            margin={margin}
            error={meta.touched && Boolean(meta.error)}
            helperText={meta.touched && meta.error}
            onBlur={handleBlur(field)}
            placeholder={placeholder}
            fullWidth={fullWidth}
          />
        )}
      </Field>
    </StyledFormTextField>
  );
};

export default FormTextField;
