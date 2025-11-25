'use client';
import { ErrorMessage, Field, FieldAttributes } from 'formik';
import { TextareaAutosize, TextFieldProps, Typography } from '@mui/material';
import { StyledTextareaCustom } from './styles';

const FormTextareaField = ({ id, name, label, required, disabled }: TextFieldProps & FieldAttributes<any>) => {
  return (
    <Field name={name}>
      {({ field, meta }: { field: any; meta: any }) => {
        return (
          <StyledTextareaCustom error={!!meta?.error && meta?.touched} disabled={disabled}>
            <TextareaAutosize
              id={id}
              required={required}
              placeholder={label}
              disabled={disabled}
              name={name}
              value={field.value || ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              maxRows={7}
              minRows={3}
              style={{
                width: '100%',
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                padding: '8px',
                borderRadius: '4px',
                borderColor: meta.error && meta.touched ? 'red' : '#ccc',
                resize: 'vertical',
              }}
            />
            <ErrorMessage
              name={name}
              render={(errorMessage: string) => (
                <Typography className="error-textarea" color="error" variant="subtitle1">
                  {errorMessage}
                </Typography>
              )}
            />
          </StyledTextareaCustom>
        );
      }}
    </Field>
  );
};

export default FormTextareaField;
