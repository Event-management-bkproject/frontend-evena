// FormTextField component types

import { TextFieldProps } from '@mui/material';
import { ReactNode } from 'react';

export interface FormTextFieldProps extends Omit<TextFieldProps, 'onChange'> {
  id: string;
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  variant?: 'standard' | 'filled' | 'outlined';
  margin?: 'none' | 'dense' | 'normal';
  placeholder?: string;
  fullWidth?: boolean;
  select?: boolean;
  children?: ReactNode;
  value?: any;
  onChange?: (event: any) => void;
  onKeyPress?: (event: any) => void;
  autoComplete?: string;
  // Autocomplete specific props
  autocomplete?: boolean;
  options?: any[];
  getOptionLabel?: (option: any) => string;
  isOptionEqualToValue?: (option: any, value: any) => boolean;
  freeSolo?: boolean;
  // Number input restrictions
  disabledDecimal?: boolean;
  disabledNaturalBase?: boolean;
  disabledNegative?: boolean;
  disabledPositive?: boolean;
}
