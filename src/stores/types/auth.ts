import { UserStatus } from './enums';

// types/auth.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordChangeRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponse;
}

export interface UserResponseSimplified {
  id: string;
  name: string;
  email: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: UserStatus;
  emailVerified: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ValidationErrors {
  [field: string]: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: ValidationErrors;
}

export interface MeApiResponse extends ApiResponse<UserResponse> {
  accessToken?: string | null;
  refreshToken?: string | null;
}

export interface RegisterType {
  type: 'customer' | 'organizer';
}
