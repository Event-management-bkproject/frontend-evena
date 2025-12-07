// CreateEventForm component types

export interface EventFormData {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  organizerId: number;
  categoryId: number;
  venueId: number;
  coverUrl?: string;
  imageUrls?: string[];
}

export interface CreateEventFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}
