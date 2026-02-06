// CreateVenueForm component types
import { VenueResponse } from '@/src/stores/types';

export interface VenueFormData {
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  capacity: number;
  description?: string;
  version?: number; // For optimistic locking
}

export interface CreateVenueFormProps {
  open: boolean;
  onSubmit: (data: VenueFormData) => void;
  onClose: () => void;
  loading?: boolean;
  initialValues?: Partial<VenueFormData>;
  title?: string;
  venue?: VenueResponse; // Full venue object for edit mode (includes id and version)
}
