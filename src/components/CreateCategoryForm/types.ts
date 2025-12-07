// CreateCategoryForm component types

export interface CategoryFormData {
  name: string;
  description?: string;
  iconUrl?: string;
}

export interface CreateCategoryFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}
