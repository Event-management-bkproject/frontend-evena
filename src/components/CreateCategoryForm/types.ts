// CreateCategoryForm component types

export interface CategoryFormData {
  name: string;
  description: string;
  iconUrl: string;
}

export interface CreateCategoryFormProps {
  open: boolean;
  onSubmit: (data: CategoryFormData) => void;
  onClose: () => void;
  loading?: boolean;
  initialValues?: Partial<CategoryFormData>;
  title?: string;
}
