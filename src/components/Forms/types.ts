// Forms component types

import { ReactNode } from 'react';

export interface FormsProps {
  values: any;
  validationSchema?: any;
  onSubmit: (values: any, actions?: any) => void | Promise<void>;
  keyValue?: string;
  isRegister?: boolean;
  enableReinitialize?: boolean;
  sx?: React.CSSProperties;
  children: ReactNode | ((formikProps: any) => ReactNode);
}
