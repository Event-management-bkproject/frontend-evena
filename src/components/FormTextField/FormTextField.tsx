// FormTextField.tsx
'use client';
import { CharacterKeyCode } from '@/src/utils/constants/constant';
import { TextField, TextFieldProps, Typography, Autocomplete, InputAdornment, IconButton } from '@mui/material';
import { Field, FieldProps, useFormikContext } from 'formik';
import { useEffect, useState, useCallback, useRef } from 'react';
import { StyledFormTextField } from './styles';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

interface FormTextFieldProps extends Omit<TextFieldProps, 'onChange'> {
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
  placeholder?: string;
  fullWidth?: boolean;
  select?: boolean;
  children?: React.ReactNode;

  // Additional props for direct usage
  value?: any;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress?: (event: React.KeyboardEvent<HTMLInputElement>) => void;

  // Thêm các props mới
  autoComplete?: string;

  // Props cho Autocomplete
  autocomplete?: boolean;
  options?: any[];
  getOptionLabel?: (option: any) => string;
  isOptionEqualToValue?: (option: any, value: any) => boolean;
  freeSolo?: boolean;
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
  select = false,
  children,
  value,
  onChange,
  onKeyPress,
  autoComplete = 'off',

  // Autocomplete props
  autocomplete = false,
  options = [],
  getOptionLabel,
  isOptionEqualToValue,
  freeSolo = false,
  ...props
}: FormTextFieldProps) => {
  // State for password visibility toggle
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  // Memoize onKeyDown to prevent memory leaks
  const onKeyDown = useCallback((e: any) => {
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
  }, [disabledDecimal, disabledNaturalBase, disabledNegative, disabledPositive]);

  const { setFieldValue } = useFormikContext();

  // Fix memory leak: properly clean up event listener
  useEffect(() => {
    const inputElement = document.getElementById(id);
    if (!inputElement) return;

    inputElement.addEventListener('keydown', onKeyDown);

    return () => {
      inputElement.removeEventListener('keydown', onKeyDown);
    };
  }, [id, onKeyDown]);

  const handleBlur = (field: any) => (e: React.FocusEvent<HTMLInputElement>) => {
    field.onBlur(e);

    if (!disabledAutoTrimTextValueWhenOutFocus && type !== 'number') {
      const value = e.target.value;
      if (typeof value === 'string') {
        const trimmedValue = value.trim();
        setFieldValue(name, trimmedValue);
      }
    }
  };

  // Common slotProps configuration with password toggle
  const slotPropsConfig = {
    htmlInput: {
      autoComplete: autoComplete,
      suppressHydrationWarning: true,
    },
    input: isPasswordField
      ? {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleTogglePassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
                size="small"
                sx={{
                  backgroundColor: 'transparent',
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                }}
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          ),
        }
      : undefined,
  };

  // Nếu là Autocomplete
  if (autocomplete) {
    // Controlled component (không dùng Formik)
    if (value !== undefined && onChange) {
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
          <Autocomplete
            id={id}
            options={options}
            value={value}
            onChange={(event, newValue) => {
              // Tạo synthetic event để tương thích với onChange
              const syntheticEvent = {
                target: { name, value: newValue },
              } as React.ChangeEvent<HTMLInputElement>;
              onChange(syntheticEvent);
            }}
            disabled={disabled}
            getOptionLabel={getOptionLabel}
            isOptionEqualToValue={isOptionEqualToValue}
            freeSolo={freeSolo}
            fullWidth={fullWidth}
            renderInput={(params) => (
              <TextField
                {...params}
                required={required}
                placeholder={placeholder}
                variant={variant}
                margin={margin}
                slotProps={slotPropsConfig}
                {...props}
              />
            )}
          />
        </StyledFormTextField>
      );
    }

    // Dùng với Formik
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
            <Autocomplete
              {...field}
              id={id}
              options={options}
              disabled={disabled}
              getOptionLabel={getOptionLabel}
              isOptionEqualToValue={isOptionEqualToValue}
              freeSolo={freeSolo}
              onChange={(event, newValue) => {
                setFieldValue(name, newValue);
              }}
              onBlur={field.onBlur}
              fullWidth={fullWidth}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required={required}
                  placeholder={placeholder}
                  variant={variant}
                  margin={margin}
                  error={meta.touched && Boolean(meta.error)}
                  helperText={meta.touched && meta.error}
                  slotProps={slotPropsConfig}
                  {...props}
                />
              )}
            />
          )}
        </Field>
      </StyledFormTextField>
    );
  }

  // TextField thông thường
  // Nếu có value và onChange props, sử dụng như controlled component độc lập
  if (value !== undefined && onChange) {
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
        <TextField
          id={id}
          name={name}
          type={isPasswordField && showPassword ? 'text' : type}
          required={required}
          disabled={disabled}
          variant={variant}
          margin={margin}
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
          fullWidth={fullWidth}
          select={select}
          slotProps={slotPropsConfig}
          {...props}
        >
          {children}
        </TextField>
      </StyledFormTextField>
    );
  }

  // Sử dụng với Formik (TextField thông thường)
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
            type={isPasswordField && showPassword ? 'text' : type}
            required={required}
            disabled={disabled}
            variant={variant}
            margin={margin}
            error={meta.touched && Boolean(meta.error)}
            helperText={meta.touched && meta.error}
            onBlur={handleBlur(field)}
            placeholder={placeholder}
            fullWidth={fullWidth}
            select={select}
            slotProps={slotPropsConfig}
            {...props}
          >
            {children}
          </TextField>
        )}
      </Field>
    </StyledFormTextField>
  );
};

export default FormTextField;
