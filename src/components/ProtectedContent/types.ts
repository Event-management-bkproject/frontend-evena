// ProtectedContent component types

import { ReactNode } from 'react';

export interface ProtectedContentProps {
  children: ReactNode;
  requiredRoles?: string[];
  fallback?: ReactNode;
}
