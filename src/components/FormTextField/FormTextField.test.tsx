import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '@/src/test/test-utils';
import { Formik, Form } from 'formik';
import FormTextField from './FormTextField';

// Wrapper component for testing FormTextField within Formik context
const FormWrapper = ({
  children,
  initialValues = { testField: '' },
  onSubmit = vi.fn(),
}: {
  children: React.ReactNode;
  initialValues?: Record<string, string>;
  onSubmit?: () => void;
}) => (
  <Formik initialValues={initialValues} onSubmit={onSubmit}>
    <Form>{children}</Form>
  </Formik>
);

describe('FormTextField', () => {
  it('renders with label', () => {
    render(
      <FormWrapper>
        <FormTextField id="test" name="testField" label="Test Label" type="text" />
      </FormWrapper>
    );

    expect(screen.getByLabelText(/Test Label/i)).toBeInTheDocument();
  });

  it('displays placeholder text', () => {
    render(
      <FormWrapper>
        <FormTextField
          id="test"
          name="testField"
          label="Test Label"
          type="text"
          placeholder="Enter something"
        />
      </FormWrapper>
    );

    expect(screen.getByPlaceholderText('Enter something')).toBeInTheDocument();
  });

  it('accepts user input', async () => {
    const user = userEvent.setup();

    render(
      <FormWrapper>
        <FormTextField id="test" name="testField" label="Test Label" type="text" />
      </FormWrapper>
    );

    const input = screen.getByLabelText(/Test Label/i);
    await user.type(input, 'Hello World');

    expect(input).toHaveValue('Hello World');
  });

  it('shows required indicator when required', () => {
    render(
      <FormWrapper>
        <FormTextField id="test" name="testField" label="Test Label" type="text" required={true} />
      </FormWrapper>
    );

    // Check that input has required attribute instead of looking for "*"
    const input = screen.getByLabelText(/Test Label/i);
    expect(input).toBeRequired();
  });

  it('renders password type correctly', () => {
    const { container } = render(
      <FormWrapper>
        <FormTextField id="test" name="testField" label="Password" type="password" />
      </FormWrapper>
    );

    // Password fields don't have role="textbox", use querySelector instead
    const input = container.querySelector('input[type="password"]');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'password');
  });

  it('renders email type correctly', () => {
    render(
      <FormWrapper>
        <FormTextField id="test" name="testField" label="Email" type="email" />
      </FormWrapper>
    );

    const input = screen.getByLabelText(/Email/i);
    expect(input).toHaveAttribute('type', 'email');
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <FormWrapper>
        <FormTextField id="test" name="testField" label="Test Label" type="text" disabled={true} />
      </FormWrapper>
    );

    const input = screen.getByLabelText(/Test Label/i);
    expect(input).toBeDisabled();
  });
});
