import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CaptionConsentPrompt } from '@/src/components/CaptionConsentPrompt';
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

  it('shows caption consent prompt', async () => {
    const user = userEvent.setup();
    const onEnable = vi.fn();

    render(<CaptionConsentPrompt onEnable={onEnable} onDecline={vi.fn()} />);

    expect(screen.getByText(/Enable meeting caption tracking/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Enable caption tracking/i }));
    expect(onEnable).toHaveBeenCalled();
  });

  it('shows waiting-for-captions state', () => {
    render(
      <TrackingWidget
        objective="Finalize launch timeline"
        status="active"
        captionState="waiting-for-captions"
        showCaptionPrerequisite
        minimized={false}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onEdit={vi.fn()}
        onStop={vi.fn()}
        onToggleMinimize={vi.fn()}
      />,
    );

    expect(screen.getByText(/Waiting for captions/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Turn on Google Meet captions to begin local topic tracking/i),
    ).toBeInTheDocument();
  });

  it('shows captions-detected state', () => {
    render(
      <TrackingWidget
        objective="Finalize launch timeline"
        status="active"
        captionState="captions-detected"
        showCaptionPrerequisite={false}
        minimized={false}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onEdit={vi.fn()}
        onStop={vi.fn()}
        onToggleMinimize={vi.fn()}
      />,
    );

    expect(screen.getByText(/Captions detected/i)).toBeInTheDocument();
  });

  it('shows paused caption tracking state', () => {
    render(
      <TrackingWidget
        objective="Finalize launch timeline"
        status="paused"
        captionState="paused"
        showCaptionPrerequisite={false}
        minimized={false}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onEdit={vi.fn()}
        onStop={vi.fn()}
        onToggleMinimize={vi.fn()}
      />,
    );

    expect(screen.getByText(/Caption tracking paused/i)).toBeInTheDocument();
  });

  it('does not claim analysis is active', () => {
    render(
      <TrackingWidget
        objective="Finalize launch timeline"
        status="active"
        captionState="captions-detected"
        showCaptionPrerequisite={false}
        minimized={false}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onEdit={vi.fn()}
        onStop={vi.fn()}
        onToggleMinimize={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/Topic drift analysis is not active yet/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Analyzing topic/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Drifting/i)).not.toBeInTheDocument();
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
