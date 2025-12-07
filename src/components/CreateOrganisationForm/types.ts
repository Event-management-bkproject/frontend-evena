// CreateOrganizationForm component types

export interface OrganizationFormData {
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  email?: string;
  phone?: string;
}

export interface CreateOrganizationFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}
