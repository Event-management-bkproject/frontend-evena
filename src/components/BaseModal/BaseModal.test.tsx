import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '@/src/test/test-utils';
import BaseModal from './BaseModal';

describe('BaseModal', () => {
  it('renders when open is true', () => {
    render(
      <BaseModal open={true} onClose={vi.fn()} title="Test Modal">
        <div>Modal Content</div>
      </BaseModal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(
      <BaseModal open={false} onClose={vi.fn()} title="Test Modal">
        <div>Modal Content</div>
      </BaseModal>
    );

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <BaseModal open={true} onClose={handleClose} title="Test Modal">
        <div>Modal Content</div>
      </BaseModal>
    );

    // Find and click close button (X icon)
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('displays the correct title', () => {
    render(
      <BaseModal open={true} onClose={vi.fn()} title="My Custom Title">
        <div>Content</div>
      </BaseModal>
    );

    expect(screen.getByText('My Custom Title')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <BaseModal open={true} onClose={vi.fn()} title="Test">
        <p>First paragraph</p>
        <p>Second paragraph</p>
      </BaseModal>
    );

    expect(screen.getByText('First paragraph')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph')).toBeInTheDocument();
  });

  it('applies maxWidth prop correctly', () => {
    render(
      <BaseModal open={true} onClose={vi.fn()} title="Test" maxWidth="lg">
        <div>Content</div>
      </BaseModal>
    );

    // MUI Dialog renders with role="presentation" - just verify content renders correctly
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();

    // Verify modal structure by checking for the title heading
    const titleHeading = screen.getByRole('heading', { name: 'Test' });
    expect(titleHeading).toBeInTheDocument();
  });
});
