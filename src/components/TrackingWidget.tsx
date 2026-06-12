import { useState } from 'react';
import type { MeetingSessionStatus } from '@/src/types/session';
import type { CaptionTrackingState } from '@/src/types/caption';
import './panel.css';

export interface TrackingWidgetProps {
  objective: string;
  status: MeetingSessionStatus;
  captionState: CaptionTrackingState;
  showCaptionPrerequisite: boolean;
  captionConsentPrompt?: React.ReactNode;
  onPause: () => void;
  onResume: () => void;
  onEdit: () => void;
  onStop: () => void;
  minimized: boolean;
  onToggleMinimize: () => void;
}

function statusLabel(
  status: MeetingSessionStatus,
  captionState: CaptionTrackingState,
): string {
  if (status === 'paused') {
    return 'Caption tracking paused';
  }

  switch (captionState) {
    case 'not-consented':
    case 'consent-declined':
      return 'Caption permission needed';
    case 'waiting-for-captions':
      return 'Waiting for captions';
    case 'captions-detected':
      return 'Captions detected';
    default:
      return 'Objective set';
  }
}

function truncate(text: string, max = 80): string {
  if (text.length <= max) {
    return text;
  }

  return `${text.slice(0, max - 1)}…`;
}

export function TrackingWidget({
  objective,
  status,
  captionState,
  showCaptionPrerequisite,
  captionConsentPrompt,
  onPause,
  onResume,
  onEdit,
  onStop,
  minimized,
  onToggleMinimize,
}: TrackingWidgetProps) {
  const [showFullObjective, setShowFullObjective] = useState(false);
  const displayObjective = showFullObjective ? objective : truncate(objective);
  const label = statusLabel(status, captionState);

  if (minimized) {
    return (
      <div className="td-widget td-widget--minimized">
        <section className="td-panel" role="region" aria-label="TopicDrift tracking">
          <button
            type="button"
            className="td-button"
            onClick={onToggleMinimize}
            aria-expanded="false"
          >
            TopicDrift — {label}
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="td-widget">
      <section className="td-panel" role="region" aria-labelledby="td-widget-title">
        <div className="td-widget__header">
          <div>
            <h2 id="td-widget-title" className="td-panel__title">
              TopicDrift
            </h2>
            <p className="td-widget__status" aria-live="polite">
              {label}
            </p>
          </div>
          <button
            type="button"
            className="td-icon-button"
            aria-label="Minimize TopicDrift panel"
            onClick={onToggleMinimize}
          >
            –
          </button>
        </div>

        <p className="td-widget__objective">
          <span className="td-sr-only">Meeting objective:</span>
          {displayObjective}
        </p>

        {objective.length > 80 ? (
          <button
            type="button"
            className="td-button td-button--ghost"
            onClick={() => setShowFullObjective((current) => !current)}
          >
            {showFullObjective ? 'Show less' : 'Show full objective'}
          </button>
        ) : null}

        {captionConsentPrompt}

        {showCaptionPrerequisite ? (
          <p className="td-widget__info" role="status">
            Turn on Google Meet captions to begin local topic tracking.
          </p>
        ) : null}

        <p className="td-widget__info">
          Topic drift analysis is not active yet. Captions are processed locally in
          memory only.
        </p>

        <div className="td-widget__toolbar">
          {status === 'paused' ? (
            <button
              type="button"
              className="td-button td-button--primary"
              onClick={onResume}
            >
              Resume
            </button>
          ) : (
            <button type="button" className="td-button" onClick={onPause}>
              Pause
            </button>
          )}
          <button type="button" className="td-button" onClick={onEdit}>
            Edit objective
          </button>
          <button type="button" className="td-button" onClick={onStop}>
            Stop tracking
          </button>
        </div>
      </section>
    </div>
  );
}
