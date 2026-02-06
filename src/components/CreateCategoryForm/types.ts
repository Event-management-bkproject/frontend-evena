// CreateCategoryForm component types
import { CategoryResponse } from '@/src/stores/types';

export interface CategoryFormData {
  name: string;
  description: string;
  iconUrl: string;
  version?: number; // For optimistic locking
}

export interface CreateCategoryFormProps {
  open: boolean;
  onSubmit: (data: CategoryFormData) => void;
  onClose: () => void;
  loading?: boolean;
  initialValues?: Partial<CategoryFormData>;
  title?: string;
  category?: CategoryResponse; // Full category object for edit mode (includes id and version)
}
