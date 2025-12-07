// RegisterForm component types

export interface RegisterFormProps {
  type: 'customer' | 'organizer';
  onSubmitSuccess?: () => void;
}
