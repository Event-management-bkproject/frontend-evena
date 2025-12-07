// UpdateEventForm component types

import { EventResponse } from '@/src/stores/types';
import { EventFormData } from '../CreateEventForm/types';

export interface UpdateEventFormProps {
  event: EventResponse;
  onSubmit: (formData: EventFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  organizers: Array<{ id: number; name: string }>;
  categories: Array<{ id: number; name: string }>;
  venues: Array<{ id: number; name: string; city: string; address: string }>;
}
