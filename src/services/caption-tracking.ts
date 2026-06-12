import type { CaptionTrackingState } from '@/src/types/caption';
import type { CaptionObserverState } from '@/src/adapters/google-meet/caption-observer';
import type { MeetingPageState } from '@/src/types/meeting';
import type { MeetingSession } from '@/src/types/session';

export function resolveCaptionTrackingState(params: {
  pageState: MeetingPageState;
  session: MeetingSession | null;
  captionsAvailable: boolean;
  captionsDetected: boolean;
}): CaptionTrackingState {
  if (
    !params.session ||
    params.session.status === 'stopped' ||
    params.session.status === 'ended'
  ) {
    return 'stopped';
  }

  if (params.session.status === 'paused') {
    return 'paused';
  }

  if (params.pageState !== 'in-meeting') {
    return 'stopped';
  }

  const consent = params.session.captionConsent ?? 'not-requested';

  if (consent === 'declined' || consent === 'revoked' || consent === 'not-requested') {
    return consent === 'declined' ? 'consent-declined' : 'not-consented';
  }

  if (!params.captionsAvailable && !params.captionsDetected) {
    return 'waiting-for-captions';
  }

  if (params.captionsDetected) {
    return 'captions-detected';
  }

  return 'waiting-for-captions';
}

export function shouldObserveCaptions(params: {
  pageState: MeetingPageState;
  session: MeetingSession | null;
}): boolean {
  return (
    params.pageState === 'in-meeting' &&
    params.session?.status === 'active' &&
    params.session.captionConsent === 'granted'
  );
}

export function captionTrackingLabel(state: CaptionTrackingState): string {
  switch (state) {
    case 'not-consented':
    case 'consent-declined':
      return 'Caption permission needed';
    case 'waiting-for-captions':
      return 'Waiting for captions';
    case 'captions-detected':
      return 'Captions detected';
    case 'paused':
      return 'Caption tracking paused';
    case 'stopped':
    default:
      return 'Objective set';
  }
}

export interface CaptionRuntimeSnapshot {
  trackingState: CaptionTrackingState;
  observerState: CaptionObserverState;
  captionsAvailable: boolean;
  segmentCount: number;
  duplicateCount: number;
  partialUpdateCount: number;
  lastSegmentTimestamp?: number;
  lastSpeakerDetected: boolean;
}
