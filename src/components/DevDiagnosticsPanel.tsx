import type { LifecycleDiagnostics } from '@/src/adapters/google-meet/lifecycle-diagnostics';

function formatSignal(label: string, active: boolean): string {
  return `${label}: ${active ? 'yes' : 'no'}`;
}

export interface DevDiagnosticsPanelProps {
  diagnostics: LifecycleDiagnostics;
}

export function DevDiagnosticsPanel({ diagnostics }: DevDiagnosticsPanelProps) {
  const { signals } = diagnostics;

  return (
    <section
      className="td-panel td-dev-panel"
      role="status"
      aria-label="TopicDrift diagnostics"
    >
      <p className="td-meta">TopicDrift dev diagnostics</p>
      <ul className="td-dev-list">
        <li>Lifecycle state: {diagnostics.pageState}</li>
        <li>Meeting key present: {diagnostics.meetingKeyPresent ? 'yes' : 'no'}</li>
        <li>{formatSignal('Room URL signal', signals.roomUrl)}</li>
        <li>{formatSignal('Prejoin signal', signals.prejoin)}</li>
        <li>{formatSignal('Toolbar signal', signals.toolbar)}</li>
        <li>{formatSignal('Hangup signal', signals.hangup)}</li>
        <li>{formatSignal('Participant-area signal', signals.participants)}</li>
        <li>{formatSignal('Timer signal', signals.timer)}</li>
        <li>In-meeting confidence: {diagnostics.inMeetingConfidence}</li>
      </ul>
    </section>
  );
}
