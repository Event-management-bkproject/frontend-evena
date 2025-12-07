// CreateVenueForm component types

export interface VenueFormData {
  name: string;
  address: string;
  city: string;
  lat?: number;
  lng?: number;
  capacity: number;
  description?: string;
}

export interface CreateVenueFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}
