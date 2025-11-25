'use client';

import { useFormikContext } from 'formik';
import DateRangePicker from '../DateRangePicker';

interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface DateRangePickerFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

const DateRangePickerField = ({
  name,
  label,
  required = false,
  disabled = false,
  fullWidth = true,
}: DateRangePickerFieldProps) => {
  const { values, setFieldValue } = useFormikContext();

  const handleChange = (range: DateRange) => {
    setFieldValue(name, range);
  };

  // Type assertion để tránh lỗi TypeScript
  const formValues = values as any;
  const fieldValue = formValues[name] || { from: null, to: null };

  return (
    <DateRangePicker
      value={fieldValue}
      onChange={handleChange}
      label={label}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
    />
  );
};

export default DateRangePickerField;
