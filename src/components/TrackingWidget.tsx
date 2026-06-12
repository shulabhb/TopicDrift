import { useState } from 'react';
import type { MeetingSessionStatus } from '@/src/types/session';
import './panel.css';

export interface TrackingWidgetProps {
  objective: string;
  status: MeetingSessionStatus;
  onPause: () => void;
  onResume: () => void;
  onEdit: () => void;
  onStop: () => void;
  minimized: boolean;
  onToggleMinimize: () => void;
}

function statusLabel(status: MeetingSessionStatus): string {
  switch (status) {
    case 'active':
      return 'Objective set';
    case 'paused':
      return 'Paused';
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
  onPause,
  onResume,
  onEdit,
  onStop,
  minimized,
  onToggleMinimize,
}: TrackingWidgetProps) {
  const [showFullObjective, setShowFullObjective] = useState(false);
  const displayObjective = showFullObjective ? objective : truncate(objective);

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
            TopicDrift — {statusLabel(status)}
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
              {statusLabel(status)}
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

        <p className="td-widget__info">
          Conversation analysis is not active yet. TopicDrift is only tracking your
          stated objective locally.
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
