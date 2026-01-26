// CreateEventForm component types
// Re-export from central types
export type { EventFormData } from '@/src/stores/types';

export interface CreateEventFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}
