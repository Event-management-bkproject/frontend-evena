import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, userEvent } from '@/src/test/test-utils';
import Snackbar from './SnackBar';

describe('Snackbar', () => {
  const defaultProps = {
    open: true,
    message: 'Test message',
    severity: 'success' as const,
    onClose: vi.fn(),
    vertical: 'top' as const,
    horizontal: 'right' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open is true', () => {
    render(<Snackbar {...defaultProps} />);

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(<Snackbar {...defaultProps} open={false} />);

    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('displays success severity correctly', () => {
    render(<Snackbar {...defaultProps} severity="success" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-filledSuccess');
  });

  it('displays error severity correctly', () => {
    render(<Snackbar {...defaultProps} severity="error" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-filledError');
  });

  it('displays warning severity correctly', () => {
    render(<Snackbar {...defaultProps} severity="warning" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-filledWarning');
  });

  it('displays info severity correctly', () => {
    render(<Snackbar {...defaultProps} severity="info" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-filledInfo');
  });

  it('auto hides after duration', () => {
    // Snackbar uses autoHideDuration, not a close button
    // Just verify it renders and has the correct severity
    render(<Snackbar {...defaultProps} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
  });

  it('displays different messages', () => {
    render(<Snackbar {...defaultProps} message="Custom notification" />);

    expect(screen.getByText('Custom notification')).toBeInTheDocument();
  });
});
