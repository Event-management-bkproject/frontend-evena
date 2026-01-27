import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, userEvent } from '@/src/test/test-utils';
import DeleteConfirmDialog from './DeleteConfirmDialog';

describe('DeleteConfirmDialog', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item?',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open is true', () => {
    render(<DeleteConfirmDialog {...defaultProps} />);

    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(<DeleteConfirmDialog {...defaultProps} open={false} />);

    expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
  });

  it('calls onClose when Cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(<DeleteConfirmDialog {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when Delete button is clicked', async () => {
    const user = userEvent.setup();

    render(<DeleteConfirmDialog {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when loading prop is true', () => {
    render(<DeleteConfirmDialog {...defaultProps} loading={true} />);

    // Delete button should be disabled when loading
    const deleteButton = screen.getByRole('button', { name: /deleting/i });
    expect(deleteButton).toBeDisabled();
  });

  it('disables buttons when loading', () => {
    render(<DeleteConfirmDialog {...defaultProps} loading={true} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeDisabled();
  });

  it('displays custom title and message', () => {
    render(
      <DeleteConfirmDialog
        {...defaultProps}
        title="Custom Title"
        message="Custom message here"
      />
    );

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom message here')).toBeInTheDocument();
  });
});
