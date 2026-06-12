import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MeetingObjectiveForm } from '@/src/components/MeetingObjectiveForm';
import { TrackingWidget } from '@/src/components/TrackingWidget';
import { TrackingOffer } from '@/src/components/TrackingOffer';

describe('in-meeting UI components', () => {
  it('renders accessible objective form validation', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<MeetingObjectiveForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    expect(screen.getByLabelText(/Meeting objective/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Save objective/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/Enter a meeting objective/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows non-analysis wording in tracking widget', () => {
    render(
      <TrackingWidget
        objective="Finalize launch timeline"
        status="active"
        minimized={false}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onEdit={vi.fn()}
        onStop={vi.fn()}
        onToggleMinimize={vi.fn()}
      />,
    );

    expect(screen.getByText(/Objective set/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Conversation analysis is not active yet/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Analyzing/i)).not.toBeInTheDocument();
  });

  it('renders tracking offer actions', async () => {
    const user = userEvent.setup();
    const onAccept = vi.fn();

    render(
      <TrackingOffer onAccept={onAccept} onDecline={vi.fn()} onDismiss={vi.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: /Set objective/i }));
    expect(onAccept).toHaveBeenCalled();
  });
});
