// Forms.tsx
'use client';

import { Formik, Form, FormikHelpers, FormikProps } from 'formik';
import { ReactNode, useEffect } from 'react';

// Định nghĩa type cho children function
type ChildrenFunction = (formikProps: FormikProps<any>) => ReactNode;

interface FormsProps {
  children: ReactNode | ChildrenFunction;
  values: object;
  onSubmit: (values: any, formikHelpers: FormikHelpers<any>) => void | Promise<any>;
  validationSchema?: object;
  keyValue?: string;
  enableReinitialize?: boolean;
  sx?: React.CSSProperties;
  isRegister: boolean;
}

const Forms = ({
  children,
  values,
  validationSchema,
  onSubmit,
  keyValue,
  enableReinitialize = false,
  sx,
  isRegister = false,
}: FormsProps) => {
  return (
    <Formik
      enableReinitialize={enableReinitialize}
      key={keyValue}
      initialValues={values}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {(formikProps: FormikProps<any>) => {
        // Reset form nếu là register form
        useEffect(() => {
          if (isRegister) {
            formikProps.resetForm();
          }
        }, [isRegister, formikProps.resetForm]);

        return (
          <Form style={sx}>
            {typeof children === 'function' ? (children as ChildrenFunction)(formikProps) : children}
          </Form>
        );
      }}
    </Formik>
  );
};

export default Forms;
