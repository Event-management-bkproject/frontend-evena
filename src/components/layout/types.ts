// Shared layout component types

import { ReactNode } from 'react';

export interface LayoutWithSidebarProps {
  children: ReactNode;
  showSidebar?: boolean;
}
