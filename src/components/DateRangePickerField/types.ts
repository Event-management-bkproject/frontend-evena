// DateRangePickerField component types

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface DateRangePickerFieldProps {
  label: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
}
