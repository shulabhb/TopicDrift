import { useState } from 'react';
import type { CaptionObserverState } from '@/src/adapters/google-meet/caption-observer';
import type { CaptionTrackingState } from '@/src/types/caption';

export interface DevTranscriptMonitorProps {
  trackingState: CaptionTrackingState;
  observerState: CaptionObserverState;
  segmentCount: number;
  duplicateCount: number;
  partialUpdateCount: number;
  lastSegmentTimestamp?: number;
  lastSpeakerDetected: boolean;
}

export function DevTranscriptMonitor({
  trackingState,
  observerState,
  segmentCount,
  duplicateCount,
  partialUpdateCount,
  lastSegmentTimestamp,
  lastSpeakerDetected,
}: DevTranscriptMonitorProps) {
  const [showRawText, setShowRawText] = useState(false);

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <section
      className="td-panel td-dev-panel"
      role="status"
      aria-label="Transcript monitor"
    >
      <p className="td-meta">Transcript monitor (dev)</p>
      <ul className="td-dev-list">
        <li>Caption tracking state: {trackingState}</li>
        <li>Observer state: {observerState}</li>
        <li>Segments captured: {segmentCount}</li>
        <li>Duplicate count: {duplicateCount}</li>
        <li>Partial-update count: {partialUpdateCount}</li>
        <li>
          Last segment timestamp:{' '}
          {lastSegmentTimestamp ? new Date(lastSegmentTimestamp).toISOString() : 'none'}
        </li>
        <li>Speaker label detected: {lastSpeakerDetected ? 'yes' : 'no'}</li>
      </ul>
      <label className="td-dev-toggle">
        <input
          type="checkbox"
          checked={showRawText}
          onChange={(event) => setShowRawText(event.target.checked)}
        />
        Show raw caption text (dev only)
      </label>
      {showRawText ? (
        <p className="td-meta">
          Raw caption text display is disabled to avoid accidental leakage.
        </p>
      ) : null}
    </section>
  );
}
